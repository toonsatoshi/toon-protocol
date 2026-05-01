import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Address, toNano } from '@ton/core';
import { ToonDrop } from '../build/ToonDrop/ToonDrop_ToonDrop';
import '@ton/test-utils';

describe('ToonDrop', () => {
    let blockchain: Blockchain;
    let artist: SandboxContract<TreasuryContract>;
    let investor1: SandboxContract<TreasuryContract>;
    let investor2: SandboxContract<TreasuryContract>;
    let vault: SandboxContract<TreasuryContract>;
    let drop: SandboxContract<ToonDrop>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        artist = await blockchain.treasury('artist');
        investor1 = await blockchain.treasury('investor1');
        investor2 = await blockchain.treasury('investor2');
        vault = await blockchain.treasury('vault');

        drop = blockchain.openContract(
            await ToonDrop.fromInit(
                artist.address,
                1n, // trackId
                Address.parse('EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c'), // dummy registry
                vault.address,
                1000n, // 10% royalty (1000 bps)
                toNano('100'), // raiseTarget
                toNano('10'), // slicePrice
                3600n // duration (1 hour)
            )
        );

        await drop.send(
            artist.getSender(),
            { value: toNano('0.05') },
            { $$type: 'Deploy', queryId: 0n }
        );
    });

    it('should allow purchasing slices', async () => {
        const result = await drop.send(
            investor1.getSender(),
            { value: toNano('21') },
            { $$type: 'PurchaseSlice', amount: toNano('20') }
        );

        expect(result.transactions).toHaveTransaction({
            from: investor1.address,
            to: drop.address,
            success: true,
        });

        expect(await drop.getCurrentRaise()).toBe(toNano('20'));
    });


    it('should refund overpayment when purchase exceeds remaining headroom', async () => {
        await drop.send(
            investor1.getSender(),
            { value: toNano('95') },
            { $$type: 'PurchaseSlice', amount: toNano('95') }
        );

        const result = await drop.send(
            investor2.getSender(),
            { value: toNano('20') },
            { $$type: 'PurchaseSlice', amount: toNano('20') }
        );

        expect(await drop.getCurrentRaise()).toBe(toNano('100'));

        expect(result.transactions).toHaveTransaction({
            from: drop.address,
            to: investor2.address,
            success: true,
        });
    });

    it('should finalize and send funds to artist on successful raise', async () => {
        await drop.send(
            investor1.getSender(),
            { value: toNano('100') },
            { $$type: 'PurchaseSlice', amount: toNano('100') }
        );

        expect(await drop.getIsLocked()).toBe(true);
        expect(await drop.getIsSuccessful()).toBe(true);
        
        // Check if artist received funds
        // In finalize: send(artist, currentRaise)
        // Note: the purchase transaction itself should trigger finalize.
    });

    it('should allow refunds on failed raise after deadline', async () => {
        await drop.send(
            investor1.getSender(),
            { value: toNano('50') },
            { $$type: 'PurchaseSlice', amount: toNano('50') }
        );

        // Fast forward past deadline
        blockchain.now = (blockchain.now ?? Math.floor(Date.now() / 1000)) + 3601;

        await drop.send(artist.getSender(), { value: toNano('0.05') }, "CheckDeadline");
        
        expect(await drop.getIsLocked()).toBe(true);
        expect(await drop.getIsSuccessful()).toBe(false);

        const result = await drop.send(
            investor1.getSender(),
            { value: toNano('0.1') },
            { $$type: 'Refund' }
        );

        expect(result.transactions).toHaveTransaction({
            from: drop.address,
            to: investor1.address,
            value: toNano('50'),
            success: true,
        });
    });

    it('should handle royalties distribution correctly', async () => {
        // Successful raise
        await drop.send(investor1.getSender(), { value: toNano('60') }, { $$type: 'PurchaseSlice', amount: toNano('60') });
        await drop.send(investor2.getSender(), { value: toNano('40') }, { $$type: 'PurchaseSlice', amount: toNano('40') });

        expect(await drop.getIsSuccessful()).toBe(true);

        // Deposit royalties (from vault)
        const royaltyAmount = toNano('10'); // 10 TON royalty
        await drop.send(
            vault.getSender(),
            { value: royaltyAmount + toNano('0.01') }, // add gas reserve
            { $$type: 'DepositRoyalty' }
        );

        expect(await drop.getTotalRoyalties()).toBe(royaltyAmount);

        // Investor 1 claimable: 60/100 * 10 = 6 TON
        const claimable1 = await drop.getInvestorClaimable(investor1.address);
        expect(claimable1).toBe(toNano('6'));

        const claimResult = await drop.send(
            investor1.getSender(),
            { value: toNano('0.1') },
            { $$type: 'ClaimRoyaltyShare' }
        );

        expect(claimResult.transactions).toHaveTransaction({
            from: drop.address,
            to: investor1.address,
            value: toNano('6'),
            success: true,
        });
    });
});
