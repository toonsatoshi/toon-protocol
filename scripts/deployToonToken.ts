import { toNano, Address } from '@ton/core';
import { ToonJettonMaster } from '../build/ToonJettonMaster/ToonJettonMaster_ToonJettonMaster';
import { ToonVault } from '../build/ToonVault/ToonVault_ToonVault';
import { NetworkProvider } from '@ton/blueprint';

// ── Metadata URI ──────────────────────────────────────────────────────────────
//  Once your GitHub repo is live, host toon-token.json at:
//  https://raw.githubusercontent.com/YOUR_USERNAME/toon-contracts/main/metadata/toon-token.json
//  Then call UpdateMetadata on the deployed contract to update it.
//  The metadata/toon-token.json file in this repo is ready to use.
const METADATA_URI = 'https://raw.githubusercontent.com/YOUR_USERNAME/toon-contracts/main/metadata/toon-token.json';

export async function run(provider: NetworkProvider) {
    const owner = provider.sender().address!;

    // ── 1. Deploy ToonJettonMaster ────────────────────────────────────────────
    console.log('Deploying $TOON JettonMaster...');
    const jetton = provider.open(await ToonJettonMaster.fromInit(
        owner,
        owner,         // mintAuthority starts as owner
        0n,
        METADATA_URI
    ));

    await jetton.send(
        provider.sender(),
        { value: toNano('0.25') },
        { $$type: 'Deploy', queryId: 0n }
    );
    await provider.waitForDeploy(jetton.address);
    console.log('$TOON Token deployed at:', jetton.address.toString());
    console.log('');
    console.log('TOON_JETTON_ADDRESS=' + jetton.address.toString());
}
