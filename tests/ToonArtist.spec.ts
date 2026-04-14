import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Address, toNano } from '@ton/core';
import { ToonRegistry } from '../build/ToonRegistry/ToonRegistry_ToonRegistry';
import { ToonArtist } from '../build/ToonArtist/ToonArtist_ToonArtist';
import '@ton/test-utils';

jest.setTimeout(60000);

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
        await registry.send(deployer.getSender(), { value: toNano('1') }, { $$type: 'Deploy', queryId: 0n });
        await deployer.send({ to: registry.address, value: toNano('10') });

        const telegramHash = 123456789n;
        const metadataUri = "ipfs://artist-metadata";
        const jettonMaster = (await blockchain.treasury('jettonMaster')).address;
        artistContract = blockchain.openContract(await ToonArtist.fromInit(artist.address, registry.address, jettonMaster, telegramHash, metadataUri));

        await artistContract.send(artist.getSender(), { value: toNano('1') }, { $$type: 'Deploy', queryId: 0n });
    });

    it('should initialize correctly', async () => {
        expect(await artistContract.getOwner()).toEqualAddress(artist.address);
        expect(await artistContract.getIsActive()).toBe(false);
        expect(await artistContract.getReputation()).toBe(0n);
    });

    it('should register artist in registry using 2PC', async () => {
        await artistContract.send(artist.getSender(), { value: toNano('1') }, "RegisterSelf");
        await artistContract.send(artist.getSender(), { value: toNano('1') }, "ConfirmRegistration");

        expect(await registry.getIsRegisteredArtist(artist.address)).toBe(true);
        expect(await registry.getGetArtistContract(artist.address)).toEqualAddress(artistContract.address);
    });

    it('should add track through artist contract using 2PC', async () => {
        // Must be registered
        await artistContract.send(artist.getSender(), { value: toNano('1') }, "RegisterSelf");
        await artistContract.send(artist.getSender(), { value: toNano('1') }, "ConfirmRegistration");

        // First track is free, no stake needed
        const trackId = 1n;
        const fingerprint = 111n;
        const track = await blockchain.treasury('track');
        const trackAddr = track.address;

        await artistContract.send(artist.getSender(), { value: toNano('1') }, {
            $$type: 'AddTrack',
            trackId: trackId,
            fingerprint: fingerprint,
            trackContract: trackAddr
        });

        // Manually confirm track registration in Registry
        await registry.send(track.getSender(), { value: toNano('1') }, {
            $$type: 'ConfirmTrackRegistration',
            trackId: trackId
        });

        // Manually send TrackRegistrationFinalized to ToonArtist because we are mocking the track contract with a treasury
        await artistContract.send(deployer.getSender(), { value: toNano('0.1') }, {
            $$type: 'TrackRegistrationFinalized',
            trackId: trackId,
            trackContract: trackAddr
        });

        expect(await registry.getIsRegisteredTrack(trackId)).toBe(true);
        expect(await artistContract.getGetTrack(trackId)).toEqualAddress(trackAddr);
        expect(await artistContract.getReputation()).toBe(10n); // reputation bonus
    });
});
