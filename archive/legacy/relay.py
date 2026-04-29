"""
relay.py — Signs meta-transaction intents for ToonMetaTxRelayer.

The signature scheme matches the Tact contract:
  cell hash = sha256( relayer_addr | user_addr | nonce | deadline | target | body_ref )
The Ed25519 signing key is the relayer hot-wallet private key.
"""
import base64
import os

import nacl.signing
from pytoniq_core import Address, Builder  # pytoniq >= 0.1.10

RELAYER_ADDR = os.getenv("RELAYER_ADDR", "")


def sign_intent(
    user_addr: str,
    nonce: int,
    deadline: int,
    target: str,
    body_boc: bytes,
    private_key_hex: str,
) -> str:
    """
    Build and sign the meta-tx intent cell.
    Returns a base64-encoded 64-byte Ed25519 signature.

    Raises ValueError if RELAYER_ADDR is not configured.
    """
    if not RELAYER_ADDR:
        raise ValueError("RELAYER_ADDR environment variable is not set")

    body_cell = Builder().store_bytes(body_boc).end_cell()

    cell = (
        Builder()
        .store_address(Address(RELAYER_ADDR))
        .store_address(Address(user_addr))
        .store_uint(nonce,    64)
        .store_uint(deadline, 64)
        .store_address(Address(target))
        .store_ref(body_cell)
        .end_cell()
    )

    cell_hash: bytes = cell.hash
    signing_key = nacl.signing.SigningKey(bytes.fromhex(private_key_hex))
    signed = signing_key.sign(cell_hash)
    return base64.b64encode(signed.signature).decode()
