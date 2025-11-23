const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const config = require('./config');
const ErrorLogger = require('./error-logger');
const PipelineChecker = require('./pipeline-checker');
const PipelineValidator = require('./pipeline-validator');

// Initialize Error Logger and Validation
const errorLogger = new ErrorLogger();
const pipelineChecker = new PipelineChecker({ errorLogger });
const pipelineValidator = new PipelineValidator({ errorLogger, pipelineChecker });

const deploy = async () => {
    console.log('🚀 Starting Deployment Process...');
    
    // Pre-flight checks
    const preFlight = await pipelineChecker.runPreFlightChecks();
    if (!preFlight.allPassed && preFlight.failed > 0) {
        console.error('❌ Pre-flight checks failed. Please fix errors before deploying.');
        errorLogger.printReport();
        process.exit(1);
    }
    
    // Check if dist directory exists
    const distDir = path.join(__dirname, '../dist');
    const distValidation = pipelineValidator.validateFileOperation('read', distDir, true);
    if (!distValidation.valid) {
        const error = new Error('Dist directory not found. Run build first.');
        errorLogger.log(error, {
            module: 'deploy',
            operation: 'check-dist-directory',
            category: 'file_system',
            severity: 'error'
        });
        throw error;
    }

    try {

        // 1. Generate CNAME (Only if not using the placeholder)
        if (config.site.domain && config.site.domain !== 'everytopic.news') {
            try {
                fs.writeFileSync(path.join(distDir, 'CNAME'), config.site.domain);
                console.log(`✅ CNAME created: ${config.site.domain}`);
            } catch (error) {
                errorLogger.log(error, {
                    module: 'deploy',
                    operation: 'create-cname',
                    category: 'file_system',
                    severity: 'warning'
                });
                console.warn('⚠️ Failed to create CNAME file');
            }
        } else {
            console.log('ℹ️ Skipping CNAME (Using default GitHub Pages URL)');
            try {
                const cnamePath = path.join(distDir, 'CNAME');
                if (fs.existsSync(cnamePath)) {
                    fs.unlinkSync(cnamePath);
                }
            } catch (error) {
                // Ignore errors removing CNAME
            }
        }

        // 2. Deploy to GitHub Pages using git commands
        try {
        console.log('📦 Pushing to gh-pages branch...');

        // Navigate to dist, init git, commit, and push
        // We use a temporary git repo in dist to push just that folder
        process.chdir(distDir);

        execSync('git init');
        execSync('git checkout -b gh-pages');
        execSync('git add .');
        execSync('git commit -m "Deploy Site Factory Build"');

        // Push to the remote of the parent repo
        // We assume the parent repo is 'origin'
        const remoteUrl = 'https://github.com/williamDalston/nytimes-clone-everytopic.git';

        console.log(`📤 Pushing to ${remoteUrl}...`);
        execSync(`git push -f ${remoteUrl} gh-pages`);

            console.log('✅ Deployment Successful!');
            console.log('🌍 Your site should be live shortly at:');
            console.log('   https://williamDalston.github.io/nytimes-clone-everytopic/');
            
        } catch (error) {
            errorLogger.log(error, {
                module: 'deploy',
                operation: 'git-deployment',
                category: 'network',
                severity: 'error'
            });
            throw error;
        }
        
        // Print error report if there were any errors
        const errorSummary = errorLogger.getSummary();
        if (errorSummary.total > 0) {
            console.log('\n⚠️ Some errors occurred during deployment:');
            errorLogger.printReport();
        }
        
    } catch (error) {
        errorLogger.log(error, {
            module: 'deploy',
            operation: 'deployment-process',
            category: 'pipeline',
            severity: 'critical'
        });
        
        console.error('❌ Deployment Failed:', error.message);
        errorLogger.printReport();
        process.exit(1);
    }
};

// Run deployment
if (require.main === module) {
    deploy().catch(error => {
        errorLogger.log(error, {
            module: 'deploy',
            operation: 'deploy-entry',
            category: 'pipeline',
            severity: 'critical'
        });
        console.error('❌ Fatal error:', error.message);
        process.exit(1);
    });
}

module.exports = deploy;
