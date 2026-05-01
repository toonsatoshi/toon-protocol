const NETWORKS = {
  testnet: {
    tonEndpoint: process.env.TON_ENDPOINT_TESTNET || 'https://testnet.toncenter.com/api/v2/jsonRPC',
    tonApiBaseUrl: process.env.TON_API_BASE_URL_TESTNET || 'https://testnet.toncenter.com/api/v2',
    toonVaultAddress: process.env.TOON_VAULT_ADDRESS_TESTNET || process.env.TOON_VAULT_ADDRESS || null,
    toonRegistryAddress: process.env.TOON_REGISTRY_ADDRESS_TESTNET || process.env.TOON_REGISTRY_ADDRESS || null,
  },
  mainnet: {
    tonEndpoint: process.env.TON_ENDPOINT_MAINNET || 'https://toncenter.com/api/v2/jsonRPC',
    tonApiBaseUrl: process.env.TON_API_BASE_URL_MAINNET || 'https://toncenter.com/api/v2',
    toonVaultAddress: process.env.TOON_VAULT_ADDRESS_MAINNET || process.env.TOON_VAULT_ADDRESS || null,
    toonRegistryAddress: process.env.TOON_REGISTRY_ADDRESS_MAINNET || process.env.TOON_REGISTRY_ADDRESS || null,
  },
};

function requireEnv(name) {
  const value = process.env[name];
  if (!value || !String(value).trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return String(value).trim();
}

function validateEnvironment() {
  const network = String(process.env.NETWORK || '').trim().toLowerCase();
  if (!network || !['mainnet', 'testnet'].includes(network)) {
    throw new Error('NETWORK must be set to "mainnet" or "testnet"');
  }

  const config = NETWORKS[network];
  const required = [
    ['BOT_TOKEN', () => requireEnv('BOT_TOKEN')],
    ['WALLET_MNEMONIC', () => requireEnv('WALLET_MNEMONIC')],
    ['ORACLE_SEED_HEX', () => requireEnv('ORACLE_SEED_HEX')],
    ['DEPLOYER_PRIVATE_KEY', () => requireEnv('DEPLOYER_PRIVATE_KEY')],
    ['PROTOCOL_FEE_BPS', () => requireEnv('PROTOCOL_FEE_BPS')],
    ['TON_ENDPOINT', () => config.tonEndpoint],
    ['TOON_VAULT_ADDRESS', () => config.toonVaultAddress],
    ['TOON_REGISTRY_ADDRESS', () => config.toonRegistryAddress],
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

  return { network, ...config };
}

module.exports = { validateEnvironment };
