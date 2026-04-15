const store = require('../../../store');
const supabase = require('../../../supabase');
const logger = require('../../../logger');
const metrics = require('../monitoring/metrics');

/**
 * @typedef {Object} TipIntent
 * @property {string} id
 * @property {number} tipperId
 * @property {number} artistId
 * @property {string} trackId
 * @property {number} amountTon
 * @property {string} method
 * @property {string} status
 * @property {string} idempotencyKey
 */

class TipService {
    /**
     * @param {number} tipperId
     * @param {string} trackId
     * @param {number} amountTon
     * @param {string} method
     * @returns {Promise<{success: boolean, data?: string, error?: string}>}
     */
    async createIntent(tipperId, trackId, amountTon, method) {
        metrics.recordIntent('tip');
        try {
            // 1. Validate Track & Artist
            const trackRes = await store.getTrack(trackId);
            if (!trackRes.success) return { success: false, error: 'Track not found' };
            const track = trackRes.data;

            // 2. Create Idempotency Key
            // Pattern: tip_{tipperId}_{trackId}_{amountTon}_{method}_{daily_bucket}
            // Daily bucket allows one tip per track per day with same amount (safe default)
            const date = new Date().toISOString().split('T')[0];
            const idempotencyKey = `tip_${tipperId}_${trackId}_${amountTon}_${method}_${date}`;

            // 3. Call DB RPC
            const { data: intentId, error } = await supabase.rpc('create_tip_intent', {
                p_tipper_id: Number(tipperId),
                p_artist_id: Number(track.artistId),
                p_track_id: trackId,
                p_amount_ton: amountTon,
                p_method: method,
                p_idempotency_key: idempotencyKey
            });

            if (error) {
                if (error.message.includes('SYSTEM_PAUSED')) return { success: false, error: 'SYSTEM_PAUSED' };
                if (error.message.includes('RESUME_COOLDOWN')) return { success: false, error: 'RESUME_COOLDOWN' };
                
                metrics.recordFailure('tip_db_error', error.message);
                logger.error('Failed to create tip intent', { error, tipperId, trackId });
                return { success: false, error: 'DB_ERROR' };
            }

            return { success: true, data: intentId };
        } catch (e) {
            metrics.recordFailure('tip_internal_error', e.message);
            logger.error('TipService.createIntent error', e);
            return { success: false, error: 'INTERNAL_ERROR' };
        }
    }

    /**
     * @param {string} intentId
     * @param {string} txHash
     * @returns {Promise<{success: boolean, error?: string}>}
     */
    async finalize(intentId, txHash) {
        try {
            const { data: success, error } = await supabase.rpc('finalize_tip', {
                p_intent_id: intentId,
                p_tx_hash: txHash
            });

            if (error) {
                logger.error('Failed to finalize tip', { error, intentId, txHash });
                return { success: false, error: 'DB_ERROR' };
            }

            if (!success) {
                return { success: false, error: 'ALREADY_CONFIRMED_OR_NOT_FOUND' };
            }

            return { success: true };
        } catch (e) {
            logger.error('TipService.finalize error', e);
            return { success: false, error: 'INTERNAL_ERROR' };
        }
    }

    /**
     * @param {string} intentId
     * @returns {Promise<{success: boolean, data?: any, error?: string}>}
     */
    async getIntent(intentId) {
        try {
            const { data, error } = await supabase
                .from('tip_intents')
                .select('*')
                .eq('id', intentId)
                .single();
            
            if (error) return { success: false, error: 'NOT_FOUND' };
            return { success: true, data };
        } catch (e) {
            return { success: false, error: 'INTERNAL_ERROR' };
        }
    }
}

module.exports = new TipService();
