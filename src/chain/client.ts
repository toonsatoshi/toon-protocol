const { TonClient } = require('@ton/ton');
const logger = require('../logger');

const apiKey = (process.env.TONCENTER_API_KEY && process.env.TONCENTER_API_KEY.length > 10) 
    ? process.env.TONCENTER_API_KEY.trim() 
    : undefined;

const endpoint = process.env.TON_ENDPOINT || 'https://testnet.toncenter.com/api/v2/jsonRPC';

if (apiKey) {
    logger.info(`Using TONCENTER_API_KEY starting with: ${apiKey.slice(0, 4)}...`);
} else {
    logger.info('No TONCENTER_API_KEY found, using public endpoint limits.');
}

const client = new TonClient({
    endpoint: endpoint,
    apiKey: apiKey
});

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function retry(fn: any, retries: number = 3, delay: number = 2000) {
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (err) {
            if (i === retries - 1) throw err;
            
            const status = err.response?.status;
            if (status === 429) {
                logger.warn(`Rate limit (429) hit, retrying in ${delay}ms... (${i + 1}/${retries})`);
                await sleep(delay);
                delay *= 2; 
            } else {
                throw err;
            }
        }
    }
}

module.exports = {
    client,
    retry,
    sleep
};
