# Topic Management System - Sovereign Mind Integration

## Overview

The generator now supports **100+ topics from Sovereign Mind** with **varying styles and lengths**, allowing you to populate sites with diverse, engaging content.

## Features

✅ **100+ Sovereign Mind Topics**: All topics organized by category
✅ **Varying Styles**: Short, Medium, Long, Feature articles
✅ **Multiple Angles**: Analytical, Reflective, Practical, Narrative, Philosophical, Journalistic
✅ **Category Organization**: Nature, Mind, Society, Technology, Economy, Philosophy, Health, Education, Communication, Governance
✅ **Automatic Cycling**: Cycles through all topics automatically
✅ **Style Distribution**: Mix of article lengths for diverse content

## Topic Categories

### Nature (10 topics)
- coastal-erosion, climate-feedbacks, ocean-acidification, biodiversity-loss, resource-depletion, etc.

### Mind (10 topics)
- attention-economy, sleep-architecture, memory-consolidation, cognitive-load, decision-fatigue, etc.

### Society (10 topics)
- polarization, urban-design, social-cohesion, information-cascades, collective-intelligence, etc.

### Technology (10 topics)
- ai-alignment, algorithmic-bias, network-effects, platform-governance, privacy-tradeoffs, etc.

### Economy (10 topics)
- incentive-design, market-failures, behavioral-economics, value-creation, systemic-risk, etc.

### Plus: Philosophy, Health, Education, Communication, Governance

**Total: 100+ topics across 10 categories**

## Article Styles

### Short (400-700 words, 2-4 min read)
- Brief overview
- Quick insights
- Actionable takeaways
- Concise format

### Medium (800-1200 words, 5-7 min read)
- Balanced depth
- Informative content
- Engaging style
- Default style

### Long (1500-2500 words, 8-12 min read)
- Comprehensive exploration
- Multiple perspectives
- Detailed analysis
- Extensive examples

### Feature (2500-4000 words, 13-18 min read)
- Narrative-driven
- Immersive storytelling
- Deep exploration
- Rich detail

## Article Angles

### Analytical
- Objective, data-driven
- Systematic analysis
- Expert analyst voice

### Reflective
- Thoughtful, contemplative
- Personal reflection
- Wise observer voice

### Practical
- Actionable, direct
- Solution-oriented
- Practical guide voice

### Narrative
- Storytelling, engaging
- Human-centered
- Storyteller voice

### Philosophical
- Deep, questioning
- Deeper meaning
- Philosopher voice

### Journalistic
- Factual, balanced
- Multiple perspectives
- Journalist voice

## Usage

### Generate Articles with All Topics

```bash
# Generate articles from Sovereign Mind topics (default)
npm run bulk

# Customize number of articles
MAX_ARTICLES=50 npm run bulk

# Disable style variation (all medium)
VARY_STYLES=false npm run bulk

# Use old topic expansion method
USE_SOVEREIGN_MIND_TOPICS=false npm run bulk
```

### Programmatic Usage

```javascript
const { TopicManager } = require('./generator/topics');
const { generateArticle } = require('./generator/content');

const topicManager = new TopicManager();

// Get all topics
const allTopics = topicManager.getAllTopics();
console.log(`Total topics: ${topicManager.getTotalCount()}`);

// Generate article config with random style/angle
const topic = topicManager.getRandomTopic();
const config = topicManager.generateArticleConfig(topic);

// Generate article
const article = await generateArticle(config);
```

## Configuration

### Environment Variables

```bash
# Number of articles to generate
MAX_ARTICLES=50

# Use Sovereign Mind topics (default: true)
USE_SOVEREIGN_MIND_TOPICS=true

# Vary article styles (default: true)
VARY_STYLES=true

# Use multi-stage pipeline
USE_PIPELINE=false
```

### Topic Distribution

By default, articles are distributed across all categories:
- Equal representation from each category
- Mix of styles and angles
- Diverse content types

## Topic List

All topics from Sovereign Mind are available in `generator/topics.js`:

```javascript
const SOVEREIGN_MIND_TOPICS = {
    nature: [...],
    mind: [...],
    society: [...],
    technology: [...],
    economy: [...],
    philosophy: [...],
    health: [...],
    education: [...],
    communication: [...],
    governance: [...]
};
```

## Article Generation Flow

```
Topic Selection
    ↓
Generate Article Config (style + angle)
    ↓
Create Enhanced Prompt
    ↓
Generate Article (LLM)
    ↓
Generate Image (1200x800)
    ↓
Save to articles.js
```

## Output

Articles include:
- **Topic slug**: e.g., "attention-economy"
- **Category**: e.g., "mind"
- **Style**: short/medium/long/feature
- **Angle**: analytical/reflective/practical/narrative/philosophical/journalistic
- **Word count**: Varies by style
- **Read time**: Calculated based on length

## Example Output

```javascript
{
    id: 1,
    title: "Attention Economy: Understanding Modern Cognitive Load",
    excerpt: "An analytical exploration of how attention functions as currency in digital age...",
    category: "Mind",
    style: "medium",
    angle: "analytical",
    wordCount: 950,
    readTime: "6 min read",
    // ...
}
```

## Customization

### Add New Topics

Edit `generator/topics.js`:

```javascript
const SOVEREIGN_MIND_TOPICS = {
    yourCategory: [
        'topic-slug-1',
        'topic-slug-2',
        // ...
    ]
};
```

### Customize Styles

Edit `ARTICLE_STYLES` in `generator/topics.js`:

```javascript
const ARTICLE_STYLES = {
    yourStyle: {
        wordCount: { min: 600, max: 900 },
        sections: 3,
        // ...
    }
};
```

### Customize Angles

Edit `ARTICLE_ANGLES` in `generator/topics.js`:

```javascript
const ARTICLE_ANGLES = {
    yourAngle: {
        tone: 'your tone',
        focus: 'your focus',
        voice: 'your voice'
    }
};
```

## Benefits

1. **Diverse Content**: 100+ topics across 10 categories
2. **Style Variety**: Mix of short, medium, long, feature articles
3. **Angle Diversity**: Multiple perspectives on each topic
4. **Category Organization**: Easy filtering by category
5. **Automatic Distribution**: Even representation across categories
6. **Scalable**: Easy to add more topics

## Next Steps

1. Generate articles: `npm run bulk`
2. Review generated articles in `templates/articles.js`
3. Build site: `npm run build`
4. Customize topics/styles/angles as needed

## Mobile Responsiveness

The site is now fully mobile responsive:
- ✅ Breakpoints at 1024px, 768px, 480px
- ✅ Mobile menu toggle
- ✅ Responsive grid layouts
- ✅ Touch-friendly interface
- ✅ Optimized typography for mobile

See updated CSS in `templates/styles.css` for all mobile improvements.

