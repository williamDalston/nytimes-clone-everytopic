#!/usr/bin/env node

/**
 * Health Report Script
 * Generates and displays a comprehensive health report
 */

const HealthMonitor = require('./health-monitor');
const ErrorLogger = require('./error-logger');

async function main() {
    const errorLogger = new ErrorLogger();
    const healthMonitor = new HealthMonitor({ errorLogger });
    
    // Run a fresh health check
    console.log('🔍 Running health check...\n');
    await healthMonitor.recordHealthCheck();
    
    // Print the health report
    healthMonitor.printHealthReport();
    
    // Optionally export report to file
    if (process.argv.includes('--export')) {
        const report = healthMonitor.generateHealthReport();
        const fs = require('fs');
        const path = require('path');
        const reportFile = path.join(__dirname, '../data/health-report.json');
        fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
        console.log(`📄 Health report exported to: ${reportFile}`);
    }
}

main().catch(error => {
    console.error('❌ Error generating health report:', error);
    process.exit(1);
});

