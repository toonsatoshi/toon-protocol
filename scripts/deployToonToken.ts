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
        owner,         // mintAuthority starts as owner — rotated to vault below
        0n,
        METADATA_URI
    ));

    await jetton.send(
        provider.sender(),
        { value: toNano('0.25') },
        "mint"
    );
    await provider.waitForDeploy(jetton.address);
    console.log('$TOON Token deployed at:', jetton.address.toString());

    // ── 2. Deploy ToonVault ───────────────────────────────────────────────────
    console.log('Deploying ToonVault...');
    const vault = provider.open(await ToonVault.fromInit(
        owner,
        owner,
        toNano('1000000'),  // 1,000,000 $TOON initial reserve
        0n,
        0n,
        false
    ));

    await vault.send(
        provider.sender(),
        { value: toNano('0.25') },
        { $$type: 'UpdateReserve', amount: 0n }
    );
    await provider.waitForDeploy(vault.address);
    console.log('ToonVault deployed at:', vault.address.toString());

    // ── 3. Hand mint authority to vault ──────────────────────────────────────
    //  This is the critical step — locks minting to ToonVault only.
    console.log('Rotating mint authority to ToonVault...');
    await jetton.send(
        provider.sender(),
        { value: toNano('0.05') },
        { $$type: 'UpdateMintAuthority', newAuthority: vault.address }
    );
    console.log('✅ mintAuthority is now ToonVault:', vault.address.toString());
    console.log('');
    console.log('Next steps:');
    console.log('1. Update METADATA_URI in this script to your real GitHub raw URL');
    console.log('2. Call UpdateMetadata on the jetton contract when URL is live');
    console.log('3. Add both addresses to your .env file:');
    console.log('   TOON_JETTON_ADDRESS=' + jetton.address.toString());
    console.log('   TOON_VAULT_ADDRESS=' + vault.address.toString());
}
