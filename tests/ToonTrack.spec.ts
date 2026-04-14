(BigInt.prototype as any).toJSON = function () {
    return this.toString();
};

import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Address, toNano } from '@ton/core';
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
    let vaultContract: SandboxContract<ToonVault>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        deployer = await blockchain.treasury('deployer');
        artist = await blockchain.treasury('artist');
        fan = await blockchain.treasury('fan');

        const vaultOwner = await blockchain.treasury('vaultOwner');
        const jettonMaster = await blockchain.treasury('jettonMaster');

        // 0. Deploy Vault
        vaultContract = blockchain.openContract(await ToonVault.fromInit(
            vaultOwner.address,
            vaultOwner.address, // registry temp placeholder
            vaultOwner.address,
            0n, // oracle key
            toNano('1000000'),
            0n, 0n, false, 0n
        ));
        await vaultContract.send(deployer.getSender(), { value: toNano('2') }, { $$type: 'Deploy', queryId: 0n });
        await deployer.send({ to: vaultContract.address, value: toNano('100') }); // Top up

        // 1. Deploy Registry
        registry = blockchain.openContract(await ToonRegistry.fromInit(deployer.address, vaultContract.address));
        await registry.send(deployer.getSender(), { value: toNano('10') }, { $$type: 'Deploy', queryId: 0n });

        // Update vault's registry address
        await vaultContract.send(vaultOwner.getSender(), { value: toNano('2') }, { $$type: 'UpdateRegistry', newRegistry: registry.address });

        // 2. Deploy Artist Contract
        artistContract = blockchain.openContract(await ToonArtist.fromInit(artist.address, registry.address, jettonMaster.address, 123n, "uri"));
        await artistContract.send(artist.getSender(), { value: toNano('10') }, { $$type: 'Deploy', queryId: 0n });
        
        // Register artist (Two-Phase Commit)
        // Step 1: Stage
        const regSelfResult = await artistContract.send(artist.getSender(), { value: toNano('2') }, "RegisterSelf");
        expect(regSelfResult.transactions).toHaveTransaction({
            from: artistContract.address,
            to: registry.address,
            success: true
        });

        // Step 2: Confirm
        const confirmRegResult = await artistContract.send(artist.getSender(), { value: toNano('2') }, "ConfirmRegistration");
        expect(confirmRegResult.transactions).toHaveTransaction({
            from: artistContract.address,
            to: registry.address,
            success: true
        });

        if (!(await registry.getIsRegisteredArtist(artist.address))) {
            throw new Error("Artist registration failed");
        }

        // 3. Deploy Track
        const fingerprint = 999n;
        const trackId = 1n;
        trackContract = blockchain.openContract(await ToonTrack.fromInit(
            artistContract.address,
            registry.address,
            trackId,
            "ipfs://track-metadata",
            fingerprint,
            toNano('0.1') // 0.1 TON
        ));

        await trackContract.send(artist.getSender(), { value: toNano('2') }, { $$type: 'Deploy', queryId: 0n });

        // Register track via ToonArtist.AddTrack (which triggers Track 2PC)
        const addTrackResult = await artistContract.send(artist.getSender(), { value: toNano('2') }, {
            $$type: 'AddTrack',
            trackId: trackId,
            fingerprint: fingerprint,
            trackContract: trackContract.address
        });

        // Ensure registration reached the track contract and completed
        expect(addTrackResult.transactions).toHaveTransaction({
            from: registry.address,
            to: trackContract.address,
            success: true
        });

        expect(addTrackResult.transactions).toHaveTransaction({
            from: trackContract.address,
            to: artistContract.address,
            success: true
        });
    });

    it('should initialize correctly', async () => {
        expect(await trackContract.getReputation()).toBe(0n);
        expect(await trackContract.getPendingTips()).toBe(0n);
        expect(await trackContract.getMintFee()).toBe(toNano('0.1'));
    });

    it('should handle tips and increment reputation only after confirmation', async () => {
        const tipAmount = toNano('1'); // 1 TON
        
        const result = await trackContract.send(
            fan.getSender(),
            { value: tipAmount },
            "tip"
        );

        // 1. Check if initial transaction to trackContract was successful
        expect(result.transactions).toHaveTransaction({
            from: fan.address,
            to: trackContract.address,
            success: true,
        });

        // 2. Reputation should NOT increment immediately if we could pause the chain,
        // but Sandbox processes everything. However, we can check the transaction sequence.

        // Should forward value to artist contract
        expect(result.transactions).toHaveTransaction({
            from: trackContract.address,
            to: artistContract.address,
            success: true,
        });

        // Should request mint from registry
        expect(result.transactions).toHaveTransaction({
            from: trackContract.address,
            to: registry.address,
            success: true,
        });
        
        // Registry should send MintAuthorized to vault
        expect(result.transactions).toHaveTransaction({
            from: registry.address,
            to: (await registry.getVault()),
            success: true
        });

        // Vault should send MintSuccess back to registry
        expect(result.transactions).toHaveTransaction({
            from: (await registry.getVault()),
            to: registry.address,
            success: true
        });

        // Registry should send ConfirmTip to track
        expect(result.transactions).toHaveTransaction({
            from: registry.address,
            to: trackContract.address,
            success: true
        });

        // Final State Check
        expect(await trackContract.getReputation()).toBe(1n);
        expect(await trackContract.getPendingTips()).toBe(0n);

        // Artist contract should have received some tip volume
        const artistDetails = await artistContract.getGetDetails();
        expect(artistDetails.totalTipVolume).toBeGreaterThan(0n);
    });

    it('should reject tips below floor', async () => {
        // Floor is 0.1 TON + 0.25 TON overhead = 0.35 TON
        const result = await trackContract.send(
            fan.getSender(),
            { value: toNano('0.2') },
            "tip"
        );

        expect(result.transactions).toHaveTransaction({
            from: fan.address,
            to: trackContract.address,
            success: false,
            exitCode: 43013, // ToonTrack: tip below minimum floor (including gas)
        });
    });
});
