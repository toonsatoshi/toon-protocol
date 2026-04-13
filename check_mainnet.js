const { TonClient, Address, fromNano } = require('@ton/ton');

async function main() {
    const client = new TonClient({
        endpoint: 'https://toncenter.com/api/v2/jsonRPC' // MAINNET
    });
    const addrStr = 'EQC3FQoMLt62ASKTf8aUUqqtwulB7U1A8GH9WWhh-NIvp5-b';
    const address = Address.parse(addrStr);
    console.log('Checking Mainnet address:', address.toString());
    try {
        const balance = await client.getBalance(address);
        console.log('Mainnet Balance:', fromNano(balance), 'TON');
    } catch (e) {
        console.error('Failed:', e.message);
    }
}
main();
