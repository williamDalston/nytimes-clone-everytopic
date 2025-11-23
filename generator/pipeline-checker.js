/**
 * Pipeline Health Checker
 * Validates all components, dependencies, and configuration before running operations
 */

const fs = require('fs');
const path = require('path');
const config = require('./config');
const ErrorLogger = require('./error-logger');

class PipelineChecker {
    constructor(options = {}) {
        this.errorLogger = options.errorLogger || new ErrorLogger();
        this.checks = [];
        this.results = {
            passed: [],
            failed: [],
            warnings: []
        };
    }
    
    /**
     * Run all pre-flight checks
     */
    async runPreFlightChecks() {
        console.log('🔍 Running Pre-Flight Checks...\n');
        
        this.results = {
            passed: [],
            failed: [],
            warnings: []
        };
        
        // Configuration checks
        await this.checkConfiguration();
        
        // Environment checks
        await this.checkEnvironment();
        
        // File system checks
        await this.checkFileSystem();
        
        // API checks
        await this.checkAPIConfiguration();
        
        // Dependencies checks
        await this.checkDependencies();
        
        // Template checks
        await this.checkTemplates();
        
        // Directory structure checks
        await this.checkDirectoryStructure();
        
        // Print results
        this.printResults();
        
        return {
            passed: this.results.passed.length,
            failed: this.results.failed.length,
            warnings: this.results.warnings.length,
            allPassed: this.results.failed.length === 0,
            hasWarnings: this.results.warnings.length > 0
        };
    }
    
    /**
     * Check configuration
     */
    async checkConfiguration() {
        const module = 'pipeline-checker';
        const operation = 'check-configuration';
        
        try {
            // Check required config fields
            const requiredFields = [
                'site.name',
                'site.domain',
                'api.llm',
                'llm.model'
            ];
            
            const missing = [];
            const placeholders = [];
            const isDryRun = config.llm.dryRun || process.env.DRY_RUN === 'true';
            
            // Check if API keys are actually set in environment (even if config has placeholders)
            const hasOpenAIKey = !!(process.env.OPENAI_API_KEY || process.env.LLM_API_KEY);
            const hasGeminiKey = !!(process.env.GEMINI_API_KEY || process.env.IMAGE_GEN_API_KEY);
            
            requiredFields.forEach(field => {
                const parts = field.split('.');
                let value = config;
                for (const part of parts) {
                    value = value?.[part];
                }
                if (!value) {
                    missing.push(field);
                } else if (value === 'placeholder-llm-key' || value === 'placeholder-nano-banana-key') {
                    // Only mark as placeholder if not overridden by environment
                    if (field === 'api.llm' && hasOpenAIKey) {
                        // Environment has the key, so it's fine
                    } else if (field === 'api.imageGen' && hasGeminiKey) {
                        // Environment has the key, so it's fine
                    } else {
                        placeholders.push(field);
                    }
                }
            });
            
            // Missing values are always errors
            if (missing.length > 0) {
                this.fail('Configuration', `Missing required values: ${missing.join(', ')}`, {
                    module,
                    operation,
                    missing
                });
            }
            
            // Placeholder API keys are warnings in dry-run mode, errors otherwise
            // But first check if environment variables override them
            const actualPlaceholders = placeholders.filter(field => {
                if (field === 'api.llm') {
                    // Check if environment has the key
                    return !hasOpenAIKey;
                } else if (field === 'api.imageGen') {
                    // Check if environment has the key
                    return !hasGeminiKey;
                }
                return true;
            });
            
            if (actualPlaceholders.length > 0) {
                if (isDryRun) {
                    this.warn('Configuration', `Placeholder API keys detected (ok for dry-run): ${actualPlaceholders.join(', ')}`, {
                        module,
                        operation,
                        placeholders: actualPlaceholders
                    });
                } else {
                    this.fail('Configuration', `Placeholder API keys (not allowed in production): ${actualPlaceholders.join(', ')}`, {
                        module,
                        operation,
                        placeholders: actualPlaceholders
                    });
                }
            } else if (placeholders.length > 0) {
                // Placeholders exist in config but environment overrides them - this is fine
                this.pass('Configuration', 'API keys loaded from environment variables');
            }
            
            if (missing.length === 0 && actualPlaceholders.length === 0) {
                this.pass('Configuration', 'All required configuration fields present');
            }
            
            // Check pipeline configuration
            if (config.llm.pipeline) {
                const stages = config.llm.pipeline.stages || [];
                if (stages.length === 0) {
                    this.warn('Configuration', 'Pipeline stages not configured, will use defaults');
                } else {
                    this.pass('Configuration', `Pipeline configured with ${stages.length} stages: ${stages.join(', ')}`);
                }
            }
            
        } catch (error) {
            this.fail('Configuration', `Configuration check failed: ${error.message}`, {
                module,
                operation,
                error: error.message
            });
        }
    }
    
