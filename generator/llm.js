require('dotenv').config(); // Load environment variables first
const OpenAI = require('openai');
const path = require('path');
const fs = require('fs');
const ArticleCache = require('./cache');
const config = require('./config');
const CostTracker = require('./cost-tracker');

/**
 * LLM Client with caching and error handling
 * Based on Marketing System's LLM client pattern
 */
class LLMClient {
    constructor(options = {}) {
        this.apiKey = options.apiKey || process.env.OPENAI_API_KEY || config.api.llm;
        this.model = options.model || 'gpt-4o-mini';
        this.cacheDir = options.cacheDir || path.join(__dirname, '../data/cache');
        this.cache = new ArticleCache(this.cacheDir);
        this.dryRun = options.dryRun || false;
        this.maxRetries = options.maxRetries || 3;
        this.retryDelay = options.retryDelay || 1000; // ms
        // Initialize cost tracker (Phase 4)
        this.costTracker = options.costTracker || new CostTracker({
            budget: options.budget || process.env.API_BUDGET ? parseFloat(process.env.API_BUDGET) : null
        });

        if (this.apiKey && this.apiKey !== 'placeholder-llm-key' && !this.dryRun) {
            this.client = new OpenAI({ apiKey: this.apiKey });
        } else {
            console.warn('⚠️ OpenAI API key not set. Using dry-run mode.');
            this.dryRun = true;
        }
    }

    /**
     * Sleep utility for retry delays
     */
    _sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Call OpenAI API with retry logic
     */
    async _callAPI(prompt, options = {}) {
        if (this.dryRun) {
            console.log('🔵 DRY RUN: Would call OpenAI API');
            return {
                title: `Mock Article: ${options.topic || 'Untitled'}`,
                excerpt: `This is a mock article generated in dry-run mode.`,
                content: `<p>This is placeholder content. Set OPENAI_API_KEY to generate real articles.</p>`,
                author: 'AI Analyst',
                date: new Date().toISOString().split('T')[0],
                readTime: '5 min read',
                category: options.category || 'AI Insights'
            };
        }

        if (!this.client) {
            throw new Error('OpenAI client not initialized. Check API key.');
        }

        const model = options.model || this.model;
        let lastError;

        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                const response = await this.client.chat.completions.create({
                    model,
                    messages: [
                        {
                            role: 'system',
                            content: 'You are an expert content writer specializing in creating high-quality, engaging articles with natural human voice.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: options.temperature || 0.7,
                    max_tokens: options.maxTokens || 2000
                });

                // Track token usage and cost (Phase 3)
                const usage = response.usage || {};
                const inputTokens = usage.prompt_tokens || 0;
                const outputTokens = usage.completion_tokens || 0;
                const content = response.choices[0].message.content;
                
                // Return content with token usage metadata
                const result = {
                    content: content,
                    _tokenUsage: {
                        input: inputTokens,
                        output: outputTokens,
                        total: usage.total_tokens || (inputTokens + outputTokens)
                    }
                };

                return result;
            } catch (error) {
                lastError = error;
                
                // Handle rate limits
                if (error.status === 429 || error.code === 'rate_limit_exceeded') {
                    const delay = this.retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
                    console.warn(`⏳ Rate limit hit. Retrying in ${delay}ms... (attempt ${attempt}/${this.maxRetries})`);
                    await this._sleep(delay);
                    continue;
                }

                // Handle other errors
                if (attempt < this.maxRetries) {
                    const delay = this.retryDelay * attempt;
                    console.warn(`⚠️ API error. Retrying in ${delay}ms... (attempt ${attempt}/${this.maxRetries})`);
                    await this._sleep(delay);
                } else {
                    throw error;
                }
            }
        }

        throw lastError || new Error('Failed to call OpenAI API after retries');
    }

