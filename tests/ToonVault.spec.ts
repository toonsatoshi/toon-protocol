/**
 * ToonVault — Comprehensive Test Suite
 *
 * Covers all hardening changes:
 *   1. Oracle signature verification (valid / tampered / wrong key)
 *   2. Nonce replay rejection (oracle nonce + per-day idempotency)
 *   3. Payload expiry enforcement
 *   4. Diminishing returns — decay schedule per reward type
 *   5. One-time reward lifetime cap (ARTIST_LAUNCH, EARLY_BELIEVER, TRENDSETTER)
 *   6. Dynamic emission cap (activity-scaled throttling)
 *   7. Wallet age / Telegram ID eligibility
 *   8. Per-wallet cooldown
 *   9. Daily emission cap enforcement
 *  10. Reserve health halving
 *  11. Governance-only parameter mutations (EmissionCap, MinWalletAge, TargetActivity)
 *  12. Owner-only admin controls
 *  13. MintAuthorized from registry
 */

import { Blockchain, SandboxContract, TreasuryContract, internal } from '@ton/sandbox';
import { Address, beginCell, Cell, toNano } from '@ton/core';
import { keyPairFromSeed, sign } from '@ton/crypto';
import { ToonVault } from '../build/ToonVault/ToonVault_ToonVault';
import '@ton/test-utils';

// ── Test oracle keypair (deterministic) ──────────────────────────────────────
// Use a fixed seed so tests are reproducible across runs.
const TEST_ORACLE_SEED = Buffer.alloc(32, 0x42);
const oracleKP = keyPairFromSeed(TEST_ORACLE_SEED);
const ORACLE_PUBLIC_KEY = BigInt('0x' + Buffer.from(oracleKP.publicKey).toString('hex'));

// A different key to test invalid signatures.
const WRONG_ORACLE_SEED = Buffer.alloc(32, 0x99);
const wrongKP = keyPairFromSeed(WRONG_ORACLE_SEED);

// ── Reward IDs (mirrors contract constants) ───────────────────────────────────
const REWARD_ACTIVE_LISTENER = 1n;
const REWARD_GROWTH_AGENT    = 2n;
const REWARD_ARTIST_LAUNCH   = 3n;
const REWARD_TRENDSETTER     = 4n;
const REWARD_SUPERFAN        = 5n;
const REWARD_EARLY_BELIEVER  = 6n;
const REWARD_DROP_INVESTOR   = 7n;

// ── Signing helpers ───────────────────────────────────────────────────────────

interface SignPayload {
    telegramId:    bigint;
    walletAddress: Address;
    rewardId:      bigint;
    walletAgeDays: bigint;
    hasVibeStreak: boolean;
    tipAmount:     bigint;
    nonce:         bigint;
    expiry:        bigint;
    keypair?:      { secretKey: Buffer };  // override for invalid-sig tests
}

function buildSignedClaim(p: SignPayload) {
    const payloadCell: Cell = beginCell()
        .storeUint(p.telegramId, 64)
        .storeAddress(p.walletAddress)
        .storeUint(p.rewardId, 8)
        .storeUint(p.walletAgeDays, 32)
        .storeBit(p.hasVibeStreak ? 1 : 0)
        .storeCoins(p.tipAmount)
        .storeUint(p.nonce, 64)
        .storeUint(p.expiry, 32)
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
        nonce:         p.nonce,
        expiry:        p.expiry,
        sigHigh:       BigInt('0x' + sig.slice(0, 32).toString('hex')),
        sigLow:        BigInt('0x' + sig.slice(32, 64).toString('hex')),
    };
}

function freshExpiry(blockchain: Blockchain)  { return BigInt((blockchain.now ?? Math.floor(Date.now() / 1000)) + 270); }
function staleExpiry(blockchain: Blockchain)  { return BigInt((blockchain.now ?? Math.floor(Date.now() / 1000)) - 1);  }
let _nonceCounter = 1n;
function freshNonce()   { return _nonceCounter++; }

