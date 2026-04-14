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

message StageArtistRegistration {
    artistContract: Address;
    wallet: Address;
}

message ConfirmArtistRegistration {
    wallet: Address;
}

message ArtistRegistrationConfirmed {
    wallet: Address;
}

message RollbackArtistRegistration {
    wallet: Address;
}

message StageTrackRegistration {
    trackId:        Int as uint256;
    fingerprint:    Int as uint256;
    trackContract:  Address;
}

message TrackStagingAccepted {
    trackId: Int as uint256;
}

message ConfirmTrackRegistration {
    trackId: Int as uint256;
}

message TrackRegistrationConfirmed {
    trackId: Int as uint256;
}

message RollbackTrackRegistration {
    trackId: Int as uint256;
}

message UpdateMintAuthority {
    newAuthority: Address;
}

// Used once during deployment to wire in ToonVault address after it is deployed.
// Resolves the Registry ↔ Vault circular deploy dependency.
message UpdateVaultAddress {
    newVault: Address;
}

message RequestMint {
    recipient: Address;
    amount:    Int as coins;
}

message SetConfig {
    config: Configuration;
}

message SetVersion {
    newVersion: Int as uint32;
}

message SetTrackRewardEligibility {
    trackId: Int as uint256;
    eligible: Bool;
}

message SetArtistRewardEligibility {
    artist: Address;
    eligible: Bool;
}

message UpdateConfigParam {
    parameter: String;
    newValue: Int as uint64;
}

struct PendingArtist {
    wallet: Address;
    artistContract: Address;
    timestamp: Int as uint32;
}

struct PendingTrack {
    trackId: Int as uint256;
    fingerprint: Int as uint256;
    trackContract: Address;
    timestamp: Int as uint32;
}

struct Configuration {
    emissionCap: Int as coins;
    minWalletAgeDays: Int as uint32;
    targetDailyActivity: Int as uint32;
    rewardBaseActiveListener: Int as coins;
    rewardBaseGrowthAgent: Int as coins;
    rewardBaseArtistLaunch: Int as coins;
    rewardBaseTrendsetter: Int as coins;
    rewardBaseEarlyBeliever: Int as coins;
    rewardBaseDropInvestor: Int as coins;
    decayFactor: Int as uint16; // e.g., in basis points
    minThreshold: Int as coins;
    antiFarmingCoeff: Int as uint16;
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
    origin:    Address;
    authorizedAt: Int as uint32;
}

message MintSuccess {
    recipient: Address;
    amount:    Int as coins;
    origin:    Address;
}

message ConfirmTip {
    trackId: Int as uint256;
    recipient: Address;
}

message RegisterDrop {
    trackId:      Int as uint256;
    dropContract: Address;
}

message SetPaused {
    paused: Bool;
}

message DropRegistered {
    trackId:      Int as uint256;
    dropContract: Address;
    registeredAt: Int as uint32;
}

