import { toNano } from '@ton/core';
import { ToonRegistry } from '../build/ToonRegistry/ToonRegistry_ToonRegistry';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const deployerAddress = provider.sender().address!;
    
    // During standalone registry deploy, we use the deployer as a temporary vault
    // to bootstrap the circular dependency (similar to deployToonProtocol.ts).
    const registry = provider.open(await ToonRegistry.fromInit(deployerAddress, deployerAddress));

    await registry.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        }
    );

    await provider.waitForDeploy(registry.address);

    console.log('ToonRegistry deployed at:', registry.address.toString());
    console.log('Mint Authority set to:', (await registry.getGetMintAuthority()).toString());
}
