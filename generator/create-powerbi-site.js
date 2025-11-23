#!/usr/bin/env node
/**
 * Create PowerBI Site - Full Pipeline
 * 
 * This script creates a complete PowerBI site with:
 * 1. Site instance creation
 * 2. Article generation from PowerBI topics
 * 3. Image generation for all articles
 * 4. Site build
 * 
 * Usage:
 *   node generator/create-powerbi-site.js [options]
 * 
 * Options:
 *   --site-name <name>        Site instance name (default: power-bi-news)
 *   --max-articles <number>   Maximum articles to generate (default: 30)
 *   --skip-images             Skip image generation (generate images later)
 *   --skip-build              Skip site build (only generate articles)
 */

const fs = require('fs');
const path = require('path');
const { SiteConfigManager } = require('./site-config');
const SiteInstanceManager = require('./site-instance-manager');
const { ProgressBar } = require('./utils/progress');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
    siteName: 'power-bi-news',
    maxArticles: 30,
    skipImages: false,
    skipBuild: false
};

for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--site-name' && args[i + 1]) {
        options.siteName = args[++i];
    } else if (arg === '--max-articles' && args[i + 1]) {
        options.maxArticles = parseInt(args[++i]);
    } else if (arg === '--skip-images') {
        options.skipImages = true;
    } else if (arg === '--skip-build') {
        options.skipBuild = true;
    }
}

