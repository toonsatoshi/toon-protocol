require('dotenv').config();
require('ts-node').register({ transpileOnly: true }); // Enable direct loading of .ts files, skipping type checks
const { Telegraf, Markup } = require('telegraf');
const { Address, toNano, beginCell } = require('@ton/core');
const store = require('./store');
const logger = require('./logger');
const axios = require('axios');
const NodeID3 = require('node-id3');
const fs = require('fs');
const { validateEnvironment } = require('./config');

// Point to the .ts build artifact
const { ToonArtist } = require('../../build/ToonArtist/ToonArtist_ToonArtist');
const { ToonVault } = require('../../build/ToonVault/ToonVault_ToonVault');
const { ToonRegistry } = require('../../build/ToonRegistry/ToonRegistry_ToonRegistry');
const { MusicNft } = require('../../build/MusicNft/MusicNft_MusicNft');
const { TonClient, WalletContractV4, internal } = require('@ton/ton');
const { mnemonicToPrivateKey } = require('@ton/crypto');
const TonConnect = require('@tonconnect/sdk');

const bot = new Telegraf(process.env.BOT_TOKEN, { handlerTimeout: 300000 });
const deploymentInProgress = new Set();
const STORAGE_CHANNEL_ID = process.env.STORAGE_CHANNEL_ID;

// ── Payment Provider ──────────────────────────────────
const PROVIDER_TOKEN = process.env.PAYMENT_PROVIDER_TOKEN;

// ── TON Connect Setup ────────────────────────────────
class TonConnectStorage {
    constructor(telegramId) {
        this.telegramId = telegramId;
    }
    async removeItem(key) {
        const user = await store.getUser(this.telegramId);
        if (user && user.connectorData) {
            delete user.connectorData[key];
            await store.updateUser(this.telegramId, { connectorData: user.connectorData });
        }
    }
    async setItem(key, value) {
        const user = await store.getUser(this.telegramId);
        const data = user?.connectorData || {};
        data[key] = value;
        await store.updateUser(this.telegramId, { connectorData: data });
    }
    async getItem(key) {
        const user = await store.getUser(this.telegramId);
        return user?.connectorData?.[key] || null;
    }
}

const connectors = new Map();
const unsubscribers = new Map();

async function getConnector(telegramId) {
    if (connectors.has(telegramId)) {
        return connectors.get(telegramId);
    }
    const connector = new TonConnect.TonConnect({
        manifestUrl: runtimeConfig.tonConnectManifestUrl,
        storage: new TonConnectStorage(telegramId),
        disableAnalytics: true,
        logger: {
            debug: (...args) => {}, // Silence debug logs
            info: (...args) => {},  // Silence info logs
            warn: (...args) => logger.warn('TonConnect SDK warning', ...args),
            error: (...args) => {
                // Only log if it's not the annoying analytics or empty storage error
                const msg = args.join(' ');
                if (msg.includes('Analytics API error') || msg.includes('nothing is stored')) {
                    return;
                }
                logger.error('TonConnect SDK error', ...args);
            }
        }
    });
    
    // Set in map immediately to prevent race conditions during async restore
    connectors.set(telegramId, connector);
    
    try {
        await connector.restoreConnection();
    } catch (e) {
        logger.error('Failed to restore connection', { telegramId, error: e.message });
    }
    
    return connector;
}


async function requireWalletConnected(ctx, connector, telegramId) {
    if (connector.connected) return true;
    const getWallets = (TonConnect.getWallets || TonConnect.TonConnect.getWallets).bind(TonConnect.TonConnect);
    let telegramWallet;
    try {
        const walletList = await getWallets();
        telegramWallet = walletList.find(w => w.appName === 'telegram-wallet' || w.name === 'Wallet' || w.bridgeUrl?.includes(runtimeConfig.tonConnectBridgeUrl));
    } catch (e) {}
    if (!telegramWallet) {
        telegramWallet = { bridgeUrl: runtimeConfig.tonConnectBridgeUrl, universalLink: runtimeConfig.tonConnectUniversalLink };
    }
    let connectUrl = connector.connect({ universalLink: telegramWallet.universalLink, bridgeUrl: telegramWallet.bridgeUrl });
    const botUsername = ctx.botInfo?.username || process.env.BOT_USERNAME || 'toon_music_bot';
    const returnUrl = `https://t.me/${botUsername}?start=wallet_connected`;
    if (connectUrl.startsWith('https://t.me/') && !connectUrl.includes('ret=')) connectUrl += `&ret=${botUsername}`;
    if (!connectUrl.includes('return_url=')) connectUrl += `&return_url=${encodeURIComponent(returnUrl)}`;
    await ctx.reply('👛 Connect your Telegram Wallet to continue.',
        Markup.inlineKeyboard([[Markup.button.url('👛 Connect Telegram Wallet', connectUrl)]])
    );
    return false;
}

// ── TON Client & Wallet Setup ────────────────────────
const apiKey = (process.env.TONCENTER_API_KEY && process.env.TONCENTER_API_KEY.length > 10) 
    ? process.env.TONCENTER_API_KEY.trim() 
    : undefined;

const runtimeConfig = validateEnvironment();
const VAULT_ADDRESS_ENV = runtimeConfig.toonVaultAddress ? runtimeConfig.toonVaultAddress.trim() : null;
const REGISTRY_ADDRESS_ENV = runtimeConfig.toonRegistryAddress ? runtimeConfig.toonRegistryAddress.trim() : null;

if (apiKey) {
    logger.info(`Using TONCENTER_API_KEY starting with: ${apiKey.slice(0, 4)}...`);
} else {
    logger.info('No TONCENTER_API_KEY found, using public endpoint limits.');
}

let client = new TonClient({
    endpoint: runtimeConfig.tonEndpoint,
    apiKey: apiKey
});

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function retry(fn, retries = 3, delay = 2000) {
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (err) {
            if (i === retries - 1) throw err;
            
            const status = err.response?.status;
            if (status === 429) {
                logger.warn(`Rate limit (429) hit, retrying in ${delay}ms... (${i + 1}/${retries})`);
                await sleep(delay);
                delay *= 2; 
            } else if (status === 401) {
                logger.error('Unauthorized (401). Disabling API key and retrying once...');
                // Fallback: Re-init client without API key for this session
                client = new TonClient({
                    endpoint: runtimeConfig.tonEndpoint
                });
                await sleep(1000);
            } else {
                throw err;
            }
        }
    }
}

async function getDeployer() {
    const mnemonic = runtimeConfig.walletMnemonic;
    if (!mnemonic) {
        throw new Error('WALLET_MNEMONIC not set in .env. Please provide a 24-word seed phrase.');
    }
    const key = await mnemonicToPrivateKey(mnemonic.trim().split(/\s+/));
    const wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });
    const contract = client.open(wallet);
    return { contract, key };
}

// ── Bot-level reward idempotency ─────────────────────────────────────────────
// Prevents duplicate on-chain calls when the bot restarts mid-flight or
// when multiple message handlers race to the same reward trigger.
// Key: `${telegramId}:${rewardId}:${utcDay}` — mirrors vault nonce key logic.
// Note: this is in-memory only; the vault's on-chain nonce map is the source
// of truth. This layer only saves unnecessary RPC calls.
const _rewardNonces = new Map();

function _rewardNonceKey(telegramId, rewardId) {
    const utcDay = Math.floor(Date.now() / 86400000);
    return `${telegramId}:${rewardId}:${utcDay}`;
}

// Per-user claim cooldown (bot layer mirrors vault CLAIM_COOLDOWN_SECONDS=300).
const _lastClaimTime = new Map();
const CLAIM_COOLDOWN_MS = 310_000; // 5m10s — slightly longer than vault to absorb latency

