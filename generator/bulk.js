const fs = require('fs');
const path = require('path');
require('dotenv').config(); // Load environment variables first
const config = require('./config');
const { generateArticle, generateImage, expandTopics } = require('./content');
const { TopicManager } = require('./topics');
const { LensSystem } = require('./lens-system');
const CostTracker = require('./cost-tracker');
const ErrorLogger = require('./error-logger');
const PipelineChecker = require('./pipeline-checker');
const PipelineValidator = require('./pipeline-validator');

// Initialize Error Logger and Validation
const errorLogger = new ErrorLogger();
const pipelineChecker = new PipelineChecker({ errorLogger });
const pipelineValidator = new PipelineValidator({ errorLogger, pipelineChecker });

const OUTPUT_FILE = path.join(__dirname, '../templates/articles.js');

/**
 * Bulk Content Generation
 * Supports both single-stage and multi-stage pipeline
 */
const run = async () => {
    console.log('🏭 Starting Bulk Content Generation...');
    
    // Pre-flight checks
    const preFlight = await pipelineChecker.runPreFlightChecks();
    if (!preFlight.allPassed && preFlight.failed > 0) {
        console.error('❌ Pre-flight checks failed. Please fix errors before generating.');
        errorLogger.printReport();
        process.exit(1);
    }
    
    // Parse options from environment or command line args
    // Phase 3: Pipeline enabled by default (5-stage: blueprint → draft → enhance → humanize → seo)
    const usePipeline = process.env.USE_PIPELINE !== 'false'; // Default: true for Phase 3
    const pipelineStages = config.llm.pipeline?.stages || ['blueprint', 'draft', 'enhance', 'humanize', 'seo'];
    console.log(`📊 Configuration:
  - Model: ${config.llm.model}
  - Cache: ${config.llm.useCache ? 'Enabled' : 'Disabled'}
  - Dry Run: ${config.llm.dryRun ? 'Yes (No API calls)' : 'No (Real generation)'}
  - Pipeline: ${usePipeline ? `Phase 3: ${pipelineStages.length}-stage (${pipelineStages.join(' → ')})` : 'Single-stage'}
    `);
    const useLLMExpansion = process.env.USE_LLM_EXPANSION === 'true';
    const maxArticles = parseInt(process.env.MAX_ARTICLES || '50');
    const useSovereignMindTopics = process.env.USE_SOVEREIGN_MIND_TOPICS !== 'false'; // Default: true
    const varyStyles = process.env.VARY_STYLES !== 'false'; // Default: true

    // Phase 3: Initialize Cost Tracker
    const costTracker = new CostTracker({
        budget: process.env.MONTHLY_BUDGET ? parseFloat(process.env.MONTHLY_BUDGET) : null
    });

    // Initialize Topic Manager and Lens System
    const topicManager = new TopicManager();
    const lensSystem = new LensSystem();
    const useMultiplePerspectives = process.env.USE_MULTIPLE_PERSPECTIVES !== 'false'; // Default: true

    // 1. Get Topics
    let allTopicConfigs = [];

    if (useSovereignMindTopics) {
        // Use Sovereign Mind topics with varying styles, angles, and lenses/perspectives
        console.log(`📚 Using Sovereign Mind topics (${topicManager.getTotalCount()} total)...`);
        
        const allTopics = topicManager.getAllTopics();
        
        // Mix of topics from different categories
        const categories = topicManager.getCategories();
        const topicsPerCategory = Math.ceil(maxArticles / categories.length);
        
        for (const category of categories) {
            const categoryTopics = topicManager.getTopicsByCategory(category);
            const selectedTopics = categoryTopics.slice(0, Math.min(topicsPerCategory, categoryTopics.length));
            
            for (const topic of selectedTopics) {
                const topicObj = topicManager.getTopicBySlug(topic.slug);
                if (topicObj) {
                    if (useMultiplePerspectives) {
                        // Generate multiple perspectives (different lenses) for this topic
                        const perspectives = lensSystem.getMultiplePerspectives(topicObj, 3, {
                            varyStyles: varyStyles
                        });
                        
                        for (const perspective of perspectives) {
                            const articleConfig = topicManager.generateArticleConfig(topicObj, {
                                style: perspective.style?.name || (varyStyles ? undefined : 'medium'),
                                angle: perspective.lens?.name || (varyStyles ? undefined : 'analytical')
                            });
                            
                            // Add lens/perspective information
                            articleConfig.lens = perspective.lens;
                            articleConfig.perspective = perspective.perspective;
                            articleConfig.totalPerspectives = perspective.totalPerspectives;
                            
                            allTopicConfigs.push(articleConfig);
                            
                            if (allTopicConfigs.length >= maxArticles) break;
                        }
                    } else {
                        // Single perspective per topic (legacy behavior)
                        const articleConfig = topicManager.generateArticleConfig(topicObj, {
                            style: varyStyles ? undefined : 'medium',
                            angle: varyStyles ? undefined : 'analytical'
                        });
                        
                        // Add a random lens for variety
                        const lens = lensSystem.getRandomLens();
                        articleConfig.lens = lens;
                        
                        allTopicConfigs.push(articleConfig);
                    }
                    
                    if (allTopicConfigs.length >= maxArticles) break;
                }
            }
            
            if (allTopicConfigs.length >= maxArticles) break;
        }
        
        // Fill remaining with random topics if needed
        while (allTopicConfigs.length < maxArticles && allTopicConfigs.length < allTopics.length) {
            const randomTopic = topicManager.getRandomTopic();
            
            if (useMultiplePerspectives && allTopicConfigs.length + 3 <= maxArticles) {
                // Add multiple perspectives
                const perspectives = lensSystem.getMultiplePerspectives(randomTopic, 3, {
                    varyStyles: varyStyles
                });
                
                for (const perspective of perspectives) {
                    const articleConfig = topicManager.generateArticleConfig(randomTopic, {
                        style: perspective.style?.name || 'medium',
                        angle: perspective.lens?.name || 'analytical'
                    });
                    
                    articleConfig.lens = perspective.lens;
                    articleConfig.perspective = perspective.perspective;
                    articleConfig.totalPerspectives = perspective.totalPerspectives;
                    
                    // Avoid duplicates
                    if (!allTopicConfigs.find(c => 
                        c.topic.slug === articleConfig.topic.slug && 
                        c.perspective === articleConfig.perspective
                    )) {
                        allTopicConfigs.push(articleConfig);
                    }
                }
            } else {
                // Single perspective
                const articleConfig = topicManager.generateArticleConfig(randomTopic, {
                    style: varyStyles ? undefined : 'medium',
                    angle: varyStyles ? undefined : 'analytical'
                });
                
                const lens = lensSystem.getRandomLens();
                articleConfig.lens = lens;
                
                // Avoid duplicates
                if (!allTopicConfigs.find(c => c.topic.slug === articleConfig.topic.slug)) {
                    allTopicConfigs.push(articleConfig);
                }
            }
            
            if (allTopicConfigs.length >= maxArticles) break;
        }
    } else {
        // Legacy: Use old topic expansion method
        const seedTopic = config.content.topic;
        const subtopics = config.content.subtopics;

        let allTopics = [];

        // Add seed topic variations
        const expandedSeed = await expandTopics(seedTopic, { useLLM: useLLMExpansion });
        allTopics = [...allTopics, ...expandedSeed];

        // Add subtopics
        for (const sub of subtopics) {
            const expandedSub = await expandTopics(`${seedTopic} ${sub}`, { useLLM: useLLMExpansion });
            allTopics = [...allTopics, ...expandedSub];
        }

        // Convert to topic configs
        allTopics.slice(0, maxArticles).forEach(topic => {
            allTopicConfigs.push({
                topic: { slug: topic, category: 'general', title: topic },
                style: { name: 'medium', config: {} },
                angle: { name: 'analytical', config: {} },
                wordCount: 800,
                sections: 3,
                readTime: 5
            });
        });
    }

    // Limit articles
    allTopicConfigs = allTopicConfigs.slice(0, maxArticles);
    console.log(`📝 Prepared ${allTopicConfigs.length} article configurations.`);
    console.log(`   Styles: ${new Set(allTopicConfigs.map(c => c.style.name)).size} different styles`);
    console.log(`   Angles: ${new Set(allTopicConfigs.map(c => c.angle.name)).size} different angles`);

    // 2. Generate Articles
    const articles = [];
    let idCounter = 1;
    const startTime = Date.now();

    for (const articleConfig of allTopicConfigs) {
        const topicDisplay = articleConfig.topic.title || articleConfig.topic.slug;
        const styleDisplay = articleConfig.style.name;
        const angleDisplay = articleConfig.angle.name;
        
        console.log(`\n📄 Processing [${idCounter}/${allTopicConfigs.length}]: ${topicDisplay}`);
        console.log(`   Style: ${styleDisplay} | Angle: ${angleDisplay} | Category: ${articleConfig.topic.category}`);
        // Phase 3: Use configured pipeline stages (default: 5-stage)
        const pipelineStages = usePipeline ? (config.llm.pipeline?.stages || ['blueprint', 'draft', 'enhance', 'humanize', 'seo']) : [];
        console.log(`   ${usePipeline ? `Phase 3: ${pipelineStages.length}-stage pipeline (${pipelineStages.join(' → ')})` : 'Single-stage generation'}`);

        try {
            // Generate Text with style and angle configuration
            // Phase 3: Use 5-stage pipeline by default
            let articleData;
            try {
                articleData = await generateArticle(articleConfig, {
                    usePipeline: usePipeline,
                    stages: usePipeline ? pipelineStages : undefined,
                    articleConfig: articleConfig,
                    promptVersion: config.llm.pipeline?.promptVersion || 'v1',
                    articleId: articleConfig.topic?.slug || `article-${idCounter}`
                });
            } catch (error) {
                errorLogger.log(error, {
                    module: 'bulk',
                    operation: 'generate-article',
                    category: 'pipeline',
                    severity: 'error',
                    metadata: {
                        articleId: idCounter,
                        topic: topicDisplay
                    }
                });
                throw error;
            }

            // Validate article data
            const articleValidation = pipelineValidator.validateArticle(articleData, {
                articleId: idCounter,
                topic: topicDisplay,
                operation: 'bulk-generation'
            });
            if (!articleValidation.valid) {
                console.warn(`   ⚠️ Article validation failed: ${articleValidation.errors.join(', ')}`);
            }

            // Generate Image with exact size (1200x800) - Phase 4: Pass articleId for cost tracking
            const articleId = `article-${idCounter}`;
            let imageUrl;
            try {
                imageUrl = await generateImage(topicDisplay, {
                    width: 1200,
                    height: 800,
                    saveLocal: true,
                    articleId: articleId // Phase 4: Track image costs per article
                });
            } catch (error) {
                errorLogger.log(error, {
                    module: 'bulk',
                    operation: 'generate-image',
                    category: 'api',
                    severity: 'warning',
                    metadata: {
                        articleId: idCounter,
                        topic: topicDisplay
                    }
                });
                // Use fallback image URL
                imageUrl = `https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=1200&h=800&fit=crop&q=80`;
                console.warn(`   ⚠️ Image generation failed, using fallback`);
            }

            // Phase 3 Refinement: Quality-based filtering
            const minQualityScore = parseInt(process.env.MIN_QUALITY_SCORE || '0');
            const qualityScore = articleData.quality?.scores?.overall || 0;
            if (minQualityScore > 0 && qualityScore < minQualityScore) {
                const warning = `Article filtered: Quality score ${qualityScore.toFixed(1)} below minimum ${minQualityScore}`;
                console.warn(`   ⚠️ ${warning}`);
                errorLogger.log(new Error(warning), {
                    module: 'bulk',
                    operation: 'quality-filter',
                    category: 'validation',
                    severity: 'warning',
                    metadata: {
                        articleId: idCounter,
                        qualityScore,
                        minQualityScore
                    }
                });
                idCounter++;
                continue; // Skip this article
            }

            const finalArticle = {
                id: idCounter++,
                title: articleData.title,
                excerpt: articleData.excerpt,
                content: articleData.content,
                category: articleData.category,
                author: articleData.author,
                date: articleData.date,
                readTime: articleData.readTime,
                image: imageUrl,
                featured: idCounter === 2, // Make the first one featured
                quality: articleData.quality || null, // Phase 3: Include quality data
                _tokenUsage: articleData._tokenUsage || null // Phase 3: Include token usage
            };
            
            // Final validation before adding to articles array
            const finalValidation = pipelineValidator.validateArticle(finalArticle, {
                articleId: idCounter - 1,
                operation: 'final-article-validation'
            });
            
            articles.push(finalArticle);

            // Phase 3: Log quality and cost info
            if (articleData.quality) {
                const quality = articleData.quality;
                console.log(`   ✅ Quality: ${quality.grade} (${quality.scores.overall.toFixed(1)}/100)`);
                
                // Phase 3 Refinement: Warn about low quality
                if (quality.scores.overall < 60) {
                    console.warn(`   ⚠️ Low quality score - consider regenerating`);
                    if (quality.recommendations && quality.recommendations.length > 0) {
                        console.log(`   💡 Recommendations: ${quality.recommendations.slice(0, 2).join(', ')}`);
                    }
                }
            }
            if (articleData._tokenUsage) {
                const tokens = articleData._tokenUsage;
                console.log(`   💰 Tokens: ${tokens.total.toLocaleString()} (${tokens.input.toLocaleString()} in + ${tokens.output.toLocaleString()} out)`);
            }

            // Progress indicator
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            const avgTime = (elapsed / idCounter).toFixed(1);
            console.log(`   ⏱️  Generated in ${avgTime}s (avg)`);

            // Rate limiting delay (avoid hitting API rate limits)
            if (!config.llm.dryRun) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        } catch (error) {
            errorLogger.log(error, {
                module: 'bulk',
                operation: 'article-generation-loop',
                category: 'pipeline',
                severity: 'error',
                metadata: {
                    articleId: idCounter,
                    topic: topicDisplay || 'unknown'
                }
            });
            console.error(`   ❌ Failed to generate article: ${error.message}`);
            // Continue with next article even if one fails
            idCounter++;
        }
    }

    // 3. Save to articles.js
    const finalPipelineStages = usePipeline ? (config.llm.pipeline?.stages || ['blueprint', 'draft', 'enhance', 'humanize', 'seo']) : [];
    
    // Phase 3: Calculate quality statistics
    const qualityScores = articles
        .map(a => a.quality?.scores?.overall)
        .filter(s => s !== undefined);
    const avgQuality = qualityScores.length > 0 
        ? (qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length).toFixed(1)
        : 'N/A';
    const qualityGrades = articles
        .map(a => a.quality?.grade)
        .filter(g => g !== undefined);
    const gradeDistribution = {};
    qualityGrades.forEach(g => {
        gradeDistribution[g] = (gradeDistribution[g] || 0) + 1;
    });

    const fileContent = `// Auto-generated by Site Factory
// Generated: ${new Date().toISOString()}
// Model: ${config.llm.model}
// Pipeline: ${usePipeline ? `Phase 3: ${finalPipelineStages.length}-stage (${finalPipelineStages.join(' → ')})` : 'Single-stage'}
// Cache: ${config.llm.useCache ? 'Enabled' : 'Disabled'}
// Quality: Avg ${avgQuality}/100
const articles = ${JSON.stringify(articles, null, 2)};
`;

    try {
        fs.writeFileSync(OUTPUT_FILE, fileContent);
        
        // Validate output file was created
        const fileValidation = pipelineValidator.validateFileOperation('write', OUTPUT_FILE, true);
        if (!fileValidation.valid) {
            throw new Error(`Failed to validate output file: ${fileValidation.message}`);
        }
    } catch (error) {
        errorLogger.log(error, {
            module: 'bulk',
            operation: 'write-output-file',
            category: 'file_system',
            severity: 'critical'
        });
        throw error;
    }
    
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n✅ Successfully generated ${articles.length} articles in templates/articles.js`);
    console.log(`⏱️  Total time: ${totalTime}s`);
    if (articles.length > 0) {
        console.log(`📊 Average: ${(totalTime / articles.length).toFixed(1)}s per article`);
    }
    
    // Phase 3: Print cost and quality reports
    console.log(`\n📊 Quality Report:`);
    console.log(`   Average Score: ${avgQuality}/100`);
    if (Object.keys(gradeDistribution).length > 0) {
        console.log(`   Grade Distribution:`, gradeDistribution);
    }
    
    costTracker.printReport();
    
    // Print error report if there were any errors
    const errorSummary = errorLogger.getSummary();
    if (errorSummary.total > 0) {
        console.log('\n⚠️ Errors occurred during generation:');
        errorLogger.printReport();
    }
};

/**
 * Helper: Infer category from topic (legacy support)
 */
const getCategoryFromTopic = (topic) => {
    if (typeof topic === 'object' && topic.category) {
        return topic.category.charAt(0).toUpperCase() + topic.category.slice(1);
    }
    
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
    return 'General';
};

// Run bulk generation
if (require.main === module) {
    run().catch(error => {
        errorLogger.log(error, {
            module: 'bulk',
            operation: 'bulk-entry',
            category: 'pipeline',
            severity: 'critical'
        });
        console.error('❌ Fatal error:', error.message);
        errorLogger.printReport();
        process.exit(1);
    });
}

module.exports = run;
