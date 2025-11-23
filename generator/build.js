const fs = require('fs');
const path = require('path');
const config = require('./config');
const SEOOptimizer = require('./seo-optimizer');
const ArticleQualityScorer = require('./quality');
const AnalyticsManager = require('./analytics');
const PerformanceMonitor = require('./performance');
const ErrorLogger = require('./error-logger');
const PipelineChecker = require('./pipeline-checker');
const PipelineValidator = require('./pipeline-validator');

// Initialize Error Logger and Validation
const errorLogger = new ErrorLogger();
const pipelineChecker = new PipelineChecker({ errorLogger });
const pipelineValidator = new PipelineValidator({ errorLogger, pipelineChecker });

// Initialize Analytics Manager (Phase 4)
const analyticsManager = new AnalyticsManager({
    ga4Id: process.env.GA4_MEASUREMENT_ID || config.analytics?.ga4Id,
    enabled: config.analytics?.enabled !== false
});

// Initialize Performance Monitor (Phase 4)
const performanceMonitor = new PerformanceMonitor();

    // Helper to read file content
const readFile = (filePath) => {
    try {
        return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
        errorLogger.log(error, {
            module: 'build',
            operation: 'read-file',
            category: 'file_system',
            severity: 'error',
            metadata: { filePath }
        });
        throw error;
    }
};

// Helper to write file content
const writeFile = (filePath, content) => {
    try {
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(filePath, content);
    } catch (error) {
        errorLogger.log(error, {
            module: 'build',
            operation: 'write-file',
            category: 'file_system',
            severity: 'error',
            metadata: { filePath }
        });
        throw error;
    }
};

// Helper to replace placeholders in template
const processTemplate = (template, data) => {
    let content = template;

    // Replace simple keys: {{key}}
    Object.keys(data).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        content = content.replace(regex, data[key]);
    });

    return content;
};

