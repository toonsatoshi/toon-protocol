-- Migration 001: unique listener tracking
-- Run against Supabase before deploying the store.js changes.
-- Idempotent: safe to re-run.

ALTER TABLE tracks
    ADD COLUMN IF NOT EXISTS unique_listeners INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS track_listeners (
    track_id    TEXT   NOT NULL,
    telegram_id BIGINT NOT NULL,
    played_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (track_id, telegram_id)
);

-- Back-fill: set unique_listeners = plays for all existing rows.
-- Conservative — can't de-duplicate retroactively without listener logs.
UPDATE tracks
SET    unique_listeners = COALESCE(plays, 0)
WHERE  unique_listeners = 0 AND plays > 0;
