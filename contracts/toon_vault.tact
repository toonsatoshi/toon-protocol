import "@stdlib/deploy";

// ── Reward IDs ───────────────────────────────────────────────────────────────
const REWARD_ACTIVE_LISTENER:   Int = 1;  // repeatable, decays
const REWARD_GROWTH_AGENT:      Int = 2;  // repeatable, decays
const REWARD_ARTIST_LAUNCH:     Int = 3;  // ONE-TIME per wallet
const REWARD_TRENDSETTER:       Int = 4;  // ONE-TIME per wallet
const REWARD_SUPERFAN:          Int = 5;  // repeatable, tip-gated
const REWARD_EARLY_BELIEVER:    Int = 6;  // ONE-TIME per wallet
const REWARD_DROP_INVESTOR:     Int = 7;  // repeatable, decays

// ── Base reward amounts (nanoTOON) ───────────────────────────────────────────
const BASE_ACTIVE_LISTENER:  Int = ton("10");
const BASE_GROWTH_AGENT:     Int = ton("5");
const BASE_ARTIST_LAUNCH:    Int = ton("500");
const BASE_TRENDSETTER:      Int = ton("5000");
const BASE_EARLY_BELIEVER:   Int = ton("200");
const BASE_DROP_INVESTOR:    Int = ton("50");

// ── Safety ceilings ──────────────────────────────────────────────────────────
const EMISSION_CAP_CEILING:     Int = ton("500000");
const DEFAULT_EMISSION_CAP:     Int = ton("50000");
const DEFAULT_MIN_WALLET_AGE:   Int = 7;
const MAX_NONCE_WINDOW_SECONDS: Int = 300; // oracle payloads expire in 5 min
const NONCE_RETENTION_SECONDS: Int = 86400;

// ── Reserve health ───────────────────────────────────────────────────────────
const RESERVE_TARGET:           Int = ton("1000000");
const RESERVE_HALVE_THRESHOLD:  Int = 10;
const RESERVE_RECOVER_THRESHOLD:Int = 20;
const SUPERFAN_REBATE_BPS:      Int = 800;
const VIBE_MULTIPLIER_BPS:      Int = 150; // +1.5% when streak is present

// ── Anti-abuse ───────────────────────────────────────────────────────────────
const CLAIM_COOLDOWN_SECONDS:   Int = 300;

// ── Messages ─────────────────────────────────────────────────────────────────

// Every ClaimReward carries a signed oracle attestation.
// The bot (oracle) signs: sha256(telegramId ++ walletAddress ++ rewardId ++
//   walletAgeDays ++ hasVibeStreak ++ tipAmount ++ nonce ++ expiry)
// nonce:   random uint64 — replay protection (stored in usedNonces)
// expiry:  unix timestamp — payload must arrive before this
// sigHigh/sigLow: Ed25519 signature split into two uint256 halves
message ClaimReward {
    walletAddress:  Address;
    rewardId:       Int as uint8;
    telegramId:     Int as uint64;
    walletAgeDays:  Int as uint32;
    hasVibeStreak:  Bool;
    tipAmount:      Int as coins;
    nonce:          Int as uint64;
    expiry:         Int as uint32;
    sigHigh:        Int as uint256;
    sigLow:         Int as uint256;
}

message MintAuthorized {
    recipient:    Address;
    amount:       Int as coins;
    authorizedAt: Int as uint32;
}

// Governance-dispatched: vault commits these as real state mutations.
message UpdateEmissionCap    { newCap: Int as coins;        }
message UpdateMinWalletAge   { newAgeDays: Int as uint32;   }
message UpdateTargetActivity { newTarget: Int as uint32;    }

// Owner-only admin messages.
message UpdateReserve    { amount: Int as coins;        }
message UpdateRegistry   { newRegistry: Address;        }
message SetGovernance    { newGovernance: Address;      }
message SetOracleKey     { newPublicKey: Int as uint256;}
message TreasuryWithdraw { amount: Int as coins; recipient: Address; }
message SetCircuitBreaker { enabled: Bool; }

