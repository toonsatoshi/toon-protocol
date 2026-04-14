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
    const jettonMasterAddrStr = process.env.TOON_JETTON_ADDRESS;
    if (!jettonMasterAddrStr) {
        throw new Error('TOON_JETTON_ADDRESS not set in .env — cannot deploy vault');
    }
    const jettonMasterAddress = Address.parse(jettonMasterAddrStr.replace(/"/g, '').trim());
    
    const oracleSeedHex = process.env.ORACLE_SEED_HEX;
    if (!oracleSeedHex || oracleSeedHex.length !== 64) {
        throw new Error('ORACLE_SEED_HEX not set in .env — cannot deploy vault');
    }
    const { keyPairFromSeed } = await import('@ton/crypto');
    const oracleKP = keyPairFromSeed(Buffer.from(oracleSeedHex, 'hex'));
    const oraclePubKey = BigInt('0x' + Buffer.from(oracleKP.publicKey).toString('hex'));

    const newVault = provider.open(
        await ToonVault.fromInit(
            deployer.address!, 
            registryAddress,
            deployer.address!,     // temp governance
            jettonMasterAddress,    // jettonMaster
            oraclePubKey,           // oraclePublicKey
            0n,                     // totalReserve
            0n,                     // dailyEmitted
            0n,                     // lastResetDay
            false,                  // halved
            0n                      // dailyClaimCount
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
