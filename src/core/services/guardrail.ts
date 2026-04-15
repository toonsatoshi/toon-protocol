const supabase = require('../../../supabase');
const logger = require('../../../logger');

class GuardrailService {
    /**
     * Check if the system is currently paused.
     * @returns {Promise<boolean>}
     */
    async isPaused() {
        try {
            const { data, error } = await supabase
                .from('system_config')
                .select('value')
                .eq('key', 'emergency_pause')
                .single();
            
            if (error) {
                logger.error('Failed to fetch emergency pause state', error);
                return true; // Safe default: pause if check fails
            }

            const active = data.value.active === true;
            const cooldownUntil = data.value.resume_cooldown_until ? new Date(data.value.resume_cooldown_until) : null;
            const inCooldown = cooldownUntil && cooldownUntil > new Date();

            return active || inCooldown;
        } catch (e) {
            logger.error('Guardrail check error', e);
            return true;
        }
    }

    /**
     * Trigger an emergency pause.
     * @param {string} reason 
     * @param {Object} metadata 
     */
    async triggerPause(reason, metadata = {}) {
        try {
            logger.warn(`🛑 EMERGENCY PAUSE TRIGGERED: ${reason}`, metadata);

            await Promise.all([
                supabase.from('system_config').upsert({
                    key: 'emergency_pause',
                    value: { active: true, reason, at: new Date().toISOString(), metadata },
                    updated_at: new Date().toISOString()
                }),
                supabase.from('guardrail_events').insert({
                    type: 'PAUSE',
                    reason,
                    metadata
                })
            ]);
        } catch (e) {
            logger.error('Failed to trigger emergency pause', e);
        }
    }

    /**
     * Resume system operations with a cooldown window.
     * @param {string} reason 
     * @param {number} cooldownMinutes 
     */
    async resume(reason = 'Manual resolution', cooldownMinutes = 5) {
        try {
            const cooldownUntil = new Date(Date.now() + cooldownMinutes * 60000).toISOString();
            logger.info(`✅ SYSTEM RESUMED: ${reason}. Cooldown until ${cooldownUntil}`);

            await Promise.all([
                supabase.from('system_config').upsert({
                    key: 'emergency_pause',
                    value: { active: false, reason: null, at: null, resume_cooldown_until: cooldownUntil },
                    updated_at: new Date().toISOString()
                }),
                supabase.from('guardrail_events').insert({
                    type: 'RESUME',
                    reason,
                    metadata: { cooldown_minutes: cooldownMinutes, cooldown_until: cooldownUntil }
                })
            ]);
        } catch (e) {
            logger.error('Failed to resume system', e);
        }
    }
}

module.exports = new GuardrailService();
