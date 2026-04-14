import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Address, toNano } from '@ton/core';
import { ToonRegistry } from '../build/ToonRegistry/ToonRegistry_ToonRegistry';
import { ToonVault } from '../build/ToonVault/ToonVault_ToonVault';
import { ToonGovernance } from '../build/ToonGovernance/ToonGovernance_ToonGovernance';
import '@ton/test-utils';

jest.setTimeout(30000);

describe('ToonGovernance', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let voter: SandboxContract<TreasuryContract>;
    let registry: SandboxContract<ToonRegistry>;
    let vault: SandboxContract<ToonVault>;
    let governance: SandboxContract<ToonGovernance>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        deployer = await blockchain.treasury('deployer');
        voter = await blockchain.treasury('voter');

        const placeholder = Address.parse("EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c");
        registry = blockchain.openContract(await ToonRegistry.fromInit(deployer.address, placeholder));
        await registry.send(deployer.getSender(), { value: toNano('1') }, { $$type: 'Deploy', queryId: 0n });

        vault = blockchain.openContract(await ToonVault.fromInit(
            deployer.address,
            registry.address,
            deployer.address, // governance placeholder
            0n, // oracle key
            toNano('1000000'),
            0n,
            0n,
            false,
            0n
        ));
        await vault.send(deployer.getSender(), { value: toNano('1') }, { $$type: 'Deploy', queryId: 0n });
        
        await registry.send(deployer.getSender(), { value: toNano('0.1') }, { $$type: 'UpdateVaultAddress', newVault: vault.address });

        const jettonMaster = await blockchain.treasury('jettonMaster');
        governance = blockchain.openContract(await ToonGovernance.fromInit(registry.address, vault.address, jettonMaster.address));
        await governance.send(deployer.getSender(), { value: toNano('1') }, { $$type: 'Deploy', queryId: 0n });

        // Link governance in vault
        await vault.send(deployer.getSender(), { value: toNano('0.1') }, { $$type: 'SetGovernance', newGovernance: governance.address });
    });

    it('should initialize correctly', async () => {
        expect(await governance.getTotalStaked()).toBe(0n);
    });
});
