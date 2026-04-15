-- Migration 014: BigInt Type Alignment & Shadow Bootstrap
-- Goal: Fix H3 (Overflow Risk), C2 (Bootstrap Drift), and standardized types.

-- 1. Align types to BIGINT (H3 Fix)
-- reward_intents.amount_toon should be BIGINT to handle nanotons safely
ALTER TABLE reward_intents ALTER COLUMN amount_toon TYPE BIGINT;
ALTER TABLE payment_intents ALTER COLUMN toon_amount TYPE BIGINT;

-- 2. Ensure shadow balance is BIGINT and bootstrap it (C2 Fix)
ALTER TABLE users ALTER COLUMN expected_toon_balance TYPE BIGINT;
ALTER TABLE users ALTER COLUMN toon_balance TYPE BIGINT;

-- Bootstrap: seed shadow balance from current live balance
-- so the reconciler starts from a clean state.
UPDATE users 
SET expected_toon_balance = toon_balance
WHERE (expected_toon_balance = 0 OR expected_toon_balance IS NULL) 
  AND (toon_balance > 0);

-- 3. Audit Log for Bootstrap
INSERT INTO guardrail_events (type, reason, metadata)
VALUES ('BOOTSTRAP', 'Seeding shadow balances from live balances', 
        jsonb_build_object('timestamp', NOW(), 'migration', '014'));
