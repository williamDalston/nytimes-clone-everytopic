/**
 * Article Templates Library
 * Different article templates for various content types
 */

const ARTICLE_TEMPLATES = {
    news: {
        name: 'News Article',
        description: 'Objective news reporting style',
        structure: ['lede', 'context', 'details', 'quotes', 'conclusion'],
        wordCount: { min: 300, max: 800 },
        tone: 'objective, factual, timely',
        style: 'journalistic'
    },
    tutorial: {
        name: 'Tutorial/How-To',
        description: 'Step-by-step instructional content',
        structure: ['introduction', 'prerequisites', 'steps', 'troubleshooting', 'conclusion'],
        wordCount: { min: 800, max: 2000 },
        tone: 'clear, instructive, actionable',
        style: 'practical'
    },
    listicle: {
        name: 'Listicle',
        description: 'List-based article format',
        structure: ['introduction', 'item1', 'item2', 'item3', 'item4', 'item5', 'conclusion'],
        wordCount: { min: 600, max: 1500 },
        tone: 'engaging, scannable, informative',
        style: 'practical'
    },
    opinion: {
        name: 'Opinion/Editorial',
        description: 'Opinion piece with clear viewpoint',
        structure: ['hook', 'position', 'arguments', 'counterarguments', 'conclusion'],
        wordCount: { min: 800, max: 1500 },
        tone: 'persuasive, thoughtful, engaging',
        style: 'analytical'
    },
    interview: {
        name: 'Interview',
        description: 'Question and answer format',
        structure: ['introduction', 'q1', 'q2', 'q3', 'q4', 'q5', 'conclusion'],
        wordCount: { min: 1000, max: 3000 },
        tone: 'conversational, informative, engaging',
        style: 'narrative'
    },
    analysis: {
        name: 'Analysis/Deep Dive',
        description: 'In-depth analytical article',
        structure: ['overview', 'background', 'analysis', 'implications', 'conclusion'],
        wordCount: { min: 1500, max: 3000 },
        tone: 'analytical, comprehensive, thoughtful',
        style: 'analytical'
    },
    review: {
        name: 'Review',
        description: 'Product/service review format',
        structure: ['overview', 'pros', 'cons', 'use-cases', 'verdict'],
        wordCount: { min: 600, max: 1500 },
        tone: 'balanced, honest, helpful',
        style: 'practical'
    },
    caseStudy: {
        name: 'Case Study',
        description: 'Real-world example or study',
        structure: ['situation', 'challenge', 'solution', 'results', 'lessons'],
        wordCount: { min: 1000, max: 2500 },
        tone: 'detailed, evidence-based, instructive',
        style: 'analytical'
    },
    guide: {
        name: 'Guide',
        description: 'Comprehensive guide format',
        structure: ['introduction', 'what-is', 'why-matters', 'how-to', 'best-practices', 'conclusion'],
        wordCount: { min: 1200, max: 3000 },
        tone: 'educational, comprehensive, helpful',
        style: 'practical'
    },
    feature: {
        name: 'Feature Story',
        description: 'Long-form narrative feature',
        structure: ['hook', 'setting', 'narrative', 'development', 'climax', 'resolution', 'reflection'],
        wordCount: { min: 2000, max: 5000 },
        tone: 'narrative, immersive, engaging',
        style: 'narrative'
    }
};

/**
 * Template Manager
 */
class TemplateManager {
    constructor() {
        this.templates = ARTICLE_TEMPLATES;
    }

    /**
     * Get all templates
     */
    getAllTemplates() {
        return Object.keys(this.templates).map(key => ({
            key,
            ...this.templates[key]
        }));
    }

    /**
     * Get template by key
     */
    getTemplate(key) {
        return this.templates[key] || this.templates.analysis; // Default to analysis
    }

    /**
     * Get template prompt
     */
    getTemplatePrompt(templateKey, topic) {
        const template = this.getTemplate(templateKey);
        
        return `Write a ${template.name.toLowerCase()} about: ${topic}

Template: ${template.name}
Description: ${template.description}

Structure:
${template.structure.map((section, i) => `${i + 1}. ${section}`).join('\n')}

Tone: ${template.tone}
Style: ${template.style}
Word Count: ${template.wordCount.min}-${template.wordCount.max} words

Requirements:
- Follow the structure above
- Maintain ${template.tone} tone
- Write in ${template.style} style
- Target ${template.wordCount.min}-${template.wordCount.max} words
- Include proper HTML formatting (headings, paragraphs, lists)
- Make it engaging and informative

Output JSON format:
{
  "title": "Your engaging title",
  "excerpt": "Compelling excerpt (120-160 characters)",
  "content": "<html>Full article content following the structure</html>"
}`;
    }

    /**
     * Get random template
     */
    getRandomTemplate() {
        const keys = Object.keys(this.templates);
        const randomKey = keys[Math.floor(Math.random() * keys.length)];
        return {
            key: randomKey,
            ...this.templates[randomKey]
        };
    }

    /**
     * Suggest template based on topic
     */
    suggestTemplate(topic) {
        const topicLower = topic.toLowerCase();
        
        if (topicLower.includes('how to') || topicLower.includes('tutorial') || topicLower.includes('guide')) {
            return 'tutorial';
        }
        if (topicLower.includes('best') || topicLower.includes('top') || topicLower.includes('list')) {
            return 'listicle';
        }
        if (topicLower.includes('review') || topicLower.includes('compare')) {
            return 'review';
        }
        if (topicLower.includes('case study') || topicLower.includes('example')) {
            return 'caseStudy';
        }
        if (topicLower.includes('opinion') || topicLower.includes('viewpoint')) {
            return 'opinion';
        }
        if (topicLower.includes('analysis') || topicLower.includes('deep dive')) {
            return 'analysis';
        }
        
        return 'analysis'; // Default
    }
}

module.exports = {
    TemplateManager,
    ARTICLE_TEMPLATES
};

