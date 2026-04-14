const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config();
const colors = require('colors/safe');

// --- CONFIGURATION ---
const API = process.env.TONCENTER_API_KEY;
const V = process.env.TOON_VAULT_ADDRESS;
const R = process.env.TOON_REGISTRY_ADDRESS;
const J = process.env.TOON_JETTON_ADDRESS;
const A = process.env.TOON_ARTIST_ADDRESS;
const T = process.env.TOON_TIP_ADDRESS;
const G = process.env.TOON_GOVERNANCE_ADDRESS;
const BOT = process.env.BOT_TOKEN;
const MN = process.env.WALLET_MNEMONIC;
const WV = process.env.WALLET_VERSION;
const SB_U = process.env.SUPABASE_URL;
const SB_K = process.env.SUPABASE_KEY;
const ORACLE_HEX = process.env.ORACLE_SEED_HEX;
const ORACLE_PK = (process.env.ORACLE_PUBLIC_KEY || '').replace(/^0x/, '');

const BASE = 'https://testnet.toncenter.com/api/v2';
const H = { 'X-API-Key': API };

// --- FORMATTING HELPERS ---
const PASS = colors.green('  ✓ PASS');
const FAIL = colors.red('  ✗ FAIL');
const WARN = colors.yellow('  ⚠ WARN');
const SKIP = colors.gray('  ─ SKIP');

let results = [];

function record(name, status, detail = '') {
    results.push({ name, status, detail });
    let icon = status === 'pass' ? PASS : (status === 'fail' ? FAIL : (status === 'warn' ? WARN : SKIP));
    console.log(`${icon}  ${name}${detail ? '  ' + colors.gray(detail) : ''}`);
}

function section(s) {
    console.log(colors.bold(colors.cyan(`\n  ┌─ ${s} ${'─'.repeat(Math.max(0, 44 - s.length))}┐`)));
}

function endsec() {
    console.log(colors.bold(colors.cyan(`  └${'─'.repeat(46)}┘`)));
}

// --- API HELPERS ---
async function getMethod(addr, method, stack = []) {
    try {
        const res = await axios.post(`${BASE}/runGetMethod`, { address: addr, method, stack }, { headers: H, timeout: 10000 });
        const d = res.data;
        return [d.ok || false, d.result || {}, d.error || ''];
    } catch (e) { return [false, {}, e.message]; }
}

async function getState(addr) {
    try {
        const res = await axios.get(`${BASE}/getAddressInformation`, { headers: H, params: { address: addr }, timeout: 10000 });
        const d = res.data;
        return [d.ok || false, d.result || {}, d.error || ''];
    } catch (e) { return [false, {}, e.message]; }
}

async function getBalance(addr) {
    try {
        const res = await axios.get(`${BASE}/getAddressBalance`, { headers: H, params: { address: addr }, timeout: 10000 });
        const d = res.data;
        return [d.ok || false, parseInt(d.result || '0'), d.error || ''];
    } catch (e) { return [false, 0, e.message]; }
}

async function getTxns(addr, limit = 5) {
    try {
        const res = await axios.get(`${BASE}/getTransactions`, { headers: H, params: { address: addr, limit }, timeout: 10000 });
        const d = res.data;
        return [d.ok || false, d.result || [], d.error || ''];
    } catch (e) { return [false, [], e.message]; }
}

