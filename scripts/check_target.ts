import { Address, toNano } from '@ton/core';
import { ToonRegistry } from '../build/ToonRegistry/ToonRegistry_ToonRegistry';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const deployer = provider.sender();
    const deployerAddress = deployer.address!;
    console.log('Deployer Address:', deployerAddress.toString());
    
    const balance = await provider.api().getBalance(deployerAddress);
    console.log('Deployer Balance:', balance.toString(), ' (nanoTON)');

    const registry = provider.open(
        await ToonRegistry.fromInit(deployerAddress, deployerAddress)
    );
    console.log('Target Registry Address:', registry.address.toString());
    
    try {
        const state = await provider.api().getContractState(registry.address);
        console.log('Registry State:', state.state);
    } catch (e) {
        console.log('Failed to get registry state (likely uninitialized)');
    }
}