    /**
     * Parse JSON response with fallback
     */
    _parseJSONResponse(response) {
        // Try to find JSON in response
        const jsonStart = response.indexOf('{');
        const jsonEnd = response.lastIndexOf('}') + 1;

        if (jsonStart === -1 || jsonEnd === 0) {
            // If no JSON found, treat entire response as content
            return { content: response };
        }

        try {
            const jsonText = response.substring(jsonStart, jsonEnd);
            return JSON.parse(jsonText);
        } catch (e) {
            console.warn('⚠️ Failed to parse JSON response. Using raw content.');
            return { content: response };
        }
    }

    /**
     * Get cached article if available
     */
    getCachedArticle(topic, promptVersion = 'v1') {
        const cached = this.cache.get(topic, promptVersion);
        return cached && cached.article ? cached.article : null;
    }

    /**
     * Get cached article by stage (for pipeline)
     */
    getCachedStageOutput(topic, stage, promptVersion = 'v1') {
        const stageCacheKey = `${topic}_${stage}_${promptVersion}`;
        const cached = this.cache.get(stageCacheKey, promptVersion);
        return cached && cached.article ? cached.article : null;
    }

    /**
     * Generate article with caching
     * Phase 3: Now tracks token usage and costs
     */
    async generateArticle(topic, options = {}) {
        const promptVersion = options.promptVersion || 'v1';
        const useCache = options.useCache !== false;

        // Check cache first
        if (useCache) {
            const cached = this.cache.get(topic, promptVersion);
            if (cached && cached.article) {
                return cached.article;
            }
        }

        // Load prompt template
        const prompt = await this._loadPrompt(options.stage || 'default', { topic });

        // Call API
        const apiResponse = await this._callAPI(prompt, {
            ...options,
            topic
        });

        // Extract content and token usage (Phase 3)
        let rawResponse;
        let tokenUsage = null;
        if (apiResponse && typeof apiResponse === 'object' && apiResponse._tokenUsage) {
            tokenUsage = apiResponse._tokenUsage;
            rawResponse = apiResponse.content || String(apiResponse);
        } else {
            rawResponse = apiResponse;
        }

        // Parse response
        let article;
        if (typeof rawResponse === 'string') {
            article = this._parseArticleFromText(rawResponse, topic, options);
        } else {
            article = rawResponse; // Already structured
        }

        // Phase 3: Track cost for single-stage generation
        // Track costs (Phase 4: with error handling)
        if (this.costTracker && tokenUsage && tokenUsage.input > 0) {
            try {
                const articleId = options.articleId || `article-${Date.now()}`;
                this.costTracker.trackLLMCost(
                    options.model || this.model,
                    tokenUsage.input,
                    tokenUsage.output,
                    articleId
                );
            } catch (error) {
                // Don't let cost tracking errors break article generation
                console.warn(`⚠️ Cost tracking failed: ${error.message}`);
            }
            article._tokenUsage = tokenUsage;
        }

        // Cache the result
        if (useCache) {
            this.cache.set(topic, article, promptVersion);
        }

        return article;
    }

    /**
     * Load prompt template from file
     * Phase 2: Enhanced variable substitution with validation
     */
    async _loadPrompt(stage, variables = {}) {
        const promptFile = path.join(__dirname, 'prompts', `${stage}.md`);
        
        if (!fs.existsSync(promptFile)) {
            // Fallback to default prompt
            return this._getDefaultPrompt(variables.topic);
        }

        let prompt = fs.readFileSync(promptFile, 'utf8');
        
        // Phase 2: Enhanced variable substitution
        // Replace variables with proper escaping
        Object.keys(variables).forEach(key => {
            const value = variables[key] || '';
            // Escape special regex characters in the value
            const escapedValue = String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            // Replace all occurrences
            const regex = new RegExp(`\\{${key}\\}`, 'g');
            prompt = prompt.replace(regex, value);
        });
        
        // Check for unreplaced variables (warn but don't fail)
        const unreplacedVars = prompt.match(/\{(\w+)\}/g);
        if (unreplacedVars && unreplacedVars.length > 0) {
            console.warn(`⚠️ Unreplaced variables in prompt: ${unreplacedVars.join(', ')}`);
        }

        return prompt;
    }