// ── Oracle signing ───────────────────────────────────────────────────────────
//
//  The vault now requires every ClaimReward to carry an Ed25519 signature
//  from the oracle key.  The oracle key is separate from the deployer wallet.
//
//  Environment:
//    ORACLE_SEED_HEX  — 32-byte hex seed for the oracle Ed25519 keypair.
//                       Generate once with: node -e "const {randomBytes}=require('crypto');
//                       console.log(randomBytes(32).toString('hex'))"
//    ORACLE_PUBLIC_KEY_HEX — corresponding 32-byte public key (for vault init).
//
//  The oracle private key MUST be kept secret.  Rotate it via SetOracleKey if
//  compromised.  A rotated key invalidates in-flight signed payloads (fine,
//  since they expire in 5 minutes anyway).
//
const { sign: ed25519Sign, keyPairFromSeed } = require('@ton/crypto');
const { beginCell: _beginCell } = require('@ton/core');
const _crypto = require('crypto');

let _oracleKeyPair = null;

function getOracleKeyPair() {
    if (_oracleKeyPair) return _oracleKeyPair;
    const seedHex = process.env.ORACLE_SEED_HEX;
    if (!seedHex || seedHex.length !== 64) {
        throw new Error('ORACLE_SEED_HEX must be a 64-char hex string (32 bytes). ' +
            'Generate: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
    }
    _oracleKeyPair = keyPairFromSeed(Buffer.from(seedHex, 'hex'));
    return _oracleKeyPair;
}

// Expose the oracle public key as a BigInt for contract init / SetOracleKey.
function getOraclePublicKeyBigInt() {
    const kp = getOracleKeyPair();
    return BigInt('0x' + Buffer.from(kp.publicKey).toString('hex'));
}

// Build and sign the canonical payload that the vault verifies on-chain.
// Layout MUST match the `verifyOracleSignature` function in toon_vault.tact:
//   storeUint(telegramId, 64) + storeAddress(walletAddress) +
//   storeUint(rewardId, 8) + storeUint(walletAgeDays, 32) +
//   storeBool(hasVibeStreak) + storeCoins(tipAmount) +
//   storeUint(nonce, 64) + storeUint(expiry, 32)
function signRewardPayload({ telegramId, walletAddress, rewardId, walletAgeDays, hasVibeStreak, tipAmount, nonce, expiry }) {
    const payload = _beginCell()
        .storeUint(BigInt(telegramId), 64)
        .storeAddress(Address.parse(walletAddress.trim()))
        .storeUint(BigInt(rewardId), 8)
        .storeUint(BigInt(walletAgeDays), 32)
        .storeBit(hasVibeStreak ? 1 : 0)
        .storeCoins(BigInt(tipAmount || 0))
        .storeUint(BigInt(nonce), 64)
        .storeUint(BigInt(expiry), 32)
        .endCell();

    const hash = payload.hash(); // Buffer, 32 bytes
    const kp   = getOracleKeyPair();
    const sig  = ed25519Sign(hash, kp.secretKey); // Buffer, 64 bytes

    return {
        sigHigh: BigInt('0x' + sig.slice(0, 32).toString('hex')),
        sigLow:  BigInt('0x' + sig.slice(32, 64).toString('hex')),
    };
}

// Generate a random 64-bit nonce.
function generateNonce() {
    const buf = _crypto.randomBytes(8);
    return BigInt('0x' + buf.toString('hex'));
}

async function claimOnChainReward(telegramId, walletAddress, rewardId, opts = {}) {
    if (!VAULT_ADDRESS_ENV) {
        logger.error('TOON_VAULT_ADDRESS not set in .env');
        return;
    }
    if (!walletAddress) {
        logger.error('No walletAddress provided for claimOnChainReward');
        return;
    }

    // ── Bot-level nonce check (fast path before hitting RPC) ─────────────────
    const nKey = _rewardNonceKey(telegramId, rewardId);
    if (_rewardNonces.has(nKey)) {
        logger.warn('Reward already dispatched today (bot nonce)', { telegramId, rewardId });
        return;
    }

    // ── Bot-level cooldown check ──────────────────────────────────────────────
    const lastClaim = _lastClaimTime.get(String(telegramId));
    if (lastClaim && Date.now() - lastClaim < CLAIM_COOLDOWN_MS) {
        logger.warn('Claim cooldown active (bot layer)', { telegramId, rewardId });
        return;
    }

    // ── Compute real walletAgeDays from stored createdAt ─────────────────────
    // Replaces the hardcoded 30n that was always sent regardless of actual age.
    let walletAgeDays = 0n;
    try {
        const user = await store.getUser(telegramId);
        if (user && user.createdAt) {
            const createdMs = new Date(user.createdAt).getTime();
            const ageMs     = Date.now() - createdMs;
            walletAgeDays   = BigInt(Math.floor(ageMs / 86400000));
        }
    } catch (e) {
        logger.warn('Could not compute walletAgeDays, defaulting to 0', { telegramId, error: e.message });
    }

    // ── Compute hasVibeStreak from stored streak ──────────────────────────────
    // Replaces the hardcoded false that disabled the multiplier for everyone.
    // Threshold: 7+ consecutive daily listen days qualifies for the vibe bonus.
    const STREAK_THRESHOLD = 7;
    let hasVibeStreak = false;
    try {
        const user = opts.user || await store.getUser(telegramId);
        hasVibeStreak = (user && (user.listeningStreak || 0) >= STREAK_THRESHOLD);
    } catch (e) {
        logger.warn('Could not compute hasVibeStreak, defaulting to false', { telegramId, error: e.message });
    }

    // ── Mark nonce before sending (prevent double-dispatch on retry) ──────────
    _rewardNonces.set(nKey, true);
    _lastClaimTime.set(String(telegramId), Date.now());

    await retry(async () => {
        const { contract, key } = await getDeployer();
        const vaultAddr = Address.parse(VAULT_ADDRESS_ENV);
        const vault = client.open(ToonVault.fromAddress(vaultAddr));

        logger.info('Claiming on-chain reward', {
            telegramId, rewardId, walletAddress, walletAgeDays: Number(walletAgeDays), hasVibeStreak
        });

        // Build oracle-signed payload.
        const nonce  = generateNonce();
        const expiry = Math.floor(Date.now() / 1000) + 270; // 4m30s — within vault's 5-min window

        const { sigHigh, sigLow } = signRewardPayload({
            telegramId,
            walletAddress,
            rewardId,
            walletAgeDays:  Number(walletAgeDays),
            hasVibeStreak,
            tipAmount:      opts.tipAmount || 0,
            nonce,
            expiry,
        });

        await vault.send(contract.sender(key.secretKey), {
            value:  toNano('0.05'),
            bounce: true,
        }, {
            $$type:        'ClaimReward',
            walletAddress: Address.parse(walletAddress.trim()),
            rewardId:      BigInt(rewardId),
            telegramId:    BigInt(telegramId),
            walletAgeDays: walletAgeDays,
            hasVibeStreak: hasVibeStreak,
            tipAmount:     BigInt(opts.tipAmount || 0),
            nonce:         nonce,
            expiry:        BigInt(expiry),
            sigHigh:       sigHigh,
            sigLow:        sigLow,
        });
    }).catch(err => {
        // On failure: clear the nonce so a retry from a different code path can succeed.
        _rewardNonces.delete(nKey);
        _lastClaimTime.delete(String(telegramId));
        logger.error('claimOnChainReward failed', { telegramId, rewardId, error: err.message });
        throw err;
    });
}

// Middleware for logging every incoming update
bot.use(async (ctx, next) => {
    const start = Date.now();
    try {
        await next();
        const ms = Date.now() - start;
        logger.debug('Update processed', {
            update_id: ctx.update.update_id,
            type: ctx.updateType,
            from: ctx.from?.id,
            username: ctx.from?.username,
            duration: `${ms}ms`
        });
    } catch (err) {
        logger.error('Update processing failed', err);
        try {
            await ctx.reply('❌ An internal error occurred. Please try again later.');
        } catch (replyErr) {
            logger.error('Failed to send error reply', replyErr);
        }
    }
});

bot.catch((err, ctx) => {
    logger.error('Telegraf unhandled error', { 
        err: err.message, 
        stack: err.stack, 
        update: ctx.update 
    });
});

// ── Admin Middleware ──────────────────────────────────
const adminOnly = async (ctx, next) => {
    if (ctx.from.id != process.env.ADMIN_CHAT_ID) {
        return ctx.reply('⚙️ This feature isn\'t available yet.');
    }
    return next();
};

// ── /start ────────────────────────────────────────────
bot.start(async (ctx) => {
    const param = ctx.startPayload;
    const telegramId = ctx.from.id;
    logger.info('/start command received', { telegramId, param });
    
    let user = await store.getUser(telegramId);

    // Deep link to track
    if (param && param.startsWith('track_')) {
        const trackId = param.replace('track_', '');
        logger.info('Deep link to track detected', { telegramId, trackId });
        const track = await store.getTrack(trackId);
        if (track) {
            await store.incrementPlayCount(trackId, telegramId);
            const milestone = await store.checkPlayMilestone(trackId);
            if (milestone) {
                await bot.telegram.sendMessage(milestone.referrerId, 
                    `🎉 ${milestone.artistName}'s track hit 5 unique listeners! +50 $TOON earned! (TESTNET)`)
                    .catch(e => logger.error('Milestone notification failed', { referrerId: milestone.referrerId, error: e.message }));
                
                if (milestone.referrerWallet) {
                    claimOnChainReward(milestone.referrerId, milestone.referrerWallet, 2)
                        .catch(e => logger.error('Milestone on-chain reward failed', e));
                }
            }
            const isOwner = track.artistId == telegramId;
            await ctx.reply(
`🎧 Now Playing

🎵 ${track.title}
👤 ${track.artistName}
🎸 ${track.genre}
▶️ ${track.plays || 0} plays`,
                Markup.inlineKeyboard([
                    [Markup.button.callback('▶️ Play', `play_${trackId}`)],
                    [Markup.button.callback('💸 Tip Artist', `tip_${trackId}`)],
                    ...(isOwner ? [[Markup.button.callback('🗑 Delete Track', `del_confirm_${trackId}`)]] : [])
                ])
            );
            await ctx.replyWithAudio(track.fileId, {
                title: track.title,
                performer: track.artistName
            });
            return;
        } else {
            logger.warn('Track not found for deep link', { trackId });
        }
    }

    // Referral code at signup
    let referredBy = null;
    if (param) {
        if (param.startsWith('ref_')) {
            const refCode = param.replace('ref_', '');
            const referrer = await store.getUserByReferralCode(refCode);
            if (referrer) {
                referredBy = referrer.telegramId;
                logger.info('Referral detected', { telegramId, referredBy, refCode });
            } else {
                logger.warn('Invalid referral code', { refCode });
            }
        } else if (param === 'wallet_connected') {
            logger.info('Returned from wallet connection', { telegramId });
            if (user) {
                return ctx.reply('✅ Welcome back! Your wallet is now linked to Toon.');
            }
        }
    }

    if (!user) {
        logger.info('New user onboarding started', { telegramId });
        // Bug E Fix: Store referredBy in DB immediately to prevent session loss on restart
        await store.createPendingUser(telegramId, null, referredBy);

        return ctx.reply(
`🎵 Welcome to Toon!

The newest way to share music and earn crypto — right inside Telegram.

Powered by The Open Network. ⚡

━━━━━━━━━━━━━━━
🚀 We're Building Something Big

Toon is looking for a few founding contributors to help shape the future of music on TON. Compensation is in $TOON — early, meaningful, and yours.

Open roles:
⛓ TON/Tact Smart Contract Developer
📣 Community Manager (Telegram/CT native)
🖥 Frontend Dev (Mini App — future phase)

Interested? Reach out: @zalgorythms

━━━━━━━━━━━━━━━
What should we call you on Toon? 🎤

(This will be your artist and listener name)`
        );
    }

    await showMenu(ctx, user);
});

const showMenu = async (ctx, user) => {
    if (!user) user = await store.getUser(ctx.from.id);
    logger.info('Showing main menu', { telegramId: ctx.from.id });
    await ctx.reply(
`Hey ${user.artistName}! 🎵`,
        Markup.keyboard([
            ['🎧 Listen', '📤 Share'],
            ['⬆️ Upload', '💸 Tip'],
            ['👤 Profile', '🔗 Refer'],
            ['💎 Link Wallet', '💳 Buy $TOON'],
            ['🪲 Report Bug']
        ]).resize()
    );
};

// ── Wallet Linking ────────────────────────────────────
bot.hears('💎 Link Wallet', async (ctx) => {
    const telegramId = ctx.from.id;
    const user = await store.getUser(telegramId);
    if (!user) return ctx.reply('Send /start first!');
    
    logger.info('Wallet link flow started', { telegramId });
    
    const connector = await getConnector(telegramId);

    if (connector.connected) {
        const addr = Address.parse(connector.account.address).toString();
        await store.setWalletAddress(telegramId, addr);
        return ctx.reply(`✅ Wallet already linked: \`${addr}\`\n\nTo change it, /disconnect first.`, { parse_mode: 'Markdown' });
    }

    // Clean up existing listener if any
    if (unsubscribers.has(telegramId)) {
        unsubscribers.get(telegramId)();
    }

    const unsubscribe = connector.onStatusChange(async (wallet) => {
        try {
            if (wallet) {
                const addr = Address.parse(wallet.account.address).toString();
                await store.updateUser(telegramId, { walletAddress: addr });
                logger.info('Wallet linked via onStatusChange', { telegramId, addr });
                
                // Trigger on-chain welcome reward (REWARD_EARLY_BELIEVER = 6).
                claimOnChainReward(telegramId, addr, 6)
                    .catch(e => logger.error('Early Believer reward failed', e));

                await bot.telegram.sendMessage(telegramId, 
    `✅ Wallet Connected!

You've earned a one-time **Early Believer** reward! 🎁

Your wallet has been linked to Toon. You're ready to tip artists, buy $TOON, and deploy your on-chain identity.`,
                    { 
                        parse_mode: 'Markdown',
                        ...Markup.inlineKeyboard([
                            [Markup.button.callback('👤 View Profile', 'show_profile')]
                        ])
                    }
                );
                
                unsubscribe();
                unsubscribers.delete(telegramId);
            }
        } catch (e) {
            logger.error('Error in onStatusChange callback', e);
        }
    });
    unsubscribers.set(telegramId, unsubscribe);

    const getWallets = (TonConnect.getWallets || TonConnect.TonConnect.getWallets).bind(TonConnect.TonConnect);
    let telegramWallet;
    try {
        const walletList = await getWallets();
        telegramWallet = walletList.find(w => w.appName === 'telegram-wallet' || w.name === 'Wallet' || w.bridgeUrl.includes(runtimeConfig.tonConnectBridgeUrl));
    } catch (e) {
        logger.error('Failed to fetch wallet list, using fallback', e);
    }
    
    if (!telegramWallet) {
        telegramWallet = {
            bridgeUrl: runtimeConfig.tonConnectBridgeUrl,
            universalLink: runtimeConfig.tonConnectUniversalLink
        };
    }

    let connectUrl = connector.connect({
        universalLink: telegramWallet.universalLink,
        bridgeUrl: telegramWallet.bridgeUrl
    });
    
    const botUsername = ctx.botInfo?.username || process.env.BOT_USERNAME || 'toon_music_bot';
    const returnUrl = `https://t.me/${botUsername}?start=wallet_connected`;

    // Ensure the user is redirected back to the bot after connecting
    if (connectUrl.startsWith('https://t.me/')) {
        const separator = connectUrl.includes('?') ? '&' : '?';
        if (!connectUrl.includes('ret=')) {
            connectUrl += `${separator}ret=${botUsername}`;
        }
    }
    
    // Add return_url for all wallets (standard TON Connect 2.0)
    if (!connectUrl.includes('return_url=')) {
        const separator = connectUrl.includes('?') ? '&' : '?';
        connectUrl += `${separator}return_url=${encodeURIComponent(returnUrl)}`;
    }

    await ctx.reply(
`💎 Link Your Telegram Wallet

Click the button below to connect your built-in Telegram Wallet.

This allows you to:
1. Receive tips from fans
2. Deploy your Artist Identity
3. Claim $TOON rewards securely

Connection will sync automatically once you approve in the wallet.`,
        Markup.inlineKeyboard([
            [Markup.button.url('👛 Connect Telegram Wallet', connectUrl)]
        ])
    );
});

bot.command('disconnect', async (ctx) => {
    const telegramId = ctx.from.id;
    const connector = await getConnector(telegramId);
    await connector.disconnect();
    
    // Clean up listeners
    if (unsubscribers.has(telegramId)) {
        unsubscribers.get(telegramId)();
        unsubscribers.delete(telegramId);
    }
    
    await store.updateUser(telegramId, { walletAddress: null, connectorData: null });
    await ctx.reply('❌ Wallet disconnected.');
});

// ── Profile ───────────────────────────────────────────
const showProfile = async (ctx) => {
    const telegramId = ctx.from.id;
    const user = await store.getUser(telegramId);
    logger.info('Showing profile', { telegramId });
    if (!user) return ctx.reply('Send /start first!');

    const refs = await store.getReferrals(telegramId);
    const trackList = user.uploadedTracks.length > 0
        ? user.uploadedTracks.map((t, i) =>
            `${i + 1}. ${t.title} (▶️ ${t.plays || 0} plays)`
          ).join('\n')
        : 'No tracks yet';

    await ctx.reply(
`👤 ${user.artistName} (TESTNET)
${user.onChain ? '✅ On-chain identity' : '⏳ Pending on-chain (upload a track)'}

⭐ Reputation: ${user.reputation}
💎 Wallet: ${user.walletAddress ? `Connected ✅ (${user.walletAddress.slice(0, 4)}...${user.walletAddress.slice(-4)})` : 'Not connected ❌'}
💰 $TOON (TESTNET): ${user.toonBalance}
🎵 Tracks: ${user.tracksUploaded}
💸 Tips Sent: ${user.tipsSent}
🔥 Streak: ${user.listeningStreak} days
👥 Referrals: ${refs.length}
🔗 Your code: ${user.referralCode}

🎁 Testnet $TOON will be redeemable 1:1 on Mainnet!

🎵 My Tracks:
${trackList}`,
        Markup.inlineKeyboard([
            ...(user.uploadedTracks.length > 0 ? [[Markup.button.callback('🗑 Manage Tracks', 'manage_tracks')]] : []),
            [Markup.button.callback('🔄 Refresh', 'show_profile'), Markup.button.callback('⚠️ Delete Account', 'delete_account_warn')],
            [Markup.button.url('🪲 Report Bug', 'https://github.com/toonsatoshi/toon-protocol/issues')]
        ])
    );
};

bot.action('delete_account_warn', async (ctx) => {
    await ctx.reply(
`⚠️ **Delete Account**

Are you sure you want to delete your account? This action is permanent and cannot be undone.

- All your $TOON balance will be lost.
- Your artist identity and tracks will remain on-chain but will no longer be linked to your Telegram account.
- You will lose all your referrals and reputation.`,
        {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
                [Markup.button.callback('❌ Cancel', 'show_profile')],
                [Markup.button.callback('🗑 Yes, Delete My Account', 'confirm_delete')]
            ])
        }
    );
});

