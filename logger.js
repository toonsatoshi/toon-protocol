// ── Structured JSON logger with async-buffered file writes ───────────────────
//
// Output format: one JSON object per line (NDJSON / JSON Lines).
// Each line is independently parseable by log aggregators (Loki, Datadog, etc.)
//
// Fields:
//   ts        ISO-8601 timestamp
//   level     INFO | WARN | ERROR | DEBUG
//   msg       Human-readable message string
//   traceId   Optional: per-request correlation ID
//   ...rest   Any extra key-value pairs from the data argument are merged flat
//
// Async behaviour:
//   Lines buffer in memory and flush via fs.appendFile (non-blocking) at most
//   once per FLUSH_INTERVAL_MS, or immediately when the buffer exceeds
//   FLUSH_SIZE_BYTES.  process.on('exit') calls a synchronous flush so the
//   last lines survive clean shutdown.

'use strict';

const fs   = require('fs');
const path = require('path');

const LOG_FILE          = path.join(__dirname, 'toon-bot.log');
const FLUSH_INTERVAL_MS = 1000;
const FLUSH_SIZE_BYTES  = 65536;  // 64 KB

let _buffer         = '';
let _flushScheduled = false;

// ── Internal flush machinery ─────────────────────────────────────────────────

function _scheduleFlush() {
    if (_flushScheduled) return;
    _flushScheduled = true;
    setTimeout(_flushAsync, FLUSH_INTERVAL_MS).unref();
}

function _flushAsync() {
    _flushScheduled = false;
    if (!_buffer) return;
    const chunk = _buffer;
    _buffer = '';
    fs.appendFile(LOG_FILE, chunk, (err) => {
        if (err) process.stderr.write(`[logger] write error: ${err.message}\n`);
    });
}

function _flushSync() {
    if (!_buffer) return;
    try { fs.appendFileSync(LOG_FILE, _buffer); } catch (_) { /* best-effort */ }
    _buffer = '';
}

process.on('exit',    _flushSync);
process.on('SIGINT',  () => { _flushSync(); process.exit(0); });
process.on('SIGTERM', () => { _flushSync(); process.exit(0); });

// ── Core log function ────────────────────────────────────────────────────────

function log(level, message, data, traceId) {
    // Build the structured entry.
    const entry = { ts: new Date().toISOString(), level, msg: message };

    if (traceId != null) entry.traceId = traceId;

    if (data != null) {
        if (data instanceof Error) {
            entry.err   = data.message;
            entry.stack = data.stack;
        } else if (data && (data.description || data.code)) {
            // Telegraf/Telegram API errors
            entry.err  = data.description || data.message;
            entry.code = data.code;
            if (data.stack) entry.stack = data.stack;
        } else if (typeof data === 'object') {
            // Merge flat — avoids nested "data" key, keeps log lines queryable.
            Object.assign(entry, data);
        } else {
            entry.data = data;
        }
    }

    let line;
    try {
        line = JSON.stringify(entry);
    } catch (_) {
        line = JSON.stringify({ ts: entry.ts, level, msg: message, err: 'unstringifiable data' });
    }

    // Write to stdout synchronously (streams are line-buffered there by default).
    process.stdout.write(line + '\n');

    _buffer += line + '\n';
    if (_buffer.length >= FLUSH_SIZE_BYTES) {
        _flushAsync();
    } else {
        _scheduleFlush();
    }
}

// ── Public API ───────────────────────────────────────────────────────────────

module.exports = {
    info:  (msg, data, traceId) => log('INFO',  msg, data, traceId),
    warn:  (msg, data, traceId) => log('WARN',  msg, data, traceId),
    error: (msg, data, traceId) => log('ERROR', msg, data, traceId),
    debug: (msg, data, traceId) => log('DEBUG', msg, data, traceId),

    // Generate a short random trace ID for correlating a request's log lines.
    // Usage: const tid = logger.traceId(); logger.info('...', data, tid);
    traceId: () => Math.random().toString(36).slice(2, 10),
};
