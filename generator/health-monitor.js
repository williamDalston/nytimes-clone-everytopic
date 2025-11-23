/**
 * Health Monitor - Continuous health monitoring and metrics collection
 * Tracks system health, performance, and generates health reports
 */

const fs = require('fs');
const path = require('path');
const ErrorLogger = require('./error-logger');
const PipelineChecker = require('./pipeline-checker');

class HealthMonitor {
    constructor(options = {}) {
        this.dataDir = options.dataDir || path.join(__dirname, '../data');
        this.healthFile = path.join(this.dataDir, 'health.json');
        this.errorLogger = options.errorLogger || new ErrorLogger();
        this.pipelineChecker = options.pipelineChecker || new PipelineChecker({ errorLogger: this.errorLogger });
        
        // Health metrics
        this.metrics = {
            lastCheck: null,
            checks: [],
            uptime: {
                startTime: Date.now(),
                totalOperations: 0,
                successfulOperations: 0,
                failedOperations: 0
            },
            performance: {
                avgBuildTime: null,
                avgGenerationTime: null,
                lastBuildTime: null,
                lastGenerationTime: null
            },
            api: {
                totalCalls: 0,
                successfulCalls: 0,
                failedCalls: 0,
                rateLimitHits: 0
            },
            cache: {
                hits: 0,
                misses: 0,
                hitRate: 0
            }
        };
        
        // Load existing metrics
        this.loadMetrics();
    }
    
    /**
     * Load health metrics from file
     */
    loadMetrics() {
        if (fs.existsSync(this.healthFile)) {
            try {
                const data = JSON.parse(fs.readFileSync(this.healthFile, 'utf8'));
                this.metrics = { ...this.metrics, ...data };
            } catch (error) {
                console.warn(`⚠️ Error loading health metrics: ${error.message}`);
            }
        }
    }
    
    /**
     * Save health metrics to file
     */
    saveMetrics() {
        try {
            if (!fs.existsSync(this.dataDir)) {
                fs.mkdirSync(this.dataDir, { recursive: true });
            }
            fs.writeFileSync(this.healthFile, JSON.stringify(this.metrics, null, 2));
        } catch (error) {
            console.warn(`⚠️ Error saving health metrics: ${error.message}`);
        }
    }
    
    /**
     * Record a health check
     */
    async recordHealthCheck() {
        const checkTime = Date.now();
        const check = await this.pipelineChecker.runPreFlightChecks();
        
        const healthCheck = {
            timestamp: new Date().toISOString(),
            status: check.allPassed ? 'healthy' : 'unhealthy',
            passed: check.passed,
            failed: check.failed,
            warnings: check.warnings,
            hasWarnings: check.hasWarnings
        };
        
        this.metrics.checks.push(healthCheck);
        this.metrics.lastCheck = healthCheck.timestamp;
        
        // Keep only last 100 checks
        if (this.metrics.checks.length > 100) {
            this.metrics.checks = this.metrics.checks.slice(-100);
        }
        
        this.saveMetrics();
        
        return healthCheck;
    }
    
    /**
     * Record operation completion
     */
    recordOperation(operation, success, duration = null) {
        this.metrics.uptime.totalOperations++;
        
        if (success) {
            this.metrics.uptime.successfulOperations++;
        } else {
            this.metrics.uptime.failedOperations++;
        }
        
        if (duration !== null) {
            if (operation === 'build') {
                this.metrics.performance.lastBuildTime = duration;
                this.updateAverage('avgBuildTime', duration);
            } else if (operation === 'generate' || operation === 'bulk') {
                this.metrics.performance.lastGenerationTime = duration;
                this.updateAverage('avgGenerationTime', duration);
            }
        }
        
        this.saveMetrics();
    }
    
    /**
     * Update rolling average
     */
    updateAverage(metricName, newValue) {
        const current = this.metrics.performance[metricName];
        if (current === null) {
            this.metrics.performance[metricName] = newValue;
        } else {
            // Simple moving average (last 10 values)
            this.metrics.performance[metricName] = (current * 0.9) + (newValue * 0.1);
        }
    }
    
