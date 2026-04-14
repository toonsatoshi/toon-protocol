import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Address, toNano } from '@ton/core';
import { ToonRegistry } from '../build/ToonRegistry/ToonRegistry_ToonRegistry';
import { ToonArtist } from '../build/ToonArtist/ToonArtist_ToonArtist';
import { ToonVault } from '../build/ToonVault/ToonVault_ToonVault';
import '@ton/test-utils';

jest.setTimeout(30000);

describe('ToonArtist', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let artist: SandboxContract<TreasuryContract>;
    let registry: SandboxContract<ToonRegistry>;
    let artistContract: SandboxContract<ToonArtist>;
    let vault: SandboxContract<ToonVault>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        deployer = await blockchain.treasury('deployer');
        artist = await blockchain.treasury('artist');

        const governance = await blockchain.treasury('governance');
        const placeholder = Address.parse("EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c");

        // 1. Deploy Registry
        registry = blockchain.openContract(await ToonRegistry.fromInit(deployer.address, placeholder));
        await registry.send(deployer.getSender(), { value: toNano('1') }, { $$type: 'Deploy', queryId: 0n });

        // 2. Deploy Vault
        vault = blockchain.openContract(await ToonVault.fromInit(
            deployer.address,
            registry.address,
            governance.address,
            0n, // oracle
            toNano('1000'),
            0n,
            0n,
            false,
            0n
        ));
        await vault.send(deployer.getSender(), { value: toNano('1') }, { $$type: 'Deploy', queryId: 0n });

        // 3. Link vault in registry
        await registry.send(deployer.getSender(), { value: toNano('0.1') }, { $$type: 'UpdateVaultAddress', newVault: vault.address });

        const telegramHash = 123456789n;
        const metadataUri = "ipfs://artist-metadata";
        const jettonMaster = await blockchain.treasury('jettonMaster');

        artistContract = blockchain.openContract(await ToonArtist.fromInit(
            artist.address,
            registry.address,
            jettonMaster.address,
            telegramHash,
            metadataUri
        ));

        await artistContract.send(artist.getSender(), { value: toNano('1') }, { $$type: 'Deploy', queryId: 0n });
    });

    it('should initialize correctly', async () => {
        expect(await artistContract.getOwner()).toEqualAddress(artist.address);
        expect(await artistContract.getIsActive()).toBe(false);
        expect(await artistContract.getReputation()).toBe(0n);
    });

    it('should register artist in registry using 2PC', async () => {
        const regResult = await artistContract.send(artist.getSender(), { value: toNano('0.5') }, "RegisterSelf");
        expect(regResult.transactions).toHaveTransaction({
            from: artistContract.address,
            to: registry.address,
            success: true
        });

        const confResult = await artistContract.send(artist.getSender(), { value: toNano('0.5') }, "ConfirmRegistration");
        expect(confResult.transactions).toHaveTransaction({
            from: artistContract.address,
            to: registry.address,
            success: true
        });

        expect(await registry.getIsRegisteredArtist(artist.address)).toBe(true);
        expect(await registry.getGetArtistContract(artist.address)).toEqualAddress(artistContract.address);
    });
});