bot.action('confirm_delete', async (ctx) => {
    const telegramId = ctx.from.id;
    await store.updateUser(telegramId, { step: 'delete_reason' });
    await ctx.reply(
`🗑 **Final Confirmation**

Your account will be deleted now. Before you go, could you please tell us why you are leaving? (Optional)

Type your reason below or tap the button to skip and delete immediately.`,
        {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
                [Markup.button.callback('⏩ Skip and Delete', 'final_delete_skip')]
            ])
        }
    );
});

const executeDeletion = async (ctx, telegramId, reason = 'No reason provided') => {
    const user = await store.getUser(telegramId);
    if (!user) return;

    const adminId = process.env.ADMIN_CHAT_ID;
    const notification = `🗑 **Account Deleted**\n\nFrom: ${user.artistName} (@${ctx.from.username || 'N/A'})\nID: ${telegramId}\n\nReason:\n${reason}`;

    try {
        await store.deleteUser(telegramId);
        if (adminId) {
            await bot.telegram.sendMessage(adminId, notification);
        }
        await ctx.reply('Your account has been deleted. You can always /start again if you change your mind.', Markup.removeKeyboard());
    } catch (e) {
        logger.error('Deletion failed', e);
        await ctx.reply('Something went wrong during deletion. Please try again.');
    }

};

