import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Address, toNano, Dictionary } from '@ton/core';
import { ToonTip } from '../build/ToonTip/ToonTip_ToonTip';
import '@ton/test-utils';

describe('ToonTip', () => {
    let blockchain: Blockchain;
    let owner: SandboxContract<TreasuryContract>;
    let track1: SandboxContract<TreasuryContract>;
    let track2: SandboxContract<TreasuryContract>;
    let fan: SandboxContract<TreasuryContract>;
    let tip: SandboxContract<ToonTip>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        owner = await blockchain.treasury('owner');
        track1 = await blockchain.treasury('track1');
        track2 = await blockchain.treasury('track2');
        fan = await blockchain.treasury('fan');

        tip = blockchain.openContract(
            await ToonTip.fromInit(owner.address) // registry address
        );

        await tip.send(
            owner.getSender(),
            { value: toNano('1') }, // Fund with 1 TON
            { $$type: 'Deploy', queryId: 0n }
        );
    });

    it('should split tips between multiple targets', async () => {
        const targets = Dictionary.empty(Dictionary.Keys.BigInt(257), Dictionary.Values.Address());
        targets.set(0n, track1.address);
        targets.set(1n, track2.address);

        const ratios = Dictionary.empty(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257));
        ratios.set(0n, 6000n); // 60%
        ratios.set(1n, 4000n); // 40%

        const result = await tip.send(
            fan.getSender(),
            { value: toNano('10') },
            {
                $$type: 'SplitTip',
                targets: targets,
                ratios: ratios,
                count: 2n
            }
        );

        expect(result.transactions).toHaveTransaction({
            from: tip.address,
            to: track1.address,
            success: true,
        });

        // The last one uses SendRemainingValue, so it might be slightly more than 4 TON
        expect(result.transactions).toHaveTransaction({
            from: tip.address,
            to: track2.address,
            success: true,
        });
    });

    it('should allow creating and contributing to pools', async () => {
        await tip.send(
            owner.getSender(),
            { value: toNano('0.05') },
            {
                $$type: 'CreatePool',
                trackAddress: track1.address,
                threshold: toNano('50'),
                deadline: BigInt(Math.floor(Date.now() / 1000) + 3600)
            }
        );

        const poolBefore = await tip.getGetPool(0n);
        expect(poolBefore?.targetAmount).toBe(toNano('50'));

        await tip.send(
            fan.getSender(),
            { value: toNano('20.05') }, // 20 TON + 0.05 for gas/storage
            { $$type: 'ContributeToPool', poolId: 0n }
        );

        const poolAfter = await tip.getGetPool(0n);
        expect(poolAfter?.currentAmount).toBe(toNano('20'));
    });

    it('should finalize pool and tip track when threshold reached', async () => {
        await tip.send(
            owner.getSender(),
            { value: toNano('0.05') },
            {
                $$type: 'CreatePool',
                trackAddress: track1.address,
                threshold: toNano('50'),
                deadline: BigInt(Math.floor(Date.now() / 1000) + 3600)
            }
        );

        const result = await tip.send(
            fan.getSender(),
            { value: toNano('50.05') },
            { $$type: 'ContributeToPool', poolId: 0n }
        );

        expect(result.transactions).toHaveTransaction({
            from: tip.address,
            to: track1.address,
            success: true,
        });

        const poolFinal = await tip.getGetPool(0n);
        expect(poolFinal?.completed).toBe(true);
    });
});
