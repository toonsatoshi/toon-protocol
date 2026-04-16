const { Address } = require('@ton/core');
const client = require('./adapter').client;
const supabase = require('../supabase');
const logger = require('../logger');

// OP-Codes from compiled ABIs
const OP = {
    REWARD_CLAIMED: 0x819ec4a3,    // 2174965059
    MINT_CONFIRMED: 0x1bf9eb85,    // 469362853
    TIP_SENT: 0x72a3b4c5           // Mocked - would be in ToonTip.abi
};

class ChainIndexer {
    constructor() {
        this.isRunning = false;
        this.POLL_INTERVAL_MS = 10000;
        this.WATCH_ADDRESSES = [
            process.env.TOON_VAULT_ADDRESS,
            process.env.TOON_TIP_ADDRESS
        ].filter(Boolean);
    }

    async start() {
        if (this.isRunning) return;
        this.isRunning = true;
        logger.info('ChainIndexer started', { addresses: this.WATCH_ADDRESSES });
        this.runLoop();
    }

    async runLoop() {
        while (this.isRunning) {
            try {
                for (const addr of this.WATCH_ADDRESSES) {
                    await this.syncAddress(addr);
                }
            } catch (e) {
                logger.error('ChainIndexer loop error', e);
            }
            await new Promise((r: any) => setTimeout(r, this.POLL_INTERVAL_MS));
        }
    }

    async syncAddress(addressStr: string) {
        const address = Address.parse(addressStr);
        const { data: cursorData } = await supabase
            .from('indexer_cursors')
            .select('last_lt')
            .eq('address', addressStr)
            .single();
        
        const lastLt = cursorData ? cursorData.last_lt : '0';
        const txs = await client.getTransactions(address, { limit: 50 });
        const newTxs = txs
            .filter((tx: any) => BigInt(tx.lt) > BigInt(lastLt))
            .reverse();

        if (newTxs.length === 0) return;

        for (const tx of newTxs) {
            await this.processTransaction(tx, addressStr);
        }

        const latestLt = newTxs[newTxs.length - 1].lt.toString();
        await supabase
            .from('indexer_cursors')
            .upsert({ address: addressStr, last_lt: latestLt }, { onConflict: 'address' });
    }

    async processTransaction(tx: any, contractAddress: string) {
        const txHash = tx.hash().toString('hex');
        const lt = tx.lt.toString();
        
        for (const outMsg of tx.outMessages.values()) {
            if (outMsg.info.type !== 'external-out') continue;
            
            try {
                const slice = outMsg.body.beginParse();
                if (slice.remainingBits < 32) continue;
                
                const op = slice.loadUint(32);
                await this.handleEvent(op, slice, txHash, lt, tx.now);
            } catch (e) {
                logger.error('Failed to handle event', { txHash, error: e.message });
            }
        }
    }

    async handleEvent(op: number, slice: any, txHash: string, lt: string, timestamp: number) {
        switch (op) {
            case OP.REWARD_CLAIMED: {
                const rewardId = slice.loadUint(8);
                const recipient = slice.loadAddress();
                const amount = slice.loadCoins();

                logger.info('ChainIndexer: RewardClaimed detected', { recipient: recipient.toString(), amount: amount.toString() });

                // 1. Log to indexed_events for the reconciler
                await supabase.from('indexed_events').insert({
                    tx_hash: txHash,
                    lt: lt,
                    event_type: 'RewardClaimed',
                    data: {
                        userId: await this.getTelegramIdByAddress(recipient.toString()),
                        recipient: recipient.toString(),
                        rewardId: rewardId,
                        amount: amount.toString()
                    },
                    timestamp: new Date(timestamp * 1000).toISOString()
                });

                // 2. Update live balance (C1 Fix)
                await this.updateUserBalance(recipient.toString(), amount);
                break;
            }

            case OP.MINT_CONFIRMED: {
                // Payment intents often end here
                const recipient = slice.loadAddress();
                const amount = slice.loadCoins();
                
                logger.info('ChainIndexer: MintConfirmed (Payment) detected', { recipient: recipient.toString(), amount: amount.toString() });
                
                await supabase.from('indexed_events').insert({
                    tx_hash: txHash,
                    lt: lt,
                    event_type: 'PaymentConfirmed',
                    data: {
                        userId: await this.getTelegramIdByAddress(recipient.toString()),
                        toonAmount: amount.toString()
                    },
                    timestamp: new Date(timestamp * 1000).toISOString()
                });

                await this.updateUserBalance(recipient.toString(), amount);
                break;
            }
        }
    }

    async getTelegramIdByAddress(address: string) {
        const { data } = await supabase
            .from('users')
            .select('telegram_id')
            .eq('contract_address', address)
            .single();
        return data ? data.telegram_id : null;
    }

    async updateUserBalance(address: string, deltaNano: any) {
        // C1 Fix: Actually update the users table balance
        const { data: user } = await supabase
            .from('users')
            .select('telegram_id, toon_balance')
            .eq('contract_address', address)
            .single();
        
        if (user) {
            const newBalance = BigInt(user.toon_balance || 0) + BigInt(deltaNano);
            await supabase
                .from('users')
                .update({ toon_balance: newBalance.toString() })
                .eq('telegram_id', user.telegram_id);
        }
    }
}

module.exports = new ChainIndexer();
