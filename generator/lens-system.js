/**
 * Multi-Lens/Perspective System
 * Inspired by Sovereign Mind's approach to breaking down topics from different lenses
 * Each topic can be explored from multiple perspectives/angles/views
 */

/**
 * Lens Definitions - Different ways to view a topic
 * Like Sovereign Mind's approach of exploring topics from multiple angles
 */
const LENS_DEFINITIONS = {
    // Analytical lens - data, patterns, systematic analysis
    analytical: {
        name: 'Analytical',
        description: 'Data-driven analysis with systematic examination of patterns and implications',
        tone: 'objective, evidence-based, systematic',
        focus: ['patterns', 'data', 'trends', 'causality', 'implications'],
        question: 'What does the data tell us?',
        voice: 'expert analyst',
        structure: 'problem → analysis → implications',
        examples: ['statistical analysis', 'trend identification', 'correlation studies']
    },
    
    // Reflective lens - contemplation, meaning, significance
    reflective: {
        name: 'Reflective',
        description: 'Thoughtful contemplation of deeper meaning and personal significance',
        tone: 'contemplative, introspective, wise',
        focus: ['meaning', 'significance', 'wisdom', 'values', 'reflection'],
        question: 'What does this mean at a deeper level?',
        voice: 'wise observer',
        structure: 'observation → reflection → insight',
        examples: ['philosophical inquiry', 'personal reflection', 'meaning-making']
    },
    
    // Practical lens - actionable, how-to, implementation
    practical: {
        name: 'Practical',
        description: 'Actionable guidance with step-by-step implementation strategies',
        tone: 'direct, solution-oriented, actionable',
        focus: ['how-to', 'steps', 'implementation', 'tools', 'application'],
        question: 'How do we actually do this?',
        voice: 'practical guide',
        structure: 'goal → method → steps → outcome',
        examples: ['tutorials', 'guides', 'checklists', 'frameworks']
    },
    
    // Narrative lens - storytelling, human experience
    narrative: {
        name: 'Narrative',
        description: 'Storytelling approach focusing on human experiences and impact',
        tone: 'engaging, human-centered, storytelling',
        focus: ['stories', 'experiences', 'people', 'impact', 'journey'],
        question: 'What story does this tell?',
        voice: 'storyteller',
        structure: 'setup → journey → transformation',
        examples: ['case studies', 'personal narratives', 'success stories']
    },
    
    // Philosophical lens - principles, values, deeper questions
    philosophical: {
        name: 'Philosophical',
        description: 'Deep exploration of underlying principles, values, and fundamental questions',
        tone: 'questioning, contemplative, principled',
        focus: ['principles', 'values', 'ethics', 'truth', 'wisdom'],
        question: 'What are the underlying principles?',
        voice: 'philosopher',
        structure: 'question → exploration → principle',
        examples: ['ethical analysis', 'value exploration', 'principle derivation']
    },
    
    // Journalistic lens - reporting, multiple perspectives, facts
    journalistic: {
        name: 'Journalistic',
        description: 'Factual reporting with balanced presentation of multiple perspectives',
        tone: 'factual, balanced, investigative',
        focus: ['facts', 'sources', 'perspectives', 'context', 'reporting'],
        question: 'What are the facts and who says what?',
        voice: 'journalist',
        structure: 'who → what → when → where → why → how',
        examples: ['news reporting', 'investigative pieces', 'multi-perspective analysis']
    },
    
    // Scientific lens - methodology, evidence, peer review
    scientific: {
        name: 'Scientific',
        description: 'Methodical approach based on research methodology and evidence',
        tone: 'methodical, evidence-based, peer-reviewed',
        focus: ['methodology', 'evidence', 'hypothesis', 'experiments', 'results'],
        question: 'What does the research show?',
        voice: 'researcher',
        structure: 'hypothesis → method → results → conclusions',
        examples: ['research reviews', 'study analysis', 'evidence synthesis']
    },
    
    // Systems lens - interconnections, systems thinking
    systems: {
        name: 'Systems',
        description: 'Systems thinking approach examining interconnections and emergent properties',
        tone: 'holistic, interconnected, systemic',
        focus: ['systems', 'interconnections', 'feedback loops', 'emergence', 'complexity'],
        question: 'How does this fit into the larger system?',
        voice: 'systems thinker',
        structure: 'boundaries → elements → relationships → behavior',
        examples: ['systems analysis', 'network mapping', 'feedback analysis']
    },
    
    // Historical lens - context, evolution, patterns over time
    historical: {
        name: 'Historical',
        description: 'Historical context showing how things evolved and patterns over time',
        tone: 'contextual, chronological, evolutionary',
        focus: ['history', 'evolution', 'context', 'timeline', 'patterns'],
        question: 'How did we get here?',
        voice: 'historian',
        structure: 'origin → evolution → current state → trajectory',
        examples: ['historical analysis', 'evolution tracking', 'context setting']
    },
    
    // Comparative lens - comparisons, alternatives, trade-offs
    comparative: {
        name: 'Comparative',
        description: 'Comparative analysis examining alternatives, trade-offs, and choices',
        tone: 'comparative, evaluative, balanced',
        focus: ['alternatives', 'trade-offs', 'comparisons', 'choices', 'options'],
        question: 'How does this compare to alternatives?',
        voice: 'comparative analyst',
        structure: 'alternatives → criteria → comparison → recommendation',
        examples: ['product comparisons', 'alternative analysis', 'trade-off evaluation']
    },
    
    // Critical lens - questioning assumptions, power dynamics
    critical: {
        name: 'Critical',
        description: 'Critical examination questioning assumptions, power dynamics, and hidden structures',
        tone: 'questioning, challenging, critical',
        focus: ['assumptions', 'power', 'biases', 'structures', 'alternatives'],
        question: 'What assumptions are we making?',
        voice: 'critical thinker',
        structure: 'assumption → question → reveal → alternative',
        examples: ['critical analysis', 'assumption checking', 'bias examination']
    },
    
    // Future lens - trends, scenarios, possibilities
    future: {
        name: 'Future',
        description: 'Forward-looking exploration of trends, scenarios, and future possibilities',
        tone: 'forward-looking, speculative, trend-focused',
        focus: ['trends', 'scenarios', 'possibilities', 'futures', 'innovation'],
        question: 'Where is this heading?',
        voice: 'futurist',
        structure: 'current → trends → scenarios → implications',
        examples: ['trend analysis', 'scenario planning', 'future forecasting']
    }
};

