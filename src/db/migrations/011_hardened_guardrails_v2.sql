-- Migration 011 (v2): Hardened Guardrails & Gradual Re-enablement
-- Goal: Fixes Bug 1 (Treasury order), Issue 5 (Interstitial state), and Bug 3 (Policy alignment).

-- 1. Redefine check_system_paused with risk levels (0 = Low, 1 = High)
CREATE OR REPLACE FUNCTION check_system_paused(p_risk_level INT DEFAULT 1) RETURNS VOID AS $$
DECLARE
    v_paused BOOLEAN;
    v_cooldown_until TIMESTAMPTZ;
BEGIN
    SELECT (value->>'active')::BOOLEAN, (value->>'resume_cooldown_until')::TIMESTAMPTZ 
    INTO v_paused, v_cooldown_until 
    FROM system_config 
    WHERE key = 'emergency_pause';

    -- Absolute Pause
    IF v_paused THEN
        RAISE EXCEPTION 'SYSTEM_PAUSED' USING ERRCODE = 'P0001';
    END IF;

    -- Gradual Cooldown Enforcement (High risk blocked during cooldown)
    IF v_cooldown_until IS NOT NULL AND v_cooldown_until > NOW() THEN
        IF p_risk_level >= 1 THEN
            RAISE EXCEPTION 'RESUME_COOLDOWN' USING ERRCODE = 'P0002';
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 2. Corrected Atomic Reward Intent (BUG 1 FIX: Order check_and_record_treasury_usage)
CREATE OR REPLACE FUNCTION create_reward_intent_atomic(
    p_user_id BIGINT,
    p_reward_type TEXT,
    p_reference_id TEXT,
    p_amount_toon INT,
    p_idempotency_key TEXT,
    p_achievement_key TEXT,
    p_debug_trace JSONB DEFAULT '{}'::jsonb
) RETURNS UUID AS $$
DECLARE
    v_intent_id UUID;
    v_achievement_exists BOOLEAN;
BEGIN
    -- 1. Absolute safety check (HIGH RISK = 1)
    PERFORM check_system_paused(1);

    -- 2. Idempotency/Eligibility FIRST (BUG 1 FIX: Don't deduct budget if already done)
    SELECT EXISTS(SELECT 1 FROM user_achievements WHERE achievement_key = p_achievement_key) INTO v_achievement_exists;
    IF v_achievement_exists THEN
        SELECT id INTO v_intent_id FROM reward_intents WHERE idempotency_key = p_idempotency_key;
        RETURN v_intent_id;
    END IF;

    -- 3. Treasury check + deduction (Only if we are actually proceeding)
    PERFORM check_and_record_treasury_usage(p_amount_toon);

    -- 4. Record Achievement
    INSERT INTO user_achievements (user_id, achievement_key)
    VALUES (p_user_id, p_achievement_key)
    ON CONFLICT (achievement_key) DO NOTHING;
    
    IF NOT FOUND THEN
        -- This shouldn't happen due to transaction isolation but safe to handle
        SELECT id INTO v_intent_id FROM reward_intents WHERE idempotency_key = p_idempotency_key;
        RETURN v_intent_id;
    END IF;

    -- 5. Create Intent
    INSERT INTO reward_intents (user_id, reward_type, reference_id, amount_toon, idempotency_key, debug_trace)
    VALUES (p_user_id, p_reward_type, p_reference_id, p_amount_toon, p_idempotency_key, p_debug_trace)
    RETURNING id INTO v_intent_id;

    RETURN v_intent_id;
END;
$$ LANGUAGE plpgsql;

-- 3. Corrected Tip Intent (LOW RISK = 0)
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
    PERFORM check_system_paused(0);

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

-- 4. Corrected Payment Intent (LOW RISK = 0)
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
    PERFORM check_system_paused(0);

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
