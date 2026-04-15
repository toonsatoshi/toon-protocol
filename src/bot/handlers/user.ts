const { Markup } = require('telegraf');
const store = require('../../../store');
const logger = require('../../../logger');
const rewardService = require('../../core/services/reward');

async function handleStart(ctx) {
    const telegramId = ctx.from.id;
    const user = ctx.state.user;
    const param = ctx.startPayload;

    if (user) {
        return showMenu(ctx);
    }

    // New User Onboarding
    let referredBy = null;
    if (param && param.startsWith('ref_')) {
        const refCode = param.replace('ref_', '');
        const referrerRes = await store.getUserByReferralCode(refCode);
        if (referrerRes.success) {
            referredBy = referrerRes.data.telegramId;
            logger.info('Referral detected', { telegramId, referredBy, refCode });
        }
    }

    // Capture initial state in context if needed, but since we are stateless,
    // we just ask for the artist name first.
    await ctx.reply(
`🎵 <b>Welcome to Toon! (TESTNET)</b>

The decentralized music economy on TON.

━━━━━━━━━━━━━━━
What should we call you on Toon? 🎤

(This will be your artist and listener name)`, { parse_mode: 'HTML' }
    );
    
    // In a real refactor, we would set a 'step' in a temporary state or DB.
    // For now, the 'text' handler in index.ts will catch the next message if user doesn't exist.
}

async function handleProfile(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.reply('❌ Please /start first.');

    const refsRes = await store.getReferrals(ctx.from.id);
    const refs = refsRes.success ? refsRes.data : [];
    
    const trackList = user.uploadedTracks.length > 0
        ? user.uploadedTracks.map((t, i) =>
            `${i + 1}. ${t.title} (▶️ ${t.plays || 0})`
          ).join('\n')
        : 'No tracks yet';

    const profileMsg = `
👤 <b>${user.artistName}</b> (TESTNET)
${user.onChain ? '✅ On-chain identity' : '⏳ Pending on-chain'}

⭐ Reputation: <b>${user.reputation}</b>
💰 $TOON: <b>${user.toonBalance}</b>
🔥 Streak: <b>${user.listeningStreak} days</b>
👥 Referrals: <b>${refs.length}</b>

💎 Wallet: ${user.walletAddress ? `<code>${user.walletAddress.slice(0, 8)}...${user.walletAddress.slice(-8)}</code>` : '❌ Not linked'}

🎵 <b>My Tracks:</b>
${trackList}
    `;

    await ctx.reply(profileMsg, {
        parse_mode: 'HTML',
        ...Markup.inlineKeyboard([
            [Markup.button.callback('💰 Explain My Balance', 'explain_balance')],
            [Markup.button.callback('🔄 Refresh', 'show_profile')],
            [Markup.button.callback('🔗 Referral Link', 'refer_info')]
        ])
    });
}

async function handleReferInfo(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.reply('❌ Please /start first.');

    const refsRes = await store.getReferrals(user.telegramId);
    const refs = refsRes.success ? refsRes.data : [];
    const uploaded = refs.filter(r => r.uploadedAt).length;

    await ctx.reply(
`🔗 <b>Your Referral Link</b>

Share this with friends to earn $TOON!
<code>https://t.me/${ctx.botInfo.username}?start=ref_${user.referralCode}</code>

👥 Friends signed up: ${refs.length}
🎵 Friends uploaded: ${uploaded}

🎁 <b>Rewards:</b>
✅ Friend signs up → +5 $TOON
🎵 Friend uploads → +25 $TOON
▶️ Friend's track hits 5 plays → +50 $TOON`,
        {
            parse_mode: 'HTML',
            ...Markup.inlineKeyboard([
                [Markup.button.url('Share Your Link',
                    `https://t.me/share/url?url=https://t.me/${ctx.botInfo.username}?start=ref_${user.referralCode}&text=Join me on Toon — the music platform on TON 🎵`
                )],
                [Markup.button.callback('🔙 Back to Profile', 'show_profile')]
            ])
        }
    );
}

async function showMenu(ctx) {
    await ctx.reply(
`Welcome back, <b>${ctx.state.user.artistName}</b>! 🎵`,
        {
            parse_mode: 'HTML',
            ...Markup.keyboard([
                ['🎧 Listen', '📤 Share'],
                ['⬆️ Upload', '💸 Tip'],
                ['👤 Profile', '🔗 Refer'],
                ['💎 Link Wallet', '💳 Buy $TOON'],
                ['🪲 Report Bug']
            ]).resize()
        }
    );
}

module.exports = {
    handleStart,
    handleProfile,
    handleReferInfo,
    showMenu
};
