const fs = require('fs');
const path = require('path');
const config = require('./config');

const generateSitemap = () => {
    const domain = config.site.domain;
    const today = new Date().toISOString().split('T')[0];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://${domain}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <!-- Articles would be added here dynamically in a real scenario -->
</urlset>`;

    fs.writeFileSync(path.join(__dirname, '../dist/sitemap.xml'), sitemap);
    console.log('✅ Sitemap generated');
};

const generateRobots = () => {
    const domain = config.site.domain;
    const robots = `User-agent: *
Allow: /
Sitemap: https://${domain}/sitemap.xml`;

    fs.writeFileSync(path.join(__dirname, '../dist/robots.txt'), robots);
    console.log('✅ Robots.txt generated');
};

module.exports = { generateSitemap, generateRobots };
