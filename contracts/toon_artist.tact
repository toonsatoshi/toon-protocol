import "@stdlib/deploy";

// ─────────────────────────────────────────────────────────────────────────────
//  Messages
// ─────────────────────────────────────────────────────────────────────────────

message RegisterArtist {
    artistContract: Address;
}

message RegisterTrack {
    trackId:        Int as uint256;
    fingerprint:    Int as uint256;
    trackContract:  Address;
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

// ─────────────────────────────────────────────────────────────────────────────
//  ToonArtist
// ─────────────────────────────────────────────────────────────────────────────
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
        self.stakedToon = self.stakedToon + msg.amount;
    }

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

    receive("Withdraw") {
        require(sender() == self.owner, "ToonArtist: only owner can withdraw");
        send(SendParameters{
            to:    self.owner,
            value: 0,
            mode:  SendRemainingValue,
            body:  "Withdrawal successful".asComment()
        });
    }

    // Add a track to this artist's on-chain catalog.
    // First track: free — this is how identity is bootstrapped.
    // Subsequent tracks: require MIN_STAKE to prevent spam.
    receive(msg: AddTrack) {
        require(sender() == self.owner, "ToonArtist: only owner can add tracks");

        if (self.totalTracks > 0) {
            require(self.isActive(), "ToonArtist: stake required for additional tracks");
        }

        send(SendParameters{
            to:    self.registry,
            value: 0,
            mode:  SendRemainingValue,
            body:  RegisterTrack{
                trackId:       msg.trackId,
                fingerprint:   msg.fingerprint,
                trackContract: msg.trackContract
            }.toCell()
        });

        self.tracks.set(msg.trackId, msg.trackContract);
        self.totalTracks   = self.totalTracks + 1;
        self.reputation    = self.reputation + 10;
    }

    get fun isActive(): Bool {
        return self.stakedToon >= self.MIN_STAKE;
    }

    get fun canLaunchToonDrop(): Bool {
        return self.reputation >= self.TOON_DROP_THRESHOLD;
    }

    get fun details(): String {
        let sb: StringBuilder = beginString();
        sb.append("reputation: ");
        sb.append(self.reputation.toString());
        sb.append(" | tips: ");
        sb.append(self.totalTipVolume.toString());
        sb.append(" | staked: ");
        sb.append(self.stakedToon.toString());
        sb.append(" | active: ");
        if (self.isActive()) { sb.append("yes"); } else { sb.append("no"); }
        return sb.toString();
    }

    get fun getTrack(trackId: Int): Address? { return self.tracks.get(trackId); }
    get fun reputation(): Int                { return self.reputation; }
    get fun owner(): Address                 { return self.owner; }
    get fun totalTracks(): Int               { return self.totalTracks; }
    get fun stakedToon(): Int                { return self.stakedToon; }
}
