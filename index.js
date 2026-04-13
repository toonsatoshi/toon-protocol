require('dotenv').config();
require('ts-node').register(); // Enable direct loading of .ts files
const { Telegraf, Markup } = require('telegraf');
const { Address, toNano, beginCell } = require('@ton/core');
const store = require('./store');
const logger = require('./logger');
const axios = require('axios');
const NodeID3 = require('node-id3');
const fs = require('fs');

// Point to the .ts build artifact
const { ToonArtist } = require('./build/ToonArtist/ToonArtist_ToonArtist');
const { ToonVault } = require('./build/ToonVault/ToonVault_ToonVault');
const { MusicNft } = require('./build/MusicNft/MusicNft_MusicNft');
const { TonClient, WalletContractV4, internal } = require('@ton/ton');
const { mnemonicToPrivateKey } = require('@ton/crypto');
const TonConnect = require('@tonconnect/sdk');
const { authorizeMint } = require('./ton_utils');

const bot = new Telegraf(process.env.BOT_TOKEN);
const STORAGE_CHANNEL_ID = process.env.STORAGE_CHANNEL_ID;

// ── Payment Provider ──────────────────────────────────
const PROVIDER_TOKEN = process.env.PAYMENT_PROVIDER_TOKEN;

// ── Standard Response Helpers ────────────────────────
/**
 * @param {any} data
 * @returns {{success: true, data: any}}
 */
function success(data = true) {
    return { success: true, data };
}

/**
 * @param {string} error
 * @param {string} [code]
 * @returns {{success: false, error: string, code?: string}}
 */
function fail(error, code) {
    return { success: false, error, code };
}

// ── TON Connect Setup ────────────────────────────────
class TonConnectStorage {
    constructor(telegramId) {
        this.telegramId = Number(telegramId);
    }
    async removeItem(key) {
        const res = await store.getUser(this.telegramId);
        if (res.success && res.data.connectorData) {
            delete res.data.connectorData[key];
            await store.updateUser(this.telegramId, { connectorData: res.data.connectorData });
        }
    }
    async setItem(key, value) {
        const res = await store.getUser(this.telegramId);
        const data = res.success ? (res.data.connectorData || {}) : {};
        data[key] = value;
        await store.updateUser(this.telegramId, { connectorData: data });
    }
    async getItem(key) {
        const res = await store.getUser(this.telegramId);
        return res.success ? (res.data.connectorData?.[key] || null) : null;
    }
}

const connectors = new Map();
const unsubscribers = new Map();

/**
 * @param {number|string} telegramId
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
async function getConnector(telegramId) {
    if (!telegramId) return fail('Missing telegramId', 'MISSING_ID');
    const tid = Number(telegramId);

    if (connectors.has(tid)) {
        return success(connectors.get(tid));
    }

    try {
        const connector = new TonConnect.TonConnect({
            manifestUrl: 'https://raw.githubusercontent.com/toonsatoshi/toon-protocol/main/tonconnect-manifest.json',
            storage: new TonConnectStorage(tid),
            analytics: { mode: 'off' }
        });
        
        connectors.set(tid, connector);
        await connector.restoreConnection();
        return success(connector);
    } catch (e) {
        logger.error('Failed to restore connection', { telegramId: tid, error: e.message });
        return fail(`Connection restore failed: ${e.message}`, 'CONN_RESTORE_FAIL');
    }
}

// ── TON Client & Wallet Setup ────────────────────────
const apiKey = (process.env.TONCENTER_API_KEY && process.env.TONCENTER_API_KEY.length > 10) 
    ? process.env.TONCENTER_API_KEY.trim() 
    : undefined;

const VAULT_ADDRESS_ENV = process.env.TOON_VAULT_ADDRESS ? process.env.TOON_VAULT_ADDRESS.trim() : null;
const REGISTRY_ADDRESS_ENV = process.env.TOON_REGISTRY_ADDRESS ? process.env.TOON_REGISTRY_ADDRESS.trim() : null;

if (apiKey) {
    logger.info(`Using TONCENTER_API_KEY starting with: ${apiKey.slice(0, 4)}...`);
} else {
    logger.info('No TONCENTER_API_KEY found, using public endpoint limits.');
}

let client = new TonClient({
    endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC',
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
                client = new TonClient({
                    endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC'
                });
                await sleep(1000);
            } else {
                throw err;
            }
        }
    }
}

/**
 * @returns {Promise<{success: boolean, data?: {contract: any, key: any}, error?: string}>}
 */
async function getDeployer() {
    if (!process.env.WALLET_MNEMONIC) {
        return fail('WALLET_MNEMONIC not set', 'MISSING_MNEMONIC');
    }
    try {
        const key = await mnemonicToPrivateKey(process.env.WALLET_MNEMONIC.split(' '));
        const wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });
        const contract = client.open(wallet);
        return success({ contract, key });
    } catch (e) {
        return fail(`Failed to initialize deployer: ${e.message}`, 'INIT_DEPLOYER_FAIL');
    }
}