// ── ToonVault ────────────────────────────────────────────────────────────────
//
//  Three-layer trust stack:
//   1. Oracle attestation  — every ClaimReward carries an Ed25519 sig from
//      the bot's oracle key.  The vault verifies on-chain.  Forging a valid
//      claim requires the oracle's private key.
//   2. Nonce replay guard  — each nonce is a one-time token.  Duplicate
//      transactions or replayed packets are rejected deterministically.
//   3. Diminishing returns — repeat claimants get less over time, making
//      farming progressively more expensive relative to the reward.
//
//  Emission is dynamically throttled:
//   effective_cap = halved_base_cap * clamp(target / actual, 0.5, 2.0)
//  This prevents runaway inflation during activity spikes and stagnation
//  during quiet periods without requiring manual governance intervention.
//
contract ToonVault with Deployable {

    owner:               Address;
    registry:            Address;
    governance:          Address;     // wire via SetGovernance post-deploy
    oraclePublicKey:     Int as uint256; // Ed25519 oracle pubkey (32 bytes as Int)
    totalReserve:        Int as coins;
    dailyEmitted:        Int as coins;
    lastResetDay:        Int as uint32;
    halved:              Bool;
    emissionCap:         Int as coins;
    minWalletAgeDays:    Int as uint32;
    targetDailyActivity: Int as uint32;  // 0 = static cap, no dynamic scaling
    dailyClaimCount:     Int as uint32;
    circuitBreaker:      Bool;

    // ── Replay protection ────────────────────────────────────────────────────
    // Oracle nonces: prevents the same signed payload being submitted twice.
    usedNonces: map<Int, Int>;

    // Per-day idempotency: same (reward, wallet, day) is rejected even if
    // submitted with a different oracle nonce.
    claimNonces: map<Int, Bool>;

    // Per-wallet burst throttle.
    lastClaimTimestamp: map<Int, Int>;

    // ── Diminishing returns ──────────────────────────────────────────────────
    // Tracks how many times a wallet has claimed a given reward type (lifetime).
    // Key: sha256("cnt:" + rewardId + ":" + walletAddress)
    claimCounts: map<Int, Int>;

    // One-time reward guard: set to true after ARTIST_LAUNCH / EARLY_BELIEVER
    // / TRENDSETTER is claimed. Future attempts are rejected regardless of day.
    // Key: sha256("once:" + rewardId + ":" + walletAddress)
    lifetimeClaimed: map<Int, Bool>;

    init(
        owner: Address,
        registry: Address,
        governance: Address,
        oraclePublicKey: Int,
        totalReserve: Int,
        dailyEmitted: Int,
        lastResetDay: Int,
        halved: Bool,
        emissionCap: Int,
        minWalletAgeDays: Int,
        targetDailyActivity: Int,
        dailyClaimCount: Int,
        circuitBreaker: Bool
    ) {
        self.owner = owner;
        self.registry = registry;
        self.governance = governance;
        self.oraclePublicKey = oraclePublicKey;
        self.totalReserve = totalReserve;
        self.dailyEmitted = dailyEmitted;
        self.lastResetDay = lastResetDay;
        self.halved = halved;
        self.emissionCap = emissionCap;
        self.minWalletAgeDays = minWalletAgeDays;
        self.targetDailyActivity = targetDailyActivity;
        self.dailyClaimCount = dailyClaimCount;
        self.circuitBreaker = circuitBreaker;
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Key builders
    // ─────────────────────────────────────────────────────────────────────────

    fun nonceKey(rewardId: Int, wallet: Address, day: Int): Int {
        return beginCell()
            .storeUint(rewardId, 8)
            .storeAddress(wallet)
            .storeUint(day, 32)
            .endCell().hash();
    }

    fun cooldownKey(wallet: Address): Int {
        return beginCell().storeAddress(wallet).endCell().hash();
    }

    fun countKey(rewardId: Int, wallet: Address): Int {
        return beginCell()
            .storeUint(rewardId, 8)
            .storeAddress(wallet)
            .storeUint(1, 1) // discriminator
            .endCell().hash();
    }

    fun onceKey(rewardId: Int, wallet: Address): Int {
        return beginCell()
            .storeUint(rewardId, 8)
            .storeAddress(wallet)
            .storeUint(0, 1) // discriminator
            .endCell().hash();
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Oracle signature verification
    //
    //  The canonical payload cell exactly mirrors what the bot builds in
    //  signRewardPayload() in index.js.  Any drift between these two makes
    //  every signature invalid — keep them in sync.
    // ─────────────────────────────────────────────────────────────────────────

    fun verifyOracleSignature(msg: ClaimReward): Bool {
        // Reconstruct the canonical payload (same layout as bot-side hash)
        let payloadCell: Cell = beginCell()
            .storeUint(msg.telegramId, 64)
            .storeAddress(msg.walletAddress)
            .storeUint(msg.rewardId, 8)
            .storeUint(msg.walletAgeDays, 32)
            .storeBool(msg.hasVibeStreak)
            .storeCoins(msg.tipAmount)
            .storeUint(msg.nonce, 64)
            .storeUint(msg.expiry, 32)
            .endCell();

        let h: Int = payloadCell.hash();

        // Reassemble 64-byte signature from two 256-bit halves
        let sigSlice: Slice = beginCell()
            .storeUint(msg.sigHigh, 256)
            .storeUint(msg.sigLow, 256)
            .endCell()
            .asSlice();

        return checkSignature(h, sigSlice, self.oraclePublicKey);
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Emission control
    // ─────────────────────────────────────────────────────────────────────────

    fun checkDayReset(today: Int) {
        if (today > self.lastResetDay) {
            self.dailyEmitted    = 0;
            self.dailyClaimCount = 0;
            self.lastResetDay    = today;
        }
    }

    // Base cap after reserve health check (halving).
    fun halvedBaseCap(): Int {
        let cap: Int = self.emissionCap;
        if (self.halved) { cap = cap / 2; }
        return cap;
    }

    fun updateHalvingStatus() {
        let reservePct: Int = (self.totalReserve * 100) / RESERVE_TARGET;
        if (reservePct <= RESERVE_HALVE_THRESHOLD)   { self.halved = true;  }
        if (reservePct >= RESERVE_RECOVER_THRESHOLD) { self.halved = false; }
    }

    // Dynamic cap: scales with actual vs target daily activity.
    //   ratio = clamp(target / max(1, actual), 50%, 200%)
    //   effective = base * ratio / 100
    // This throttles emissions during activity spikes (ratio < 100) and
    // loosens them during quiet periods (ratio > 100).
    fun effectiveCap(): Int {
        let base: Int = self.halvedBaseCap();
        if (self.targetDailyActivity == 0) { return base; }

        let actual: Int = self.dailyClaimCount;
        if (actual == 0) {
            // No claims yet today: boost to 150% to encourage early activity.
            return (base * 150) / 100;
        }

        let ratio: Int = (self.targetDailyActivity * 100) / actual;
        if (ratio < 50)  { ratio = 50;  }
        if (ratio > 200) { ratio = 200; }
        return (base * ratio) / 100;
    }

    fun applyMultiplier(amount: Int, hasStreak: Bool): Int {
        if (hasStreak) { return (amount * (10000 + VIBE_MULTIPLIER_BPS)) / 10000; }
        return amount;
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Diminishing returns
    //
    //  Applies to repeatable rewards (ACTIVE_LISTENER, GROWTH_AGENT,
    //  SUPERFAN, DROP_INVESTOR).  Each subsequent claim by the same wallet
    //  earns less, making farming increasingly expensive relative to yield.
    //
    //  Decay schedule (lifetime claim count → payout %):
    //    0 → 100%,  1 → 75%,  2 → 50%,  3-9 → 25%,  10+ → 10% (floor)
    // ─────────────────────────────────────────────────────────────────────────

    fun decayedReward(base: Int, claimCount: Int): Int {
        if (claimCount == 0) { return base; }
        if (claimCount == 1) { return (base * 75)  / 100; }
        if (claimCount == 2) { return (base * 50)  / 100; }
        if (claimCount <= 9) { return (base * 25)  / 100; }
        let floor: Int = (base * 10) / 100;
        if (floor < 1) { return 1; }
        return floor;
    }

    fun isOneTimeReward(rewardId: Int): Bool {
        return rewardId == REWARD_ARTIST_LAUNCH ||
               rewardId == REWARD_TRENDSETTER   ||
               rewardId == REWARD_EARLY_BELIEVER;
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Core claim handler
    // ─────────────────────────────────────────────────────────────────────────

    receive(msg: ClaimReward) {
        require(!self.circuitBreaker, "ToonVault: circuit breaker enabled");

        // ── 1. Origin check ───────────────────────────────────────────────
        require(
            sender() == self.registry || sender() == self.owner,
            "ToonVault: unauthorized sender"
        );

        // ── 2. Oracle signature verification ─────────────────────────────
        require(
            self.verifyOracleSignature(msg),
            "ToonVault: invalid oracle signature"
        );

        // ── 3. Payload freshness (expiry) ─────────────────────────────────
        require(msg.expiry >= now(), "ToonVault: signed payload has expired");

        // ── 4. Oracle nonce replay guard ──────────────────────────────────
        require(
            self.usedNonces.get(msg.nonce) == null || self.usedNonces.get(msg.nonce)!! + NONCE_RETENTION_SECONDS < now(),
            "ToonVault: oracle nonce already used"
        );
        self.usedNonces.set(msg.nonce, now());

        // ── 5. Wallet eligibility ─────────────────────────────────────────
        require(msg.walletAgeDays >= self.minWalletAgeDays,
            "ToonVault: wallet too new");
        require(msg.telegramId > 0,
            "ToonVault: no Telegram identity");

        // ── 6. Daily reset ────────────────────────────────────────────────
        let today: Int = now() / 86400;
        self.checkDayReset(today);

        // ── 7. Per-wallet cooldown ────────────────────────────────────────
        let cKey: Int = self.cooldownKey(msg.walletAddress);
        let lastClaim: Int? = self.lastClaimTimestamp.get(cKey);
        if (lastClaim != null) {
            require(now() >= lastClaim!! + CLAIM_COOLDOWN_SECONDS,
                "ToonVault: claim cooldown active");
        }

        // ── 8. Per-day idempotency nonce ──────────────────────────────────
        let nKey: Int = self.nonceKey(msg.rewardId, msg.walletAddress, today);
        require(self.claimNonces.get(nKey) == null,
            "ToonVault: reward already claimed today");

        // ── 9. One-time reward guard ──────────────────────────────────────
        let oKey: Int = self.onceKey(msg.rewardId, msg.walletAddress);
        if (self.isOneTimeReward(msg.rewardId)) {
            require(self.lifetimeClaimed.get(oKey) == null,
                "ToonVault: one-time reward already claimed by this wallet");
        }

        // ── 10. Emission gate ─────────────────────────────────────────────
        let cap: Int = self.effectiveCap();
        require(self.dailyEmitted < cap, "ToonVault: daily emission cap reached");

        // ── 11. Reward computation ────────────────────────────────────────
        let baseReward: Int = 0;
        if      (msg.rewardId == REWARD_ACTIVE_LISTENER) { baseReward = BASE_ACTIVE_LISTENER; }
        else if (msg.rewardId == REWARD_GROWTH_AGENT)    { baseReward = BASE_GROWTH_AGENT;    }
        else if (msg.rewardId == REWARD_ARTIST_LAUNCH)   { baseReward = BASE_ARTIST_LAUNCH;   }
        else if (msg.rewardId == REWARD_TRENDSETTER)     { baseReward = BASE_TRENDSETTER;     }
        else if (msg.rewardId == REWARD_EARLY_BELIEVER)  { baseReward = BASE_EARLY_BELIEVER;  }
        else if (msg.rewardId == REWARD_DROP_INVESTOR)   { baseReward = BASE_DROP_INVESTOR;   }
        else if (msg.rewardId == REWARD_SUPERFAN) {
            require(msg.tipAmount >= ton("100"),
                "ToonVault: tip too small for Superfan rebate");
            baseReward = (msg.tipAmount * SUPERFAN_REBATE_BPS) / 10000;
        }

        require(baseReward > 0, "ToonVault: unknown reward ID");

        // ── 12. Diminishing returns ───────────────────────────────────────
        let ckKey: Int = self.countKey(msg.rewardId, msg.walletAddress);
        let prevCount: Int? = self.claimCounts.get(ckKey);
        let claimCount: Int = prevCount != null ? prevCount!! : 0;

        let reward: Int = 0;
        if (self.isOneTimeReward(msg.rewardId)) {
            reward = baseReward;  // no decay; one-time guard handles it above
        } else {
            reward = self.decayedReward(baseReward, claimCount);
        }

        // ── 13. Vibe streak multiplier ────────────────────────────────────
        reward = self.applyMultiplier(reward, msg.hasVibeStreak);

        // ── 14. Clamp to remaining daily budget ───────────────────────────
        let remaining: Int = cap - self.dailyEmitted;
        if (reward > remaining) { reward = remaining; }

        require(self.totalReserve >= reward, "ToonVault: insufficient reserve");

        // ── 15. Commit state (checks-effects-interactions) ────────────────
        self.totalReserve   = self.totalReserve - reward;
        self.updateHalvingStatus();
        self.dailyEmitted   = self.dailyEmitted + reward;
        self.dailyClaimCount = self.dailyClaimCount + 1;
        self.claimNonces.set(nKey, true);
        self.lastClaimTimestamp.set(cKey, now());
        self.claimCounts.set(ckKey, claimCount + 1);

        if (self.isOneTimeReward(msg.rewardId)) {
            self.lifetimeClaimed.set(oKey, true);
        }

        // ── 16. Send ──────────────────────────────────────────────────────
        send(SendParameters{
            to:    msg.walletAddress,
            value: reward,
            mode:  SendPayGasSeparately + SendIgnoreErrors,
            body:  "toon_reward".asComment()
        });
    }

    // ── Registry mint authorization ──────────────────────────────────────────
    receive(msg: MintAuthorized) {
        require(sender() == self.registry,
            "ToonVault: only registry can authorize minting");
        require(self.totalReserve >= msg.amount, "ToonVault: insufficient reserve");

        self.totalReserve = self.totalReserve - msg.amount;
        self.updateHalvingStatus();
        send(SendParameters{
            to:    msg.recipient,
            value: msg.amount,
            mode:  SendPayGasSeparately + SendIgnoreErrors,
            body:  "mint_authorized".asComment()
        });
    }

    // ── Governance-gated parameter updates ───────────────────────────────────
    //  These are the real execution endpoints — governance votes dispatch one
    //  of these messages, and the vault commits the new value to state.

    receive(msg: UpdateEmissionCap) {
        require(sender() == self.governance,
            "ToonVault: only governance can update emission cap");
        require(msg.newCap > 0 && msg.newCap <= EMISSION_CAP_CEILING,
            "ToonVault: cap out of valid range");
        self.emissionCap = msg.newCap;
        emit("EmissionCapUpdated".asComment());
    }

    receive(msg: UpdateMinWalletAge) {
        require(sender() == self.governance,
            "ToonVault: only governance can update min wallet age");
        require(msg.newAgeDays <= 365, "ToonVault: age > 1-year ceiling");
        self.minWalletAgeDays = msg.newAgeDays;
        emit("MinWalletAgeUpdated".asComment());
    }

    // Governance sets the expected daily claim count for dynamic emission.
    // Setting to 0 disables dynamic scaling and reverts to static cap.
    receive(msg: UpdateTargetActivity) {
        require(sender() == self.governance,
            "ToonVault: only governance can set target activity");
        self.targetDailyActivity = msg.newTarget;
        emit("TargetActivityUpdated".asComment());
    }

    receive() {
        self.totalReserve = self.totalReserve + context().value;
        self.updateHalvingStatus();
    }

    // ── Owner-only admin ─────────────────────────────────────────────────────

    receive(msg: UpdateReserve) {
        require(sender() == self.owner, "ToonVault: not owner");
        self.totalReserve = self.totalReserve + msg.amount;
        self.updateHalvingStatus();
    }

    receive(msg: UpdateRegistry) {
        require(sender() == self.owner, "ToonVault: not owner");
        self.registry = msg.newRegistry;
    }

    receive(msg: SetGovernance) {
        require(sender() == self.owner, "ToonVault: not owner");
        self.governance = msg.newGovernance;
    }

    receive(msg: SetCircuitBreaker) {
        require(sender() == self.owner || sender() == self.governance, "ToonVault: not authorized");
        self.circuitBreaker = msg.enabled;
    }

    receive(msg: SetOracleKey) {
        require(sender() == self.owner, "ToonVault: not owner");
        require(msg.newPublicKey != 0, "ToonVault: zero oracle key");
        self.oraclePublicKey = msg.newPublicKey;
        emit("OracleKeyRotated".asComment());
    }

    receive(msg: TreasuryWithdraw) {
        require(sender() == self.owner, "ToonVault: not owner");
        require(self.totalReserve >= msg.amount, "ToonVault: insufficient reserve");
        self.totalReserve = self.totalReserve - msg.amount;
        self.updateHalvingStatus();
        send(SendParameters{
            to:    msg.recipient,
            value: msg.amount,
            mode:  SendIgnoreErrors,
            body:  "withdrawal".asComment()
        });
    }

    // ── Getters ──────────────────────────────────────────────────────────────

    get fun totalReserve(): Int       { return self.totalReserve;       }
    get fun dailyEmitted(): Int       { return self.dailyEmitted;       }
    get fun dailyClaimCount(): Int    { return self.dailyClaimCount;    }
    get fun isHalved(): Bool          { return self.halved;             }
    get fun currentEmissionCap(): Int { return self.emissionCap;        }
    get fun minWalletAgeDays(): Int   { return self.minWalletAgeDays;   }
    get fun effectiveDailyCap(): Int  { return self.effectiveCap();     }
    get fun governance(): Address     { return self.governance;         }

    get fun walletClaimCount(rewardId: Int, wallet: Address): Int {
        let k: Int = self.countKey(rewardId, wallet);
        let v: Int? = self.claimCounts.get(k);
        return v != null ? v!! : 0;
    }

    get fun isOneTimeClaimed(rewardId: Int, wallet: Address): Bool {
        return self.lifetimeClaimed.get(self.onceKey(rewardId, wallet)) != null;
    }

    get fun isNonceUsed(nonce: Int): Bool {
        let ts: Int? = self.usedNonces.get(nonce);
        return ts != null && ts!! + NONCE_RETENTION_SECONDS >= now();
    }

    get fun circuitBreakerEnabled(): Bool { return self.circuitBreaker; }
}
