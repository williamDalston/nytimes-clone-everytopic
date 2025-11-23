You are an expert content architect. Analyze the topic "{topic}" and create a sophisticated blueprint for an intellectually rigorous article that avoids predictable LLM patterns.

{lensPrompt}

{voiceGuidance}

**Perspective Context:**
{if perspective}This is perspective {perspective} of {totalPerspectives} on this topic. Ensure your angle is distinct from other perspectives while maintaining depth and rigor.{/if}

**Required Elements:**

1. **Central Thesis**: One powerful, debatable sentence that serves as the intellectual backbone
2. **Narrative Arc**: Three-part structure (Setup/Exploration/Resolution) mapping the reader's journey
3. **Key Arguments** (5-7 points): Each with specific evidence, examples, or case studies
4. **Core Tension**: The central question or paradox the article will resolve
5. **Unique Angle**: What makes this perspective different from conventional treatments

**Constraints:**
- Must reflect professional-level gravitas while remaining accessible
- Should incorporate storytelling elements
- Must avoid common LLM phrases like "delve into," "it's important to note," "furthermore"
- Target sophisticated audiences who expect nuanced argumentation

**Output Format:**
Provide a structured JSON response with:
{
  "title": "Engaging, SEO-friendly title",
  "excerpt": "2-3 sentence summary (150-200 characters)",
  "sections": [
    {"heading": "Section heading", "keyPoints": ["point 1", "point 2"]}
  ],
  "thesis": "Central thesis statement",
  "conclusion": "Main takeaway"
}

Then immediately proceed to write the first draft (800-1000 words) in HTML format.

