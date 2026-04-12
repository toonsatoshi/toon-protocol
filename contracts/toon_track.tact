import "@stdlib/deploy";

// ─────────────────────────────────────────────────────────────────────────────
//  Messages
// ─────────────────────────────────────────────────────────────────────────────

message AuthorizeMint {
    recipient: Address;
    amount:    Int as coins;
}

message RequestMint {
    recipient: Address;
    amount:    Int as coins;
}

// ─────────────────────────────────────────────────────────────────────────────
//  ToonTrack
// ─────────────────────────────────────────────────────────────────────────────

contract ToonTrack with Deployable {

    // ── Storage ──────────────────────────────────────────────────────────────

    artist:      Address;    // The ToonArtist contract address (or wallet)
    registry:    Address;    // The global ToonRegistry
    metadataUri: String;     // Arweave link
    fingerprint: Int as uint256; 
    
    mintFee:     Int as coins;   // Minimum tip floor
    reputation:  Int as uint32;  // Increments on every tip

    // ── Constants ──────────────────────────────────────────────────────────

    const MINT_REWARD: Int = 1000000000; // 1 $TOON reward for tipping (mock)

    // ── Constructor ──────────────────────────────────────────────────────────

    init(artist: Address, registry: Address, metadataUri: String, fingerprint: Int, mintFee: Int) {
        self.artist = artist;
        self.registry = registry;
        self.metadataUri = metadataUri;
        self.fingerprint = fingerprint;
        self.mintFee = mintFee;
        self.reputation = 0;
    }

    // ── Actions ──────────────────────────────────────────────────────────────

    /// Accepts TON tips. 
    /// If value >= mintFee:
    ///   1. Increment reputation.
    ///   2. Forward full value to artist.
    ///   3. Request $TOON mint for the tipper via Registry.
    receive() {
        let ctx: Context = context();
        require(ctx.value >= self.mintFee, "ToonTrack: tip below minimum floor");

        // 1. Increment reputation
        self.reputation = self.reputation + 1;

        // 2. Forward value to artist (leaving some for gas/mint)
        send(SendParameters{
            to: self.artist,
            value: ctx.value - 50000000, // Leave 0.05 TON for processing
            mode: 0,
            body: "Tip received".asComment()
        });

        // 3. Request $TOON mint for the tipper (Tip-to-Earn)
        send(SendParameters{
            to: self.registry,
            value: 20000000, // 0.02 TON fee for the registry to process/emit
            mode: 0,
            body: RequestMint{
                recipient: ctx.sender,
                amount: self.MINT_REWARD
            }.toCell()
        });
    }

    /// Explicit "tip" comment support
    receive("tip") {
        let ctx: Context = context();
        require(ctx.value >= self.mintFee, "ToonTrack: tip below minimum floor");
        
        self.reputation = self.reputation + 1;

        send(SendParameters{
            to: self.artist,
            value: ctx.value - 50000000, // Leave 0.05 TON for processing
            mode: 0,
            body: "Tip received".asComment()
        });

        send(SendParameters{
            to: self.registry,
            value: 20000000, // 0.02 TON
            mode: 0,
            body: RequestMint{
                recipient: ctx.sender,
                amount: self.MINT_REWARD
            }.toCell()
        });
    }

    // ── Getters ──────────────────────────────────────────────────────────────

    get fun reputation(): Int {
        return self.reputation;
    }

    get fun artist(): Address {
        return self.artist;
    }

    get fun metadataUri(): String {
        return self.metadataUri;
    }

    get fun fingerprint(): Int {
        return self.fingerprint;
    }

    get fun mintFee(): Int {
        return self.mintFee;
    }
}
