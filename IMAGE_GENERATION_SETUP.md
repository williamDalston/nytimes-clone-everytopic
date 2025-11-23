# Image Generation Setup - Gemini Imagen (Nano Banana)

## Overview

The image generator uses Google's Gemini Imagen API (Nano Banana) to create images with **exact dimensions** for articles (1200x800 pixels by default).

## Features

✅ **Exact Size Control**: Generates images at exactly 1200x800 for article headers
✅ **Smart Caching**: Caches generated images to avoid regeneration
✅ **Local Storage**: Saves images locally in `dist/images/`
✅ **Fallback System**: Uses high-quality placeholders if API unavailable
✅ **Deterministic**: Same topic = same image (with proper sizing)

## Setup

### 1. Get Google Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key

### 2. Configure Environment

Add to your `.env` file:

```bash
# Google Gemini API Key for image generation
GEMINI_API_KEY=your-gemini-api-key-here

# Or use this alternative:
IMAGE_GEN_API_KEY=your-gemini-api-key-here
```

### 3. Install Dependencies

```bash
npm install
```

This installs `@google/generative-ai` for Gemini integration.

## Usage

### Automatic Image Generation

Images are automatically generated when running bulk generation:

```bash
npm run bulk
```

The generator will:
1. Generate article content
2. Create appropriate image prompt from article topic
3. Generate image at exact size (1200x800)
4. Save image locally in `dist/images/`
5. Cache the result for future use

### Manual Image Generation

```javascript
const ImageGenerator = require('./generator/image-gen');
const imageGen = new ImageGenerator({
    apiKey: process.env.GEMINI_API_KEY,
    size: { width: 1200, height: 800 }
});

const imageUrl = await imageGen.generateImage(
    'Professional image related to Power BI analytics',
    { width: 1200, height: 800 }
);
```

## Image Sizes

### Default Sizes

The generator supports multiple size presets:

```javascript
articleHeader: { width: 1200, height: 800 }  // Default for articles
articleCard:   { width: 600,  height: 400 }  // For cards
thumbnail:     { width: 300,  height: 200 }  // For thumbnails
hero:          { width: 1920, height: 1080 } // For hero sections
```

### Custom Sizes

Generate images with custom dimensions:

```javascript
await generateImage(prompt, {
    width: 1920,
    height: 1080,
    saveLocal: true
});
```

## Configuration

### Image Settings in `config.js`

```javascript
image: {
    defaultSize: {
        width: 1200,
        height: 800
    },
    sizes: {
        articleHeader: { width: 1200, height: 800 },
        articleCard: { width: 600, height: 400 },
        thumbnail: { width: 300, height: 200 },
        hero: { width: 1920, height: 1080 }
    },
    saveLocal: true,
    cacheDir: "data/cache/images",
    imageDir: "dist/images"
}
```

## How It Works

### 1. Image Prompt Generation

The generator creates smart prompts from article topics:

```javascript
// Article topic: "Power BI Advanced Analytics"
// Generated prompt: "Professional editorial photography image related to 'Power BI Advanced Analytics'. 
//                   professional mood, high-quality, suitable for article header. 
//                   Clean composition, good lighting."
```

### 2. Image Generation

1. **Check Cache**: Looks for existing image with same prompt + size
2. **Generate**: Calls Gemini Imagen API with exact dimensions
3. **Download**: Saves image locally if `saveLocal: true`
4. **Cache**: Stores result for future use

### 3. Exact Sizing

Images are generated with **exact dimensions**:
- Article headers: **1200x800** pixels
- Perfect aspect ratio: **3:2**
- High quality (85%+)
- Optimized format (JPG)

## Caching

### Cache System

Images are cached by:
- Prompt hash
- Dimensions (width x height)
- Cache file: `data/cache/images/{hash}.json`

### Cache Benefits

- **No Regeneration**: Same topic = instant return
- **Cost Savings**: Avoid redundant API calls
- **Faster Builds**: Reuse existing images

### Clear Cache

```javascript
const ImageGenerator = require('./generator/image-gen');
const imageGen = new ImageGenerator();
// Cache is automatically managed
```

## Fallback System

If Gemini API is unavailable or not configured:

1. **Dry-Run Mode**: Returns placeholder URL
2. **High-Quality Placeholder**: Uses Unsplash with exact dimensions
3. **Deterministic Selection**: Same topic = same placeholder image
4. **Proper Sizing**: Always returns exact size needed

## Imagen API Integration

### Current Status

The generator is structured to support:
- Google's Imagen API (via Vertex AI)
- Direct Gemini image generation (if available)
- Future image generation endpoints

### Configuration Needed

For full Imagen API support, you may need:

```javascript
// Vertex AI configuration (if using Imagen via Vertex AI)
PROJECT_ID=your-gcp-project-id
LOCATION=us-central1
```

Note: Check Google Cloud documentation for latest Imagen API setup.

## File Structure

```
generator/
├── image-gen.js          # Image generator class
├── content.js            # Updated to use image generator
└── ...

data/
└── cache/
    └── images/           # Image cache files
        └── {hash}.json

dist/
└── images/               # Generated images
    └── {hash}.jpg        # Saved images
```

## Troubleshooting

### "Gemini API key not set"
- Add `GEMINI_API_KEY` to `.env` file
- Or set `DRY_RUN=true` for testing

### "Image generation failed"
- Check API key is valid
- Verify network connectivity
- Check API quota/limits
- System falls back to placeholder automatically

### Images not saving locally
- Check `dist/images/` directory exists
- Verify write permissions
- Check `saveLocal` option is not disabled

### Wrong image size
- Verify `width` and `height` parameters
- Check image URL includes size parameters
- Ensure fallback uses correct dimensions

## Cost Considerations

### Image Generation Costs

- **Imagen API**: Varies by model and size
- **Caching**: Reduces costs significantly
- **Placeholder**: Free (Unsplash)

### Optimization Tips

1. **Enable Caching**: Reuse generated images
2. **Batch Generation**: Generate once, reuse many times
3. **Size Selection**: Use appropriate size for use case
4. **Dry-Run Testing**: Test without API calls

## Next Steps

1. Set up API key in `.env`
2. Test generation: `DRY_RUN=true npm run bulk`
3. Generate images: `npm run bulk`
4. Verify images in `dist/images/`
5. Check images are exact size (1200x800)

## Support

For issues or questions:
- Check `GENERATOR_README.md` for general usage
- Review `ENV_SETUP.md` for environment configuration
- See console output for detailed error messages