    /**
     * Default prompt if template not found
     */
    _getDefaultPrompt(topic) {
        return `Write a comprehensive, engaging article about: ${topic}

Requirements:
- Title: Catchy, SEO-friendly title
- Excerpt: 2-3 sentence summary (150-200 characters)
- Content: 800-1200 word article in HTML format
- Structure: Introduction, 3-5 main sections, conclusion
- Style: Natural, human-like voice. Avoid AI-sounding phrases like "delve into", "it's important to note"
- Include: Practical insights, examples, actionable takeaways

Output format: JSON with fields: title, excerpt, content (HTML), author, category`;
    }

    /**
     * Parse article from text response
     */
    _parseArticleFromText(text, topic, options = {}) {
        // Try to extract structured data from text
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try {
                const parsed = JSON.parse(jsonMatch[0]);
                return {
                    title: parsed.title || `The Future of ${topic}: What You Need to Know`,
                    excerpt: parsed.excerpt || `An in-depth look at ${topic} and its impact.`,
                    content: parsed.content || `<p>${text}</p>`,
                    author: parsed.author || 'AI Analyst',
                    date: parsed.date || new Date().toISOString().split('T')[0],
                    readTime: parsed.readTime || this._calculateReadTime(parsed.content || text),
                    category: parsed.category || options.category || 'AI Insights'
                };
            } catch (e) {
                // Fall through to default parsing
            }
        }

