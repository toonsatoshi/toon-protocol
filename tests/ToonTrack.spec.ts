(BigInt.prototype as any).toJSON = function () {
    return this.toString();
};

import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Address, toNano } from '@ton/core';
import { ToonRegistry } from '../build/ToonRegistry/ToonRegistry_ToonRegistry';
import { ToonTrack } from '../build/ToonTrack/ToonTrack_ToonTrack';
import { ToonArtist } from '../build/ToonArtist/ToonArtist_ToonArtist';
import '@ton/test-utils';

jest.setTimeout(30000);

describe('ToonTrack', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let artist: SandboxContract<TreasuryContract>;
    let fan: SandboxContract<TreasuryContract>;
    let registry: SandboxContract<ToonRegistry>;
    let artistContract: SandboxContract<ToonArtist>;
    let trackContract: SandboxContract<ToonTrack>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        deployer = await blockchain.treasury('deployer');
        artist = await blockchain.treasury('artist');
        fan = await blockchain.treasury('fan');

        const vault = await blockchain.treasury('vault');
        // 1. Deploy Registry
        registry = blockchain.openContract(await ToonRegistry.fromInit(deployer.address, vault.address));
        await registry.send(deployer.getSender(), { value: toNano('0.05') }, { $$type: 'Deploy', queryId: 0n });

        // 2. Deploy Artist Contract
        artistContract = blockchain.openContract(await ToonArtist.fromInit(artist.address, registry.address, 123n, "uri"));
        await artistContract.send(artist.getSender(), { value: toNano('0.05') }, { $$type: 'Deploy', queryId: 0n });
        
        // Register artist
        await artistContract.send(artist.getSender(), { value: toNano('0.1') }, "RegisterSelf");
        await artistContract.send(artist.getSender(), { value: toNano('0.1') }, "ConfirmRegistration");

        // Stake to be active
        await artistContract.send(artist.getSender(), { value: toNano('0.1') }, { $$type: 'StakeToon', amount: toNano('100') });

        // 3. Deploy Track
        const fingerprint = 999n;
        const trackId = 1n;
        trackContract = blockchain.openContract(await ToonTrack.fromInit(
            artistContract.address,
            registry.address,
            trackId,
            "ipfs://track-metadata",
            fingerprint,
            100000000n // 0.1 TON
        ));

        await trackContract.send(artist.getSender(), { value: 50000000n }, { $$type: 'Deploy', queryId: 0n });

        // Register track in registry (usually done via ToonArtist.AddTrack, but we do it directly for isolation or via artist)
        await artistContract.send(artist.getSender(), { value: 100000000n }, {
            $$type: 'AddTrack',
            trackId: trackId,
            fingerprint: fingerprint,
            trackContract: trackContract.address
        });
    });

    it('should initialize correctly', async () => {
        expect(await trackContract.getReputation()).toBe(0n);
        expect(await trackContract.getMintFee()).toBe(100000000n);
    });

    it('should handle tips and increment reputation', async () => {
        const tipAmount = 200000000n; // 0.2 TON
        
        const result = await trackContract.send(
            fan.getSender(),
            { value: tipAmount },
            "tip"
        );

        // Check if transaction to trackContract was successful
        expect(result.transactions).toHaveTransaction({
            from: fan.address,
            to: trackContract.address,
            success: true,
        });

        // Should increment reputation
        expect(await trackContract.getReputation()).toBe(1n);

        // Should forward value to artist contract
        expect(result.transactions).toHaveTransaction({
            from: trackContract.address,
            to: artistContract.address,
            success: true,
        });

        // Artist contract should have received some tip volume
        const artistDetails = await artistContract.getGetDetails();
        expect(artistDetails.totalTipVolume).toBeGreaterThan(0n);

        // Should request mint from registry
        expect(result.transactions).toHaveTransaction({
            from: trackContract.address,
            to: registry.address,
            success: true,
            // Removed custom function to avoid serialization issues
        });
        
        // Registry should emit MintAuthorized event
        expect(result.transactions).toHaveTransaction({
            from: registry.address,
            // external message/event
            success: true
        });
    });

    it('should reject tips below floor', async () => {
        const result = await trackContract.send(
            fan.getSender(),
            { value: 50000000n },
            null
        );

        expect(result.transactions).toHaveTransaction({
            from: fan.address,
            to: trackContract.address,
            success: false,
            exitCode: 43013, // ToonTrack: tip below minimum floor (including gas)
        });
    });
});
