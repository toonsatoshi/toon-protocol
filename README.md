# Toon Protocol — Smart Contracts

> ⚠️ **Development Status**: Toon is currently in active development. All contracts and tokens are currently deployed on the **TON Testnet** only. 
> 
> 🎁 **Early Adopters**: Early users participating in the testnet will be rewarded. All **Testnet $TOON** earned during this phase will be **redeemable 1:1** for real Mainnet $TOON upon official launch.

Decentralized music platform on TON blockchain. All contracts written in Tact v1.6.

## Contracts

| Contract | Purpose |
|---|---|
| `toon_jetton_master.tact` | $TOON token (TEP-74 Jetton + TEP-64 metadata) |
| `toon_vault.tact` | Reward engine — daily emission cap, halving mechanic |
| `toon_registry.tact` | Global index of all artists and tracks |
| `toon_artist.tact` | On-chain artist identity, reputation, staking |
| `toon_track.tact` | Per-song NFT with fingerprint hash, tip-to-earn |
| `toon_tip.tact` | Split tipping + group tip pools |
| `toon_fan.tact` | Fan tokens per artist community |
| `toon_drop.tact` | RWA fractional royalty offerings |
| `toon_governance.tact` | $TOON voting on protocol parameters |

## Deployed (Testnet)

| Contract | Address |
|---|---|
| MusicNft (genesis) | `EQDuvlwNaE0FsYbpqc9ndQ7ZohwzNx5tg0Uqbl7AuQR4U_2Q` |
| ToonRegistry | `EQBBMhyv8xZDs06bHFMrkSbPmYG_kpDGwcU7igzcLslolruj` |
| ToonVault | `EQCzrg1AV_okCWLe6n0J4KQX1Af5HCgV65j7k2-O6Yl3Tz6N` |
| ToonTip | `EQAg5uf01-Jva3lUwcDkVIeaI8Yp4ioylWvziHJw_IQzealU` |
| ToonGovernance | `EQByvlBuigXPaIwmoUpA334CoBbF3bqi57dWADmGSHXhw8SQ` |
| $TOON / ToonJettonMaster | `EQCiETxRxLgjpM50n8YcpUaBhJqnq0SFwZLlhBWs4-_wZVkQ` |

## Build

```bash
npm install
npm run build:all
```

## Deploy

```bash
# Deploy $TOON token + vault (auto-rotates mintAuthority to vault)
npm run deploy:token

# Deploy registry
npm run deploy:registry
```

## Metadata

After GitHub is live, update `metadata/toon-token.json` URL in `scripts/deployToonToken.ts`
and call `UpdateMetadata` on the deployed JettonMaster contract.

The metadata JSON is at `metadata/toon-token.json`.
Logo: https://i.imgur.com/rCzW5A4.png — host on IPFS before mainnet.

## Key Design Notes

- **Plays = reputation only** — zero $TOON emission, prevents farming
- **First track = no stake required** — bootstrap path, stake required for track 2+
- **ToonVault holds mint authority** — all $TOON flows through the vault
- **Daily emission cap + halving** — inflation-resistant token economics
- **7-day wallet age minimum** — Sybil circuit breaker on reward claims

## Roadmap & Implementation Status

| Feature | Status | Details |
|---|---|---|
| Ed25519 Oracle Rewards | **Implemented** | Hardened with signed payloads, claim IDs, and expiry. |
| Dynamic Emission Feedback | **Implemented** | Rewards automatically scale based on daily claim volume. |
| Anti-Sybil Pairing Decay | **Implemented** | Multi-user interaction uniqueness weighted on-chain. |
| Music NFT Minting | **Implemented** | Verifiable on-chain track ownership. |
| Governance Voting | **Implemented** | $TOON holders can vote on protocol parameters (Emission Cap, etc). |
| TonConnect 2.0 | **Implemented** | Fully integrated for all on-chain actions. |
| Buy $TOON (Stars/Fiat) | **Mocked** | Payments are real, but token transfers are currently simulated in DB. |
| Anti-Farming Cooldowns | **Implemented** | Both bot-layer and contract-layer burst protection. |
| Toon Mini App | **Planned** | Transitioning from Bot to full Web3 UI. |
| Mainnet Migration | **Planned** | Post-audit and testnet stabilization. |
