/**
 * Error Logger - Comprehensive error tracking and reporting system
 * Provides structured error logging, error categorization, and detailed reporting
 */

const fs = require('fs');
const path = require('path');

class ErrorLogger {
    constructor(options = {}) {
        this.dataDir = options.dataDir || path.join(__dirname, '../data');
        this.logDir = path.join(this.dataDir, 'logs');
        this.errorLogFile = path.join(this.logDir, 'errors.json');
        this.maxLogEntries = options.maxLogEntries || 1000;
        
        // Error categories
        this.categories = {
            VALIDATION: 'validation',
            API: 'api',
            FILE_SYSTEM: 'file_system',
            PIPELINE: 'pipeline',
            NETWORK: 'network',
            CONFIG: 'config',
            UNKNOWN: 'unknown'
        };
        
        // Error severity levels
        this.severity = {
            CRITICAL: 'critical',
            ERROR: 'error',
            WARNING: 'warning',
            INFO: 'info'
        };
        
        // Ensure log directory exists
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
        
        // Load existing errors
        this.errors = this.loadErrors();
    }
    
    /**
     * Load error log from file
     */
    loadErrors() {
        if (fs.existsSync(this.errorLogFile)) {
            try {
                const data = JSON.parse(fs.readFileSync(this.errorLogFile, 'utf8'));
                return data;
            } catch (error) {
                console.warn(`⚠️ Error loading error log: ${error.message}`);
            }
        }
        
        return {
            entries: [],
            summary: {
                total: 0,
                byCategory: {},
                bySeverity: {},
                recent: []
            },
            timestamp: new Date().toISOString()
        };
    }
    
    /**
     * Save error log to file
     */
    saveErrors() {
        try {
            // Update summary
            this.updateSummary();
            
            // Limit entries
            if (this.errors.entries.length > this.maxLogEntries) {
                this.errors.entries = this.errors.entries.slice(-this.maxLogEntries);
            }
            
            fs.writeFileSync(this.errorLogFile, JSON.stringify(this.errors, null, 2));
        } catch (error) {
            console.error(`❌ Failed to save error log: ${error.message}`);
        }
    }
    
    /**
     * Update error summary statistics
     */
    updateSummary() {
        const summary = {
            total: this.errors.entries.length,
            byCategory: {},
            bySeverity: {},
            recent: this.errors.entries.slice(-10).map(e => ({
                id: e.id,
                message: e.message,
                category: e.category,
                severity: e.severity,
                timestamp: e.timestamp
            }))
        };
        
        // Count by category
        this.errors.entries.forEach(entry => {
            summary.byCategory[entry.category] = (summary.byCategory[entry.category] || 0) + 1;
            summary.bySeverity[entry.severity] = (summary.bySeverity[entry.severity] || 0) + 1;
        });
        
        this.errors.summary = summary;
        this.errors.timestamp = new Date().toISOString();
    }
    
    /**
     * Categorize error automatically
     */
    categorizeError(error, context = {}) {
        const message = error.message || String(error);
        const messageLower = message.toLowerCase();
        
        // Check for specific error patterns
        if (messageLower.includes('validation') || messageLower.includes('invalid') || messageLower.includes('required')) {
            return this.categories.VALIDATION;
        }
        if (messageLower.includes('api') || messageLower.includes('rate limit') || messageLower.includes('429')) {
            return this.categories.API;
        }
        if (messageLower.includes('file') || messageLower.includes('directory') || messageLower.includes('path') || messageLower.includes('enoent')) {
            return this.categories.FILE_SYSTEM;
        }
        if (messageLower.includes('pipeline') || messageLower.includes('stage')) {
            return this.categories.PIPELINE;
        }
        if (messageLower.includes('network') || messageLower.includes('fetch') || messageLower.includes('connection') || messageLower.includes('econnreset')) {
            return this.categories.NETWORK;
        }
        if (messageLower.includes('config') || messageLower.includes('environment')) {
            return this.categories.CONFIG;
        }
        
        return this.categories.UNKNOWN;
    }
    
    /**
     * Determine error severity
     */
    determineSeverity(error, category) {
        if (error.isFatal || error.critical) {
            return this.severity.CRITICAL;
        }
        
        const message = error.message || String(error);
        const messageLower = message.toLowerCase();
        
        // Critical errors
        if (messageLower.includes('cannot continue') || messageLower.includes('fatal') || messageLower.includes('critical')) {
            return this.severity.CRITICAL;
        }
        
        // Regular errors
        if (category === this.categories.VALIDATION || category === this.categories.CONFIG) {
            return this.severity.ERROR;
        }
        
        // Warnings (retryable, recoverable)
        if (category === this.categories.API && messageLower.includes('rate limit')) {
            return this.severity.WARNING;
        }
        
        return this.severity.ERROR;
    }
    
    /**
     * Log an error
     */
    log(error, context = {}) {
        const errorObj = error instanceof Error ? error : new Error(String(error));
        
        const category = context.category || this.categorizeError(errorObj, context);
        const severity = context.severity || this.determineSeverity(errorObj, category);
        
        const entry = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            message: errorObj.message || String(error),
            stack: errorObj.stack,
            category,
            severity,
            context: {
                module: context.module || 'unknown',
                operation: context.operation || 'unknown',
                ...context
            },
            metadata: {
                ...context.metadata
            }
        };
        
