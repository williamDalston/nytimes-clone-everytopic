/**
 * Topic Management System
 * Based on Sovereign Mind's topic structure
 * Supports switching through topics with varying styles and lengths
 */

// Sovereign Mind style topics organized by category
const SOVEREIGN_MIND_TOPICS = {
    nature: [
        'coastal-erosion',
        'climate-feedbacks',
        'ocean-acidification',
        'biodiversity-loss',
        'resource-depletion',
        'ecosystem-restoration',
        'sustainable-agriculture',
        'renewable-energy-transition',
        'water-security',
        'wildlife-conservation'
    ],
    mind: [
        'attention-economy',
        'sleep-architecture',
        'memory-consolidation',
        'cognitive-load',
        'decision-fatigue',
        'mindfulness-practice',
        'neuroplasticity',
        'focus-training',
        'mental-models',
        'cognitive-biases'
    ],
    society: [
        'polarization',
        'urban-design',
        'social-cohesion',
        'information-cascades',
        'collective-intelligence',
        'community-building',
        'civic-engagement',
        'social-capital',
        'cultural-evolution',
        'democratic-participation'
    ],
    technology: [
        'ai-alignment',
        'algorithmic-bias',
        'network-effects',
        'platform-governance',
        'privacy-tradeoffs',
        'ethical-ai',
        'digital-divide',
        'cybersecurity',
        'data-sovereignty',
        'technological-determinism'
    ],
    economy: [
        'incentive-design',
        'market-failures',
        'behavioral-economics',
        'value-creation',
        'systemic-risk',
        'circular-economy',
        'sharing-economy',
        'economic-inequality',
        'sustainable-growth',
        'regenerative-economics'
    ],
    philosophy: [
        'virtue-ethics',
        'stoic-practice',
        'existential-meaning',
        'moral-development',
        'wisdom-tradition',
        'philosophical-inquiry',
        'ethics-of-care',
        'justice-theory',
        'metaphysical-foundations',
        'practical-wisdom'
    ],
    health: [
        'preventive-medicine',
        'mental-health',
        'lifestyle-medicine',
        'wellness-practice',
        'holistic-health',
        'public-health',
        'health-equity',
        'longevity-research',
        'integrative-medicine',
        'health-literacy'
    ],
    education: [
        'lifelong-learning',
        'critical-thinking',
        'educational-innovation',
        'personalized-learning',
        'education-equity',
        'skills-development',
        'learning-sciences',
        'pedagogical-methods',
        'educational-technology',
        'knowledge-construction'
    ],
    communication: [
        'rhetorical-strategy',
        'persuasive-communication',
        'active-listening',
        'nonviolent-communication',
        'public-speaking',
        'narrative-persuasion',
        'digital-communication',
        'interpersonal-skills',
        'communication-ethics',
        'effective-messaging'
    ],
    governance: [
        'democratic-institutions',
        'policy-design',
        'civic-participation',
        'transparency-accountability',
        'institutional-reform',
        'public-administration',
        'governance-models',
        'policy-innovation',
        'citizen-engagement',
        'institutional-trust'
    ]
};

/**
 * Article style configurations
 * Each topic can have varying styles and lengths
 */
const ARTICLE_STYLES = {
    short: {
        wordCount: { min: 400, max: 700 },
        sections: 2,
        depth: 'overview',
        style: 'brief, concise, actionable',
        readTime: { min: 2, max: 4 }
    },
    medium: {
        wordCount: { min: 800, max: 1200 },
        sections: 3,
        depth: 'moderate',
        style: 'balanced, informative, engaging',
        readTime: { min: 5, max: 7 }
    },
    long: {
        wordCount: { min: 1500, max: 2500 },
        sections: 5,
        depth: 'comprehensive',
        style: 'in-depth, detailed, thorough',
        readTime: { min: 8, max: 12 }
    },
    feature: {
        wordCount: { min: 2500, max: 4000 },
        sections: 7,
        depth: 'deep-dive',
        style: 'narrative, immersive, comprehensive',
        readTime: { min: 13, max: 18 }
    }
};

/**
 * Angle/View configurations (Sovereign Mind style)
 */
