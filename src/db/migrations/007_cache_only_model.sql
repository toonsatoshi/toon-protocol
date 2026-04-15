-- Migration 007: Move to Derived Cache Model
-- Removes direct balance manipulation from the finalization RPCs.
-- The database balance is now only updated by an Indexer/Reconciliation script
-- based on the PROOFS (tx_hash, external_id) stored in finalized intents.

-- 1. Redefine finalize_reward (Removes toon_balance update)
CREATE OR REPLACE FUNCTION finalize_reward(
    p_intent_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
    v_user_id BIGINT;
    v_status TEXT;
BEGIN
    -- 1. Lock and check
    SELECT user_id, status INTO v_user_id, v_status 
    FROM reward_intents 
    WHERE id = p_intent_id 
    FOR UPDATE;

    IF v_user_id IS NULL OR v_status = 'confirmed' THEN
        RETURN FALSE;
    END IF;

    -- 2. Update Status Only (Mark as ready for indexer)
    UPDATE reward_intents 
    SET status = 'confirmed', 
        updated_at = NOW()
    WHERE id = p_intent_id;

    -- Note: We no longer update users.toon_balance here.
    -- The Indexer will update the balance once it verifies this intent.
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 2. Redefine finalize_payment (Removes toon_balance update)
CREATE OR REPLACE FUNCTION finalize_payment(
    p_intent_id UUID,
    p_external_id TEXT,
    p_metadata JSONB DEFAULT '{}'
) RETURNS BOOLEAN AS $$
DECLARE
    v_user_id BIGINT;
    v_status TEXT;
    v_already_processed BOOLEAN;
BEGIN
    -- 1. Check if external_id was already used
    SELECT EXISTS(SELECT 1 FROM payment_intents WHERE external_id = p_external_id AND status = 'confirmed') INTO v_already_processed;
    IF v_already_processed THEN
        RETURN FALSE;
    END IF;

    -- 2. Lock and check intent
    SELECT user_id, status INTO v_user_id, v_status 
    FROM payment_intents 
    WHERE id = p_intent_id 
    FOR UPDATE;

    IF v_user_id IS NULL OR v_status = 'confirmed' THEN
        RETURN FALSE;
    END IF;

    -- 3. Update Status and store external_id (Proof)
    UPDATE payment_intents 
    SET status = 'confirmed', 
        external_id = p_external_id,
        metadata = payment_intents.metadata || p_metadata,
        updated_at = NOW()
    WHERE id = p_intent_id;

    -- Note: Balance is NOT updated. Indexer handles it.
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 3. Redefine finalize_tip (Removes toon_balance/stats update)
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
        RETURN FALSE;
    END IF;

    -- 2. Update Intent (Mark as confirmed on-chain)
    UPDATE tip_intents 
    SET status = 'confirmed', 
        tx_hash = p_tx_hash,
        updated_at = NOW()
    WHERE id = p_intent_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