// Main function
async function createPowerBISite() {
    console.log('🚀 Creating PowerBI Site - Full Pipeline\n');
    console.log(`Configuration:
  - Site Name: ${options.siteName}
  - Max Articles: ${options.maxArticles}
  - Generate Images: ${!options.skipImages}
  - Build Site: ${!options.skipBuild}
`);

    const totalSteps = 3 + (options.skipImages ? 0 : 1) + (options.skipBuild ? 0 : 1);
    let currentStep = 0;
    
    const progressBar = new ProgressBar({
        total: totalSteps * 10,
        format: 'progress [{bar}] {percentage}% | {stage}'
    });
    
    progressBar.start(totalSteps * 10, 0, { stage: 'Initializing...' });

    const siteInstanceManager = new SiteInstanceManager();
    const configManager = new SiteConfigManager();

    // Step 1: Load PowerBI topics
    progressBar.setStage('Loading PowerBI topics...');
    progressBar.increment(10);
    currentStep++;

    const topicsFile = path.join(__dirname, '../data/topics.json');
    let topicsData = null;
    if (fs.existsSync(topicsFile)) {
        try {
            topicsData = JSON.parse(fs.readFileSync(topicsFile, 'utf8'));
            const defaultTopics = topicsData.default;
            if (defaultTopics && defaultTopics.categories) {
                const totalTopics = defaultTopics.categories.reduce((sum, cat) => sum + (cat.topics?.length || 0), 0);
                console.log(`✅ Loaded ${totalTopics} PowerBI topics from ${topicsFile}`);
            }
        } catch (e) {
            console.warn(`⚠️ Could not load topics file: ${e.message}`);
        }
    }

    // Step 2: Create site configuration
    progressBar.setStage('Creating site configuration...');
    progressBar.increment(10);
    currentStep++;

    const primaryTopic = topicsData?.default?.primaryTopic || 'Power BI';
    const topicCategories = topicsData?.default?.categories?.map(cat => cat.name) || [];

    const configData = {
        identity: {
            name: `${primaryTopic} News`,
            domain: `${options.siteName}.com`,
            description: `Your premier source for ${primaryTopic} insights, news, and analysis.`,
            keywords: `${primaryTopic}, Business Intelligence, Data Analytics, DAX, Power Query, insights, analysis, news`,
            logoText: primaryTopic.split(' ')[0],
            logoAccent: primaryTopic.split(' ').slice(1).join(' ') || "News",
            newsletterTitle: `Stay Updated with ${primaryTopic} Insights`,
            newsletterDescription: `Get the latest articles, tutorials, and best practices delivered to your inbox weekly.`,
            footerDescription: `Your premier destination for ${primaryTopic} insights, tutorials, and industry best practices.`,
            quickTip: `<strong>Did you know?</strong> Stay updated with the latest ${primaryTopic} insights and best practices!`
        },
        content: {
            primaryTopic: primaryTopic,
            topicCategories: topicCategories,
            useSovereignMindTopics: false,
            usePowerBITopics: true,
            maxArticles: options.maxArticles
        }
    };

    // Step 3: Create site instance
    progressBar.setStage('Creating site instance...');
    progressBar.increment(10);
    currentStep++;

    const instance = siteInstanceManager.createSiteInstance(options.siteName, configData);

    progressBar.setStage('Site instance created!');
    progressBar.increment(10);
    currentStep++;

    console.log(`\n✅ Site instance created successfully!`);
    console.log(`   Name: ${instance.config.identity.name}`);
    console.log(`   Directory: ${instance.directory}`);
    console.log(`   Primary Topic: ${primaryTopic}`);
    console.log(`   Categories: ${topicCategories.length > 0 ? topicCategories.join(', ') : 'None'}`);

    // Step 4: Generate articles
    console.log(`\n📝 Generating articles from PowerBI topics...`);
    
    const articleProgressBar = new ProgressBar({
        total: 100,
        format: 'progress [{bar}] {percentage}% | {stage}'
    });
    
    articleProgressBar.start(100, 0, { stage: 'Starting article generation...' });
    
    // Set environment variables for bulk.js
    process.env.SITE_INSTANCE = options.siteName;
    process.env.USE_PROGRESS_BAR = 'true';
    process.env.USE_POWERBI_TOPICS = 'true';
    process.env.USE_SOVEREIGN_MIND_TOPICS = 'false';
    process.env.MAX_ARTICLES = options.maxArticles.toString();
    process.env.USE_PIPELINE = 'true'; // Use multi-stage pipeline for better quality
    
    // Generate articles - bulk.js will automatically use site instance directory
    const { generateImage } = require('./content');
    const bulk = require('./bulk');
    
    const siteOutputFile = path.join(instance.directory, 'articles.js');
    
    try {
        // bulk.js exports run as the default export
        if (typeof bulk === 'function') {
            await bulk();
        } else if (bulk.run) {
            await bulk.run();
        } else {
            throw new Error('Could not find run function in bulk.js');
        }
        articleProgressBar.complete({ stage: 'Articles generated!' });
        console.log('✅ Articles generated successfully!');
    } catch (error) {
        articleProgressBar.stop();
        console.error('❌ Error generating articles:', error.message);
        throw error;
    }

    // Step 5: Generate images (if not skipped)
    if (!options.skipImages) {
        console.log(`\n🖼️  Generating images for articles...`);
        
        // Load generated articles
        let articles = [];
        try {
            const articlesContent = fs.readFileSync(siteOutputFile, 'utf8');
            const jsonMatch = articlesContent.match(/const articles = (\[[\s\S]*?\]);/);
            if (jsonMatch) {
                articles = eval(jsonMatch[1]);
            } else {
                // Try to extract JSON array
                const jsonPart = articlesContent.substring(articlesContent.indexOf('['), articlesContent.lastIndexOf(']') + 1);
                articles = JSON.parse(jsonPart);
            }
        } catch (e) {
            console.warn(`⚠️ Could not load articles for image generation: ${e.message}`);
            console.log(`   Images will be generated during article generation instead.`);
        }

        if (articles.length > 0) {
            const imageProgressBar = new ProgressBar({
                total: articles.length,
                format: 'progress [{bar}] {percentage}% | {value}/{total} images | {stage}'
            });
            
            imageProgressBar.start(articles.length, 0, { stage: 'Generating images...' });
            
            let updatedArticles = [];
            for (let i = 0; i < articles.length; i++) {
                const article = articles[i];
                
                // Generate image if not already present or is a placeholder
                if (!article.image || article.image.includes('unsplash.com/photo-1518186285589')) {
                    try {
                        const imagePrompt = article.title || article.excerpt || 'Power BI analytics dashboard';
                        const imageUrl = await generateImage(imagePrompt, {
                            width: 1200,
                            height: 800,
                            saveLocal: true,
                            articleId: `article-${article.id || i + 1}`
                        });
                        
                        article.image = imageUrl;
                        console.log(`   ✅ Generated image for: ${article.title?.substring(0, 50)}...`);
                    } catch (error) {
                        console.warn(`   ⚠️ Failed to generate image for article ${i + 1}: ${error.message}`);
                    }
                }
                
                updatedArticles.push(article);
                imageProgressBar.increment(1, { stage: `Image ${i + 1}/${articles.length}` });
                
                // Rate limiting
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            
            // Save updated articles with images
            const updatedContent = `// Auto-generated by Site Factory
// Generated: ${new Date().toISOString()}
// Site: ${options.siteName}
// Articles with images
const articles = ${JSON.stringify(updatedArticles, null, 2)};
`;
            fs.writeFileSync(siteOutputFile, updatedContent);
            
            imageProgressBar.complete({ stage: 'All images generated!' });
            console.log(`✅ Generated images for ${updatedArticles.length} articles`);
        }
    }

    // Step 6: Build site (if not skipped)
    if (!options.skipBuild) {
        console.log(`\n🏗️  Building site...`);
        
        const buildProgressBar = new ProgressBar({
            total: 100,
            format: 'progress [{bar}] {percentage}% | {stage}'
        });
        
        buildProgressBar.start(100, 0, { stage: 'Starting build process...' });
        
        process.env.SITE_INSTANCE = options.siteName;
        process.env.USE_PROGRESS_BAR = 'true';
        
        const build = require('./build');
        try {
            await build();
            buildProgressBar.complete({ stage: 'Site built!' });
            console.log('✅ Site built successfully!');
        } catch (error) {
            buildProgressBar.stop();
            console.error('❌ Error building site:', error.message);
            throw error;
        }
    }

    console.log(`\n🎉 PowerBI Site Creation Complete!`);
    console.log(`\n📋 Summary:`);
    console.log(`   Site Name: ${options.siteName}`);
    console.log(`   Directory: ${instance.directory}`);
    console.log(`   Articles: ${options.maxArticles} generated`);
    console.log(`   Images: ${options.skipImages ? 'Skipped' : 'Generated'}`);
    console.log(`   Build: ${options.skipBuild ? 'Skipped' : 'Complete'}`);
    console.log(`\n📂 Next steps:`);
    console.log(`   1. View site: Open ${path.join(instance.directory, 'index.html')} in your browser`);
    console.log(`   2. Review articles: Check ${siteOutputFile}`);
    if (options.skipImages) {
        console.log(`   3. Generate images: Run image generation script`);
    }
    if (options.skipBuild) {
        console.log(`   3. Build site: SITE_INSTANCE=${options.siteName} npm run build`);
    }
}

// Run
createPowerBISite().catch(error => {
    console.error('❌ Fatal error:', error.message);
    if (error.stack) {
        console.error(error.stack);
    }
    process.exit(1);
});

