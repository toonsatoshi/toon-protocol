import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Address, toNano } from '@ton/core';
import { ToonRegistry } from '../build/ToonRegistry/ToonRegistry_ToonRegistry';
import { ToonArtist } from '../build/ToonArtist/ToonArtist_ToonArtist';
import { ToonVault } from '../build/ToonVault/ToonVault_ToonVault';
import '@ton/test-utils';

jest.setTimeout(60000);

describe('ToonRegistry', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let artist: SandboxContract<TreasuryContract>;
    let registry: SandboxContract<ToonRegistry>;
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
    });

    it('should register an artist using 2PC', async () => {
        const jettonMaster = await blockchain.treasury('jettonMaster');
        const artistContract = blockchain.openContract(await ToonArtist.fromInit(
            artist.address,
            registry.address,
            jettonMaster.address,
            12345n,
            "ipfs://meta"
        ));
        await artistContract.send(artist.getSender(), { value: toNano('1') }, { $$type: 'Deploy', queryId: 0n });

        await artistContract.send(artist.getSender(), { value: toNano('1') }, "RegisterSelf");
        await artistContract.send(artist.getSender(), { value: toNano('1') }, "ConfirmRegistration");

        expect(await registry.getIsRegisteredArtist(artist.address)).toBe(true);
    });

    it('should authorize mint only by mint authority', async () => {
        const recipient = await blockchain.treasury('recipient');
        const amount = toNano('100');

        const result = await registry.send(
            deployer.getSender(),
            { value: toNano('0.5') },
            { $$type: 'AuthorizeMint', recipient: recipient.address, amount: amount }
        );

        expect(result.transactions).toHaveTransaction({
            from: deployer.address,
            to: registry.address,
            success: true
        });

        // Fail case: wrong sender
        const failResult = await registry.send(
            artist.getSender(),
            { value: toNano('0.1') },
            { $$type: 'AuthorizeMint', recipient: recipient.address, amount: amount }
        );

        expect(failResult.transactions).toHaveTransaction({
            from: artist.address,
            to: registry.address,
            success: false
        });
    });
});