        // Default parsing if JSON not found
        return {
            title: `The Future of ${topic}: What You Need to Know`,
            excerpt: `An in-depth look at ${topic} and its impact on the industry.`,
            content: `<p>${text}</p>`,
            author: 'AI Analyst',
            date: new Date().toISOString().split('T')[0],
            readTime: this._calculateReadTime(text),
            category: options.category || 'AI Insights'
        };
    }

    /**
     * Calculate reading time from content
     */
    _calculateReadTime(content) {
        const wordsPerMinute = 200;
        const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
        const minutes = Math.ceil(wordCount / wordsPerMinute);
        return `${minutes} min read`;
    }

    /**
     * Multi-stage generation pipeline with caching and enhanced error handling
     * Phase 2: 3-stage pipeline (blueprint → draft → enhance)
     * Phase 3: Can be extended to 5-stage (add humanize → seo)
     */
    async generateArticlePipeline(topic, options = {}) {
        // Phase 2: Default to 3-stage pipeline (blueprint → draft → enhance)
        // Can be overridden via options.stages for Phase 3 (5-stage)
        const defaultStages = ['blueprint', 'draft', 'enhance'];
        const stages = options.stages || defaultStages;
        const useCache = options.useCache !== false;
        const promptVersion = options.promptVersion || 'v1';
        
        let currentContent = topic;
        const stageOutputs = {}; // Track outputs for validation
        let totalInputTokens = 0;
        let totalOutputTokens = 0;

        console.log(`🚀 Starting ${stages.length}-stage pipeline for: ${topic}`);
        console.log(`📦 Cache: ${useCache ? 'Enabled' : 'Disabled'}`);

        for (let i = 0; i < stages.length; i++) {
            const stage = stages[i];
            console.log(`📝 Stage ${i + 1}/${stages.length}: ${stage}`);

            try {
                // Check cache for this stage
                const stageCacheKey = `${topic}_${stage}_${promptVersion}`;
                let stageOutput = null;
                
                if (useCache) {
                    const cached = this.cache.get(stageCacheKey, promptVersion);
                    if (cached && cached.article) {
                        console.log(`   📦 Cache hit for stage: ${stage}`);
                        stageOutput = cached.article;
                        currentContent = typeof stageOutput === 'string' ? stageOutput : JSON.stringify(stageOutput);
                        stageOutputs[stage] = stageOutput;
                        continue;
                    }
                }

                // Load prompt template
                const stagePrompt = await this._loadPrompt(stage, {
                    topic: i === 0 ? topic : currentContent, // Use original topic for first stage
                    previousContent: currentContent
                });

                // Call API with retry logic
                const apiResponse = await this._callAPI(stagePrompt, {
                    ...options,
                    topic,
                    stage,
                    maxTokens: options.maxTokens || (stage === 'blueprint' ? 1500 : 2500)
                });

                // Extract content and token usage
                if (apiResponse && typeof apiResponse === 'object' && apiResponse._tokenUsage) {
                    // Track token usage
                    totalInputTokens += apiResponse._tokenUsage.input;
                    totalOutputTokens += apiResponse._tokenUsage.output;
                    // Extract content string
                    stageOutput = apiResponse.content || String(apiResponse);
                } else {
                    // It's already a string or doesn't have token usage
                    stageOutput = apiResponse;
                }

                // Validate stage output
                if (!this._validateStageOutput(stageOutput, stage)) {
                    console.warn(`⚠️ Stage ${stage} output validation failed, but continuing...`);
                }

                // Store output
                currentContent = typeof stageOutput === 'string' ? stageOutput : JSON.stringify(stageOutput);
                stageOutputs[stage] = stageOutput;

                // Cache this stage's output
                if (useCache && stageOutput) {
                    this.cache.set(stageCacheKey, stageOutput, promptVersion);
                }

                // Small delay between stages to avoid rate limits
                if (i < stages.length - 1) {
                    await this._sleep(500);
                }
            } catch (error) {
                console.error(`❌ Error in stage ${stage}:`, error.message);
                
                // Enhanced error handling: try to recover
                if (i === 0) {
                    // First stage failed - can't continue
                    throw new Error(`Pipeline failed at initial stage (${stage}): ${error.message}`);
                } else {
                    // Later stage failed - use previous stage output
                    console.warn(`⚠️ Using output from previous stage due to ${stage} failure`);
                    // currentContent already contains previous stage output
                }
            }
        }

        // Final parsing with validation
        const finalArticle = this._parseArticleFromText(currentContent, topic, options);
        
        // Validate final article structure
        if (!this._validateArticleStructure(finalArticle)) {
            console.warn(`⚠️ Final article structure validation failed, but returning result`);
        }

        // Track total cost for this article (Phase 3 feature - optional)
        if (this.costTracker && totalInputTokens > 0) {
            try {
                const articleId = options.articleId || `article-${Date.now()}`;
                this.costTracker.trackLLMCost(
                    options.model || this.model,
                    totalInputTokens,
                    totalOutputTokens,
                    articleId
                );
            } catch (costError) {
                console.warn(`⚠️ Cost tracking failed: ${costError.message}`);
            }
        }

        // Store token usage in article metadata (if available)
        if (totalInputTokens > 0) {
            finalArticle._tokenUsage = {
                input: totalInputTokens,
                output: totalOutputTokens,
                total: totalInputTokens + totalOutputTokens,
                stages: stages.length
            };
        }

        return finalArticle;
    }

    /**
     * Validate stage output quality
     */
    _validateStageOutput(output, stage) {
        if (!output || (typeof output === 'string' && output.trim().length === 0)) {
            return false;
        }

        // Stage-specific validation
        if (stage === 'blueprint') {
            // Blueprint should contain structure indicators
            const hasStructure = typeof output === 'string' 
                ? (output.includes('title') || output.includes('sections') || output.includes('thesis'))
                : (output.title || output.sections || output.thesis);
            return hasStructure;
        }

        if (stage === 'draft' || stage === 'enhance') {
            // Draft/enhance should have substantial content
            const content = typeof output === 'string' ? output : JSON.stringify(output);
            return content.length > 200; // Minimum content length
        }

        return true;
    }

    /**
     * Validate final article structure
     */
    _validateArticleStructure(article) {
        if (!article) return false;
        
        const requiredFields = ['title', 'content'];
        const hasRequiredFields = requiredFields.every(field => article[field]);
        
        if (!hasRequiredFields) return false;
        
        // Content should be substantial
        const contentLength = typeof article.content === 'string' 
            ? article.content.replace(/<[^>]*>/g, '').length 
            : 0;
        
        return contentLength > 100; // Minimum 100 characters of text
    }
}

module.exports = LLMClient;

