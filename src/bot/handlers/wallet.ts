const { Markup } = require('telegraf');
const walletService = require('../../core/services/wallet');
const logger = require('../../../logger');
const { Address } = require('@ton/core');

async function handleStartWalletLink(ctx) {
    const userId = ctx.from.id;
    const flowRes = await walletService.getOrCreateFlow(userId);
    if (!flowRes.success) return ctx.reply('❌ Error starting wallet link.');
    
    const flow = flowRes.data;
    
    // Resume or Start
    if (flow.status === 'initiated') {
        const challenge = Math.random().toString(36).slice(2); // In prod, use a better CSPRNG
        await walletService.setChallenge(flow.id, challenge);
    }

    // This is where we would normally generate a TonConnect link
    // For this refactor, we simulate the 'initiated' state.
    
    await ctx.reply(
`🔗 <b>Link Your Wallet</b>

1. Tap the button below to connect.
2. We will issue a cryptographic challenge to prove ownership.

⚠️ <i>Make sure your wallet is in Testnet mode!</i>`,
        {
            parse_mode: 'HTML',
            ...Markup.inlineKeyboard([
                [Markup.button.callback('💎 Connect Wallet', `connect_wallet_${flow.id}`)],
                [Markup.button.callback('🔄 Resume Last Flow', 'resume_wallet')]
            ])
        }
    );
}

async function handleConnectCallback(ctx) {
    const flowId = ctx.match[1];
    
    // Simulate connection from TonConnect
    const mockAddress = '0:Qas-mock-address-12345';
    await walletService.markConnected(flowId, mockAddress);
    
    await ctx.reply(`✅ <b>Wallet Connected!</b>\nAddress: <code>${mockAddress}</code>\n\nNext: Prove ownership by signing a challenge.`, {
        parse_mode: 'HTML',
        ...Markup.inlineKeyboard([
            [Markup.button.callback('✍️ Sign Challenge', `verify_wallet_${flowId}`)]
        ])
    });
}

async function handleVerifyCallback(ctx) {
    const flowId = ctx.match[1];
    
    // Simulate signature verification
    const res = await walletService.verify(flowId, 'mock_signature', 'mock_pubkey');
    
    if (res.success) {
        await ctx.reply('🎉 <b>Wallet Verified and Linked!</b>\nYour on-chain identity is now ready.', { parse_mode: 'HTML' });
    } else {
        await ctx.reply('❌ <b>Verification Failed.</b> Please try again.', { parse_mode: 'HTML' });
    }
}

module.exports = {
    handleStartWalletLink,
    handleConnectCallback,
    handleVerifyCallback
};
