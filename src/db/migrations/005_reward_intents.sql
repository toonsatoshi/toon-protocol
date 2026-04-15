-- Migration 005: Reward Intents & Deterministic Issuance
-- Enforces: Idempotency, Eligibility, and Atomic Payouts.

-- 1. Reward Intents Table
CREATE TABLE IF NOT EXISTS reward_intents (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         BIGINT NOT NULL,
    reward_type     TEXT NOT NULL CHECK (reward_type IN ('milestone', 'referral', 'streak')),
    reference_id    TEXT NOT NULL, -- track_id, referred_user_id, etc.
    amount_toon     INT NOT NULL,
    status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
    idempotency_key TEXT UNIQUE NOT NULL, -- E.g., 'milestone:123:track_456:5'
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Unique Achievement Tracking (The Source of Truth)
-- This prevents the system from even creating a second intent for the same achievement.
CREATE TABLE IF NOT EXISTS user_achievements (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL,
    achievement_key TEXT UNIQUE NOT NULL, -- E.g., 'milestone:track_456:5_listeners'
    earned_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create Reward Intent RPC
CREATE OR REPLACE FUNCTION create_reward_intent(
    p_user_id BIGINT,
    p_reward_type TEXT,
    p_reference_id TEXT,
    p_amount_toon INT,
    p_idempotency_key TEXT,
    p_achievement_key TEXT
) RETURNS UUID AS $$
DECLARE
    v_intent_id UUID;
    v_achievement_exists BOOLEAN;
BEGIN
    -- 1. Check if achievement was already recorded
    SELECT EXISTS(SELECT 1 FROM user_achievements WHERE achievement_key = p_achievement_key) INTO v_achievement_exists;
    IF v_achievement_exists THEN
        -- Check if an intent already exists for this (idempotency)
        SELECT id INTO v_intent_id FROM reward_intents WHERE idempotency_key = p_idempotency_key;
        RETURN v_intent_id; -- Could be NULL if achievement was manually recorded but no intent created
    END IF;

    -- 2. Record Achievement (Atomic check)
    INSERT INTO user_achievements (user_id, achievement_key)
    VALUES (p_user_id, p_achievement_key)
    ON CONFLICT (achievement_key) DO NOTHING;
    
    -- If we failed to insert, it means someone else just did it
    IF NOT FOUND THEN
        SELECT id INTO v_intent_id FROM reward_intents WHERE idempotency_key = p_idempotency_key;
        RETURN v_intent_id;
    END IF;

    -- 3. Create Intent
    INSERT INTO reward_intents (user_id, reward_type, reference_id, amount_toon, idempotency_key)
    VALUES (p_user_id, p_reward_type, p_reference_id, p_amount_toon, p_idempotency_key)
    RETURNING id INTO v_intent_id;

    RETURN v_intent_id;
END;
$$ LANGUAGE plpgsql;

-- 4. Finalize Reward RPC (Atomic)
CREATE OR REPLACE FUNCTION finalize_reward(
    p_intent_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
    v_user_id BIGINT;
    v_amount INT;
    v_status TEXT;
BEGIN
    -- 1. Lock and check
    SELECT user_id, amount_toon, status INTO v_user_id, v_amount, v_status 
    FROM reward_intents 
    WHERE id = p_intent_id 
    FOR UPDATE;

    IF v_user_id IS NULL OR v_status = 'confirmed' THEN
        RETURN FALSE;
    END IF;

    -- 2. Update Status
    UPDATE reward_intents 
    SET status = 'confirmed', 
        updated_at = NOW()
    WHERE id = p_intent_id;

    -- 3. Update Balance
    UPDATE users 
    SET toon_balance = COALESCE(toon_balance, 0) + v_amount
    WHERE telegram_id = v_user_id;

    -- 4. Increment Reputation
    UPDATE users
    SET reputation = COALESCE(reputation, 0) + 10 -- Milestone/Referral bonus
    WHERE telegram_id = v_user_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
