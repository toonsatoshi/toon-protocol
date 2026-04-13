require('dotenv').config({ override: true });
const { mnemonicToPrivateKey } = require('@ton/crypto');
const { TonClient, WalletContractV4, fromNano } = require('@ton/ton');

async function main() {
    const client = new TonClient({
        endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC',
        apiKey: process.env.TONCENTER_API_KEY
    });

    const mnemonic = process.env.WALLET_MNEMONIC;
    if (!mnemonic) {
        console.error('WALLET_MNEMONIC not set');
        return;
    }

    const key = await mnemonicToPrivateKey(mnemonic.split(' '));
    const wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });
    const address = wallet.address.toString();

    console.log('Deployer Address:', address);

    try {
        const balance = await client.getBalance(wallet.address);
        console.log('Balance:', fromNano(balance), 'TON');
    } catch (e) {
        console.error('Failed to get balance:', e.message);
    }

    console.log('Vault Address:', process.env.TOON_VAULT_ADDRESS);
}

main();