// ── Bot-level reward idempotency ─────────────────────────────────────────────
const _rewardNonces = new Map();

function _rewardNonceKey(telegramId, rewardId) {
    const utcDay = Math.floor(Date.now() / 86400000);
    return `${telegramId}:${rewardId}:${utcDay}`;
}

const _lastClaimTime = new Map();
const CLAIM_COOLDOWN_MS = 310_000;

// ── Oracle signing ───────────────────────────────────────────────────────────
const { sign: ed25519Sign, keyPairFromSeed } = require('@ton/crypto');
const { beginCell: _beginCell } = require('@ton/core');
const _crypto = require('crypto');

let _oracleKeyPair = null;

function getOracleKeyPair() {
    if (_oracleKeyPair) return _oracleKeyPair;
    const seedHex = process.env.ORACLE_SEED_HEX;
    if (!seedHex || seedHex.length !== 64) {
        throw new Error('ORACLE_SEED_HEX must be a 64-char hex string (32 bytes).');
    }
    _oracleKeyPair = keyPairFromSeed(Buffer.from(seedHex, 'hex'));
    return _oracleKeyPair;
}

function getOraclePublicKeyBigInt() {
    const kp = getOracleKeyPair();
    return BigInt('0x' + Buffer.from(kp.publicKey).toString('hex'));
}

/**
 * @returns {{success: boolean, data?: any, error?: string}}
 */
function signRewardPayload({ telegramId, walletAddress, rewardId, walletAgeDays, hasVibeStreak, tipAmount, claimId, expiry, referrerId }) {
    if (!telegramId || !walletAddress || !rewardId || claimId === undefined || !expiry) {
        return fail('Missing mandatory claim parameters', 'MISSING_PARAMS');
    }

    try {
        const payload = _beginCell()
            .storeUint(BigInt(telegramId), 64)
            .storeAddress(Address.parse(walletAddress.trim()))
            .storeUint(BigInt(rewardId), 8)
            .storeUint(BigInt(walletAgeDays || 0), 32)
            .storeBit(hasVibeStreak ? 1 : 0)
            .storeCoins(BigInt(tipAmount || 0))
            .storeUint(BigInt(claimId), 64)
            .storeUint(BigInt(expiry), 32)
            .storeUint(BigInt(referrerId || 0), 64)
            .endCell();

        const hash = payload.hash();
        const kp   = getOracleKeyPair();
        const sig  = ed25519Sign(hash, kp.secretKey);

        return success({
            sigHigh: BigInt('0x' + sig.slice(0, 32).toString('hex')),
            sigLow:  BigInt('0x' + sig.slice(32, 64).toString('hex')),
        });
    } catch (e) {
        return fail(`Signing failed: ${e.message}`, 'SIGN_FAIL');
    }
}

// Generate a deterministic 64-bit claim ID from an event string.
// This ensures that even if the bot is triggered multiple times for the
// same logical event, the on-chain claimId remains identical.
function generateClaimId(eventString) {
    const hash = _crypto.createHash('sha256').update(eventString).digest();
    return hash.readBigUint64BE(0);
}

/**
 * Simple polling to wait for a transaction to appear on-chain.
 * @param {Address} address
 * @param {number} lastLt
 * @returns {Promise<{success: boolean}>}
 */
async function waitForTransaction(address, lastLt) {
    for (let i = 0; i < 15; i++) { // Poll for ~30 seconds
        const state = await client.getContractState(address);
        if (state.lastTransaction && BigInt(state.lastTransaction.lt) > BigInt(lastLt)) {
            return success();
        }
        await sleep(2000);
    }
    return fail('Transaction confirmation timed out', 'TIMEOUT');
}

