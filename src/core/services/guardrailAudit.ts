const supabase = require('../../../supabase');
const logger = require('../../../logger');

class GuardrailAuditService {
    /**
     * Get a summary of guardrail events for the last 24 hours.
     */
    async getAuditSummary() {
        try {
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
            const { data: events, error } = await supabase
                .from('guardrail_events')
                .select('*')
                .gte('created_at', oneDayAgo)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const summary = {
                total_pauses: events.filter(e => e.type === 'PAUSE').length,
                total_resumes: events.filter(e => e.type === 'RESUME').length,
                latest_trigger: events.find(e => e.type === 'PAUSE')?.reason || 'None',
                near_failures: await this.checkNearFailures()
            };

            return summary;
        } catch (e) {
            logger.error('Failed to get guardrail audit summary', e);
            return null;
        }
    }

    /**
     * Look for 'near-failures' like multiple treasury limit hits or reconciliation drift warnings.
     */
    async checkNearFailures() {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
        
        // Count how many times treasury limits were hit (if logged in guardrail_events)
        const { data: limitHits } = await supabase
            .from('guardrail_events')
            .select('id', { count: 'exact', head: true })
            .eq('type', 'TREASURY_LIMIT_HIT')
            .gte('created_at', oneHourAgo);

        // check for pending reward intents that are 'stale' (older than 10 mins)
        const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
        const { data: staleIntents } = await supabase
            .from('reward_intents')
            .select('id', { count: 'exact', head: true })
            .eq('status', 'pending')
            .lt('created_at', tenMinsAgo);

        let warnings = [];
        if ((limitHits?.count || 0) > 5) warnings.push(`⚠️ High Treasury Pressure (${limitHits.count} hits/hr)`);
        if ((staleIntents?.count || 0) > 10) warnings.push(`⚠️ Stale Intents (${staleIntents.count} pending)`);
        
        return warnings;
    }
}

module.exports = new GuardrailAuditService();