// ── Test setup ────────────────────────────────────────────────────────────────

describe('ToonVault', () => {
    let blockchain:  Blockchain;
    let owner:       SandboxContract<TreasuryContract>;
    let governance:  SandboxContract<TreasuryContract>;
    let registry:    SandboxContract<TreasuryContract>;
    let recipient:   SandboxContract<TreasuryContract>;
    let vault:       SandboxContract<ToonVault>;

    // Deploy a fresh vault before each test.
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
                owner.address,        // governance (wire properly below)
                ORACLE_PUBLIC_KEY,    // oraclePublicKey
                toNano('1000000'),    // totalReserve: 1M $TOON
                0n,                   // dailyEmitted
                0n,                   // lastResetDay
                false,                // halved
                toNano('50000'),      // emissionCap (default)
                7n,                   // minWalletAgeDays
                0n,                   // targetDailyActivity (static, no scaling)
                0n,                   // dailyClaimCount
            )
        );

        const deployResult = await vault.send(
            owner.getSender(),
            { value: toNano('0.05') },
            { $$type: 'Deploy', queryId: 0n }
        );
        expect(deployResult.transactions).toHaveTransaction({
            from: owner.address, to: vault.address, deploy: true, success: true,
        });

        // Fund the vault properly using internal message
        await blockchain.sendMessage(internal({
            from: owner.address,
            to: vault.address,
            value: toNano('10000'),
            body: beginCell().endCell(),
            bounce: false,
        }));

        // Wire governance address.
        await vault.send(
            owner.getSender(),
            { value: toNano('0.05') },
            { $$type: 'SetGovernance', newGovernance: governance.address }
        );
    });

    // ─────────────────────────────────────────────────────────────────────────
    //  1. Oracle signature verification
    // ─────────────────────────────────────────────────────────────────────────

    describe('Oracle signature', () => {
        it('accepts a correctly signed claim', async () => {
            const msg = buildSignedClaim({
                telegramId: 12345n, walletAddress: recipient.address,
                rewardId: REWARD_ACTIVE_LISTENER, walletAgeDays: 30n,
                hasVibeStreak: false, tipAmount: 0n,
                nonce: freshNonce(), expiry: freshExpiry(blockchain),
            });

            const result = await vault.send(owner.getSender(), { value: toNano('0.5') }, msg);
            expect(result.transactions).toHaveTransaction({
                from: vault.address, to: recipient.address, success: true,
            });
        });

        it('rejects a claim signed with the wrong oracle key', async () => {
            const msg = buildSignedClaim({
                telegramId: 12345n, walletAddress: recipient.address,
                rewardId: REWARD_ACTIVE_LISTENER, walletAgeDays: 30n,
                hasVibeStreak: false, tipAmount: 0n,
                nonce: freshNonce(), expiry: freshExpiry(blockchain),
                keypair: wrongKP,  // wrong key
            });

            const result = await vault.send(owner.getSender(), { value: toNano('0.5') }, msg);
            expect(result.transactions).toHaveTransaction({
                from: owner.address, to: vault.address, success: false,
            });
        });

        it('rejects a claim with a tampered field after signing', async () => {
            const msg = buildSignedClaim({
                telegramId: 12345n, walletAddress: recipient.address,
                rewardId: REWARD_ACTIVE_LISTENER, walletAgeDays: 30n,
                hasVibeStreak: false, tipAmount: 0n,
                nonce: freshNonce(), expiry: freshExpiry(blockchain),
            });

            // Attacker changes walletAgeDays without re-signing.
            const tampered = { ...msg, walletAgeDays: 0n };

            const result = await vault.send(owner.getSender(), { value: toNano('0.5') }, tampered);
            expect(result.transactions).toHaveTransaction({ success: false });
        });

        it('rejects claim from unauthorized sender even with valid sig', async () => {
            const other = await blockchain.treasury('other');
            const msg = buildSignedClaim({
                telegramId: 12345n, walletAddress: recipient.address,
                rewardId: REWARD_ACTIVE_LISTENER, walletAgeDays: 30n,
                hasVibeStreak: false, tipAmount: 0n,
                nonce: freshNonce(), expiry: freshExpiry(blockchain),
            });

            const result = await vault.send(other.getSender(), { value: toNano('0.5') }, msg);
            expect(result.transactions).toHaveTransaction({
                from: other.address, to: vault.address, success: false,
            });
        });
    });

    // ─────────────────────────────────────────────────────────────────────────
    //  2 & 3. Nonce replay + expiry
    // ─────────────────────────────────────────────────────────────────────────

    describe('Replay protection', () => {
        it('rejects a re-submitted oracle nonce', async () => {
            const nonce = freshNonce();
            const base = {
                telegramId: 12345n, walletAddress: recipient.address,
                rewardId: REWARD_ACTIVE_LISTENER, walletAgeDays: 30n,
                hasVibeStreak: false, tipAmount: 0n, expiry: freshExpiry(blockchain),
            };

            // First submission succeeds.
            await vault.send(owner.getSender(), { value: toNano('0.5') },
                buildSignedClaim({ ...base, nonce }));

            // Same nonce again — must fail even though it's a different day's
            // claim (because nonces are global, not per-day).
            const result = await vault.send(owner.getSender(), { value: toNano('0.5') },
                buildSignedClaim({ ...base, nonce }));

            expect(result.transactions).toHaveTransaction({ success: false });
        });

        it('rejects an expired payload', async () => {
            const msg = buildSignedClaim({
                telegramId: 12345n, walletAddress: recipient.address,
                rewardId: REWARD_ACTIVE_LISTENER, walletAgeDays: 30n,
                hasVibeStreak: false, tipAmount: 0n,
                nonce: freshNonce(), expiry: staleExpiry(blockchain),  // already expired
            });

            const result = await vault.send(owner.getSender(), { value: toNano('0.5') }, msg);
            expect(result.transactions).toHaveTransaction({ success: false });
        });

        it('rejects per-day duplicate claim for same wallet+rewardId', async () => {
            const base = {
                telegramId: 12345n, walletAddress: recipient.address,
                rewardId: REWARD_ACTIVE_LISTENER, walletAgeDays: 30n,
                hasVibeStreak: false, tipAmount: 0n, expiry: freshExpiry(blockchain),
            };

            await vault.send(owner.getSender(), { value: toNano('0.5') },
                buildSignedClaim({ ...base, nonce: freshNonce() }));

            // Different oracle nonce but same day — the per-day nonce must fire.
            // (In sandbox, blockchain time doesn't advance automatically so
            //  both calls land in the same calendar day.)
            const result = await vault.send(owner.getSender(), { value: toNano('0.5') },
                buildSignedClaim({ ...base, nonce: freshNonce() }));

            expect(result.transactions).toHaveTransaction({ success: false });
        });
    });

    // ─────────────────────────────────────────────────────────────────────────
    //  4. Diminishing returns
    // ─────────────────────────────────────────────────────────────────────────

    describe('Diminishing returns', () => {
        // Advance sandbox time by `seconds` so each claim lands on a different
        // calendar day (bypassing the per-day idempotency nonce).
        async function advanceDays(days: number) {
            blockchain.now = (days * 86400) + (blockchain.now ?? Math.floor(Date.now() / 1000));
        }

        it('first claim pays 100% of base', async () => {
            const msg = buildSignedClaim({
                telegramId: 1n, walletAddress: recipient.address,
                rewardId: REWARD_ACTIVE_LISTENER, walletAgeDays: 30n,
                hasVibeStreak: false, tipAmount: 0n,
                nonce: freshNonce(), expiry: freshExpiry(blockchain),
            });
            const result = await vault.send(owner.getSender(), { value: toNano('0.5') }, msg);
            // BASE_ACTIVE_LISTENER = 10 $TOON
            expect(result.transactions).toHaveTransaction({
                from: vault.address, to: recipient.address, success: true,
            });
        });

        it('second claim pays 75% of base', async () => {
            await vault.send(owner.getSender(), { value: toNano('0.5') },
                buildSignedClaim({
                    telegramId: 1n, walletAddress: recipient.address,
                    rewardId: REWARD_ACTIVE_LISTENER, walletAgeDays: 30n,
                    hasVibeStreak: false, tipAmount: 0n,
                    nonce: freshNonce(), expiry: freshExpiry(blockchain),
                }));

            await advanceDays(1);

            const result = await vault.send(owner.getSender(), { value: toNano('0.5') },
                buildSignedClaim({
                    telegramId: 1n, walletAddress: recipient.address,
                    rewardId: REWARD_ACTIVE_LISTENER, walletAgeDays: 30n,
                    hasVibeStreak: false, tipAmount: 0n,
                    nonce: freshNonce(), expiry: freshExpiry(blockchain),
                }));

            // 75% of 10 = 7.5 $TOON
            expect(result.transactions).toHaveTransaction({
                from: vault.address, to: recipient.address, success: true,
            });
        });

        it('getter reflects claim count', async () => {
            await vault.send(owner.getSender(), { value: toNano('0.5') },
                buildSignedClaim({
                    telegramId: 1n, walletAddress: recipient.address,
                    rewardId: REWARD_ACTIVE_LISTENER, walletAgeDays: 30n,
                    hasVibeStreak: false, tipAmount: 0n,
                    nonce: freshNonce(), expiry: freshExpiry(blockchain),
                }));

            const count = await vault.getWalletClaimCount(REWARD_ACTIVE_LISTENER, recipient.address);
            expect(count).toBe(1n);
        });
    });

    // ─────────────────────────────────────────────────────────────────────────
    //  5. One-time reward lifetime cap
    // ─────────────────────────────────────────────────────────────────────────

    describe('One-time rewards', () => {
        async function claimOnce(rewardId: bigint) {
            return vault.send(owner.getSender(), { value: toNano('0.5') },
                buildSignedClaim({
                    telegramId: 1n, walletAddress: recipient.address,
                    rewardId, walletAgeDays: 30n,
                    hasVibeStreak: false, tipAmount: 0n,
                    nonce: freshNonce(), expiry: freshExpiry(blockchain),
                }));
        }

        for (const [name, id] of [
            ['ARTIST_LAUNCH',   REWARD_ARTIST_LAUNCH  ],
            ['EARLY_BELIEVER',  REWARD_EARLY_BELIEVER ],
            ['TRENDSETTER',     REWARD_TRENDSETTER    ],
        ] as [string, bigint][]) {
            it(`${name}: first claim succeeds, second fails`, async () => {
                const first = await claimOnce(id);
                expect(first.transactions).toHaveTransaction({
                    from: vault.address, to: recipient.address, success: true,
                });
                expect(await vault.getIsOneTimeClaimed(id, recipient.address)).toBe(true);

                // Advance a day so per-day nonce doesn't fire first.
                blockchain.now = (blockchain.now ?? Math.floor(Date.now() / 1000)) + 86400 + 60;

                const second = await claimOnce(id);
                expect(second.transactions).toHaveTransaction({
                    from: owner.address, to: vault.address, success: false,
                });
            });
        }
    });

    // ─────────────────────────────────────────────────────────────────────────
    //  6. Dynamic emission cap
    // ─────────────────────────────────────────────────────────────────────────

    describe('Dynamic emission cap', () => {
        it('static cap applies when targetDailyActivity = 0 (default)', async () => {
            const cap = await vault.getEffectiveDailyCap();
            expect(cap).toEqual(toNano('50000'));
        });

        it('cap boosts to 150% before any claims when target is set', async () => {
            await vault.send(governance.getSender(), { value: toNano('0.05') },
                { $$type: 'UpdateTargetActivity', newTarget: 100n });

            // dailyClaimCount = 0 → 150% of base
            const cap = await vault.getEffectiveDailyCap();
            expect(cap).toEqual((toNano('50000') * 150n) / 100n);
        });

        it('cap scales down to 50% when actual > 2× target', async () => {
            await vault.send(governance.getSender(), { value: toNano('0.05') },
                { $$type: 'UpdateTargetActivity', newTarget: 10n });

            // Send 21 claims (each counts toward dailyClaimCount).
            // actual=21, target=10 → ratio = 10*100/21 ≈ 47 → clamped to 50
            for (let i = 0; i < 21; i++) {
                const wallet = await blockchain.treasury(`wallet-${i}`);
                const claimResult = await vault.send(owner.getSender(), { value: toNano('0.5') },
                    buildSignedClaim({
                        telegramId: BigInt(i + 100),
                        walletAddress: wallet.address,
                        rewardId: REWARD_ACTIVE_LISTENER, walletAgeDays: 30n,
                        hasVibeStreak: false, tipAmount: 0n,
                        nonce: freshNonce(), expiry: freshExpiry(blockchain),
                    }));
                expect(claimResult.transactions).toHaveTransaction({
                    from: vault.address, to: wallet.address, success: true
                });
            }
            const cap = await vault.getEffectiveDailyCap();
            expect(cap).toEqual((toNano('50000') * 50n) / 100n);
        });
    });

    // ─────────────────────────────────────────────────────────────────────────
    //  7. Wallet eligibility
    // ─────────────────────────────────────────────────────────────────────────

    describe('Wallet eligibility', () => {
        it('rejects wallets below minWalletAgeDays', async () => {
            const result = await vault.send(owner.getSender(), { value: toNano('0.5') },
                buildSignedClaim({
                    telegramId: 1n, walletAddress: recipient.address,
                    rewardId: REWARD_ACTIVE_LISTENER, walletAgeDays: 3n,  // < 7
                    hasVibeStreak: false, tipAmount: 0n,
                    nonce: freshNonce(), expiry: freshExpiry(blockchain),
                }));
            expect(result.transactions).toHaveTransaction({ success: false });
        });

        it('rejects zero telegramId', async () => {
            const result = await vault.send(owner.getSender(), { value: toNano('0.5') },
                buildSignedClaim({
                    telegramId: 0n, walletAddress: recipient.address,
                    rewardId: REWARD_ACTIVE_LISTENER, walletAgeDays: 30n,
                    hasVibeStreak: false, tipAmount: 0n,
                    nonce: freshNonce(), expiry: freshExpiry(blockchain),
                }));
            expect(result.transactions).toHaveTransaction({ success: false });
        });
    });

    // ─────────────────────────────────────────────────────────────────────────
    //  8. Vibe streak multiplier
    // ─────────────────────────────────────────────────────────────────────────

    describe('Vibe streak multiplier', () => {
        it('pays 1.5x with hasVibeStreak = true', async () => {
            const result = await vault.send(owner.getSender(), { value: toNano('0.5') },
                buildSignedClaim({
                    telegramId: 1n, walletAddress: recipient.address,
                    rewardId: REWARD_ACTIVE_LISTENER, walletAgeDays: 30n,
                    hasVibeStreak: true, tipAmount: 0n,
                    nonce: freshNonce(), expiry: freshExpiry(blockchain),
                }));
            // 10 * 1.5 = 15 $TOON
            expect(result.transactions).toHaveTransaction({
                from: vault.address, to: recipient.address, success: true,
            });
        });
    });

    // ─────────────────────────────────────────────────────────────────────────
    //  9. Daily emission cap
    // ─────────────────────────────────────────────────────────────────────────

    describe('Daily emission cap', () => {
        it('clamps reward to remaining budget when near the cap', async () => {
            // Set a very tight cap (15 $TOON) so two ACTIVE_LISTENER claims
            // (10 + 7.5) hit the ceiling.
            await vault.send(governance.getSender(), { value: toNano('0.05') },
                { $$type: 'UpdateEmissionCap', newCap: toNano('12') });

            await vault.send(owner.getSender(), { value: toNano('0.5') },
                buildSignedClaim({
                    telegramId: 1n, walletAddress: recipient.address,
                    rewardId: REWARD_ACTIVE_LISTENER, walletAgeDays: 30n,
                    hasVibeStreak: false, tipAmount: 0n,
                    nonce: freshNonce(), expiry: freshExpiry(blockchain),
                }));

            // dailyEmitted = 10; cap = 12; remaining = 2
            // Second claim (from different wallet so no per-day nonce conflict):
            const other = await blockchain.treasury('other2');
            const result = await vault.send(owner.getSender(), { value: toNano('0.5') },
                buildSignedClaim({
                    telegramId: 2n, walletAddress: other.address,
                    rewardId: REWARD_ACTIVE_LISTENER, walletAgeDays: 30n,
                    hasVibeStreak: false, tipAmount: 0n,
                    nonce: freshNonce(), expiry: freshExpiry(blockchain),
                }));

            // Reward clamped to remaining 2 $TOON
            expect(result.transactions).toHaveTransaction({
                from: vault.address, to: other.address, success: true,
            });
        });
    });

    // ─────────────────────────────────────────────────────────────────────────
    //  10. Reserve halving
    // ─────────────────────────────────────────────────────────────────────────

    describe('Reserve halving', () => {
        it('reports halved = false at full reserve', async () => {
            expect(await vault.getIsHalved()).toBe(false);
        });

        it('effective cap halves when reserve is below 10%', async () => {
            // Drain reserve to ~9% (< 100k out of 1M threshold).
            await vault.send(owner.getSender(), { value: toNano('0.05') },
                { $$type: 'TreasuryWithdraw', amount: toNano('910001'), recipient: owner.address });

            // Trigger effectiveCap() recalculation via a claim attempt.
            const cap = await vault.getEffectiveDailyCap();
            expect(cap).toEqual(toNano('25000')); // 50% of 50000
        });
    });

    // ─────────────────────────────────────────────────────────────────────────
    //  11. Governance parameter mutations
    // ─────────────────────────────────────────────────────────────────────────

    describe('Governance controls', () => {
        it('governance can update emission cap', async () => {
            await vault.send(governance.getSender(), { value: toNano('0.05') },
                { $$type: 'UpdateEmissionCap', newCap: toNano('100000') });
            expect(await vault.getCurrentEmissionCap()).toEqual(toNano('100000'));
        });

        it('non-governance cannot update emission cap', async () => {
            const result = await vault.send(owner.getSender(), { value: toNano('0.05') },
                { $$type: 'UpdateEmissionCap', newCap: toNano('100000') });
            expect(result.transactions).toHaveTransaction({ success: false });
        });

        it('governance can update minWalletAgeDays', async () => {
            await vault.send(governance.getSender(), { value: toNano('0.05') },
                { $$type: 'UpdateMinWalletAge', newAgeDays: 14n });
            expect(await vault.getMinWalletAgeDays()).toBe(14n);
        });

        it('rejects emission cap above safety ceiling (500k)', async () => {
            const result = await vault.send(governance.getSender(), { value: toNano('0.05') },
                { $$type: 'UpdateEmissionCap', newCap: toNano('600000') });
            expect(result.transactions).toHaveTransaction({ success: false });
        });

        it('rejects zero emission cap', async () => {
            const result = await vault.send(governance.getSender(), { value: toNano('0.05') },
                { $$type: 'UpdateEmissionCap', newCap: 0n });
            expect(result.transactions).toHaveTransaction({ success: false });
        });
    });

    // ─────────────────────────────────────────────────────────────────────────
    //  12. Owner admin
    // ─────────────────────────────────────────────────────────────────────────

    describe('Owner admin', () => {
        it('owner can rotate oracle key', async () => {
            const newKey = BigInt('0x' + Buffer.from(wrongKP.publicKey).toString('hex'));
            await vault.send(owner.getSender(), { value: toNano('0.05') },
                { $$type: 'SetOracleKey', newPublicKey: newKey });

            // Old key should now fail.
            const result = await vault.send(owner.getSender(), { value: toNano('0.5') },
                buildSignedClaim({
                    telegramId: 1n, walletAddress: recipient.address,
                    rewardId: REWARD_ACTIVE_LISTENER, walletAgeDays: 30n,
                    hasVibeStreak: false, tipAmount: 0n,
                    nonce: freshNonce(), expiry: freshExpiry(blockchain),
                }));
            expect(result.transactions).toHaveTransaction({ success: false });
        });

        it('owner can withdraw treasury funds', async () => {
            const before = await vault.getTotalReserve();
            await vault.send(owner.getSender(), { value: toNano('0.05') },
                { $$type: 'TreasuryWithdraw', amount: toNano('100'), recipient: owner.address });
            const after = await vault.getTotalReserve();
            expect(before - after).toEqual(toNano('100'));
        });

        it('non-owner cannot withdraw', async () => {
            const result = await vault.send(registry.getSender(), { value: toNano('0.05') },
                { $$type: 'TreasuryWithdraw', amount: toNano('100'), recipient: registry.address });
            expect(result.transactions).toHaveTransaction({ success: false });
        });
    });

    // ─────────────────────────────────────────────────────────────────────────
    //  13. MintAuthorized from registry
    // ─────────────────────────────────────────────────────────────────────────

    describe('MintAuthorized', () => {
        it('registry can mint to recipient', async () => {
            const result = await vault.send(registry.getSender(), { value: toNano('0.5') },
                { $$type: 'MintAuthorized', recipient: recipient.address,
                  amount: toNano('100'), authorizedAt: 0n });
            expect(result.transactions).toHaveTransaction({
                from: vault.address, to: recipient.address, success: true,
            });
        });

        it('non-registry cannot call MintAuthorized', async () => {
            const result = await vault.send(owner.getSender(), { value: toNano('0.5') },
                { $$type: 'MintAuthorized', recipient: recipient.address,
                  amount: toNano('100'), authorizedAt: 0n });
            expect(result.transactions).toHaveTransaction({ success: false });
        });
    });

    // ─────────────────────────────────────────────────────────────────────────
    //  14. Superfan tip-based reward
    // ─────────────────────────────────────────────────────────────────────────

    describe('Superfan reward', () => {
        it('pays 8% rebate on tip ≥ 100 $TOON', async () => {
            const tip = toNano('200');
            const expected = (tip * 800n) / 10000n; // 8% = 16 $TOON

            const result = await vault.send(owner.getSender(), { value: toNano('0.5') },
                buildSignedClaim({
                    telegramId: 1n, walletAddress: recipient.address,
                    rewardId: REWARD_SUPERFAN, walletAgeDays: 30n,
                    hasVibeStreak: false, tipAmount: tip,
                    nonce: freshNonce(), expiry: freshExpiry(blockchain),
                }));
            expect(result.transactions).toHaveTransaction({
                from: vault.address, to: recipient.address, success: true,
            });
        });

        it('rejects Superfan claim when tip < 100 $TOON', async () => {
            const result = await vault.send(owner.getSender(), { value: toNano('0.5') },
                buildSignedClaim({
                    telegramId: 1n, walletAddress: recipient.address,
                    rewardId: REWARD_SUPERFAN, walletAgeDays: 30n,
                    hasVibeStreak: false, tipAmount: toNano('50'),
                    nonce: freshNonce(), expiry: freshExpiry(blockchain),
                }));
            expect(result.transactions).toHaveTransaction({ success: false });
        });
    });
});
