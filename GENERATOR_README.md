# Article Generator - Usage Guide

## Overview

The generator now includes real LLM integration with multi-stage pipelines, caching, and error handling based on best practices from Atlas Maker and Marketing System projects.

## Quick Start

1. **Install dependencies:**
```bash
npm install
```

2. **Set up environment:**
```bash
# Create .env file
echo "OPENAI_API_KEY=your-key-here" > .env
```

3. **Generate articles:**
```bash
npm run bulk
```

## Features Implemented

### ✅ Priority 1: Real LLM Integration
- OpenAI API client wrapper
- Automatic API key management
- Error handling with retry logic
- Rate limit handling

### ✅ Priority 2: Multi-Stage Pipeline
- Blueprint → Draft → Enhance → Humanize stages
- Progressive refinement of content
- Optional: Enable with `USE_PIPELINE=true`

### ✅ Priority 3: Caching System
- Disk-based cache (saves API costs)
- Automatic cache reuse for same topics
- Cache location: `data/cache/`

### ✅ Priority 4: Prompt Management
- Prompt templates in `generator/prompts/`
- Markdown files for easy editing
- Variable substitution: `{topic}`, `{previousContent}`

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```bash
# Required
OPENAI_API_KEY=sk-...

# Optional
LLM_MODEL=gpt-4o-mini          # Model to use
DRY_RUN=false                   # Enable dry-run (no API calls)
USE_PIPELINE=false              # Enable multi-stage pipeline
USE_LLM_EXPANSION=false         # Use LLM for topic expansion
MAX_ARTICLES=20                 # Limit article count
```

### Config File (`generator/config.js`)

```javascript
llm: {
    model: "gpt-4o-mini",
    temperature: 0.7,
    maxTokens: 2000,
    cacheDir: "data/cache",
    useCache: true,
    dryRun: false
}
```

## Usage Examples

### Single-Stage Generation (Fast, Cost-Effective)

```bash
# Default: Single-stage generation
npm run bulk

# Or explicitly:
USE_PIPELINE=false npm run bulk
```

Generates articles in one pass. Good for bulk generation when quality vs speed tradeoff is acceptable.

### Multi-Stage Pipeline (Higher Quality)

```bash
# Enable multi-stage pipeline
USE_PIPELINE=true npm run bulk
```

Generates articles through 4 stages:
1. **Blueprint** - Structure and thesis
2. **Draft** - Initial content
3. **Enhance** - Add depth and examples
4. **Humanize** - Natural voice and flow

Slower and more expensive, but produces higher-quality content.

### Dry-Run Mode (Testing Without API Costs)

```bash
# Test without API calls
DRY_RUN=true npm run bulk
```

Uses mock data to test the pipeline without spending API credits.

### Custom Article Count

```bash
# Generate only 10 articles
MAX_ARTICLES=10 npm run bulk
```

## Prompt Templates

Edit prompts in `generator/prompts/`:

- `default.md` - Single-stage generation
- `blueprint.md` - Stage 1: Article structure
- `draft.md` - Stage 2: Initial draft
- `enhance.md` - Stage 3: Add depth
- `humanize.md` - Stage 4: Natural voice

### Customizing Prompts

1. Edit the `.md` file in `generator/prompts/`
2. Use variables: `{topic}`, `{previousContent}`
3. Regenerate articles to see changes

## Caching

### How It Works

- Articles are cached by topic + prompt version
- Cache files stored in `data/cache/*.json`
- Same topic = instant return (no API call)

### Cache Management

```javascript
const ArticleCache = require('./generator/cache');
const cache = new ArticleCache();

// Get cache stats
const stats = cache.stats();
console.log(`Cached: ${stats.count} articles, ${stats.sizeMB} MB`);

// Clear cache
cache.clear();
```

### Cache Keys

Cache keys are MD5 hashes of: `topic + promptVersion`

To force regeneration, change prompt version or clear cache.

## Error Handling

The system includes automatic retry logic:

- **Rate Limits**: Exponential backoff (1s, 2s, 4s...)
- **API Errors**: Retry up to 3 times
- **JSON Parsing**: Fallback to plain text
- **Validation**: Ensures required fields present

If generation fails, article falls back to basic structure with error message.

## Cost Management

### Default Settings (Cost-Effective)

- Model: `gpt-4o-mini` (~$0.15 per 1M input tokens)
- Caching: Enabled (reuses articles)
- Single-stage: Fast, lower cost

### Cost Estimates

**Single-Stage:**
- ~1000 tokens per article
- 20 articles = ~$0.003

**Multi-Stage:**
- ~4000 tokens per article (4 stages)
- 20 articles = ~$0.012

**With Caching:**
- First run: Full cost
- Subsequent runs: $0 (uses cache)

### Tips to Reduce Costs

1. Enable caching (default: on)
2. Use single-stage for bulk generation
3. Use dry-run for testing
4. Limit article count with `MAX_ARTICLES`
5. Reuse generated articles from cache

## Troubleshooting

### "OpenAI API key not set"
- Create `.env` file with `OPENAI_API_KEY=...`
- Or set `DRY_RUN=true` for testing

### "Rate limit exceeded"
- System automatically retries with backoff
- Reduce `MAX_ARTICLES` if hitting limits
- Add delay between requests in `bulk.js`

### "Invalid JSON response"
- System falls back to plain text parsing
- Check prompt templates for JSON format issues
- Enable retry logic (default: 3 retries)

### Articles not generating
- Check API key is valid
- Check `DRY_RUN` is not enabled
- Check network connectivity
- Review error messages in console

## File Structure

```
generator/
├── llm.js           # LLM client wrapper
├── cache.js         # Caching system
├── content.js       # Article generation
├── bulk.js          # Bulk generation script
├── config.js        # Configuration
├── prompts/         # Prompt templates
│   ├── default.md
│   ├── blueprint.md
│   ├── draft.md
│   ├── enhance.md
│   └── humanize.md
└── ...
```

## Next Steps

1. **Install dependencies**: `npm install`
2. **Set API key**: Add to `.env` file
3. **Test generation**: `DRY_RUN=true npm run bulk`
4. **Generate articles**: `npm run bulk`
5. **Build site**: `npm run build`

## Advanced Usage

### Custom Pipeline Stages

Edit `generator/content.js` to add custom stages:

```javascript
article = await llmClient.generateArticlePipeline(topic, {
    stages: ['custom-stage-1', 'custom-stage-2'],
    // ...
});
```

### Programmatic Usage

```javascript
const { generateArticle } = require('./generator/content');

// Single article
const article = await generateArticle('Power BI Tutorial', {
    usePipeline: true,
    category: 'Tutorials'
});

// With custom options
const article = await generateArticle('Advanced DAX', {
    stage: 'blueprint',
    category: 'Advanced',
    useCache: false
});
```

## Performance Tips

1. **Use caching** for repeated topics
2. **Single-stage** for bulk generation
3. **Batch processing** with rate limiting
4. **Monitor costs** via OpenAI dashboard
5. **Cache invalidation** when prompts change

