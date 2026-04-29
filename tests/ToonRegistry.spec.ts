import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Address, toNano } from '@ton/core';
import { ToonRegistry } from '../build/ToonRegistry/ToonRegistry_ToonRegistry';
import '@ton/test-utils';

describe('ToonRegistry', () => {
    let blockchain: Blockchain;
    let owner: SandboxContract<TreasuryContract>;
    let vault: SandboxContract<TreasuryContract>;
    let artist: SandboxContract<TreasuryContract>;
    let registry: SandboxContract<ToonRegistry>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        owner = await blockchain.treasury('owner');
        vault = await blockchain.treasury('vault');
        artist = await blockchain.treasury('artist');

        registry = blockchain.openContract(
            await ToonRegistry.fromInit(owner.address, vault.address)
        );

        const deployResult = await registry.send(
            owner.getSender(),
            { value: toNano('0.05') },
            { $$type: 'Deploy', queryId: 0n }
        );
        expect(deployResult.transactions).toHaveTransaction({
            from: owner.address,
            to: registry.address,
            deploy: true,
            success: true,
        });
    });

    it('should allow owner to update vault address', async () => {
        const newVault = await blockchain.treasury('newVault');
        await registry.send(
            owner.getSender(),
            { value: toNano('0.05') },
            { $$type: 'UpdateVaultAddress', newVault: newVault.address }
        );
        expect(await registry.getGetVault()).toEqualAddress(newVault.address);
    });

    it('should allow owner to update mint authority', async () => {
        const newAuth = await blockchain.treasury('newAuth');
        await registry.send(
            owner.getSender(),
            { value: toNano('0.05') },
            { $$type: 'UpdateMintAuthority', newAuthority: newAuth.address }
        );
        expect(await registry.getGetMintAuthority()).toEqualAddress(newAuth.address);
    });

    it('should register an artist', async () => {
        const artistContract = await blockchain.treasury('artistContract');
        const result = await registry.send(
            artist.getSender(),
            { value: toNano('0.05') },
            { $$type: 'RegisterArtist', artistContract: artistContract.address }
        );

        expect(result.transactions).toHaveTransaction({
            from: artist.address,
            to: registry.address,
            success: true,
        });

        expect(await registry.getGetArtistContract(artist.address)).toEqualAddress(artistContract.address);
        expect(await registry.getGetTotalArtists()).toBe(1n);
    });

    it('should register a track from a registered artist contract', async () => {
        const artistContract = await blockchain.treasury('artistContract');
        const trackContract = await blockchain.treasury('trackContract');
        
        // First register the artist
        await registry.send(
            artist.getSender(),
            { value: toNano('0.05') },
            { $$type: 'RegisterArtist', artistContract: artistContract.address }
        );

        // Register track from artistContract
        const result = await registry.send(
            artistContract.getSender(),
            { value: toNano('0.05') },
            {
                $$type: 'RegisterTrack',
                trackId: 123n,
                fingerprint: 456n,
                trackContract: trackContract.address
            }
        );

        expect(result.transactions).toHaveTransaction({
            from: artistContract.address,
            to: registry.address,
            success: true,
        });

        expect(await registry.getGetTrackContract(123n)).toEqualAddress(trackContract.address);
        expect(await registry.getGetTotalTracks()).toBe(1n);
    });

    it('should prevent duplicate track fingerprints', async () => {
        const artistContract = await blockchain.treasury('artistContract');
        const trackContract1 = await blockchain.treasury('trackContract1');
        const trackContract2 = await blockchain.treasury('trackContract2');
        
        await registry.send(artist.getSender(), { value: toNano('0.05') }, { $$type: 'RegisterArtist', artistContract: artistContract.address });

        await registry.send(artistContract.getSender(), { value: toNano('0.05') }, {
            $$type: 'RegisterTrack',
            trackId: 1n,
            fingerprint: 100n,
            trackContract: trackContract1.address
        });

        const result = await registry.send(artistContract.getSender(), { value: toNano('0.05') }, {
            $$type: 'RegisterTrack',
            trackId: 2n,
            fingerprint: 100n, // Duplicate fingerprint
            trackContract: trackContract2.address
        });

        expect(result.transactions).toHaveTransaction({
            success: false,
        });
    });

    it('should authorize mint from mint authority', async () => {
        const recipient = await blockchain.treasury('recipient');
        const amount = toNano('100');
        
        // Owner is default mint authority
        const result = await registry.send(
            owner.getSender(),
            { value: toNano('0.05') },
            { $$type: 'AuthorizeMint', recipient: recipient.address, amount }
        );

        expect(result.transactions).toHaveTransaction({
            from: registry.address,
            to: vault.address,
            success: true,
            // body: MintAuthorized message
        });
    });
});
