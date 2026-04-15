const logger = require('../../../logger');

class MetricsService {
    constructor() {
        this.counters = {
            intents_total: 0,
            failures_total: 0,
            reconciliation_drift: 0,
            indexer_lag_ms: 0
        };
        this.timers = new Map();
    }

    recordIntent(type) {
        this.counters.intents_total++;
        logger.debug(`[Metric] Intent Created: ${type}`);
    }

    recordFailure(type, error) {
        this.counters.failures_total++;
        logger.error(`[Metric] Failure: ${type}`, { error });
    }

    setDrift(drift) {
        this.counters.reconciliation_drift = drift;
    }

    setIndexerLag(ms) {
        this.counters.indexer_lag_ms = ms;
    }

    getReport() {
        return {
            ...this.counters,
            timestamp: new Date().toISOString()
        };
    }
    
    logReport() {
        const report = this.getReport();
        logger.info(`📊 System Metrics:`, report);
    }
}

module.exports = new MetricsService();