    /**
     * Record API call
     */
    recordAPICall(success, wasRateLimited = false) {
        this.metrics.api.totalCalls++;
        
        if (success) {
            this.metrics.api.successfulCalls++;
        } else {
            this.metrics.api.failedCalls++;
        }
        
        if (wasRateLimited) {
            this.metrics.api.rateLimitHits++;
        }
        
        this.saveMetrics();
    }
    
    /**
     * Record cache hit/miss
     */
    recordCache(hit) {
        if (hit) {
            this.metrics.cache.hits++;
        } else {
            this.metrics.cache.misses++;
        }
        
        const total = this.metrics.cache.hits + this.metrics.cache.misses;
        if (total > 0) {
            this.metrics.cache.hitRate = (this.metrics.cache.hits / total) * 100;
        }
        
        this.saveMetrics();
    }
    
    /**
     * Get health status
     */
    getHealthStatus() {
        const uptime = Date.now() - this.metrics.uptime.startTime;
        const successRate = this.metrics.uptime.totalOperations > 0
            ? (this.metrics.uptime.successfulOperations / this.metrics.uptime.totalOperations) * 100
            : 100;
        
        const apiSuccessRate = this.metrics.api.totalCalls > 0
            ? (this.metrics.api.successfulCalls / this.metrics.api.totalCalls) * 100
            : 100;
        
        // Determine overall health
        let overallHealth = 'healthy';
        if (successRate < 80 || apiSuccessRate < 80) {
            overallHealth = 'degraded';
        }
        if (successRate < 50 || apiSuccessRate < 50) {
            overallHealth = 'unhealthy';
        }
        
        return {
            overall: overallHealth,
            uptime: {
                seconds: Math.floor(uptime / 1000),
                hours: Math.floor(uptime / (1000 * 60 * 60)),
                days: Math.floor(uptime / (1000 * 60 * 60 * 24))
            },
            operations: {
                total: this.metrics.uptime.totalOperations,
                successful: this.metrics.uptime.successfulOperations,
                failed: this.metrics.uptime.failedOperations,
                successRate: successRate.toFixed(1) + '%'
            },
            api: {
                total: this.metrics.api.totalCalls,
                successful: this.metrics.api.successfulCalls,
                failed: this.metrics.api.failedCalls,
                rateLimitHits: this.metrics.api.rateLimitHits,
                successRate: apiSuccessRate.toFixed(1) + '%'
            },
            cache: {
                hits: this.metrics.cache.hits,
                misses: this.metrics.cache.misses,
                hitRate: this.metrics.cache.hitRate.toFixed(1) + '%'
            },
            performance: {
                avgBuildTime: this.metrics.performance.avgBuildTime
                    ? (this.metrics.performance.avgBuildTime / 1000).toFixed(2) + 's'
                    : 'N/A',
                avgGenerationTime: this.metrics.performance.avgGenerationTime
                    ? (this.metrics.performance.avgGenerationTime / 1000).toFixed(2) + 's'
                    : 'N/A'
            },
            lastCheck: this.metrics.lastCheck
        };
    }
    
    /**
     * Generate health report
     */
    generateHealthReport() {
        const status = this.getHealthStatus();
        const recentChecks = this.metrics.checks.slice(-10);
        const errorSummary = this.errorLogger.getSummary();
        
        return {
            timestamp: new Date().toISOString(),
            status,
            recentChecks,
            errorSummary: {
                total: errorSummary.total,
                bySeverity: errorSummary.bySeverity,
                byCategory: errorSummary.byCategory
            },
            recommendations: this.getRecommendations(status)
        };
    }
    