/**
 * Lens Combinations - Which lenses work well together
 * Some topics benefit from exploring multiple lenses
 */
const LENS_COMBINATIONS = {
    comprehensive: ['analytical', 'practical', 'reflective'],
    investigative: ['journalistic', 'analytical', 'critical'],
    strategic: ['systems', 'analytical', 'future'],
    deep_dive: ['philosophical', 'reflective', 'historical'],
    how_to: ['practical', 'narrative', 'comparative'],
    understanding: ['scientific', 'analytical', 'systems']
};

/**
 * Lens Priority by Topic Category
 * Different categories of topics may benefit from different lens priorities
 */
const LENS_PRIORITY_BY_CATEGORY = {
    nature: ['scientific', 'systems', 'analytical', 'reflective'],
    mind: ['scientific', 'reflective', 'practical', 'philosophical'],
    society: ['systems', 'critical', 'journalistic', 'comparative'],
    technology: ['analytical', 'future', 'critical', 'practical'],
    economy: ['analytical', 'systems', 'critical', 'comparative'],
    philosophy: ['philosophical', 'reflective', 'critical', 'historical'],
    health: ['scientific', 'practical', 'reflective', 'comparative'],
    education: ['practical', 'systems', 'reflective', 'comparative'],
    communication: ['practical', 'narrative', 'analytical', 'reflective'],
    governance: ['systems', 'critical', 'comparative', 'journalistic']
};

/**
 * Lens System Manager
 * Manages lens selection and combination for topics
 */
