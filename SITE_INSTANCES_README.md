# Site Instances System

This system allows you to generate multiple different article sites, each with its own configuration, topics, and branding. Each site instance is completely independent and can be built separately.

## Overview

- **Site Instances**: Each site is stored in `sites/<site-name>/` directory
- **Topics File**: All topics are defined in `data/topics.json`
- **Site Configs**: Site-specific configurations are stored in `configs/<site-name>.json`
- **Dynamic Content**: All site titles, descriptions, and copy are replaced during build based on site configuration

## Quick Start

### 1. Create a New Site

```bash
# Create a basic site
npm run create-site my-tech-news --topic "Technology"

# Create a site with Sovereign Mind topics
npm run create-site philosophy-insights --use-sovereign-mind

# Create and immediately generate articles
npm run create-site data-analytics --topic "Data Analytics" --generate

# Create, generate articles, and build
npm run create-site ai-news --topic "Artificial Intelligence" --generate --build
```

### 2. Generate Articles for a Site

```bash
# Set the site instance and generate articles
SITE_INSTANCE=my-tech-news npm run bulk
```

### 3. Build a Site

```bash
# Build a specific site instance
SITE_INSTANCE=my-tech-news npm run build
```

## Topics File

The topics file (`data/topics.json`) contains all topics organized by category:

- **default**: Default topics for general sites
- **sovereignMind**: Sovereign Mind topics organized by category (Nature, Mind, Society, Technology, etc.)

You can edit this file to add your own topics or categories.

## Site Configuration

Each site has its own configuration file in `configs/<site-name>.json` that includes:

- **Identity**: Site name, domain, description, logo, branding
- **Content**: Primary topic, categories, article mix
- **Layout**: Visual settings
- **Monetization**: Ad settings
- **Social**: Social media links
- **Analytics**: Analytics configuration

## Site Instance Structure

```
sites/
  └── <site-name>/
      ├── .site-instance.json    # Instance metadata
      ├── index.html              # Generated homepage
      ├── articles/               # Generated article pages
      ├── images/                 # Site images
      ├── styles.css              # Site styles
      ├── main.js                 # Site JavaScript
      └── articles.js             # Articles data
```

## Examples

### Example 1: Create a Power BI Site

```bash
npm run create-site power-bi-news \
  --topic "Power BI" \
  --max-articles 30 \
  --generate \
  --build
```

### Example 2: Create a Philosophy Site with Sovereign Mind Topics

```bash
npm run create-site philosophy-insights \
  --use-sovereign-mind \
  --max-articles 50 \
  --generate \
  --build
```

### Example 3: Create a Custom Tech Site

```bash
npm run create-site tech-trends \
  --topic "Emerging Technologies" \
  --max-articles 25
```

Then edit `configs/tech-trends.json` to customize, and:

```bash
SITE_INSTANCE=tech-trends npm run bulk
SITE_INSTANCE=tech-trends npm run build
```

## Managing Site Instances

### List All Sites

```bash
node -e "const m = require('./generator/site-instance-manager'); const sim = new m(); console.log(JSON.stringify(sim.listInstances(), null, 2));"
```

### Delete a Site

```bash
node -e "const m = require('./generator/site-instance-manager'); const sim = new m(); sim.deleteInstance('site-name');"
```

## Customization

### Custom Topics

Edit `data/topics.json` to add your own topics:

```json
{
  "default": {
    "primaryTopic": "Your Topic",
    "categories": [
      {
        "name": "Category Name",
        "topics": ["Topic 1", "Topic 2", "Topic 3"]
      }
    ]
  }
}
```

### Custom Site Configuration

After creating a site, edit `configs/<site-name>.json` to customize:

- Site name and branding
- Description and keywords
- Newsletter copy
- Footer content
- Social media links
- And more...

## Environment Variables

- `SITE_INSTANCE`: Set the active site instance for build/generate operations
- `MAX_ARTICLES`: Maximum articles to generate
- `USE_SOVEREIGN_MIND_TOPICS`: Use Sovereign Mind topics (true/false)

## Workflow

1. **Create Site**: `npm run create-site <name> --topic "Topic"`
2. **Customize Config**: Edit `configs/<name>.json`
3. **Generate Articles**: `SITE_INSTANCE=<name> npm run bulk`
4. **Build Site**: `SITE_INSTANCE=<name> npm run build`
5. **View Site**: Open `sites/<name>/index.html` in browser

## Notes

- Each site instance is completely independent
- Site configurations can be shared or customized per site
- Topics are loaded from `data/topics.json`
- All site-specific copy is replaced during build
- Site instances are stored in `sites/` directory (not `dist/`)

