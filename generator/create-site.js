#!/usr/bin/env node
/**
 * Create New Site Instance
 * 
 * Usage:
 *   node generator/create-site.js <site-name> [options]
 * 
 * Options:
 *   --topic <topic>           Primary topic for the site
 *   --use-sovereign-mind       Use Sovereign Mind topics
 *   --topics-file <path>      Path to topics JSON file
 *   --max-articles <number>    Maximum articles to generate
 *   --build                    Build the site after creation
 *   --generate                 Generate articles after creation
 */

const fs = require('fs');
const path = require('path');
const { SiteConfigManager } = require('./site-config');
const SiteInstanceManager = require('./site-instance-manager');
const { ProgressBar } = require('./utils/progress');

// Parse command line arguments
const args = process.argv.slice(2);
const siteName = args[0];

if (!siteName) {
    console.error('❌ Error: Site name is required');
    console.log('\nUsage: node generator/create-site.js <site-name> [options]');
    console.log('\nOptions:');
    console.log('  --topic <topic>           Primary topic for the site');
    console.log('  --use-sovereign-mind     Use Sovereign Mind topics');
    console.log('  --topics-file <path>      Path to topics JSON file');
    console.log('  --max-articles <number>   Maximum articles to generate');
    console.log('  --build                   Build the site after creation');
    console.log('  --generate                Generate articles after creation');
    process.exit(1);
}

// Parse options
const options = {
    topic: null,
    useSovereignMind: false,
    topicsFile: path.join(__dirname, '../data/topics.json'),
    maxArticles: 50,
    build: false,
    generate: false
};

for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--topic' && args[i + 1]) {
        options.topic = args[++i];
    } else if (arg === '--use-sovereign-mind') {
        options.useSovereignMind = true;
    } else if (arg === '--topics-file' && args[i + 1]) {
        options.topicsFile = args[++i];
    } else if (arg === '--max-articles' && args[i + 1]) {
        options.maxArticles = parseInt(args[++i]);
    } else if (arg === '--build') {
        options.build = true;
    } else if (arg === '--generate') {
        options.generate = true;
    }
}

// Load topics from file
let topicsData = null;
if (fs.existsSync(options.topicsFile)) {
    try {
        topicsData = JSON.parse(fs.readFileSync(options.topicsFile, 'utf8'));
    } catch (e) {
        console.warn(`⚠️ Could not load topics file: ${e.message}`);
    }
}

// Main function
async function createSite() {
    console.log(`🏭 Creating new site instance: ${siteName}\n`);

    // Calculate total steps for progress bar
    let totalSteps = 4; // Setup, Create Instance, Config
    if (options.generate) totalSteps += 1;
    if (options.build) totalSteps += 1;
    
    const progressBar = new ProgressBar({
        total: totalSteps * 10, // Use finer granularity (10 units per step)
        format: 'progress [{bar}] {percentage}% | {stage}'
    });
    
    progressBar.start(totalSteps * 10, 0, { stage: 'Initializing...' });

    const siteInstanceManager = new SiteInstanceManager();
    const configManager = new SiteConfigManager();

    // Step 1: Determine primary topic
    progressBar.setStage('Determining topic and loading configuration...');
    progressBar.increment(10);

    let primaryTopic = options.topic;
    let topicCategories = [];
    let useSovereignMind = options.useSovereignMind;

    if (!primaryTopic) {
        // Try to infer from site name
        primaryTopic = siteName
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    // Load topics if available
    if (topicsData) {
        if (useSovereignMind && topicsData.sovereignMind) {
            topicCategories = topicsData.sovereignMind.categories.map(cat => cat.name);
        } else if (topicsData.default) {
            primaryTopic = topicsData.default.primaryTopic || primaryTopic;
            topicCategories = topicsData.default.categories.map(cat => cat.name);
        }
    }

    // Step 2: Create site configuration
    progressBar.setStage('Creating site configuration...');
    progressBar.increment(10);

    const configData = {
        identity: {
            name: `${primaryTopic} News`,
            domain: `${siteName}.com`,
            description: `Your premier source for ${primaryTopic} insights, news, and analysis.`,
            keywords: `${primaryTopic}, insights, analysis, news`,
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
            useSovereignMindTopics: useSovereignMind,
            maxArticles: options.maxArticles
        }
    };

    // Step 3: Create site instance
    progressBar.setStage('Creating site instance directories...');
    progressBar.increment(10);

    const instance = siteInstanceManager.createSiteInstance(siteName, configData);

    progressBar.setStage('Site instance created!');
    progressBar.increment(10);

    // Complete initial setup
    progressBar.complete({ stage: 'Site instance ready!' });
    
    console.log(`\n✅ Site instance created successfully!`);
    console.log(`   Name: ${instance.config.identity.name}`);
    console.log(`   Directory: ${instance.directory}`);
    console.log(`   Primary Topic: ${primaryTopic}`);
    console.log(`   Categories: ${topicCategories.length > 0 ? topicCategories.join(', ') : 'None'}`);

    // Generate articles if requested
    if (options.generate) {
        console.log(`\n📝 Generating articles...`);
        
        const articleProgressBar = new ProgressBar({
            total: 100,
            format: 'progress [{bar}] {percentage}% | {stage}'
        });
        
        articleProgressBar.start(100, 0, { stage: 'Starting article generation...' });
        
        // Set flag for bulk.js to use progress bar
        process.env.SITE_INSTANCE = siteName;
        process.env.USE_PROGRESS_BAR = 'true';
        process.env.PROGRESS_CALLBACK = 'true';
        
        const { run: bulkRun } = require('./bulk');
        try {
            // Wrap bulkRun to track progress
            // Note: We'll need to modify bulk.js to support progress callbacks
            await bulkRun();
            articleProgressBar.complete({ stage: 'Articles generated!' });
            console.log('✅ Articles generated successfully!');
        } catch (error) {
            articleProgressBar.stop();
            console.error('❌ Error generating articles:', error.message);
        }
    }

    // Build site if requested
    if (options.build) {
        console.log(`\n🏗️  Building site...`);
        
        const buildProgressBar = new ProgressBar({
            total: 100,
            format: 'progress [{bar}] {percentage}% | {stage}'
        });
        
        buildProgressBar.start(100, 0, { stage: 'Starting build process...' });
        
        process.env.SITE_INSTANCE = siteName;
        process.env.USE_PROGRESS_BAR = 'true';
        
        const build = require('./build');
        try {
            // Wrap build to track progress
            // Note: We'll need to modify build.js to support progress callbacks
            await build();
            buildProgressBar.complete({ stage: 'Site built!' });
            console.log('✅ Site built successfully!');
        } catch (error) {
            buildProgressBar.stop();
            console.error('❌ Error building site:', error.message);
        }
    }

    console.log(`\n📋 Next steps:`);
    console.log(`   1. Review configuration: ${path.join(configManager.configDir, `${siteName}.json`)}`);
    console.log(`   2. Generate articles: SITE_INSTANCE=${siteName} npm run bulk`);
    console.log(`   3. Build site: SITE_INSTANCE=${siteName} npm run build`);
    console.log(`   4. View site: Open ${instance.directory}/index.html in your browser`);
}

// Run
createSite().catch(error => {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
});

