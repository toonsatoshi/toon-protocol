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

## License

MIT
