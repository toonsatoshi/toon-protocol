require('dotenv').config();
const { mnemonicToPrivateKey } = require('@ton/crypto');
const { TonClient, WalletContractV4, fromNano, Address } = require('@ton/ton');
const { ToonRegistry } = require('./build/ToonRegistry/ToonRegistry_ToonRegistry');

async function main() {
    const client = new TonClient({
        endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC',
        apiKey: process.env.TONCENTER_API_KEY
    });

    const mnemonic = process.env.WALLET_MNEMONIC;
    if (!mnemonic) {
        console.error('❌ WALLET_MNEMONIC not set');
        return;
    }

    const key = await mnemonicToPrivateKey(mnemonic.split(' '));
    const wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });
    const deployerAddr = wallet.address;

    console.log('Deployer Address:', deployerAddr.toString());
    
    try {
        const balance = await client.getBalance(deployerAddr);
        console.log('Deployer Balance:', fromNano(balance), 'TON');
        
        if (parseFloat(fromNano(balance)) < 0.5) {
            console.warn('⚠️ Warning: Balance might be too low for full protocol deployment.');
        }

        // Calculate Registry Address
        // In deployToonProtocol.ts: ToonRegistry.fromInit(deployerAddress, deployerAddress)
        const registryInit = await ToonRegistry.fromInit(deployerAddr, deployerAddr);
        const registryAddr = registryInit.address;
        console.log('Target Registry Address:', registryAddr.toString());

        const state = await client.getContractState(registryAddr);
        console.log('Registry State:', state.state);
        
        if (state.state === 'active') {
            console.log('✅ Registry is already active on-chain.');
        } else if (state.state === 'frozen') {
            console.error('❌ Registry address is FROZEN. You likely need a different seed or to clear it.');
        } else {
            console.log('Registry is ready for deployment (uninitialized).');
        }

    } catch (e) {
        console.error('❌ Diagnostic failed:', e.message);
    }
}

main();
