/**
 * Retry utility functions
 * Phase 2: Enhanced retry logic with exponential backoff
 */

/**
 * Sleep utility
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {Object} options - Retry options
 * @returns {Promise} - Result of the function
 */
async function retryWithBackoff(fn, options = {}) {
    const {
        maxRetries = 3,
        initialDelay = 1000,
        maxDelay = 30000,
        backoffMultiplier = 2,
        retryableErrors = [],
        onRetry = null
    } = options;
    
    let lastError;
    let delay = initialDelay;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            
            // Check if error is retryable
            if (retryableErrors.length > 0) {
                const isRetryable = retryableErrors.some(retryableError => {
                    if (typeof retryableError === 'string') {
                        return error.message.includes(retryableError);
                    }
                    if (retryableError instanceof RegExp) {
                        return retryableError.test(error.message);
                    }
                    return false;
                });
                
                if (!isRetryable) {
                    throw error; // Don't retry non-retryable errors
                }
            }
            
            // Don't retry on last attempt
            if (attempt >= maxRetries) {
                break;
            }
            
            // Call retry callback if provided
            if (onRetry) {
                onRetry(attempt, error, delay);
            }
            
            // Wait before retrying
            await sleep(delay);
            
            // Calculate next delay with exponential backoff
            delay = Math.min(delay * backoffMultiplier, maxDelay);
        }
    }
    
    throw lastError || new Error('Retry failed');
}

/**
 * Retry with specific error handling for API calls
 */
async function retryAPI(fn, options = {}) {
    const {
        maxRetries = 3,
        initialDelay = 1000,
        onRetry = null
    } = options;
    
    // Common retryable API errors
    const retryableErrors = [
        'rate_limit_exceeded',
        '429',
        'timeout',
        'ECONNRESET',
        'ETIMEDOUT',
        'ENOTFOUND',
        'temporary'
    ];
    
    return retryWithBackoff(fn, {
        maxRetries,
        initialDelay,
        retryableErrors,
        onRetry: (attempt, error, delay) => {
            if (error.status === 429 || error.code === 'rate_limit_exceeded') {
                console.warn(`⏳ Rate limit hit. Retrying in ${delay}ms... (attempt ${attempt}/${maxRetries})`);
            } else {
                console.warn(`⚠️ API error. Retrying in ${delay}ms... (attempt ${attempt}/${maxRetries})`);
            }
            
            if (onRetry) {
                onRetry(attempt, error, delay);
            }
        }
    });
}

/**
 * Retry JSON parsing with fallback
 */
async function retryJSONParse(response, maxAttempts = 3) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            // Try to find JSON in response
            const jsonStart = response.indexOf('{');
            const jsonEnd = response.lastIndexOf('}') + 1;
            
            if (jsonStart === -1 || jsonEnd === 0) {
                if (attempt < maxAttempts) {
                    await sleep(100 * attempt); // Small delay
                    continue;
                }
                return null; // No JSON found
            }
            
            const jsonText = response.substring(jsonStart, jsonEnd);
            return JSON.parse(jsonText);
        } catch (e) {
            if (attempt >= maxAttempts) {
                console.warn(`⚠️ JSON parsing failed after ${maxAttempts} attempts: ${e.message}`);
                return null;
            }
            await sleep(100 * attempt);
        }
    }
    
    return null;
}

module.exports = {
    sleep,
    retryWithBackoff,
    retryAPI,
    retryJSONParse
};

