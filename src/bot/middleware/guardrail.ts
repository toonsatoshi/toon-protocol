const guardrail = require('../core/services/guardrail');
const { Markup } = require('telegraf');

/**
 * Middleware to check for emergency pause and cooldown.
 * M1 Fix: Invert classification to whitelist low-risk, block everything else as high-risk.
 */
async function guardrailMiddleware(ctx, next) {
    if (!ctx.from) return next();

    // 1. Identify if this is a "Write" action (Intent to change state)
    const isWriteAction = 
        (ctx.updateType === 'callback_query') || // All callbacks are potential writes
        (ctx.message && ctx.message.text && (
            ctx.message.text === '⬆️ Upload' ||
            ctx.message.text === '💸 Tip'
        ));

    if (!isWriteAction) return next();

    // 2. Define Low-Risk Whitelist
    const isLowRiskAction = 
        (ctx.updateType === 'callback_query' && (
            ctx.callbackQuery.data.startsWith('tip_') || 
            ctx.callbackQuery.data.startsWith('play_') ||
            ctx.callbackQuery.data === 'sys_status' // Admin refresh
        )) ||
        (ctx.message && ctx.message.text && (
            ctx.message.text === '⬆️ Upload' ||
            ctx.message.text === '💸 Tip'
        ));

    // 3. High-Risk is anything that isn't whitelisted
    const isHighRiskAction = !isLowRiskAction;

    const status = await guardrail.getStatus();

    // 4. ABSOLUTE PAUSE: Block everything
    if (status.active) {
        // Allow admin to see status even if paused
        if (ctx.callbackQuery && ctx.callbackQuery.data === 'sys_status') return next();

        return ctx.reply(
`🛑 <b>Protocol Paused</b>\n\nThe system is currently in a safe failure mode. All write operations are suspended.`,
            { parse_mode: 'HTML' }
        );
    }

    // 5. COOLDOWN: Block only HIGH RISK (Rewards/Admin)
    if (status.inCooldown && isHighRiskAction) {
        logger.warn('🛡️ Guardrail: High-risk action intercepted during cooldown', {
            userId: ctx.from.id,
            action: ctx.callbackQuery ? ctx.callbackQuery.data : 'message',
            text: ctx.message ? ctx.message.text : null
        });

        const remaining = Math.ceil((status.cooldownUntil.getTime() - Date.now()) / 60000);
        return ctx.reply(
`⏳ <b>Resume Cooldown</b>\n\nRewards are currently paused for system stabilization. High-risk operations will resume in <b>${remaining} min</b>.\n\n✅ <i>Tips and Uploads are available.</i>`,
            { parse_mode: 'HTML' }
        );
    }

    return next();
}

module.exports = guardrailMiddleware;
