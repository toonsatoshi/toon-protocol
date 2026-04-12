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

message ConfirmTrackRegistration {
    trackId: Int as uint256;
}

// ─────────────────────────────────────────────────────────────────────────────
//  ToonTrack
// ─────────────────────────────────────────────────────────────────────────────
//
//  Status: IMPLEMENTED (Music NFT Identity)
//
contract ToonTrack with Deployable {

    // ── Storage ──────────────────────────────────────────────────────────────

    artist:      Address;    // The ToonArtist contract address (or wallet)
    registry:    Address;    // The global ToonRegistry
    trackId:     Int as uint256;
    metadataUri: String;     // Arweave link
    fingerprint: Int as uint256; 
    
    mintFee:     Int as coins;   // Minimum tip floor
    reputation:  Int as uint32;  // Increments on every tip

    // ── Constants ──────────────────────────────────────────────────────────

    const MINT_REWARD: Int = 1000000000; // 1 $TOON reward for tipping (mock)
    const GAS_FORWARD_ARTIST: Int = 50000000; // 0.05 TON
    const GAS_REGISTRY_FEE:   Int = 20000000; // 0.02 TON
    const MIN_TIP_OVERHEAD:   Int = 80000000; // 0.08 TON safety buffer

    // ── Constructor ──────────────────────────────────────────────────────────

    init(artist: Address, registry: Address, trackId: Int, metadataUri: String, fingerprint: Int, mintFee: Int) {
        self.artist = artist;
        self.registry = registry;
        self.trackId = trackId;
        self.metadataUri = metadataUri;
        self.fingerprint = fingerprint;
        self.mintFee = mintFee;
        self.reputation = 0;
    }

    // ── Actions ──────────────────────────────────────────────────────────────

    receive("ConfirmRegistration") {
        require(sender() == self.artist, "ToonTrack: only artist can confirm registration");
        send(SendParameters{
            to: self.registry,
            value: 0,
            mode: SendRemainingValue,
            body: ConfirmTrackRegistration{ trackId: self.trackId }.toCell()
        });
    }

    /// Accepts TON tips. 
    /// If value >= mintFee:
    ///   1. Increment reputation.
    ///   2. Forward full value to artist.
    ///   3. Request $TOON mint for the tipper via Registry.
    receive() {
        let ctx: Context = context();
        let minRequired: Int = self.mintFee + self.MIN_TIP_OVERHEAD;
        require(ctx.value >= minRequired, "ToonTrack: tip below minimum floor (including gas)");

        // 1. Increment reputation
        self.reputation = self.reputation + 1;

        // 2. Forward value to artist (leaving some for gas/mint)
        send(SendParameters{
            to: self.artist,
            value: ctx.value - self.GAS_FORWARD_ARTIST,
            mode: 0,
            body: "Tip received".asComment()
        });

        // 3. Request $TOON mint for the tipper (Tip-to-Earn)
        send(SendParameters{
            to: self.registry,
            value: self.GAS_REGISTRY_FEE,
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
        let minRequired: Int = self.mintFee + self.MIN_TIP_OVERHEAD;
        require(ctx.value >= minRequired, "ToonTrack: tip below minimum floor (including gas)");
        
        self.reputation = self.reputation + 1;

        send(SendParameters{
            to: self.artist,
            value: ctx.value - self.GAS_FORWARD_ARTIST,
            mode: 0,
            body: "Tip received".asComment()
        });

        send(SendParameters{
            to: self.registry,
            value: self.GAS_REGISTRY_FEE,
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
