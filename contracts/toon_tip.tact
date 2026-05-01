import "@stdlib/deploy";

// ─────────────────────────────────────────────────────────────────────────────
//  Messages
// ─────────────────────────────────────────────────────────────────────────────

message SplitTip {
    targets: map<Int as uint8, Address>; // map index -> ToonTrack address
    ratios:  map<Int as uint8, Int>;     // map index -> basis points (e.g., 5000 = 50%)
    count:   Int as uint8;
}

message CreatePool {
    trackAddress: Address;
    threshold:    Int as coins;
    deadline:     Int as uint32;
}

message ContributeToPool {
    poolId: Int as uint256;
}

message RefundPoolContribution {
    poolId: Int as uint256;
    contributionId: Int as uint16;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Structs
// ─────────────────────────────────────────────────────────────────────────────

struct Pool {
    trackAddress: Address;
    targetAmount: Int as coins;
    currentAmount: Int as coins;
    deadline:     Int as uint32;
    completed:    Bool;
    contributors: map<Int, Address>;
    contributions: map<Int, Int as coins>;
    contributorCount: Int as uint16;
}

// ─────────────────────────────────────────────────────────────────────────────
//  ToonTip
// ─────────────────────────────────────────────────────────────────────────────

contract ToonTip with Deployable {

    // ── Storage ──────────────────────────────────────────────────────────────

    registry: Address;
    
    /// Group Tipping Pools
    /// poolId (hash of track + owner + timestamp) → Pool data
    pools: map<Int, Pool>;
    nextPoolId: Int as uint256;

    // ── Constructor ──────────────────────────────────────────────────────────

    init(registry: Address) {
        self.registry = registry;
        self.nextPoolId = 0;
    }

    // ── Split Tipping ────────────────────────────────────────────────────────

    /// Allows a user to tip multiple tracks at once.
    /// The message value is split according to ratios.
    receive(msg: SplitTip) {
        let distributable: Int = context().value - ton("0.1"); // Reserve 0.1 TON for gas
        if (distributable <= 0) { return; }
        
        let i: Int = 0;
        while (i < msg.count) {
            let target: Address? = msg.targets.get(i);
            let ratio: Int? = msg.ratios.get(i);
            
            if (target != null && ratio != null) {
                if (i == msg.count - 1) {
                    // Last one: send remaining distributable value
                    send(SendParameters{
                        to: target!!,
                        value: 0,
                        mode: SendRemainingValue + SendIgnoreErrors,
                        body: "tip".asComment()
                    });
                } else {
                    let share: Int = (distributable * ratio!!) / 10000;
                    if (share > 0) {
                        send(SendParameters{
                            to: target!!,
                            value: share,
                            mode: SendIgnoreErrors,
                            body: "tip".asComment()
                        });
                    }
                }
            }
            i = i + 1;
        }
    }

    // ── Group Tipping (Pools) ───────────────────────────────────────────────

    /// Create a new group tip pool for a specific track.
    receive(msg: CreatePool) {
        let poolId: Int = self.nextPoolId;
        self.nextPoolId = self.nextPoolId + 1;

        let newPool: Pool = Pool{
            trackAddress: msg.trackAddress,
            targetAmount: msg.threshold,
            currentAmount: 0,
            deadline: msg.deadline,
            completed: false,
            contributorCount: 0,
            contributors: emptyMap(),
            contributions: emptyMap()
        };

        self.pools.set(poolId, newPool);
    }

    /// Fans contribute TON to a pool.
    receive(msg: ContributeToPool) {
        let pool: Pool? = self.pools.get(msg.poolId);
        require(pool != null, "ToonTip: pool does not exist");
        let p: Pool = pool!!;
        
        require(!p.completed, "ToonTip: pool already completed");
        require(now() <= p.deadline, "ToonTip: pool deadline passed");

        // Use a small amount for state storage (0.05 TON), rest goes to pool
        let contribution: Int = context().value - 50000000; 
        require(contribution > 0, "ToonTip: contribution too small for gas");
        
        p.currentAmount = p.currentAmount + contribution;
        
        // Record contributor
        p.contributors.set(p.contributorCount, sender());
        p.contributions.set(p.contributorCount, contribution);
        p.contributorCount = p.contributorCount + 1;

        if (p.currentAmount >= p.targetAmount) {
            p.completed = true;
            
            // Fire the collective tip to the track
            send(SendParameters{
                to: p.trackAddress,
                value: 0,
                mode: SendRemainingValue,
                body: "tip".asComment()
            });
        }

        self.pools.set(msg.poolId, p);
    }


    /// Contributors can refund after deadline if pool failed to hit target.
    receive(msg: RefundPoolContribution) {
        let pool: Pool? = self.pools.get(msg.poolId);
        require(pool != null, "ToonTip: pool does not exist");
        let p: Pool = pool!!;

        require(!p.completed, "ToonTip: pool already completed");
        require(now() > p.deadline, "ToonTip: pool still active");

        let contributor: Address? = p.contributors.get(msg.contributionId);
        require(contributor != null, "ToonTip: contribution does not exist");
        require(contributor!! == sender(), "ToonTip: not contribution owner");

        let contribution: Int? = p.contributions.get(msg.contributionId);
        require(contribution != null, "ToonTip: contribution already refunded");

        let refundAmount: Int = contribution!!;
        p.currentAmount = p.currentAmount - refundAmount;
        p.contributions.del(msg.contributionId);

        self.pools.set(msg.poolId, p);

        send(SendParameters{
            to: sender(),
            value: refundAmount,
            mode: SendIgnoreErrors,
            body: "pool_refund".asComment()
        });
    }

    // ── Getters ──────────────────────────────────────────────────────────────

    get fun getPool(poolId: Int): Pool? {
        return self.pools.get(poolId);
    }
}
