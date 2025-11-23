require('dotenv').config(); // Load environment variables first
const config = require('./config');
const LLMClient = require('./llm');
const CostTracker = require('./cost-tracker');
const ArticleQualityScorer = require('./quality');
const { TopicManager, ARTICLE_STYLES, ARTICLE_ANGLES } = require('./topics');
const { VoiceSystem } = require('./voice-system');
const { TemplateManager } = require('./templates');
const { validateTopic, validateArticleStructure, sanitizeTopic } = require('./utils/validation');
const ErrorLogger = require('./error-logger');
const PipelineValidator = require('./pipeline-validator');

// Initialize Error Logger and Validator
const errorLogger = new ErrorLogger();
const pipelineValidator = new PipelineValidator({ errorLogger });

// Initialize Cost Tracker (Phase 3)
const costTracker = new CostTracker({
    budget: process.env.MONTHLY_BUDGET ? parseFloat(process.env.MONTHLY_BUDGET) : null,
    costFile: process.env.COST_FILE || undefined
});

// Initialize Quality Scorer (Phase 3)
const qualityScorer = new ArticleQualityScorer();

// Initialize LLM Client with cost tracker
const llmClient = new LLMClient({
    apiKey: config.api.llm,
    model: config.llm.model,
    cacheDir: config.llm.cacheDir,
    dryRun: config.llm.dryRun,
    maxRetries: 3,
    retryDelay: 1000,
    costTracker: costTracker // Phase 3: Add cost tracking
});

// Initialize Topic Manager and Voice System
const topicManager = new TopicManager();
const voiceSystem = new VoiceSystem();

// Initialize Template Manager
const templateManager = new TemplateManager();

/**
 * Generate article using real LLM (with optional multi-stage pipeline)
 * Now supports TopicManager topics with varying styles and lengths
 * Priority 1: Real LLM Integration + Topic Switching
 */
