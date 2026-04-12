import { Address, toNano } from '@ton/core';
import { ToonRegistry } from '../build/ToonRegistry/ToonRegistry_ToonRegistry';
import { ToonVault } from '../build/ToonVault/ToonVault_ToonVault';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const deployer = provider.sender();

    // ── CONFIGURATION (FROM .ENV) ───────────────────────────────────────────
    if (!process.env.TOON_REGISTRY_ADDRESS || !process.env.TOON_VAULT_ADDRESS) {
        throw new Error('TOON_REGISTRY_ADDRESS or TOON_VAULT_ADDRESS not set in .env');
    }
    const REGISTRY_ADDRESS = Address.parse(process.env.TOON_REGISTRY_ADDRESS);
    const VAULT_ADDRESS    = Address.parse(process.env.TOON_VAULT_ADDRESS);
    // ─────────────────────────────────────────────────────────────────────────

    console.log('━━━ LINKING TOON PROTOCOL ━━━');
    
    const registry = provider.open(ToonRegistry.fromAddress(REGISTRY_ADDRESS));
    const vault    = provider.open(ToonVault.fromAddress(VAULT_ADDRESS));

    console.log('1/2 Updating Registry to point to the correct Vault...');
    await registry.send(
        deployer,
        { value: toNano('0.05') },
        { $$type: 'UpdateVaultAddress', newVault: VAULT_ADDRESS }
    );
    console.log('✅ Registry updated.');

    console.log('2/2 Updating Vault to point to the Registry...');
    await vault.send(
        deployer,
        { value: toNano('0.05') },
        { $$type: 'UpdateRegistry', newRegistry: REGISTRY_ADDRESS }
    );
    console.log('✅ Vault updated.');

    console.log('');
    console.log('━━━ LINKING COMPLETE ━━━');
    console.log('The protocol is now synchronized.');
}
