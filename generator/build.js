const fs = require('fs');
const path = require('path');
const config = require('./config');

// Helper to read file content
const readFile = (filePath) => fs.readFileSync(filePath, 'utf8');

// Helper to write file content
const writeFile = (filePath, content) => {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, content);
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
const build = () => {
    console.log('🏭 Starting Site Factory Build...');

    // 1. Prepare Dist Directory
    const distDir = path.join(__dirname, '../dist');
    if (!fs.existsSync(distDir)) fs.mkdirSync(distDir);

    // 2. Process HTML Templates
    const indexTemplate = readFile(path.join(__dirname, '../templates/index.html'));

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
    const css = readFile(path.join(__dirname, '../templates/styles.css'));
    writeFile(path.join(distDir, 'styles.css'), css);

    // JS
    const mainJs = readFile(path.join(__dirname, '../templates/main.js'));
    writeFile(path.join(distDir, 'main.js'), mainJs);

    const articlesJs = readFile(path.join(__dirname, '../templates/articles.js'));
    writeFile(path.join(distDir, 'articles.js'), articlesJs);

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
    } catch (e) {
        console.warn('⚠️ Could not load articles for page generation:', e.message);
    }

    const articlesDir = path.join(distDir, 'articles');
    if (!fs.existsSync(articlesDir)) fs.mkdirSync(articlesDir);

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
    generateSitemap();
    generateRobots();

    console.log('✅ Build complete! Output in /dist');
};

build();
