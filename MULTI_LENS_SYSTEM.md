# Multi-Lens/Perspective Content Generation System

## Overview

Inspired by Sovereign Mind's approach to exploring topics from multiple angles, this system generates articles from different lenses/perspectives, creating diverse content that covers topics comprehensively.

## Key Features

### 1. Multi-Lens System
Each topic can be explored from 12 different lenses:

- **Analytical**: Data-driven analysis with systematic examination
- **Reflective**: Thoughtful contemplation of deeper meaning
- **Practical**: Actionable guidance with step-by-step implementation
- **Narrative**: Storytelling approach focusing on human experiences
- **Philosophical**: Deep exploration of underlying principles
- **Journalistic**: Factual reporting with balanced perspectives
- **Scientific**: Methodical approach based on research methodology
- **Systems**: Systems thinking examining interconnections
- **Historical**: Historical context showing evolution over time
- **Comparative**: Comparative analysis examining alternatives
- **Critical**: Critical examination questioning assumptions
- **Future**: Forward-looking exploration of trends and possibilities

### 2. Multiple Perspectives Per Topic
Generate 3+ articles for the same topic, each from a different lens:
- Topic: "climate-feedbacks"
  - Perspective 1: Analytical lens (data & patterns)
  - Perspective 2: Practical lens (what can we do?)
  - Perspective 3: Reflective lens (deeper meaning)

### 3. Visual Layout Variations
Different article sizes create visual interest:
- **Short**: Compact cards (20% mix)
- **Medium**: Standard cards (50% mix)
- **Long**: Larger cards, span 2 rows (25% mix)
- **Feature**: Hero-style, spans multiple columns (5% mix)

### 4. Site Replication System
Easily create new sites for different topics/niches:
- Each site can have its own configuration
- Same codebase, different content focus
- Customizable branding, topics, and styles

## Usage

### Generate Articles with Multiple Perspectives

```bash
# Enable multiple perspectives (default: true)
USE_MULTIPLE_PERSPECTIVES=true npm run bulk

# Set number of perspectives per topic
PERSPECTIVES_PER_TOPIC=3 npm run bulk

# Vary article styles
VARY_STYLES=true npm run bulk
```

### Create a New Site Configuration

```javascript
const { SiteConfigManager } = require('./generator/site-config');
const manager = new SiteConfigManager();

// Generate config for a new topic
manager.generateConfigFromTopic('Climate Science', {
    categories: ['nature', 'science'],
    maxArticles: 50,
    perspectivesPerTopic: 3
});
```

### Use Lens System in Code

```javascript
const { LensSystem } = require('./generator/lens-system');
const lensSystem = new LensSystem();

// Get multiple perspectives for a topic
const perspectives = lensSystem.getMultiplePerspectives(topic, 3, {
    varyStyles: true
});

// Get recommended lenses for a category
const lenses = lensSystem.getRecommendedLenses('nature', 3);

// Get lens definition
const lens = lensSystem.getLens('analytical');
```

## Configuration

### Environment Variables

```bash
# Content Generation
USE_MULTIPLE_PERSPECTIVES=true    # Generate multiple perspectives per topic
PERSPECTIVES_PER_TOPIC=3          # Number of perspectives per topic
VARY_STYLES=true                  # Vary article styles (short/medium/long/feature)
USE_SOVEREIGN_MIND_TOPICS=true    # Use Sovereign Mind topic system
MAX_ARTICLES=50                   # Maximum articles to generate

# Site Configuration
SITE_CONFIG=climate-science       # Use specific site configuration
```

### Site Configuration File

Create `configs/your-site.json`:

```json
{
  "identity": {
    "name": "Climate Science News",
    "domain": "climatescience.news",
    "description": "Your premier source for climate science insights"
  },
  "content": {
    "primaryTopic": "Climate Science",
    "topicCategories": ["nature", "science"],
    "perspectivesPerTopic": 3,
    "articleMix": {
      "short": 0.2,
      "medium": 0.5,
      "long": 0.25,
      "feature": 0.05
    }
  },
  "generation": {
    "useMultiplePerspectives": true,
    "varyStyles": true,
    "varyAngles": true
  }
}
```

## Article Generation Flow

1. **Topic Selection**: Choose topics from Sovereign Mind system
2. **Lens Selection**: For each topic, select 3 different lenses
3. **Style Variation**: Assign different article styles (short/medium/long/feature)
4. **Generation**: Generate articles using lens-specific prompts
5. **Layout**: Articles automatically sized for visual grid layout

## Visual Layout System

The grid layout automatically adjusts for different article sizes:

```css
.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}

.article-card.size-short { grid-row: span 1; }
.article-card.size-medium { grid-row: span 1; }
.article-card.size-long { grid-row: span 2; }
.article-card.size-feature { 
  grid-column: span 2;
  grid-row: span 2;
}
```

## Benefits

1. **Comprehensive Coverage**: Each topic explored from multiple angles
2. **Visual Interest**: Varied article sizes create engaging layouts
3. **Scalability**: Easy to replicate for new topics/niches
4. **Quality**: Lens-specific prompts ensure appropriate depth
5. **SEO**: Multiple perspectives increase keyword coverage

## Example Output

For topic "coastal-erosion":

1. **Analytical Lens** (Medium, 1000 words)
   - Title: "Coastal Erosion Patterns: A Data-Driven Analysis"
   - Focus: Statistics, trends, geographic patterns

2. **Practical Lens** (Short, 600 words)
   - Title: "How to Protect Your Coastal Property: A Practical Guide"
   - Focus: Actionable steps, solutions, implementation

3. **Reflective Lens** (Long, 2000 words)
   - Title: "The Deeper Meaning of Coastal Erosion: Reflecting on Change"
   - Focus: Personal meaning, values, wisdom

## Next Steps

- [ ] Add lens badges to article cards
- [ ] Create lens filtering on homepage
- [ ] Add "Related Perspectives" section to article pages
- [ ] Implement lens-based navigation
- [ ] Add lens analytics tracking

