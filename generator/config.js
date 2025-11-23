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
        llm: process.env.LLM_API_KEY || "placeholder-llm-key",
        imageGen: process.env.IMAGE_GEN_API_KEY || "placeholder-nano-banana-key"
    }
};
