import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Address, toNano } from '@ton/core';
import { ToonRegistry } from '../build/ToonRegistry/ToonRegistry_ToonRegistry';
import { ToonVault } from '../build/ToonVault/ToonVault_ToonVault';
import { ToonDrop } from '../build/ToonDrop/ToonDrop_ToonDrop';
import '@ton/test-utils';

jest.setTimeout(30000);

describe('ToonDrop', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let artist: SandboxContract<TreasuryContract>;
    let fan: SandboxContract<TreasuryContract>;
    let registry: SandboxContract<ToonRegistry>;
    let vault: SandboxContract<ToonVault>;
    let drop: SandboxContract<ToonDrop>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        deployer = await blockchain.treasury('deployer');
        artist = await blockchain.treasury('artist');
        fan = await blockchain.treasury('fan');

        const vaultAddr = await blockchain.treasury('vaultPlaceholder');
        registry = blockchain.openContract(await ToonRegistry.fromInit(deployer.address, vaultAddr.address));
        await registry.send(deployer.getSender(), { value: toNano('0.05') }, { $$type: 'Deploy', queryId: 0n });

        vault = blockchain.openContract(await ToonVault.fromInit(
            deployer.address,
            registry.address,
            deployer.address,
            0n,
            toNano('1000000'),
            0n,
            0n,
            false,
            0n
        ));
        await vault.send(deployer.getSender(), { value: toNano('0.05') }, { $$type: 'Deploy', queryId: 0n });

        const trackId = 1n;
        const royaltyPct = 1000n; // 10%
        const raiseTarget = toNano('1000');
        const slicePrice = toNano('1');
        const duration = 3600n;

        drop = blockchain.openContract(await ToonDrop.fromInit(
            artist.address,
            trackId,
            registry.address,
            vault.address,
            royaltyPct,
            raiseTarget,
            slicePrice,
            duration
        ));

        await drop.send(deployer.getSender(), { value: toNano('0.05') }, { $$type: 'Deploy', queryId: 0n });
    });

    it('should handle slice purchases and reach target', async () => {
        const purchaseAmount = toNano('1000');
        
        const result = await drop.send(
            fan.getSender(),
            { value: purchaseAmount + toNano('0.1') },
            { $$type: 'PurchaseSlice', amount: purchaseAmount }
        );

        expect(result.transactions).toHaveTransaction({
            from: fan.address,
            to: drop.address,
            success: true,
        });

        // Target hit, should finalize and forward to artist
        expect(result.transactions).toHaveTransaction({
            from: drop.address,
            to: artist.address,
            success: true,
        });

        const stats = await drop.getStats();
        expect(stats).toContain("raised: 1000000000000/1000000000000");
    });
});
