import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Address, toNano } from '@ton/core';
import { ToonRegistry } from '../build/ToonRegistry/ToonRegistry_ToonRegistry';
import { ToonFan } from '../build/ToonFan/ToonFan_ToonFan';
import '@ton/test-utils';

jest.setTimeout(30000);

describe('ToonFan', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let artist: SandboxContract<TreasuryContract>;
    let fan: SandboxContract<TreasuryContract>;
    let registry: SandboxContract<ToonRegistry>;
    let fanContract: SandboxContract<ToonFan>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        deployer = await blockchain.treasury('deployer');
        artist = await blockchain.treasury('artist');
        fan = await blockchain.treasury('fan');

        const vaultAddr = await blockchain.treasury('vaultPlaceholder');
        registry = blockchain.openContract(await ToonRegistry.fromInit(deployer.address, vaultAddr.address));
        await registry.send(deployer.getSender(), { value: toNano('0.05') }, { $$type: 'Deploy', queryId: 0n });

        fanContract = blockchain.openContract(await ToonFan.fromInit(artist.address, registry.address));
        await fanContract.send(deployer.getSender(), { value: toNano('0.05') }, { $$type: 'Deploy', queryId: 0n });
    });

    it('should sync participation and calculate fan power', async () => {
        const tipVolume = toNano('50');
        const investmentVolume = toNano('200');

        // Only artist can sync
        const result = await fanContract.send(
            artist.getSender(),
            { value: toNano('0.1') },
            {
                $$type: 'SyncParticipation',
                fan: fan.address,
                tipVolume: tipVolume,
                investmentVolume: investmentVolume
            }
        );

        expect(result.transactions).toHaveTransaction({
            from: artist.address,
            to: fanContract.address,
            success: true,
        });

        const power = await fanContract.getGetFanPower(fan.address);
        expect(power).toBe(tipVolume + investmentVolume);

        expect(await fanContract.getIsTopFan(fan.address)).toBe(true);
    });
});
