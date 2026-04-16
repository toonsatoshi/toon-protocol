const fs = require('fs');
const path = require('path');

const LOG_DIR = '/app/logs';

// Ensure logs directory exists
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}

const getTimestamp = () => new Date().toISOString();

const writeToFile = (level: string, message: string, data: any) => {
    const timestamp = getTimestamp();
    const logEntry = {
        timestamp,
        level,
        message,
        ...(data && { data }),
    };

    const logFile = path.join(LOG_DIR, `app.log`);
    fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n', 'utf8');
};

const logger = {
    info: (message: string, data?: any) => {
        console.log(`[INFO] ${getTimestamp()} - ${message}`, data || '');
        writeToFile('INFO', message, data);
    },

    error: (message: string, data?: any) => {
        console.error(`[ERROR] ${getTimestamp()} - ${message}`, data || '');
        writeToFile('ERROR', message, data);
    },

    warn: (message: string, data?: any) => {
        console.warn(`[WARN] ${getTimestamp()} - ${message}`, data || '');
        writeToFile('WARN', message, data);
    },

    debug: (message: string, data?: any) => {
        if (process.env.DEBUG) {
            console.log(`[DEBUG] ${getTimestamp()} - ${message}`, data || '');
            writeToFile('DEBUG', message, data);
        }
    },
};

module.exports = logger;
