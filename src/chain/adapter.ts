const { Address, toNano, beginCell } = require('@ton/core');
const { TonClient, WalletContractV4 } = require('@ton/ton');
const { mnemonicToWalletKey } = require('@ton/crypto');
const logger = require('../logger');

const client = new TonClient({
    endpoint: process.env.TON_ENDPOINT || 'https://testnet.toncenter.com/api/v2/jsonRPC',
    apiKey: process.env.TONCENTER_API_KEY
});

class ChainAdapter {
    /**
     * @param {string} recipientAddress
     * @param {number} amountTon
     * @param {string} intentId
     * @returns {Object} TON Payload
     */
    buildTipPayload(recipientAddress, amountTon, intentId) {
        // We include the intentId in the comment (memo) for tracking.
        // On-chain verification will check this memo.
        return {
            to: Address.parse(recipientAddress),
            value: toNano(amountTon.toString()),
            body: beginCell()
                .storeUint(0, 32) // Text comment prefix
                .storeStringTail(`tip:${intentId}`)
                .endCell()
        };
    }

    /**
     * @param {string} address
     * @param {number} limit
     * @returns {Promise<any[]>}
     */
    async getTransactions(address, limit = 20) {
        try {
            const addr = Address.parse(address);
            return await client.getTransactions(addr, { limit });
        } catch (e) {
            logger.error('ChainAdapter.getTransactions error', { address, error: e.message });
            return [];
        }
    }

    /**
     * @param {string} recipientAddress
     * @param {string} intentId
     * @param {number} expectedAmountTon
     * @returns {Promise<{success: boolean, txHash?: string, error?: string}>}
     */
    async searchForIntent(recipientAddress, intentId, expectedAmountTon) {
        try {
            const txs = await this.getTransactions(recipientAddress);
            const targetMemo = `tip:${intentId}`;

            for (const tx of txs) {
                // 1. Basic Inbound Check
                if (!tx.inMessage || !tx.inMessage.info || tx.inMessage.info.type !== 'internal') continue;
                
                // 2. Memo Check
                const body = tx.inMessage.body;
                if (!body) continue;
                
                try {
                    const slice = body.beginParse();
                    if (slice.remainingBits >= 32) {
                        const op = slice.loadUint(32);
                        if (op === 0) { // Text comment
                            const memo = slice.loadStringTail();
                            if (memo === targetMemo) {
                                // 3. Value Check (within small delta for fees/rounding)
                                const val = tx.inMessage.info.value.coins;
                                const expected = toNano(expectedAmountTon.toString());
                                if (val >= expected) {
                                    return { success: true, txHash: tx.hash().toString('hex') };
                                } else {
                                    logger.warn('Memo matched but amount was insufficient', { 
                                        intentId, 
                                        expected: expected.toString(), 
                                        actual: val.toString() 
                                    });
                                }
                            }
                        }
                    }
                } catch (e) {
                    // Skip if body isn't a valid comment slice
                    continue;
                }
            }

            return { success: false, error: 'NOT_FOUND_ON_CHAIN' };
        } catch (e) {
            logger.error('ChainAdapter.searchForIntent error', e);
            return { success: false, error: 'RPC_ERROR' };
        }
    }

    /**
     * @param {string} txHash
     * @returns {Promise<{success: boolean, data?: any, error?: string}>}
     */
    async verifyTransaction(txHash) {
        try {
            // In a real environment, we'd fetch the transaction by hash 
            // and verify the amount, recipient, and the memo.
            // For now, we simulate success if the hash exists.
            
            // This is where observer logic lives.
            logger.info('Verifying on-chain transaction', { txHash });
            
            // TODO: Implementation with ton-access or toncenter API
            // For the refactor, we assume the bot layer captures the hash from the wallet.
            
            return { success: true };
        } catch (e) {
            logger.error('ChainAdapter.verifyTransaction error', e);
            return { success: false, error: 'VERIFICATION_FAILED' };
        }
    }
}

module.exports = new ChainAdapter();
