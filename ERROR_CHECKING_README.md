# Error Checking and Pipeline Validation System

## Overview

A comprehensive error checking and pipeline validation system has been implemented to ensure robust operation and easy debugging. The system includes:

1. **Error Logger** - Structured error logging with categorization and severity tracking
2. **Pipeline Checker** - Pre-flight health checks for all components
3. **Pipeline Validator** - Real-time validation during pipeline execution
4. **Standalone Check Script** - Run health checks independently

## Components

### 1. Error Logger (`generator/error-logger.js`)

Provides centralized error logging with:

- **Structured Logging**: Errors are logged with metadata (module, operation, category, severity)
- **Automatic Categorization**: Errors are automatically categorized (validation, API, file_system, pipeline, network, config)
- **Severity Levels**: Critical, Error, Warning, Info
- **Error Tracking**: Tracks error frequency and patterns
- **Detailed Reports**: Generates comprehensive error reports

**Usage:**
```javascript
const ErrorLogger = require('./error-logger');
const errorLogger = new ErrorLogger();

errorLogger.log(error, {
    module: 'build',
    operation: 'read-file',
    category: 'file_system',
    severity: 'error',
    metadata: { filePath: '/path/to/file' }
});

// Generate report
errorLogger.printReport();
```

### 2. Pipeline Checker (`generator/pipeline-checker.js`)

Runs comprehensive pre-flight checks before operations:

- **Configuration Checks**: Validates all required config fields
- **Environment Checks**: Verifies environment variables and API keys
- **File System Checks**: Ensures directories exist and are writable
- **API Checks**: Validates API clients can be initialized
- **Dependencies Checks**: Verifies all required packages are installed
- **Template Checks**: Validates templates and prompts exist

**Usage:**
```javascript
const PipelineChecker = require('./pipeline-checker');
const checker = new PipelineChecker({ errorLogger });

const results = await checker.runPreFlightChecks();
if (!results.allPassed) {
    // Handle failures
}
```

### 3. Pipeline Validator (`generator/pipeline-validator.js`)

Validates pipeline stages and data during execution:

- **Stage Validation**: Validates each pipeline stage output
- **Article Validation**: Validates article structure and content
- **Configuration Validation**: Validates config before operations
- **File Operation Validation**: Validates file reads/writes
- **Real-time Monitoring**: Tracks validation results throughout execution

**Usage:**
```javascript
const PipelineValidator = require('./pipeline-validator');
const validator = new PipelineValidator({ errorLogger, pipelineChecker });

// Validate article
const validation = validator.validateArticle(article, {
    articleId: 1,
    operation: 'generation'
});

// Validate file operation
const fileValidation = validator.validateFileOperation('read', filePath, true);
```

### 4. Standalone Check Script (`generator/check.js`)

Run health checks independently:

```bash
# Run health checks
npm run check

# Run health checks with error report
npm run check:report

# Export error report to file
node generator/check.js --report --export error-report.json
```

## Integration

All main modules have been integrated with error checking:

### Build Module (`generator/build.js`)
- Pre-flight checks before building
- Validates templates and files
- Validates article structure
- Error logging throughout build process

### Bulk Generation Module (`generator/bulk.js`)
- Pre-flight checks before generation
- Validates each article during generation
- Tracks errors per article
- Error report after completion

### Content Module (`generator/content.js`)
- Error logging for article generation
- Validation warnings and errors
- Error tracking with context

### Deploy Module (`generator/deploy.js`)
- Pre-flight checks before deployment
- Validates dist directory exists
- Error logging for deployment operations

## Error Categories

Errors are automatically categorized:

- **validation**: Validation errors (missing fields, invalid data)
- **api**: API errors (rate limits, connection issues)
- **file_system**: File system errors (missing files, permission issues)
- **pipeline**: Pipeline errors (stage failures, flow issues)
- **network**: Network errors (connection failures, timeouts)
- **config**: Configuration errors (missing config, invalid values)
- **unknown**: Unrecognized errors

## Severity Levels

- **critical**: Fatal errors that stop execution
- **error**: Errors that need attention but may not stop execution
- **warning**: Warnings that don't stop execution but indicate issues
- **info**: Informational messages

## Error Reports

Error reports provide:

- **Summary**: Total errors, breakdown by category and severity
- **Recent Errors**: Last 10 errors with details
- **Critical Errors**: All critical errors
- **Top Errors**: Most frequent errors by count
- **Detailed Logs**: Full error entries with stack traces and context

## Usage Examples

### Running Health Checks

```bash
# Quick health check
npm run check

# Detailed check with report
npm run check:report

# Export report to file
node generator/check.js --report --export errors.json
```

### Checking Errors During Operations

All operations automatically:
1. Run pre-flight checks
2. Log errors with context
3. Validate data at key points
4. Generate error reports if errors occur

### Accessing Error Logs

Error logs are stored in `data/logs/errors.json`:

```javascript
const ErrorLogger = require('./error-logger');
const errorLogger = new ErrorLogger();

// Get recent errors
const recent = errorLogger.getRecent(10);

// Get errors by category
const apiErrors = errorLogger.getByCategory('api');

// Get summary
const summary = errorLogger.getSummary();

// Generate full report
const report = errorLogger.generateReport();
```

## Best Practices

1. **Run health checks first**: Always run `npm run check` before operations
2. **Review error reports**: Check error reports after operations to identify issues
3. **Fix critical errors**: Address critical errors before proceeding
4. **Monitor warnings**: Warnings may indicate future issues
5. **Export reports**: Export error reports for debugging and analysis

## Error Log Structure

Each error entry contains:

```json
{
  "id": "unique-error-id",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "message": "Error message",
  "stack": "Error stack trace",
  "category": "validation",
  "severity": "error",
  "context": {
    "module": "build",
    "operation": "read-file"
  },
  "metadata": {
    "filePath": "/path/to/file"
  }
}
```

## Troubleshooting

### Common Issues

1. **Pre-flight checks fail**: 
   - Check environment variables
   - Verify dependencies are installed
   - Ensure directories are writable

2. **Validation errors**:
   - Review error messages for missing fields
   - Check data structure matches expected format
   - Validate configuration values

3. **API errors**:
   - Check API keys are set correctly
   - Verify API rate limits aren't exceeded
   - Check network connectivity

4. **File system errors**:
   - Ensure directories exist
   - Check file permissions
   - Verify file paths are correct

## Benefits

- **Easy Debugging**: Detailed error logs with context make it easy to pinpoint issues
- **Proactive Monitoring**: Pre-flight checks catch issues before they cause problems
- **Error Tracking**: Track error patterns and frequency over time
- **Comprehensive Reports**: Generate detailed reports for analysis
- **Non-blocking**: Errors are logged but don't necessarily stop execution
- **Centralized Logging**: All errors in one place for easy access

