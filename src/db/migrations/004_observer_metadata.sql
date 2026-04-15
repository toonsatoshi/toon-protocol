-- Migration 004: Intent Processing Metadata
-- Adds tracking for the Chain Observer.

ALTER TABLE tip_intents 
ADD COLUMN IF NOT EXISTS last_checked_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS attempt_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS failure_reason TEXT;

-- Index for the observer to find pending work quickly
CREATE INDEX IF NOT EXISTS idx_tip_intents_pending 
ON tip_intents (status, last_checked_at) 
WHERE status = 'pending';
