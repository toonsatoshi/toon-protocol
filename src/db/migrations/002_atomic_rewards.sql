-- Migration 002: Atomic state & reward safety
-- Idempotent: safe to re-run.

-- 1. Create reward_history table for idempotency
CREATE TABLE IF NOT EXISTS reward_history (
    id          BIGSERIAL PRIMARY KEY,
    telegram_id BIGINT NOT NULL,
    reward_id   TEXT NOT NULL UNIQUE, -- E.g., 'milestone_5_listeners_track_123'
    amount      INT NOT NULL,
    paid_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Atomic reward increment function
CREATE OR REPLACE FUNCTION increment_toon_balance(
    p_telegram_id BIGINT,
    p_amount INT,
    p_reward_id TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    v_already_paid BOOLEAN;
BEGIN
    -- Check if this specific reward has already been paid (idempotency)
    SELECT EXISTS(SELECT 1 FROM reward_history WHERE reward_id = p_reward_id) INTO v_already_paid;
    
    IF v_already_paid THEN
        RETURN FALSE;
    END IF;

    -- Update user balance
    UPDATE users 
    SET toon_balance = COALESCE(toon_balance, 0) + p_amount 
    WHERE telegram_id = p_telegram_id;

    -- Record in history
    INSERT INTO reward_history (telegram_id, reward_id, amount, paid_at)
    VALUES (p_telegram_id, p_reward_id, p_amount, NOW());

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 3. Atomic play & milestone check function
CREATE OR REPLACE FUNCTION record_play_and_check_milestone(
    p_track_id TEXT,
    p_listener_id BIGINT,
    p_milestone_threshold INT DEFAULT 5
) RETURNS TABLE (
    new_plays INT,
    new_unique_listeners INT,
    milestone_reached BOOLEAN,
    artist_id BIGINT,
    artist_name TEXT
) AS $$
DECLARE
    v_artist_id BIGINT;
    v_artist_name TEXT;
    v_unique_count INT;
    v_milestone_already_reached BOOLEAN;
BEGIN
    -- 1. Get track info
    SELECT artist_id, artist_name INTO v_artist_id, v_artist_name 
    FROM tracks WHERE id = p_track_id;

    IF v_artist_id IS NULL THEN
        RETURN;
    END IF;

    -- 2. Increment plays
    UPDATE tracks SET plays = plays + 1 WHERE id = p_track_id;

    -- 3. Record unique listener (idempotent upsert)
    INSERT INTO track_listeners (track_id, telegram_id)
    VALUES (p_track_id, p_listener_id)
    ON CONFLICT (track_id, telegram_id) DO NOTHING;

    -- 4. Get latest counts
    SELECT plays, unique_listeners INTO new_plays, new_unique_listeners 
    FROM tracks WHERE id = p_track_id;

    -- Re-calculate unique count if needed (optional optimization, but let's be accurate)
    SELECT COUNT(*) INTO v_unique_count FROM track_listeners WHERE track_id = p_track_id;
    UPDATE tracks SET unique_listeners = v_unique_count WHERE id = p_track_id;
    new_unique_listeners := v_unique_count;

    -- 5. Check milestone
    milestone_reached := (new_unique_listeners >= p_milestone_threshold);
    
    -- Check if this milestone reward was already paid
    SELECT EXISTS(
        SELECT 1 FROM reward_history 
        WHERE reward_id = 'milestone_' || p_milestone_threshold || '_listeners_' || p_track_id
    ) INTO v_already_paid;
    
    milestone_reached := milestone_reached AND NOT v_already_paid;
    artist_id := v_artist_id;
    artist_name := v_artist_name;

    RETURN NEXT;
END;
$$ LANGUAGE plpgsql;
