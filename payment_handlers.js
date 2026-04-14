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

    // All buy_stars and buy_ton handlers are in index.js for better integration
    // with TonConnect and session state.
}

module.exports = { setupPaymentHandlers };
