const guardrail = require('../core/services/guardrail');
const { Markup } = require('telegraf');

/**
 * Middleware to check for emergency pause and cooldown.
 * BUG 3 FIX: Differentiate between Pause (block all) and Cooldown (block high-risk).
 */
async function guardrailMiddleware(ctx, next) {
    if (!ctx.from) return next();

    // Grouping actions by risk level
    const isHighRiskAction = ctx.updateType === 'callback_query' && 
        (ctx.callbackQuery.data === 'deploy_identity' || ctx.callbackQuery.data.startsWith('play_'));
    
    const isLowRiskAction = 
        (ctx.updateType === 'callback_query' && ctx.callbackQuery.data.startsWith('tip_')) ||
        (ctx.message && ctx.message.text && (
            ctx.message.text === '⬆️ Upload' ||
            ctx.message.text === '💸 Tip'
        ));

    if (isHighRiskAction || isLowRiskAction) {
        const status = await guardrail.getStatus();

        // 1. ABSOLUTE PAUSE: Block everything
        if (status.active) {
            return ctx.reply(
`🛑 <b>Protocol Paused</b>\n\nThe system is currently in a safe failure mode. All write operations are suspended.`,
                { parse_mode: 'HTML' }
            );
        }

        // 2. COOLDOWN: Block only HIGH RISK (Rewards)
        if (status.inCooldown && isHighRiskAction) {
            const remaining = Math.ceil((status.cooldownUntil.getTime() - Date.now()) / 60000);
            return ctx.reply(
`⏳ <b>Resume Cooldown</b>\n\nRewards are currently paused for system stabilization. High-risk operations will resume in <b>${remaining} min</b>.\n\n✅ <i>Tips and Uploads are available.</i>`,
                { parse_mode: 'HTML' }
            );
        }
    }

    return next();
}

module.exports = guardrailMiddleware;
