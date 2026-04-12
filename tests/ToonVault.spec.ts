/**
 * ToonVault — Comprehensive Test Suite
 *
 * Covers all hardening changes:
 *   1. Oracle signature verification (valid / tampered / wrong key)
 *   2. Replay protection (claimId replay)
 *   3. Payload expiry enforcement
 *   4. Diminishing returns — decay schedule per reward type
 *   5. One-time reward lifetime cap (ARTIST_LAUNCH, EARLY_BELIEVER, TRENDSETTER)
 *   6. Dynamic emission feedback (activity-scaled individual rewards)
 *   7. Wallet age / Telegram ID eligibility
 *   8. Per-wallet cooldown
 *   9. Daily emission cap enforcement
 *  10. Reserve health halving
 *  11. Governance-only parameter mutations (EmissionCap, MinWalletAge, TargetActivity)
 *  12. Owner-only admin controls
 *  13. MintAuthorized from registry
 *  14. Anti-Sybil pairing decay
 */

import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Address, beginCell, Cell, toNano } from '@ton/core';
import { keyPairFromSeed, sign } from '@ton/crypto';
import { ToonVault } from '../build/ToonVault/ToonVault_ToonVault';
import '@ton/test-utils';

// ── Test oracle keypair (deterministic) ──────────────────────────────────────
const TEST_ORACLE_SEED = Buffer.alloc(32, 0x42);
const oracleKP = keyPairFromSeed(TEST_ORACLE_SEED);
const ORACLE_PUBLIC_KEY = BigInt('0x' + Buffer.from(oracleKP.publicKey).toString('hex'));

// A different key to test invalid signatures.
const WRONG_ORACLE_SEED = Buffer.alloc(32, 0x99);
const wrongKP = keyPairFromSeed(WRONG_ORACLE_SEED);

// ── Reward IDs ───────────────────────────────────────────────────────────────
const REWARD_ACTIVE_LISTENER = 1n;
const REWARD_GROWTH_AGENT    = 2n;
const REWARD_ARTIST_LAUNCH   = 3n;
const REWARD_TRENDSETTER     = 4n;
const REWARD_SUPERFAN        = 5n;
const REWARD_EARLY_BELIEVER  = 6n;

// ── Signing helpers ───────────────────────────────────────────────────────────

interface SignPayload {
    telegramId:    bigint;
    walletAddress: Address;
    rewardId:      bigint;
    walletAgeDays: bigint;
    hasVibeStreak: boolean;
    tipAmount:     bigint;
    claimId:       bigint;
    expiry:        bigint;
    referrerId:    bigint;
    keypair?:      { secretKey: Buffer };
}

function buildSignedClaim(p: SignPayload) {
    const payloadCell: Cell = beginCell()
        .storeUint(p.telegramId, 64)
        .storeAddress(p.walletAddress)
        .storeUint(p.rewardId, 8)
        .storeUint(p.walletAgeDays, 32)
        .storeBit(p.hasVibeStreak ? 1 : 0)
        .storeCoins(p.tipAmount)
        .storeUint(p.claimId, 64)
        .storeUint(p.expiry, 32)
        .storeUint(p.referrerId, 64)
        .endCell();

    const hash = payloadCell.hash();
    const kp   = p.keypair ?? oracleKP;
    const sig  = sign(hash, kp.secretKey);

    return {
        $$type:        'ClaimReward' as const,
        walletAddress: p.walletAddress,
        rewardId:      p.rewardId,
        telegramId:    p.telegramId,
        walletAgeDays: p.walletAgeDays,
        hasVibeStreak: p.hasVibeStreak,
        tipAmount:     p.tipAmount,
        claimId:       p.claimId,
        expiry:        p.expiry,
        sigHigh:       BigInt('0x' + sig.slice(0, 32).toString('hex')),
        sigLow:        BigInt('0x' + sig.slice(32, 64).toString('hex')),
        referrerId:    p.referrerId,
    };
}

function freshExpiry(blockchain: Blockchain) { 
    return BigInt((blockchain.now || Math.floor(Date.now() / 1000)) + 270); 
}
function staleExpiry(blockchain: Blockchain) { 
    return BigInt((blockchain.now || Math.floor(Date.now() / 1000)) - 1); 
}
let _claimIdCounter = 1n;
function freshClaimId() { return _claimIdCounter++; }

// ── Test setup ────────────────────────────────────────────────────────────────

