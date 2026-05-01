const NETWORKS = {
  testnet: {
    tonEndpoint: process.env.TON_ENDPOINT_TESTNET || null,
    tonApiBaseUrl: process.env.TON_API_BASE_URL_TESTNET || null,
    toonVaultAddress: process.env.TOON_VAULT_ADDRESS_TESTNET || process.env.TOON_VAULT_ADDRESS || null,
    toonRegistryAddress: process.env.TOON_REGISTRY_ADDRESS_TESTNET || process.env.TOON_REGISTRY_ADDRESS || null,
    toonTipAddress: process.env.TOON_TIP_ADDRESS_TESTNET || process.env.TOON_TIP_ADDRESS || null,
    toonGovernanceAddress: process.env.TOON_GOVERNANCE_ADDRESS_TESTNET || process.env.TOON_GOVERNANCE_ADDRESS || null,
    tonConnectManifestUrl: process.env.TONCONNECT_MANIFEST_URL_TESTNET || process.env.TONCONNECT_MANIFEST_URL || null,
    tonConnectBridgeUrl: process.env.TONCONNECT_BRIDGE_URL_TESTNET || process.env.TONCONNECT_BRIDGE_URL || null,
    tonConnectUniversalLink: process.env.TONCONNECT_UNIVERSAL_LINK_TESTNET || process.env.TONCONNECT_UNIVERSAL_LINK || null,
    explorerNetworkId: process.env.EXPLORER_NETWORK_ID_TESTNET || '-3',
    trackBaseUrl: process.env.TRACK_BASE_URL_TESTNET || process.env.TRACK_BASE_URL || null,
    artistBaseUrl: process.env.ARTIST_BASE_URL_TESTNET || process.env.ARTIST_BASE_URL || null,
  },
  mainnet: {
    tonEndpoint: process.env.TON_ENDPOINT_MAINNET || null,
    tonApiBaseUrl: process.env.TON_API_BASE_URL_MAINNET || null,
    toonVaultAddress: process.env.TOON_VAULT_ADDRESS_MAINNET || process.env.TOON_VAULT_ADDRESS || null,
    toonRegistryAddress: process.env.TOON_REGISTRY_ADDRESS_MAINNET || process.env.TOON_REGISTRY_ADDRESS || null,
    toonTipAddress: process.env.TOON_TIP_ADDRESS_MAINNET || process.env.TOON_TIP_ADDRESS || null,
    toonGovernanceAddress: process.env.TOON_GOVERNANCE_ADDRESS_MAINNET || process.env.TOON_GOVERNANCE_ADDRESS || null,
    tonConnectManifestUrl: process.env.TONCONNECT_MANIFEST_URL_MAINNET || process.env.TONCONNECT_MANIFEST_URL || null,
    tonConnectBridgeUrl: process.env.TONCONNECT_BRIDGE_URL_MAINNET || process.env.TONCONNECT_BRIDGE_URL || null,
    tonConnectUniversalLink: process.env.TONCONNECT_UNIVERSAL_LINK_MAINNET || process.env.TONCONNECT_UNIVERSAL_LINK || null,
    explorerNetworkId: process.env.EXPLORER_NETWORK_ID_MAINNET || '-239',
    trackBaseUrl: process.env.TRACK_BASE_URL_MAINNET || process.env.TRACK_BASE_URL || null,
    artistBaseUrl: process.env.ARTIST_BASE_URL_MAINNET || process.env.ARTIST_BASE_URL || null,
  },
};

function requireEnv(name) {
  const value = process.env[name];
  if (!value || !String(value).trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return String(value).trim();
}

function requireSecret(name) {
  const direct = process.env[name];
  if (direct && String(direct).trim()) {
    return String(direct).trim();
  }

  const fileVar = `${name}_FILE`;
  const filePath = process.env[fileVar];
  if (filePath && String(filePath).trim()) {
    const fs = require('fs');
    const secret = fs.readFileSync(String(filePath).trim(), 'utf8').trim();
    if (!secret) {
      throw new Error(`Secret file for ${name} is empty: ${filePath}`);
    }
    return secret;
  }

  throw new Error(`Missing required secret: set ${name} or ${fileVar}`);
}

function validateEnvironment() {
  const network = String(process.env.NETWORK || '').trim().toLowerCase();
  if (!network || !['mainnet', 'testnet'].includes(network)) {
    throw new Error('NETWORK must be set to "mainnet" or "testnet"');
  }

  const config = NETWORKS[network];
  const required = [
    ['BOT_TOKEN', () => requireEnv('BOT_TOKEN')],
    ['WALLET_MNEMONIC', () => requireSecret('WALLET_MNEMONIC')],
    ['ORACLE_SEED_HEX', () => requireEnv('ORACLE_SEED_HEX')],
    ['DEPLOYER_PRIVATE_KEY', () => requireSecret('DEPLOYER_PRIVATE_KEY')],
    ['PROTOCOL_FEE_BPS', () => requireEnv('PROTOCOL_FEE_BPS')],
    ['TON_ENDPOINT', () => config.tonEndpoint],
    ['TON_API_BASE_URL', () => config.tonApiBaseUrl],
    ['TOON_VAULT_ADDRESS', () => config.toonVaultAddress],
    ['TOON_REGISTRY_ADDRESS', () => config.toonRegistryAddress],
    ['TOON_TIP_ADDRESS', () => config.toonTipAddress],
    ['TOON_GOVERNANCE_ADDRESS', () => config.toonGovernanceAddress],
    ['TONCONNECT_MANIFEST_URL', () => config.tonConnectManifestUrl],
    ['TONCONNECT_BRIDGE_URL', () => config.tonConnectBridgeUrl],
    ['TONCONNECT_UNIVERSAL_LINK', () => config.tonConnectUniversalLink],
    ['TRACK_BASE_URL', () => config.trackBaseUrl],
    ['ARTIST_BASE_URL', () => config.artistBaseUrl],
  ];

  for (const [name, getter] of required) {
    const value = getter();
    if (!value || !String(value).trim()) {
      throw new Error(`Missing required environment variable: ${name} for NETWORK=${network}`);
    }
  }

  if (!/^[0-9a-fA-F]{64}$/.test(process.env.ORACLE_SEED_HEX.trim())) {
    throw new Error('ORACLE_SEED_HEX must be a 64-char hex string');
  }

  const protocolFeeBps = Number.parseInt(process.env.PROTOCOL_FEE_BPS, 10);
  if (!Number.isInteger(protocolFeeBps) || protocolFeeBps < 0 || protocolFeeBps > 10_000) {
    throw new Error('PROTOCOL_FEE_BPS must be an integer between 0 and 10000');
  }

  return {
    network,
    ...config,
    walletMnemonic: requireSecret('WALLET_MNEMONIC'),
    deployerPrivateKey: requireSecret('DEPLOYER_PRIVATE_KEY'),
    protocolFeeBps,
  };
}

module.exports = { validateEnvironment };
