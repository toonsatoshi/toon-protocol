import { Address, toNano } from '@ton/core';
import { ToonVault } from '../build/ToonVault/ToonVault_ToonVault';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const deployer = provider.sender();
    console.log('Updating ToonVault at:', process.env.TOON_VAULT_ADDRESS);

    const vault = provider.open(
        ToonVault.fromAddress(Address.parse(process.env.TOON_VAULT_ADDRESS!))
    );

    // We can't "upgrade" code in Tact easily without a versioning system, 
    // so we must deploy a NEW instance and update the .env.
    
    console.log('Deploying NEW ToonVault with updated permissions...');
    
    // We need the registry address from env
    const registryAddress = Address.parse(process.env.TOON_REGISTRY_ADDRESS!);

    const newVault = provider.open(
        await ToonVault.fromInit(
            deployer.address!, 
            registryAddress,
            toNano('1000000'), // 1M reserve
            0n,
            0n,
            false
        )
    );

    await newVault.send(
        deployer,
        { value: toNano('0.5') }, // Deploy + initial gas + some funding
        { $$type: 'Deploy', queryId: 0n }
    );

    await provider.waitForDeploy(newVault.address);

    console.log('✅ New ToonVault deployed at:', newVault.address.toString());
    console.log('⚠️  IMPORTANT: Update TOON_VAULT_ADDRESS in your .env to the new address above!');
    console.log('⚠️  Then run the linkProtocol script (if you have one) or manually update the Registry.');
}
