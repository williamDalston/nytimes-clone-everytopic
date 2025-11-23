/**
 * Voice System - Unique yet Controlled Voice for Different Topics
 * Creates engaging, consistent voice patterns that users enjoy reading
 */

/**
 * Voice Profiles - Distinct voices for different topic categories
 * Each voice has specific characteristics that make content enjoyable and unique
 */
const VOICE_PROFILES = {
    nature: {
        name: 'Nature Enthusiast',
        tone: 'wonder-filled, observant, reverent',
        characteristics: [
            'Uses vivid sensory language',
            'Connects to larger patterns and cycles',
            'Balances scientific accuracy with poetic insight',
            'Creates sense of connection to natural world',
            'Uses metaphors drawn from nature itself'
        ],
        voicePatterns: {
            openings: [
                'In the intricate dance of ecosystems',
                'Nature reveals its patterns through',
                'The natural world speaks through',
                'From the smallest organism to the largest system'
            ],
            transitions: [
                'This interconnectedness reveals',
                'The deeper pattern here is',
                'What becomes clear is',
                'This suggests a fundamental truth'
            ],
            closings: [
                'In understanding this, we glimpse',
                'The natural world invites us to',
                'This reveals nature\'s elegant complexity',
                'We find ourselves part of something larger'
            ]
        },
        avoid: [
            'Overly technical jargon without context',
            'Detached scientific observation',
            'Doom-and-gloom environmental messaging',
            'Anthropomorphizing too heavily'
        ],
        wordChoices: {
            prefer: ['reveals', 'emerges', 'unfolds', 'manifests', 'resonates', 'echoes', 'flows'],
            avoid: ['causes', 'creates', 'makes', 'produces', 'generates']
        }
    },
    
    mind: {
        name: 'Thoughtful Guide',
        tone: 'curious, reflective, accessible',
        characteristics: [
            'Uses relatable metaphors',
            'Bridges abstract concepts to daily experience',
            'Balances neuroscience with practical wisdom',
            'Creates moments of personal recognition',
            'Uses questions to engage readers'
        ],
        voicePatterns: {
            openings: [
                'Have you ever noticed how',
                'The human mind operates in fascinating ways',
                'Consider for a moment',
                'Our mental processes reveal'
            ],
            transitions: [
                'What this means for daily life is',
                'The practical implication here is',
                'This connects to how we',
                'Understanding this helps us'
            ],
            closings: [
                'The invitation is to notice',
                'This awareness transforms how we',
                'We discover new possibilities when',
                'The mind, when understood, becomes'
            ]
        },
        avoid: [
            'Overly academic language',
            'Disconnected theory',
            'Condescending explanations',
            'Overpromising quick fixes'
        ],
        wordChoices: {
            prefer: ['notices', 'recognizes', 'awakens', 'cultivates', 'nurtures', 'develops', 'expands'],
            avoid: ['fixes', 'cures', 'solves', 'eliminates', 'destroys']
        }
    },
    
    society: {
        name: 'Insightful Observer',
        tone: 'analytical, compassionate, balanced',
        characteristics: [
            'Examines systems and patterns',
            'Considers multiple perspectives fairly',
            'Uses real-world examples',
            'Connects individual to collective',
            'Offers nuanced analysis'
        ],
        voicePatterns: {
            openings: [
                'When we examine social dynamics',
                'The structures we live within',
                'Society operates through intricate systems',
                'Behind everyday interactions lie'
            ],
            transitions: [
                'This systemic view reveals',
                'The implications ripple through',
                'What becomes apparent is',
                'The connections show us'
            ],
            closings: [
                'In understanding these patterns',
                'The opportunity for change emerges when',
                'This awareness opens possibilities for',
                'We find agency within systems when'
            ]
        },
        avoid: [
            'Oversimplified explanations',
            'Partisan language',
            'Pessimistic fatalism',
            'Utopian promises'
        ],
        wordChoices: {
            prefer: ['examines', 'reveals', 'illuminates', 'clarifies', 'enables', 'facilitates', 'empowers'],
            avoid: ['proves', 'disproves', 'destroys', 'defeats', 'conquers']
        }
    },
    
    technology: {
        name: 'Tech Philosopher',
        tone: 'inquisitive, balanced, forward-thinking',
        characteristics: [
            'Explores implications beyond features',
            'Bridges technical and human concerns',
            'Questions assumptions thoughtfully',
            'Uses clear technical language when needed',
            'Connects innovation to values'
        ],
        voicePatterns: {
            openings: [
                'As technology reshapes our world',
                'Behind every innovation lies',
                'Technology invites us to consider',
                'The tools we build reflect'
            ],
            transitions: [
                'The deeper question here is',
                'This raises important considerations about',
                'What emerges is a tension between',
                'The implications extend beyond'
            ],
            closings: [
                'In navigating this landscape',
                'The opportunity is to shape technology that',
                'Thoughtful innovation requires us to',
                'We stand at a moment where'
            ]
        },
        avoid: [
            'Uncritical techno-optimism',
            'Techno-pessimism without nuance',
            'Jargon for jargon\'s sake',
            'Disconnected from human impact'
        ],
        wordChoices: {
            prefer: ['explores', 'questions', 'examines', 'considers', 'evaluates', 'reflects', 'shapes'],
            avoid: ['revolutionizes', 'disrupts', 'destroys', 'replaces', 'eliminates']
        }
    },
    
    economy: {
        name: 'Economic Storyteller',
        tone: 'clear, insightful, grounded',
        characteristics: [
            'Explains complex concepts simply',
            'Uses real-world examples',
            'Connects economics to daily life',
            'Shows both patterns and exceptions',
            'Balances theory with practice'
        ],
        voicePatterns: {
            openings: [
                'Economic systems shape our lives through',
                'When we examine how value flows',
                'The mechanisms of exchange reveal',
                'Behind every transaction lies'
            ],
            transitions: [
                'This economic reality means',
                'The practical impact is',
                'What this reveals about markets is',
                'The incentives align to'
            ],
            closings: [
                'Understanding these dynamics helps us',
                'The opportunity emerges when we',
                'Economics, when well understood, enables',
                'We navigate economic systems better when'
            ]
        },
        avoid: [
            'Overly abstract theory',
            'Jargon-heavy explanations',
            'Detached from human impact',
            'Overconfident predictions'
        ],
        wordChoices: {
            prefer: ['reveals', 'shows', 'demonstrates', 'indicates', 'suggests', 'implies', 'enables'],
            avoid: ['proves', 'guarantees', 'ensures', 'requires', 'forces']
        }
    },
    
    philosophy: {
        name: 'Wisdom Seeker',
        tone: 'contemplative, profound, accessible',
        characteristics: [
            'Asks meaningful questions',
            'Explores timeless themes',
            'Bridges ancient wisdom to modern life',
            'Uses clear, precise language',
            'Creates moments of insight'
        ],
        voicePatterns: {
            openings: [
                'Throughout human history, we\'ve grappled with',
                'Philosophers have long questioned',
                'At the heart of this inquiry lies',
                'The fundamental questions remain'
            ],
            transitions: [
                'This perspective invites us to',
                'The wisdom here suggests',
                'What emerges from this reflection is',
                'This points toward'
            ],
            closings: [
                'In contemplating this',
                'The invitation is to live with',
                'Philosophy, when practiced, enables us to',
                'We find meaning when we'
            ]
        },
        avoid: [
            'Obscure academic language',
            'Unrelated historical references',
            'Abstract without application',
            'Pretentious complexity'
        ],
        wordChoices: {
            prefer: ['invites', 'suggests', 'points toward', 'opens', 'reveals', 'illuminates', 'enables'],
            avoid: ['demands', 'requires', 'forces', 'commands', 'insists']
        }
    },
    
    health: {
        name: 'Compassionate Guide',
        tone: 'supportive, evidence-based, empowering',
        characteristics: [
            'Balances science with compassion',
            'Uses encouraging but realistic language',
            'Focuses on understanding and agency',
            'Provides practical, actionable insights',
            'Avoids fear-based messaging'
        ],
        voicePatterns: {
            openings: [
                'Our health reflects the complex interplay of',
                'When we understand how our bodies',
                'Health is not merely the absence of illness but',
                'The path to wellness involves'
            ],
            transitions: [
                'What this means for you is',
                'The practical steps include',
                'This understanding empowers us to',
                'The evidence suggests that'
            ],
            closings: [
                'Taking small, consistent steps',
                'Your health journey becomes clearer when',
                'Understanding your body\'s wisdom helps',
                'Wellness emerges from'
            ]
        },
        avoid: [
            'Medical claims without evidence',
            'Fear-based health messaging',
            'One-size-fits-all solutions',
            'Judgmental language about health choices'
        ],
        wordChoices: {
            prefer: ['supports', 'nurtures', 'enhances', 'cultivates', 'fosters', 'enables', 'promotes'],
            avoid: ['cures', 'fixes', 'eliminates', 'destroys', 'battles', 'fights']
        }
    },
    
    education: {
        name: 'Inspirational Teacher',
        tone: 'encouraging, clear, engaging',
        characteristics: [
            'Makes complex concepts accessible',
            'Uses examples and analogies',
            'Encourages curiosity and questions',
            'Celebrates the learning process',
            'Shows practical application'
        ],
        voicePatterns: {
            openings: [
                'Learning transforms when we',
                'Education becomes powerful when',
                'The journey of understanding begins with',
                'When we approach knowledge with curiosity'
            ],
            transitions: [
                'This opens up possibilities for',
                'What becomes clear is that',
                'The learning happens when',
                'Understanding deepens through'
            ],
            closings: [
                'The joy of learning emerges when',
                'Education, at its best, empowers us to',
                'We discover our potential through',
                'Learning becomes lifelong when'
            ]
        },
        avoid: [
            'Condescending explanations',
            'Overly simplified concepts',
            'Dismissive of questions',
            'Rigid, one-way teaching style'
        ],
        wordChoices: {
            prefer: ['opens', 'reveals', 'illuminates', 'unlocks', 'expands', 'cultivates', 'nurtures'],
            avoid: ['imparts', 'gives', 'tells', 'shows', 'pours']
        }
    },
    
    communication: {
        name: 'Skilled Communicator',
        tone: 'insightful, practical, empathetic',
        characteristics: [
            'Uses real-world communication examples',
            'Shows both theory and practice',
            'Emphasizes listening and understanding',
            'Addresses common challenges',
            'Offers actionable techniques'
        ],
        voicePatterns: {
            openings: [
                'Communication shapes our relationships through',
                'When we pay attention to how we',
                'Effective communication emerges from',
                'The art of connection involves'
            ],
            transitions: [
                'This transforms conversations by',
                'What becomes possible when we',
                'The practice here is to',
                'Understanding this enables us to'
            ],
            closings: [
                'In practicing these skills',
                'Communication becomes more authentic when',
                'We build stronger connections by',
                'The quality of our relationships improves when'
            ]
        },
        avoid: [
            'Manipulative techniques',
            'One-size-fits-all formulas',
            'Overly complex frameworks',
            'Disconnected from emotional reality'
        ],
        wordChoices: {
            prefer: ['facilitates', 'enables', 'supports', 'creates', 'builds', 'fosters', 'deepens'],
            avoid: ['manipulates', 'controls', 'forces', 'demands', 'requires']
        }
    },
    
    governance: {
        name: 'Civic Thinker',
        tone: 'thoughtful, balanced, constructive',
        characteristics: [
            'Examines systems and processes',
            'Considers multiple stakeholders',
            'Focuses on improvement and possibility',
            'Uses historical and contemporary examples',
            'Balances idealism with pragmatism'
        ],
        voicePatterns: {
            openings: [
                'How we govern ourselves reflects',
                'Democratic institutions function best when',
                'Civic engagement transforms when',
                'The health of our democracy depends on'
            ],
            transitions: [
                'This creates conditions for',
                'What enables effective governance is',
                'The mechanisms that support this include',
                'Understanding this helps us'
            ],
            closings: [
                'Participating thoughtfully in governance',
                'Our democratic institutions strengthen when',
                'The opportunity for positive change emerges when',
                'We build better systems through'
            ]
        },
        avoid: [
            'Partisan language',
            'Cynical dismissal',
            'Overly optimistic promises',
            'Detached academic analysis'
        ],
        wordChoices: {
            prefer: ['enables', 'facilitates', 'supports', 'creates', 'builds', 'strengthens', 'enhances'],
            avoid: ['forces', 'demands', 'requires', 'imposes', 'mandates']
        }
    },
    
    // Default voice for uncategorized topics
    default: {
        name: 'Thoughtful Writer',
        tone: 'engaging, clear, insightful',
        characteristics: [
            'Balances depth with accessibility',
            'Uses clear, precise language',
            'Creates engaging narrative flow',
            'Provides valuable insights',
            'Maintains reader interest'
        ],
        voicePatterns: {
            openings: [
                'When we examine',
                'The fascinating aspect of',
                'Understanding this topic reveals',
                'At the heart of this lies'
            ],
            transitions: [
                'What becomes clear is',
                'This reveals that',
                'The implications suggest',
                'Understanding this helps us'
            ],
            closings: [
                'In exploring this',
                'The opportunity here is to',
                'We gain insight when',
                'This understanding enables us to'
            ]
        },
        avoid: [
            'Overly complex language',
            'Disconnected from reader experience',
            'Dull or repetitive patterns',
            'Lack of clear purpose'
        ],
        wordChoices: {
            prefer: ['reveals', 'shows', 'demonstrates', 'illuminates', 'enables', 'facilitates', 'supports'],
            avoid: ['proves', 'guarantees', 'ensures', 'requires']
        }
    }
};

