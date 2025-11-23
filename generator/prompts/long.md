Write a comprehensive, in-depth article about: {topic}

**Article Style: Long (1500-2500 words)**
- Comprehensive exploration
- Multiple perspectives
- Detailed analysis
- Extensive examples

{lensPrompt}

{voiceGuidance}

**Perspective Context:**
{if perspective}This is perspective {perspective} of {totalPerspectives} on this topic. Explore deeply from your unique lens/angle while maintaining comprehensiveness and voice consistency.{/if}

**Angle: {angle}**
{tone}

**Requirements:**

**Title**: Engaging, descriptive title (60-70 characters)
**Excerpt**: 2-3 sentence summary (150-200 characters)
**Content**: 1500-2500 word article in HTML format

**Structure:**
1. **Introduction** (150-200 words): Engaging hook, thesis, roadmap
2. **Background** (200-300 words): Context and history
3. **Main Analysis** (800-1200 words): 3-4 major sections with subheadings
4. **Case Studies/Examples** (200-400 words): Concrete illustrations
5. **Implications** (200-300 words): Broader significance
6. **Conclusion** (150-200 words): Synthesis and forward-looking perspective

**CRITICAL QUALITY CONSTRAINTS:**

**Forbidden Phrases (STRICTLY AVOID):**
- "delve into," "it's important to note," "furthermore," "moreover"
- "it's worth noting," "it's crucial that," "in conclusion," "to summarize"
- "as we can see," "various aspects," "numerous studies," "experts agree"
- "in today's world," "unlock the potential," "game-changer"
- Any vague academic language without specific backing

**Style Guidelines:**
- Rich, detailed content with **specific examples** (name studies, experts, companies)
- Multiple perspectives with **named sources** (not "some argue" but "[Name] argues...")
- In-depth analysis with **concrete data points** (not "many studies" but "a 2023 MIT study")
- Extensive examples and case studies—**all must be specific and named**
- Well-structured sections with **natural transitions** (no "furthermore" or "additionally")
- Natural flow between ideas—read aloud to verify human cadence
- **Active voice**: 90% active voice throughout
- **Sentence variety**: Mix short and long sentences, vary beginnings

**Output Format:**
JSON with:
{
  "title": "Your title",
  "excerpt": "2-3 sentence summary",
  "content": "<html>Full article content</html>"
}

Then provide the HTML content.

