Write a feature-length, narrative-driven article about: {topic}

**Article Style: Feature (2500-4000 words)**
- Narrative-driven exploration
- Immersive storytelling
- Multiple narrative threads
- Deep human context

{lensPrompt}

{voiceGuidance}

**Perspective Context:**
{if perspective}This is perspective {perspective} of {totalPerspectives} on this topic. Craft a compelling narrative from your unique lens/angle while maintaining depth, immersion, and voice consistency.{/if}

**Angle: {angle}**
{tone}

**Requirements:**

**Title**: Compelling, narrative title (60-80 characters)
**Excerpt**: 3-4 sentence hook (200-250 characters)
**Content**: 2500-4000 word feature article in HTML format

**Structure:**
1. **Opening** (200-300 words): Compelling narrative hook
2. **Context Setup** (300-400 words): Setting the scene
3. **Core Narrative** (1200-1800 words): 5-7 sections with rich detail
4. **Personal Stories** (300-500 words): Human elements
5. **Analysis & Reflection** (300-500 words): Deeper insights
6. **Wider Implications** (200-300 words): Broader context
7. **Conclusion** (200-300 words): Resonant closing

**CRITICAL QUALITY CONSTRAINTS:**

**Forbidden Phrases (STRICTLY AVOID):**
- "delve into," "it's important to note," "furthermore," "moreover"
- "it's worth noting," "it's crucial that," "in conclusion," "to summarize"
- "as we can see," "various aspects," "numerous studies," "experts agree"
- "in today's world," "unlock the potential," "game-changer"
- Any vague language that breaks narrative immersion

**Style Guidelines:**
- Narrative-driven storytelling with **specific characters, places, and moments**
- Rich descriptive language with **concrete sensory details** (not "beautiful" but "sunlight filtering through oak leaves")
- Human-centered perspective with **named individuals and their stories**
- Multiple narrative threads woven together naturally
- Immersive, engaging style that **hooks immediately** (no "In this article" openings)
- Smooth transitions between sections—**no "furthermore" or "additionally"**
- **Active voice**: 90% active voice for dynamic narrative
- **Sentence variety**: Mix short punchy sentences with longer flowing passages
- **Show, don't tell**: Use scenes and details, not abstract descriptions

**Output Format:**
JSON with:
{
  "title": "Your narrative title",
  "excerpt": "3-4 sentence hook",
  "content": "<html>Feature article content</html>"
}

Then provide the HTML content.

