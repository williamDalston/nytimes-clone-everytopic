/**
 * Validation utilities for article generation
 * Phase 2: Input validation and output structure validation
 */

/**
 * Validate topic input
 */
function validateTopic(topic) {
    if (!topic || typeof topic !== 'string') {
        throw new Error('Topic must be a non-empty string');
    }
    
    const trimmed = topic.trim();
    if (trimmed.length === 0) {
        throw new Error('Topic cannot be empty');
    }
    
    if (trimmed.length > 200) {
        throw new Error('Topic must be less than 200 characters');
    }
    
    return trimmed;
}

/**
 * Validate article structure
 */
function validateArticleStructure(article) {
    if (!article || typeof article !== 'object') {
        return { valid: false, errors: ['Article must be an object'] };
    }
    
    const errors = [];
    const warnings = [];
    
    // Required fields
    if (!article.title || typeof article.title !== 'string' || article.title.trim().length === 0) {
        errors.push('Article must have a non-empty title');
    }
    
    if (!article.content || typeof article.content !== 'string' || article.content.trim().length === 0) {
        errors.push('Article must have non-empty content');
    }
    
    // Optional but recommended fields
    if (!article.excerpt) {
        warnings.push('Article should have an excerpt');
    }
    
    if (!article.author) {
        warnings.push('Article should have an author');
    }
    
    // Content quality checks
    if (article.content) {
        const textContent = article.content.replace(/<[^>]*>/g, '').trim();
        if (textContent.length < 100) {
            warnings.push('Article content seems too short (less than 100 characters)');
        }
        
        // Check for common AI patterns
        const aiPatterns = [
            /delve into/gi,
            /it's important to note/gi,
            /furthermore/gi,
            /it is crucial that/gi,
            /it's worth noting/gi
        ];
        
        const foundPatterns = aiPatterns.filter(pattern => pattern.test(textContent));
        if (foundPatterns.length > 0) {
            warnings.push(`Article contains AI-sounding phrases: ${foundPatterns.length} detected`);
        }
    }
    
    return {
        valid: errors.length === 0,
        errors,
        warnings
    };
}

/**
 * Validate JSON response from LLM
 */
function validateJSONResponse(response, schema = null) {
    if (typeof response !== 'string') {
        return { valid: false, error: 'Response must be a string' };
    }
    
    try {
        // Try to find JSON in response
        const jsonStart = response.indexOf('{');
        const jsonEnd = response.lastIndexOf('}') + 1;
        
        if (jsonStart === -1 || jsonEnd === 0) {
            return { valid: false, error: 'No JSON found in response' };
        }
        
        const jsonText = response.substring(jsonStart, jsonEnd);
        const parsed = JSON.parse(jsonText);
        
        // Basic schema validation if provided
        if (schema) {
            const schemaErrors = validateAgainstSchema(parsed, schema);
            if (schemaErrors.length > 0) {
                return { valid: false, error: `Schema validation failed: ${schemaErrors.join(', ')}` };
            }
        }
        
        return { valid: true, data: parsed };
    } catch (e) {
        return { valid: false, error: `JSON parsing failed: ${e.message}` };
    }
}

/**
 * Validate against a simple schema
 */
function validateAgainstSchema(data, schema) {
    const errors = [];
    
    if (typeof schema !== 'object' || schema === null) {
        return errors;
    }
    
    for (const [key, rules] of Object.entries(schema)) {
        if (rules.required && !(key in data)) {
            errors.push(`Missing required field: ${key}`);
            continue;
        }
        
        if (key in data) {
            const value = data[key];
            
            if (rules.type && typeof value !== rules.type) {
                errors.push(`Field ${key} must be of type ${rules.type}`);
            }
            
            if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
                errors.push(`Field ${key} must be at least ${rules.minLength} characters`);
            }
            
            if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
                errors.push(`Field ${key} must be at most ${rules.maxLength} characters`);
            }
        }
    }
    
    return errors;
}

/**
 * Sanitize topic string
 */
function sanitizeTopic(topic) {
    if (typeof topic !== 'string') {
        return '';
    }
    
    return topic
        .trim()
        .replace(/[<>]/g, '') // Remove HTML brackets
        .replace(/\s+/g, ' ') // Normalize whitespace
        .substring(0, 200); // Limit length
}

/**
 * Validate pipeline stage name
 */
function validateStageName(stage) {
    const validStages = ['blueprint', 'draft', 'enhance', 'humanize', 'seo', 'default'];
    if (!validStages.includes(stage)) {
        throw new Error(`Invalid stage name: ${stage}. Valid stages: ${validStages.join(', ')}`);
    }
    return stage;
}

module.exports = {
    validateTopic,
    validateArticleStructure,
    validateJSONResponse,
    validateAgainstSchema,
    sanitizeTopic,
    validateStageName
};

