# Prompt Updates for Multi-Perspective Support

## Overview

All prompt templates have been updated to support multiple perspectives and lens information, allowing the system to generate distinct articles from the same topic using different lenses/angles.

## Updated Prompts

### 1. Pipeline Prompts

#### blueprint.md
- Added `{lensPrompt}` variable for lens-specific guidance
- Added conditional perspective context to distinguish between multiple perspectives on the same topic

#### draft.md
- Added `{lensPrompt}` variable
- Added perspective context to maintain unique angle during expansion

#### enhance.md
- Added `{lensPrompt}` variable
- Added perspective context to deepen unique lens while maintaining coherence

#### humanize.md
- Added `{lensPrompt}` variable
- Added perspective context to maintain unique voice during humanization

#### seo.md
- Added `{lensPrompt}` variable
- Added perspective context to optimize while preserving unique lens/angle

### 2. Style-Specific Prompts

#### short.md
- Added `{lensPrompt}` variable
- Added perspective context for concise lens-based articles

#### long.md
- Added `{lensPrompt}` variable
- Added perspective context for comprehensive lens-based articles

#### feature.md
- Added `{lensPrompt}` variable
- Added perspective context for narrative lens-based articles

#### default.md
- Added `{lensPrompt}` variable
- Added perspective context for general articles

## Variable Substitution

The prompt loading system now supports:

1. **Standard Variables**: `{topic}`, `{previousContent}`, `{angle}`, `{tone}`, etc.
2. **Lens Variables**: `{lensPrompt}` - Contains full lens guidance
3. **Perspective Variables**: `{perspective}`, `{totalPerspectives}`
4. **Conditional Blocks**: `{if variable}...{/if}` - Only included if variable exists and has value

## Example Lens Prompt

When a lens is provided, it automatically injects:

```
**Lens/Perspective:** Analytical

Approach this topic from the "Analytical" lens:

Focus: Data-driven analysis with systematic examination of patterns and implications
Tone: objective, evidence-based, systematic
Key Question: What does the data tell us?
Voice: Write as a expert analyst

Emphasize: patterns, data, trends, causality, implications

Structure your article to answer: What does the data tell us?
```

## Conditional Perspective Context

When multiple perspectives are generated, each prompt includes:

```
**Perspective Context:**
This is perspective 1 of 3 on this topic. Ensure your angle is distinct from other perspectives while maintaining depth and rigor.
```

This helps the LLM generate distinct content for each perspective while maintaining quality.

## Benefits

1. **Distinct Perspectives**: Each article from the same topic has a unique lens/angle
2. **Quality Maintenance**: All perspectives maintain depth and quality
3. **Contextual Awareness**: The LLM knows it's part of a multi-perspective series
4. **Lens-Specific Guidance**: Each lens provides specific focus areas and questions
5. **Flexible**: Works with both pipeline and single-stage generation

## Implementation

The lens/perspective information is automatically passed to prompts via:

```javascript
const enhancedOptions = {
    ...options,
    lensPrompt: articleConfig.lens 
        ? generateLensPrompt(topic, lens)
        : '',
    perspective: articleConfig.perspective,
    totalPerspectives: articleConfig.totalPerspectives
};
```

The `_loadPrompt` method in `llm.js` handles:
- Variable substitution
- Conditional block processing
- Empty variable handling (graceful fallback)

## Testing

To test multi-perspective prompts:

```bash
# Generate articles with multiple perspectives
USE_MULTIPLE_PERSPECTIVES=true npm run bulk

# Check logs for lens information in prompts
# Each article should have distinct lens guidance
```

## Future Enhancements

- [ ] Add lens-specific example outputs to prompts
- [ ] Create prompt variations for different lens combinations
- [ ] Add perspective cross-referencing guidance
- [ ] Enhance conditional logic for more complex scenarios

