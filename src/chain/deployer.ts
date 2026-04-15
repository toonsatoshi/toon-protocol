const { WalletContractV4 } = require('@ton/ton');
const { mnemonicToPrivateKey } = require('@ton/crypto');
const { client } = require('./client');
const logger = require('../logger');

async function getDeployer() {
    if (!process.env.WALLET_MNEMONIC) {
        throw new Error('WALLET_MNEMONIC not set');
    }
    try {
        const key = await mnemonicToPrivateKey(process.env.WALLET_MNEMONIC.split(' '));
        const wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });
        const contract = client.open(wallet);
        return { contract, key };
    } catch (e) {
        logger.error('Failed to initialize deployer', e);
        throw new Error(`INIT_DEPLOYER_FAIL: ${e.message}`);
    }
}

module.exports = {
    getDeployer
};