/**
 * @param {number|string} telegramId
 * @param {string} walletAddress
 * @param {number} rewardId
 * @param {object} [opts]
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
async function claimOnChainReward(telegramId, walletAddress, rewardId, opts = {}) {
    // ── Preconditions ────────────────────────────────────────────────────────
    if (!VAULT_ADDRESS_ENV) return fail('TOON_VAULT_ADDRESS not configured', 'MISSING_VAULT_CONFIG');
    if (!telegramId) return fail('Missing telegramId', 'MISSING_ID');
    if (!walletAddress) return fail('Missing walletAddress', 'MISSING_WALLET');
    if (!rewardId) return fail('Missing rewardId', 'MISSING_REWARD_ID');

    const tid = Number(telegramId);
    
    // ── Idempotency & Cooldown ───────────────────────────────────────────────
    const eventId = opts.eventId || _rewardNonceKey(tid, rewardId);
    const claimId = generateClaimId(eventId);

    if (_rewardNonces.has(eventId)) {
        logger.warn('Reward already dispatched (bot eventId)', { telegramId: tid, rewardId, eventId });
        return success({ alreadyDispatched: true });
    }

    const lastClaim = _lastClaimTime.get(String(tid));
    if (lastClaim && Date.now() - lastClaim < CLAIM_COOLDOWN_MS) {
        return fail('Claim cooldown active', 'COOLDOWN_ACTIVE');
    }

    // ── Data Gathering ───────────────────────────────────────────────────────
    let walletAgeDays = 0n;
    let hasVibeStreak = false;
    try {
        const res = await store.getUser(tid);
        if (res.success) {
            const user = res.data;
            if (user.createdAt) {
                walletAgeDays = BigInt(Math.floor((Date.now() - new Date(user.createdAt).getTime()) / 86400000));
            }
            hasVibeStreak = (user.listeningStreak || 0) >= 7;
        }
    } catch (e) {
        logger.warn('Could not compute user eligibility metrics', { telegramId: tid, error: e.message });
    }

    // ── Execution Intent ─────────────────────────────────────────────────────
    _rewardNonces.set(eventId, true);
    _lastClaimTime.set(String(tid), Date.now());

    try {
        const result = await retry(async () => {
            const deployerRes = await getDeployer();
            if (!deployerRes.success) throw new Error(deployerRes.error);
            
            const { contract, key } = deployerRes.data;
            const vaultAddr = Address.parse(VAULT_ADDRESS_ENV);
            const vault = client.open(ToonVault.fromAddress(vaultAddr));

            // Check current state for verification later
            const vaultState = await client.getContractState(vaultAddr);
            const lastLt = vaultState.lastTransaction ? vaultState.lastTransaction.lt : "0";

            logger.info('Executing ClaimReward intent', {
                telegramId: tid, rewardId, walletAddress, eventId
            });

            const expiry = Math.floor(Date.now() / 1000) + 270;
            const sigRes = signRewardPayload({
                telegramId: tid,
                walletAddress,
                rewardId,
                walletAgeDays: Number(walletAgeDays),
                hasVibeStreak,
                tipAmount: opts.tipAmount || 0,
                claimId,
                expiry,
                referrerId: opts.referrerId || 0,
            });

            if (!sigRes.success) throw new Error(sigRes.error);

            await vault.send(contract.sender(key.secretKey), {
                value:  toNano('0.05'),
                bounce: true,
            }, {
                $$type:        'ClaimReward',
                walletAddress: Address.parse(walletAddress.trim()),
                rewardId:      BigInt(rewardId),
                telegramId:    BigInt(tid),
                walletAgeDays: walletAgeDays,
                hasVibeStreak: hasVibeStreak,
                tipAmount:     BigInt(opts.tipAmount || 0),
                claimId:       claimId,
                expiry:        BigInt(expiry),
                sigHigh:       sigRes.data.sigHigh,
                sigLow:        sigRes.data.sigLow,
                referrerId:    BigInt(opts.referrerId || 0),
            });

            // ── Verification ─────────────────────────────────────────────────
            logger.info('Waiting for on-chain confirmation...', { telegramId: tid, eventId });
            const conf = await waitForTransaction(vaultAddr, lastLt);
            if (!conf.success) throw new Error('Transaction verification failed (timeout)');
            
            return success({ claimId });
        });
        
        return result;
    } catch (err) {
        // Rollback local state on definitive failure
        _rewardNonces.delete(eventId);
        _lastClaimTime.delete(String(tid));
        logger.error('claimOnChainReward failed', { telegramId: tid, rewardId, error: err.message });
        return fail(err.message, 'TX_FAILED');
    }
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
        ctx.reply('❌ An internal error occurred. Please try again later.');
    }
});

// ── Admin Middleware ──────────────────────────────────
const adminOnly = async (ctx, next) => {
    if (ctx.from.id != process.env.ADMIN_CHAT_ID) {
        return ctx.reply('⚙️ This feature isn\'t available yet.');
    }
    return next();
};

/**
 * Helper to ensure user exists and handle standardized store response.
 * @param {object} ctx 
 * @returns {Promise<any|null>}
 */
async function ensureUser(ctx) {
    const res = await store.getUser(ctx.from.id);
    if (res.success) return res.data;
    if (res.code === 'NOT_FOUND') return null;
    
    logger.error('Store error in ensureUser', { telegramId: ctx.from.id, error: res.error });
    await ctx.reply('❌ System error. Please try again later.');
    return null;
}

