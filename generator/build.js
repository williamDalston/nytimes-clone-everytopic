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

    // 4. Generate SEO Files
    generateSitemap();
    generateRobots();

    console.log('✅ Build complete! Output in /dist');
};

build();