class LensSystem {
    constructor() {
        this.lenses = LENS_DEFINITIONS;
        this.combinations = LENS_COMBINATIONS;
        this.priorityByCategory = LENS_PRIORITY_BY_CATEGORY;
    }
    
    /**
     * Get all available lenses
     */
    getAllLenses() {
        return Object.keys(this.lenses);
    }
    
    /**
     * Get lens definition
     */
    getLens(lensName) {
        return this.lenses[lensName] || this.lenses.analytical;
    }
    
    /**
     * Get recommended lenses for a topic category
     */
    getRecommendedLenses(category, count = 3) {
        const priority = this.priorityByCategory[category] || 
                        ['analytical', 'practical', 'reflective'];
        return priority.slice(0, count);
    }
    
    /**
     * Get lenses for a topic with variation
     * Returns multiple lenses to explore the topic from different angles
     */
    getLensesForTopic(topic, options = {}) {
        const category = topic.category || 'general';
        const count = options.count || 3;
        const includeVariety = options.includeVariety !== false;
        
        // Start with category recommendations
        let selectedLenses = this.getRecommendedLenses(category, count);
        
        // Add variety if requested
        if (includeVariety && count > 1) {
            const allLenses = this.getAllLenses();
            const used = new Set(selectedLenses);
            
            // Add complementary lenses
            while (selectedLenses.length < count && selectedLenses.length < allLenses.length) {
                const available = allLenses.filter(l => !used.has(l));
                if (available.length === 0) break;
                
                const randomLens = available[Math.floor(Math.random() * available.length)];
                selectedLenses.push(randomLens);
                used.add(randomLens);
            }
        }
        
        return selectedLenses.map(name => ({
            name,
            ...this.getLens(name)
        }));
    }
    
    /**
     * Get a random lens
     */
    getRandomLens() {
        const lenses = this.getAllLenses();
        const name = lenses[Math.floor(Math.random() * lenses.length)];
        return {
            name,
            ...this.getLens(name)
        };
    }
    
    /**
     * Get lens combination
     */
    getLensCombination(combinationName) {
        return this.combinations[combinationName] || this.combinations.comprehensive;
    }
    
    /**
     * Generate article config with lens
     * Adds lens information to article configuration
     */
    generateArticleConfigWithLens(topic, articleConfig, options = {}) {
        const lens = options.lens || this.getRandomLens();
        
        return {
            ...articleConfig,
            lens: {
                name: lens.name,
                description: lens.description,
                tone: lens.tone,
                focus: lens.focus,
                question: lens.question,
                voice: lens.voice
            },
            // Adjust style based on lens
            perspectivePrompt: this.generateLensPrompt(topic, lens)
        };
    }
    
    /**
     * Generate prompt addition for lens
     */
    generateLensPrompt(topic, lens) {
        const topicTitle = typeof topic === 'string' ? topic : (topic.title || topic.slug);
        
        return `
Approach this topic from the "${lens.name}" lens:

Focus: ${lens.description}
Tone: ${lens.tone}
Key Question: ${lens.question}
Voice: Write as a ${lens.voice}

Emphasize: ${lens.focus.join(', ')}

Structure your article to answer: ${lens.question}
        `.trim();
    }
    
    /**
     * Get multiple perspectives for one topic
     * Returns article configs exploring the same topic from different lenses
     */
    getMultiplePerspectives(topic, count = 3, options = {}) {
        const lenses = this.getLensesForTopic(topic, { count, ...options });
        const baseStyle = options.style || 'medium';
        
        return lenses.map((lens, index) => {
            // Vary styles across perspectives
            const styles = ['short', 'medium', 'long'];
            const style = options.varyStyles !== false 
                ? styles[index % styles.length] 
                : baseStyle;
            
            return {
                topic,
                lens,
                style: { name: style },
                perspective: index + 1,
                totalPerspectives: count
            };
        });
    }
}

module.exports = {
    LensSystem,
    LENS_DEFINITIONS,
    LENS_COMBINATIONS
};

