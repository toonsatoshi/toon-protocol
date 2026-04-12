import { Address, toNano } from '@ton/core';
import { ToonArtist } from '../build/ToonArtist/ToonArtist_ToonArtist';
import { NetworkProvider } from '@ton/blueprint';
import * as crypto from 'crypto';

export async function run(provider: NetworkProvider, args: string[]) {
    const artistName = args[0] || 'Anonymous';
    const telegramHandle = args[1] || 'unknown';
    const registryAddressStr = process.env.TOON_REGISTRY_ADDRESS;
    if (!registryAddressStr) {
        throw new Error('TOON_REGISTRY_ADDRESS not set in .env');
    }
    const registryAddress = Address.parse(registryAddressStr.replace(/"/g, '').trim());

    const telegramHash = BigInt(
        '0x' + crypto.createHash('sha256').update(telegramHandle).digest('hex')
    );

    const artist = provider.open(await ToonArtist.fromInit(
        provider.sender().address!,
        registryAddress,
        telegramHash,
        `arweave://pending/${telegramHandle}`
    ));

    await artist.send(
        provider.sender(),
        { value: toNano('0.25') },
        { $$type: 'Deploy', queryId: 0n }
    );

    await provider.waitForDeploy(artist.address);
    console.log('ToonArtist deployed at:', artist.address.toString());
}
