import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Address, toNano } from '@ton/core';
import { MusicNft } from '../build/MusicNft/MusicNft_MusicNft';
import '@ton/test-utils';

describe('MusicNft', () => {
    let blockchain: Blockchain;
    let artist: SandboxContract<TreasuryContract>;
    let fan: SandboxContract<TreasuryContract>;
    let nft: SandboxContract<MusicNft>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        artist = await blockchain.treasury('artist');
        fan = await blockchain.treasury('fan');

        nft = blockchain.openContract(
            await MusicNft.fromInit(
                artist.address,
                {
                    $$type: 'TrackMetadata',
                    title: "Test Track",
                    uri: "https://toon.music/track/1",
                    genre: "Lo-Fi"
                },
                toNano('1'), // mintFee (minimum tip)
                0n // initial reputation
            )
        );

        const deployResult = await nft.send(
            artist.getSender(),
            { value: toNano('0.05') },
            { $$type: 'Deploy', queryId: 0n }
        );
        expect(deployResult.transactions).toHaveTransaction({
            from: artist.address,
            to: nft.address,
            deploy: true,
            success: true,
        });
    });

    it('should store metadata correctly', async () => {
        const metadata = await nft.getMetadata();
        expect(metadata.title).toBe("Test Track");
        expect(metadata.genre).toBe("Lo-Fi");
        expect(await nft.getArtist()).toEqualAddress(artist.address);
    });

    it('should accept tips and update reputation', async () => {
        const result = await nft.send(
            fan.getSender(),
            { value: toNano('1.1') },
            "tip"
        );

        expect(result.transactions).toHaveTransaction({
            from: fan.address,
            to: nft.address,
            success: true,
        });

        expect(result.transactions).toHaveTransaction({
            from: nft.address,
            to: artist.address,
            success: true,
        });

        expect(await nft.getReputation()).toBe(1n);
    });

    it('should reject tips below minimum fee', async () => {
        const result = await nft.send(
            fan.getSender(),
            { value: toNano('0.5') }, // below 1 TON fee
            "tip"
        );

        expect(result.transactions).toHaveTransaction({
            from: fan.address,
            to: nft.address,
            success: false,
        });
    });
});
