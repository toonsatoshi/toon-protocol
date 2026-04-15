const store = require('../../../store');
const supabase = require('../../../supabase');
const rewardService = require('./reward');
const logger = require('../../../logger');

class ListenService {
    /**
     * @param {string} trackId
     * @param {number} listenerId
     * @returns {Promise<{success: boolean, data?: any, error?: string}>}
     */
    async recordPlay(trackId, listenerId) {
        try {
            // 1. Atomic DB increment and milestone check
            const { data, error } = await supabase.rpc('record_play_and_check_milestone', {
                p_track_id: trackId,
                p_listener_id: Number(listenerId),
                p_milestone_threshold: 5
            });

            if (error) {
                logger.error('ListenService.recordPlay db error', error);
                return { success: false, error: 'DB_ERROR' };
            }

            const result = data[0]; // record_play_and_check_milestone returns a table/array
            
            // 2. If milestone reached, trigger RewardService
            if (result.milestone_reached) {
                const achievementKey = `milestone:track_${trackId}:5_listeners`;
                
                // Reward the artist (optional: check if artist has a referrer)
                // In the current logic, the referrer gets the 50 TOON reward.
                const artistRes = await store.getUser(result.artist_id);
                if (artistRes.success && artistRes.data.referredBy) {
                    const referrerId = artistRes.data.referredBy;
                    
                    logger.info(`Milestone reached for track ${trackId}. Issuing reward to referrer ${referrerId}`);
                    
                    await rewardService.processReward(
                        referrerId,
                        'milestone',
                        trackId,
                        50, // 50 TOON for milestone
                        achievementKey
                    );
                }
            }

            return { success: true, data: result };
        } catch (e) {
            logger.error('ListenService.recordPlay error', e);
            return { success: false, error: 'INTERNAL_ERROR' };
        }
    }
}

module.exports = new ListenService();
