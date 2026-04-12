import { toNano } from '@ton/core';
import { ToonArtist } from '../build/ToonArtist/ToonArtist_ToonArtist';
import { NetworkProvider } from '@ton/blueprint';
import * as crypto from 'crypto';

export async function run(provider: NetworkProvider, args: string[]) {
    const artistName = args[0] || 'Anonymous';
    const telegramHandle = args[1] || 'unknown';
    const registryAddress = process.env.TOON_REGISTRY_ADDRESS!;

    const telegramHash = BigInt(
        '0x' + crypto.createHash('sha256').update(telegramHandle).digest('hex')
    );

    const artist = provider.open(await ToonArtist.fromInit(
        provider.sender().address!,
        provider.open({ address: registryAddress } as any).address,
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
