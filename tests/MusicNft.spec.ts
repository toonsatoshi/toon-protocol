import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { toNano } from '@ton/core';
import { MusicNft } from '../build/MusicNft/MusicNft_MusicNft';
import '@ton/test-utils';

jest.setTimeout(30000);

describe('MusicNft', () => {
    let blockchain: Blockchain;
    let artist: SandboxContract<TreasuryContract>;
    let fan: SandboxContract<TreasuryContract>;
    let track: SandboxContract<MusicNft>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        artist = await blockchain.treasury('artist');
        fan = await blockchain.treasury('fan');

        track = blockchain.openContract(await MusicNft.fromInit(
            artist.address,
            { $$type: 'TrackMetadata', title: 'Test Track', uri: 'ipfs://test', genre: 'Hip Hop' },
            toNano('0.1'),
            0n
        ));

        await track.send(artist.getSender(), { value: toNano('0.5') }, null);
    });

    it('should deploy with zero reputation', async () => {
        expect(await track.getReputation()).toBe(0n);
    });

    it('should increment reputation on tip', async () => {
        await track.send(fan.getSender(), { value: toNano('0.2') }, 'tip');
        expect(await track.getReputation()).toBe(1n);
    });

    it('should reject tip below mint fee', async () => {
        const result = await track.send(
            fan.getSender(),
            { value: toNano('0.05') },
            'tip'
        );
        expect(result.transactions).toHaveTransaction({
            exitCode: 11159
        });
    });
});
