const supabase = require('../../../supabase');
const logger = require('../../../logger');

class GuardrailService {
    /**
     * @returns {Promise<Object>} Full status object
     */
    async getStatus() {
        try {
            const { data, error } = await supabase
                .from('system_config')
                .select('value')
                .eq('key', 'emergency_pause')
                .single();
            
            if (error) {
                logger.error('Failed to fetch emergency pause state', error);
                return { active: true, inCooldown: false, error: true };
            }

            const active = data.value.active === true;
            const cooldownUntil = data.value.resume_cooldown_until ? new Date(data.value.resume_cooldown_until) : null;
            const inCooldown = cooldownUntil && cooldownUntil > new Date();

            return { active, inCooldown, cooldownUntil };
        } catch (e) {
            logger.error('Guardrail status check error', e);
            return { active: true, inCooldown: false, error: true };
        }
    }

    /**
     * Absolute block check (Bug 3 Fix)
     * Returns true ONLY if the system is explicitly paused.
     */
    async isPaused() {
        const status = await this.getStatus();
        return status.active === true;
    }

    /**
     * Returns true if system is in resume cooldown (Bug 3 Fix)
     */
    async isCooldown() {
        const status = await this.getStatus();
        return status.inCooldown === true;
    }

    async triggerPause(reason: string, metadata: any = {}) {
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

    async resume(reason: string = 'Manual resolution', cooldownMinutes: number = 5) {
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
