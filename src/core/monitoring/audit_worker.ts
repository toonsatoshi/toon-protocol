const supplyAudit = require('../audit/supply_audit');
const metrics = require('./metrics');
const logger = require('../../../logger');

const AUDIT_INTERVAL_MS = 15 * 60 * 1000; // Every 15 minutes

class AuditWorker {
    constructor() {
        this.interval = null;
    }

    start() {
        logger.info('🛰 Audit Worker started.');
        this.runOnce();
        this.interval = setInterval(() => this.runOnce(), AUDIT_INTERVAL_MS);
    }

    async runOnce() {
        const auditReport = await supplyAudit.runAudit();
        if (auditReport) {
            metrics.setDrift(auditReport.drift);
        }
        metrics.logReport();
    }

    stop() {
        if (this.interval) clearInterval(this.interval);
        logger.info('🛰 Audit Worker stopped.');
    }
}

module.exports = new AuditWorker();
