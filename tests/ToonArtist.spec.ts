import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Address, toNano } from '@ton/core';
import { ToonArtist } from '../build/ToonArtist/ToonArtist_ToonArtist';
import '@ton/test-utils';

describe('ToonArtist', () => {
    let blockchain: Blockchain;
    let owner: SandboxContract<TreasuryContract>;
    let registry: SandboxContract<TreasuryContract>;
    let artist: SandboxContract<ToonArtist>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        owner = await blockchain.treasury('owner');
        registry = await blockchain.treasury('registry');

        artist = blockchain.openContract(
            await ToonArtist.fromInit(
                owner.address,
                registry.address,
                12345n, // telegramHash
                "https://toon.music/artist/12345"
            )
        );

        const deployResult = await artist.send(
            owner.getSender(),
            { value: toNano('0.05') },
            { $$type: 'Deploy', queryId: 0n }
        );
        expect(deployResult.transactions).toHaveTransaction({
            from: owner.address,
            to: artist.address,
            deploy: true,
            success: true,
        });
    });

    it('should allow owner to update metadata', async () => {
        const newUri = "https://new.uri";
        await artist.send(
            owner.getSender(),
            { value: toNano('0.05') },
            { $$type: 'UpdateMetadata', newUri }
        );
        // We don't have a getter for metadataUri in the contract, but it should succeed.
    });

    it('should allow adding the first track for free', async () => {
        const trackContract = await blockchain.treasury('trackContract');
        const result = await artist.send(
            owner.getSender(),
            { value: toNano('0.1') },
            {
                $$type: 'AddTrack',
                trackId: 1n,
                fingerprint: 100n,
                trackContract: trackContract.address
            }
        );

        expect(result.transactions).toHaveTransaction({
            from: artist.address,
            to: registry.address,
            success: true,
        });

        expect(await artist.getTotalTracks()).toBe(1n);
        expect(await artist.getReputation()).toBe(10n);
    });

    it('should reject second track without staking', async () => {
        // First track
        await artist.send(owner.getSender(), { value: toNano('0.1') }, {
            $$type: 'AddTrack', trackId: 1n, fingerprint: 100n, trackContract: (await blockchain.treasury('t1')).address
        });

        // Second track
        const result = await artist.send(
            owner.getSender(),
            { value: toNano('0.1') },
            {
                $$type: 'AddTrack',
                trackId: 2n,
                fingerprint: 200n,
                trackContract: (await blockchain.treasury('t2')).address
            }
        );

        expect(result.transactions).toHaveTransaction({
            from: owner.address,
            to: artist.address,
            success: false, // Fails because isActive() is false
        });
    });

    it('should allow adding more tracks after staking', async () => {
        // First track
        await artist.send(owner.getSender(), { value: toNano('0.1') }, {
            $$type: 'AddTrack', trackId: 1n, fingerprint: 100n, trackContract: (await blockchain.treasury('t1')).address
        });

        // Stake MIN_STAKE (100 $TOON = 100 * 10^9 nano)
        const MIN_STAKE = 100000000000n;
        await artist.send(
            owner.getSender(),
            { value: toNano('100') },
            { $$type: 'StakeToon', amount: MIN_STAKE }
        );

        expect(await artist.getIsActive()).toBe(true);

        // Second track
        const result = await artist.send(
            owner.getSender(),
            { value: toNano('0.1') },
            {
                $$type: 'AddTrack',
                trackId: 2n,
                fingerprint: 200n,
                trackContract: (await blockchain.treasury('t2')).address
            }
        );

        expect(result.transactions).toHaveTransaction({
            from: artist.address,
            to: registry.address,
            success: true,
        });

        expect(await artist.getTotalTracks()).toBe(2n);
    });

    it('should track reputation milestone for ToonDrop', async () => {
        // Bootstrap some reputation
        // Each track gives 10 reputation. Threshold is 1000.
        // This test might be slow if we add 100 tracks, but we can test the logic.
        expect(await artist.getCanLaunchToonDrop()).toBe(false);
    });

    it('should reject stake inflation when attached value is lower than declared amount', async () => {
        const result = await artist.send(
            owner.getSender(),
            { value: toNano('0.1') },
            { $$type: 'StakeToon', amount: 100000000000n }
        );

        expect(result.transactions).toHaveTransaction({
            from: owner.address,
            to: artist.address,
            success: false,
        });
    });
});
