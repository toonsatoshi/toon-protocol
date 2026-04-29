"""
contracts.py — Async TonCenter RPC calls for ToonPlayerBot on-chain contracts.
Uses the JSON-RPC endpoint; swap for LiteClient in production for
trustlessness (LiteClient verifies Merkle proofs; TonCenter does not).
"""
import asyncio
import logging
import os
from typing import Any

import aiohttp

log = logging.getLogger(__name__)

ENDPOINT  = os.getenv("TON_ENDPOINT_1") or os.getenv("TON_ENDPOINT") or "https://toncenter.com/api/v2/jsonRPC"
API_KEY   = os.getenv("TONCENTER_API_KEY", "")

# ToonPlayerBot contract addresses loaded from env
CONTRACT_ADDRS = {
    "oracle":           os.getenv("ORACLE_ADDR",          ""),
    "treasury":         os.getenv("TREASURY_ADDR",        ""),
    "jetton_master":    os.getenv("JETTON_MASTER_ADDR",   ""),
    "registry":         os.getenv("REGISTRY_ADDR",        ""),
    "governance":       os.getenv("GOVERNANCE_ADDR",      ""),
    "vault":            os.getenv("VAULT_ADDR",           ""),
    "amm_pool":         os.getenv("AMM_POOL_ADDR",        ""),
    "gas_station":      os.getenv("GAS_STATION_ADDR",     ""),
    "relayer":          os.getenv("RELAYER_ADDR",         ""),
    "batch_claim":      os.getenv("BATCH_CLAIM_ADDR",     ""),
    "tip":              os.getenv("TIP_ADDR",             ""),
    "treasury_router":  os.getenv("TREASURY_ROUTER_ADDR", ""),
    "drop":             os.getenv("DROP_ADDR",            ""),
}

def _headers() -> dict:
    h = {"Content-Type": "application/json"}
    if API_KEY:
        h["X-API-Key"] = API_KEY
    return h

async def run_get_method(
    address: str,
    method: str,
    stack: list[Any] | None = None,
    *,
    timeout: float = 10.0,
) -> Any | None:
    """
    Call a get-method on a TON contract via TonCenter JSON-RPC.
    Returns the parsed result stack or None on failure.
    """
    payload = {
        "id":      "1",
        "jsonrpc": "2.0",
        "method":  "runGetMethod",
        "params":  {
            "address": address,
            "method":  method,
            "stack":   stack or [],
        },
    }
    try:
        async with aiohttp.ClientSession(headers=_headers()) as session:
            async with session.post(
                ENDPOINT, json=payload, timeout=aiohttp.ClientTimeout(total=timeout)
            ) as resp:
                resp.raise_for_status()
                data = await resp.json()
                if "result" in data:
                    return data["result"]
                log.warning("RPC error for %s.%s: %s", address, method, data.get("error"))
    except Exception as exc:
        log.error("run_get_method failed for %s.%s: %s", address, method, exc)
    return None

async def get_claimable(drop_addr: str, holder_addr: str) -> int:
    """Query ToonDrop.get_claimable for a given holder address."""
    result = await run_get_method(
        drop_addr, "get_claimable",
        [["tvm.Slice", holder_addr]]
    )
    if result and result.get("stack"):
        try:
            return int(result["stack"][0][1], 16)
        except (IndexError, ValueError, TypeError):
            pass
    return 0

async def get_oracle_price(oracle_addr: str | None = None) -> int | None:
    """Query ToonOracle for the latest TOON/TON price."""
    addr = oracle_addr or CONTRACT_ADDRS["oracle"]
    if not addr:
        return None
    result = await run_get_method(addr, "get_price")
    if result and result.get("stack"):
        try:
            return int(result["stack"][0][1], 16)
        except (IndexError, ValueError, TypeError):
            pass
    return None

async def get_wallet_address(master_addr: str, owner_addr: str) -> str | None:
    """Query JettonMaster for the wallet address of a given owner."""
    result = await run_get_method(
        master_addr, "get_wallet_address",
        [["tvm.Slice", owner_addr]]
    )
    if result and result.get("stack"):
        try:
            return result["stack"][0][1].get("address") or result["stack"][0][1]
        except (IndexError, AttributeError):
            pass
    return None

async def get_jetton_balance(wallet_addr: str) -> int:
    """Query JettonWallet for its balance."""
    result = await run_get_method(wallet_addr, "get_wallet_data")
    if result and result.get("stack"):
        try:
            return int(result["stack"][0][1], 16)
        except (IndexError, ValueError, TypeError):
            pass
    return 0

async def get_governance_count(gov_addr: str | None = None) -> int:
    """Query ToonGovernance for the total number of proposals."""
    addr = gov_addr or CONTRACT_ADDRS["governance"]
    if not addr: return 0
    result = await run_get_method(addr, "get_count")
    if result and result.get("stack"):
        try:
            return int(result["stack"][0][1], 16)
        except (IndexError, ValueError, TypeError):
            pass
    return 0

async def get_proposal(proposal_id: int, gov_addr: str | None = None) -> dict | None:
    """Query ToonGovernance for a specific proposal's details."""
    addr = gov_addr or CONTRACT_ADDRS["governance"]
    if not addr: return None
    result = await run_get_method(addr, "get_proposal", [["num", str(proposal_id)]])
    if result and result.get("stack"):
        try:
            # Tact returns structs as a list of values
            # Proposal { description, yesVotes, noVotes, deadline, executed }
            p = result["stack"][0][1]["elements"]
            return {
                "description": bytes.fromhex(p[0][1]["bytes"]).decode("utf-16"), # Tact strings are utf-16? Check encoding.
                "yesVotes":    int(p[1][1], 16),
                "noVotes":     int(p[2][1], 16),
                "deadline":    int(p[3][1], 16),
                "executed":    p[4][1] == "0xFFFF"
            }
        except (IndexError, ValueError, TypeError, KeyError):
            pass
    return None

async def get_drop_stats(drop_addr: str | None = None) -> dict:
    """Query ToonDrop for total revenue and shares."""
    addr = drop_addr or CONTRACT_ADDRS["drop"]
    if not addr: return {"revenue": 0, "shares": 0}
    
    rev = await run_get_method(addr, "get_total_revenue")
    sh  = await run_get_method(addr, "get_total_shares")
    
    try:
        revenue = int(rev["stack"][0][1], 16) if rev else 0
        shares  = int(sh["stack"][0][1], 16) if sh else 0
        return {"revenue": revenue, "shares": shares}
    except:
        return {"revenue": 0, "shares": 0}

async def get_registry_total(reg_addr: str | None = None) -> int:
    """Query ToonRegistry for total registered artists."""
    addr = reg_addr or CONTRACT_ADDRS["registry"]
    if not addr: return 0
    result = await run_get_method(addr, "get_total")
    if result and result.get("stack"):
        try:
            return int(result["stack"][0][1], 16)
        except:
            pass
    return 0

async def get_amm_reserves(amm_addr: str | None = None) -> dict:
    """Query ToonAMMPool for token reserves."""
    addr = amm_addr or CONTRACT_ADDRS["amm_pool"]
    if not addr: return {"reserve0": 0, "reserve1": 0}
    result = await run_get_method(addr, "get_reserves")
    if result and result.get("stack"):
        try:
            r = result["stack"][0][1]["elements"]
            return {"reserve0": int(r[0][1], 16), "reserve1": int(r[1][1], 16)}
        except:
            pass
    return {"reserve0": 0, "reserve1": 0}

