import "@stdlib/deploy";

// ─────────────────────────────────────────────────────────────────────────────
//  Messages
// ─────────────────────────────────────────────────────────────────────────────

message RegisterArtist {
    artistContract: Address;
}

message RegisterTrack {
    trackId:        Int as uint256;
    fingerprint:    Int as uint256;   // content hash — uniqueness enforced
    trackContract:  Address;
}

message AuthorizeMint {
    recipient: Address;
    amount:    Int as coins;
}

message UpdateMintAuthority {
    newAuthority: Address;
}

// Used once during deployment to wire in ToonVault address after it is deployed.
// Resolves the Registry ↔ Vault circular deploy dependency.
message UpdateVaultAddress {
    newVault: Address;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Events (emitted as external messages for indexers)
// ─────────────────────────────────────────────────────────────────────────────

message ArtistRegistered {
    wallet:         Address;
    artistContract: Address;
    registeredAt:   Int as uint32;
}

message TrackRegistered {
    trackId:       Int as uint256;
    fingerprint:   Int as uint256;
    trackContract: Address;
    registeredAt:  Int as uint32;
}

message MintAuthorized {
    recipient: Address;
    amount:    Int as coins;
    authorizedAt: Int as uint32;
}

message RegisterDrop {
    trackId:      Int as uint256;
    dropContract: Address;
}

message DropRegistered {
    trackId:      Int as uint256;
    dropContract: Address;
    registeredAt: Int as uint32;
}

// ─────────────────────────────────────────────────────────────────────────────
//  ToonRegistry
// ─────────────────────────────────────────────────────────────────────────────

contract ToonRegistry with Deployable {

    // ── Storage ──────────────────────────────────────────────────────────────

    /// wallet address  →  deployed ToonArtist contract address
    artists: map<Address, Address>;

    /// deployed ToonArtist contract address → wallet address
    artistContracts: map<Address, Address>;

    /// track ID  →  deployed ToonTrack contract address
    tracks: map<Int, Address>;

    /// deployed ToonTrack contract address → track ID
    trackContracts: map<Address, Int>;

    /// track ID → deployed ToonDrop contract address
    drops: map<Int, Address>;

    /// content fingerprint  →  existence flag  (prevents duplicate uploads)
    fingerprints: map<Int, Bool>;

    /// the one address allowed to call AuthorizeMint
    mintAuthority: Address;

    /// global treasury/reward engine
    vault: Address;

    /// running counters — useful for off-chain indexing
    totalArtists: Int as uint32;
    totalTracks:  Int as uint32;

    // ── Constructor ──────────────────────────────────────────────────────────

    init(mintAuthority: Address, vault: Address) {
        self.mintAuthority  = mintAuthority;
        self.vault          = vault;
        self.totalArtists   = 0;
        self.totalTracks    = 0;
    }

    // ── Artist Registration ───────────────────────────────────────────────────

    /// Called by a wallet to register itself as a Toon artist.
    /// One wallet  →  one identity. No re-registration.
    receive(msg: RegisterArtist) {
        let caller: Address = sender();

        require(
            self.artists.get(caller) == null,
            "ToonRegistry: wallet already has an artist identity"
        );

        // Persist the mapping
        self.artists.set(caller, msg.artistContract);
        self.artistContracts.set(msg.artistContract, caller);
        self.totalArtists = self.totalArtists + 1;

        // Emit indexable event
        emit(ArtistRegistered{
            wallet:         caller,
            artistContract: msg.artistContract,
            registeredAt:   now()
        }.toCell());
    }

    // ── Track Registration ────────────────────────────────────────────────────

    /// Called by a verified ToonArtist contract to publish a new track.
    /// Enforces:
    ///   1. The caller must be a registered artist contract.
    ///   2. trackId must be globally unique.
    ///   3. The content fingerprint must never have appeared before.
    receive(msg: RegisterTrack) {
        let caller: Address = sender();

        // Caller must be a known ToonArtist contract
        require(
            self.isKnownArtistContract(caller),
            "ToonRegistry: caller is not a registered ToonArtist contract"
        );

        // trackId uniqueness
        require(
            self.tracks.get(msg.trackId) == null,
            "ToonRegistry: trackId already exists"
        );

        // Fingerprint uniqueness — no duplicate content
        require(
            self.fingerprints.get(msg.fingerprint) == null,
            "ToonRegistry: duplicate content fingerprint detected"
        );

        // Persist
        self.tracks.set(msg.trackId, msg.trackContract);
        self.trackContracts.set(msg.trackContract, msg.trackId);
        self.fingerprints.set(msg.fingerprint, true);
        self.totalTracks = self.totalTracks + 1;

        emit(TrackRegistered{
            trackId:       msg.trackId,
            fingerprint:   msg.fingerprint,
            trackContract: msg.trackContract,
            registeredAt:  now()
        }.toCell());
    }

    // ── $TOON Mint Authority ──────────────────────────────────────────────────

    /// Registry-level mint gate. Only mintAuthority may call this.
    /// Downstream $TOON jetton master must trust only this contract.
    receive(msg: AuthorizeMint) {
        require(
            sender() == self.mintAuthority,
            "ToonRegistry: caller is not the mint authority"
        );
        require(
            msg.amount > 0,
            "ToonRegistry: mint amount must be positive"
        );

        // Forward authorization to the vault
        send(SendParameters{
            to: self.vault,
            value: 0,
            mode: SendRemainingValue,
            body: MintAuthorized{
                recipient: msg.recipient,
                amount: msg.amount,
                authorizedAt: now()
            }.toCell()
        });
    }

    /// Rotate the mint authority. Only the current authority can do this.
    receive(msg: UpdateMintAuthority) {
        require(
            sender() == self.mintAuthority,
            "ToonRegistry: caller is not the mint authority"
        );

        self.mintAuthority = msg.newAuthority;
    }

    /// Wire in the real ToonVault address after it is deployed.
    /// Can only be called by mintAuthority (deployer during setup).
    /// Resolves the Registry ↔ Vault circular deploy dependency.
    receive(msg: UpdateVaultAddress) {
        require(
            sender() == self.mintAuthority,
            "ToonRegistry: caller is not the mint authority"
        );
        self.vault = msg.newVault;
    }

    receive(msg: RegisterDrop) {
        let caller: Address = sender();

        // Caller must be a known ToonArtist contract
        require(
            self.isKnownArtistContract(caller),
            "ToonRegistry: caller is not a registered ToonArtist contract"
        );

        // One drop per track (simplified)
        require(
            self.drops.get(msg.trackId) == null,
            "ToonRegistry: drop already exists for this track"
        );

        // Persist
        self.drops.set(msg.trackId, msg.dropContract);

        emit(DropRegistered{
            trackId:      msg.trackId,
            dropContract: msg.dropContract,
            registeredAt: now()
        }.toCell());
    }

    // ── Read-only Getters ─────────────────────────────────────────────────────

    get fun getArtistContract(wallet: Address): Address? {
        return self.artists.get(wallet);
    }

    get fun getTrackContract(trackId: Int): Address? {
        return self.tracks.get(trackId);
    }

    get fun getDropContract(trackId: Int): Address? {
        return self.drops.get(trackId);
    }

    get fun isRegisteredArtist(wallet: Address): Bool {
        return self.artists.get(wallet) != null;
    }

    get fun isRegisteredTrack(trackId: Int): Bool {
        return self.tracks.get(trackId) != null;
    }

    get fun fingerprintExists(fingerprint: Int): Bool {
        return self.fingerprints.get(fingerprint) != null;
    }

    get fun getMintAuthority(): Address {
        return self.mintAuthority;
    }

    get fun getVault(): Address {
        return self.vault;
    }

    get fun getTotalArtists(): Int {
        return self.totalArtists;
    }

    get fun getTotalTracks(): Int {
        return self.totalTracks;
    }

    // ── Internal Helpers ──────────────────────────────────────────────────────

    /// Walks the artists map to confirm a given address is a registered
    /// ToonArtist contract (not just a wallet). O(n) — acceptable at
    /// protocol scale; replace with a reverse map if the set grows large.
    fun isKnownArtistContract(contractAddr: Address): Bool {
        return self.artistContracts.get(contractAddr) != null;
    }
}
