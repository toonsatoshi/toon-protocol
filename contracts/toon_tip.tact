import "@stdlib/deploy";

// ─────────────────────────────────────────────────────────────────────────────
//  Messages
// ─────────────────────────────────────────────────────────────────────────────

message SplitTip {
    targets: map<Int, Address>; // map index -> ToonTrack address
    ratios:  map<Int, Int>;     // map index -> basis points (e.g., 5000 = 50%)
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
        let totalValue: Int = context().value - 100000000; // 0.1 TON gas buffer
        if (totalValue <= 0) { return; }
        let i: Int = 0;
        
        while (i < msg.count) {
            let target: Address? = msg.targets.get(i);
            let ratio: Int? = msg.ratios.get(i);
            
            if (target != null && ratio != null) {
                let share: Int = (totalValue * ratio!!) / 10000;
                if (share > 0) {
                    send(SendParameters{
                        to: target!!,
                        value: share,
                        mode: SendPayGasSeparately,
                        body: "tip".asComment()
                    });
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
            contributors: emptyMap()
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
        p.contributorCount = p.contributorCount + 1;

        if (p.currentAmount >= p.targetAmount) {
            p.completed = true;
            
            // Fire the collective tip to the track
            send(SendParameters{
                to: p.trackAddress,
                value: p.currentAmount,
                mode: SendPayGasSeparately,
                body: "tip".asComment()
            });
            p.currentAmount = 0;
        }

        self.pools.set(msg.poolId, p);
    }

    // ── Getters ──────────────────────────────────────────────────────────────

    get fun getPool(poolId: Int): Pool? {
        return self.pools.get(poolId);
    }
}
