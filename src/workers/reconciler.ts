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
            await new Promise((r: any) => setTimeout(r, this.CHECK_INTERVAL_MS));
        }
    }

    /**
     * Correct Incremental Reconciliation with Adversarial Hardening
     */
    async performIncrementalCheck() {
        // 1. Load persisted cursor
        const { data: cursorData, error: cursorErr } = await supabase
            .from('system_config')
            .select('value')
            .eq('key', 'reconciler_cursor')
            .single();
        
        if (cursorErr) throw cursorErr;
        const lastLt = cursorData.value.last_lt || '0';

        // 2. Fetch bounded batch of NEW events
        const { data: events, error: eventErr } = await supabase
            .from('indexed_events')
            .select('*')
            .gt('lt', lastLt)
            .order('lt', { ascending: true })
            .limit(this.BATCH_SIZE);
        
        if (eventErr) throw eventErr;
        if (!events || events.length === 0) return;

        logger.info(`Processing ${events.length} events from LT ${lastLt}`);

        // 3. Process Events (Per-Event strategy for idempotency & skipping)
        const discrepancies = [];
        let batchFailed = false;
        let lastSuccessfulLt = lastLt;

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
                    logger.warn(`Unknown event type: ${event.event_type}`);
            }

            if (!userId || amount === 0n) {
                lastSuccessfulLt = event.lt;
                continue;
            }

            try {
                // Apply delta with tx_hash for DB-level idempotency
                const { data: res, error: rpcErr } = await supabase.rpc('apply_reconciler_delta', {
                    p_user_id: Number(userId),
                    p_delta: amount.toString(),
                    p_tx_hash: event.tx_hash,
                    p_drift_threshold: "0"
                });

                if (rpcErr) {
                    logger.error(`RPC Error for event ${event.tx_hash}`, rpcErr);

                    // Log the failure for monitoring, but do NOT advance cursor
                    // Failed events must be retried on the next reconciliation pass
                    await supabase.from('guardrail_events').insert({
                        type: 'RECONCILIATION_RPC_ERROR',
                        reason: `RPC Failure for tx_hash ${event.tx_hash}`,
                        metadata: { userId, amount: amount.toString(), error: rpcErr }
                    });

                    // Stop processing this batch on RPC error to preserve cursor at failed event
                    batchFailed = true;
                    break;
                }

                if (res && res.error === 'RECONCILIATION_DRIFT') {
                    discrepancies.push(res);
                }

                lastSuccessfulLt = event.lt;
            } catch (e) {
                logger.error(`Critical exception for event ${event.tx_hash}`, e);
                batchFailed = true; // Stop batch on actual code crashes
                break;
            }
        }

        // 4. Handle Discrepancies
        if (discrepancies.length > 0) {
            await this.reportResults(discrepancies, []);
        }

        // 5. Persist cursor based on lastSuccessfulLt
        if (lastSuccessfulLt !== lastLt) {
            await supabase
                .from('system_config')
                .update({ value: { last_lt: lastSuccessfulLt }, updated_at: new Date().toISOString() })
                .eq('key', 'reconciler_cursor');
            
            logger.info(`Reconciliation batch complete. New LT: ${lastSuccessfulLt}`);
        }
    }

    async reportResults(discrepancies: any, violations: any) {
        const guardrail = require('../core/services/guardrail');
        const reason = discrepancies.length > 0 ? 'RECONCILIATION_DRIFT' : 'INVARIANT_VIOLATION';
        const metadata = { discrepancies, violations, timestamp: new Date().toISOString() };

        logger.error('RECONCILIATION FAILURE detected!', { count: discrepancies.length });
        await guardrail.triggerPause(reason, metadata);
    }

    stop() {
        this.isRunning = false;
        logger.info('ReconciliationWorker stopped');
    }
}

module.exports = new ReconciliationWorker();
