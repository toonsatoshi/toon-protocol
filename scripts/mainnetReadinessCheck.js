#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

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
  'BOT_TOKEN',
  'SUPABASE_URL',
  'SUPABASE_KEY',
  'WALLET_MNEMONIC',
  'ORACLE_SEED_HEX'
];

let failures = 0;

function pass(msg) { console.log(`✅ ${msg}`); }
function fail(msg) { console.log(`❌ ${msg}`); failures += 1; }

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
  if (!value || !String(value).trim()) fail(`${key} is set`);
  else pass(`${key} is set`);
}

const oracle = process.env.ORACLE_SEED_HEX || '';
if (oracle) {
  if (/^[0-9a-fA-F]{64}$/.test(oracle)) pass('ORACLE_SEED_HEX is 64-char hex');
  else fail('ORACLE_SEED_HEX must be a 64-char hex string');
}

console.log('\n📦 Artifact checks');
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

if (failures > 0) {
  console.log(`\n❌ Mainnet readiness check failed with ${failures} issue(s).`);
  process.exit(1);
}

console.log('\n✅ Mainnet readiness check passed.');