    /**
     * Get health recommendations
     */
    getRecommendations(status) {
        const recommendations = [];
        
        if (status.operations.successRate < 80) {
            recommendations.push('⚠️ Operation success rate is below 80%. Review error logs for issues.');
        }
        
        if (status.api.successRate < 80) {
            recommendations.push('⚠️ API success rate is below 80%. Check API keys and network connectivity.');
        }
        
        if (status.api.rateLimitHits > 0) {
            recommendations.push('⚠️ Rate limits detected. Consider implementing rate limiting delays.');
        }
        
        if (status.cache.hitRate < 50 && status.cache.hits + status.cache.misses > 10) {
            recommendations.push('💡 Cache hit rate is low. Consider reviewing cache strategy.');
        }
        
        if (status.performance.avgBuildTime && parseFloat(status.performance.avgBuildTime) > 30) {
            recommendations.push('⚠️ Build times are high. Consider optimizing build process.');
        }
        
        if (recommendations.length === 0) {
            recommendations.push('✅ System is healthy. No immediate recommendations.');
        }
        
        return recommendations;
    }
    
    /**
     * Print health report
     */
    printHealthReport() {
        const report = this.generateHealthReport();
        
        console.log('\n🏥 System Health Report');
        console.log('='.repeat(60));
        console.log(`Overall Status: ${report.status.overall.toUpperCase()}`);
        console.log(`Generated: ${report.timestamp}`);
        
        console.log(`\n📊 Uptime:`);
        console.log(`  Running: ${report.status.uptime.days}d ${report.status.uptime.hours % 24}h ${Math.floor((report.status.uptime.seconds % 3600) / 60)}m`);
        
        console.log(`\n📈 Operations:`);
        console.log(`  Total: ${report.status.operations.total}`);
        console.log(`  Successful: ${report.status.operations.successful}`);
        console.log(`  Failed: ${report.status.operations.failed}`);
        console.log(`  Success Rate: ${report.status.operations.successRate}`);
        
        console.log(`\n🔌 API:`);
        console.log(`  Total Calls: ${report.status.api.total}`);
        console.log(`  Successful: ${report.status.api.successful}`);
        console.log(`  Failed: ${report.status.api.failed}`);
        console.log(`  Rate Limit Hits: ${report.status.api.rateLimitHits}`);
        console.log(`  Success Rate: ${report.status.api.successRate}`);
        
        console.log(`\n💾 Cache:`);
        console.log(`  Hits: ${report.status.cache.hits}`);
        console.log(`  Misses: ${report.status.cache.misses}`);
        console.log(`  Hit Rate: ${report.status.cache.hitRate}`);
        
        console.log(`\n⚡ Performance:`);
        console.log(`  Avg Build Time: ${report.status.performance.avgBuildTime}`);
        console.log(`  Avg Generation Time: ${report.status.performance.avgGenerationTime}`);
        
        if (report.errorSummary.total > 0) {
            console.log(`\n❌ Errors:`);
            console.log(`  Total: ${report.errorSummary.total}`);
            if (Object.keys(report.errorSummary.bySeverity).length > 0) {
                console.log(`  By Severity:`, report.errorSummary.bySeverity);
            }
        }
        
        console.log(`\n💡 Recommendations:`);
        report.recommendations.forEach((rec, index) => {
            console.log(`  ${index + 1}. ${rec}`);
        });
        
        console.log('='.repeat(60) + '\n');
    }
    
    /**
     * Reset metrics
     */
    reset() {
        this.metrics = {
            lastCheck: null,
            checks: [],
            uptime: {
                startTime: Date.now(),
                totalOperations: 0,
                successfulOperations: 0,
                failedOperations: 0
            },
            performance: {
                avgBuildTime: null,
                avgGenerationTime: null,
                lastBuildTime: null,
                lastGenerationTime: null
            },
            api: {
                totalCalls: 0,
                successfulCalls: 0,
                failedCalls: 0,
                rateLimitHits: 0
            },
            cache: {
                hits: 0,
                misses: 0,
                hitRate: 0
            }
        };
        this.saveMetrics();
    }
}

module.exports = HealthMonitor;

