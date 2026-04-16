import type { Context } from 'telegraf';
const { Markup } = require('telegraf');
const tipService = require('../../core/services/tip');
const chainAdapter = require('../../chain/adapter');
const store = require('../../../store');
const logger = require('../../../logger');

/**
 * Handler for the initial tip button click
 */
async function handleTipInitiated(ctx: Context) {
    const trackId = ctx.match[1];
    const telegramId = ctx.from.id;

    try {
        const trackRes = await store.getTrack(trackId);
        if (!trackRes.success) return ctx.reply('❌ Track not found.');
        const track = trackRes.data;

        await ctx.editMessageText(`💸 Tip <b>${track.artistName}</b>\n\nChoose your tipping method:`, {
            parse_mode: 'HTML',
            ...Markup.inlineKeyboard([
                [Markup.button.callback('⭐ Tip with Stars', `tip_stars_${trackId}`)],
                [Markup.button.callback('💎 Tip with TON', `tip_ton_${trackId}`)],
                [Markup.button.callback('🔙 Back', `artist_${track.artistId}`)]
            ])
        });
    } catch (e) {
        logger.error('handleTipInitiated error', e);
        ctx.reply('❌ Error initiating tip.');
    }
}

/**
 * Handler for TON tipping amount selection
 */
async function handleTipTonChoice(ctx: Context) {
    const trackId = ctx.match[1];
    const trackRes = await store.getTrack(trackId);
    if (!trackRes.success) return ctx.reply('❌ Track not found.');
    const track = trackRes.data;

    await ctx.editMessageText(`💸 Tip <b>${track.artistName}</b>\n\nSelect an amount to tip in TON:`, {
        parse_mode: 'HTML',
        ...Markup.inlineKeyboard([
            [Markup.button.callback('1 TON', `dotip_${trackId}_1`)],
            [Markup.button.callback('5 TON', `dotip_${trackId}_5`)],
            [Markup.button.callback('10 TON', `dotip_${trackId}_10`)],
            [Markup.button.callback('🔙 Back', `tip_${trackId}`)]
        ])
    });
}

/**
 * Handler for executing a TON tip
 */
async function handleDoTipTon(ctx: Context) {
    const [_, trackId, amountStr] = ctx.match;
    const amount = parseInt(amountStr);
    const tipperId = ctx.from.id;

    try {
        // 1. Create Intent (Atomic & Idempotent)
        const intentRes = await tipService.createIntent(tipperId, trackId, amount, 'ton');
        if (!intentRes.success) {
            return ctx.answerCbQuery('❌ Failed to create tip intent. Please try again.');
        }
        const intentId = intentRes.data;

        // 2. Get Track details for recipient address
        const trackRes = await store.getTrack(trackId);
        const track = trackRes.data;
        
        // Find artist wallet (we need the artist's wallet address from their user record)
        const artistRes = await store.getUser(track.artistId);
        if (!artistRes.success || !artistRes.data.walletAddress) {
            return ctx.reply('❌ This artist has not linked a wallet yet.');
        }
        const recipientAddress = artistRes.data.walletAddress;

        // 3. Build TON Payload
        const payload = chainAdapter.buildTipPayload(recipientAddress, amount, intentId);

        // 4. Send to user for signing via TonConnect or Deep Link
        // For simplicity in this CLI-based bot, we provide the link.
        // In a production app, we would use the TonConnect connector.
        
        const boc = payload.body.toBoc().toString('base64');
        const url = `ton://transfer/${recipientAddress}?amount=${payload.value}&bin=${boc}`;

        await ctx.reply(`💸 To tip <b>${amount} TON</b> to <b>${track.artistName}</b>, please sign the transaction in your wallet:`, {
            parse_mode: 'HTML',
            ...Markup.inlineKeyboard([
                [Markup.button.url('💎 Sign Transaction', url)],
                [Markup.button.callback('✅ I have Paid', `verify_tip_${intentId}`)]
            ])
        });
        
        await ctx.answerCbQuery();
    } catch (e) {
        logger.error('handleDoTipTon error', e);
        ctx.reply('❌ Error preparing tip transaction.');
    }
}

/**
 * Handler for manual verification after payment
 * Note: Actual confirmation is delegated to the chainIndexer service.
 * The bot polls on-chain to detect the transaction based on intentId in the memo.
 */
async function handleVerifyTip(ctx: Context) {
    const intentId = ctx.match[1];

    try {
        const intentRes = await tipService.getIntent(intentId);
        if (!intentRes.success) return ctx.reply('❌ Tip record not found.');

        // The chain observer (chainIndexer) continuously monitors for this intentId
        // on-chain. We do not fabricate a confirmation here.
        await ctx.reply('⏳ <b>Tip Verification in Progress</b>\n\nWe\'re monitoring the blockchain for your transaction. This may take a few moments. You\'ll be notified once confirmed.', { parse_mode: 'HTML' });
        await ctx.answerCbQuery();
    } catch (e) {
        logger.error('handleVerifyTip error', e);
        ctx.reply('❌ Error verifying tip.');
    }
}

module.exports = {
    handleTipInitiated,
    handleTipTonChoice,
    handleDoTipTon,
    handleVerifyTip
};
