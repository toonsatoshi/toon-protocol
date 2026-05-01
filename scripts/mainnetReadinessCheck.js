#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..');

const checks = [
  { type: 'file', value: 'tact.config.json', label: 'Tact config exists' },
  { type: 'file', value: 'tonconnect-manifest.json', label: 'Root TON Connect manifest exists' },
  { type: 'file', value: 'src/bot/tonconnect-manifest.json', label: 'Bot TON Connect manifest exists' },
  { type: 'file', value: 'setup_db.sql', label: 'DB bootstrap SQL exists' },
  { type: 'file', value: 'migrations/001_unique_listeners.sql', label: 'DB migration exists' },
  { type: 'dir', value: 'contracts', label: 'Contracts directory exists' },
  { type: 'dir', value: 'tests', label: 'Tests directory exists' },
  { type: 'dir', value: 'build', label: 'Compiled build directory exists (run npm test to generate)' },
];

const requiredEnv = [
  'NETWORK',
  'BOT_TOKEN',
  'SUPABASE_URL',
  'SUPABASE_KEY',
  'WALLET_MNEMONIC',
  'ORACLE_SEED_HEX',
  'DEPLOYER_PRIVATE_KEY',
  'PROTOCOL_FEE_BPS'
];

let failures = 0;

function pass(msg) { console.log(`✅ ${msg}`); }
function fail(msg) { console.log(`❌ ${msg}`); failures += 1; }
function warn(msg) { console.log(`⚠️ ${msg}`); }

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

console.log('🔎 Toon Protocol Mainnet Readiness Check\n');

for (const check of checks) {
  const target = path.join(root, check.value);
  if (check.type === 'file' && fs.existsSync(target) && fs.statSync(target).isFile()) pass(check.label);
  else if (check.type === 'dir' && fs.existsSync(target) && fs.statSync(target).isDirectory()) pass(check.label);
  else fail(check.label);
}

console.log('\n🔐 Environment variable checks');
for (const key of requiredEnv) {
  const value = process.env[key];
  if (!value || !String(value).trim()) warn(`${key} is set (missing in current shell)`);
  else pass(`${key} is set`);
}

const oracle = process.env.ORACLE_SEED_HEX || '';
if (oracle) {
  if (/^[0-9a-fA-F]{64}$/.test(oracle)) pass('ORACLE_SEED_HEX is 64-char hex');
  else fail('ORACLE_SEED_HEX must be a 64-char hex string');
}

const network = (process.env.NETWORK || '').trim().toLowerCase();
if (!network) {
  warn('NETWORK is not set (expected mainnet or testnet for deployment workflows)');
} else if (!['mainnet', 'testnet'].includes(network)) {
  fail('NETWORK must be set to mainnet or testnet');
} else {
  pass(`NETWORK is valid (${network})`);
}


console.log('\n📦 Artifact checks');
const buildDir = path.join(root, 'build');
if (!fs.existsSync(buildDir)) {
  warn('build/ is missing; running npm run build:contracts to generate release artifacts');
  const buildResult = spawnSync('npm', ['run', 'build:contracts'], { cwd: root, stdio: 'inherit', shell: process.platform === 'win32' });
  if (buildResult.status !== 0) {
    fail('Automatic contract build failed; run npm run build:contracts and retry readiness checks');
  } else {
    pass('Compiled build directory generated via npm run build:contracts');
  }
}
const expectedBuilds = [
  'build/ToonRegistry',
  'build/ToonVault',
  'build/ToonArtist',
  'build/MusicNft',
  'build/ToonDrop',
  'build/ToonTip',
  'build/ToonGovernance'
];
for (const rel of expectedBuilds) {
  const exists = fs.existsSync(path.join(root, rel));
  if (exists) pass(`${rel} exists`);
  else fail(`${rel} missing (run npm run build:contracts)`);
}

console.log('\n🧱 Protocol architecture checks');
const contractFiles = fs.readdirSync(path.join(root, 'contracts')).filter((f) => f.endsWith('.tact'));
const hasJetton = contractFiles.some((f) => /jetton/i.test(f));
if (hasJetton) pass('Jetton contract detected in /contracts');
else fail('No Jetton contract detected in /contracts (TEP-74 master/wallet required for $TOON)');

const governanceSource = read('contracts/toon_governance.tact');
if (/mocked until real Jetton transfer flow is wired/i.test(governanceSource)) {
  warn('Governance staking flow contains mocked-staking marker; track for follow-up hardening');
} else {
  pass('Governance staking flow does not contain mocked-staking marker');
}

const vaultSource = read('contracts/toon_vault.tact');
if (/const\s+VIBE_MULTIPLIER_BPS\s*:\s*Int\s*=\s*150\s*;/.test(vaultSource) && /VIBE_MULTIPLIER_BPS\)\s*\/\s*100/.test(vaultSource)) {
  warn('VIBE_MULTIPLIER_BPS appears to be applied as percent (/100); verify economics before production.');
} else {
  pass('Vibe multiplier math does not match the known BPS/percent bug pattern');
}

if (/mode\s*:\s*SendIgnoreErrors/.test(vaultSource)) {
  warn('ToonVault still uses SendIgnoreErrors in at least one send path; manually review financial sends');
} else {
  pass('ToonVault has no SendIgnoreErrors usage');
}

if (failures > 0) {
  console.log(`\n❌ Mainnet readiness check failed with ${failures} issue(s).`);
  process.exit(1);
}

console.log('\n✅ Mainnet readiness check passed.');
