-- Migration 010: Atomic Guardrail & Treasury Enforcement
-- Goal: Eliminate Race Conditions by moving checks into the same transaction as intent creation.

-- 1. Helper to Check Pause State
CREATE OR REPLACE FUNCTION check_system_paused() RETURNS VOID AS $$
DECLARE
    v_paused BOOLEAN;
    v_cooldown_until TIMESTAMPTZ;
BEGIN
    SELECT (value->>'active')::BOOLEAN, (value->>'resume_cooldown_until')::TIMESTAMPTZ 
    INTO v_paused, v_cooldown_until 
    FROM system_config 
    WHERE key = 'emergency_pause';

    IF v_paused THEN
        RAISE EXCEPTION 'SYSTEM_PAUSED' USING ERRCODE = 'P0001';
    END IF;

    IF v_cooldown_until IS NOT NULL AND v_cooldown_until > NOW() THEN
        RAISE EXCEPTION 'RESUME_COOLDOWN' USING ERRCODE = 'P0002';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 2. Helper to Check and Decrement Treasury Budget
CREATE OR REPLACE FUNCTION check_and_record_treasury_usage(p_amount INT) RETURNS VOID AS $$
DECLARE
    v_limits JSONB;
    v_usage INT;
    v_cap INT;
    v_last_reset TIMESTAMPTZ;
    v_now TIMESTAMPTZ := NOW();
BEGIN
    -- Select for update to prevent concurrent overspending
    SELECT value INTO v_limits FROM system_config WHERE key = 'treasury_limits' FOR UPDATE;
    
    v_cap := (v_limits->>'max_emission_per_hour')::INT;
    v_last_reset := (v_limits->>'last_hour_reset')::TIMESTAMPTZ;
    v_usage := (v_limits->>'current_hour_usage')::INT;

    -- Hourly reset check
    IF v_last_reset IS NULL OR date_trunc('hour', v_now) > date_trunc('hour', v_last_reset) THEN
        v_usage := 0;
    END IF;

    IF v_usage + p_amount > v_cap THEN
        RAISE EXCEPTION 'TREASURY_LIMIT_HIT' USING ERRCODE = 'P0003';
    END IF;

    -- Update limits
    UPDATE system_config 
    SET value = jsonb_set(
            jsonb_set(v_limits, '{current_hour_usage}', (v_usage + p_amount)::TEXT::JSONB),
            '{last_hour_reset}', to_jsonb(v_now::TEXT)
        ),
        updated_at = v_now
    WHERE key = 'treasury_limits';
END;
$$ LANGUAGE plpgsql;

-- 3. Updated Atomic Create Reward Intent
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
    -- 1. Atomic Safety Checks (Fails fast if paused or budget hit)
    PERFORM check_system_paused();
    PERFORM check_and_record_treasury_usage(p_amount_toon);

    -- 2. Check if achievement was already recorded (Eligibility)
    SELECT EXISTS(SELECT 1 FROM user_achievements WHERE achievement_key = p_achievement_key) INTO v_achievement_exists;
    IF v_achievement_exists THEN
        SELECT id INTO v_intent_id FROM reward_intents WHERE idempotency_key = p_idempotency_key;
        RETURN v_intent_id;
    END IF;

    -- 3. Record Achievement
    INSERT INTO user_achievements (user_id, achievement_key)
    VALUES (p_user_id, p_achievement_key)
    ON CONFLICT (achievement_key) DO NOTHING;
    
    IF NOT FOUND THEN
        SELECT id INTO v_intent_id FROM reward_intents WHERE idempotency_key = p_idempotency_key;
        RETURN v_intent_id;
    END IF;

    -- 4. Create Intent with Trace
    INSERT INTO reward_intents (user_id, reward_type, reference_id, amount_toon, idempotency_key, debug_trace)
    VALUES (p_user_id, p_reward_type, p_reference_id, p_amount_toon, p_idempotency_key, p_debug_trace)
    RETURNING id INTO v_intent_id;

    RETURN v_intent_id;
END;
$$ LANGUAGE plpgsql;