    /**
     * Check environment variables
     */
    async checkEnvironment() {
        const module = 'pipeline-checker';
        const operation = 'check-environment';
        
        try {
            const requiredEnvVars = [];
            const optionalEnvVars = [
                'OPENAI_API_KEY',
                'LLM_API_KEY',
                'GEMINI_API_KEY',
                'IMAGE_GEN_API_KEY',
                'GA4_MEASUREMENT_ID',
                'GOOGLE_ANALYTICS_ID',
                'DRY_RUN',
                'USE_PIPELINE',
                'PIPELINE_STAGES',
                'MAX_ARTICLES',
                'MONTHLY_BUDGET'
            ];
            
            const missing = [];
            const present = [];
            
            // Check required
            requiredEnvVars.forEach(varName => {
                if (!process.env[varName]) {
                    missing.push(varName);
                } else {
                    present.push(varName);
                }
            });
            
            // Check optional but log if present
            optionalEnvVars.forEach(varName => {
                if (process.env[varName]) {
                    present.push(varName);
                }
            });
            
            if (missing.length > 0) {
                this.fail('Environment', `Missing required environment variables: ${missing.join(', ')}`, {
                    module,
                    operation,
                    missing
                });
            } else {
                this.pass('Environment', 'Environment variables check passed');
                if (present.length > 0) {
                    console.log(`   ✓ Found ${present.length} environment variables`);
                }
            }
            
            // Check API keys specifically
            const apiKeys = {
                llm: process.env.OPENAI_API_KEY || process.env.LLM_API_KEY,
                image: process.env.GEMINI_API_KEY || process.env.IMAGE_GEN_API_KEY
            };
            
            if (!apiKeys.llm || apiKeys.llm === 'placeholder-llm-key') {
                this.warn('Environment', 'LLM API key not set, will use dry-run mode');
            } else {
                this.pass('Environment', 'LLM API key configured');
            }
            
            if (!apiKeys.image || apiKeys.image === 'placeholder-nano-banana-key') {
                this.warn('Environment', 'Image generation API key not set, will use fallback images');
            } else {
                this.pass('Environment', 'Image generation API key configured');
            }
            
        } catch (error) {
            this.fail('Environment', `Environment check failed: ${error.message}`, {
                module,
                operation,
                error: error.message
            });
        }
    }
    
    /**
     * Check file system
     */
    async checkFileSystem() {
        const module = 'pipeline-checker';
        const operation = 'check-filesystem';
        
        try {
            const requiredDirs = [
                path.join(__dirname, '../data'),
                path.join(__dirname, '../data/cache'),
                path.join(__dirname, '../dist'),
                path.join(__dirname, '../templates')
            ];
            
            const missing = [];
            const created = [];
            
            requiredDirs.forEach(dir => {
                if (!fs.existsSync(dir)) {
                    try {
                        fs.mkdirSync(dir, { recursive: true });
                        created.push(dir);
                        console.log(`   ✓ Created directory: ${path.basename(dir)}`);
                    } catch (error) {
                        missing.push(dir);
                    }
                }
            });
            
            if (missing.length > 0) {
                this.fail('File System', `Cannot create required directories: ${missing.join(', ')}`, {
                    module,
                    operation,
                    missing
                });
            } else {
                this.pass('File System', 'All required directories exist or created');
            }
            
            // Check write permissions
            const testDir = path.join(__dirname, '../data');
            try {
                const testFile = path.join(testDir, '.write-test');
                fs.writeFileSync(testFile, 'test');
                fs.unlinkSync(testFile);
                this.pass('File System', 'Write permissions verified');
            } catch (error) {
                this.fail('File System', `Cannot write to data directory: ${error.message}`, {
                    module,
                    operation,
                    error: error.message
                });
            }
            
        } catch (error) {
            this.fail('File System', `File system check failed: ${error.message}`, {
                module,
                operation,
                error: error.message
            });
        }
    }
    
