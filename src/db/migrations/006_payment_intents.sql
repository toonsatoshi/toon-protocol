-- Migration 006: Unified Payment Intents (Stars & Fiat)
-- Enforces: Idempotency, Source Verification, and Atomic Balance Updates.

-- 1. Payment Intents Table
CREATE TABLE IF NOT EXISTS payment_intents (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         BIGINT NOT NULL,
    source          TEXT NOT NULL CHECK (source IN ('stars', 'fiat')),
    external_id     TEXT UNIQUE, -- Telegram charge_id or Stripe payment_intent_id
    amount_currency INT NOT NULL, -- Amount in the source's smallest unit (e.g., 50 Stars)
    toon_amount     INT NOT NULL, -- Amount of $TOON to credit
    status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
    idempotency_key TEXT UNIQUE NOT NULL, -- E.g., 'stars:user_123:timestamp'
    metadata        JSONB, -- Store original webhook/payload data for auditing
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create Payment Intent RPC
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

-- 3. Finalize External Payment RPC (Atomic)
CREATE OR REPLACE FUNCTION finalize_payment(
    p_intent_id UUID,
    p_external_id TEXT,
    p_metadata JSONB DEFAULT '{}'
) RETURNS BOOLEAN AS $$
DECLARE
    v_user_id BIGINT;
    v_toon_amount INT;
    v_status TEXT;
    v_already_processed BOOLEAN;
BEGIN
    -- 1. Check if external_id was already used (Idempotency across intents)
    SELECT EXISTS(SELECT 1 FROM payment_intents WHERE external_id = p_external_id AND status = 'confirmed') INTO v_already_processed;
    IF v_already_processed THEN
        RETURN FALSE;
    END IF;

    -- 2. Lock and check intent
    SELECT user_id, toon_amount, status INTO v_user_id, v_toon_amount, v_status 
    FROM payment_intents 
    WHERE id = p_intent_id 
    FOR UPDATE;

    IF v_user_id IS NULL OR v_status = 'confirmed' THEN
        RETURN FALSE;
    END IF;

    -- 3. Update Intent
    UPDATE payment_intents 
    SET status = 'confirmed', 
        external_id = p_external_id,
        metadata = payment_intents.metadata || p_metadata,
        updated_at = NOW()
    WHERE id = p_intent_id;

    -- 4. Credit User Balance
    UPDATE users 
    SET toon_balance = COALESCE(toon_balance, 0) + v_toon_amount
    WHERE telegram_id = v_user_id;

    -- 5. Record Reputation (Incentive for buying $TOON)
    UPDATE users
    SET reputation = COALESCE(reputation, 0) + (v_toon_amount / 10)
    WHERE telegram_id = v_user_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