// --- MAIN RUNNER ---
async function run() {
    console.log(colors.bold(colors.magenta('\n  ╔════════════════════════════════════════════╗')));
    console.log(colors.bold(colors.magenta('  ║       🌀  TOON CONTRACT TEST SUITE         ║')));
    console.log(colors.bold(colors.magenta('  ╚════════════════════════════════════════════╝')));
    console.log(colors.gray(`  Testnet · ${new Date().toISOString().replace('T', ' ').split('.')[0]} UTC`));

    // 1. ENV VARS
    section('1 · ENV VARS');
    const required = {
        'TONCENTER_API_KEY': API, 'TOON_VAULT_ADDRESS': V, 'TOON_REGISTRY_ADDRESS': R,
        'TOON_JETTON_ADDRESS': J, 'TOON_ARTIST_ADDRESS': A, 'TOON_TIP_ADDRESS': T,
        'TOON_GOVERNANCE_ADDRESS': G, 'BOT_TOKEN': BOT, 'WALLET_MNEMONIC': MN,
        'WALLET_VERSION': WV, 'SUPABASE_URL': SB_U, 'SUPABASE_KEY': SB_K,
        'ORACLE_SEED_HEX': ORACLE_HEX, 'ORACLE_PUBLIC_KEY': process.env.ORACLE_PUBLIC_KEY
    };
    let missing = [];
    for (const [k, v] of Object.entries(required)) {
        if (!v) {
            missing.push(k);
            record(`Env: ${k}`, 'fail', 'not set');
        } else {
            let masked = ['TONCENTER_API_KEY', 'SUPABASE_KEY', 'BOT_TOKEN'].includes(k) ? '********' + v.slice(-4) : v.slice(0, 14) + '…';
            record(`Env: ${k}`, 'pass', masked);
        }
    }
    endsec();
    if (missing.length > 0) {
        console.log(colors.red(`\n  ✗ ${missing.length} required env vars missing.`));
        process.exit(1);
    }

    // 2. API CONNECTIVITY
    section('2 · API CONNECTIVITY');
    try {
        const res = await axios.get(`${BASE}/getMasterchainInfo`, { headers: H, timeout: 8000 });
        if (res.data.ok) record('TonCenter testnet reachable', 'pass', `seqno=${res.data.result.last.seqno}`);
        else record('TonCenter testnet reachable', 'fail', res.data.error || '');
    } catch (e) { record('TonCenter testnet reachable', 'fail', e.message); }
    endsec();

    // 3. CONTRACT LIVENESS
    section('3 · CONTRACT LIVENESS');
    const contracts = { 'Vault': V, 'Registry': R, 'Jetton': J, 'Artist': A, 'Tip': T, 'Governance': G };
    let live = {};
    for (const [name, addr] of Object.entries(contracts)) {
        const [ok, st, err] = await getState(addr);
        if (!ok) { record(`${name} deployed`, 'fail', err); live[name] = false; continue; }
        let status = st.state || 'uninitialized';
        let bal = parseInt(st.balance || '0') / 1e9;
        if (status === 'active') { record(`${name} deployed`, 'pass', `active · ${bal.toFixed(4)} TON`); live[name] = true; }
        else { record(`${name} deployed`, 'warn', `state=${status}`); live[name] = false; }
    }
    endsec();

    // 4. VAULT CONTRACT
    section('4 · VAULT CONTRACT');
    if (live['Vault']) {
        const methods = ['totalReserve', 'dailyEmitted', 'dailyClaimCount', 'isHalved', 'currentEmissionCap', 'getConfig', 'governance'];
        for (const m of methods) {
            const [ok, res, err] = await getMethod(V, m);
            if (ok && res.exit_code === 0) {
                record(`Vault.${m}()`, 'pass', res.stack?.[0]?.[1] || 'ok');
            } else record(`Vault.${m}()`, 'fail', err || `exit_code=${res.exit_code}`);
        }
        const [okB, bal] = await getBalance(V);
        if (okB) record('Vault balance', bal > 0 ? 'pass' : 'warn', `${(bal / 1e9).toFixed(6)} TON`);
        const [okT, txs] = await getTxns(V, 3);
        if (okT) record('Vault tx history', txs.length ? 'pass' : 'warn', `${txs.length} recent txns`);
    } else record('Vault tests', 'skip', 'contract not live');
    endsec();

    // 5. JETTON CONTRACT
    section('5 · JETTON CONTRACT');
    if (live['Jetton']) {
        const [ok, res, err] = await getMethod(J, 'get_jetton_data');
        if (ok && res.exit_code === 0) {
            record('get_jetton_data executes', 'pass', `${res.stack.length} items`);
            const [ok2, res2] = await getMethod(J, 'get_wallet_address', [['num', '0']]);
            record('get_wallet_address responds', (ok2 && res2.exit_code === 0) ? 'pass' : 'warn', `exit_code=${res2.exit_code}`);
        } else record('get_jetton_data executes', 'fail', err || `exit_code=${res.exit_code}`);
    } else record('Jetton tests', 'skip', 'contract not live');
    endsec();

    // 10. SUPABASE
    section('10 · SUPABASE CONNECTIVITY');
    try {
        const res = await axios.get(`${SB_U}/rest/v1/`, { headers: { 'apikey': SB_K, 'Authorization': `Bearer ${SB_K}` }, timeout: 8000 });
        record('Supabase reachable', 'pass', `HTTP ${res.status}`);
    } catch (e) { record('Supabase reachable', 'fail', e.message); }
    endsec();

    // 11. TELEGRAM BOT
    section('11 · TELEGRAM BOT TOKEN');
    try {
        const res = await axios.get(`https://api.telegram.org/bot${BOT}/getMe`, { timeout: 8000 });
        if (res.data.ok) record('Bot token valid', 'pass', `@${res.data.result.username}`);
        else record('Bot token valid', 'fail', res.data.description);
    } catch (e) { record('Bot token valid', 'fail', e.message); }
    endsec();

    // SUMMARY
    const passed = results.filter(r => r.status === 'pass').length;
    const failed = results.filter(r => r.status === 'fail').length;
    console.log(colors.bold(colors.magenta('\n  ╔════════════════════════════════════════════╗')));
    console.log(colors.bold(colors.magenta('  ║              TEST SUMMARY                  ║')));
    console.log(colors.bold(colors.magenta('  ╚════════════════════════════════════════════╝')));
    console.log(`  ${colors.green(passed)} passed  ${colors.red(failed)} failed  / ${results.length} total`);
}

run();