    /**
     * Check API configuration
     */
    async checkAPIConfiguration() {
        const module = 'pipeline-checker';
        const operation = 'check-api';
        
        try {
            // Check LLM client can be initialized
            try {
                const LLMClient = require('./llm');
                const llmClient = new LLMClient({
                    apiKey: config.api.llm,
                    model: config.llm.model,
                    dryRun: config.llm.dryRun
                });
                this.pass('API', 'LLM client initialized successfully');
            } catch (error) {
                this.fail('API', `LLM client initialization failed: ${error.message}`, {
                    module,
                    operation,
                    error: error.message
                });
            }
            
            // Check Image Generator can be initialized
            try {
                const ImageGenerator = require('./image-gen');
                const imageGen = new ImageGenerator({
                    apiKey: config.api.imageGen,
                    dryRun: config.llm.dryRun
                });
                this.pass('API', 'Image generator initialized successfully');
            } catch (error) {
                this.warn('API', `Image generator initialization warning: ${error.message}`);
            }
            
        } catch (error) {
            this.fail('API', `API configuration check failed: ${error.message}`, {
                module,
                operation,
                error: error.message
            });
        }
    }
    
    /**
     * Check dependencies
     */
    async checkDependencies() {
        const module = 'pipeline-checker';
        const operation = 'check-dependencies';
        
        try {
            const requiredDeps = [
                'openai',
                '@google/generative-ai',
                'dotenv'
            ];
            
            const missing = [];
            
            requiredDeps.forEach(dep => {
                try {
                    require(dep);
                } catch (error) {
                    missing.push(dep);
                }
            });
            
            if (missing.length > 0) {
                this.fail('Dependencies', `Missing required dependencies: ${missing.join(', ')}. Run: npm install`, {
                    module,
                    operation,
                    missing
                });
            } else {
                this.pass('Dependencies', 'All required dependencies installed');
            }
            
        } catch (error) {
            this.fail('Dependencies', `Dependency check failed: ${error.message}`, {
                module,
                operation,
                error: error.message
            });
        }
    }
    
    /**
     * Check templates
     */
    async checkTemplates() {
        const module = 'pipeline-checker';
        const operation = 'check-templates';
        
        try {
            const requiredTemplates = [
                path.join(__dirname, '../templates/index.html'),
                path.join(__dirname, '../templates/article.html'),
                path.join(__dirname, '../templates/styles.css'),
                path.join(__dirname, '../templates/main.js')
            ];
            
            const missing = [];
            
            requiredTemplates.forEach(template => {
                if (!fs.existsSync(template)) {
                    missing.push(path.basename(template));
                }
            });
            
            if (missing.length > 0) {
                this.fail('Templates', `Missing required templates: ${missing.join(', ')}`, {
                    module,
                    operation,
                    missing
                });
            } else {
                this.pass('Templates', 'All required templates present');
            }
            
            // Check prompt templates
            const promptDir = path.join(__dirname, 'prompts');
            if (!fs.existsSync(promptDir)) {
                this.warn('Templates', 'Prompts directory not found, will use default prompts');
            } else {
                const promptFiles = fs.readdirSync(promptDir).filter(f => f.endsWith('.md'));
                if (promptFiles.length === 0) {
                    this.warn('Templates', 'No prompt templates found, will use default prompts');
                } else {
                    this.pass('Templates', `Found ${promptFiles.length} prompt templates`);
                }
            }
            
        } catch (error) {
            this.fail('Templates', `Template check failed: ${error.message}`, {
                module,
                operation,
                error: error.message
            });
        }
    }
    
    /**
     * Check directory structure
     */
    async checkDirectoryStructure() {
        const module = 'pipeline-checker';
        const operation = 'check-directories';
        
        try {
            const expectedStructure = {
                'data': ['cache', 'logs'],
                'dist': ['images', 'articles'],
                'templates': [],
                'generator': ['prompts', 'utils']
            };
            
            let allGood = true;
            
            Object.entries(expectedStructure).forEach(([dir, subdirs]) => {
                const dirPath = path.join(__dirname, '..', dir);
                if (!fs.existsSync(dirPath)) {
                    console.log(`   ⚠️ Directory missing: ${dir} (will be created when needed)`);
                }
            });
            
            this.pass('Directory Structure', 'Directory structure check completed');
            
        } catch (error) {
            this.warn('Directory Structure', `Directory structure check warning: ${error.message}`);
        }
    }
    
