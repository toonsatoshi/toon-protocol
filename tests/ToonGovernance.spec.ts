import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Address, toNano } from '@ton/core';
import { ToonRegistry } from '../build/ToonRegistry/ToonRegistry_ToonRegistry';
import { ToonVault } from '../build/ToonVault/ToonVault_ToonVault';
import { ToonGovernance } from '../build/ToonGovernance/ToonGovernance_ToonGovernance';
import '@ton/test-utils';

jest.setTimeout(60000);

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

        const vaultAddr = await blockchain.treasury('vaultPlaceholder');
        const jettonMaster = await blockchain.treasury('jettonMaster');

        registry = blockchain.openContract(await ToonRegistry.fromInit(deployer.address, vaultAddr.address));
        await registry.send(deployer.getSender(), { value: toNano('1') }, { $$type: 'Deploy', queryId: 0n });

        vault = blockchain.openContract(await ToonVault.fromInit(
            deployer.address,
            registry.address,
            deployer.address,
            0n, // oracle key
            toNano('1000000'),
            0n,
            0n,
            false,
            0n
        ));
        await vault.send(deployer.getSender(), { value: toNano('1') }, { $$type: 'Deploy', queryId: 0n });

        governance = blockchain.openContract(await ToonGovernance.fromInit(registry.address, vault.address, jettonMaster.address));
        await governance.send(deployer.getSender(), { value: toNano('1') }, { $$type: 'Deploy', queryId: 0n });
    });

    it('should allow staking and voting', async () => {
        const stakeAmount = toNano('1000');
        
        // Stake $TOON via MockStake
        await governance.send(
            voter.getSender(),
            { value: toNano('0.1') },
            { $$type: 'MockStake' }
        );

        expect(await governance.getStake(voter.address)).toBe(stakeAmount);
        expect(await governance.getTotalStaked()).toBe(stakeAmount);

        // Propose a change
        await governance.send(
            voter.getSender(),
            { value: toNano('0.1') },
            {
                $$type: 'ProposeParameterUpdate',
                parameter: "emissionCap",
                newValue: 100000n,
                description: "Update the emission cap"
            }
        );

        const proposalId = 0n;

        // Vote
        const result = await governance.send(
            voter.getSender(),
            { value: toNano('0.1') },
            {
                $$type: 'VoteOnProposal',
                proposalId: proposalId,
                support: true
            }
        );

        expect(result.transactions).toHaveTransaction({
            from: voter.address,
            to: governance.address,
            success: true,
        });
    });
});
