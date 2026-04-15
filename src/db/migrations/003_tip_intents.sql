-- Migration 003: Tipping Intents & Atomic Settlement
-- Enforces: Idempotency, Traceability, and Async Safety.

-- 1. Tipping Intents Table
CREATE TABLE IF NOT EXISTS tip_intents (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipper_id       BIGINT NOT NULL,
    artist_id       BIGINT NOT NULL,
    track_id        TEXT NOT NULL,
    amount_ton      NUMERIC NOT NULL,
    method          TEXT NOT NULL CHECK (method IN ('stars', 'ton', 'fiat')),
    status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'confirmed', 'failed')),
    tx_hash         TEXT UNIQUE, -- The TON transaction hash (once submitted/confirmed)
    idempotency_key TEXT UNIQUE NOT NULL, -- Prevents duplicate intents for the same action
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create Tip Intent RPC
CREATE OR REPLACE FUNCTION create_tip_intent(
    p_tipper_id BIGINT,
    p_artist_id BIGINT,
    p_track_id TEXT,
    p_amount_ton NUMERIC,
    p_method TEXT,
    p_idempotency_key TEXT
) RETURNS UUID AS $$
DECLARE
    v_intent_id UUID;
BEGIN
    -- Return existing intent if idempotency key matches
    SELECT id INTO v_intent_id FROM tip_intents WHERE idempotency_key = p_idempotency_key;
    IF v_intent_id IS NOT NULL THEN
        RETURN v_intent_id;
    END IF;

    INSERT INTO tip_intents (tipper_id, artist_id, track_id, amount_ton, method, idempotency_key)
    VALUES (p_tipper_id, p_artist_id, p_track_id, p_amount_ton, p_method, p_idempotency_key)
    RETURNING id INTO v_intent_id;

    RETURN v_intent_id;
END;
$$ LANGUAGE plpgsql;

-- 3. Finalize Tip RPC (Atomic)
-- Marks intent as confirmed and updates user stats in one transaction.
CREATE OR REPLACE FUNCTION finalize_tip(
    p_intent_id UUID,
    p_tx_hash TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    v_tipper_id BIGINT;
    v_status TEXT;
BEGIN
    -- 1. Lock and check intent
    SELECT tipper_id, status INTO v_tipper_id, v_status 
    FROM tip_intents 
    WHERE id = p_intent_id 
    FOR UPDATE;

    IF v_tipper_id IS NULL OR v_status = 'confirmed' THEN
        RETURN FALSE; -- Already confirmed or doesn't exist
    END IF;

    -- 2. Update Intent
    UPDATE tip_intents 
    SET status = 'confirmed', 
        tx_hash = p_tx_hash,
        updated_at = NOW()
    WHERE id = p_intent_id;

    -- 3. Update Tipper Stats (Atomic)
    UPDATE users 
    SET tips_sent = COALESCE(tips_sent, 0) + 1
    WHERE telegram_id = v_tipper_id;

    -- 4. Record Reputation (Optional/Future: +5 reputation to tipper)
    UPDATE users
    SET reputation = COALESCE(reputation, 0) + 5
    WHERE telegram_id = v_tipper_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
