import { defineConfig } from '@ton/blueprint';
import 'dotenv/config';

export default defineConfig({
    network: {
        endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC',
        type: 'testnet',
        apiKey: process.env.TONCENTER_API_KEY,
        walletVersion: process.env.WALLET_VERSION as any || 'v4',
        mnemonic: process.env.WALLET_MNEMONIC
    }
});
