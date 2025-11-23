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

**CRITICAL QUALITY CONSTRAINTS:**

**Forbidden Phrases (STRICTLY AVOID):**
- "delve into," "it's important to note," "furthermore," "moreover," "additionally"
- "it's worth noting," "it's crucial that," "in conclusion," "to summarize"
- "as we can see," "various aspects," "numerous studies," "experts agree"
- "in today's world," "unlock the potential," "game-changer"
- Any vague academic language without specific backing

**Blueprint Quality Standards:**
- Must reflect professional-level gravitas while remaining accessible
- Should incorporate storytelling elements and narrative tension
- Target sophisticated audiences who expect nuanced argumentation
- **Every key argument must include specific evidence sources** (studies, experts, case studies)
- **Thesis must be debatable and substantive**—not generic or obvious
- **Unique angle must be clearly defined**—what makes this different?
- **Core tension must be meaningful**—a real paradox or question worth resolving

**Required Specificity:**
- Key arguments must reference specific studies, experts, or case studies
- Examples must be concrete, not abstract
- Evidence must be named, not vague ("a 2023 MIT study" not "studies show")

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

