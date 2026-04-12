import { toNano } from '@ton/core';
import { MusicNft } from '../build/MusicNft/MusicNft_MusicNft';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const musicNft = provider.open(await MusicNft.fromInit(
        provider.sender().address!,
        {
            $$type: 'TrackMetadata',
            title: 'Genesis Track',
            uri: 'ipfs://test',
            genre: 'Hip Hop'
        },
        toNano('0.1'),
        0n
    ));

    await musicNft.send(
        provider.sender(),
        { value: toNano('0.25') },
        null
    );

    await provider.waitForDeploy(musicNft.address);

    console.log('Deployed at:', musicNft.address.toString());
    console.log('Reputation:', await musicNft.getReputation());
    console.log('Artist:', await musicNft.getArtist());
}
