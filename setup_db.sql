-- Supabase Schema Initialization for ToonBot

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    telegram_id BIGINT PRIMARY KEY,
    artist_name TEXT,
    referral_code TEXT UNIQUE,
    referred_by BIGINT REFERENCES users(telegram_id),
    on_chain BOOLEAN DEFAULT FALSE,
    reputation INTEGER DEFAULT 0,
    toon_balance INTEGER DEFAULT 0,
    tracks_uploaded INTEGER DEFAULT 0,
    tips_sent INTEGER DEFAULT 0,
    listening_streak INTEGER DEFAULT 0,
    last_listen_day INTEGER,
    wallet_address TEXT,
    connector_data JSONB,
    pending_identity_tx JSONB,
    contract_address TEXT,
    step TEXT,
    track JSONB,
    created_at BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)
);

-- 2. Tracks Table
CREATE TABLE IF NOT EXISTS tracks (
    id TEXT PRIMARY KEY,
    title TEXT,
    genre TEXT,
    artist_name TEXT,
    artist_id BIGINT REFERENCES users(telegram_id),
    file_id TEXT,
    duration INTEGER,
    contract_address TEXT,
    plays INTEGER DEFAULT 0,
    unique_listeners INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Referrals Table
CREATE TABLE IF NOT EXISTS referrals (
    referrer_id BIGINT REFERENCES users(telegram_id),
    telegram_id BIGINT REFERENCES users(telegram_id),
    signup_at BIGINT,
    signup_paid BOOLEAN DEFAULT FALSE,
    upload_paid BOOLEAN DEFAULT FALSE,
    plays_paid BOOLEAN DEFAULT FALSE,
    uploaded_at BIGINT,
    PRIMARY KEY (referrer_id, telegram_id)
);

-- 4. Track Listeners Table
CREATE TABLE IF NOT EXISTS track_listeners (
    track_id TEXT REFERENCES tracks(id) ON DELETE CASCADE,
    telegram_id BIGINT,
    played_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (track_id, telegram_id)
);

-- 5. Enable Row Level Security (optional but recommended for production)
-- For now, we'll keep it simple if the bot uses the service_role key.
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE track_listeners ENABLE ROW LEVEL SECURITY;

-- 6. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
CREATE INDEX IF NOT EXISTS idx_tracks_artist_id ON tracks(artist_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_track_listeners_track_id ON track_listeners(track_id);

-- 7. RPC Functions
-- Atomic unique listener increment
CREATE OR REPLACE FUNCTION add_unique_listener(p_track_id TEXT, p_telegram_id BIGINT)
RETURNS integer AS $$
DECLARE new_count integer;
BEGIN
  INSERT INTO track_listeners (track_id, telegram_id)
  VALUES (p_track_id, p_telegram_id)
  ON CONFLICT DO NOTHING;

  SELECT count(*) FROM track_listeners
  WHERE track_id = p_track_id
  INTO new_count;

  UPDATE tracks
  SET unique_listeners = new_count
  WHERE id = p_track_id;

  RETURN new_count;
END;
$$ LANGUAGE plpgsql;
