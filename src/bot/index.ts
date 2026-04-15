require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const logger = require('../logger');
const store = require('../../store');

// -- Handlers
const userHandler = require('./handlers/user');
const trackHandler = require('./handlers/track');
const tipHandler = require('./handlers/tip');
const starsHandler = require('./handlers/stars');
const balanceHandler = require('./handlers/balance');
const uploadHandler = require('./handlers/upload');
const walletHandler = require('./handlers/wallet');
const adminHandler = require('./handlers/admin');
const auditWorker = require('../core/monitoring/audit_worker');
const guardrailMiddleware = require('./middleware/guardrail');

const bot = new Telegraf(process.env.BOT_TOKEN);

// ── Middleware: Stateless Context & Safety ───────────
bot.use(async (ctx, next) => {
    if (!ctx.from) return next();

    try {
        const userRes = await store.getUser(ctx.from.id);
        ctx.state.user = userRes.success ? userRes.data : null;

        await next();
    } catch (err) {
        logger.error('Middleware error', err);
    }
});

bot.use(guardrailMiddleware);

// ── Commands ──────────────────────────────────────────

bot.start(userHandler.handleStart);
bot.command('profile', userHandler.handleProfile);
bot.hears('👤 Profile', userHandler.handleProfile);

bot.command('upload', uploadHandler.handleStartUpload);
bot.hears('⬆️ Upload', uploadHandler.handleStartUpload);

bot.command('link', walletHandler.handleStartWalletLink);
bot.hears('💎 Link Wallet', walletHandler.handleStartWalletLink);

bot.command('resume', async (ctx) => {
    // Attempt to resume any active flow (Upload first)
    await uploadHandler.handleResume(ctx);
});

bot.command('listen', trackHandler.handleStartListen);
bot.hears('🎧 Listen', trackHandler.handleStartListen);

bot.command('sys_status', adminHandler.handleSystemStatus);
bot.action('sys_status', adminHandler.handleSystemStatus);
bot.action('admin_pause', adminHandler.handleAdminPause);
bot.action('admin_resume', adminHandler.handleAdminResume);

bot.action('explain_balance', balanceHandler.handleExplainBalance);

// ── Actions & Callbacks ───────────────────────────────

bot.action(/artist_(.+)/, trackHandler.handleArtistSelected);
bot.action(/play_(.+)/, trackHandler.handlePlayTrack);

// -- Upload Flows
bot.action('resume_upload', uploadHandler.handleResume);

// -- Wallet Flows
bot.action(/^connect_wallet_(.+)$/, walletHandler.handleConnectCallback);
bot.action(/^verify_wallet_(.+)$/, walletHandler.handleVerifyCallback);

// -- Tipping
bot.action(/^tip_(.+)$/, tipHandler.handleTipInitiated);
bot.action(/^tip_ton_(.+)$/, tipHandler.handleTipTonChoice);
bot.action(/^dotip_(.+)_(\d+)$/, tipHandler.handleDoTipTon);
bot.action(/^verify_tip_(.+)$/, tipHandler.handleVerifyTip);

// -- Stars/Payments
bot.action('buy_stars', starsHandler.handleBuyStars);
bot.on('pre_checkout_query', starsHandler.handlePreCheckout);
bot.on('successful_payment', starsHandler.handleSuccessfulPayment);

// ── Media Handlers ────────────────────────────────────

bot.on('audio', uploadHandler.handleAudioUpload);

// ── Text Handler ──────────────────────────────────────

bot.on('text', async (ctx) => {
    const text = ctx.message.text;
    if (text.startsWith('/')) return;
    
    const user = ctx.state.user;
    
    // Onboarding fallback
    if (!user) {
        const createRes = await store.createPendingUser(ctx.from.id, text.trim());
        if (createRes.success) {
            await ctx.reply(`🎉 Welcome to Toon, <b>${text}</b>!`, { parse_mode: 'HTML' });
            return userHandler.showMenu(ctx);
        }
    }
    
    // Delegate text to active flows (Upload has precedence)
    await uploadHandler.handleUploadMessage(ctx);
});

// ── System Export ─────────────────────────────────────
module.exports = bot;

if (require.main === module) {
    bot.launch().then(() => {
        logger.info('🚀 New Bot Entry Point Launched.');
        auditWorker.start();
    });
}