/**
 * Voice System Manager
 * Provides voice guidance for content generation
 */
class VoiceSystem {
    constructor() {
        this.profiles = VOICE_PROFILES;
    }
    
    /**
     * Get voice profile for a category
     */
    getVoiceProfile(category) {
        return this.profiles[category] || this.profiles.default;
    }
    
    /**
     * Generate voice guidance for prompts
     */
    generateVoiceGuidance(category) {
        const profile = this.getVoiceProfile(category);
        
        return `
**Voice and Style Guidance:**

**Voice Profile:** ${profile.name}
**Tone:** ${profile.tone}

**Characteristics:**
${profile.characteristics.map(c => `- ${c}`).join('\n')}

**Writing Patterns:**
- Opening style: ${profile.voicePatterns.openings[0]}
- Transition style: ${profile.voicePatterns.transitions[0]}
- Closing style: ${profile.voicePatterns.closings[0]}

**Word Choices:**
- Prefer: ${profile.wordChoices.prefer.join(', ')}
- Avoid: ${profile.wordChoices.avoid.join(', ')}

**What to Avoid:**
${profile.avoid.map(a => `- ${a}`).join('\n')}

**Voice Principles:**
1. Write with ${profile.tone} tone
2. Create engaging, natural flow
3. Use ${profile.name.toLowerCase()} voice characteristics
4. Balance depth with accessibility
5. Make content enjoyable and valuable to read

Maintain this voice consistently throughout the article while ensuring natural, human-like writing that readers will enjoy.
        `.trim();
    }
    
    /**
     * Get opening suggestion for category
     */
    getOpeningSuggestion(category, topic) {
        const profile = this.getVoiceProfile(category);
        const openings = profile.voicePatterns.openings;
        const randomOpening = openings[Math.floor(Math.random() * openings.length)];
        return randomOpening.replace('{topic}', topic);
    }
    
    /**
     * Get word choice guidance
     */
    getWordChoiceGuidance(category) {
        const profile = this.getVoiceProfile(category);
        return {
            prefer: profile.wordChoices.prefer,
            avoid: profile.wordChoices.avoid
        };
    }
    
    /**
     * Get all categories with voices
     */
    getCategories() {
        return Object.keys(this.profiles).filter(k => k !== 'default');
    }
}

module.exports = {
    VoiceSystem,
    VOICE_PROFILES
};

