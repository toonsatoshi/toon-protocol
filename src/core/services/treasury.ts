const supabase = require('../../../supabase');
const logger = require('../../../logger');

class TreasuryService {
    /**
     * Check if a reward intent can be processed within current budget.
     * @param {number} amount 
     * @returns {Promise<boolean>}
     */
    async canEmit(amount) {
        try {
            const { data, error } = await supabase
                .from('system_config')
                .select('value')
                .eq('key', 'treasury_limits')
                .single();
            
            if (error) throw error;
            
            const limits = data.value;
            const currentHour = new Date().getHours();
            const lastHourReset = limits.last_hour_reset ? new Date(limits.last_hour_reset).getHours() : -1;

            let usage = limits.current_hour_usage;
            if (currentHour !== lastHourReset) {
                usage = 0; // Hourly reset
            }

            if (usage + amount > limits.max_emission_per_hour) {
                logger.warn(`💸 TREASURY LIMIT HIT: Tried to emit ${amount}, usage ${usage}/${limits.max_emission_per_hour}`);
                return false;
            }

            return true;
        } catch (e) {
            logger.error('Treasury check error', e);
            return false;
        }
    }

    /**
     * Record emission usage.
     * @param {number} amount 
     */
    async recordEmission(amount) {
        try {
            const { data, error } = await supabase
                .from('system_config')
                .select('value')
                .eq('key', 'treasury_limits')
                .single();
            
            if (error) throw error;

            const limits = data.value;
            const now = new Date();
            const currentHour = now.getHours();
            const lastHourReset = limits.last_hour_reset ? new Date(limits.last_hour_reset).getHours() : -1;

            let usage = limits.current_hour_usage;
            if (currentHour !== lastHourReset) {
                usage = 0;
            }

            const updatedLimits = {
                ...limits,
                current_hour_usage: usage + amount,
                last_hour_reset: now.toISOString()
            };

            await supabase
                .from('system_config')
                .update({ value: updatedLimits, updated_at: now.toISOString() })
                .eq('key', 'treasury_limits');
            
            if (usage + amount >= limits.max_emission_per_hour) {
                await supabase.from('guardrail_events').insert({
                    type: 'TREASURY_LIMIT_HIT',
                    reason: 'Hourly emission cap reached',
                    metadata: { usage: usage + amount, cap: limits.max_emission_per_hour }
                });
            }
        } catch (e) {
            logger.error('Failed to record emission', e);
        }
    }
}

module.exports = new TreasuryService();
