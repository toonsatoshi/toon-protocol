const { Address, toNano, beginCell } = require('@ton/core');
const { TonClient, WalletContractV4 } = require('@ton/ton');
const { mnemonicToWalletKey } = require('@ton/crypto');
const { ToonVault } = require('./build/ToonVault/ToonVault_ToonVault');
const logger = require('./logger');

const client = new TonClient({
    endpoint: process.env.TON_ENDPOINT || 'https://testnet.toncenter.com/api/v2/jsonRPC',
    apiKey: process.env.TONCENTER_API_KEY
});

async function getDeployer() {
    const mnemonic = process.env.DEPLOYER_MNEMONIC;
    if (!mnemonic) throw new Error('DEPLOYER_MNEMONIC not set');
    const key = await mnemonicToWalletKey(mnemonic.split(' '));
    const wallet = WalletContractV4.create({ workchain: 0, publicKey: key.publicKey });
    const contract = client.open(wallet);
    return { wallet, contract, key };
}

async function authorizeMint(recipientAddress, amount) {
    try {
        const { contract, key } = await getDeployer();
        const vaultAddress = Address.parse(process.env.TOON_VAULT_ADDRESS);
        const vault = client.open(ToonVault.fromAddress(vaultAddress));

        logger.info('Authorizing mint on-chain', { recipient: recipientAddress, amount: amount.toString() });

        await vault.send(
            contract.sender(key.secretKey),
            { value: toNano('0.05') },
            {
                $$type: 'MintAuthorized',
                recipient: Address.parse(recipientAddress),
                amount: amount,
                authorizedAt: Math.floor(Date.now() / 1000)
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
