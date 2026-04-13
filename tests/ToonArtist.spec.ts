import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Address, toNano } from '@ton/core';
import { ToonRegistry } from '../build/ToonRegistry/ToonRegistry_ToonRegistry';
import { ToonArtist } from '../build/ToonArtist/ToonArtist_ToonArtist';
import '@ton/test-utils';

jest.setTimeout(30000);

describe('ToonArtist', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let artist: SandboxContract<TreasuryContract>;
    let mintAuthority: Address;
    let registry: SandboxContract<ToonRegistry>;
    let artistContract: SandboxContract<ToonArtist>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        deployer = await blockchain.treasury('deployer');
        artist = await blockchain.treasury('artist');
        mintAuthority = (await blockchain.treasury('mintAuthority')).address;
        const vault = (await blockchain.treasury('vault')).address;

        registry = blockchain.openContract(await ToonRegistry.fromInit(mintAuthority, vault));
        await registry.send(deployer.getSender(), { value: toNano('0.05') }, { $$type: 'Deploy', queryId: 0n });

        const telegramHash = 123456789n;
        const metadataUri = "ipfs://artist-metadata";
        artistContract = blockchain.openContract(await ToonArtist.fromInit(artist.address, registry.address, telegramHash, metadataUri));

        await artistContract.send(artist.getSender(), { value: toNano('0.05') }, { $$type: 'Deploy', queryId: 0n });
    });

    it('should initialize correctly', async () => {
        expect(await artistContract.getOwner()).toEqualAddress(artist.address);
        expect(await artistContract.getIsActive()).toBe(false);
        expect(await artistContract.getReputation()).toBe(0n);
    });

    it('should become active after staking', async () => {
        const minStake = toNano('100');
        await artistContract.send(artist.getSender(), { value: toNano('0.1') }, { $$type: 'StakeToon', amount: minStake });
        expect(await artistContract.getIsActive()).toBe(true);
    });

    it('should register artist in registry using 2PC', async () => {
        await artistContract.send(artist.getSender(), { value: toNano('0.1') }, "RegisterSelf");
        await artistContract.send(artist.getSender(), { value: toNano('0.1') }, "ConfirmRegistration");

        expect(await registry.getIsRegisteredArtist(artist.address)).toBe(true);
        expect(await registry.getArtistContract(artist.address)).toEqualAddress(artistContract.address);
    });

    it('should add track through artist contract using 2PC', async () => {
        // Must be registered and active
        await artistContract.send(artist.getSender(), { value: toNano('0.1') }, "RegisterSelf");
        await artistContract.send(artist.getSender(), { value: toNano('0.1') }, "ConfirmRegistration");

        await artistContract.send(artist.getSender(), { value: toNano('0.1') }, { $$type: 'StakeToon', amount: toNano('100') });

        const trackId = 1n;
        const fingerprint = 111n;
        const track = await blockchain.treasury('track');
        const trackAddr = track.address;

        const result = await artistContract.send(artist.getSender(), { value: toNano('0.1') }, {
            $$type: 'AddTrack',
            trackId: trackId,
            fingerprint: fingerprint,
            trackContract: trackAddr
        });

        // Manually confirm track registration since track treasury won't do it
        await registry.send(track.getSender(), { value: toNano('0.1') }, {
            $$type: 'ConfirmTrackRegistration',
            trackId: trackId
        });

        expect(await registry.getIsRegisteredTrack(trackId)).toBe(true);
        expect(await artistContract.getTrack(trackId)).toEqualAddress(trackAddr);
        expect(await artistContract.getReputation()).toBe(10n); // reputation bonus
    });
});
