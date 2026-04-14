(BigInt.prototype as any).toJSON = function () {
    return this.toString();
};

import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Address, toNano, beginCell } from '@ton/core';
import { ToonRegistry } from '../build/ToonRegistry/ToonRegistry_ToonRegistry';
import { ToonTrack } from '../build/ToonTrack/ToonTrack_ToonTrack';
import { ToonArtist } from '../build/ToonArtist/ToonArtist_ToonArtist';
import { ToonVault } from '../build/ToonVault/ToonVault_ToonVault';
import '@ton/test-utils';

jest.setTimeout(60000);

describe('ToonTrack', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let artist: SandboxContract<TreasuryContract>;
    let fan: SandboxContract<TreasuryContract>;
    let registry: SandboxContract<ToonRegistry>;
    let artistContract: SandboxContract<ToonArtist>;
    let trackContract: SandboxContract<ToonTrack>;
    let vault: SandboxContract<ToonVault>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        deployer = await blockchain.treasury('deployer');
        artist = await blockchain.treasury('artist');
        fan = await blockchain.treasury('fan');

        const governance = await blockchain.treasury('governance');
        const jettonMaster = await blockchain.treasury('jettonMaster');
        const placeholder = Address.parse("EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c");

        // 1. Deploy Registry with placeholder vault
        registry = blockchain.openContract(await ToonRegistry.fromInit(deployer.address, placeholder));
        await registry.send(deployer.getSender(), { value: toNano('1') }, { $$type: 'Deploy', queryId: 0n });

        // 2. Deploy Vault with real registry address
        vault = blockchain.openContract(await ToonVault.fromInit(
            deployer.address,
            registry.address,
            governance.address,
            0n, // oraclePublicKey
            toNano('1000'), // totalReserve
            0n, // dailyEmitted
            0n, // lastResetDay
            false, // halved
            0n // dailyClaimCount
        ));
        await vault.send(deployer.getSender(), { value: toNano('10') }, { $$type: 'Deploy', queryId: 0n });

        // 3. Update Registry with real vault address
        await registry.send(deployer.getSender(), { value: toNano('0.1') }, {
            $$type: 'UpdateVaultAddress',
            newVault: vault.address
        });

        // 4. Deploy Artist Contract
        artistContract = blockchain.openContract(await ToonArtist.fromInit(
            artist.address,
            registry.address,
            jettonMaster.address,
            123456789n,
            "ipfs://artist-metadata"
        ));
        await artistContract.send(artist.getSender(), { value: toNano('1') }, { $$type: 'Deploy', queryId: 0n });
        
        // Register artist (2PC)
        await artistContract.send(artist.getSender(), { value: toNano('0.5') }, "RegisterSelf");
        await artistContract.send(artist.getSender(), { value: toNano('0.5') }, "ConfirmRegistration");

        expect(await registry.getIsRegisteredArtist(artist.address)).toBe(true);

        // 5. Deploy Track
        const fingerprint = 999n;
        const trackId = 1n;
        trackContract = blockchain.openContract(await ToonTrack.fromInit(
            artistContract.address,
            registry.address,
            trackId,
            "ipfs://track-metadata",
            fingerprint,
            toNano('0.1') // mintFee
        ));

        await trackContract.send(artist.getSender(), { value: toNano('1') }, { $$type: 'Deploy', queryId: 0n });

        // Register track (2PC via Artist)
        const addTrackResult = await artistContract.send(artist.getSender(), { value: toNano('1') }, {
            $$type: 'AddTrack',
            trackId: trackId,
            fingerprint: fingerprint,
            trackContract: trackContract.address
        });

        // Verification of 2PC chain
        expect(addTrackResult.transactions).toHaveTransaction({
            from: artistContract.address,
            to: registry.address,
            success: true,
        });
        expect(addTrackResult.transactions).toHaveTransaction({
            from: registry.address,
            to: artistContract.address,
            success: true,
        });
        expect(addTrackResult.transactions).toHaveTransaction({
            from: artistContract.address,
            to: trackContract.address,
            success: true,
        });
        expect(addTrackResult.transactions).toHaveTransaction({
            from: trackContract.address,
            to: registry.address,
            success: true,
        });
        expect(addTrackResult.transactions).toHaveTransaction({
            from: registry.address,
            to: trackContract.address,
            success: true,
        });

        expect(await trackContract.getIsRegistered()).toBe(true);
    });

    it('should initialize correctly', async () => {
        expect(await trackContract.getReputation()).toBe(0n);
        expect(await trackContract.getMintFee()).toBe(toNano('0.1'));
    });

    it('should handle tips and increment reputation only after confirmation', async () => {
        const tipAmount = toNano('0.5');
        
        const result = await trackContract.send(
            fan.getSender(),
            { value: tipAmount },
            "tip"
        );

        // 1. Check if reputation is NOT incremented immediately if we were to stop here
        // (But result already includes the whole chain in Sandbox)

        // 2. Check the message chain
        expect(result.transactions).toHaveTransaction({
            from: fan.address,
            to: trackContract.address,
            success: true,
        });

        // Track -> Artist (Forward tip)
        expect(result.transactions).toHaveTransaction({
            from: trackContract.address,
            to: artistContract.address,
            success: true,
        });

        // Track -> Registry (RequestMint)
        expect(result.transactions).toHaveTransaction({
            from: trackContract.address,
            to: registry.address,
            success: true,
        });

        // Registry -> Vault (MintAuthorized)
        expect(result.transactions).toHaveTransaction({
            from: registry.address,
            to: vault.address,
            success: true,
        });

        // Vault -> Registry (MintConfirmed)
        expect(result.transactions).toHaveTransaction({
            from: vault.address,
            to: registry.address,
            success: true,
        });

        // Registry -> Track (MintConfirmed)
        expect(result.transactions).toHaveTransaction({
            from: registry.address,
            to: trackContract.address,
            success: true,
        });

        // Should increment reputation now
        expect(await trackContract.getReputation()).toBe(1n);

        // Artist contract should have received some tip volume
        const artistDetails = await artistContract.getGetDetails();
        expect(artistDetails.totalTipVolume).toBeGreaterThan(0n);
    });

    it('should reject tips below floor', async () => {
        const result = await trackContract.send(
            fan.getSender(),
            { value: toNano('0.05') },
            "tip"
        );

        expect(result.transactions).toHaveTransaction({
            from: fan.address,
            to: trackContract.address,
            success: false,
            exitCode: 43013,
        });
    });
});