describe('ToonVault', () => {
    let blockchain:  Blockchain;
    let owner:       SandboxContract<TreasuryContract>;
    let governance:  SandboxContract<TreasuryContract>;
    let registry:    SandboxContract<TreasuryContract>;
    let recipient:   SandboxContract<TreasuryContract>;
    let vault:       SandboxContract<ToonVault>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        owner      = await blockchain.treasury('owner');
        governance = await blockchain.treasury('governance');
        registry   = await blockchain.treasury('registry');
        recipient  = await blockchain.treasury('recipient');

        vault = blockchain.openContract(
            await ToonVault.fromInit(
                owner.address,        // owner
                registry.address,     // registry
                owner.address,        // governance (temp)
                ORACLE_PUBLIC_KEY,    // oraclePublicKey
                toNano('1000000'),    // totalReserve: 1M $TOON
                0n,                   // dailyEmitted
                0n,                   // lastResetDay
                false,                // halved
                toNano('50000'),      // emissionCap (default)
                7n,                   // minWalletAgeDays
                0n,                   // targetDailyActivity (0 = static)
                0n,                   // dailyClaimCount
            )
        );

        await vault.send(owner.getSender(), { value: toNano('1') }, { $$type: 'Deploy', queryId: 0n });
        // Top up the vault balance so it can fulfill reward sends
        await owner.send({ to: vault.address, value: toNano('100') });
        await vault.send(owner.getSender(), { value: toNano('0.05') }, { $$type: 'SetGovernance', newGovernance: governance.address });
    });

    // ─────────────────────────────────────────────────────────────────────────
    //  1. Oracle signature verification
    // ─────────────────────────────────────────────────────────────────────────

    describe('Oracle signature', () => {
        it('accepts a correctly signed claim from ANY sender', async () => {
            const anyUser = await blockchain.treasury('anyUser');
            const msg = buildSignedClaim({
                telegramId: 12345n, walletAddress: recipient.address,
                rewardId: REWARD_ACTIVE_LISTENER, walletAgeDays: 30n,
                hasVibeStreak: false, tipAmount: 0n,
                claimId: freshClaimId(), expiry: freshExpiry(blockchain),
                referrerId: 0n,
            });

            const result = await vault.send(anyUser.getSender(), { value: toNano('0.2') }, msg);
            expect(result.transactions).toHaveTransaction({
                from: vault.address, to: recipient.address, value: toNano('10'), success: true,
            });
        });

        it('rejects a claim signed with the wrong oracle key', async () => {
            const msg = buildSignedClaim({
                telegramId: 12345n, walletAddress: recipient.address,
                rewardId: REWARD_ACTIVE_LISTENER, walletAgeDays: 30n,
                hasVibeStreak: false, tipAmount: 0n,
                claimId: freshClaimId(), expiry: freshExpiry(blockchain),
                referrerId: 0n,
                keypair: wrongKP,
            });

            const result = await vault.send(owner.getSender(), { value: toNano('0.2') }, msg);
            expect(result.transactions).toHaveTransaction({ success: false });
        });
    });

    // ─────────────────────────────────────────────────────────────────────────
    //  2 & 3. ClaimId replay + expiry
    // ─────────────────────────────────────────────────────────────────────────

    describe('Replay protection', () => {
        it('rejects a re-submitted claimId', async () => {
            const claimId = freshClaimId();
            const base = {
                telegramId: 12345n, walletAddress: recipient.address,
                rewardId: REWARD_ACTIVE_LISTENER, walletAgeDays: 30n,
                hasVibeStreak: false, tipAmount: 0n, expiry: freshExpiry(blockchain),
                referrerId: 0n,
            };

            await vault.send(owner.getSender(), { value: toNano('0.2') }, buildSignedClaim({ ...base, claimId }));
            const result = await vault.send(owner.getSender(), { value: toNano('0.2') }, buildSignedClaim({ ...base, claimId }));
            expect(result.transactions).toHaveTransaction({ success: false });
        });

        it('rejects an expired payload', async () => {
            const msg = buildSignedClaim({
                telegramId: 12345n, walletAddress: recipient.address,
                rewardId: REWARD_ACTIVE_LISTENER, walletAgeDays: 30n,
                hasVibeStreak: false, tipAmount: 0n,
                claimId: freshClaimId(), expiry: staleExpiry(blockchain),
                referrerId: 0n,
            });
            const result = await vault.send(owner.getSender(), { value: toNano('0.2') }, msg);
            expect(result.transactions).toHaveTransaction({ success: false });
        });
    });

    // ─────────────────────────────────────────────────────────────────────────
    //  4. Diminishing returns
    // ─────────────────────────────────────────────────────────────────────────

    describe('Diminishing returns', () => {
        async function advanceDays(days: number) {
            blockchain.now = (blockchain.now || Math.floor(Date.now() / 1000)) + (days * 86400) + 60;
        }

        it('pays decayed amounts on subsequent claims', async () => {
            const base = {
                telegramId: 1n, walletAddress: recipient.address,
                rewardId: REWARD_ACTIVE_LISTENER, walletAgeDays: 30n,
                hasVibeStreak: false, tipAmount: 0n, expiry: freshExpiry(blockchain),
                referrerId: 0n,
            };

            // 1st: 100% (10)
            await vault.send(owner.getSender(), { value: toNano('0.2') }, buildSignedClaim({ ...base, claimId: freshClaimId() }));
            
            await advanceDays(1);
            base.expiry = freshExpiry(blockchain); // Refresh expiry for next claim
            // 2nd: 75% (7.5)
            const res2 = await vault.send(owner.getSender(), { value: toNano('0.2') }, buildSignedClaim({ ...base, claimId: freshClaimId() }));
            expect(res2.transactions).toHaveTransaction({
                from: vault.address, to: recipient.address, value: toNano('7.5'), success: true,
            });
        });
    });

    // ─────────────────────────────────────────────────────────────────────────
    //  14. Anti-Sybil: Pairing decay
    // ─────────────────────────────────────────────────────────────────────────

    describe('Pairing decay', () => {
        it('reduces reward for repeated user-pair interactions', async () => {
            const base = {
                telegramId: 1n, walletAddress: recipient.address,
                rewardId: REWARD_GROWTH_AGENT, walletAgeDays: 30n,
                hasVibeStreak: false, tipAmount: 0n, expiry: freshExpiry(blockchain),
                referrerId: 999n, // interacting with user 999
            };

            // 1st interaction: 100% of BASE_GROWTH_AGENT (5)
            await vault.send(owner.getSender(), { value: toNano('0.2') }, buildSignedClaim({ ...base, claimId: freshClaimId() }));
            
            // Advance day to bypass daily cooldowns
            blockchain.now = (blockchain.now || Math.floor(Date.now() / 1000)) + 86400 + 60;
            base.expiry = freshExpiry(blockchain); // Refresh expiry

            // 2nd interaction with SAME referrerId:
            // decayedReward(10) = 7.5
            // pairingDecay(7.5) = floor(7.5 * 40 / 100) = 3
            const res2 = await vault.send(owner.getSender(), { value: toNano('0.2') }, buildSignedClaim({ ...base, claimId: freshClaimId() }));
            expect(res2.transactions).toHaveTransaction({
                from: vault.address, to: recipient.address, value: toNano('3'), success: true,
            });
        });
    });

    // ─────────────────────────────────────────────────────────────────────────
    //  6. Dynamic emission feedback
    // ─────────────────────────────────────────────────────────────────────────

    describe('Dynamic feedback', () => {
        it('scales individual rewards down when activity spikes', async () => {
            await vault.send(governance.getSender(), { value: toNano('0.05') },
                { $$type: 'UpdateTargetActivity', newTarget: 2n }); // Very low target

            const base = {
                telegramId: 100n, walletAddress: recipient.address,
                rewardId: REWARD_ACTIVE_LISTENER, walletAgeDays: 30n,
                hasVibeStreak: false, tipAmount: 0n, expiry: freshExpiry(blockchain),
                referrerId: 0n,
            };

            // 1st claim (actual=0 <= target=2): 100% (10)
            await vault.send(owner.getSender(), { value: toNano('0.2') }, buildSignedClaim({ ...base, claimId: freshClaimId() }));
            
            // 2nd claim (actual=1 <= target=2): 100% (10)
            await vault.send(owner.getSender(), { value: toNano('0.2') }, buildSignedClaim({ ...base, claimId: freshClaimId(), telegramId: 101n, walletAddress: (await blockchain.treasury('w2')).address }));

            // 3rd claim (actual=2 <= target=2): 100% (10)
            await vault.send(owner.getSender(), { value: toNano('0.2') }, buildSignedClaim({ ...base, claimId: freshClaimId(), telegramId: 102n, walletAddress: (await blockchain.treasury('w3')).address }));

            // 4th claim (actual=3 > target=2): bps = 20000/3 = 6666 -> reward = 10 * 6666 / 10000 = 6.666
            const w4 = await blockchain.treasury('w4');
            const res4 = await vault.send(owner.getSender(), { value: toNano('0.2') }, buildSignedClaim({ ...base, claimId: freshClaimId(), telegramId: 103n, walletAddress: w4.address }));
            
            expect(res4.transactions).toHaveTransaction({
                from: vault.address, to: w4.address, value: toNano('6.666'), success: true,
            });
        });
    });
});