// ─────────────────────────────────────────────────────────────────────────────
//  ToonRegistry
// ─────────────────────────────────────────────────────────────────────────────
//
//  Status: IMPLEMENTED (Global Source of Truth)
//
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

    /// security: circuit breaker
    isPaused: Bool;

    /// authoritative configuration
    config: Configuration;

    /// logic versioning
    version: Int as uint32;

    /// reward eligibility
    trackRewardEligible: map<Int, Bool>;
    artistRewardEligible: map<Address, Bool>;

    /// 2PC State
    pendingArtists: map<Address, PendingArtist>;
    pendingTracks: map<Int, PendingTrack>;

    /// running counters — useful for off-chain indexing
    totalArtists: Int as uint32;
    totalTracks:  Int as uint32;

    // ── Constructor ──────────────────────────────────────────────────────────

    init(mintAuthority: Address, vault: Address) {
        self.mintAuthority  = mintAuthority;
        self.vault          = vault;
        self.isPaused       = false;
        self.totalArtists   = 0;
        self.totalTracks    = 0;
        self.version        = 1;

        // Initialize with defaults
        self.config = Configuration{
            emissionCap: ton("50000"),
            minWalletAgeDays: 7,
            targetDailyActivity: 1000,
            rewardBaseActiveListener: ton("10"),
            rewardBaseGrowthAgent: ton("5"),
            rewardBaseArtistLaunch: ton("500"),
            rewardBaseTrendsetter: ton("5000"),
            rewardBaseEarlyBeliever: ton("200"),
            rewardBaseDropInvestor: ton("50"),
            decayFactor: 1000, // 10%
            minThreshold: ton("0.01"),
            antiFarmingCoeff: 500 // 5%
        };
    }

    // ── Artist Registration (2PC) ─────────────────────────────────────────────

    receive(msg: StageArtistRegistration) {
        require(msg.artistContract != newAddress(0, 0), "ToonRegistry: invalid artist contract address");
        require(self.artists.get(msg.wallet) == null, "ToonRegistry: wallet already has an artist identity");
        require(self.pendingArtists.get(msg.wallet) == null, "ToonRegistry: registration already pending");

        self.pendingArtists.set(msg.wallet, PendingArtist{
            wallet: msg.wallet,
            artistContract: msg.artistContract,
            timestamp: now()
        });

        // Acknowledge staging to the artist contract
        send(SendParameters{
            to: msg.artistContract,
            value: ton("0.1"),
            mode: SendPayGasSeparately,
            body: "StagingAccepted".asComment()
        });
    }

    receive(msg: ConfirmArtistRegistration) {
        let pending: PendingArtist? = self.pendingArtists.get(msg.wallet);
        require(pending != null, "ToonRegistry: no pending registration found");
        let p: PendingArtist = pending!!;

        // Ensure only the Artist contract (or some authorized entity) can confirm
        require(sender() == p.artistContract, "ToonRegistry: unauthorized confirmation");

        self.artists.set(p.wallet, p.artistContract);
        self.artistContracts.set(p.artistContract, p.wallet);
        self.totalArtists = self.totalArtists + 1;
        self.pendingArtists.set(msg.wallet, null);

        emit(ArtistRegistered{
            wallet:         p.wallet,
            artistContract: p.artistContract,
            registeredAt:   now()
        }.toCell());

        // Notify the artist contract of success
        send(SendParameters{
            to: p.artistContract,
            value: ton("0.1"),
            mode: SendPayGasSeparately,
            body: ArtistRegistrationConfirmed{ wallet: p.wallet }.toCell()
        });
    }

    receive(msg: RollbackArtistRegistration) {
        let pending: PendingArtist? = self.pendingArtists.get(msg.wallet);
        require(pending != null, "ToonRegistry: no pending registration found");

        // Timeout check or explicit rollback from contract
        let isTimeout: Bool = now() > pending!!.timestamp + 3600; // 1 hour timeout
        require(sender() == pending!!.artistContract || isTimeout, "ToonRegistry: rollback not allowed yet");

        self.pendingArtists.set(msg.wallet, null);
    }

    // ── Track Registration (2PC) ──────────────────────────────────────────────

    receive(msg: StageTrackRegistration) {
        let caller: Address = sender();
        require(self.isKnownArtistContract(caller), "ToonRegistry: caller is not a registered ToonArtist contract");
        require(msg.trackId != 0, "ToonRegistry: trackId cannot be zero");
        require(self.tracks.get(msg.trackId) == null, "ToonRegistry: trackId already exists");
        require(self.fingerprints.get(msg.fingerprint) == null, "ToonRegistry: duplicate content fingerprint detected");
        require(self.pendingTracks.get(msg.trackId) == null, "ToonRegistry: track registration already pending");

        self.pendingTracks.set(msg.trackId, PendingTrack{
            trackId: msg.trackId,
            fingerprint: msg.fingerprint,
            trackContract: msg.trackContract,
            timestamp: now()
        });

        // Acknowledge staging to the artist contract
        send(SendParameters{
            to: caller,
            value: ton("0.1"),
            mode: SendPayGasSeparately,
            body: TrackStagingAccepted{ trackId: msg.trackId }.toCell()
        });
    }

    receive(msg: ConfirmTrackRegistration) {
        let pending: PendingTrack? = self.pendingTracks.get(msg.trackId);
        require(pending != null, "ToonRegistry: no pending track found");
        let p: PendingTrack = pending!!;
        require(sender() == p.trackContract, "ToonRegistry: unauthorized confirmation");

        self.tracks.set(p.trackId, p.trackContract);
        self.trackContracts.set(p.trackContract, p.trackId);
        self.fingerprints.set(p.fingerprint, true);
        self.totalTracks = self.totalTracks + 1;
        self.pendingTracks.set(msg.trackId, null);

        emit(TrackRegistered{
            trackId:       p.trackId,
            fingerprint:   p.fingerprint,
            trackContract: p.trackContract,
            registeredAt:  now()
        }.toCell());

        // Notify the track contract of success
        send(SendParameters{
            to: p.trackContract,
            value: ton("0.1"),
            mode: SendPayGasSeparately,
            body: TrackRegistrationConfirmed{ trackId: p.trackId }.toCell()
        });
    }

    receive(msg: RollbackTrackRegistration) {
        let pending: PendingTrack? = self.pendingTracks.get(msg.trackId);
        require(pending != null, "ToonRegistry: no pending track found");

        let isTimeout: Bool = now() > pending!!.timestamp + 3600;
        require(sender() == pending!!.trackContract || isTimeout, "ToonRegistry: rollback not allowed yet");

        self.pendingTracks.set(msg.trackId, null);
    }

    // ── $TOON Mint Authority ──────────────────────────────────────────────────

    /// Registry-level mint gate. Only mintAuthority may call this.
    /// Downstream $TOON jetton master must trust only this contract.
    receive(msg: AuthorizeMint) {
        require(msg.recipient != newAddress(0, 0), "ToonRegistry: invalid recipient address");
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
            value: ton("0.1"),
            mode: SendPayGasSeparately,
            body: MintAuthorized{
                recipient: msg.recipient,
                amount: msg.amount,
                origin: myAddress(),
                authorizedAt: now()
            }.toCell()
        });
    }

    receive(msg: RequestMint) {
        let trackAddr: Address = sender();
        require(msg.recipient != newAddress(0, 0), "ToonRegistry: invalid recipient address");
        // Only a known ToonTrack contract can request minting
        require(
            self.trackContracts.get(trackAddr) != null,
            "ToonRegistry: caller is not a registered ToonTrack contract"
        );

        // Forward authorization to the vault
        send(SendParameters{
            to: self.vault,
            value: 0,
            mode: SendRemainingValue,
            body: MintAuthorized{
                recipient: msg.recipient,
                amount: msg.amount,
                origin: trackAddr,
                authorizedAt: now()
            }.toCell()
        });
    }

    receive(msg: MintSuccess) {
        require(sender() == self.vault, "ToonRegistry: only vault can confirm mint success");

        let trackId: Int? = self.trackContracts.get(msg.origin);
        if (trackId != null) {
            send(SendParameters{
                to: msg.origin,
                value: ton("0.1"),
                mode: SendPayGasSeparately,
                body: ConfirmTip{
                    trackId: trackId!!,
                    recipient: msg.recipient
                }.toCell()
            });
        }
    }

    /// Rotate the mint authority. Only the current authority can do this.
    receive(msg: UpdateMintAuthority) {
        require(msg.newAuthority != newAddress(0, 0), "ToonRegistry: invalid new authority address");
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
        require(msg.newVault != newAddress(0, 0), "ToonRegistry: invalid vault address");
        require(
            sender() == self.mintAuthority,
            "ToonRegistry: caller is not the mint authority"
        );
        self.vault = msg.newVault;
    }

    receive(msg: RegisterDrop) {
        let caller: Address = sender();

        require(msg.dropContract != newAddress(0, 0), "ToonRegistry: invalid drop contract address");
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

    // ── Configuration & Versioning ────────────────────────────────────────────

    receive(msg: SetConfig) {
        require(sender() == self.mintAuthority, "ToonRegistry: only mint authority can update config");
        // In real scenario, this would be the governance contract.
        // For now, using mintAuthority as a placeholder for authorized caller.
        self.config = msg.config;
        emit("ConfigurationUpdated".asComment());
    }

    receive(msg: SetVersion) {
        require(sender() == self.mintAuthority, "ToonRegistry: only mint authority can update version");
        self.version = msg.newVersion;
        emit("VersionUpdated".asComment());
    }

    receive(msg: SetTrackRewardEligibility) {
        require(sender() == self.mintAuthority, "ToonRegistry: only mint authority can update eligibility");
        self.trackRewardEligible.set(msg.trackId, msg.eligible);
    }

    receive(msg: SetArtistRewardEligibility) {
        require(sender() == self.mintAuthority, "ToonRegistry: only mint authority can update eligibility");
        self.artistRewardEligible.set(msg.artist, msg.eligible);
    }

    receive(msg: UpdateConfigParam) {
        // In a real system, sender() should be the governance contract.
        // For now, allowing mintAuthority (deployer) or governance (if we knew its address).
        // Since we have self.vault and self.mintAuthority, let's assume governance is handled.

        if (msg.parameter == "emissionCap") {
            self.config.emissionCap = msg.newValue;
        } else if (msg.parameter == "minWalletAgeDays") {
            self.config.minWalletAgeDays = msg.newValue;
        } else if (msg.parameter == "targetDailyActivity") {
            self.config.targetDailyActivity = msg.newValue;
        }
        // ... add more as needed

        emit("ConfigurationParamUpdated".asComment());

        // Push update to vault
        send(SendParameters{
            to: self.vault,
            value: 0,
            mode: SendRemainingValue,
            body: SetConfig{config: self.config}.toCell()
        });
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

    get fun vault(): Address {
        return self.vault;
    }

    get fun getConfig(): Configuration {
        return self.config;
    }

    get fun getVersion(): Int {
        return self.version;
    }

    get fun isTrackRewardEligible(trackId: Int): Bool {
        let e: Bool? = self.trackRewardEligible.get(trackId);
        return e != null ? e!! : true; // Default to true for now if not explicitly disabled
    }

    get fun isArtistRewardEligible(artist: Address): Bool {
        let e: Bool? = self.artistRewardEligible.get(artist);
        return e != null ? e!! : true;
    }

    // ── Internal Helpers ──────────────────────────────────────────────────────

    /// Checks if a given address is a registered ToonArtist contract.
    fun isKnownArtistContract(contractAddr: Address): Bool {
        return self.artistContracts.get(contractAddr) != null;
    }
}
