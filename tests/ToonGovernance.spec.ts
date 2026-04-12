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

        const vaultAddr = await blockchain.treasury('vaultPlaceholder');
        registry = blockchain.openContract(await ToonRegistry.fromInit(deployer.address, vaultAddr.address));
        await registry.send(deployer.getSender(), { value: toNano('0.05') }, { $$type: 'Deploy', queryId: 0n });

        vault = blockchain.openContract(await ToonVault.fromInit(registry.address));
        await vault.send(deployer.getSender(), { value: toNano('0.05') }, { $$type: 'Deploy', queryId: 0n });

        governance = blockchain.openContract(await ToonGovernance.fromInit(registry.address, vault.address));
        await governance.send(deployer.getSender(), { value: toNano('0.05') }, { $$type: 'Deploy', queryId: 0n });
    });

    it('should allow staking and voting', async () => {
        const stakeAmount = toNano('1000');
        
        // Stake $TOON
        await governance.send(
            voter.getSender(),
            { value: toNano('0.1') },
            { $$type: 'StakeToon', amount: stakeAmount }
        );

        expect(await governance.getGetStake(voter.address)).toBe(stakeAmount);
        expect(await governance.getTotalStaked()).toBe(stakeAmount);

        // Propose a change
        await governance.send(
            voter.getSender(),
            { value: toNano('0.1') },
            {
                $$type: 'ProposeParameterUpdate',
                parameter: "mintAuthority",
                newValue: 1n,
                description: "Update the mint authority to a new address"
            }
        );

        const proposalId = 0n;

        // Vote
        const result = await governance.send(
            voter.getSender(),
            { value: toNano('0.1') },
            {
                $$type: 'VoteOnGlobalProposal',
                proposalId: proposalId,
                support: true
            }
        );

        expect(result.transactions).toHaveTransaction({
            from: voter.address,
            to: governance.address,
            success: true,
        });

        // Verify votes (internal state check or via getter if implemented)
        // In this MVP, we can't easily read individual fields of a struct in a map 
        // without a getter for the specific proposal.
    });
});
