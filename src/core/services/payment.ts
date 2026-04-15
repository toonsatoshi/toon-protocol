const supabase = require('../../../supabase');
const logger = require('../../../logger');

class PaymentService {
    /**
     * @param {number} userId
     * @param {'stars' | 'fiat'} source
     * @param {number} amountCurrency Smallest unit (e.g. 50 Stars)
     * @param {number} toonAmount Amount of $TOON to credit
     * @returns {Promise<{success: boolean, data?: string, error?: string}>}
     */
    async createIntent(userId, source, amountCurrency, toonAmount) {
        try {
            // Idempotency: source:userId:amount:timestamp_bucket
            // Using 1-minute bucket to allow multiple purchases but prevent accidental double-clicks
            const bucket = Math.floor(Date.now() / 60000);
            const idempotencyKey = `${source}:${userId}:${amountCurrency}:${bucket}`;

            const { data: intentId, error } = await supabase.rpc('create_payment_intent', {
                p_user_id: Number(userId),
                p_source: source,
                p_amount_currency: amountCurrency,
                p_toon_amount: toonAmount,
                p_idempotency_key: idempotencyKey,
                p_metadata: { initiated_at: new Date().toISOString() }
            });

            if (error) {
                if (error.message.includes('SYSTEM_PAUSED')) return { success: false, error: 'SYSTEM_PAUSED' };
                if (error.message.includes('RESUME_COOLDOWN')) return { success: false, error: 'RESUME_COOLDOWN' };
                
                logger.error('Failed to create payment intent', { error, userId, source });
                return { success: false, error: 'DB_ERROR' };
            }

            return { success: true, data: intentId };
        } catch (e) {
            logger.error('PaymentService.createIntent error', e);
            return { success: false, error: 'INTERNAL_ERROR' };
        }
    }

    /**
     * @param {string} intentId
     * @param {string} externalId (e.g. telegram charge_id)
     * @param {Object} metadata
     * @returns {Promise<{success: boolean, error?: string}>}
     */
    async confirm(intentId, externalId, metadata = {}) {
        try {
            const { data: success, error } = await supabase.rpc('finalize_payment', {
                p_intent_id: intentId,
                p_external_id: externalId,
                p_metadata: { ...metadata, confirmed_at: new Date().toISOString() }
            });

            if (error) {
                logger.error('Failed to finalize payment', { error, intentId, externalId });
                return { success: false, error: 'DB_ERROR' };
            }

            if (!success) {
                return { success: false, error: 'ALREADY_PROCESSED_OR_INVALID_INTENT' };
            }

            return { success: true };
        } catch (e) {
            logger.error('PaymentService.confirm error', e);
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
                .from('payment_intents')
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

module.exports = new PaymentService();
