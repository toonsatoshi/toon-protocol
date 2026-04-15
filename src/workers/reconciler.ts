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

    async performIncrementalCheck() {
        const { data: cursorData, error: cursorErr } = await supabase
            .from('system_config')
            .select('value')
            .eq('key', 'reconciler_cursor')
            .single();
        
        if (cursorErr) throw cursorErr;
        const lastLt = cursorData.value.last_lt || '0';

        logger.info(`Starting incremental reconciliation check from LT: ${lastLt}`);
        
        const { data: events, error: eventErr } = await supabase
            .from('indexed_events')
            .select('*')
            .gt('lt', lastLt)
            .order('lt', { ascending: true })
            .limit(this.BATCH_SIZE);
        
        if (eventErr) throw eventErr;

        // H2 Fix: Null guard on events
        if (!events || events.length === 0) {
            logger.info('No new events to reconcile.');
            return;
        }

        // 3. Compute balance deltas (H4 Fix: Use BigInt for precision)
        const deltas = new Map(); 
        for (const event of events) {
            const data = event.data;
            let userId = null;
            let amount = 0n;

            switch (event.event_type) {
                case 'RewardClaimed':
                    userId = data.userId;
                    amount = BigInt(data.amount);
                    break;
                case 'PaymentConfirmed':
                    userId = data.userId;
                    amount = BigInt(data.toonAmount);
                    break;
                default:
                    // L1 Fix: Log unknown event types
                    logger.warn(`Reconciler: Unknown event type encountered: ${event.event_type}`, { txHash: event.tx_hash });
            }

            if (userId && amount !== 0n) {
                const current = deltas.get(userId) || 0n;
                deltas.set(userId, current + amount);
            }
        }

        // 4. Apply deltas atomically
        const discrepancies = [];
        let batchFailed = false;

        for (const [userId, delta] of deltas) {
            const { data: res, error: rpcErr } = await supabase.rpc('apply_reconciler_delta', {
                p_user_id: Number(userId),
                p_delta: delta.toString(), // Pass as string to avoid JSON number precision issues
                p_drift_threshold: 0
            });

            if (rpcErr) {
                // H1 Fix: A failed user RPC MUST block the cursor advancement
                logger.error(`RPC Error reconciling user ${userId}. Batch cursor advancement aborted.`, rpcErr);
                batchFailed = true;
                break; 
            }

            if (res && res.error === 'RECONCILIATION_DRIFT') {
                discrepancies.push(res);
            }
        }

        // 5. Handle Discrepancies
        if (discrepancies.length > 0) {
            await this.reportResults(discrepancies, []);
        }

        // 6. Persist cursor ONLY if the entire batch was successful (H1 Fix)
        if (!batchFailed) {
            const newLt = events[events.length - 1].lt;
            const { error: updateErr } = await supabase
                .from('system_config')
                .update({ value: { last_lt: newLt }, updated_at: new Date().toISOString() })
                .eq('key', 'reconciler_cursor');
            
            if (updateErr) {
                logger.error('Failed to update reconciler cursor', updateErr);
            } else {
                logger.info(`Successfully reconciled ${events.length} events. New LT: ${newLt}`);
            }
        }
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
