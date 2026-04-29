import "@stdlib/deploy";

struct TrackMetadata {
    title: String;
    uri: String;
    genre: String;
}

contract MusicNft with Deployable {
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
        self.artist = artist;
        self.metadata = metadata;
        self.mintFee = mintFee;
        self.reputation = reputation;
    }

    receive() {
        // Just accept TON
    }

    receive("tip") {
        require(context().value >= self.mintFee, "Tip below minimum");
        self.reputation = self.reputation + 1;
        send(SendParameters{
            to: self.artist,
            value: 0,
            mode: SendRemainingValue,
            body: "tip received".asComment()
        });
    }

    get fun reputation(): Int {
        return self.reputation;
    }

    get fun artist(): Address {
        return self.artist;
    }

    get fun metadata(): TrackMetadata {
        return self.metadata;
    }
}
