const { Address, toNano, beginCell } = require('@ton/core');
const { TonClient, WalletContractV4 } = require('@ton/ton');
const { mnemonicToWalletKey } = require('@ton/crypto');
const { ToonRegistry } = require('./build/ToonRegistry/ToonRegistry_ToonRegistry');
const logger = require('./logger');

const client = new TonClient({
    endpoint: process.env.TON_ENDPOINT || 'https://testnet.toncenter.com/api/v2/jsonRPC',
    apiKey: process.env.TONCENTER_API_KEY
});

async function getDeployer() {
    const mnemonic = process.env.WALLET_MNEMONIC;
    if (!mnemonic) throw new Error('WALLET_MNEMONIC not set');
    const key = await mnemonicToWalletKey(mnemonic.split(' '));
    const wallet = WalletContractV4.create({ workchain: 0, publicKey: key.publicKey });
    const contract = client.open(wallet);
    return { wallet, contract, key };
}

async function authorizeMint(recipientAddress, amount) {
    try {
        const { contract, key } = await getDeployer();
        const registryAddress = Address.parse(process.env.TOON_REGISTRY_ADDRESS);
        const registry = client.open(ToonRegistry.fromAddress(registryAddress));

        logger.info('Authorizing mint on-chain', { recipient: recipientAddress, amount: amount.toString() });

        await registry.send(
            contract.sender(key.secretKey),
            { value: toNano('0.05') },
            {
                $$type: 'AuthorizeMint',
                recipient: Address.parse(recipientAddress),
                amount: amount
            }
        );

        return true;
    } catch (e) {
        logger.error('Failed to authorize mint', e);
        return false;
    }
}

module.exports = {
    authorizeMint,
    client
};