const generateArticle = async (topicOrConfig, options = {}) => {
    // Phase 2: Input validation
    let topic, articleConfig, topicDisplay, styleName, angleName, lensName;
    
    try {
        // Handle both topic strings and topic config objects
        if (typeof topicOrConfig === 'string') {
            // Legacy: just a topic string
            topic = sanitizeTopic(topicOrConfig);
            validateTopic(topic);
            articleConfig = options.articleConfig || topicManager.generateArticleConfig(
                topicManager.getTopicBySlug(topic) || { slug: topic, category: 'general' },
                options
            );
        } else {
            // New: topic config object from TopicManager
            articleConfig = topicOrConfig;
            topic = articleConfig.topic?.slug || articleConfig.topic?.title || articleConfig.topic;
            if (typeof topic === 'string') {
                topic = sanitizeTopic(topic);
                validateTopic(topic);
            }
        }
        
        topicDisplay = articleConfig.topic?.title || articleConfig.topic?.slug || topic;
        
        // Validate topic display
        if (!topicDisplay || typeof topicDisplay !== 'string' || topicDisplay.trim().length === 0) {
            throw new Error('Invalid topic: topic display name is required');
        }
        
        styleName = articleConfig.style?.name || 'medium';
        angleName = articleConfig.angle?.name || 'analytical';
        lensName = articleConfig.lens?.name || articleConfig.angle?.name || 'analytical';
        
        console.log(`🤖 Generating ${styleName} article (${lensName} lens, ${angleName} angle) for: ${topicDisplay}...`);
    } catch (validationError) {
        // Handle validation errors
        console.error(`❌ Validation error: ${validationError.message}`);
        const fallbackCategory = getCategoryFromTopic(typeof topicOrConfig === 'string' ? topicOrConfig : 'Unknown') || 'AI Insights';
        return {
            title: `Article Generation Error`,
            excerpt: `We encountered a validation error.`,
            content: `<p>We encountered a validation error generating this article.</p><p>Error: ${validationError.message}</p>`,
            author: "AI Analyst",
            date: new Date().toISOString().split('T')[0],
            readTime: "5 min read",
            category: fallbackCategory.charAt(0).toUpperCase() + fallbackCategory.slice(1),
            style: 'medium',
            angle: 'analytical',
            wordCount: 0,
            topicSlug: typeof topicOrConfig === 'string' ? topicOrConfig : 'unknown'
        };
    }

    try {
        // Use style-specific prompt if available
        const stylePrompt = articleConfig.style?.name || 'medium';
        const anglePrompt = articleConfig.angle?.name || 'analytical';
        
        // Check if multi-stage pipeline is requested
        const usePipeline = options.usePipeline !== false && !config.llm.dryRun;
        
        // Build enhanced prompt with style, angle, lens, and voice
        const category = articleConfig.topic?.category || options.category || getCategoryFromTopic(topic);
        const voiceGuidance = voiceSystem.generateVoiceGuidance(category);
        
        const lensPrompt = articleConfig.lens 
            ? `\n\n**Lens/Perspective:** ${articleConfig.lens.name}\n${articleConfig.lens.description}\n\nApproach this topic from this perspective:\n- Focus: ${articleConfig.lens.focus?.join(', ') || 'general analysis'}\n- Question: ${articleConfig.lens.question || 'What insights can we gain?'}\n- Voice: Write as a ${articleConfig.lens.voice || 'expert'}\n- Tone: ${articleConfig.lens.tone || 'balanced'}\n`
            : '';
        
        const enhancedOptions = {
            ...options,
            style: stylePrompt,
            angle: anglePrompt,
            lens: lensName,
            lensPrompt: lensPrompt,
            voiceGuidance: voiceGuidance,
            category: category,
            wordCount: articleConfig.wordCount,
            sections: articleConfig.sections,
            topicObject: articleConfig.topic
        };
        
        let article;
        
        if (usePipeline) {
            // Phase 2: Multi-Stage Pipeline (3-stage: blueprint → draft → enhance)
            // Can be extended to 5-stage for Phase 3 (add humanize → seo)
            const defaultStages = ['blueprint', 'draft', 'enhance'];
            article = await llmClient.generateArticlePipeline(topicDisplay, {
                ...enhancedOptions,
                stages: options.stages || defaultStages,
                useCache: config.llm.useCache,
                promptVersion: options.promptVersion || 'v1',
                articleId: articleConfig.topic?.slug || topic
            });
        } else {
            // Single-stage generation with style-specific prompt
            article = await llmClient.generateArticle(topicDisplay, {
                ...enhancedOptions,
                stage: stylePrompt, // Use style as stage for prompt selection
                useCache: config.llm.useCache,
                articleId: articleConfig.topic?.slug || topic
            });
        }

        // Phase 3: Quality scoring (optional - not yet implemented)
        // const qualityReport = qualityScorer?.scoreArticle(article);
        // if (qualityReport) {
        //     article.quality = qualityReport;
        // }

        // Ensure all required fields are present with style-specific defaults
        const readTime = articleConfig.readTime || article.readTime || `${Math.ceil((articleConfig.wordCount || 800) / 200)} min read`;
        // Use category from above (line 94) or fallback to article.category
        const finalCategory = articleConfig.topic?.category || article.category || category || getCategoryFromTopic(topicDisplay);
        
        // Build article object
        const finalArticle = {
            title: article.title || `${topicDisplay}: Understanding the Essentials`,
            excerpt: article.excerpt || `A ${styleName} exploration of ${topicDisplay} and its significance.`,
            content: article.content || '<p>Content generation in progress...</p>',
            author: article.author || "AI Analyst",
            date: article.date || new Date().toISOString().split('T')[0],
            readTime: readTime,
            category: finalCategory.charAt(0).toUpperCase() + finalCategory.slice(1), // Capitalize category
            style: styleName,
            angle: angleName,
            wordCount: articleConfig.wordCount || 0,
            topicSlug: articleConfig.topic?.slug || topic,
            quality: article.quality || null, // Phase 3: Quality score (optional)
            _tokenUsage: article._tokenUsage || null // Phase 3: Token usage (optional)
        };

        // Phase 2: Validate final article structure
        const validation = validateArticleStructure(finalArticle);
        if (!validation.valid) {
            const error = new Error(`Article validation failed: ${validation.errors.join(', ')}`);
            errorLogger.log(error, {
                module: 'content',
                operation: 'validate-article',
                category: 'validation',
                severity: 'error',
                metadata: {
                    topic: topicDisplay,
                    errors: validation.errors
                }
            });
            console.warn(`⚠️ Article validation failed: ${validation.errors.join(', ')}`);
        }
        if (validation.warnings && validation.warnings.length > 0) {
            validation.warnings.forEach(warning => {
                errorLogger.log(new Error(warning), {
                    module: 'content',
                    operation: 'validate-article',
                    category: 'validation',
                    severity: 'warning',
                    metadata: { topic: topicDisplay }
                });
            });
            console.warn(`⚠️ Article validation warnings: ${validation.warnings.join(', ')}`);
        }

        // Log quality score if available (Phase 3 feature - optional)
        if (finalArticle.quality && finalArticle.quality.scores) {
            console.log(`   ✅ Quality: ${finalArticle.quality.grade} (${finalArticle.quality.scores.overall.toFixed(1)}/100)`);
        }

        return finalArticle;
    } catch (error) {
        // Check if it's a validation error
        if (error.message && (error.message.includes('must be') || error.message.includes('Invalid topic'))) {
            console.error(`❌ Validation error: ${error.message}`);
            throw error;
        }
        errorLogger.log(error, {
            module: 'content',
            operation: 'generate-article',
            category: 'pipeline',
            severity: 'error',
            metadata: {
                topic: topicDisplay || 'unknown',
                style: styleName,
                angle: angleName
            }
        });
        
        console.error(`❌ Error generating article for ${topicDisplay}:`, error.message);
        if (error.stack) {
            console.error(`   Stack: ${error.stack.split('\n').slice(0, 3).join('\n')}`);
        }
        
        // Phase 2: Enhanced error handling with retry attempt
        // Try to use cached version if available
        if (config.llm.useCache) {
            try {
                const cachedArticle = llmClient.getCachedArticle(topicDisplay, options.promptVersion || 'v1');
                if (cachedArticle) {
                    console.log(`   🔄 Using cached version as fallback`);
                    return {
                        ...cachedArticle,
                        style: styleName,
                        angle: angleName,
                        wordCount: articleConfig.wordCount || 0,
                        topicSlug: articleConfig.topic?.slug || topicDisplay
                    };
                }
            } catch (cacheError) {
                console.warn(`   ⚠️ Cache fallback failed: ${cacheError.message}`);
            }
        }
        
        // Final fallback to basic structure if generation fails
        const fallbackCategory = articleConfig.topic?.category || options.category || getCategoryFromTopic(topicDisplay) || 'AI Insights';
        
        return {
            title: `${topicDisplay}: Understanding the Essentials`,
            excerpt: `An exploration of ${topicDisplay} and its significance.`,
            content: `<p>We encountered an error generating this article. Please try again later.</p><p>Error: ${error.message}</p>`,
            author: "AI Analyst",
            date: new Date().toISOString().split('T')[0],
            readTime: articleConfig.readTime || "5 min read",
            category: fallbackCategory.charAt(0).toUpperCase() + fallbackCategory.slice(1),
            style: styleName,
            angle: angleName,
            wordCount: articleConfig.wordCount || 0,
            topicSlug: articleConfig.topic?.slug || topicDisplay
        };
    }
};