// ── /start ────────────────────────────────────────────
bot.start(async (ctx) => {
    const param = ctx.startPayload;
    const telegramId = ctx.from.id;
    logger.info('/start command received', { telegramId, param });
    
    let user = await ensureUser(ctx);

    // Deep link to track
    if (param && param.startsWith('track_')) {
        const trackId = param.replace('track_', '');
        const trackRes = await store.getTrack(trackId);
        
        if (trackRes.success) {
            const track = trackRes.data;
            await store.incrementPlayCount(trackId, telegramId);
            
            const milestoneRes = await store.checkPlayMilestone(trackId);
            if (milestoneRes.success && milestoneRes.data) {
                const milestone = milestoneRes.data;
                bot.telegram.sendMessage(milestone.referrerId, 
                    `🎉 ${milestone.artistName}'s track reached 5 unique listeners! +50 $TOON earned!`).catch(() => {});

                // Background claim
                const userRes = await store.getUser(milestone.referrerId);
                if (userRes.success && userRes.data.walletAddress) {
                    claimOnChainReward(milestone.referrerId, userRes.data.walletAddress, 2, {
                        eventId: `milestone_${trackId}_${milestone.referrerId}`,
                        referrerId: track.artistId
                    }).catch(e => logger.error('Milestone on-chain reward failed', { telegramId: milestone.referrerId, error: e.message }));
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
        }
    }

    // Referral code at signup
    let referredBy = null;
    if (param && param.startsWith('ref_')) {
        const refCode = param.replace('ref_', '');
        const referrerRes = await store.getUserByReferralCode(refCode);
        if (referrerRes.success) {
            referredBy = referrerRes.data.telegramId;
            logger.info('Referral detected', { telegramId, referredBy, refCode });
        }
    } else if (param === 'wallet_connected') {
        if (user) return ctx.reply('✅ Welcome back! Your wallet is now linked to Toon.');
    }

    if (!user) {
        logger.info('New user onboarding started', { telegramId });
        global.sessions = { ...(global.sessions || {}), [telegramId]: { referredBy } };

        return ctx.reply(
`🎵 Welcome to Toon! (TESTNET)

The newest way to share music and earn crypto — right inside Telegram.

━━━━━━━━━━━━━━━
What should we call you on Toon? 🎤

(This will be your artist and listener name)`
        );
    }

    await showMenu(ctx, user);
});

const showMenu = async (ctx, user) => {
    const currentUser = user || await ensureUser(ctx);
    if (!currentUser) return;

    logger.info('Showing main menu', { telegramId: ctx.from.id });
    await ctx.reply(
`Hey ${currentUser.artistName}! 🎵`,
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
    const user = await ensureUser(ctx);
    if (!user) return;
    
    logger.info('Wallet link flow started', { telegramId });
    
    const connRes = await getConnector(telegramId);
    if (!connRes.success) return ctx.reply(`❌ ${connRes.error}`);
    const connector = connRes.data;

    if (connector.connected) {
        const addr = Address.parse(connector.account.address).toString();
        await store.setWalletAddress(telegramId, addr);
        return ctx.reply(`✅ Wallet already linked: \`${addr}\`\n\nTo change it, /disconnect first.`, { parse_mode: 'Markdown' });
    }

    const universalLink = connector.connect({
        bridgeUrl: 'https://bridge.tonapi.io/bridge',
        universalLink: 'https://t.me/wallet/start?startapp=tonconnect'
    });

    await ctx.reply(
`🔗 Link Your Wallet (TESTNET)

1. Tap the button below to open Telegram Wallet (TESTNET)
2. Connect your wallet
3. Return here to Toon

━━━━━━━━━━━━━━━
⚠️ Make sure your wallet is in **Testnet** mode!`,
        Markup.inlineKeyboard([
            [Markup.button.url('💎 Connect Wallet', universalLink)]
        ])
    );

    // Watch for connection
    let unsubscribe;
    unsubscribe = connector.onStatusChange(async (wallet) => {
        if (wallet && connector.connected) {
            const addr = Address.parse(wallet.account.address).toString();
            await store.setWalletAddress(telegramId, addr);
            logger.info('Wallet linked via callback', { telegramId, address: addr });
            
            await bot.telegram.sendMessage(telegramId, `✅ Wallet linked: \`${addr}\``, { parse_mode: 'Markdown' });
            
            if (unsubscribe) unsubscribe();
            unsubscribers.delete(telegramId);
        }
    });

    unsubscribers.set(telegramId, unsubscribe);
});

bot.command('disconnect', async (ctx) => {
    const telegramId = ctx.from.id;
    const connRes = await getConnector(telegramId);
    if (connRes.success) await connRes.data.disconnect();
    
    if (unsubscribers.has(telegramId)) {
        unsubscribers.get(telegramId)();
        unsubscribers.delete(telegramId);
    }
    
    await store.updateUser(telegramId, { walletAddress: null, connectorData: null });
    await ctx.reply('❌ Wallet disconnected.');
});

// ── Profile ───────────────────────────────────────────
const showProfile = async (ctx) => {
    const user = await ensureUser(ctx);
    if (!user) return;

    const refsRes = await store.getReferrals(ctx.from.id);
    const refs = refsRes.success ? refsRes.data : [];
    
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
    const res = await store.getUser(telegramId);
    if (!res.success) return;
    const user = res.data;

    const adminId = process.env.ADMIN_CHAT_ID;
    const notification = `🗑 **Account Deleted**\n\nFrom: ${user.artistName} (@${ctx.from.username || 'N/A'})\nID: ${telegramId}\n\nReason:\n${reason}`;

    try {
        await store.deleteUser(telegramId);
        if (adminId) {
            await bot.telegram.sendMessage(adminId, notification);
        }
        await ctx.reply('✅ Your account has been deleted. We are sorry to see you go! You can always /start again if you change your mind.', Markup.removeKeyboard());
    } catch (e) {
        logger.error('Failed to delete account', e);
        await ctx.reply('❌ An error occurred while deleting your account. Please contact @zalgorythms.');
    }
};

bot.action('final_delete_skip', async (ctx) => {
    await executeDeletion(ctx, ctx.from.id);
});

bot.hears('🪲 Report Bug', async (ctx) => {
    const telegramId = ctx.from.id;
    const user = await ensureUser(ctx);
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
    const user = await ensureUser(ctx);
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
    const trackRes = await store.getTrack(trackId);
    if (!trackRes.success) return ctx.answerCbQuery('Track not found');
    const track = trackRes.data;
    
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
    const delRes = await store.deleteTrack(ctx.from.id, trackId);
    
    if (delRes.success) {
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
    const user = await ensureUser(ctx);
    logger.info('Showing referral info', { telegramId });
    if (!user) return;

    const refsRes = await store.getReferrals(telegramId);
    const refs = refsRes.success ? refsRes.data : [];
    const uploaded = refs.filter(r => r.uploadedAt).length;

    await ctx.reply(
`🔗 Your Referral Link (TESTNET)

Share this with friends:
https://t.me/${ctx.botInfo.username}?start=ref_${user.referralCode}

👥 Friends signed up: ${refs.length}
🎵 Friends uploaded: ${uploaded}

🎁 Rewards (TESTNET):
✅ Friend signs up → +5 $TOON
🎵 Friend uploads → +25 $TOON
▶️ Friend's track hits 5 plays → +50 $TOON

All testnet $TOON is redeemable 1:1 on Mainnet!`,
        Markup.inlineKeyboard([
            [Markup.button.url('Share Your Link',
                `https://t.me/share/url?url=https://t.me/${ctx.botInfo.username}?start=ref_${user.referralCode}&text=Join me on Toon — the music platform on TON (TESTNET) 🎵`
            )]
        ])
    );
};

bot.command('refer', showReferral);
bot.hears('🔗 Refer', showReferral);

// ── Listen ────────────────────────────────────────────
const startListen = async (ctx) => {
    const telegramId = ctx.from.id;
    const res = await store.getAllArtists();
    const artists = res.success ? res.data : [];
    
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
    const res = await store.getUser(artistId);
    
    if (!res.success) {
        logger.warn('Artist not found in store', { artistId });
        return ctx.answerCbQuery('Artist not found');
    }
    const artist = res.data;
    
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
    const trackRes = await store.getTrack(trackId);
    logger.info('Play track action', { telegramId: ctx.from.id, trackId });
    
    if (!trackRes.success) return ctx.answerCbQuery('Track not found');
    await ctx.answerCbQuery();
    const track = trackRes.data;

    await store.incrementPlayCount(trackId, ctx.from.id);

    const milestoneRes = await store.checkPlayMilestone(trackId);
    if (milestoneRes.success && milestoneRes.data) {
        const milestone = milestoneRes.data;
        await bot.telegram.sendMessage(milestone.referrerId,
            `🎉 ${milestone.artistName}'s track reached 5 unique listeners! +50 $TOON earned!`
        ).catch(() => {});
        
        // Background claim
        const userRes = await store.getUser(milestone.referrerId);
        if (userRes.success && userRes.data.walletAddress) {
            claimOnChainReward(milestone.referrerId, userRes.data.walletAddress, 2, {
                eventId: `milestone_${trackId}_${milestone.referrerId}`,
                referrerId: track.artistId
            }).catch(e => logger.error('Milestone on-chain reward failed', { telegramId: milestone.referrerId, error: e.message }));
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
        const user = await ensureUser(ctx);
        if (!user) return;

        const today = new Date().toDateString();
        const alreadyEarned = user.lastListenDay === today;

        await store.updateUser(ctx.from.id, {
            reputation: user.reputation + 1,
            listeningStreak: alreadyEarned ? user.listeningStreak : user.listeningStreak + 1,
            lastListenDay: today
        });

        logger.info('Listen counted', { telegramId: ctx.from.id, trackId });

        await ctx.reply(
`✅ Listen counted!

⭐ Reputation +1
🔥 Streak: ${alreadyEarned ? user.listeningStreak : user.listeningStreak + 1} days`,
            Markup.inlineKeyboard([
                [Markup.button.callback('▶️ Play Another', `artist_${track.artistId}`)],
                [Markup.button.callback('💸 Tip This Artist', `tip_${trackId}`)],
                ...(isOwner ? [[Markup.button.callback('🗑 Delete Track', `del_confirm_${trackId}`)]] : [])
            ])
        );
    }, 45000);
});

// ── Upload ────────────────────────────────────────────
const startUpload = async (ctx) => {
    const telegramId = ctx.from.id;
    const user = await ensureUser(ctx);
    logger.info('Upload flow started', { telegramId });
    if (!user) return;
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
    const trackRes = await store.getTrack(trackId);
    const telegramId = ctx.from.id;
    logger.info('Tip choice initiated', { telegramId, trackId });
    if (!trackRes.success) return ctx.answerCbQuery('Track not found');
    const track = trackRes.data;
    
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
    const trackRes = await store.getTrack(trackId);
    if (!trackRes.success) return ctx.answerCbQuery('Track not found');
    const track = trackRes.data;

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
    const trackRes = await store.getTrack(trackId);
    if (!trackRes.success) return ctx.answerCbQuery('Track not found');
    const track = trackRes.data;

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
    const trackRes = await store.getTrack(trackId);
    const telegramId = ctx.from.id;

    if (!trackRes.success) return ctx.answerCbQuery('Track not found');
    const track = trackRes.data;

    const connRes = await getConnector(telegramId);
    if (!connRes.success) return ctx.reply(`❌ ${connRes.error}`);
    const connector = connRes.data;

    if (!connector.connected) {
        return ctx.reply('❌ Wallet not connected. Please /link first.');
    }

    const amount = toNano(amountStr);
    const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [{
            address: track.contractAddress,
            amount: amount.toString()
        }]
    };

    try {
        await ctx.answerCbQuery('Sending request to Wallet...');
        await connector.sendTransaction(transaction);
        await ctx.reply(`✅ Transaction sent for ${amountStr} TON tip to ${track.artistName}!`);
        const userRes = await store.getUser(telegramId);
        if (userRes.success) {
            await store.updateUser(telegramId, { tipsSent: (userRes.data.tipsSent || 0) + 1 });
        }
    } catch (e) {
        logger.error('Tip transaction failed', e);
        await ctx.reply('❌ Transaction cancelled or failed.');
    }
});

bot.action('deploy_identity', async (ctx) => {
    const telegramId = ctx.from.id;
    const user = await ensureUser(ctx);
    if (!user) return;
    
    if (user.onChain) {
        return ctx.answerCbQuery('✅ Your identity is already on-chain!', { show_alert: true });
    }

    if (!user.pendingIdentityTx) {
        return ctx.answerCbQuery('❌ No pending deployment found. Try uploading a track first.', { show_alert: true });
    }

    const connRes = await getConnector(telegramId);
    if (!connRes.success) return ctx.answerCbQuery(`❌ ${connRes.error}`, { show_alert: true });
    const connector = connRes.data;

    if (!connector.connected) {
        return ctx.answerCbQuery('❌ Wallet not connected. Please /link first.', { show_alert: true });
    }

    try {
        await ctx.answerCbQuery('Sending request to Wallet...');
        
        // intent -> execute -> verify -> update state
        const artistAddress = user.pendingIdentityTx.messages[0].address;
        
        // Wait for current state to poll for changes
        const stateRes = await client.getContractState(Address.parse(artistAddress));
        const lastLt = stateRes.lastTransaction ? stateRes.lastTransaction.lt : "0";

        await connector.sendTransaction(user.pendingIdentityTx);
        await ctx.reply('⏳ Deployment sent! Waiting for on-chain confirmation...');
        
        const conf = await waitForTransaction(Address.parse(artistAddress), lastLt);
        if (conf.success) {
            await store.markOnChain(telegramId, artistAddress);
            await store.updateUser(telegramId, { pendingIdentityTx: null });
            await ctx.reply('✅ Artist Identity confirmed on-chain! You are now a verified artist.');
        } else {
            await ctx.reply('⚠️ Transaction sent but confirmation timed out. Check your profile in a few minutes.');
        }
    } catch (e) {
        logger.error('Identity deployment failed', { telegramId, error: e.message });
        await ctx.reply(`❌ Deployment failed: ${e.message}`);
    }
});

const { setupPaymentHandlers } = require('./payment_handlers');

// ── Handlers ──────────────────────────────────────────────
setupPaymentHandlers(bot);

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
    const user = await ensureUser(ctx);
    
    if (!user || !user.walletAddress) {
        return ctx.reply("❌ Please link your wallet first using 💎 Link Wallet");
    }

    const connRes = await getConnector(telegramId);
    if (!connRes.success) return ctx.reply(`❌ ${connRes.error}`);
    const connector = connRes.data;

    if (!connector.connected) {
        return ctx.reply("❌ Please link your wallet first using 💎 Link Wallet");
    }

    const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 600, // 10 minutes
        messages: [{
            address: process.env.TOON_VAULT_ADDRESS,
            amount: toNano('1').toString()
        }]
    };

    try {
        await ctx.answerCbQuery('Opening wallet...');
        await connector.sendTransaction(transaction);
        await ctx.reply("✅ 1 TON sent to the vault! Your $TOON balance will update shortly.");
    } catch (e) {
        logger.error('Buy $TOON transaction failed', e);
        await ctx.reply("❌ Transaction cancelled or failed.");
    }
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
            prices: [{ label: '100 $TOON', amount: 199 }] // $1.99 USD
        });
    } catch (e) {
        logger.error('Failed to send fiat invoice', e);
        await ctx.reply("❌ There was an error initiating the card payment. Please try again or use another method.");
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
        const res = await store.getUser(telegramId);
        if (res.success) {
            const user = res.data;
            if (user.walletAddress) {
                await ctx.reply("⏳ Payment received! Dispatching your $TOON on-chain...");
                const successMint = await authorizeMint(user.walletAddress, toNano('100'));
                if (successMint) {
                    const newBalance = (user.toonBalance || 0) + 100;
                    await store.updateUser(telegramId, { toonBalance: newBalance });
                    await ctx.reply("✅ 100 $TOON added and authorized on-chain! Check /profile.");
                } else {
                    await ctx.reply("⚠️ Payment received but on-chain mint failed. We'll retry automatically, or contact support.");
                }
            } else {
                const newBalance = (user.toonBalance || 0) + 100;
                await store.updateUser(telegramId, { toonBalance: newBalance });
                await ctx.reply("✅ 100 $TOON added to your balance! Link your wallet to withdraw to on-chain.");
            }
        }
    } else if (payload.startsWith('tip_stars_')) {
        const trackId = payload.replace('tip_stars_', '');
        const trackRes = await store.getTrack(trackId);
        if (trackRes.success) {
            const track = trackRes.data;
            const artistRes = await store.getUser(track.artistId);
            if (artistRes.success) {
                const artist = artistRes.data;
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
    const res = await store.getAllUsers();
    if (!res.success) return ctx.reply(`❌ Failed to get users: ${res.error}`);
    const users = res.data;

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

    let userRes = await store.getUser(telegramId);
    let user = userRes.success ? userRes.data : null;

    if (!user) {
        logger.info('Capturing artist name', { telegramId, name: text });
        const session = (global.sessions || {})[telegramId] || {};
        
        const createRes = await store.createPendingUser(telegramId, text.trim(), session.referredBy);
        if (!createRes.success) {
            return ctx.reply('❌ Failed to create account. Please try /start again.');
        }
        user = createRes.data;

        if (session.referredBy) {
            const referrerRes = await store.getUser(session.referredBy);
            if (referrerRes.success && referrerRes.data.walletAddress) {
                const referrer = referrerRes.data;
                // Verifiable reward: execute on-chain first
                ctx.reply(`🎉 Joining via referral... Claiming your bonus!`);
                
                const claimRes = await claimOnChainReward(session.referredBy, referrer.walletAddress, 2, {
                    eventId: `signup_${telegramId}_${session.referredBy}`,
                    referrerId: telegramId
                });

                if (claimRes.success) {
                    await store.updateUser(session.referredBy, { toonBalance: (referrer.toonBalance || 0) + 5 });
                    await store.markSignupRewardPaid(session.referredBy, telegramId);
                    await bot.telegram.sendMessage(session.referredBy, `🎉 ${text.trim()} joined! +5 $TOON earned & confirmed!`).catch(() => {});
                }
            }
        }

        await ctx.reply(
`🎉 Welcome to Toon (TESTNET), ${user.artistName}!

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
            if (adminId) await bot.telegram.sendMessage(adminId, report);
            await store.updateUser(telegramId, { step: null });
            await ctx.reply('✅ Report sent! Thank you for helping us improve Toon.');
            await showMenu(ctx, user);
        } catch (e) {
            logger.error('Failed to forward bug report', e);
            await ctx.reply('❌ Failed to send report. Please try again later.');
        }
        return;
    }

    if (user.step === 'delete_reason') {
        return executeDeletion(ctx, telegramId, text);
    }
    
    if (user.step === 'upload_title') {
        const updRes = await store.updateUser(telegramId, { step: 'upload_genre', track: { title: text } });
        if (updRes.success) return ctx.reply(`Genre for "${text}"?`);
    }

    if (user.step === 'upload_genre') {
        const track = user.track || {};
        track.genre = text;
        const updRes = await store.updateUser(telegramId, { step: 'upload_file', track });
        if (updRes.success) return ctx.reply(`🎵 Now send the audio file for "${track.title}"`);
    }
});

// ── Audio upload ──────────────────────────────────────
bot.on('audio', async (ctx) => {
    const user = await ensureUser(ctx);
    if (!user || user.step !== 'upload_file') return ctx.reply('Send /upload first.');
    if (!user.walletAddress) return ctx.reply('❌ Please link your wallet first.');

    const statusMsg = await ctx.reply('⏳ Processing audio and metadata...');

    try {
        const file = ctx.message.audio;
        let storageFileId = file.file_id;
        const telegramId = ctx.from.id;

        if (file.file_size / (1024 * 1024) > 50) {
            return ctx.reply('❌ File is too large. Max size is 50MB.');
        }

        // ── Forward to Storage Channel (Intent) ──
        try {
            const channelMsg = await ctx.telegram.sendAudio(STORAGE_CHANNEL_ID, storageFileId, {
                title: user.track.title,
                performer: user.artistName,
                caption: `🎵 Track: ${user.track.title}\n👤 Artist: ${user.artistName}\n🆔 TrackID: ${telegramId}_${Date.now()}`
            });
            storageFileId = channelMsg.audio.file_id;
        } catch (e) {
            logger.warn('Storage channel forward failed, using original fileId', e);
        }

        const trackId = `${telegramId}_${Date.now()}`;
        
        // ── Real NFT Deployment (Execute -> Verify) ──
        const nftInit = await MusicNft.fromInit(
            Address.parse(user.walletAddress.trim()),
            { $$type: 'TrackMetadata', title: user.track.title, uri: `https://toon.music/track/${trackId}`, genre: user.track.genre },
            toNano('0.01'),
            0n
        );

        logger.info('NFT Deployment intent', { trackId, nftAddress: nftInit.address.toString() });
        
        const nftAddr = nftInit.address;
        const stateRes = await client.getContractState(nftAddr);
        const lastLt = stateRes.lastTransaction ? stateRes.lastTransaction.lt : "0";

        const deployerRes = await getDeployer();
        if (!deployerRes.success) throw new Error(deployerRes.error);
        
        const { contract, key } = deployerRes.data;
        const trackNft = client.open(nftInit);
        
        await trackNft.send(contract.sender(key.secretKey), { value: toNano('0.05') }, null);
        await ctx.reply('⏳ NFT deployment sent! Finalizing on-chain...');

        const conf = await waitForTransaction(nftAddr, lastLt);
        if (!conf.success) throw new Error('NFT confirmation timed out');

        // ── Persistent State Update (Success confirmed) ──
        const track = {
            id: trackId, title: user.track.title, genre: user.track.genre,
            artistName: user.artistName, artistId: telegramId, fileId: storageFileId,
            duration: file.duration, contractAddress: nftAddr.toString(), plays: 0
        };

        const addRes = await store.addTrack(telegramId, track);
        if (!addRes.success) throw new Error(`Database update failed: ${addRes.error}`);

        await store.updateUser(telegramId, { step: null, track: {}, reputation: user.reputation + 5 });

        await ctx.reply(`✅ "${track.title}" is officially live on-chain!\nNFT: \`${nftAddr.toString()}\`\nReputation +5! 🎁`, { parse_mode: 'Markdown' });

        // On-chain identity prompt if needed
        if (!user.onChain && REGISTRY_ADDRESS_ENV) {
            const REGISTRY_ADDRESS = Address.parse(REGISTRY_ADDRESS_ENV);
            const artistInit = await ToonArtist.fromInit(Address.parse(user.walletAddress.trim()), REGISTRY_ADDRESS, BigInt(telegramId), `https://toon.music/artist/${telegramId}`);
            
            const deployTx = {
                validUntil: Math.floor(Date.now() / 1000) + 600,
                messages: [{
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
                }]
            };

            await ctx.reply(`🚀 You haven't deployed your Artist Identity yet!`, Markup.inlineKeyboard([
                [Markup.button.callback('🚀 Deploy Now (via Wallet)', `deploy_identity`)]
            ]));
            await store.updateUser(telegramId, { pendingIdentityTx: deployTx });
        }

        try { await ctx.telegram.deleteMessage(ctx.chat.id, statusMsg.message_id); } catch(e) {}
    } catch (err) {
        logger.error('Audio upload/NFT failed', { telegramId: ctx.from.id, error: err.message });
        await ctx.reply(`❌ Upload failed: ${err.message}`);
    }
});

// Simple HTTP server for Railway health check
const http = require('http');
const server = http.createServer((req, res) => {
    res.writeHead(200);
    res.end('Toon Bot is alive');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    logger.info(`Health check server listening on port ${PORT}`);
    
    // Start the bot ONLY after successfully binding the port
    bot.launch()
        .then(() => logger.info('🎵 Toon bot running...'))
        .catch(err => {
            logger.error('Failed to launch bot', err);
            process.exit(1);
        });
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
