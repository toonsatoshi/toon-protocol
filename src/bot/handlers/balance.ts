const { Markup } = require('telegraf');
const supabase = require('../../../supabase');
const logger = require('../../../logger');

/**
 * Handler for 'Explain My Balance' - provides a breakdown of all transactions.
 */
async function handleExplainBalance(ctx) {
    const userId = ctx.from.id;
    const user = ctx.state.user;

    if (!user) return ctx.reply('❌ Please /start first.');

    try {
        await ctx.reply('⏳ Calculating your balance breakdown...');

        // 1. Fetch all contributing factors in parallel
        const [payments, rewards, tipsReceived, tipsSent] = await Promise.all([
            supabase.from('payment_intents').select('*').eq('user_id', userId).eq('status', 'completed'),
            supabase.from('reward_intents').select('*').eq('user_id', userId).eq('status', 'finalized'),
            supabase.from('tip_intents').select('*').eq('artist_id', userId).eq('status', 'confirmed'),
            supabase.from('tip_intents').select('*').eq('tipper_id', userId).eq('status', 'confirmed')
        ]);

        let explanation = `💰 <b>Balance Breakdown</b>\n`;
        explanation += `Current Reconciled Balance: <b>${user.toonBalance || 0} $TOON</b>\n\n`;

        let totalIn = 0;
        let totalOut = 0;

        // -- Payments (In)
        if (payments.data?.length) {
            explanation += `💳 <b>Purchases:</b>\n`;
            payments.data.forEach(p => {
                explanation += `+${p.toon_amount} $TOON (${p.source})\n`;
                totalIn += p.toon_amount;
            });
            explanation += `\n`;
        }

        // -- Rewards (In)
        if (rewards.data?.length) {
            explanation += `🎁 <b>Rewards:</b>\n`;
            rewards.data.forEach(r => {
                explanation += `+${r.amount_toon} $TOON (${r.reward_type})\n`;
                totalIn += r.amount_toon;
            });
            explanation += `\n`;
        }

        // -- Tips Received (In)
        // Note: Currently Star tips add to TOON balance, TON tips go direct to wallet.
        // We only count what affects the internal $TOON balance.
        const starTipsIn = (tipsReceived.data || []).filter(t => t.method === 'stars');
        if (starTipsIn.length) {
            explanation += `📈 <b>Tips Received (Stars):</b>\n`;
            starTipsIn.forEach(t => {
                explanation += `+50 $TOON (from ${t.tipper_id})\n`;
                totalIn += 50;
            });
            explanation += `\n`;
        }

        // -- Tips Sent (Out)
        // If we ever allow tipping via $TOON balance:
        const toonTipsOut = (tipsSent.data || []).filter(t => t.method === 'toon');
        if (toonTipsOut.length) {
            explanation += `💸 <b>Tips Sent ($TOON):</b>\n`;
            toonTipsOut.forEach(t => {
                explanation += `-${t.amount_toon} $TOON\n`;
                totalOut += t.amount_toon;
            });
            explanation += `\n`;
        }

        explanation += `<b>Summary:</b>\n`;
        explanation += `Total In: +${totalIn} $TOON\n`;
        explanation += `Total Out: -${totalOut} $TOON\n`;
        explanation += `Net: <b>${totalIn - totalOut} $TOON</b>\n`;

        if (totalIn - totalOut !== user.toonBalance) {
            explanation += `\n⚠️ <i>Note: There is a minor reconciliation mismatch (${user.toonBalance - (totalIn - totalOut)}). This usually means some legacy balance was not captured in the new intent system.</i>`;
        }

        await ctx.reply(explanation, { parse_mode: 'HTML' });
    } catch (e) {
        logger.error('handleExplainBalance error', e);
        ctx.reply('❌ Error generating balance breakdown.');
    }
}

module.exports = {
    handleExplainBalance
};