bot.action('final_delete_skip', async (ctx) => {
    await executeDeletion(ctx, ctx.from.id);
});

bot.hears('🪲 Report Bug', async (ctx) => {
    const telegramId = ctx.from.id;
    const user = await store.getUser(telegramId);
    if (!user) return ctx.reply('Send /start first!');

    await store.updateUser(telegramId, { step: 'bug_report' });
    await ctx.reply(
`🪲 Report a Bug

Found something broken? We're in active development!

Please describe the bug below. Include what you were doing and what happened.

Your report will be sent directly to @zalgorythms. 🎵`,
        Markup.keyboard([
            ['❌ Cancel']
        ]).resize()
    );
});

bot.command('profile', showProfile);
bot.hears('👤 Profile', showProfile);
bot.action('show_profile', showProfile);

// ── Manage Tracks ─────────────────────────────────────
bot.action('manage_tracks', async (ctx) => {
    const user = await store.getUser(ctx.from.id);
    if (!user || user.uploadedTracks.length === 0) return ctx.answerCbQuery('No tracks to manage');
    
    await ctx.answerCbQuery();
    await ctx.reply('🗑 Select a track to delete:', 
        Markup.inlineKeyboard(
            user.uploadedTracks.map(t => [
                Markup.button.callback(`❌ Delete "${t.title}"`, `del_confirm_${t.id}`)
            ])
        )
    );
});

bot.action(/del_confirm_(.+)/, async (ctx) => {
    const trackId = ctx.match[1];
    const track = await store.getTrack(trackId);
    if (!track) return ctx.answerCbQuery('Track not found');
    
    await ctx.answerCbQuery();
    await ctx.reply(`⚠️ Are you sure you want to delete "${track.title}"?\n\nThis cannot be undone.`,
        Markup.inlineKeyboard([
            [Markup.button.callback('✅ Yes, Delete', `del_exec_${trackId}`)],
            [Markup.button.callback('❌ Cancel', 'manage_tracks')]
        ])
    );
});

