-- Migration 013: Reconciler Shadow Balance & Cursor
-- Goal: Fix Bug 2 (Drift Detection) and New Issue B (Persistent Cursor).

-- 1. Persistent Cursor
INSERT INTO system_config (key, value)
VALUES ('reconciler_cursor', '{"last_lt": "0"}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- 2. Shadow Balance to track "Expected" vs "Actual"
-- This allows us to detect drift incrementally without full-table scans.
ALTER TABLE users ADD COLUMN IF NOT EXISTS expected_toon_balance BIGINT DEFAULT 0;

-- 2b. Event Deduplication Table (Adversarial Fix)
CREATE TABLE IF NOT EXISTS processed_events (
    tx_hash     TEXT PRIMARY KEY,
    processed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Atomic Delta Application & Drift Detection
CREATE OR REPLACE FUNCTION apply_reconciler_delta(
    p_user_id BIGINT,
    p_delta BIGINT,
    p_tx_hash TEXT,
    p_drift_threshold BIGINT DEFAULT 0
) RETURNS JSONB AS $$
DECLARE
    v_actual BIGINT;
    v_expected BIGINT;
    v_new_expected BIGINT;
    v_drift BIGINT;
    v_already_processed BOOLEAN;
BEGIN
    -- 0. Idempotency Check (Adversarial Fix)
    SELECT EXISTS(SELECT 1 FROM processed_events WHERE tx_hash = p_tx_hash) INTO v_already_processed;
    IF v_already_processed THEN
        RETURN jsonb_build_object('success', true, 'skipped', true, 'reason', 'ALREADY_PROCESSED');
    END IF;

    -- 1. Lock user row
    SELECT toon_balance, expected_toon_balance 
    INTO v_actual, v_expected 
    FROM users 
    WHERE telegram_id = p_user_id 
    FOR UPDATE;

    IF v_actual IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'USER_NOT_FOUND');
    END IF;

    -- 2. Update expected balance
    v_new_expected := v_expected + p_delta;
    
    UPDATE users 
    SET expected_toon_balance = v_new_expected 
    WHERE telegram_id = p_user_id;

    -- 2b. Mark event as processed
    INSERT INTO processed_events (tx_hash) VALUES (p_tx_hash);

    -- 3. Compare with actual
    v_drift := ABS(v_actual - v_new_expected);

    IF v_drift > p_drift_threshold THEN
        RETURN jsonb_build_object(
            'success', false, 
            'error', 'RECONCILIATION_DRIFT',
            'userId', p_user_id,
            'expected', v_new_expected,
            'actual', v_actual,
            'drift', v_drift
        );
    END IF;

    RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql;
