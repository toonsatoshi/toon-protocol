import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Address, toNano } from '@ton/core';
import { ToonRegistry } from '../build/ToonRegistry/ToonRegistry_ToonRegistry';
import '@ton/test-utils';

jest.setTimeout(30000);

describe('ToonRegistry', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let mintAuthority: SandboxContract<TreasuryContract>;
    let artist: SandboxContract<TreasuryContract>;
    let registry: SandboxContract<ToonRegistry>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        deployer = await blockchain.treasury('deployer');
        mintAuthority = await blockchain.treasury('mintAuthority');
        artist = await blockchain.treasury('artist');

        const vault = await blockchain.treasury('vault');
        registry = blockchain.openContract(await ToonRegistry.fromInit(mintAuthority.address, vault.address));

        const deployResult = await registry.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            }
        );

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: registry.address,
            deploy: true,
            success: true,
        });
    });

    it('should register an artist', async () => {
        const artistContract = await blockchain.treasury('artistContract');
        
        const result = await registry.send(
            artist.getSender(),
            {
                value: toNano('0.1'),
            },
            {
                $$type: 'RegisterArtist',
                artistContract: artistContract.address,
            }
        );

        expect(result.transactions).toHaveTransaction({
            from: artist.address,
            to: registry.address,
            success: true,
        });

        const registeredContract = await registry.getGetArtistContract(artist.address);
        expect(registeredContract?.toString()).toBe(artistContract.address.toString());
        
        expect(await registry.getIsRegisteredArtist(artist.address)).toBe(true);
    });

    it('should register a track', async () => {
        // Register artist first because track registration requires it
        const artistContract = await blockchain.treasury('artistContract');
        await registry.send(
            artist.getSender(),
            { value: toNano('0.1') },
            { $$type: 'RegisterArtist', artistContract: artistContract.address }
        );

        const trackId = 12345n;
        const fingerprint = 67890n;
        const trackContract = await blockchain.treasury('trackContract');

        // Track registration must be called by the artist contract in the current implementation
        // Note: isKnownArtistContract returns true for now in my Tact code
        const result = await registry.send(
            artistContract.getSender(),
            {
                value: toNano('0.1'),
            },
            {
                $$type: 'RegisterTrack',
                trackId: trackId,
                fingerprint: fingerprint,
                trackContract: trackContract.address,
            }
        );

        expect(result.transactions).toHaveTransaction({
            from: artistContract.address,
            to: registry.address,
            success: true,
        });

        expect(await registry.getIsRegisteredTrack(trackId)).toBe(true);
        expect(await registry.getFingerprintExists(fingerprint)).toBe(true);
    });

    it('should authorize mint only by mint authority', async () => {
        const recipient = await blockchain.treasury('recipient');
        const amount = toNano('100');

        const result = await registry.send(
            mintAuthority.getSender(),
            {
                value: toNano('0.1'),
            },
            {
                $$type: 'AuthorizeMint',
                recipient: recipient.address,
                amount: amount,
            }
        );

        expect(result.transactions).toHaveTransaction({
            from: mintAuthority.address,
            to: registry.address,
            success: true,
        });

        // Fail case: wrong sender
        const failResult = await registry.send(
            artist.getSender(),
            {
                value: toNano('0.1'),
            },
            {
                $$type: 'AuthorizeMint',
                recipient: recipient.address,
                amount: amount,
            }
        );

        expect(failResult.transactions).toHaveTransaction({
            from: artist.address,
            to: registry.address,
            success: false,
            exitCode: 27890, // "ToonRegistry: caller is not the mint authority"
        });
    });

    it('should update mint authority', async () => {
        const newAuthority = await blockchain.treasury('newAuthority');

        await registry.send(
            mintAuthority.getSender(),
            {
                value: toNano('0.1'),
            },
            {
                $$type: 'UpdateMintAuthority',
                newAuthority: newAuthority.address,
            }
        );

        expect((await registry.getGetMintAuthority()).toString()).toBe(newAuthority.address.toString());
    });
});
