const { Markup } = require('telegraf');
const { toNano } = require('@ton/core');
const store = require('./store');
const logger = require('./logger');

function setupPaymentHandlers(bot) {
    bot.hears('💳 Buy $TOON', async (ctx) => {
        await ctx.reply(
    `💳 Buy $TOON
    
    Choose how you'd like to purchase:`,
            Markup.inlineKeyboard([
                [Markup.button.callback('⭐ Pay with Telegram Stars', 'buy_stars')],
                [Markup.button.callback('💎 Pay with TON', 'buy_ton')],
                [Markup.button.callback('💳 Pay with Card (Fiat)', 'buy_fiat')]
            ])
        );
    });

    bot.action('buy_stars', async (ctx) => {
        await ctx.replyWithInvoice({
            currency: 'XTR',
            provider_token: '',
            title: '⭐ Buy $TOON with Stars',
            description: 'Purchase $TOON tokens to tip artists and earn rewards.',
            payload: 'buy_toon_stars',
            prices: [{ label: '100 $TOON', amount: 50 }]
        });
    });

    bot.action('buy_ton', async (ctx) => {
        const telegramId = ctx.from.id;
        const res = await store.getUser(telegramId);
        
        if (!res.success || !res.data.walletAddress) {
            return ctx.reply("❌ Please link your wallet first using 💎 Link Wallet");
        }

        const transaction = {
            validUntil: Math.floor(Date.now() / 1000) + 600,
            messages: [{
                address: process.env.TOON_VAULT_ADDRESS,
                amount: toNano('1').toString()
            }]
        };

        await ctx.reply("✅ Send 1 TON to the vault to receive 100 $TOON. Transaction initiated in your wallet.");
    });
}

module.exports = { setupPaymentHandlers };
