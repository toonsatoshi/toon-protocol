const guardrail = require('../core/services/guardrail');
const { Markup } = require('telegraf');

/**
 * Middleware to check for emergency pause and inform users.
 * Allows read-only actions but intercepts 'write' intents.
 */
async function guardrailMiddleware(ctx, next) {
    if (!ctx.from) return next();

    // Only intercept specific 'write' actions or command groups
    const isWriteAction = 
        (ctx.updateType === 'callback_query' && (
            ctx.callbackQuery.data.startsWith('play_') || 
            ctx.callbackQuery.data.startsWith('tip_') || 
            ctx.callbackQuery.data === 'deploy_identity'
        )) ||
        (ctx.message && ctx.message.text && (
            ctx.message.text === '⬆️ Upload' ||
            ctx.message.text === '💸 Tip'
        ));

    if (isWriteAction) {
        const paused = await guardrail.isPaused();
        if (paused) {
            return ctx.reply(
`⚠️ <b>System Temporarily Paused</b>

To ensure economic integrity and protect user funds, the Toon Protocol has entered a temporary safe failure mode.

✅ <b>What works:</b>
- Viewing Profile
- Checking Balance
- Listening to tracks (No rewards)

❌ <b>What is paused:</b>
- New Rewards
- Tipping
- Uploads

<i>The team has been notified and is working on a resolution. Thank you for your patience!</i>`,
                { parse_mode: 'HTML' }
            );
        }
    }

    return next();
}

module.exports = guardrailMiddleware;
