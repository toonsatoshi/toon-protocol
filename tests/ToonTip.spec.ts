import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Address, toNano, Dictionary } from '@ton/core';
import { ToonRegistry } from '../build/ToonRegistry/ToonRegistry_ToonRegistry';
import { ToonTip } from '../build/ToonTip/ToonTip_ToonTip';
import '@ton/test-utils';

jest.setTimeout(30000);

describe('ToonTip', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let fan: SandboxContract<TreasuryContract>;
    let registry: SandboxContract<ToonRegistry>;
    let tip: SandboxContract<ToonTip>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        deployer = await blockchain.treasury('deployer');
        fan = await blockchain.treasury('fan');

        const vault = await blockchain.treasury('vault');
        registry = blockchain.openContract(await ToonRegistry.fromInit(deployer.address, vault.address));
        await registry.send(deployer.getSender(), { value: toNano('0.05') }, { $$type: 'Deploy', queryId: 0n });

        tip = blockchain.openContract(await ToonTip.fromInit(registry.address));
        await tip.send(deployer.getSender(), { value: toNano('0.05') }, { $$type: 'Deploy', queryId: 0n });
    });

    it('should handle split tips', async () => {
        const track1 = await blockchain.treasury('track1');
        const track2 = await blockchain.treasury('track2');

        const targets = Dictionary.empty(Dictionary.Keys.BigInt(257), Dictionary.Values.Address());
        targets.set(0n, track1.address);
        targets.set(1n, track2.address);

        const ratios = Dictionary.empty(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257));
        ratios.set(0n, 6000n); // 60%
        ratios.set(1n, 4000n); // 40%

        const totalTip = toNano('1');

        const result = await tip.send(
            fan.getSender(),
            { value: totalTip + toNano('0.1') }, // Add extra for gas
            {
                $$type: 'SplitTip',
                targets: targets,
                ratios: ratios,
                count: 2n
            }
        );

        expect(result.transactions).toHaveTransaction({
            from: fan.address,
            to: tip.address,
            success: true,
        });

        // Split 1: 0.6 TON
        expect(result.transactions).toHaveTransaction({
            from: tip.address,
            to: track1.address,
            value: (v) => !!v && v >= toNano('0.6'),
            success: true,
        });

        // Split 2: 0.4 TON
        expect(result.transactions).toHaveTransaction({
            from: tip.address,
            to: track2.address,
            value: (v) => !!v && v >= toNano('0.4'),
            success: true,
        });
    });

    it('should handle group tipping pools', async () => {
        const track = await blockchain.treasury('track');
        const threshold = toNano('1');
        const deadline = Math.floor(Date.now() / 1000) + 3600;

        // Create Pool
        await tip.send(
            fan.getSender(),
            { value: toNano('0.05') },
            {
                $$type: 'CreatePool',
                trackAddress: track.address,
                threshold: threshold,
                deadline: BigInt(deadline)
            }
        );

        const poolId = 0n;
        const poolBefore = await tip.getGetPool(poolId);
        expect(poolBefore?.targetAmount).toBe(threshold);
        expect(poolBefore?.completed).toBe(false);

        // Contribute 0.4 TON
        await tip.send(
            fan.getSender(),
            { value: toNano('0.45') }, // 0.4 + 0.05 for gas
            { $$type: 'ContributeToPool', poolId: poolId }
        );

        const poolMid = await tip.getGetPool(poolId);
        expect(poolMid?.currentAmount).toBeGreaterThanOrEqual(toNano('0.4'));

        // Contribute 0.7 TON (total 1.1 > threshold 1.0)
        const result = await tip.send(
            fan.getSender(),
            { value: toNano('0.75') }, // 0.7 + 0.05 for gas
            { $$type: 'ContributeToPool', poolId: poolId }
        );

        const poolAfter = await tip.getGetPool(poolId);
        expect(poolAfter?.completed).toBe(true);

        // Should fire collective tip to track
        expect(result.transactions).toHaveTransaction({
            from: tip.address,
            to: track.address,
            success: true,
            value: (v) => !!v && v >= threshold
        });
    });
});
