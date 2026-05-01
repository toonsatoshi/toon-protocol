# ToonBot Contracts

This repository contains the smart contracts and bot logic for the Toon Protocol.

## Project Structure

- `contracts/`: Tact smart contracts.
- `src/bot/`: Bot implementation logic.
- `tests/`: Test suites for the contracts.
- `scripts/`: Deployment and interaction scripts.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Compile contracts:
   ```bash
   npx tact --config tact.config.json
   ```
3. Run tests:
   ```bash
   npm test
   ```
4. Run mainnet readiness checks:
   ```bash
   npm run check:mainnet
   ```

## Network Configuration

The bot now requires explicit network-specific runtime configuration via environment variables. Set `NETWORK` to `mainnet` or `testnet`, then provide corresponding values:

- `TON_ENDPOINT_MAINNET` / `TON_ENDPOINT_TESTNET`
- `TON_API_BASE_URL_MAINNET` / `TON_API_BASE_URL_TESTNET`
- `TOON_VAULT_ADDRESS_MAINNET` / `TOON_VAULT_ADDRESS_TESTNET`
- `TOON_REGISTRY_ADDRESS_MAINNET` / `TOON_REGISTRY_ADDRESS_TESTNET`
- `TONCONNECT_MANIFEST_URL_MAINNET` / `TONCONNECT_MANIFEST_URL_TESTNET`
- `TONCONNECT_BRIDGE_URL_MAINNET` / `TONCONNECT_BRIDGE_URL_TESTNET`
- `TONCONNECT_UNIVERSAL_LINK_MAINNET` / `TONCONNECT_UNIVERSAL_LINK_TESTNET`
- `TRACK_BASE_URL_MAINNET` / `TRACK_BASE_URL_TESTNET`
- `ARTIST_BASE_URL_MAINNET` / `ARTIST_BASE_URL_TESTNET`
- Optional explorer IDs: `EXPLORER_NETWORK_ID_MAINNET` / `EXPLORER_NETWORK_ID_TESTNET`

You can also use shared fallback variables (without `_MAINNET`/`_TESTNET`) for some values, but per-network values are recommended.

## License

MIT
