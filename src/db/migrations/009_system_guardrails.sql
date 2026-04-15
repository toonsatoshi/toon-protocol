-- Migration 009: System Guardrails & Treasury Boundaries
-- Adds safety switches and emission limits.

-- 1. System-wide configuration and emergency switches
CREATE TABLE IF NOT EXISTS system_config (
    key   TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed defaults
INSERT INTO system_config (key, value)
VALUES ('emergency_pause', '{"active": false, "reason": null, "at": null}'::jsonb)
ON CONFLICT (key) DO NOTHING;

INSERT INTO system_config (key, value)
VALUES ('treasury_limits', '{"max_emission_per_hour": 1000, "current_hour_usage": 0, "last_hour_reset": null}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- 2. Audit Trail for Guardrail Actions
CREATE TABLE IF NOT EXISTS guardrail_events (
    id          BIGSERIAL PRIMARY KEY,
    type        TEXT NOT NULL, -- 'PAUSE', 'RESUME', 'TREASURY_LIMIT_HIT'
    reason      TEXT,
    metadata    JSONB,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Intent Trace for accountability
ALTER TABLE reward_intents ADD COLUMN IF NOT EXISTS debug_trace JSONB DEFAULT '{}'::jsonb;
ALTER TABLE tip_intents    ADD COLUMN IF NOT EXISTS debug_trace JSONB DEFAULT '{}'::jsonb;
ALTER TABLE payment_intents ADD COLUMN IF NOT EXISTS debug_trace JSONB DEFAULT '{}'::jsonb;