/**
 * Helper: Infer category from topic
 */
const getCategoryFromTopic = (topic) => {
    const topicLower = topic.toLowerCase();
    if (topicLower.includes('beginner') || topicLower.includes('for beginners')) {
        return config.content.topic + ' Basics';
    }
    if (topicLower.includes('advanced') || topicLower.includes('techniques')) {
        return 'Advanced Analytics';
    }
    if (topicLower.includes('trend') || topicLower.includes('2025')) {
        return 'Latest Updates';
    }
    if (topicLower.includes('visualization') || topicLower.includes('dashboard')) {
        return 'Visualizations';
    }
    return 'AI Insights';
};

const ImageGenerator = require('./image-gen');

// Initialize Image Generator (Nano Banana)
const imageGenerator = new ImageGenerator({
    apiKey: config.api.imageGen,
    dryRun: config.llm.dryRun,
    size: { width: 1200, height: 800 } // Exact size for articles
});

/**
 * Generate image using Gemini's image generation (Nano Banana)
 * Exact size: 1200x800 for article headers
 * Phase 3: Tracks image generation costs
 */
const generateImage = async (prompt, options = {}) => {
    try {
        // Generate smart image prompt from article topic
        const imagePrompt = imageGenerator.generateImagePrompt(prompt, {
            style: options.style || 'editorial photography',
            mood: options.mood || 'professional'
        });

        // Generate image with exact dimensions
        const imageUrl = await imageGenerator.generateImage(imagePrompt, {
            width: options.width || 1200,
            height: options.height || 800,
            saveLocal: options.saveLocal !== false // Default: save locally
        });

        // Phase 3: Track image generation cost
        if (costTracker && !config.llm.dryRun) {
            costTracker.trackImageCost(1, options.articleId || null);
        }

        return imageUrl;
    } catch (error) {
        console.error(`❌ Image generation failed for "${prompt}":`, error.message);
        
        // Fallback to high-quality Unsplash placeholder with exact size
        const keywords = prompt.split(' ').slice(0, 2).join(',');
        const width = options.width || 1200;
        const height = options.height || 800;
        return `https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=${width}&h=${height}&fit=crop&q=80&auto=format&fm=jpg&keywords=${keywords}`;
    }
};

/**
 * Topic Expander - Generate related article topics
 * Can optionally use LLM for smarter topic expansion
 */
const expandTopics = async (seedTopic, options = {}) => {
    console.log(`🧠 Expanding topic: ${seedTopic}...`);
    
    // Simple pattern-based expansion (fast, no API cost)
    const patterns = [
        `${seedTopic} Trends 2025`,
        `Best ${seedTopic} Tools`,
        `How to Master ${seedTopic}`,
        `${seedTopic} for Beginners`,
        `Advanced ${seedTopic} Techniques`
    ];
    
    // If LLM expansion is requested and not in dry-run mode
    if (options.useLLM && !config.llm.dryRun) {
        try {
            const prompt = `Generate 5 engaging article topics related to "${seedTopic}". 
Topics should be:
- SEO-friendly
- Specific and actionable
- Varied in difficulty (beginner to advanced)
- Include different angles (tutorials, trends, tools, techniques)

Output as JSON array: ["topic1", "topic2", "topic3", "topic4", "topic5"]`;
            
            const response = await llmClient._callAPI(prompt, { topic: seedTopic });
            const jsonMatch = response.match(/\[[\s\S]*\]/);
            
            if (jsonMatch) {
                const topics = JSON.parse(jsonMatch[0]);
                if (Array.isArray(topics) && topics.length > 0) {
                    console.log(`✨ Generated ${topics.length} topics using LLM`);
                    return topics;
                }
            }
        } catch (error) {
            console.warn(`⚠️ LLM topic expansion failed, using patterns:`, error.message);
        }
    }
    
    return patterns;
};

module.exports = {
    generateArticle,
    generateImage,
    expandTopics
};
