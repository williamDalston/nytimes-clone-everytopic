#!/usr/bin/env node

/**
 * Pipeline Health Check Script
 * Standalone script to check pipeline health and generate error reports
 * Usage: node generator/check.js [--report] [--export PATH]
 */

const path = require('path');
const ErrorLogger = require('./error-logger');
const PipelineChecker = require('./pipeline-checker');
const PipelineValidator = require('./pipeline-validator');

// Parse command line arguments
const args = process.argv.slice(2);
const generateReport = args.includes('--report');
const exportPathIndex = args.indexOf('--export');
const exportPath = exportPathIndex >= 0 && args[exportPathIndex + 1] 
    ? args[exportPathIndex + 1] 
    : null;
const verbose = args.includes('--verbose') || args.includes('-v');

async function main() {
    console.log('🔍 Pipeline Health Check\n');
    
    // Initialize error logger and checkers
    const errorLogger = new ErrorLogger();
    const pipelineChecker = new PipelineChecker({ errorLogger });
    const pipelineValidator = new PipelineValidator({ errorLogger, pipelineChecker });
    
    // Run pre-flight checks
    const results = await pipelineChecker.runPreFlightChecks();
    
    // Print summary
    console.log('\n📊 Health Check Summary:');
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`⚠️ Warnings: ${results.warnings}`);
    console.log(`\nStatus: ${results.allPassed ? '✅ HEALTHY' : '❌ UNHEALTHY'}`);
    console.log('='.repeat(60));
    
    // Generate error report if requested or if there are errors
    if (generateReport || errorLogger.getSummary().total > 0) {
        console.log('\n📊 Error Report:');
        errorLogger.printReport();
        
        // Export report if requested
        if (exportPath) {
            errorLogger.exportToFile(exportPath);
        }
    }
    
    // Print recommendations
    if (!results.allPassed) {
        console.log('\n💡 Recommendations:');
        console.log('   1. Fix failed checks before running operations');
        console.log('   2. Review error report for detailed information');
        console.log('   3. Check environment variables and configuration');
        console.log('   4. Ensure all dependencies are installed (npm install)');
        console.log('   5. Verify API keys are correctly set\n');
    }
    
    // Exit with appropriate code
    process.exit(results.allPassed ? 0 : 1);
}

// Run checks
if (require.main === module) {
    main().catch(error => {
        console.error('❌ Fatal error during health check:', error.message);
        if (verbose) {
            console.error(error.stack);
        }
        process.exit(1);
    });
}

module.exports = main;

