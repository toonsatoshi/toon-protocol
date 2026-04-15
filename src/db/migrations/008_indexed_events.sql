-- Migration 008: Indexed Events Log
-- Stores the authoritative on-chain event stream for reconciliation.

CREATE TABLE IF NOT EXISTS indexed_events (
    id              BIGSERIAL PRIMARY KEY,
    tx_hash         TEXT NOT NULL,
    lt              BIGINT NOT NULL,
    event_type      TEXT NOT NULL,
    contract_addr   TEXT NOT NULL,
    data            JSONB NOT NULL,
    timestamp       TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure we don't index the same event twice (idempotency)
    UNIQUE(tx_hash, lt, event_type)
);

CREATE INDEX IF NOT EXISTS idx_indexed_events_type ON indexed_events (event_type);
CREATE INDEX IF NOT EXISTS idx_indexed_events_lt ON indexed_events (lt);
