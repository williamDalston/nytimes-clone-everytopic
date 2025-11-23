/**
 * Site Configuration System
 * Allows easy replication of the site factory for different topics/niches
 * Each site can have its own configuration while sharing the same codebase
 */

const fs = require('fs');
const path = require('path');

/**
 * Site Configuration Template
 * Defines all configurable aspects of a site
 */
const SITE_CONFIG_TEMPLATE = {
    // Site Identity - Branding and identity
    identity: {
        name: "Site Name",
        domain: "sitename.com",
        description: "Site description for SEO and social sharing",
        keywords: "keyword1, keyword2, keyword3",
        language: "en",
        themeColor: "#bb1919",
        logoText: "Site",
        logoAccent: "Name",
        favicon: "/favicon.ico"
    },
    
    // Content Focus - What topics this site covers
    content: {
        primaryTopic: "Primary Topic",
        topicCategories: ["category1", "category2"],
        useSovereignMindTopics: true, // Use the Sovereign Mind topic system
        customTopics: [], // Custom topics if not using Sovereign Mind
        focusLens: [], // Preferred lenses (empty = use all)
        articleMix: {
            short: 0.2,    // 20% short articles
            medium: 0.5,   // 50% medium articles
            long: 0.25,    // 25% long articles
            feature: 0.05  // 5% feature articles
        },
        perspectivesPerTopic: 3, // Number of different lens perspectives per topic
        articlesPerPage: 12
    },
    
    // Visual Layout - How articles are displayed
    layout: {
        gridColumns: 2, // Desktop grid columns
        featuredStyle: "hero", // hero, large, spotlight
        cardVariations: true, // Vary card sizes for visual interest
        spacing: {
            articleGap: "var(--space-8)",
            sectionPadding: "var(--space-10)"
        }
    },
    
    // Monetization
    monetization: {
        ads: {
            enabled: true,
            publisherId: "pub-XXXXXXXXXXXXXXXX",
            placements: ["header", "sidebar", "inContent", "footer"]
        },
        affiliate: {
            enabled: false,
            program: ""
        }
    },
    
    // Generation Settings
    generation: {
        maxArticles: 50,
        usePipeline: true,
        pipelineStages: ['blueprint', 'draft', 'enhance', 'humanize', 'seo'],
        varyStyles: true,
        varyAngles: true,
        useMultiplePerspectives: true
    },
    
    // Social & Analytics
    social: {
        twitter: "@sitehandle",
        facebook: "sitepage",
        linkedin: "sitecompany"
    },
    
    analytics: {
        enabled: true,
        ga4Id: "",
        tracking: {
            pageViews: true,
            scrollDepth: true,
            readingTime: true
        }
    }
};

/**
 * Site Config Manager
 * Manages site configurations for different topics/niches
 */
class SiteConfigManager {
    constructor(configDir = null) {
        this.configDir = configDir || path.join(__dirname, '../configs');
        this.activeConfig = null;
    }
    
    /**
     * Create a new site configuration
     */
    createSiteConfig(configName, configData) {
        if (!fs.existsSync(this.configDir)) {
            fs.mkdirSync(this.configDir, { recursive: true });
        }
        
        const configPath = path.join(this.configDir, `${configName}.json`);
        const fullConfig = { ...SITE_CONFIG_TEMPLATE, ...configData };
        
        fs.writeFileSync(configPath, JSON.stringify(fullConfig, null, 2));
        console.log(`✅ Created site configuration: ${configName}`);
        
        return fullConfig;
    }
    
    /**
     * Load site configuration
     */
    loadSiteConfig(configName) {
        const configPath = path.join(this.configDir, `${configName}.json`);
        
        if (!fs.existsSync(configPath)) {
            throw new Error(`Site configuration not found: ${configName}`);
        }
        
        const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        this.activeConfig = configData;
        
        return configData;
    }
    
    /**
     * Load active config (from main config.js or site-specific)
     */
    loadActiveConfig() {
        // Try to load from environment
        const siteConfigName = process.env.SITE_CONFIG;
        
        if (siteConfigName) {
            return this.loadSiteConfig(siteConfigName);
        }
        
        // Fallback to main config
        return require('./config');
    }
    
    /**
     * List all available site configurations
     */
    listSiteConfigs() {
        if (!fs.existsSync(this.configDir)) {
            return [];
        }
        
        return fs.readdirSync(this.configDir)
            .filter(file => file.endsWith('.json'))
            .map(file => file.replace('.json', ''));
    }
    
    /**
     * Generate site configuration from topic
     * Creates a complete config for a new topic/niche
     */
    generateConfigFromTopic(topic, options = {}) {
        const configName = options.configName || topic.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        
        const config = {
            identity: {
                name: `${topic} News`,
                domain: `${configName}.com`,
                description: `Your premier source for ${topic} insights, news, and analysis.`,
                keywords: `${topic}, ${options.keywords || 'insights, analysis, news'}`,
                themeColor: options.themeColor || "#bb1919",
                logoText: topic.split(' ')[0],
                logoAccent: topic.split(' ').slice(1).join(' ') || "News"
            },
            content: {
                primaryTopic: topic,
                topicCategories: options.categories || ['general'],
                useSovereignMindTopics: options.useSovereignMindTopics !== false,
                perspectivesPerTopic: options.perspectivesPerTopic || 3,
                articleMix: options.articleMix || SITE_CONFIG_TEMPLATE.content.articleMix
            },
            generation: {
                maxArticles: options.maxArticles || 50,
                useMultiplePerspectives: options.useMultiplePerspectives !== false
            }
        };
        
        return this.createSiteConfig(configName, config);
    }
    
    /**
     * Merge site config with main config
     * Used during build/generation to apply site-specific settings
     */
    mergeWithMainConfig(siteConfig, mainConfig) {
        return {
            ...mainConfig,
            site: {
                ...mainConfig.site,
                ...siteConfig.identity
            },
            content: {
                ...mainConfig.content,
                ...siteConfig.content
            },
            ads: {
                ...mainConfig.ads,
                ...siteConfig.monetization?.ads
            },
            analytics: {
                ...mainConfig.analytics,
                ...siteConfig.analytics
            }
        };
    }
}

module.exports = {
    SiteConfigManager,
    SITE_CONFIG_TEMPLATE
};