bot.action(/del_exec_(.+)/, async (ctx) => {
    const trackId = ctx.match[1];
    const success = await store.deleteTrack(ctx.from.id, trackId);
    
    if (success) {
        logger.info('Track deleted', { telegramId: ctx.from.id, trackId });
        await ctx.answerCbQuery('Track deleted');
        await ctx.reply('✅ Track has been removed from Toon.');
        await showProfile(ctx);
    } else {
        logger.warn('Failed to delete track', { telegramId: ctx.from.id, trackId });
        await ctx.answerCbQuery('Failed to delete track');
    }
});

// ── Refer ─────────────────────────────────────────────
const showReferral = async (ctx) => {
    const telegramId = ctx.from.id;
    const user = await store.getUser(telegramId);
    logger.info('Showing referral info', { telegramId });
    if (!user) return ctx.reply('Send /start first!');

    const refs = await store.getReferrals(telegramId);
    const uploaded = refs.filter(r => r.uploadedAt).length;

    await ctx.reply(
`🔗 Your Referral Link

Share this with friends:
https://t.me/${ctx.botInfo.username}?start=ref_${user.referralCode}

👥 Friends signed up: ${refs.length}
🎵 Friends uploaded: ${uploaded}

🎁 Rewards:
✅ Friend signs up → +5 $TOON
🎵 Friend uploads → +25 $TOON
▶️ Friend's track hits 5 plays → +50 $TOON

Earn rewards as your referrals grow on Toon!`,
        Markup.inlineKeyboard([
            [Markup.button.url('Share Your Link',
                `https://t.me/share/url?url=https://t.me/${ctx.botInfo.username}?start=ref_${user.referralCode}&text=Join me on Toon — the music platform on TON 🎵`
            )]
        ])
    );
};

bot.command('refer', showReferral);
bot.hears('🔗 Refer', showReferral);

// ── Listen ────────────────────────────────────────────
const startListen = async (ctx) => {
    const telegramId = ctx.from.id;
    const artists = await store.getAllArtists();
    logger.info('Listen flow started', { telegramId });
    if (artists.length === 0) {
        return ctx.reply(
`🎵 No artists on Toon yet!
Be the first — hit ⬆️ Upload`
        );
    }

    await ctx.reply(
`🎧 Who do you want to listen to?`,
        Markup.inlineKeyboard(
            artists.map(a => [
                Markup.button.callback(
                    `👤 ${a.artistName} (${a.uploadedTracks.length} track${a.uploadedTracks.length !== 1 ? 's' : ''})`,
                    `artist_${a.telegramId}`
                )
            ])
        )
    );
};

bot.command('listen', startListen);
bot.hears('🎧 Listen', startListen);

bot.action(/artist_(.+)/, async (ctx) => {
    const artistId = ctx.match[1];
    logger.info('Artist callback received', { telegramId: ctx.from.id, artistId });
    const artist = await store.getUser(artistId);
    
    if (!artist) {
        logger.warn('Artist not found in store', { artistId });
        return ctx.answerCbQuery('Artist not found');
    }
    
    if (!artist.uploadedTracks || artist.uploadedTracks.length === 0) {
        logger.warn('Artist has no tracks', { artistId, artistName: artist.artistName });
        return ctx.answerCbQuery('No tracks found');
    }

    await ctx.answerCbQuery();
    await ctx.reply(
`👤 ${artist.artistName}'s Tracks`,
        Markup.inlineKeyboard(
            artist.uploadedTracks.map(t => [
                Markup.button.callback(
                    `🎵 ${t.title} (▶️ ${t.plays || 0})`,
                    `play_${t.id}`
                )
            ])
        )
    );
});

bot.action(/play_(.+)/, async (ctx) => {
    const trackId = ctx.match[1];
    const track = await store.getTrack(trackId);
    logger.info('Play track action', { telegramId: ctx.from.id, trackId });
    if (!track) return ctx.answerCbQuery('Track not found');
    await ctx.answerCbQuery();

    await store.incrementPlayCount(trackId, ctx.from.id);

    const milestone = await store.checkPlayMilestone(trackId);
    if (milestone) {
        // await ensures errors surface in logs rather than silently failing.
        await bot.telegram.sendMessage(milestone.referrerId,
            `🎉 ${milestone.artistName}'s track reached 5 unique listeners! +50 $TOON earned!`
        ).catch(e => logger.error('Milestone notification failed', { referrerId: milestone.referrerId, error: e.message }));
        // Trigger on-chain reward for the referrer (REWARD_GROWTH_AGENT = 2).
        if (milestone.referrerWallet) {
            claimOnChainReward(milestone.referrerId, milestone.referrerWallet, 2)
                .catch(e => logger.error('Milestone on-chain reward failed', e));
        }
    }

    const isOwner = track.artistId == ctx.from.id;

    await ctx.reply(
`🎧 Now Playing

🎵 ${track.title}
👤 ${track.artistName}
🎸 ${track.genre}
▶️ ${(track.plays || 0)} plays`,
        Markup.inlineKeyboard([
            [Markup.button.callback('💸 Tip Artist', `tip_${trackId}`)],
            ...(isOwner ? [[Markup.button.callback('🗑 Delete Track', `del_confirm_${trackId}`)]] : [])
        ])
    );

    await ctx.replyWithAudio(track.fileId, {
        title: track.title,
        performer: track.artistName
    });

    // 45s verify
    setTimeout(async () => {
        try {
            const user = await store.getUser(ctx.from.id);
            if (!user) return;

            const d = new Date();
            const today = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
            
            const yd = new Date();
            yd.setDate(yd.getDate() - 1);
            const yesterday = yd.getFullYear() * 10000 + (yd.getMonth() + 1) * 100 + yd.getDate();

            let newStreak = user.listeningStreak || 0;
            const alreadyEarned = user.lastListenDay === today;
            
            if (!alreadyEarned) {
                if (user.lastListenDay === yesterday) {
                    newStreak += 1;
                } else {
                    newStreak = 1;
                }

                // Trigger on-chain reward for the first listen of the day (REWARD_ACTIVE_LISTENER = 1).
                if (user.walletAddress) {
                    claimOnChainReward(ctx.from.id, user.walletAddress, 1)
                        .catch(e => logger.error('Daily listen on-chain reward failed', e));
                }
            }

            await store.updateUser(ctx.from.id, {
                reputation: user.reputation + 1,
                listeningStreak: newStreak,
                lastListenDay: today
            });

            logger.info('Listen counted', { telegramId: ctx.from.id, trackId, streak: newStreak });

            await ctx.reply(
`✅ Listen counted!

⭐ Reputation +1
🔥 Streak: ${newStreak} days`,
                Markup.inlineKeyboard([
                    [Markup.button.callback('▶️ Play Another', `artist_${track.artistId}`)],
                    [Markup.button.callback('💸 Tip This Artist', `tip_${trackId}`)],
                    ...(isOwner ? [[Markup.button.callback('🗑 Delete Track', `del_confirm_${trackId}`)]] : [])
                ])
            );
        } catch (e) {
            logger.error('Error in listen verification timeout', e);
        }
    }, 45000);
});

// ── Upload ────────────────────────────────────────────
const startUpload = async (ctx) => {
    const telegramId = ctx.from.id;
    const user = await store.getUser(telegramId);
    logger.info('Upload flow started', { telegramId });
    if (!user) return ctx.reply('Send /start first!');
    if (!user.walletAddress) {
        return ctx.reply('❌ You must link your wallet before uploading! Click 💎 Link Wallet.');
    }
    await store.updateUser(telegramId, { step: 'upload_title', track: {} });
    await ctx.reply('🎵 What\'s the title of your track?');
};

