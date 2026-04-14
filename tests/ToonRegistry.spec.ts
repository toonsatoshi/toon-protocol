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
                value: toNano('1'),
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

    it('should register an artist using 2PC', async () => {
        const artistContract = await blockchain.treasury('artistContract');
        
        // Stage
        await registry.send(
            artist.getSender(),
            { value: toNano('1') },
            {
                $$type: 'StageArtistRegistration',
                artistContract: artistContract.address,
                wallet: artist.address,
            }
        );

        expect(await registry.getIsRegisteredArtist(artist.address)).toBe(false);

        // Confirm
        const result = await registry.send(
            artistContract.getSender(),
            { value: toNano('1') },
            {
                $$type: 'ConfirmArtistRegistration',
                wallet: artist.address,
            }
        );

        expect(result.transactions).toHaveTransaction({
            from: artistContract.address,
            to: registry.address,
            success: true,
        });

        const registeredContract = await registry.getGetArtistContract(artist.address);
        expect(registeredContract?.toString()).toBe(artistContract.address.toString());
        
        expect(await registry.getIsRegisteredArtist(artist.address)).toBe(true);
    });

    it('should register a track using 2PC', async () => {
        // Register artist first
        const artistContract = await blockchain.treasury('artistContract');
        await registry.send(artist.getSender(), { value: toNano('1') }, {
            $$type: 'StageArtistRegistration',
            artistContract: artistContract.address,
            wallet: artist.address,
        });
        await registry.send(artistContract.getSender(), { value: toNano('1') }, { $$type: 'ConfirmArtistRegistration', wallet: artist.address });

        const trackId = 12345n;
        const fingerprint = 67890n;
        const trackContract = await blockchain.treasury('trackContract');

        // Stage
        await registry.send(
            artistContract.getSender(),
            { value: toNano('1') },
            {
                $$type: 'StageTrackRegistration',
                trackId: trackId,
                fingerprint: fingerprint,
                trackContract: trackContract.address,
            }
        );

        expect(await registry.getIsRegisteredTrack(trackId)).toBe(false);

        // Confirm
        const result = await registry.send(
            trackContract.getSender(),
            { value: toNano('1') },
            {
                $$type: 'ConfirmTrackRegistration',
                trackId: trackId,
            }
        );

        expect(result.transactions).toHaveTransaction({
            from: trackContract.address,
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
                value: toNano('1'),
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
                value: toNano('1'),
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
                value: toNano('1'),
            },
            {
                $$type: 'UpdateMintAuthority',
                newAuthority: newAuthority.address,
            }
        );

        expect((await registry.getGetMintAuthority()).toString()).toBe(newAuthority.address.toString());
    });
});
