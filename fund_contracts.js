require('dotenv').config({ override: true });

const { mnemonicToPrivateKey } = require('@ton/crypto');
const { TonClient, WalletContractV4, toNano, fromNano, Address } = require('@ton/ton');

const FUND_AMOUNT    = toNano('0.1');   // 0.1 TON each — tweak if needed
const ENDPOINT       = 'https://testnet.toncenter.com/api/v2/jsonRPC';
const POLL_INTERVAL  = 3000;            // ms between seqno polls
const POLL_TIMEOUT   = 60000;          // ms before giving up

// ── Helpers ───────────────────────────────────────────────────────────────────

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function waitForSeqno(contract, seqnoBefore) {
    const deadline = Date.now() + POLL_TIMEOUT;
    while (Date.now() < deadline) {
        await sleep(POLL_INTERVAL);
        try {
            const seqnoNow = await contract.getSeqno();
            if (seqnoNow > seqnoBefore) return true;
        } catch (_) {}
    }
    return false; // timed out
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
    // ── Env checks ───────────────────────────────────────────────────────────
    const required = {
        TONCENTER_API_KEY:        process.env.TONCENTER_API_KEY,
        WALLET_MNEMONIC:          process.env.WALLET_MNEMONIC,
        TOON_ARTIST_ADDRESS:      process.env.TOON_ARTIST_ADDRESS,
        TOON_TIP_ADDRESS:         process.env.TOON_TIP_ADDRESS,
        TOON_GOVERNANCE_ADDRESS:  process.env.TOON_GOVERNANCE_ADDRESS,
    };
    const missing = Object.entries(required).filter(([, v]) => !v).map(([k]) => k);
    if (missing.length) {
        console.error('❌  Missing env vars:', missing.join(', '));
        process.exit(1);
    }

    const targets = {
        Artist:     required.TOON_ARTIST_ADDRESS,
        Tip:        required.TOON_TIP_ADDRESS,
        Governance: required.TOON_GOVERNANCE_ADDRESS,
    };

    // ── Wallet setup ─────────────────────────────────────────────────────────
    const client  = new TonClient({ endpoint: ENDPOINT, apiKey: required.TONCENTER_API_KEY });
    const key     = await mnemonicToPrivateKey(required.WALLET_MNEMONIC.split(' '));
    const wallet  = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });
    const opened  = client.open(wallet);
    const sender  = opened.sender(key.secretKey);

    const balance = await client.getBalance(wallet.address);
    const needed  = FUND_AMOUNT * BigInt(Object.keys(targets).length) + toNano('0.03'); // + gas buffer

    console.log('\n━━━ FUND TOON CONTRACTS ━━━');
    console.log('Sender :', wallet.address.toString({ testOnly: true }));
    console.log('Balance:', fromNano(balance), 'TON');
    console.log('Sending:', fromNano(FUND_AMOUNT), 'TON × 3 contracts\n');

    if (balance < needed) {
        console.error(`❌  Insufficient balance. Need ~${fromNano(needed)} TON, have ${fromNano(balance)} TON.`);
        process.exit(1);
    }

    // ── Send ─────────────────────────────────────────────────────────────────
    for (const [name, raw] of Object.entries(targets)) {
        const to = Address.parse(raw);
        console.log(`Funding ${name}: ${to.toString({ testOnly: true })}`);

        const seqnoBefore = await opened.getSeqno();

        await sender.send({
            to,
            value: FUND_AMOUNT,
            bounce: false,      // contracts may have no bare-transfer handler; bounce: false is safe
        });

        process.stdout.write('  ⏳ Waiting for confirmation...');
        const confirmed = await waitForSeqno(opened, seqnoBefore);
        if (confirmed) {
            console.log(' ✅');
        } else {
            console.log(' ⚠️  Timed out — check explorer manually');
        }
    }

    // ── Final balances ────────────────────────────────────────────────────────
    console.log('\n━━━ POST-FUND BALANCES ━━━');
    for (const [name, raw] of Object.entries(targets)) {
        try {
            const bal = await client.getBalance(Address.parse(raw));
            console.log(`  ${name.padEnd(12)}: ${fromNano(bal)} TON`);
        } catch (e) {
            console.log(`  ${name.padEnd(12)}: ⚠️  ${e.message}`);
        }
    }

    console.log('\n━━━ DONE ━━━\n');
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
