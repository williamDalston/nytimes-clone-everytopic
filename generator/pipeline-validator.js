/**
 * Pipeline Validator
 * Validates pipeline stages and data flow throughout the generation process
 */

const ErrorLogger = require('./error-logger');
const PipelineChecker = require('./pipeline-checker');
const { validateArticleStructure } = require('./utils/validation');

class PipelineValidator {
    constructor(options = {}) {
        this.errorLogger = options.errorLogger || new ErrorLogger();
        this.pipelineChecker = options.pipelineChecker || new PipelineChecker({ errorLogger: this.errorLogger });
        this.validationResults = [];
    }
    
    /**
     * Validate entire pipeline execution
     */
    async validatePipeline(operation, stages = []) {
        const startTime = Date.now();
        const validation = {
            operation,
            stages: [],
            startTime: new Date().toISOString(),
            errors: [],
            warnings: [],
            passed: true
        };
        
        console.log(`🔍 Validating pipeline: ${operation}`);
        
        // Pre-flight checks
        const preFlight = await this.pipelineChecker.runPreFlightChecks();
        if (!preFlight.allPassed) {
            validation.errors.push({
                stage: 'pre-flight',
                message: `${preFlight.failed} pre-flight checks failed`,
                critical: true
            });
            validation.passed = false;
        }
        
        // Validate each stage
        for (const stage of stages) {
            const stageValidation = await this.validateStage(stage);
            validation.stages.push(stageValidation);
            
            if (!stageValidation.valid) {
                validation.errors.push({
                    stage: stage.name,
                    message: stageValidation.message,
                    critical: stageValidation.critical || false
                });
                if (stageValidation.critical) {
                    validation.passed = false;
                }
            }
            
            if (stageValidation.warnings && stageValidation.warnings.length > 0) {
                validation.warnings.push(...stageValidation.warnings.map(w => ({
                    stage: stage.name,
                    message: w
                })));
            }
        }
        
        validation.endTime = new Date().toISOString();
        validation.duration = Date.now() - startTime;
        
        this.validationResults.push(validation);
        
        // Print validation summary
        this.printValidationSummary(validation);
        
        return validation;
    }
    
    /**
     * Validate a pipeline stage
     */
    async validateStage(stage) {
        const result = {
            name: stage.name || 'unknown',
            valid: true,
            message: '',
            errors: [],
            warnings: [],
            critical: false
        };
        
        try {
            // Validate stage has required properties
            if (!stage.name) {
                result.valid = false;
                result.errors.push('Stage missing name');
                result.critical = true;
            }
            
            // Validate stage output if present
            if (stage.output !== undefined) {
                const outputValidation = this.pipelineChecker.validateStage(stage.name, stage.output, stage.expectedFields || []);
                
                if (!outputValidation.valid) {
                    result.valid = false;
                    result.errors.push(outputValidation.message);
                    result.critical = stage.critical || false;
                }
                
                if (outputValidation.warnings) {
                    result.warnings.push(...outputValidation.warnings);
                }
            }
            
            // Validate stage timing
            if (stage.duration !== undefined) {
                if (stage.duration > 60000) { // More than 1 minute
                    result.warnings.push(`Stage took ${(stage.duration / 1000).toFixed(1)}s, may indicate performance issues`);
                }
            }
            
            // Validate stage dependencies
            if (stage.dependencies && stage.dependencies.length > 0) {
                for (const dep of stage.dependencies) {
                    // Check if dependency was successfully completed
                    if (dep.required && !dep.completed) {
                        result.valid = false;
                        result.errors.push(`Missing required dependency: ${dep.name}`);
                        result.critical = true;
                    }
                }
            }
            
            if (result.errors.length === 0 && result.warnings.length === 0) {
                result.message = `Stage ${stage.name} validation passed`;
            } else if (result.errors.length > 0) {
                result.message = `Stage ${stage.name} validation failed: ${result.errors.join(', ')}`;
            } else {
                result.message = `Stage ${stage.name} validation passed with warnings`;
            }
            
        } catch (error) {
            this.errorLogger.log(error, {
                module: 'pipeline-validator',
                operation: 'validate-stage',
                category: 'pipeline',
                severity: 'error',
                metadata: { stage: stage.name }
            });
            
            result.valid = false;
            result.errors.push(error.message);
            result.message = `Stage ${stage.name} validation error: ${error.message}`;
            result.critical = true;
        }
        
        return result;
    }
    
    /**
     * Validate article data
     */
    validateArticle(article, context = {}) {
        const module = 'pipeline-validator';
        const operation = 'validate-article';
        
        try {
            // Use existing validation utility
            const validation = validateArticleStructure(article);
            
            if (!validation.valid) {
                const error = new Error(`Article validation failed: ${validation.errors.join(', ')}`);
                this.errorLogger.log(error, {
                    module,
                    operation,
                    category: 'validation',
                    severity: 'error',
                    metadata: {
                        ...context,
                        errors: validation.errors
                    }
                });
            }
            
            if (validation.warnings && validation.warnings.length > 0) {
                validation.warnings.forEach(warning => {
                    const warnError = new Error(warning);
                    this.errorLogger.log(warnError, {
                        module,
                        operation,
                        category: 'validation',
                        severity: 'warning',
                        metadata: context
                    });
                });
            }
            
            return validation;
            
        } catch (error) {
            this.errorLogger.log(error, {
                module,
                operation,
                category: 'validation',
                severity: 'error',
                metadata: context
            });
            
            return {
                valid: false,
                errors: [error.message],
                warnings: []
            };
        }
    }
    