const ARTICLE_ANGLES = {
    analytical: {
        tone: 'objective, data-driven, systematic',
        focus: 'analysis, patterns, implications',
        voice: 'expert analyst'
    },
    reflective: {
        tone: 'thoughtful, contemplative, introspective',
        focus: 'meaning, significance, personal reflection',
        voice: 'wise observer'
    },
    practical: {
        tone: 'actionable, direct, solution-oriented',
        focus: 'how-to, application, implementation',
        voice: 'practical guide'
    },
    narrative: {
        tone: 'storytelling, engaging, human-centered',
        focus: 'stories, experiences, human impact',
        voice: 'storyteller'
    },
    philosophical: {
        tone: 'deep, questioning, contemplative',
        focus: 'principles, values, deeper meaning',
        voice: 'philosopher'
    },
    journalistic: {
        tone: 'factual, balanced, investigative',
        focus: 'reporting, context, multiple perspectives',
        voice: 'journalist'
    }
};

/**
 * Topic Manager Class
 */
class TopicManager {
    constructor() {
        this.topics = this._flattenTopics(SOVEREIGN_MIND_TOPICS);
        this.currentTopicIndex = 0;
        this.categoryMap = this._buildCategoryMap(SOVEREIGN_MIND_TOPICS);
    }

    /**
     * Flatten topics from category structure to array
     */
    _flattenTopics(topicCategories) {
        const allTopics = [];
        for (const [category, topics] of Object.entries(topicCategories)) {
            topics.forEach(topic => {
                allTopics.push({
                    slug: topic,
                    category: category,
                    title: this._slugToTitle(topic),
                    fullName: `${category}: ${this._slugToTitle(topic)}`
                });
            });
        }
        return allTopics;
    }

    /**
     * Build category map for easy lookup
     */
    _buildCategoryMap(topicCategories) {
        const map = {};
        for (const [category, topics] of Object.entries(topicCategories)) {
            map[category] = topics.map(topic => ({
                slug: topic,
                title: this._slugToTitle(topic)
            }));
        }
        return map;
    }

    /**
     * Convert slug to readable title
     */
    _slugToTitle(slug) {
        return slug
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    /**
     * Get all topics
     */
    getAllTopics() {
        return this.topics;
    }

    /**
     * Get topics by category
     */
    getTopicsByCategory(category) {
        return this.categoryMap[category] || [];
    }

    /**
     * Get random topic
     */
    getRandomTopic() {
        const index = Math.floor(Math.random() * this.topics.length);
        return this.topics[index];
    }

    /**
     * Get next topic (circular)
     */
    getNextTopic() {
        const topic = this.topics[this.currentTopicIndex];
        this.currentTopicIndex = (this.currentTopicIndex + 1) % this.topics.length;
        return topic;
    }

    /**
     * Get topic by slug
     */
    getTopicBySlug(slug) {
        return this.topics.find(t => t.slug === slug);
    }

    /**
     * Get article style configuration
     */
    getArticleStyle(styleName = 'medium') {
        return ARTICLE_STYLES[styleName] || ARTICLE_STYLES.medium;
    }

    /**
     * Get random article style
     */
    getRandomStyle() {
        const styles = Object.keys(ARTICLE_STYLES);
        const styleName = styles[Math.floor(Math.random() * styles.length)];
        return {
            name: styleName,
            config: ARTICLE_STYLES[styleName]
        };
    }

    /**
     * Get article angle/view configuration
     */
    getArticleAngle(angleName = 'analytical') {
        return ARTICLE_ANGLES[angleName] || ARTICLE_ANGLES.analytical;
    }

    /**
     * Get random article angle
     */
    getRandomAngle() {
        const angles = Object.keys(ARTICLE_ANGLES);
        const angleName = angles[Math.floor(Math.random() * angles.length)];
        return {
            name: angleName,
            config: ARTICLE_ANGLES[angleName]
        };
    }

    /**
     * Generate article configuration from topic
     * Returns style, angle, and topic info
     */
    generateArticleConfig(topic, options = {}) {
        const style = options.style || this.getRandomStyle();
        const angle = options.angle || this.getRandomAngle();
        
        return {
            topic: topic,
            style: style,
            angle: angle,
            wordCount: this._randomInRange(
                style.config.wordCount.min,
                style.config.wordCount.max
            ),
            sections: style.config.sections,
            readTime: this._randomInRange(
                style.config.readTime.min,
                style.config.readTime.max
            )
        };
    }

    /**
     * Random number in range
     */
    _randomInRange(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Get total topic count
     */
    getTotalCount() {
        return this.topics.length;
    }

    /**
     * Get category list
     */
    getCategories() {
        return Object.keys(this.categoryMap);
    }

    /**
     * Get topics count by category
     */
    getTopicCounts() {
        const counts = {};
        for (const category of this.getCategories()) {
            counts[category] = this.categoryMap[category].length;
        }
        return counts;
    }
}

module.exports = {
    TopicManager,
    SOVEREIGN_MIND_TOPICS,
    ARTICLE_STYLES,
    ARTICLE_ANGLES
};

