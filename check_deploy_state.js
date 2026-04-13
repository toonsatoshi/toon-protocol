const { TonClient, Address, fromNano } = require('@ton/ton');
const { ToonRegistry } = require('./build/ToonRegistry/ToonRegistry_ToonRegistry');
const { mnemonicToPrivateKey } = require('@ton/crypto');
require('dotenv').config();

async function main() {
    const client = new TonClient({
        endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC',
        apiKey: process.env.TONCENTER_API_KEY
    });

    // We'll check for BOTH possible deployers
    const deployer1 = Address.parse('EQC3FQoMLt62ASKTf8aUUqqtwulB7U1A8GH9WWhh-NIvp5-b');
    const deployer2 = Address.parse('EQAF8wfP5lVcgAHpH8eW18bYMagteW9kVit_KRharLjKR5sS');

    const check = async (deployer) => {
        console.log('\n--- Checking for deployer:', deployer.toString());
        const balance = await client.getBalance(deployer);
        console.log('Deployer Balance:', fromNano(balance), 'TON');

        // ToonRegistry.fromInit(deployerAddress, deployerAddress)
        const registryInit = await ToonRegistry.fromInit(deployer, deployer);
        const registryAddr = registryInit.address;
        console.log('Target Registry Address:', registryAddr.toString());

        const state = await client.getContractState(registryAddr);
        console.log('Registry State:', state.state);
    };

    try {
        await check(deployer1);
        await check(deployer2);
    } catch (e) {
        console.error('Failed:', e);
    }
}
main();
