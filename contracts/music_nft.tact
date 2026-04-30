import "@stdlib/deploy";

struct TrackMetadata {
    title: String;
    uri: String;
    genre: String;
}

message Transfer {
    newOwner: Address;
}

contract MusicNft with Deployable {
    owner: Address;
    artist: Address;
    metadata: TrackMetadata;
    mintFee: Int as coins;
    reputation: Int as uint32;

    init(
        artist: Address,
        metadata: TrackMetadata,
        mintFee: Int,
        reputation: Int
    ) {
        self.owner = artist;
        self.artist = artist;
        self.metadata = metadata;
        self.mintFee = mintFee;
        self.reputation = reputation;
    }

    receive(msg: Transfer) {
        require(sender() == self.owner, "MusicNft: not owner");
        self.owner = msg.newOwner;
    }

    receive() {}

    receive("tip") {
        require(context().value >= self.mintFee, "Tip below minimum");
        self.reputation = self.reputation + 1;
        send(SendParameters{ to: self.artist, value: 0, mode: SendRemainingValue, body: "tip received".asComment() });
    }

    get fun owner(): Address { return self.owner; }
    get fun artist(): Address { return self.artist; }
    get fun contentUri(): String { return self.metadata.uri; }
}
