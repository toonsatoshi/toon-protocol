const supabase = require('../../../supabase');
const logger = require('../../../logger');

class RewardService {
    /**
     * @param {number} userId
     * @param {string} type 'milestone' | 'referral' | 'streak'
     * @param {string} referenceId e.g. trackId or referredUserId
     * @param {number} amountToon
     * @param {string} achievementKey unique identifier for the achievement
     * @returns {Promise<{success: boolean, data?: string, error?: string}>}
     */
    async createIntent(userId, type, referenceId, amountToon, achievementKey) {
        try {
            // Idempotency Key: {type}:{userId}:{referenceId}
            const idempotencyKey = `${type}:${userId}:${referenceId}`;

            const { data: intentId, error } = await supabase.rpc('create_reward_intent', {
                p_user_id: Number(userId),
                p_reward_type: type,
                p_reference_id: referenceId,
                p_amount_toon: amountToon,
                p_idempotency_key: idempotencyKey,
                p_achievement_key: achievementKey
            });

            if (error) {
                logger.error('Failed to create reward intent', { error, userId, type, referenceId });
                return { success: false, error: 'DB_ERROR' };
            }

            if (!intentId) {
                return { success: false, error: 'ACHIEVEMENT_ALREADY_REWARDED' };
            }

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
    async finalize(intentId) {
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
    async processReward(userId, type, referenceId, amountToon, achievementKey) {
        const intentRes = await this.createIntent(userId, type, referenceId, amountToon, achievementKey);
        if (!intentRes.success) return intentRes;

        return await this.finalize(intentRes.data);
    }
}

module.exports = new RewardService();