bot.command('upload', startUpload);
bot.hears('⬆️ Upload', startUpload);
bot.hears('💸 Tip', async (ctx) => {
    await ctx.reply(
`💸 How to Tip on Toon

1. 🎧 Click "Listen" to find an artist
2. 🎵 Select a track you love
3. 💸 Click the "Tip Artist" button below the track

You can tip 1, 5, or 10 TON directly to the artist's on-chain contract!`,
        Markup.inlineKeyboard([
            [Markup.button.callback('🎧 Start Listening', 'listen')]
        ])
    );
});

// ── Tip ───────────────────────────────────────────────
bot.action(/^tip_(\d+_\d+)$/, async (ctx) => {
    const trackId = ctx.match[1];
    const track = await store.getTrack(trackId);
    const telegramId = ctx.from.id;
    logger.info('Tip choice initiated', { telegramId, trackId });
    if (!track) return ctx.answerCbQuery('Track not found');
    
    await ctx.answerCbQuery();
    await ctx.reply(
`💸 Tip ${track.artistName}

Choose how to tip:`,
        Markup.inlineKeyboard([
            [Markup.button.callback('⭐ Tip with Stars', `tip_stars_${trackId}`)],
            [Markup.button.callback('💎 Tip with TON', `tip_ton_${trackId}`)]
        ])
    );
});

bot.action(/^tip_stars_(\d+_\d+)$/, async (ctx) => {
    const trackId = ctx.match[1];
    const track = await store.getTrack(trackId);
    if (!track) return ctx.answerCbQuery('Track not found');

    await ctx.answerCbQuery();
    await ctx.replyWithInvoice({
        currency: 'XTR',
        provider_token: '',
        title: `⭐ Tip ${track.artistName}`,
        description: `Supporting "${track.title}" on Toon Protocol`,
        payload: `tip_stars_${trackId}`,
        prices: [{ label: 'Tip', amount: 50 }]
    });
});

bot.action(/^tip_ton_(\d+_\d+)$/, async (ctx) => {
    const trackId = ctx.match[1];
    const track = await store.getTrack(trackId);
    if (!track) return ctx.answerCbQuery('Track not found');

    await ctx.answerCbQuery();
    await ctx.reply(
`💸 Tip ${track.artistName}

Select an amount to tip in TON:`,
        Markup.inlineKeyboard([
            [Markup.button.callback('1 TON', `dotip_${trackId}_1`)],
            [Markup.button.callback('5 TON', `dotip_${trackId}_5`)],
            [Markup.button.callback('10 TON', `dotip_${trackId}_10`)]
        ])
    );
});

bot.action(/^dotip_(\d+_\d+)_(\d+)$/, async (ctx) => {
    const trackId = ctx.match[1];
    const amountStr = ctx.match[2];
    const track = await store.getTrack(trackId);
    const telegramId = ctx.from.id;

    const connector = await getConnector(telegramId);

    if (!connector.connected) {
        if (!await requireWalletConnected(ctx, connector, telegramId)) return;
    }
    
    const amount = toNano(amountStr);
    const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 600,
        network: runtimeConfig.explorerNetworkId,
        messages: [{
            address: track.contractAddress,
            amount: amount.toString()
        }]
    };

    try {
        await ctx.answerCbQuery('Sending request to Wallet...');
        await connector.sendTransaction(transaction);
        await ctx.reply(`✅ Transaction sent for ${amountStr} TON tip to ${track.artistName}!`);
        
        const currentUser = await store.getUser(telegramId);
        await store.updateUser(telegramId, { tipsSent: (currentUser.tipsSent || 0) + 1 });

        // Trigger on-chain reward (REWARD_SUPERFAN = 5).
        // Note: Contract requires 100 TON for rebate; we send every tip to record activity.
        if (currentUser.walletAddress) {
            claimOnChainReward(telegramId, currentUser.walletAddress, 5, { tipAmount: amount.toString() })
                .catch(e => logger.warn('Superfan reward dispatch failed', { telegramId, error: e.message }));
        }
    } catch (e) {
        logger.error('Tip transaction failed', e);
        await ctx.reply('Tip cancelled or failed.');
    }

});

bot.action('deploy_identity', async (ctx) => {
  const telegramId = ctx.from.id;
  if (deploymentInProgress.has(telegramId)) {
    return ctx.answerCbQuery('⏳ Deployment already in progress 2014 check your wallet app.');
  }
  deploymentInProgress.add(telegramId);
    const user = await store.getUser(telegramId);

    if (user && user.onChain) {
        return ctx.answerCbQuery('Your identity is already on-chain!', { show_alert: true });
    }
    if (!user || !user.pendingIdentityTx) {
        return ctx.answerCbQuery('No pending deployment found. Try uploading a track first.', { show_alert: true });
    }

    const connector = await getConnector(telegramId);
    if (!connector.connected) {
        if (!await requireWalletConnected(ctx, connector, telegramId)) return;
    }
    
    await ctx.answerCbQuery('Sending request to your wallet...');

    let tx = user.pendingIdentityTx;
    if (typeof tx === 'string') {
        try { tx = JSON.parse(tx); } catch (e) {
            logger.error('Failed to parse pendingIdentityTx', { telegramId, error: e.message });
            return ctx.reply('Invalid deployment data. Please try uploading again.');
        }
    }
    if (!tx || typeof tx !== 'object' || !tx.messages) {
        logger.error('pendingIdentityTx is invalid', { telegramId, tx });
        return ctx.reply('Could not prepare deployment transaction. Please try uploading again.');
    }

    // Bug A & B Fix: Destructure to remove extra props and refresh validUntil (30 min window)
    const request = {
        validUntil: Math.floor(Date.now() / 1000) + 600,
        network: runtimeConfig.explorerNetworkId,
        messages: tx.messages
    };

    connector.sendTransaction(request)
        .then(async () => {
            const artistAddress = request.messages[0].address;
            await store.markOnChain(telegramId, artistAddress);
            await store.updateUser(telegramId, { pendingIdentityTx: null });
            await ctx.reply('Artist Identity deployment sent to the blockchain!');

            // Trigger on-chain reward for the referrer (REWARD_GROWTH_AGENT = 2).
            const freshUser = await store.getUser(telegramId);
            if (freshUser && freshUser.referredBy) {
                const referrer = await store.getUser(freshUser.referredBy);
                if (referrer && referrer.walletAddress) {
                    claimOnChainReward(freshUser.referredBy, referrer.walletAddress, 2)
                        .catch(e => logger.error('Referrer upload reward failed', e));
                }
            }
        })
        .catch(async (e) => {
            logger.error('Identity deployment failed', e);
            deploymentInProgress.delete(telegramId);
            await ctx.reply('Deployment cancelled or failed.');
        })
        .finally(() => {
            deploymentInProgress.delete(telegramId);
        });
});

// ── Buy $TOON ─────────────────────────────────────────
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
        description: 'Purchase $TOON tokens to tip artists, earn rewards, and participate in governance.',
        payload: 'buy_toon_stars',
        prices: [{ label: '100 $TOON', amount: 50 }]
    });
});

bot.action('buy_ton', async (ctx) => {
    const telegramId = ctx.from.id;
    const user = await store.getUser(telegramId);
    
    if (!user || !user.walletAddress) {
        return ctx.reply("❌ Please link your wallet first using 💎 Link Wallet");
    }

    const connector = await getConnector(telegramId);

    if (!connector.connected) {
        if (!await requireWalletConnected(ctx, connector, telegramId)) return;
    }
    
    const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 600, // 10 minutes
        network: runtimeConfig.explorerNetworkId,
        messages: [{
            address: VAULT_ADDRESS_ENV,
            amount: toNano('1').toString()
        }]
    };

    await ctx.answerCbQuery('Opening wallet...');
    connector.sendTransaction(transaction)
        .then(async () => {
            await ctx.reply("1 TON sent to the vault! Your $TOON balance will update shortly.");
            
            // Trigger on-chain reward for investing (REWARD_DROP_INVESTOR = 7).
            if (user.walletAddress) {
                claimOnChainReward(telegramId, user.walletAddress, 7)
                    .catch(e => logger.error('Drop Investor reward failed', e));
            }
        })
        .catch(async (e) => {
            logger.error('TON purchase tx failed', e);
            await ctx.reply('Transaction cancelled or failed.');
        });
});

