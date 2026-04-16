const tipService = require('../core/services/tip');
const chainAdapter = require('../chain/adapter');
const supabase = require('../../supabase');
const store = require('../../store');
const logger = require('../../logger');

class ChainObserver {
    constructor() {
        this.isRunning = false;
        this.POLL_INTERVAL_MS = 15000; // 15 seconds
        this.MAX_ATTEMPTS = 20; // ~5 minutes of polling per intent
    }

    async start() {
        if (this.isRunning) return;
        this.isRunning = true;
        logger.info('ChainObserver started');
        this.runLoop();
    }

    async runLoop() {
        while (this.isRunning) {
            try {
                await this.processPendingIntents();
            } catch (e) {
                logger.error('ChainObserver loop error', e);
            }
            await new Promise((r: any) => setTimeout(r, this.POLL_INTERVAL_MS));
        }
    }

    async processPendingIntents() {
        // 1. Fetch pending intents that haven't reached max attempts
        const { data: intents, error } = await supabase
            .from('tip_intents')
            .select('*')
            .eq('status', 'pending')
            .lt('attempt_count', this.MAX_ATTEMPTS)
            .order('last_checked_at', { ascending: true, nullsFirst: true })
            .limit(10);

        if (error) {
            logger.error('ChainObserver.processPendingIntents db error', error);
            return;
        }

        if (!intents || intents.length === 0) return;

        logger.info(`ChainObserver processing ${intents.length} pending intents`);

        for (const intent of intents) {
            await this.reconcileIntent(intent);
        }
    }

    async reconcileIntent(intent: any) {
        const intentId = intent.id;
        
        try {
            // 1. Get Artist Wallet
            const artistRes = await store.getUser(intent.artist_id);
            if (!artistRes.success || !artistRes.data.walletAddress) {
                await this.updateIntentMetadata(intentId, intent.attempt_count + 1, 'ARTIST_WALLET_NOT_FOUND');
                return;
            }
            const recipientAddress = artistRes.data.walletAddress;

            // 2. Scan Chain
            const scanRes = await chainAdapter.searchForIntent(
                recipientAddress, 
                intentId, 
                intent.amount_ton
            );

            if (scanRes.success) {
                // 3. Finalize Atomic DB update
                const finalizeRes = await tipService.finalize(intentId, scanRes.txHash);
                if (finalizeRes.success) {
                    logger.info(`ChainObserver successfully finalized tip intent ${intentId}`, { txHash: scanRes.txHash });
                }
            } else {
                // 4. Update attempt count
                await this.updateIntentMetadata(intentId, intent.attempt_count + 1, scanRes.error);
            }
        } catch (e) {
            logger.error(`ChainObserver failure reconciling intent ${intentId}`, e);
        }
    }

    async updateIntentMetadata(intentId: string, attemptCount: number, lastError: string) {
        await supabase
            .from('tip_intents')
            .update({
                attempt_count: attemptCount,
                last_checked_at: new Date().toISOString(),
                failure_reason: lastError
            })
            .eq('id', intentId);
    }

    stop() {
        this.isRunning = false;
        logger.info('ChainObserver stopped');
    }
}

module.exports = new ChainObserver();
