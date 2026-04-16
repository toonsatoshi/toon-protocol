import type { Context } from 'telegraf';
const { Markup } = require('telegraf');
const paymentService = require('../../core/services/payment');
const logger = require('../../../logger');

/**
 * Handler for initiating a purchase with Stars
 */
async function handleBuyStars(ctx: Context) {
    const userId = ctx.from.id;
    // For this prototype, we'll hardcode one package: 50 Stars for 100 TOON
    const starsAmount = 50;
    const toonAmount = 100;

    try {
        // 1. Create Payment Intent (Atomic)
        const intentRes = await paymentService.createIntent(userId, 'stars', starsAmount, toonAmount);
        if (!intentRes.success) {
            return ctx.answerCbQuery('❌ Error preparing payment. Please try again.');
        }
        const intentId = intentRes.data;

        // 2. Build Invoice
        // The payload MUST contain the intentId for verification later.
        await ctx.replyWithInvoice({
            title: `⭐ Buy ${toonAmount} $TOON`,
            description: `Purchase $TOON tokens with Stars to tip artists and claim rewards.`,
            payload: `buy_toon:${intentId}`, // Normalized payload format
            provider_token: '', // Stars don't need a provider token
            currency: 'XTR', // Stars currency code
            prices: [{ label: '$TOON Package', amount: starsAmount }]
        });
        
        await ctx.answerCbQuery();
    } catch (e) {
        logger.error('handleBuyStars error', e);
        ctx.reply('❌ Error initiating Stars payment.');
    }
}

/**
 * Handler for pre_checkout_query (Telegram's first stage of payment confirmation)
 */
async function handlePreCheckout(ctx: Context) {
    const payload = ctx.preCheckoutQuery.invoice_payload;
    
    // 1. Basic Validation: Payload must start with our buy_toon prefix
    if (!payload.startsWith('buy_toon:')) {
        return ctx.answerPreCheckoutQuery(false, '❌ Invalid payment request.');
    }

    const intentId = payload.split(':')[1];
    
    try {
        // 2. Verify Intent exists and is still pending
        const intentRes = await paymentService.getIntent(intentId);
        if (!intentRes.success || intentRes.data.status !== 'pending') {
            return ctx.answerPreCheckoutQuery(false, '❌ This payment session has expired or was already processed.');
        }

        // 3. Confirm checkout to user
        await ctx.answerPreCheckoutQuery(true);
    } catch (e) {
        logger.error('handlePreCheckout error', e);
        ctx.answerPreCheckoutQuery(false, '❌ An internal error occurred.');
    }
}

/**
 * Handler for successful_payment (Telegram's final confirmation)
 * This is our "trust boundary" handler.
 */
async function handleSuccessfulPayment(ctx: Context) {
    const payment = ctx.message.successful_payment;
    const payload = payment.invoice_payload;
    const chargeId = payment.telegram_payment_charge_id;

    if (!payload.startsWith('buy_toon:')) return;
    const intentId = payload.split(':')[1];

    try {
        logger.info('External payment received, finalizing intent...', { intentId, chargeId });

        // 1. Finalize Payment in DB (Atomic)
        const finalizeRes = await paymentService.confirm(intentId, chargeId, {
            original_payload: payload,
            stars_amount: payment.total_amount,
            currency: payment.currency
        });

        if (finalizeRes.success) {
            await ctx.reply(`🎉 <b>Payment Successful!</b>\n\nYour account has been credited with $TOON. You can now tip your favorite artists.`, { parse_mode: 'HTML' });
        } else {
            // Already processed or invalid intent
            logger.warn('Payment finalized failed (potentially already processed)', { intentId, chargeId });
            // Don't error to the user if it was already confirmed, just notify or ignore.
        }
    } catch (e) {
        logger.error('handleSuccessfulPayment error', e);
        await ctx.reply('⚠️ Your payment was successful, but we encountered an error updating your balance. Our team has been notified.');
    }
}

module.exports = {
    handleBuyStars,
    handlePreCheckout,
    handleSuccessfulPayment
};