bot.action('confirm_ton_purchase', async (ctx) => {
    logger.info('TON purchase confirmed by user', { telegramId: ctx.from.id });
    await ctx.reply("✅ Thanks! Your $TOON will be credited once the transaction confirms on-chain. This is manual on testnet — mainnet will be automatic.");
});

bot.action('buy_fiat', async (ctx) => {
    if (!PROVIDER_TOKEN) {
        return ctx.reply("❌ Fiat payments are currently unavailable. Please try Stars or TON.");
    }

    try {
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
});

bot.on('pre_checkout_query', async (ctx) => {
    await ctx.answerPreCheckoutQuery(true);
});

bot.on('successful_payment', async (ctx) => {
    const payment = ctx.message.successful_payment;
    const payload = payment.invoice_payload;
    logger.info('Payment successful', { payment });
    
    if (payload === 'buy_toon_stars' || payload === 'buy_toon_fiat') {
        const telegramId = ctx.from.id;
        const user = await store.getUser(telegramId);
        if (user) {
            const newBalance = (user.toonBalance || 0) + 100;
            await store.updateUser(telegramId, { toonBalance: newBalance });
            await ctx.reply("✅ 100 $TOON added to your balance! Check /profile.");
        }
    } else if (payload.startsWith('tip_stars_')) {
        const trackId = payload.replace('tip_stars_', '');
        const track = await store.getTrack(trackId);
        if (track) {
            const artist = await store.getUser(track.artistId);
            if (artist) {
                const newBalance = (artist.toonBalance || 0) + 50;
                await store.updateUser(track.artistId, { toonBalance: newBalance });
                logger.info('Star tip processed', { trackId, artistId: track.artistId, tipperId: ctx.from.id });
                await ctx.reply(`✅ Your Star tip was sent to ${track.artistName}! They'll love you for it.`);
            }
        }
    } else {
        await ctx.reply('Thank you for your payment!');
    }
});

// ── Testnet Snapshot Command ──────────────────────────
bot.command('snapshot', adminOnly, async (ctx) => {
    const users = await store.getAllUsers();
    const snapshot = {};
    users.forEach(user => {
        snapshot[user.telegramId] = {
            toon_balance: user.toonBalance || 0,
            wallet_address: user.walletAddress || null
        };
    });
    const timestamp = Date.now();
    const filename = `snapshot_${timestamp}.json`;
    fs.writeFileSync(filename, JSON.stringify(snapshot, null, 2));
    logger.info(`Snapshot created: ${filename} with ${users.length} users`);
    await ctx.reply(`Snapshot saved as ${filename}`);
});

// ── Text handler ──────────────────────────────────────
bot.on('text', async (ctx) => {
    const telegramId = ctx.from.id;
    const text = ctx.message.text;
    if (text === '❌ Cancel') {
        await store.updateUser(telegramId, { step: null });
        return showMenu(ctx);
    }
    if (text.startsWith('/')) return;

    let user = await store.getUser(telegramId);

    if (!user || !user.artistName) {
        logger.info('Capturing artist name', { telegramId, name: text });
        
        // If user already exists (skeleton from /start), just update the name
        if (user) {
            await store.updateUser(telegramId, { artistName: text.trim() });
            user = await store.getUser(telegramId);
        } else {
            // Fallback for direct text without /start
            user = await store.createPendingUser(telegramId, text.trim(), null);
        }

        if (user.referredBy) {
            const referrer = await store.getUser(user.referredBy);
            if (referrer && referrer.walletAddress) {
                await store.updateUser(user.referredBy, { toonBalance: (referrer.toonBalance || 0) + 5 });
                await store.markSignupRewardPaid(user.referredBy, telegramId);
                try {
                    await claimOnChainReward(user.referredBy, referrer.walletAddress, 2); // REWARD_GROWTH_AGENT
                } catch (e) {
                    logger.error('Failed to claim growth reward', e);
                }
                try { await bot.telegram.sendMessage(user.referredBy, `🎉 ${text.trim()} just joined via your link!\n+5 $TOON earned (On-chain claim sent)`); } catch(e) {}
            }
        }

        await ctx.reply(
`🎉 Welcome to Toon, ${user.artistName}!

Next: Click 💎 Link Wallet to complete your setup.`,
            Markup.keyboard([
                ['🎧 Listen', '📤 Share'],
                ['⬆️ Upload', '💸 Tip'],
                ['👤 Profile', '🔗 Refer'],
                ['💎 Link Wallet']
            ]).resize()
        );
        return;
    }

    if (user.step === 'bug_report') {
        const adminId = process.env.ADMIN_CHAT_ID;
        const report = `🪲 **New Bug Report**\n\nFrom: ${user.artistName} (@${ctx.from.username || 'N/A'})\nID: ${telegramId}\n\nDescription:\n${text}`;

        try {
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
        return;
    }

    if (user.step === 'delete_reason') {
        return executeDeletion(ctx, telegramId, text);
    }
    if (user.step === 'upload_title') {
        await store.updateUser(telegramId, { step: 'upload_genre', track: { title: text } });
        return ctx.reply(`🎸 Genre for "${text}"?`);
    }

    if (user.step === 'upload_genre') {
        const track = user.track || {};
        track.genre = text;
        await store.updateUser(telegramId, { step: 'upload_file', track });
        return ctx.reply(`🎵 Now send the audio file for "${track.title}"`);
    }
});

// ── Audio upload ──────────────────────────────────────
bot.on('audio', async (ctx) => {
    const telegramId = ctx.from.id;
    const user = await store.getUser(telegramId);
    if (!user || user.step !== 'upload_file') return ctx.reply('Send /upload first.');
    if (!user.walletAddress) return ctx.reply('❌ No wallet linked. Use 💎 Link Wallet.');

    let statusMsg;
    const uploadId = `${telegramId}_${Date.now()}`;
    logger.info('Audio upload handler started', { telegramId, uploadId });

    try {
        statusMsg = await ctx.reply('⏳ Processing audio...');
        const file = ctx.message.audio;
        let storageFileId = file.file_id;
        const fileSizeMB = file.file_size / (1024 * 1024);

        if (fileSizeMB > 50) {
            await ctx.reply('File is too large. Max size is 50MB.');
            return;
        }

        if (fileSizeMB > 20) {
            logger.info('File > 20MB, skipping ID3', { telegramId, uploadId, fileSizeMB });
            await ctx.reply('⚠️ File > 20MB: Skipping metadata (ID3) tagging, but continuing upload...');
        } else {
            logger.info('Downloading audio for tagging', { telegramId, uploadId });
            const fileLink = await ctx.telegram.getFileLink(file.file_id);
            const response = await axios.get(fileLink.href, { 
                responseType: 'arraybuffer',
                timeout: 30000 // 30s timeout for download
            });
            let audioBuffer = Buffer.from(response.data);

            logger.info('Writing ID3 tags', { telegramId, uploadId });
            const success = NodeID3.write({ 
                title: user.track.title || 'Untitled', 
                artist: user.artistName, 
                genre: user.track.genre || 'Unknown' 
            }, audioBuffer);
            if (success) audioBuffer = success;

            logger.info('Replying with tagged audio', { telegramId, uploadId });
            const uploadMsg = await ctx.replyWithAudio({ source: audioBuffer }, {
                title: user.track.title, performer: user.artistName, caption: '✅ Metadata updated!'
            });
            storageFileId = uploadMsg.audio.file_id;
        }

        // ── Forward to Storage Channel ──
        logger.info('Forwarding to storage channel', { telegramId, uploadId, STORAGE_CHANNEL_ID });
        try {
            const channelMsg = await ctx.telegram.sendAudio(STORAGE_CHANNEL_ID, storageFileId, {
                title: user.track.title,
                performer: user.artistName,
                caption: `🎵 Track: ${user.track.title}\n👤 Artist: ${user.artistName}\n🆔 TrackID: ${uploadId}`
            });
            storageFileId = channelMsg.audio.file_id;
            logger.info('Forwarded track to storage channel', { uploadId, storageFileId });
        } catch (e) {
            logger.warn('Failed to forward track to storage channel', { uploadId, error: e.message });
        }

        const trackId = uploadId;
        
        // ── Real NFT Deployment with Retry ──
        logger.info('Initializing MusicNft contract', { telegramId, uploadId, trackId });
        const nftInit = await MusicNft.fromInit(
            Address.parse(user.walletAddress.trim()),
            { $$type: 'TrackMetadata', title: user.track.title, uri: `${runtimeConfig.trackBaseUrl.replace(/\/$/, '')}/${trackId}`, genre: user.track.genre },
            toNano('0.01'),
            0n
        );

        logger.info('Sending deployment transaction', { telegramId, uploadId, nftAddress: nftInit.address.toString() });
        await retry(async () => {
            const { contract, key } = await getDeployer();
            const trackNft = client.open(nftInit);
            await trackNft.send(contract.sender(key.secretKey), { value: toNano('0.05') }, null);
        });

        logger.info('Adding track to store', { telegramId, uploadId, trackId });
        const track = {
            id: trackId, title: user.track.title, genre: user.track.genre,
            artistName: user.artistName, artistId: telegramId, fileId: storageFileId,
            duration: file.duration, contractAddress: nftInit.address.toString(), plays: 0
        };

        await store.addTrack(telegramId, track);
        await store.updateUser(telegramId, { step: null, track: {}, reputation: user.reputation + 5 });

        // Wait a few seconds for seqno to update before claiming reward
        await sleep(3000);

        // Claim on-chain rewards for artist launch
        if (user.walletAddress) {
            // 1. Artist Launch Reward (ID 3) - One-time per wallet
            claimOnChainReward(telegramId, user.walletAddress, 3)
                .catch(e => logger.error('Artist Launch reward failed', e));

            // 2. Trendsetter Reward (ID 4) - For the first 100 tracks on the platform
            const trackCount = await store.getTrackCount();
            if (trackCount <= 100) {
                claimOnChainReward(telegramId, user.walletAddress, 4)
                    .catch(e => logger.error('Trendsetter reward failed', e));
            }
        }

        logger.info('Audio upload complete', { telegramId, uploadId, trackId });
        await ctx.reply(`✅ "${track.title}" is live on-chain! (TESTNET)\nNFT: ${nftInit.address.toString()}\nReputation +5! 🎁`);

        const updatedUser = await store.getUser(telegramId);
        if (updatedUser && !updatedUser.onChain) {
            if (!REGISTRY_ADDRESS_ENV) {
                logger.error('TOON_REGISTRY_ADDRESS not set in .env');
            } else {
                const REGISTRY_ADDRESS = Address.parse(REGISTRY_ADDRESS_ENV);
                const walletAddrStr = updatedUser.walletAddress || user.walletAddress;
                if (!walletAddrStr) {
                    logger.warn('User has no wallet address linked, skipping identity prompt', { telegramId });
                } else {
                    const OWNER_ADDRESS = Address.parse(walletAddrStr.trim());
                    const artistInit = await ToonArtist.fromInit(OWNER_ADDRESS, REGISTRY_ADDRESS, BigInt(telegramId), `${runtimeConfig.artistBaseUrl.replace(/\/$/, '')}/${telegramId}`);
                    
                    const deployTx = {
                        validUntil: Math.floor(Date.now() / 1000) + 600,
                        network: runtimeConfig.explorerNetworkId,
                        messages: [
                            {
                                address: artistInit.address.toString(),
                                amount: toNano('0.05').toString(),
                                stateInit: beginCell()
                                    .storeUint(0, 2)
                                    .storeMaybeRef(artistInit.init.code)
                                    .storeMaybeRef(artistInit.init.data)
                                    .storeUint(0, 1)
                                    .endCell()
                                    .toBoc()
                                    .toString('base64'),
                                payload: beginCell().storeUint(0, 32).storeUint(0, 64).endCell().toBoc().toString('base64')
                            },
                            {
                                address: REGISTRY_ADDRESS.toString(),
                                amount: toNano('0.05').toString(),
                                payload: beginCell()
                                    .storeUint(3754294261, 32) // RegisterArtist header
                                    .storeAddress(artistInit.address)
                                    .endCell()
                                    .toBoc()
                                    .toString('base64')
                            }
                        ]
                    };

                    await ctx.reply(`🚀 Deploy Your On-Chain Identity!`, Markup.inlineKeyboard([
                        [Markup.button.callback('🚀 Deploy Artist Identity (via Wallet)', `deploy_identity`)]
                    ]));
                    
                    // Store the tx for this user temporarily
                    await store.updateUser(telegramId, { pendingIdentityTx: deployTx });
                }
            }
        }

        try { await ctx.telegram.deleteMessage(ctx.chat.id, statusMsg.message_id); } catch(e) {}
    } catch (err) {
        logger.error('Upload failed', err);
        await ctx.reply('❌ Upload failed.');
    }
});

// Simple HTTP server for Railway health check
const http = require('http');
const server = http.createServer((req, res) => {
    res.writeHead(200);
    res.end('Toon Bot is alive');
});

// ── Health Check ──────────────────────────────────────
async function runHealthCheck() {
    try {
        const { contract } = await getDeployer();
        const botAddress = contract.address.toString();

        const oracleSeed = process.env.ORACLE_SEED_HEX;
        if (!oracleSeed || oracleSeed.length !== 64) {
            logger.warn('ORACLE_SEED_HEX is missing or invalid. Reward claims will fail.');
        } else {
            logger.info('Oracle key pair loaded ✅');
        }
        
        if (VAULT_ADDRESS_ENV) {
            const vaultAddr = Address.parse(VAULT_ADDRESS_ENV);
            const vault = client.open(ToonVault.fromAddress(vaultAddr));

            // Just check if we can fetch something to verify reachability
            try {
                const reserve = await vault.getTotalReserve();
                logger.info('Vault reachability verified ✅', { reserve: reserve.toString() });
            } catch (e) {
                if (e.message.includes('exit_code: 11')) {
                    logger.warn('Vault reachable but NOT DEPLOYED yet (exit_code 11).');
                } else {
                    throw e;
                }
            }
        }    } catch (e) {
        logger.warn('Startup health check failed', { error: e.message });
    }
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    logger.info(`Health check server listening on port ${PORT}`);
    
    runHealthCheck();

    // Start the bot ONLY after successfully binding the port
    bot.launch()
        .then(() => logger.info('🎵 Toon bot running...'))
        .catch(err => {
            if (err.message && err.message.includes('timed out')) {
                logger.warn('Bot launch timed out (getMe), but polling might still start.', { err: err.message });
            } else {
                logger.error('Failed to launch bot', err);
                process.exit(1);
            }
        });
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
