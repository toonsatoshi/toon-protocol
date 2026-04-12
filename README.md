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
| MusicNft (genesis) | `EQAIeBoceFVe3YIDBgyRpvw781c9DemRz7ugOdFWzhPHqMqG` |
| ToonRegistry | `EQCCpa_PD5dvLLfQ0mVQZL3eXBi3kpqHBXKjNtsFpWUJmUJz` |
| ToonVault | `EQBnWxnXhusmO7RRY15TV-TvAb5bW68CiP2nS_xhEqzl6EFm` |
| ToonTip | `EQB6QBKUGHBtu0nqWiaLVfNXSm9sDWTOt_zH_iYFiTu-O8Q_` |
| ToonGovernance | `EQDSeY24XQT4EgHvPTbQ1JZz0U-NgpEV6y6Eza9uP7iEJfGp` |
| $TOON / ToonJettonMaster | `EQB2bHVyNiuYB467DRzKI_MSA-Z3XDGsjw-SREE7isBm6Rvt` |

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
