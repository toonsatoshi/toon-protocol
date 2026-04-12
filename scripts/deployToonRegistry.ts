import { toNano } from '@ton/core';
import { ToonRegistry } from '../build/ToonRegistry/ToonRegistry_ToonRegistry';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const mintAuthority = provider.sender().address!;
    
    const registry = provider.open(await ToonRegistry.fromInit(mintAuthority));

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
