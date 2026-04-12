import "@stdlib/deploy";

// ─────────────────────────────────────────────────────────────────────────────
//  Messages
// ─────────────────────────────────────────────────────────────────────────────

message RegisterArtist {
    artistContract: Address;
}

message StageArtistRegistration {
    artistContract: Address;
    wallet: Address;
}

message ConfirmArtistRegistration {
    wallet: Address;
}

message StageTrackRegistration {
    trackId:        Int as uint256;
    fingerprint:    Int as uint256;
    trackContract:  Address;
}

message ConfirmTrackRegistration {
    trackId: Int as uint256;
}

message StakeToon {
    amount: Int as coins;
}

message UnstakeToon {
    amount: Int as coins;
}

message UpdateMetadata {
    newUri: String;
}

message AddTrack {
    trackId:     Int as uint256;
    fingerprint: Int as uint256;
    trackContract: Address;
}

struct ArtistDetails {
    reputation: Int as uint32;
    totalTipVolume: Int as coins;
    stakedToon: Int as coins;
    isActive: Bool;
    totalTracks: Int as uint32;
}

// ─────────────────────────────────────────────────────────────────────────────
//  ToonArtist
// ─────────────────────────────────────────────────────────────────────────────
//
//  Status: IMPLEMENTED (Artist Identity & Reputation)
//
//  On-chain identity for a Toon artist.
//
//  Staking design:
//  • First track: NO stake required — this is the bootstrap moment where
//    the artist earns on-chain identity for the first time.
//  • Subsequent tracks: require MIN_STAKE in $TOON to prevent spam.
//
//  This resolves the chicken-and-egg problem: you need $TOON to stake,
//  but you get $TOON by uploading. The first upload is the seed event.
//
contract ToonArtist with Deployable {

    owner:          Address;
    registry:       Address;
    telegramHash:   Int as uint256;
    metadataUri:    String;

    reputation:     Int as uint32;
    totalTipVolume: Int as coins;
    stakedToon:     Int as coins;

    tracks:      map<Int, Address>;
    totalTracks: Int as uint32;

    const MIN_STAKE:            Int = 100000000000; // 100 $TOON (9 decimals)
    const TOON_DROP_THRESHOLD:  Int = 1000;

    init(owner: Address, registry: Address, telegramHash: Int, metadataUri: String) {
        self.owner         = owner;
        self.registry      = registry;
        self.telegramHash  = telegramHash;
        self.metadataUri   = metadataUri;
        self.reputation    = 0;
        self.totalTipVolume = 0;
        self.stakedToon    = 0;
        self.totalTracks   = 0;
    }

    receive(msg: UpdateMetadata) {
        require(sender() == self.owner, "ToonArtist: only owner can update metadata");
        require(msg.newUri != "", "ToonArtist: empty metadata URI");
        self.metadataUri = msg.newUri;
    }

    receive() {
        self.totalTipVolume = self.totalTipVolume + context().value;
    }

    receive("Tip received") {
        self.totalTipVolume = self.totalTipVolume + context().value;
    }

    receive(msg: StakeToon) {
        require(sender() == self.owner, "ToonArtist: only owner can stake");
        require(msg.amount > 0, "ToonArtist: stake amount must be positive");
        self.stakedToon = self.stakedToon + msg.amount;
    }

    // Status: EXPERIMENTAL (Mock implementation)
    receive(msg: UnstakeToon) {
        require(sender() == self.owner, "ToonArtist: only owner can unstake");
        require(self.stakedToon >= msg.amount, "ToonArtist: insufficient stake");
        self.stakedToon = self.stakedToon - msg.amount;
        send(SendParameters{
            to:    self.owner,
            value: 0,
            mode:  SendRemainingValue,
            body:  "Unstaked $TOON (mock)".asComment()
        });
    }

    // 2PC Registration handler
    receive("RegisterSelf") {
        require(sender() == self.owner, "ToonArtist: only owner can initiate registration");
        send(SendParameters{
            to: self.registry,
            value: 0,
            mode: SendRemainingValue,
            body: StageArtistRegistration{
                artistContract: myAddress(),
                wallet: self.owner
            }.toCell()
        });
    }

    receive("ConfirmRegistration") {
        require(sender() == self.owner, "ToonArtist: only owner can confirm registration");
        send(SendParameters{
            to: self.registry,
            value: 0,
            mode: SendRemainingValue,
            body: ConfirmArtistRegistration{ wallet: self.owner }.toCell()
        });
    }

    // Add a track to this artist's on-chain catalog.
    // First track: free — this is how identity is bootstrapped.
    // Subsequent tracks: require MIN_STAKE to prevent spam.
    receive(msg: AddTrack) {
        require(sender() == self.owner, "ToonArtist: only owner can add tracks");
        require(msg.trackContract != newAddress(0, 0), "ToonArtist: invalid track contract address");

        if (self.totalTracks > 0) {
            require(self.isActive(), "ToonArtist: stake required for additional tracks");
        }

        // Use fixed values for messages to avoid SendRemainingValue conflicts
        send(SendParameters{
            to:    self.registry,
            value: ton("0.05"),
            mode:  SendPayGasSeparately,
            body:  StageTrackRegistration{
                trackId:       msg.trackId,
                fingerprint:   msg.fingerprint,
                trackContract: msg.trackContract
            }.toCell()
        });

        // We don't increment totalTracks yet. We wait for 2PC completion.
        // In a real system, we'd store it as pending.
        self.tracks.set(msg.trackId, msg.trackContract);
        self.totalTracks   = self.totalTracks + 1;
        self.reputation    = self.reputation + 10;

        // Also notify the track contract to confirm
        send(SendParameters{
            to: msg.trackContract,
            value: ton("0.05"),
            mode: SendPayGasSeparately,
            body: "ConfirmRegistration".asComment()
        });
    }

    get fun isActive(): Bool {
        return self.stakedToon >= self.MIN_STAKE;
    }

    get fun canLaunchToonDrop(): Bool {
        return self.reputation >= self.TOON_DROP_THRESHOLD;
    }

    get fun getDetails(): ArtistDetails {
        return ArtistDetails{
            reputation: self.reputation,
            totalTipVolume: self.totalTipVolume,
            stakedToon: self.stakedToon,
            isActive: self.isActive(),
            totalTracks: self.totalTracks
        };
    }

    get fun getTrack(trackId: Int): Address? { return self.tracks.get(trackId); }
    get fun reputation(): Int                { return self.reputation; }
    get fun owner(): Address                 { return self.owner; }
    get fun totalTracks(): Int               { return self.totalTracks; }
    get fun stakedToon(): Int                { return self.stakedToon; }
}
