const supabase = require('../../../supabase');
const logger = require('../../../logger');
const guardrail = require('../services/guardrail');

/**
 * Supply Audit Service
 * Goal: Verify Total Emitted = Sum(Balances) + Treasury + Burns
 */
class SupplyAudit {
    async runAudit() {
        try {
            logger.info('🚀 Starting Full Supply Audit...');

            // 1. Calculate Total Emitted from Intents
            const [payments, rewards, starTips] = await Promise.all([
                supabase.from('payment_intents').select('toon_amount').eq('status', 'completed'),
                supabase.from('reward_intents').select('amount_toon').eq('status', 'finalized'),
                supabase.from('tip_intents').select('id').eq('method', 'stars').eq('status', 'confirmed')
            ]);

            const totalFromPayments = (payments.data || []).reduce((acc: number, p: any) => acc + p.toon_amount, 0);
            const totalFromRewards = (rewards.data || []).reduce((acc: number, r: any) => acc + r.amount_toon, 0);
            const totalFromStarTips = (starTips.data || []).length * 50; // Each Star tip = 50 TOON

            const totalEmitted = totalFromPayments + totalFromRewards + totalFromStarTips;

            // 2. Calculate Sum of User Balances
            const { data: users, error: userError } = await supabase
                .from('users')
                .select('toon_balance');
            
            if (userError) throw userError;
            const sumBalances = users.reduce((acc: number, u: any) => acc + (u.toon_balance || 0), 0);

            // 3. Compare and Report
            const drift = totalEmitted - sumBalances;

            const report = {
                timestamp: new Date().toISOString(),
                total_emitted: totalEmitted,
                sum_user_balances: sumBalances,
                drift: drift,
                breakdown: {
                    payments: totalFromPayments,
                    rewards: totalFromRewards,
                    star_tips: totalFromStarTips
                }
            };

            if (Math.abs(drift) > 0.0001) {
                logger.error('❌ Supply Audit Mismatch!', report);
                await guardrail.triggerPause('Supply Audit Mismatch detected', report);
            } else {
                logger.info('✅ Supply Audit Passed!', report);
            }

            return report;
        } catch (e) {
            logger.error('Supply Audit failed', e);
            return null;
        }
    }
}

module.exports = new SupplyAudit();
