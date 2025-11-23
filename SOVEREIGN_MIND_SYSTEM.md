# Sovereign Mind Multi-Perspective Content Generation System

## Overview

This system implements a comprehensive multi-lens/perspective content generation approach inspired by Sovereign Mind, allowing topics to be explored from different angles with varying styles and lengths, creating visually diverse and comprehensive content.

## Key Components

### 1. Multi-Lens System (`generator/lens-system.js`)
12 different lenses for exploring topics:
- Analytical, Reflective, Practical, Narrative, Philosophical
- Journalistic, Scientific, Systems, Historical, Comparative
- Critical, Future

Each lens has:
- Description and tone
- Focus areas and key questions
- Voice and structure guidelines

### 2. Topic Management (`generator/topics.js`)
Sovereign Mind style topics organized by category:
- Nature, Mind, Society, Technology, Economy
- Philosophy, Health, Education, Communication, Governance

100+ topics ready to use.

### 3. Site Configuration System (`generator/site-config.js`)
Easy replication for different topics/niches:
- Site identity and branding
- Content focus and topic selection
- Generation settings
- Layout preferences

### 4. Visual Layout System
Automatic sizing based on article style:
- Short: Compact cards (20% mix)
- Medium: Standard cards (50% mix)  
- Long: Larger cards, span 2 rows (25% mix)
- Feature: Hero-style, spans columns (5% mix)

## Usage

### Generate Articles with Multiple Perspectives

```bash
# Enable multiple perspectives (default: true)
USE_MULTIPLE_PERSPECTIVES=true npm run bulk

# Set number of perspectives per topic
PERSPECTIVES_PER_TOPIC=3 npm run bulk

# Vary article styles and lengths
VARY_STYLES=true npm run bulk

# Max articles to generate
MAX_ARTICLES=50 npm run bulk
```

### Example Output

For topic "coastal-erosion":

1. **Analytical Lens** (Medium, 1000 words)
   - "Coastal Erosion Patterns: A Data-Driven Analysis"
   - Focus: Statistics, trends, geographic patterns

2. **Practical Lens** (Short, 600 words)
   - "How to Protect Your Coastal Property: A Practical Guide"
   - Focus: Actionable steps, solutions

3. **Reflective Lens** (Long, 2000 words)
   - "The Deeper Meaning of Coastal Erosion: Reflecting on Change"
   - Focus: Personal meaning, values, wisdom

## Benefits

1. **Comprehensive Coverage**: Each topic explored from multiple angles
2. **Visual Interest**: Varied article sizes create engaging layouts
3. **SEO Benefits**: Multiple perspectives increase keyword coverage
4. **Scalability**: Easy to replicate for new topics/niches
5. **Quality**: Lens-specific prompts ensure appropriate depth

## Replicating for New Topics

### Quick Setup

```javascript
const { SiteConfigManager } = require('./generator/site-config');
const manager = new SiteConfigManager();

// Generate config for new topic
manager.generateConfigFromTopic('Climate Science', {
    categories: ['nature', 'science'],
    maxArticles: 50,
    perspectivesPerTopic: 3
});
```

### Full Site Configuration

Create `configs/your-site.json`:

```json
{
  "identity": {
    "name": "Your Site Name",
    "domain": "yoursite.com",
    "description": "Site description"
  },
  "content": {
    "primaryTopic": "Your Topic",
    "topicCategories": ["category1", "category2"],
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
    "varyStyles": true
  }
}
```

## Visual Layout

Articles automatically sized in grid:
- Short/Medium: 1 row height
- Long: 2 row height
- Feature: Spans 2 columns, 2 rows

Grid automatically adjusts for optimal visual spacing.

## Next Steps

1. ✅ Multi-lens system created
2. ✅ Topic management integrated
3. ✅ Site configuration system
4. ✅ Visual layout enhancements
5. ⏳ Add lens badges to article cards
6. ⏳ Create lens filtering on homepage
7. ⏳ Add "Related Perspectives" to article pages

## Files Created

- `generator/lens-system.js` - Multi-lens/perspective system
- `generator/site-config.js` - Site replication system
- `MULTI_LENS_SYSTEM.md` - Detailed documentation
- `SOVEREIGN_MIND_SYSTEM.md` - This overview

## Files Modified

- `generator/bulk.js` - Integrated lens system
- `generator/content.js` - Added lens support to generation
- `templates/styles.css` - Visual layout variations
- `package.json` - Ready for new commands

The system is now ready to generate comprehensive, multi-perspective content for any topic!

