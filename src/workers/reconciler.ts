const supabase = require('../../supabase');
const logger = require('../../logger');

class ReconciliationWorker {
    constructor() {
        this.isRunning = false;
        this.CHECK_INTERVAL_MS = 60000; // Run every minute
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
                await this.performFullCheck();
            } catch (e) {
                logger.error('ReconciliationWorker loop error', e);
            }
            await new Promise(r => setTimeout(r, this.CHECK_INTERVAL_MS));
        }
    }

    async performFullCheck() {
        logger.info('Starting full system reconciliation check...');
        
        // 1. Fetch ALL indexed events (the authoritative log)
        const { data: events, error: eventErr } = await supabase
            .from('indexed_events')
            .select('*')
            .order('lt', { ascending: true });
        
        if (eventErr) throw eventErr;

        // 2. Recompute State from Events
        const expectedState = this.reconstructStateFromEvents(events);

        // 3. Fetch Current Cached State from DB
        const { data: currentUsers, error: userErr } = await supabase.from('users').select('*');
        if (userErr) throw userErr;

        // 4. Comparison Engine
        const discrepancies = this.compareStates(expectedState, currentUsers);

        // 5. Invariant Checks
        const invariantViolations = this.checkInvariants(expectedState, events);

        // 6. Report Results
        this.reportResults(discrepancies, invariantViolations);
    }

    /**
     * @param {any[]} events 
     */
    reconstructStateFromEvents(events) {
        const state = {
            balances: new Map(), // userId -> balance
            rewards: new Set(),  // achievementKey set
            tips: []            // list of verified tips
        };

        for (const event of events) {
            const data = event.data;
            
            switch (event.event_type) {
                case 'RewardClaimed':
                    const userId = data.userId; // Assuming indexed data has this
                    const amount = Number(data.amount);
                    state.balances.set(userId, (state.balances.get(userId) || 0) + amount);
                    state.rewards.add(`${data.rewardId}:${data.recipient}:${data.claimId}`);
                    break;
                
                case 'TipSent':
                    // Tips don't usually affect internal $TOON balance but affect user stats
                    state.tips.push(event.tx_hash);
                    break;
                
                // Add more event types here as defined in contracts
            }
        }
        return state;
    }

    /**
     * @param {Object} expected 
     * @param {any[]} actualUsers 
     */
    compareStates(expected, actualUsers) {
        const discrepancies = [];

        for (const user of actualUsers) {
            const userId = user.telegram_id;
            const expectedBalance = expected.balances.get(userId) || 0;
            const actualBalance = user.toon_balance || 0;

            if (expectedBalance !== actualBalance) {
                discrepancies.push({
                    userId,
                    type: 'BALANCE_MISMATCH',
                    expected: expectedBalance,
                    actual: actualBalance
                });
            }
        }
        return discrepancies;
    }

    /**
     * @param {Object} expected 
     * @param {any[]} events 
     */
    checkInvariants(expected, events) {
        const violations = [];
        
        // Invariant 1: Total Supply check
        // (This would require fetching total supply from contract or summing all events)
        
        // Invariant 2: No negative balances
        for (const [userId, bal] of expected.balances) {
            if (bal < 0) {
                violations.push({ type: 'NEGATIVE_BALANCE', userId, balance: bal });
            }
        }

        return violations;
    }

    async reportResults(discrepancies, violations) {
        if (discrepancies.length === 0 && violations.length === 0) {
            logger.info('Reconciliation check PASSED: No discrepancies found.');
        } else {
            const guardrail = require('../core/services/guardrail');
            const reason = discrepancies.length > 0 ? 'RECONCILIATION_DRIFT' : 'INVARIANT_VIOLATION';
            const metadata = { discrepancies, violations, timestamp: new Date().toISOString() };

            if (discrepancies.length > 0) {
                logger.error('RECONCILIATION FAILURE: State discrepancies detected!', { count: discrepancies.length });
                discrepancies.forEach(d => logger.warn('Discrepancy:', d));
            }
            if (violations.length > 0) {
                logger.error('INVARIANT VIOLATION: System rules broken!', { count: violations.length });
                violations.forEach(v => logger.error('Violation:', v));
            }

            // TRIGGER EMERGENCY PAUSE
            logger.warn('🚨 Reconciliation worker triggering emergency pause...');
            await guardrail.triggerPause(reason, metadata);
        }
    }

    stop() {
        this.isRunning = false;
        logger.info('ReconciliationWorker stopped');
    }
}

module.exports = new ReconciliationWorker();
