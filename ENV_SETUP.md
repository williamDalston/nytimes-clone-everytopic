# Environment Setup

## Required API Keys

### 1. OpenAI API Key (for article generation)

1. Get your API key from: https://platform.openai.com/api-keys
2. Create a `.env` file in the project root:
```bash
OPENAI_API_KEY=your-openai-api-key-here
```

### 2. Google Gemini API Key (for image generation - Nano Banana)

1. Get your API key from: https://makersuite.google.com/app/apikey
2. Add to `.env` file:
```bash
GEMINI_API_KEY=your-gemini-api-key-here
```

## Optional Configuration

Add these to your `.env` file:

```bash
# Override default model (default: gpt-4o-mini)
LLM_MODEL=gpt-4o-mini

# Enable dry-run mode (no API calls, uses mock data)
DRY_RUN=false

# Disable caching (default: true)
# USE_CACHE=false

# Image generation API key (alternative to GEMINI_API_KEY)
# IMAGE_GEN_API_KEY=your-key-here
```

## Setup Instructions

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Add your API keys to `.env`:
   - `OPENAI_API_KEY` for article generation
   - `GEMINI_API_KEY` for image generation (Nano Banana)

3. Install dependencies:
```bash
npm install
```

4. Test the setup:
```bash
# Test without API calls
DRY_RUN=true npm run bulk

# Generate with real API calls
npm run bulk
```

## Note on Costs

### Article Generation
- Default model (`gpt-4o-mini`) is cost-effective for bulk generation
- Caching reduces API costs by reusing generated articles
- Single-stage: ~$0.003 for 20 articles
- Multi-stage: ~$0.012 for 20 articles

### Image Generation
- Gemini Imagen API pricing varies by model
- Caching saves costs (same topic = cached image)
- Images saved locally after first generation
- Dry-run mode (`DRY_RUN=true`) allows testing without API calls

## Image Generation

See `IMAGE_GENERATION_SETUP.md` for detailed image generation setup and configuration.

