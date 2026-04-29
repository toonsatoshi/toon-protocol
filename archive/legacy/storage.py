"""
storage.py — SQLite persistence layer for ToonBot.
Tracks: NFT track records indexed by track_id.
Sessions: ephemeral TON Connect session key cache.
"""
import sqlite3
import os
from contextlib import contextmanager

DB_PATH = os.getenv("DB_PATH", "toonbot.db")

@contextmanager
def _conn():
    """Thread-safe SQLite connection context manager."""
    con = sqlite3.connect(DB_PATH, check_same_thread=False)
    con.row_factory = sqlite3.Row
    try:
        yield con
        con.commit()
    except Exception:
        con.rollback()
        raise
    finally:
        con.close()

def init_db() -> None:
    """Idempotent schema creation."""
    with _conn() as con:
        con.executescript("""
            CREATE TABLE IF NOT EXISTS tracks (
                track_id       TEXT PRIMARY KEY,
                artist_tg_id   INTEGER NOT NULL,
                channel_msg_id INTEGER,
                title          TEXT,
                price          INTEGER DEFAULT 0
            );
            CREATE TABLE IF NOT EXISTS sessions (
                tg_id       INTEGER PRIMARY KEY,
                ton_address TEXT,
                session_key TEXT
            );
            CREATE INDEX IF NOT EXISTS idx_tracks_artist
                ON tracks (artist_tg_id);
        """)

def add_track(track_id: str, artist_tg_id: int,
              channel_msg_id: int, title: str, price: int) -> None:
    with _conn() as con:
        con.execute(
            "INSERT OR REPLACE INTO tracks VALUES (?,?,?,?,?)",
            (track_id, artist_tg_id, channel_msg_id, title, price),
        )

def get_track_by_id(track_id: str):
    with _conn() as con:
        return con.execute(
            "SELECT * FROM tracks WHERE track_id = ?", (track_id,)
        ).fetchone()

def get_tracks_by_artist(artist_tg_id: int):
    with _conn() as con:
        return con.execute(
            "SELECT * FROM tracks WHERE artist_tg_id = ?", (artist_tg_id,)
        ).fetchall()

def get_all_tracks():
    with _conn() as con:
        return con.execute("SELECT * FROM tracks").fetchall()

def upsert_session(tg_id: int, ton_address: str, session_key: str) -> None:
    with _conn() as con:
        con.execute(
            "INSERT OR REPLACE INTO sessions VALUES (?,?,?)",
            (tg_id, ton_address, session_key),
        )

def get_session(tg_id: int):
    with _conn() as con:
        return con.execute(
            "SELECT * FROM sessions WHERE tg_id = ?", (tg_id,)
        ).fetchone()
