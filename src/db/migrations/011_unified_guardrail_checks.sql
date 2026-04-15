-- Migration 011: Unified Guardrail Checks for all Intents
-- Goal: Ensure ALL intent-creating RPCs respect the emergency pause and cooldown.

-- 1. Update Tip Intent RPC
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
    -- ATOMIC GUARDRAIL CHECK
    PERFORM check_system_paused();

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

-- 2. Update Payment Intent RPC
CREATE OR REPLACE FUNCTION create_payment_intent(
    p_user_id BIGINT,
    p_source TEXT,
    p_amount_currency INT,
    p_toon_amount INT,
    p_idempotency_key TEXT,
    p_metadata JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
    v_intent_id UUID;
BEGIN
    -- ATOMIC GUARDRAIL CHECK
    PERFORM check_system_paused();

    -- Check for existing intent (idempotency)
    SELECT id INTO v_intent_id FROM payment_intents WHERE idempotency_key = p_idempotency_key;
    IF v_intent_id IS NOT NULL THEN
        RETURN v_intent_id;
    END IF;

    INSERT INTO payment_intents (user_id, source, amount_currency, toon_amount, idempotency_key, metadata)
    VALUES (p_user_id, p_source, p_amount_currency, p_toon_amount, p_idempotency_key, p_metadata)
    RETURNING id INTO v_intent_id;

    RETURN v_intent_id;
END;
$$ LANGUAGE plpgsql;
