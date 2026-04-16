const supabase = require('../../../supabase');
const logger = require('../../../logger');
const guardrail = require('./guardrail');

class RewardService {
    /**
     * @param {number} userId
     * @param {string} type 'milestone' | 'referral' | 'streak'
     * @param {string} referenceId e.g. trackId or referredUserId
     * @param {number} amountToon
     * @param {string} achievementKey unique identifier for the achievement
     * @returns {Promise<{success: boolean, data?: string, error?: string}>}
     */
    async createIntent(userId: number, type: string, referenceId: string, amountToon: number, achievementKey: string) {
        try {
            const idempotencyKey = `${type}:${userId}:${referenceId}`;
            const debugTrace = { initiated_at: new Date().toISOString() };

            // Single atomic call for: Guardrail Check + Treasury Check + Achievement Check + Intent Creation
            const { data: intentId, error } = await supabase.rpc('create_reward_intent_atomic', {
                p_user_id: Number(userId),
                p_reward_type: type,
                p_reference_id: referenceId,
                p_amount_toon: amountToon,
                p_idempotency_key: idempotencyKey,
                p_achievement_key: achievementKey,
                p_debug_trace: debugTrace
            });

            if (error) {
                // Map DB errors to application error codes
                if (error.message.includes('SYSTEM_PAUSED')) return { success: false, error: 'SYSTEM_PAUSED' };
                if (error.message.includes('RESUME_COOLDOWN')) return { success: false, error: 'RESUME_COOLDOWN' };
                if (error.message.includes('TREASURY_LIMIT_HIT')) return { success: false, error: 'TREASURY_LIMIT_HIT' };
                
                logger.error('Failed to create atomic reward intent', { error, userId, type });
                return { success: false, error: 'DB_ERROR' };
            }

            if (!intentId) return { success: false, error: 'ACHIEVEMENT_ALREADY_REWARDED' };

            return { success: true, data: intentId };
        } catch (e) {
            logger.error('RewardService.createIntent error', e);
            return { success: false, error: 'INTERNAL_ERROR' };
        }
    }

    /**
     * @param {string} intentId
     * @returns {Promise<{success: boolean, error?: string}>}
     */
    async finalize(intentId: string) {
        try {
            const { data: success, error } = await supabase.rpc('finalize_reward', {
                p_intent_id: intentId
            });

            if (error) {
                logger.error('Failed to finalize reward', { error, intentId });
                return { success: false, error: 'DB_ERROR' };
            }

            return { success: !!success };
        } catch (e) {
            logger.error('RewardService.finalize error', e);
            return { success: false, error: 'INTERNAL_ERROR' };
        }
    }

    /**
     * Utility to process a reward end-to-end (create + finalize)
     * For off-chain rewards, this is the standard flow.
     */
    async processReward(userId: number, type: string, referenceId: string, amountToon: number, achievementKey: string) {
        const intentRes = await this.createIntent(userId, type, referenceId, amountToon, achievementKey);
        if (!intentRes.success) return intentRes;

        return await this.finalize(intentRes.data);
    }
}

module.exports = new RewardService();
