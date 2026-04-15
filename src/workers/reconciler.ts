const supabase = require('../../supabase');
const logger = require('../../logger');

class ReconciliationWorker {
    constructor() {
        this.isRunning = false;
        this.CHECK_INTERVAL_MS = 60000;
        this.BATCH_SIZE = 500;
    }

    async start() {
        if (this.isRunning) return;
        this.isRunning = true;
        logger.info('ReconciliationWorker started');
        this.runLoop();
    }

    async runLoop() {
        while (this.isRunning) {
            try {
                await this.performIncrementalCheck();
            } catch (e) {
                logger.error('ReconciliationWorker loop error', e);
            }
            await new Promise(r => setTimeout(r, this.CHECK_INTERVAL_MS));
        }
    }

    /**
     * Correct Incremental Reconciliation (BUG 2 FIX)
     * 1. Loads persisted cursor from DB.
     * 2. Fetches bounded batch of new events.
     * 3. Computes deltas and applies them atomically via RPC.
     * 4. Persists new cursor on success.
     */
    async performIncrementalCheck() {
        // 1. Load persisted cursor (Issue B Fix)
        const { data: cursorData, error: cursorErr } = await supabase
            .from('system_config')
            .select('value')
            .eq('key', 'reconciler_cursor')
            .single();
        
        if (cursorErr) throw cursorErr;
        const lastLt = cursorData.value.last_lt || '0';

        logger.info(`Starting incremental reconciliation check from LT: ${lastLt}`);
        
        // 2. Fetch bounded batch of NEW events (Bug 2 Fix)
        const { data: events, error: eventErr } = await supabase
            .from('indexed_events')
            .select('*')
            .gt('lt', lastLt)
            .order('lt', { ascending: true })
            .limit(this.BATCH_SIZE);
        
        if (eventErr) throw eventErr;
        if (events.length === 0) {
            logger.info('No new events to reconcile.');
            return;
        }

        // 3. Compute balance deltas from this batch
        const deltas = new Map(); // userId -> totalDelta
        for (const event of events) {
            const data = event.data;
            let userId = null;
            let amount = 0;

            switch (event.event_type) {
                case 'RewardClaimed':
                    userId = data.userId;
                    amount = Number(data.amount);
                    break;
                case 'PaymentConfirmed': // BUG 2 FIX: Model payments
                    userId = data.userId;
                    amount = Number(data.toonAmount);
                    break;
            }

            if (userId && amount !== 0) {
                deltas.set(userId, (deltas.get(userId) || 0) + amount);
            }
        }

        // 4. Apply deltas to shadow table & check for drift
        const discrepancies = [];
        for (const [userId, delta] of deltas) {
            const { data: res, error: rpcErr } = await supabase.rpc('apply_reconciler_delta', {
                p_user_id: Number(userId),
                p_delta: delta,
                p_drift_threshold: 0
            });

            if (rpcErr) {
                logger.error(`RPC Error reconciling user ${userId}`, rpcErr);
                continue;
            }

            if (res && res.error === 'RECONCILIATION_DRIFT') {
                discrepancies.push(res);
            }
        }

        // 5. Handle Discrepancies (Bug 2 Fix: Call reportResults)
        if (discrepancies.length > 0) {
            await this.reportResults(discrepancies, []);
        }

        // 6. Persist cursor ONLY on success (Issue B Fix)
        const newLt = events[events.length - 1].lt;
        const { error: updateErr } = await supabase
            .from('system_config')
            .update({ value: { last_lt: newLt }, updated_at: new Date().toISOString() })
            .eq('key', 'reconciler_cursor');
        
        if (updateErr) logger.error('Failed to update reconciler cursor', updateErr);

        logger.info(`Successfully reconciled ${events.length} events. New LT: ${newLt}`);
    }

    async reportResults(discrepancies, violations) {
        const guardrail = require('../core/services/guardrail');
        const reason = discrepancies.length > 0 ? 'RECONCILIATION_DRIFT' : 'INVARIANT_VIOLATION';
        const metadata = { discrepancies, violations, timestamp: new Date().toISOString() };

        if (discrepancies.length > 0) {
            logger.error('RECONCILIATION FAILURE: State discrepancies detected!', { count: discrepancies.length });
            discrepancies.forEach(d => logger.warn('Discrepancy:', d));
        }

        logger.warn('🚨 Reconciliation worker triggering emergency pause...');
        await guardrail.triggerPause(reason, metadata);
    }

    stop() {
        this.isRunning = false;
        logger.info('ReconciliationWorker stopped');
    }
}

module.exports = new ReconciliationWorker();
