import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Address, toNano, beginCell } from '@ton/core';
import { ToonGovernance } from '../build/ToonGovernance/ToonGovernance_ToonGovernance';
import '@ton/test-utils';

describe('ToonGovernance', () => {
    let blockchain: Blockchain;
    let registry: SandboxContract<TreasuryContract>;
    let vault: SandboxContract<TreasuryContract>;
    let proposer: SandboxContract<TreasuryContract>;
    let voter: SandboxContract<TreasuryContract>;
    let governance: SandboxContract<ToonGovernance>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        registry = await blockchain.treasury('registry');
        vault = await blockchain.treasury('vault');
        proposer = await blockchain.treasury('proposer');
        voter = await blockchain.treasury('voter');

        governance = blockchain.openContract(
            await ToonGovernance.fromInit(proposer.address, registry.address, vault.address, registry.address)
        );

        const deployResult = await governance.send(
            proposer.getSender(),
            { value: toNano('0.05') },
            { $$type: 'Deploy', queryId: 0n }
        );
        expect(deployResult.transactions).toHaveTransaction({
            from: proposer.address,
            to: governance.address,
            deploy: true,
            success: true,
        });
    })

    async function registerAndStake(user: SandboxContract<TreasuryContract>, amount: bigint, nonce: bigint) {
        await governance.send(proposer.getSender(), { value: toNano('0.05') }, { $$type: 'RegisterJettonWallet', owner: user.address, wallet: user.address });
        const fp = beginCell().storeUint(nonce, 64).storeAddress(registry.address).endCell();
        await governance.send(user.getSender(), { value: toNano('0.1') }, { $$type: 'TransferNotification', from: user.address, amount, forwardPayload: fp });
    }
;

    it('should allow staking', async () => {
        const amount = toNano('100');
        await registerAndStake(proposer, amount, 1n);

        const stake = await governance.getGetStake(proposer.address);
        expect(stake).toBe(amount);
        expect(await governance.getTotalStaked()).toBe(amount);
    });

    it('should allow staking with empty forward payload', async () => {
        const amount = toNano('50');
        await governance.send(proposer.getSender(), { value: toNano('0.05') }, { $$type: 'RegisterJettonWallet', owner: proposer.address, wallet: proposer.address });

        const result = await governance.send(
            proposer.getSender(),
            { value: toNano('0.1') },
            { $$type: 'TransferNotification', from: proposer.address, amount, forwardPayload: beginCell().endCell() }
        );

        expect(result.transactions).toHaveTransaction({
            from: proposer.address,
            to: governance.address,
            success: true,
        });

        expect(await governance.getGetStake(proposer.address)).toBe(amount);
        expect(await governance.getTotalStaked()).toBe(amount);
    });

    it('should allow proposing parameter updates after staking', async () => {
        const amount = toNano('100');
        await registerAndStake(proposer, amount, 1n);

        const result = await governance.send(
            proposer.getSender(),
            { value: toNano('0.1') },
            {
                $$type: 'ProposeParameterUpdate',
                parameter: 'emissionCap',
                newValue: 100000n,
                description: 'Increase emission cap'
            }
        );

        expect(result.transactions).toHaveTransaction({
            from: proposer.address,
            to: governance.address,
            success: true,
        });

        const proposal = await governance.getGetProposal(0n);
        expect(proposal?.parameter).toBe('emissionCap');
        expect(proposal?.newValue).toBe(100000n);
    });

    it('should allow voting on proposals', async () => {
        // Stake for proposer and voter
        await registerAndStake(proposer, toNano('100'), 11n);
        await registerAndStake(voter, toNano('200'), 12n);

        // Propose
        await governance.send(proposer.getSender(), { value: toNano('0.1') }, {
            $$type: 'ProposeParameterUpdate',
            parameter: 'emissionCap',
            newValue: 100000n,
            description: 'Increase emission cap'
        });

        // Vote
        const result = await governance.send(
            voter.getSender(),
            { value: toNano('0.1') },
            { $$type: 'VoteOnProposal', proposalId: 0n, support: true }
        );

        expect(result.transactions).toHaveTransaction({
            from: voter.address,
            to: governance.address,
            success: true,
        });

        const proposal = await governance.getGetProposal(0n);
        expect(proposal?.votesFor).toBe(toNano('200'));
    });

    it('should execute proposal after voting window and meeting quorum', async () => {
        // Total stake = 400. Quorum = 400/4 = 100.
        await registerAndStake(proposer, toNano('200'), 21n);
        await registerAndStake(voter, toNano('200'), 12n);

        await governance.send(proposer.getSender(), { value: toNano('0.1') }, {
            $$type: 'ProposeParameterUpdate',
            parameter: 'emissionCap',
            newValue: 100000n,
            description: 'Increase emission cap'
        });

        // Vote For (200 > 100 quorum)
        await governance.send(proposer.getSender(), { value: toNano('0.1') }, { $$type: 'VoteOnProposal', proposalId: 0n, support: true });

        // Fast forward 2 weeks + 1 second
        blockchain.now = (blockchain.now ?? Math.floor(Date.now() / 1000)) + 1209600 + 1;

        const result = await governance.send(
            proposer.getSender(),
            { value: toNano('0.1') },
            { $$type: 'ExecuteProposal', proposalId: 0n }
        );

        expect(result.transactions).toHaveTransaction({
            from: governance.address,
            to: vault.address,
            success: true,
        });

        const proposal = await governance.getGetProposal(0n);
        expect(proposal?.executed).toBe(true);
    });

    it('should reject votes from non-stakers', async () => {
        await registerAndStake(proposer, toNano('100'), 11n);
        await governance.send(proposer.getSender(), { value: toNano('0.1') }, {
            $$type: 'ProposeParameterUpdate',
            parameter: 'emissionCap',
            newValue: 100000n,
            description: 'Increase'
        });

        const nonStaker = await blockchain.treasury('nonStaker');
        const result = await governance.send(
            nonStaker.getSender(),
            { value: toNano('0.1') },
            { $$type: 'VoteOnProposal', proposalId: 0n, support: true }
        );

        expect(result.transactions).toHaveTransaction({
            from: nonStaker.address,
            to: governance.address,
            success: false,
        });
    });

    it('should prevent double voting', async () => {
        await registerAndStake(proposer, toNano('100'), 11n);
        await governance.send(proposer.getSender(), { value: toNano('0.1') }, {
            $$type: 'ProposeParameterUpdate',
            parameter: 'emissionCap',
            newValue: 100000n,
            description: 'Increase'
        });

        await governance.send(proposer.getSender(), { value: toNano('0.1') }, { $$type: 'VoteOnProposal', proposalId: 0n, support: true });
        
        const result = await governance.send(
            proposer.getSender(),
            { value: toNano('0.1') },
            { $$type: 'VoteOnProposal', proposalId: 0n, support: true }
        );

        expect(result.transactions).toHaveTransaction({
            from: proposer.address,
            to: governance.address,
            success: false,
        });
    });
});
