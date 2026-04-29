content = open('./index.js').read()

# ── Fix 1: buy_ton – fire-and-forget sendTransaction (same timeout bug as deploy_identity)
content = content.replace(
    '''    try {
        await ctx.answerCbQuery('Opening wallet...');
        await connector.sendTransaction(transaction);
        await ctx.reply("✅ 1 TON sent to the vault! Your $TOON balance will update shortly.");

        } catch (e) { logger.error('TON purchase tx failed', e); await ctx.reply('Transaction cancelled or failed.'); }
});''',
    '''    await ctx.answerCbQuery('Opening wallet...');
    connector.sendTransaction(transaction)
        .then(async () => {
            await ctx.reply("1 TON sent to the vault! Your $TOON balance will update shortly.");
        })
        .catch(async (e) => {
            logger.error('TON purchase tx failed', e);
            await ctx.reply('Transaction cancelled or failed.');
        });
});'''
)

# ── Fix 2: buy_fiat – catch jammed inside replyWithInvoice call
content = content.replace(
    '''    try {
        await ctx.replyWithInvoice({
            currency: 'USD',
            provider_token: PROVIDER_TOKEN,
            title: '💳 Buy 100 $TOON',
            description: 'Purchase 100 $TOON tokens with your debit or credit card to tip artists and claim rewards.',
            payload: 'buy_toon_fiat',
            start_parameter: 'buy_toon',
            prices: [{ label: '100 $TOON', amount: 199 }] // $1.99 USD
        } catch (e) { logger.error('Fiat invoice failed', e); await ctx.reply('Could not start payment. Please try again.'); }
        });

});''',
    '''    try {
        await ctx.replyWithInvoice({
            currency: 'USD',
            provider_token: PROVIDER_TOKEN,
            title: '💳 Buy 100 $TOON',
            description: 'Purchase 100 $TOON tokens with your debit or credit card to tip artists and claim rewards.',
            payload: 'buy_toon_fiat',
            start_parameter: 'buy_toon',
            prices: [{ label: '100 $TOON', amount: 199 }]
        });
    } catch (e) {
        logger.error('Fiat invoice failed', e);
        await ctx.reply('Could not start payment. Please try again.');
    }
});'''
)

# ── Fix 3: bug_report – return before catch, catch wrongly indented
content = content.replace(
    '''        try {
            await bot.telegram.sendMessage(adminId, report);
            await store.updateUser(telegramId, { step: null });
            await ctx.reply('✅ Report sent to @zalgorythms! Thank you for helping us improve Toon.', Markup.keyboard([
                ['🎧 Listen', '📤 Share'],
                ['⬆️ Upload', '💸 Tip'],
                ['👤 Profile', '🔗 Refer'],
                ['💎 Link Wallet', '💳 Buy $TOON'],
                ['🪲 Report Bug']
            ]).resize());

        return;
            } catch (e) { logger.error('Bug report send failed', e); await ctx.reply('Could not send report. Please try again.'); }''',
    '''        try {
            await bot.telegram.sendMessage(adminId, report);
            await store.updateUser(telegramId, { step: null });
            await ctx.reply('Report sent! Thank you for helping us improve Toon.', Markup.keyboard([
                ['🎧 Listen', '📤 Share'],
                ['⬆️ Upload', '💸 Tip'],
                ['👤 Profile', '🔗 Refer'],
                ['💎 Link Wallet', '💳 Buy $TOON'],
                ['🪲 Report Bug']
            ]).resize());
        } catch (e) {
            logger.error('Bug report send failed', e);
            await ctx.reply('Could not send report. Please try again.');
        }
        return;'''
)

# ── Fix 4: audio upload – catch jammed inside if block (outer try/catch already exists at line ~1469)
content = content.replace(
    '''        if (fileSizeMB > 50) {
            await ctx.reply('❌ File is too large. Max size is 50MB.');
            return;
        } catch (e) { logger.error('Audio upload failed', e); await ctx.reply('Audio processing failed. Please try again.'); }
        }''',
    '''        if (fileSizeMB > 50) {
            await ctx.reply('File is too large. Max size is 50MB.');
            return;
        }'''
)

open('./index.js', 'w').write(content)
print('All 4 fixes applied.')