        // Add to entries
        this.errors.entries.push(entry);
        
        // Save to file
        this.saveErrors();
        
        // Console output based on severity
        const emoji = {
            [this.severity.CRITICAL]: '🔴',
            [this.severity.ERROR]: '❌',
            [this.severity.WARNING]: '⚠️',
            [this.severity.INFO]: 'ℹ️'
        };
        
        console.error(`${emoji[severity]} [${severity.toUpperCase()}] ${category}: ${entry.message}`);
        if (context.module) {
            console.error(`   Module: ${context.module}`);
        }
        if (context.operation) {
            console.error(`   Operation: ${context.operation}`);
        }
        if (severity === this.severity.CRITICAL && entry.stack) {
            console.error(`   Stack: ${entry.stack.split('\n').slice(0, 3).join('\n')}`);
        }
        
        return entry;
    }
    
    /**
     * Get recent errors
     */
    getRecent(limit = 10) {
        return this.errors.entries.slice(-limit);
    }
    
    /**
     * Get errors by category
     */
    getByCategory(category) {
        return this.errors.entries.filter(e => e.category === category);
    }
    
    /**
     * Get errors by severity
     */
    getBySeverity(severity) {
        return this.errors.entries.filter(e => e.severity === severity);
    }
    
    /**
     * Get error summary
     */
    getSummary() {
        this.updateSummary();
        return this.errors.summary;
    }
    
    /**
     * Generate error report
     */
    generateReport() {
        this.updateSummary();
        const summary = this.errors.summary;
        
        const report = {
            generated: new Date().toISOString(),
            summary: {
                total: summary.total,
                byCategory: summary.byCategory,
                bySeverity: summary.bySeverity
            },
            recent: summary.recent,
            critical: this.getBySeverity(this.severity.CRITICAL).slice(-5),
            topErrors: this.getTopErrors(10)
        };
        
        return report;
    }
    
    /**
     * Get top errors by frequency
     */
    getTopErrors(limit = 10) {
        const errorCounts = {};
        
        this.errors.entries.forEach(entry => {
            const key = `${entry.category}:${entry.message.substring(0, 100)}`;
            if (!errorCounts[key]) {
                errorCounts[key] = {
                    message: entry.message,
                    category: entry.category,
                    count: 0,
                    firstSeen: entry.timestamp,
                    lastSeen: entry.timestamp
                };
            }
            errorCounts[key].count++;
            errorCounts[key].lastSeen = entry.timestamp;
        });
        
        return Object.values(errorCounts)
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);
    }
    
    /**
     * Print error report to console
     */
    printReport() {
        const report = this.generateReport();
        
        console.log('\n📊 Error Report');
        console.log('='.repeat(60));
        console.log(`Generated: ${report.generated}`);
        console.log(`\nSummary:`);
        console.log(`  Total Errors: ${report.summary.total}`);
        
        if (Object.keys(report.summary.bySeverity).length > 0) {
            console.log(`\nBy Severity:`);
            Object.entries(report.summary.bySeverity).forEach(([severity, count]) => {
                console.log(`  ${severity}: ${count}`);
            });
        }
        
        if (Object.keys(report.summary.byCategory).length > 0) {
            console.log(`\nBy Category:`);
            Object.entries(report.summary.byCategory).forEach(([category, count]) => {
                console.log(`  ${category}: ${count}`);
            });
        }
        
        if (report.critical.length > 0) {
            console.log(`\n🔴 Recent Critical Errors:`);
            report.critical.forEach(error => {
                console.log(`  [${error.timestamp}] ${error.message}`);
                if (error.context.module) {
                    console.log(`    Module: ${error.context.module}`);
                }
            });
        }
        
        if (report.topErrors.length > 0) {
            console.log(`\nTop Errors by Frequency:`);
            report.topErrors.slice(0, 5).forEach((error, index) => {
                console.log(`  ${index + 1}. [${error.count}x] ${error.message.substring(0, 60)}...`);
                console.log(`     Category: ${error.category} | First: ${error.firstSeen} | Last: ${error.lastSeen}`);
            });
        }
        
        console.log('='.repeat(60) + '\n');
    }
    
    /**
     * Clear error log
     */
    clear() {
        this.errors = {
            entries: [],
            summary: {
                total: 0,
                byCategory: {},
                bySeverity: {},
                recent: []
            },
            timestamp: new Date().toISOString()
        };
        this.saveErrors();
    }
    
    /**
     * Export error log to file
     */
    exportToFile(filePath) {
        try {
            const report = this.generateReport();
            fs.writeFileSync(filePath, JSON.stringify(report, null, 2));
            console.log(`✅ Error report exported to: ${filePath}`);
        } catch (error) {
            console.error(`❌ Failed to export error report: ${error.message}`);
        }
    }
}

module.exports = ErrorLogger;