// Process Ad Component
const renderAd = (placementName) => {
    const adConfig = config.ads.placements[placementName];
    if (!config.ads.enabled || !adConfig || !adConfig.enabled) return '';

    const template = readFile(path.join(__dirname, '../templates/components/ad-slot.html'));

    let width = 'Auto';
    let height = 'Auto';

    if (adConfig.type === 'leaderboard') { width = '728px'; height = '90px'; }
    if (adConfig.type === 'rectangle') { width = '300px'; height = '250px'; }

    // Handle conditional logic for Handlebars-like syntax in simple string replacement
    // Note: A real template engine like Handlebars would be better, but keeping it simple for now
    let processed = template;

    // Handle {{#if testMode}} block
    if (config.ads.testMode) {
        processed = processed.replace(/{{#if testMode}}([\s\S]*?){{else}}[\s\S]*?{{\/if}}/g, '$1');
    } else {
        processed = processed.replace(/{{#if testMode}}[\s\S]*?{{else}}([\s\S]*?){{\/if}}/g, '$1');
    }

    // Handle {{#if sticky}}
    if (adConfig.sticky) {
        processed = processed.replace(/{{#if sticky}}([\s\S]*?){{\/if}}/g, '$1');
    } else {
        processed = processed.replace(/{{#if sticky}}([\s\S]*?){{\/if}}/g, '');
    }

    // Replace variables
    return processTemplate(processed, {
        type: adConfig.type,
        id: adConfig.id || `ad-${placementName}`,
        width,
        height,
        publisherId: config.ads.publisherId
    });
};

const { generateSitemap, generateRobots } = require('./seo');

// Main Build Function
const build = async () => {
    console.log('🏭 Starting Site Factory Build...');
    
    // Pre-flight checks (allow warnings but fail on critical errors)
    const preFlight = await pipelineChecker.runPreFlightChecks();
    if (!preFlight.allPassed && preFlight.failed > 0) {
        // Only fail on actual critical errors, not warnings about placeholders in dry-run
        const isDryRun = config.llm.dryRun || process.env.DRY_RUN === 'true' || !process.env.OPENAI_API_KEY;
        const criticalFailures = pipelineChecker.results.failed.filter((failureObj) => {
            if (!failureObj || !failureObj.message) return true;
            const msg = failureObj.message.toLowerCase();
            // In dry-run mode, placeholder API keys are ok - check for various placeholder messages
            if (isDryRun && (msg.includes('placeholder') || msg.includes('not allowed in production'))) {
                console.log(`   ℹ️ Ignoring placeholder API key warning (dry-run mode)`);
                return false;
            }
            return true;
        });
        
        if (criticalFailures.length > 0) {
            console.error('❌ Pre-flight checks failed with critical errors. Please fix errors before building.');
            errorLogger.printReport();
            process.exit(1);
        } else {
            console.log('⚠️ Pre-flight checks completed with warnings (non-critical). Continuing with build...\n');
        }
    }
    
    const validation = await pipelineValidator.validatePipeline('build', []);

    try {
        // 1. Prepare Dist Directory
        const distDir = path.join(__dirname, '../dist');
        if (!fs.existsSync(distDir)) {
            try {
                fs.mkdirSync(distDir, { recursive: true });
            } catch (error) {
                errorLogger.log(error, {
                    module: 'build',
                    operation: 'create-dist-directory',
                    category: 'file_system',
                    severity: 'error'
                });
                throw error;
            }
        }

        // 2. Process HTML Templates
        const indexTemplatePath = path.join(__dirname, '../templates/index.html');
        const templateValidation = pipelineValidator.validateFileOperation('read', indexTemplatePath, true);
        if (!templateValidation.valid) {
            throw new Error(`Template validation failed: ${templateValidation.message}`);
        }
        
        let indexTemplate;
        try {
            indexTemplate = readFile(indexTemplatePath);
        } catch (error) {
            errorLogger.log(error, {
                module: 'build',
                operation: 'read-index-template',
                category: 'file_system',
                severity: 'error'
            });
            throw error;
        }

    // Inject SEO Meta Tags
    const seoTags = `
    <title>${config.site.name} - ${config.content.topic}</title>
    <meta name="description" content="${config.site.description}">
    <meta name="keywords" content="${config.site.keywords}">
    <meta name="theme-color" content="${config.site.themeColor}">
    <link rel="canonical" href="https://${config.site.domain}/">
    <meta property="og:title" content="${config.site.name}">
    <meta property="og:description" content="${config.site.description}">
    <meta property="og:url" content="https://${config.site.domain}/">
    <meta property="og:site_name" content="${config.site.name}">
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "${config.site.name}",
      "url": "https://${config.site.domain}/"
    }
    </script>
  `;

    // Inject Ads
    const headerAd = renderAd('header');
    const footerAd = renderAd('footer');
    const sidebarAd = renderAd('sidebar');

    // Replace placeholders in HTML
    // We need to modify the index.html template first to include these placeholders
    // For now, we'll do some string injection based on known markers

    let html = indexTemplate;

    // Replace Site Identity
    html = html.replace('{{site.logoText}}', config.site.logoText);
    html = html.replace('{{site.logoAccent}}', config.site.logoAccent);

    // Inject SEO tags into <head>
    html = html.replace('<!-- SEO_TAGS_PLACEHOLDER -->', seoTags);
    
    // Inject Analytics Scripts (Phase 4) - Only if enabled
    if (config.analytics && config.analytics.enabled) {
        const analyticsScript = analyticsManager.generateGAScript() + '\n' + analyticsManager.generateCustomTrackingScript() + '\n' + performanceMonitor.generateMonitoringScript();
        
        if (html.includes('<!-- ANALYTICS_SCRIPT -->')) {
            html = html.replace('<!-- ANALYTICS_SCRIPT -->', analyticsScript);
        } else {
            // Insert before closing </head>
            html = html.replace('</head>', `    ${analyticsScript}\n</head>`);
        }
        
        // Track home page view
        analyticsManager.trackPageView('/', 'Home');
    }

    // Note: Analytics already injected above (Phase 4) - this block was duplicate

    // Inject Header Ad (after header)
    html = html.replace('<!-- HEADER_AD_PLACEHOLDER -->', headerAd);

    // Inject Sidebar Ad (inside sidebar)
    html = html.replace('<!-- SIDEBAR_AD_PLACEHOLDER -->', sidebarAd);

    // Inject Footer Ad (before footer)
    html = html.replace('<!-- FOOTER_AD_PLACEHOLDER -->', footerAd);

        // Write processed HTML
        writeFile(path.join(distDir, 'index.html'), html);

        // 3. Copy Static Assets
        // CSS
        try {
            const css = readFile(path.join(__dirname, '../templates/styles.css'));
            writeFile(path.join(distDir, 'styles.css'), css);
        } catch (error) {
            errorLogger.log(error, {
                module: 'build',
                operation: 'copy-css',
                category: 'file_system',
                severity: 'error'
            });
            // Continue with other assets
        }

        // JS
        try {
            const mainJs = readFile(path.join(__dirname, '../templates/main.js'));
            writeFile(path.join(distDir, 'main.js'), mainJs);
        } catch (error) {
            errorLogger.log(error, {
                module: 'build',
                operation: 'copy-main-js',
                category: 'file_system',
                severity: 'error'
            });
        }

        try {
            const articlesJsPath = path.join(__dirname, '../templates/articles.js');
            const articlesValidation = pipelineValidator.validateFileOperation('read', articlesJsPath, false);
            if (articlesValidation.valid && articlesValidation.exists) {
                const articlesJs = readFile(articlesJsPath);
                writeFile(path.join(distDir, 'articles.js'), articlesJs);
            } else {
                console.warn('⚠️ Articles.js not found, will be generated by bulk script');
            }
        } catch (error) {
            errorLogger.log(error, {
                module: 'build',
                operation: 'copy-articles-js',
                category: 'file_system',
                severity: 'warning'
            });
        }

    // Images (Create dir if not exists)
    const imagesDir = path.join(distDir, 'images');
    if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir);

    // 4. Generate Article Pages
    const articleTemplate = readFile(path.join(__dirname, '../templates/article.html'));

        // Load the generated articles
        // We need to eval the file content to get the array, or just read the JSON part if we changed the format
        // For simplicity, let's require the file we just wrote (if it exists)
        let articles = [];
        try {
            const articlesContent = readFile(path.join(__dirname, '../templates/articles.js'));
            // Extract the array part: const articles = [...];
            const jsonPart = articlesContent.substring(articlesContent.indexOf('['), articlesContent.lastIndexOf(']') + 1);
            articles = JSON.parse(jsonPart);
            
            // Validate articles
            if (Array.isArray(articles)) {
                articles.forEach((article, index) => {
                    const articleValidation = pipelineValidator.validateArticle(article, {
                        index,
                        operation: 'build-article-pages'
                    });
                    if (!articleValidation.valid) {
                        console.warn(`⚠️ Article ${index + 1} validation failed: ${articleValidation.errors.join(', ')}`);
                    }
                });
            }
        } catch (e) {
            errorLogger.log(e, {
                module: 'build',
                operation: 'load-articles',
                category: 'file_system',
                severity: 'warning'
            });
            console.warn('⚠️ Could not load articles for page generation:', e.message);
        }

    const articlesDir = path.join(distDir, 'articles');
    if (!fs.existsSync(articlesDir)) fs.mkdirSync(articlesDir);

    // Initialize SEO Optimizer and Quality Scorer (Analytics Manager already initialized at top level)
    const seoOptimizer = new SEOOptimizer();
    const qualityScorer = new ArticleQualityScorer();

    articles.forEach(article => {
        let pageHtml = articleTemplate;

        // Replace Site Identity
        pageHtml = pageHtml.replace(/{{site.name}}/g, config.site.name);
        pageHtml = pageHtml.replace(/{{site.logoText}}/g, config.site.logoText);
        pageHtml = pageHtml.replace(/{{site.logoAccent}}/g, config.site.logoAccent);

        // Replace Article Data
        pageHtml = pageHtml.replace(/{{article.title}}/g, article.title);
        pageHtml = pageHtml.replace(/{{article.excerpt}}/g, article.excerpt);
        pageHtml = pageHtml.replace(/{{article.author}}/g, article.author);
        pageHtml = pageHtml.replace(/{{article.date}}/g, article.date);
        pageHtml = pageHtml.replace(/{{article.category}}/g, article.category);
        pageHtml = pageHtml.replace(/{{article.readTime}}/g, article.readTime);
        pageHtml = pageHtml.replace(/{{article.image}}/g, article.image);
        pageHtml = pageHtml.replace(/{{article.content}}/g, article.content || '<p>Content generating...</p>');

        // Phase 3: Score article quality if not already scored
        if (!article.quality) {
            article.quality = qualityScorer.scoreArticle(article);
        }

        // Generate Structured Data (JSON-LD) - Phase 1.4
        const structuredData = seoOptimizer.generateStructuredData(article, config.site);
        const structuredDataScript = `<script type="application/ld+json">\n${JSON.stringify(structuredData, null, 2)}\n</script>`;

        // Generate Open Graph and Twitter Card meta tags - Phase 1.3
        const ogTags = seoOptimizer.generateOpenGraphTags(article, config.site);
        const twitterTags = seoOptimizer.generateTwitterCardTags(article, config.site);

        // Phase 3 Refinement: Add quality metadata as HTML comment
        const qualityMeta = article.quality ? `
    <!-- Article Quality Metrics -->
    <!-- Quality Score: ${article.quality.scores.overall.toFixed(1)}/100 (Grade: ${article.quality.grade}) -->
    <!-- Readability: ${article.quality.scores.readability.toFixed(1)} | SEO: ${article.quality.scores.seo.score.toFixed(1)} | Structure: ${article.quality.scores.structure.toFixed(1)} | Engagement: ${article.quality.scores.engagement.toFixed(1)} -->
` : '';

        const metaTags = `${qualityMeta}
    <!-- Open Graph / Social Media -->
    <meta property="og:type" content="article">
    <meta property="og:title" content="${ogTags['og:title']}">
    <meta property="og:description" content="${ogTags['og:description']}">
    <meta property="og:image" content="${ogTags['og:image']}">
    <meta property="og:url" content="${ogTags['og:url']}">
    <meta property="og:site_name" content="${ogTags['og:site_name']}">
    <meta property="article:published_time" content="${ogTags['article:published_time']}">
    <meta property="article:author" content="${ogTags['article:author']}">
    <meta property="article:section" content="${ogTags['article:section']}">
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="${twitterTags['twitter:card']}">
    <meta name="twitter:title" content="${twitterTags['twitter:title']}">
    <meta name="twitter:description" content="${twitterTags['twitter:description']}">
    <meta name="twitter:image" content="${twitterTags['twitter:image']}">
    ${twitterTags['twitter:site'] ? `<meta name="twitter:site" content="${twitterTags['twitter:site']}">` : ''}
    
    <!-- Structured Data -->
    ${structuredDataScript}
        `.trim();

        // Inject meta tags into head
        if (pageHtml.includes('<!-- SEO_META_TAGS -->')) {
            pageHtml = pageHtml.replace('<!-- SEO_META_TAGS -->', metaTags);
        } else {
            // Insert before closing </head>
            pageHtml = pageHtml.replace('</head>', `    ${metaTags}\n</head>`);
        }
        
        // Inject Analytics Scripts (Phase 4) - Single consolidated injection
        if (config.analytics && config.analytics.enabled) {
            const analyticsScript = analyticsManager.generateGAScript() + '\n' + analyticsManager.generateCustomTrackingScript() + '\n' + performanceMonitor.generateMonitoringScript();
            
            if (pageHtml.includes('<!-- ANALYTICS_SCRIPT -->')) {
                pageHtml = pageHtml.replace('<!-- ANALYTICS_SCRIPT -->', analyticsScript);
            } else {
                // Insert before closing </head>
                pageHtml = pageHtml.replace('</head>', `    ${analyticsScript}\n</head>`);
            }
            
            // Track page view
            const articleSlug = article.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            analyticsManager.trackPageView(`/articles/${articleSlug}`, article.title);
        }

        // Inject Ads
        const headerAd = renderAd('header');
        const sidebarAd = renderAd('sidebar');
        const footerAd = renderAd('footer');
        const inContentAd = renderAd('inContent');

        pageHtml = pageHtml.replace('<!-- HEADER_AD_PLACEHOLDER -->', headerAd);
        pageHtml = pageHtml.replace('<!-- SIDEBAR_AD_PLACEHOLDER -->', sidebarAd);
        pageHtml = pageHtml.replace('<!-- FOOTER_AD_PLACEHOLDER -->', footerAd);
        pageHtml = pageHtml.replace('<!-- INCONTENT_AD_PLACEHOLDER -->', inContentAd);

        // Save file
        const slug = article.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        writeFile(path.join(articlesDir, `${slug}.html`), pageHtml);
    });
        console.log(`✅ Generated ${articles.length} article pages`);

        // 5. Generate SEO Files
        try {
            generateSitemap();
            generateRobots();
        } catch (error) {
            errorLogger.log(error, {
                module: 'build',
                operation: 'generate-seo-files',
                category: 'file_system',
                severity: 'error'
            });
            throw error;
        }

        console.log('✅ Build complete! Output in /dist');
        
        // Print error report if there were any errors
        const errorSummary = errorLogger.getSummary();
        if (errorSummary.total > 0) {
            console.log('\n⚠️ Some errors occurred during build:');
            errorLogger.printReport();
        }
        
    } catch (error) {
        errorLogger.log(error, {
            module: 'build',
            operation: 'build-process',
            category: 'pipeline',
            severity: 'critical'
        });
        
        console.error('\n❌ Build failed!');
        errorLogger.printReport();
        process.exit(1);
    }
};

// Run build
if (require.main === module) {
    build().catch(error => {
        errorLogger.log(error, {
            module: 'build',
            operation: 'build-entry',
            category: 'pipeline',
            severity: 'critical'
        });
        console.error('❌ Fatal error:', error.message);
        process.exit(1);
    });
}

module.exports = build;
