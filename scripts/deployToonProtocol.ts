import { Address, toNano } from '@ton/core';
import { ToonRegistry } from '../build/ToonRegistry/ToonRegistry_ToonRegistry';
import { ToonVault } from '../build/ToonVault/ToonVault_ToonVault';
import { ToonTip } from '../build/ToonTip/ToonTip_ToonTip';
import { ToonGovernance } from '../build/ToonGovernance/ToonGovernance_ToonGovernance';
import { NetworkProvider } from '@ton/blueprint';

// ── Full Toon Protocol deployment ─────────────────────────────────────────────
//
//  Deployment order resolves the Registry ↔ Vault circular dependency:
//
//  1. Deploy Registry  (temp vault = deployer address)
//  2. Deploy Vault     (registry address now known)
//  3. Call UpdateVaultAddress on Registry → wires real vault in
//  4. Deploy Tip + Governance
//  5. Rotate mintAuthority to Governance
//
export async function run(provider: NetworkProvider) {
    const deployer        = provider.sender();
    const deployerAddress = deployer.address;
    if (!deployerAddress) throw new Error("Deployer address unavailable — use Mnemonic wallet, not deep link.");

    console.log('━━━ TOON PROTOCOL DEPLOYMENT ━━━');
    console.log('Deploying from:', deployerAddress.toString());
    console.log('');

    // ── 1. Registry (temp vault = deployer to bootstrap) ─────────────────────
    console.log('1/5  Deploying ToonRegistry...');
    const registry = provider.open(
        await ToonRegistry.fromInit(deployerAddress, deployerAddress)
    );
    await registry.send(deployer, { value: toNano('0.1') }, { $$type: 'Deploy', queryId: 0n });
    await provider.waitForDeploy(registry.address);
    console.log('     ✅ ToonRegistry:', registry.address.toString());

    const jettonMasterAddrStr = process.env.TOON_JETTON_ADDRESS;
    if (!jettonMasterAddrStr) {
        throw new Error('TOON_JETTON_ADDRESS not set in .env — cannot deploy protocol');
    }
    const jettonMasterAddress = Address.parse(jettonMasterAddrStr.replace(/"/g, '').trim());

    // ── 2. Vault (registry address now known) ─────────────────────────────────
    console.log('2/5  Deploying ToonVault...');
    const oracleSeedHex = process.env.ORACLE_SEED_HEX;
    if (!oracleSeedHex || oracleSeedHex.length !== 64) {
        throw new Error('ORACLE_SEED_HEX not set in .env — cannot deploy vault');
    }
    const { keyPairFromSeed } = await import('@ton/crypto');
    const oracleKP = keyPairFromSeed(Buffer.from(oracleSeedHex, 'hex'));
    const oraclePubKey = BigInt('0x' + Buffer.from(oracleKP.publicKey).toString('hex'));

    const vault = provider.open(
        await ToonVault.fromInit(
            deployerAddress,        // owner
            registry.address,       // registry
            deployerAddress,        // governance (will be wired via SetGovernance)
            jettonMasterAddress,    // jettonMaster
            oraclePubKey,           // oraclePublicKey
            0n,                     // totalReserve
            0n,                     // dailyEmitted
            0n,                     // lastResetDay
            false,                  // halved
            0n                      // dailyClaimCount
        )
    );
    await vault.send(deployer, { value: toNano('0.1') }, { $$type: 'Deploy', queryId: 0n });
    await provider.waitForDeploy(vault.address);
    console.log('     ✅ ToonVault:', vault.address.toString());

    // ── 3. Wire real vault into Registry ──────────────────────────────────────
    console.log('3/5  Wiring vault address into Registry...');
    await registry.send(
        deployer,
        { value: toNano('0.05') },
        { $$type: 'UpdateVaultAddress', newVault: vault.address }
    );
    console.log('     ✅ Registry now points to real ToonVault');

    // ── 4. Tip + Governance ───────────────────────────────────────────────────
    console.log('4/5  Deploying ToonTip + ToonGovernance...');
    const tip = provider.open(await ToonTip.fromInit(registry.address));
    await tip.send(deployer, { value: toNano('0.1') }, { $$type: 'Deploy', queryId: 0n });
    await provider.waitForDeploy(tip.address);
    console.log('     ✅ ToonTip:', tip.address.toString());

    const governance = provider.open(
        await ToonGovernance.fromInit(registry.address, vault.address, jettonMasterAddress)
    );
    await governance.send(deployer, { value: toNano('0.1') }, { $$type: 'Deploy', queryId: 0n });
    await provider.waitForDeploy(governance.address);
    console.log('     ✅ ToonGovernance:', governance.address.toString());

    // ── 5. Wire governance + mintAuthority ───────────────────────────────────
    console.log('5/5  Wiring governance into Vault + rotating mintAuthority...');

    // Wire real governance contract into vault (replaces deployer placeholder).
    await vault.send(
        deployer,
        { value: toNano('0.05') },
        { $$type: 'SetGovernance', newGovernance: governance.address }
    );
    console.log('     ✅ ToonVault.governance → ToonGovernance');

    await registry.send(
        deployer,
        { value: toNano('0.05') },
        { $$type: 'UpdateMintAuthority', newAuthority: governance.address }
    );
    console.log('     ✅ Registry.mintAuthority → ToonGovernance');

    console.log('');
    console.log('━━━ DEPLOYMENT COMPLETE ━━━');
    console.log('ToonRegistry:   ', registry.address.toString());
    console.log('ToonVault:      ', vault.address.toString());
    console.log('ToonTip:        ', tip.address.toString());
    console.log('ToonGovernance: ', governance.address.toString());
    console.log('');
    console.log('Add to your .env:');
    console.log('TOON_REGISTRY_ADDRESS=' + registry.address.toString());
    console.log('TOON_VAULT_ADDRESS=' + vault.address.toString());
    console.log('TOON_TIP_ADDRESS=' + tip.address.toString());
    console.log('TOON_GOVERNANCE_ADDRESS=' + governance.address.toString());
}
