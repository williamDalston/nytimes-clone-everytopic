// Site Factory Configuration
// Defines the identity, content, and monetization settings for the generated site.

module.exports = {
    // Site Identity
    site: {
        name: "EveryTopic News",
        domain: "everytopic.news", // Placeholder domain
        description: "Your premier source for Power BI insights, tutorials, and best practices.",
        keywords: "Power BI, Business Intelligence, Data Analytics, DAX, Power Query",
        language: "en",
        themeColor: "#bb1919", // Primary accent color
        logoText: "EveryTopic",
        logoAccent: "News"
    },

    // Content Settings
    content: {
        topic: "Power BI",
        subtopics: [
            "Latest Updates",
            "Visualizations",
            "Advanced Analytics",
            "Power BI Basics",
            "Data Modeling",
            "Security",
            "Performance",
            "AI & ML"
        ],
        articlesPerPage: 12,
        heroArticleId: 1 // ID of the article to feature in the hero section
    },

    // Monetization (Ad System)
    ads: {
        enabled: true,
        testMode: true, // If true, shows placeholder boxes instead of real ads
        placements: {
            header: {
                enabled: true,
                type: "leaderboard", // 728x90
                id: "ad-header-1"
            },
            sidebar: {
                enabled: true,
                type: "rectangle", // 300x250
                id: "ad-sidebar-1",
                sticky: true
            },
            inContent: {
                enabled: true,
                type: "fluid",
                frequency: 3 // Insert ad after every 3rd paragraph (or article card in grid)
            },
            footer: {
                enabled: true,
                type: "leaderboard",
                id: "ad-footer-1"
            }
        },
        // Placeholder for AdSense/Mediavine ID
        publisherId: "pub-XXXXXXXXXXXXXXXX"
    },

    // API Keys (Placeholders)
    api: {
        llm: process.env.OPENAI_API_KEY || process.env.LLM_API_KEY || "placeholder-llm-key",
        imageGen: process.env.GEMINI_API_KEY || process.env.IMAGE_GEN_API_KEY || "placeholder-nano-banana-key"
    },

    // LLM Settings
    llm: {
        model: process.env.LLM_MODEL || "gpt-4o-mini",
        temperature: 0.7,
        maxTokens: 2000,
        cacheDir: "data/cache",
        useCache: true,
        dryRun: process.env.DRY_RUN === "true" || false,
        // Phase 3: Pipeline configuration (5-stage: blueprint → draft → enhance → humanize → seo)
        pipeline: {
            enabled: process.env.USE_PIPELINE !== "false", // Default: enabled
            stages: process.env.PIPELINE_STAGES 
                ? process.env.PIPELINE_STAGES.split(',') 
                : ['blueprint', 'draft', 'enhance', 'humanize', 'seo'], // Phase 3: 5-stage pipeline
            promptVersion: process.env.PROMPT_VERSION || 'v1'
        }
    },

    // Image Generation Settings
    image: {
        defaultSize: {
            width: 1200,
            height: 800
        },
        sizes: {
            articleHeader: { width: 1200, height: 800 },
            articleCard: { width: 600, height: 400 },
            thumbnail: { width: 300, height: 200 },
            hero: { width: 1920, height: 1080 }
        },
        saveLocal: true,
        cacheDir: "data/cache/images",
        imageDir: "dist/images"
    },

    // Analytics Settings (Phase 4)
    analytics: {
        enabled: process.env.ANALYTICS_ENABLED !== "false",
        ga4Id: process.env.GA4_MEASUREMENT_ID || process.env.GOOGLE_ANALYTICS_ID || "",
        trackScrollDepth: true,
        trackReadingTime: true,
        trackArticleViews: true
    },
    
    // Cost Tracking Settings (Phase 4)
    costTracking: {
        enabled: process.env.COST_TRACKING_ENABLED !== "false",
        budget: process.env.API_BUDGET ? parseFloat(process.env.API_BUDGET) : null,
        dataDir: "data"
    }
};