    /**
     * Validate configuration before operation
     */
    validateConfiguration(config, requiredFields = []) {
        const module = 'pipeline-validator';
        const operation = 'validate-configuration';
        
        const missing = [];
        const invalid = [];
        
        try {
            requiredFields.forEach(field => {
                const parts = field.split('.');
                let value = config;
                for (const part of parts) {
                    value = value?.[part];
                }
                
                if (value === undefined || value === null) {
                    missing.push(field);
                } else if (value === '' || (typeof value === 'string' && value.includes('placeholder'))) {
                    invalid.push(field);
                }
            });
            
            if (missing.length > 0 || invalid.length > 0) {
                const errors = [];
                if (missing.length > 0) {
                    errors.push(`Missing fields: ${missing.join(', ')}`);
                }
                if (invalid.length > 0) {
                    errors.push(`Invalid/placeholder fields: ${invalid.join(', ')}`);
                }
                
                const error = new Error(`Configuration validation failed: ${errors.join('; ')}`);
                this.errorLogger.log(error, {
                    module,
                    operation,
                    category: 'config',
                    severity: 'error',
                    metadata: { missing, invalid }
                });
                
                return {
                    valid: false,
                    errors,
                    missing,
                    invalid
                };
            }
            
            return {
                valid: true,
                errors: [],
                missing: [],
                invalid: []
            };
            
        } catch (error) {
            this.errorLogger.log(error, {
                module,
                operation,
                category: 'config',
                severity: 'error'
            });
            
            return {
                valid: false,
                errors: [error.message],
                missing: [],
                invalid: []
            };
        }
    }
    
    /**
     * Validate file operation
     */
    validateFileOperation(operation, filePath, required = true) {
        const module = 'pipeline-validator';
        const operationName = `validate-file-${operation}`;
        
        try {
            const fs = require('fs');
            const path = require('path');
            
            const exists = fs.existsSync(filePath);
            
            if (required && !exists) {
                const error = new Error(`Required file not found: ${filePath}`);
                this.errorLogger.log(error, {
                    module,
                    operation: operationName,
                    category: 'file_system',
                    severity: 'error',
                    metadata: { filePath, operation }
                });
                
                return {
                    valid: false,
                    exists: false,
                    message: `File not found: ${path.basename(filePath)}`
                };
            }
            
            if (exists) {
                // Check if file is readable
                try {
                    fs.accessSync(filePath, fs.constants.R_OK);
                } catch (error) {
                    const err = new Error(`File not readable: ${filePath}`);
                    this.errorLogger.log(err, {
                        module,
                        operation: operationName,
                        category: 'file_system',
                        severity: 'error',
                        metadata: { filePath, operation }
                    });
                    
                    return {
                        valid: false,
                        exists: true,
                        readable: false,
                        message: `File not readable: ${path.basename(filePath)}`
                    };
                }
            }
            
            return {
                valid: true,
                exists,
                readable: exists,
                message: exists ? `File exists: ${path.basename(filePath)}` : `File optional: ${path.basename(filePath)}`
            };
            
        } catch (error) {
            this.errorLogger.log(error, {
                module,
                operation: operationName,
                category: 'file_system',
                severity: 'error',
                metadata: { filePath, operation }
            });
            
            return {
                valid: false,
                exists: false,
                message: `File validation error: ${error.message}`
            };
        }
    }
    
    /**
     * Print validation summary
     */
    printValidationSummary(validation) {
        console.log('\n📊 Pipeline Validation Summary:');
        console.log('='.repeat(60));
        console.log(`Operation: ${validation.operation}`);
        console.log(`Duration: ${(validation.duration / 1000).toFixed(2)}s`);
        console.log(`Stages: ${validation.stages.length}`);
        
        const passedStages = validation.stages.filter(s => s.valid).length;
        const failedStages = validation.stages.filter(s => !s.valid).length;
        
        console.log(`✅ Passed: ${passedStages}`);
        console.log(`❌ Failed: ${failedStages}`);
        console.log(`⚠️ Warnings: ${validation.warnings.length}`);
        
        if (failedStages > 0) {
            console.log('\n❌ Failed Stages:');
            validation.stages.filter(s => !s.valid).forEach(stage => {
                console.log(`   - ${stage.name}: ${stage.message}`);
            });
        }
        
        if (validation.errors.length > 0) {
            console.log('\n❌ Critical Errors:');
            validation.errors.filter(e => e.critical).forEach(error => {
                console.log(`   - [${error.stage}] ${error.message}`);
            });
        }
        
        if (validation.warnings.length > 0 && validation.warnings.length <= 5) {
            console.log('\n⚠️ Warnings:');
            validation.warnings.forEach(warning => {
                console.log(`   - [${warning.stage}] ${warning.message}`);
            });
        } else if (validation.warnings.length > 5) {
            console.log(`\n⚠️ ${validation.warnings.length} warnings (use error report for details)`);
        }
        
        console.log('='.repeat(60));
        
        if (validation.passed) {
            console.log('✅ Pipeline validation passed!\n');
        } else {
            console.log('❌ Pipeline validation failed. Check errors above.\n');
        }
    }
    
    /**
     * Get validation report
     */
    getReport() {
        return {
            timestamp: new Date().toISOString(),
            totalValidations: this.validationResults.length,
            passed: this.validationResults.filter(v => v.passed).length,
            failed: this.validationResults.filter(v => !v.passed).length,
            validations: this.validationResults
        };
    }
    
    /**
     * Clear validation results
     */
    clear() {
        this.validationResults = [];
    }
}

module.exports = PipelineValidator;

