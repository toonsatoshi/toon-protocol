const { TonClient, Address, fromNano } = require('@ton/ton');

async function main() {
    const client = new TonClient({
        endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC'
    });
    const addrStr = '0QC3FQoMLt62ASKTf8aUUqqtwulB7U1A8GH9WWhh-NIvp3nU';
    const address = Address.parse(addrStr);
    console.log('Checking address:', address.toString());
    try {
        const balance = await client.getBalance(address);
        console.log('Balance:', fromNano(balance), 'TON');
        const state = await client.getContractState(address);
        console.log('State:', state.state);
    } catch (e) {
        console.error('Failed:', e.message);
    }
}
main();
