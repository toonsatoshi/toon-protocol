import { TonClient, Address, fromNano } from '@ton/ton';
import { ToonRegistry } from './build/ToonRegistry/ToonRegistry_ToonRegistry';
import { mnemonicToPrivateKey } from '@ton/crypto';
import 'dotenv/config';

async function main() {
    const client = new TonClient({
        endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC',
        apiKey: process.env.TONCENTER_API_KEY
    });

    const deployer1 = Address.parse('EQC3FQoMLt62ASKTf8aUUqqtwulB7U1A8GH9WWhh-NIvp5-b'); // Log address
    const deployer2 = Address.parse('EQAF8wfP5lVcgAHpH8eW18bYMagteW9kVit_KRharLjKR5sS'); // .env address

    const check = async (deployer: Address) => {
        console.log('\n--- Checking for deployer:', deployer.toString());
        const balance = await client.getBalance(deployer);
        console.log('Deployer Balance:', fromNano(balance), 'TON');

        const registryInit = await ToonRegistry.fromInit(deployer, deployer);
        const registryAddr = registryInit.address;
        console.log('Target Registry Address:', registryAddr.toString());

        const state = await client.getContractState(registryAddr);
        console.log('Registry State:', state.state);
        
        if (state.state === 'active') {
            console.log('✅ Target Registry is already active.');
        } else if (state.state === 'frozen') {
            console.error('❌ Target Registry is FROZEN.');
        } else {
            console.log('Target Registry is ready (uninitialized).');
        }
    };

    try {
        await check(deployer1);
        await check(deployer2);
    } catch (e) {
        console.error('Failed:', e);
    }
}
main();
