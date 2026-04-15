const { Markup } = require('telegraf');
const supabase = require('../../../supabase');
const logger = require('../../../logger');
const metrics = require('../../core/monitoring/metrics');

async function handleSystemStatus(ctx) {
    // Basic Admin Check (can be refined)
    if (ctx.from.id.toString() !== process.env.ADMIN_CHAT_ID) {
        return ctx.reply('⚙️ This command is for administrators only.');
    }

    try {
        await ctx.reply('⏳ Gathering system-wide status...');
        const auditService = require('../../core/services/guardrailAudit');

        // 1. Fetch System Config & Audit
        const [{ data: config }, audit] = await Promise.all([
            supabase.from('system_config').select('*'),
            auditService.getAuditSummary()
        ]);
        const pauseState = config.find(c => c.key === 'emergency_pause')?.value || {};
        const treasuryLimits = config.find(c => c.key === 'treasury_limits')?.value || {};

        // 2. Fetch Active Intents Count
        const [rewardIntents, tipIntents, paymentIntents] = await Promise.all([
            supabase.from('reward_intents').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
            supabase.from('tip_intents').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
            supabase.from('payment_intents').select('id', { count: 'exact', head: true }).eq('status', 'pending')
        ]);

        // 3. Get latest metrics report
        const report = metrics.getReport();

        let status = `📊 <b>System-Wide Status</b>\n\n`;
        
        status += `🛑 <b>Emergency Pause:</b> ${pauseState.active ? '🔴 ACTIVE' : '🟢 INACTIVE'}\n`;
        if (pauseState.active) {
            status += `Reason: ${pauseState.reason}\n`;
        } else if (pauseState.resume_cooldown_until && new Date(pauseState.resume_cooldown_until) > new Date()) {
            const remaining = Math.ceil((new Date(pauseState.resume_cooldown_until).getTime() - Date.now()) / 60000);
            status += `🕒 <b>Resume Cooldown:</b> ${remaining} min remaining\n`;
        }
        
        if (audit) {
            status += `📉 <b>24h Activity:</b> ${audit.total_pauses} pauses | ${audit.total_resumes} resumes\n`;
            if (audit.near_failures.length > 0) {
                status += audit.near_failures.join('\n') + '\n';
            }
        }
        status += `\n`;

        status += `💸 <b>Treasury & Emission:</b>\n`;
        status += `Hourly Cap: ${treasuryLimits.max_emission_per_hour} $TOON\n`;
        status += `Current Hour: ${treasuryLimits.current_hour_usage} $TOON\n`;
        status += `Reconciliation Drift: <b>${report.reconciliation_drift}</b>\n\n`;

        status += `⏳ <b>Pending Intents:</b>\n`;
        status += `Rewards: ${rewardIntents.count || 0}\n`;
        status += `Tips: ${tipIntents.count || 0}\n`;
        status += `Payments: ${paymentIntents.count || 0}\n\n`;

        status += `📊 <b>Total Metrics:</b>\n`;
        status += `Intents created: ${report.intents_total}\n`;
        status += `System failures: ${report.failures_total}\n`;
        status += `Indexer Lag: ${report.indexer_lag_ms}ms\n\n`;

        status += `<i>Last Audit: ${new Date(report.timestamp).toLocaleTimeString()}</i>`;

        await ctx.reply(status, {
            parse_mode: 'HTML',
            ...Markup.inlineKeyboard([
                [Markup.button.callback('🛑 PAUSE SYSTEM', 'admin_pause')],
                [Markup.button.callback('🟢 RESUME SYSTEM', 'admin_resume')],
                [Markup.button.callback('🔄 Refresh', 'sys_status')]
            ])
        });
    } catch (e) {
        logger.error('handleSystemStatus error', e);
        ctx.reply('❌ Error generating system status report.');
    }
}

async function handleAdminPause(ctx) {
    if (ctx.from.id.toString() !== process.env.ADMIN_CHAT_ID) return ctx.answerCbQuery();
    const guardrail = require('../../core/services/guardrail');
    await guardrail.triggerPause('Manual admin action');
    await ctx.answerCbQuery('System Paused');
    return handleSystemStatus(ctx);
}

async function handleAdminResume(ctx) {
    if (ctx.from.id.toString() !== process.env.ADMIN_CHAT_ID) return ctx.answerCbQuery();
    const guardrail = require('../../core/services/guardrail');
    await guardrail.resume('Manual admin resolution');
    await ctx.answerCbQuery('System Resumed');
    return handleSystemStatus(ctx);
}

module.exports = {
    handleSystemStatus,
    handleAdminPause,
    handleAdminResume
};
