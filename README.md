# EveryTopic Site Factory

A powerful static site generator for niche news sites with AI-powered article generation, comprehensive SEO optimization, quality scoring, and analytics integration.

## Features

✅ **AI-Powered Content Generation**
- Real LLM integration with OpenAI
- Multi-stage content refinement pipeline
- 100+ topics from Sovereign Mind
- Varying article styles and lengths

✅ **Quality & SEO**
- Automatic article quality scoring (A+ to F)
- Comprehensive SEO analysis
- Structured data (JSON-LD) generation
- Open Graph and Twitter Card meta tags

✅ **Image Generation**
- Gemini image generation (Nano Banana)
- Exact sizing (1200x800 for articles)
- Smart caching system
- Local image storage

✅ **Analytics**
- Google Analytics 4 integration
- Article view tracking
- Scroll depth tracking
- Reading time analytics

✅ **Mobile Responsive**
- Fully responsive design
- Mobile-optimized navigation
- Touch-friendly interface
- Breakpoints at 1024px, 768px, 480px

✅ **Article Templates**
- 10 article templates (News, Tutorial, Listicle, Opinion, etc.)
- Template-specific prompts
- Automatic template suggestion

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment

Create a `.env` file:

```bash
# OpenAI API Key (required for article generation)
OPENAI_API_KEY=your-openai-api-key-here

# Google Gemini API Key (for image generation)
GEMINI_API_KEY=your-gemini-api-key-here

# Google Analytics ID (optional)
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX

# Optional Configuration
LLM_MODEL=gpt-4o-mini
DRY_RUN=false
MAX_ARTICLES=50
USE_SOVEREIGN_MIND_TOPICS=true
VARY_STYLES=true
USE_PIPELINE=false
```

### 3. Generate Articles

```bash
# Generate articles from Sovereign Mind topics
npm run bulk

# Build static site
npm run build
```

## Documentation

- **`VISION.md`** - Project vision, direction, and strategic roadmap (living document)
- **`QUICK_START.md`** - Quick start guide
- **`GENERATOR_README.md`** - Complete generator documentation
- **`TOPIC_SYSTEM_README.md`** - Topic management system
- **`IMAGE_GENERATION_SETUP.md`** - Image generation guide
- **`PHASE_1_SUMMARY.md`** - Phase 1 implementation summary
- **`MASTER_TASK_LIST.md`** - Complete task roadmap

## Project Structure

```
generator/
├── quality.js          # Article quality scoring
├── templates.js        # Article templates library
├── seo-optimizer.js    # SEO analysis and optimization
├── analytics.js        # Analytics integration
├── llm.js              # LLM client wrapper
├── cache.js            # Caching system
├── image-gen.js        # Image generation (Gemini)
├── topics.js           # Topic management (Sovereign Mind)
├── content.js          # Article generation
├── bulk.js             # Bulk generation
├── build.js            # Site builder
└── prompts/            # Prompt templates

tests/
├── quality.test.js     # Quality scoring tests
└── seo.test.js         # SEO optimizer tests

templates/
├── index.html          # Home page template
├── article.html        # Article page template
├── styles.css          # Styles (mobile responsive)
└── main.js             # Interactive features
```

## Usage Examples

### Generate Articles

```bash
# Generate from all Sovereign Mind topics
npm run bulk

# Generate with custom settings
MAX_ARTICLES=100 USE_PIPELINE=true npm run bulk
```

### Test Quality Scoring

```bash
npm run test:quality
```

### Test SEO Optimizer

```bash
npm run test:seo
```

### Run All Tests

```bash
npm test
```

## Features Overview

### Article Generation
- Real LLM integration (OpenAI)
- Multi-stage pipeline (optional)
- 100+ topics from Sovereign Mind
- Varying styles (short, medium, long, feature)
- Multiple angles (analytical, reflective, practical, etc.)

### Quality & SEO
- Automatic quality scoring
- SEO analysis and optimization
- Structured data generation
- Social media optimization

### Image Generation
- Gemini image generation
- Exact sizing (1200x800)
- Smart caching
- Local storage

### Analytics
- Google Analytics 4
- Article tracking
- Scroll depth
- Reading time

## Configuration

Edit `generator/config.js` or use environment variables:

```javascript
// Site identity
site: { name, domain, description, ... }

// Content settings
content: { topic, subtopics, ... }

// LLM settings
llm: { model, temperature, maxTokens, ... }

// Image settings
image: { defaultSize, sizes, ... }

// Analytics settings
analytics: { enabled, googleAnalyticsId, ... }
```

## Testing

```bash
# Run all tests
npm test

# Run specific tests
npm run test:quality
npm run test:seo
```

## Build Output

Generated files in `dist/`:
- `index.html` - Home page
- `articles/*.html` - Article pages
- `articles.js` - Article data
- `sitemap.xml` - SEO sitemap
- `robots.txt` - SEO robots file
- `images/` - Generated images

## Next Steps

See `MASTER_TASK_LIST.md` for complete development roadmap.

**Phase 1 Complete! ✅**
- Quality scoring ✅
- SEO optimization ✅
- Analytics integration ✅
- Article templates ✅
- Testing infrastructure ✅

Ready for Phase 2: Enhancement! 🚀

## License

ISC

