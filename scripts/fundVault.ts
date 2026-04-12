import { Address, toNano } from '@ton/core';
import { ToonVault } from '../build/ToonVault/ToonVault_ToonVault';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const deployer = provider.sender();
    const vaultAddress = Address.parse(process.env.TOON_VAULT_ADDRESS!);
    const vault = provider.open(ToonVault.fromAddress(vaultAddress));

    console.log('━━━ FUNDING TOON VAULT ━━━');
    console.log('Vault:', vaultAddress.toString());

    const fundAmount = toNano('10'); // 10 TON for testing rewards
    console.log('Sending', fundAmount.toString(), 'TON to vault...');

    // We can just send TON directly if we want it to have balance for 'send(reward)'
    // OR we can send UpdateReserve message to increase the internal 'totalReserve' counter.
    
    // 1. Send TON for the actual 'send' transactions
    await deployer.send({
        to: vaultAddress,
        value: fundAmount,
        bounce: true
    });

    // 2. Update the internal reserve counter (so effectiveCap works)
    await vault.send(
        deployer,
        { value: toNano('0.05') },
        { $$type: 'UpdateReserve', amount: toNano('1000000') } // Set a high internal reserve
    );

    console.log('✅ Vault funded and reserve updated.');
}