    /**
     * Record a passing check
     */
    pass(category, message) {
        this.results.passed.push({ category, message, timestamp: new Date().toISOString() });
        console.log(`   ✅ ${category}: ${message}`);
    }
    
    /**
     * Record a failing check
     */
    fail(category, message, context = {}) {
        this.results.failed.push({ category, message, timestamp: new Date().toISOString() });
        
        const error = new Error(message);
        this.errorLogger.log(error, {
            module: context.module || 'pipeline-checker',
            operation: context.operation || 'check',
            category: 'pipeline',
            severity: 'error',
            metadata: context
        });
        
        console.error(`   ❌ ${category}: ${message}`);
    }
    
    /**
     * Record a warning
     */
    warn(category, message, context = {}) {
        this.results.warnings.push({ category, message, timestamp: new Date().toISOString() });
        
        const error = new Error(message);
        this.errorLogger.log(error, {
            module: context.module || 'pipeline-checker',
            operation: context.operation || 'check',
            category: 'pipeline',
            severity: 'warning',
            metadata: context
        });
        
        console.warn(`   ⚠️ ${category}: ${message}`);
    }
    
    /**
     * Print check results
     */
    printResults() {
        console.log('\n📊 Pre-Flight Check Results:');
        console.log('='.repeat(60));
        console.log(`✅ Passed: ${this.results.passed.length}`);
        console.log(`❌ Failed: ${this.results.failed.length}`);
        console.log(`⚠️ Warnings: ${this.results.warnings.length}`);
        
        if (this.results.failed.length > 0) {
            console.log('\n❌ Failed Checks:');
            this.results.failed.forEach(check => {
                console.log(`   - [${check.category}] ${check.message}`);
            });
        }
        
        if (this.results.warnings.length > 0) {
            console.log('\n⚠️ Warnings:');
            this.results.warnings.forEach(warning => {
                console.log(`   - [${warning.category}] ${warning.message}`);
            });
        }
        
        console.log('='.repeat(60));
        
        if (this.results.failed.length === 0) {
            console.log('✅ All critical checks passed!\n');
        } else {
            console.log('❌ Some checks failed. Please fix errors before proceeding.\n');
        }
    }
    
    /**
     * Validate pipeline stage
     */
    validateStage(stageName, stageOutput, expectedFields = []) {
        const module = 'pipeline-checker';
        const operation = 'validate-stage';
        
        try {
            if (!stageOutput) {
                throw new Error(`Stage ${stageName} produced no output`);
            }
            
            // Check expected fields if provided
            if (expectedFields.length > 0 && typeof stageOutput === 'object') {
                const missing = expectedFields.filter(field => !(field in stageOutput));
                if (missing.length > 0) {
                    throw new Error(`Stage ${stageName} missing fields: ${missing.join(', ')}`);
                }
            }
            
            // Check content length for string outputs
            if (typeof stageOutput === 'string' && stageOutput.trim().length < 50) {
                this.warn('Pipeline Validation', `Stage ${stageName} output seems short (${stageOutput.length} chars)`, {
                    module,
                    operation,
                    stage: stageName
                });
            }
            
            return { valid: true, message: `Stage ${stageName} validation passed` };
            
        } catch (error) {
            this.errorLogger.log(error, {
                module,
                operation,
                category: 'pipeline',
                severity: 'error',
                metadata: { stage: stageName }
            });
            
            return { valid: false, message: error.message, error };
        }
    }
    
    /**
     * Validate article structure
     */
    validateArticle(article) {
        const module = 'pipeline-checker';
        const operation = 'validate-article';
        
        try {
            const required = ['title', 'content'];
            const missing = required.filter(field => !article[field] || (typeof article[field] === 'string' && article[field].trim().length === 0));
            
            if (missing.length > 0) {
                throw new Error(`Article missing required fields: ${missing.join(', ')}`);
            }
            
            // Validate content length
            const textContent = article.content.replace(/<[^>]*>/g, '').trim();
            if (textContent.length < 100) {
                this.warn('Article Validation', `Article content seems short (${textContent.length} chars)`, {
                    module,
                    operation
                });
            }
            
            return { valid: true, message: 'Article structure valid' };
            
        } catch (error) {
            this.errorLogger.log(error, {
                module,
                operation,
                category: 'validation',
                severity: 'error'
            });
            
            return { valid: false, message: error.message, error };
        }
    }
}

module.exports = PipelineChecker;

