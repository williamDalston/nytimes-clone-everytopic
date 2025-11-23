Write a comprehensive, engaging article about: {topic}

{lensPrompt}

{voiceGuidance}

**Perspective Context:**
{if perspective}This is perspective {perspective} of {totalPerspectives} on this topic. Approach it from your unique lens/angle.{/if}

**Requirements:**

**Title**: Catchy, SEO-friendly title that captures the essence
**Excerpt**: 2-3 sentence summary (150-200 characters) that hooks the reader
**Content**: 1000-1500 word article in HTML format with proper structure

**Structure:**
1. **Introduction** (150-200 words): Hook reader with compelling opening, present thesis
2. **Main Sections** (3-5 sections, 200-300 words each): Each with clear heading (h2 or h3)
3. **Conclusion** (150-200 words): Summarize key points, provide actionable takeaways

**CRITICAL QUALITY CONSTRAINTS:**

**Forbidden Phrases (STRICTLY AVOID):**
- "delve into," "it's important to note," "furthermore," "moreover," "additionally"
- "it's worth noting," "it's crucial that," "in conclusion," "to summarize"
- "as we can see," "it becomes clear," "one must consider," "it is evident that"
- "various aspects," "numerous studies," "research suggests," "experts agree"
- "in today's world," "unlock the potential," "game-changer," "cutting-edge"
- "In this article, we will..." (weak opening)
- Any vague academic language without specific backing

**Required Writing Standards:**
1. **Specificity**: Name specific studies, experts, companies, or data points. Never use vague terms like "many studies" or "experts say" without specifics.
2. **Natural Voice**: Write as if speaking to an intelligent colleague—confident but approachable, sophisticated but warm.
3. **Sentence Variety**: Mix short punchy sentences with longer flowing ones. Never start 3+ consecutive sentences the same way.
4. **Active Voice**: Use active voice 90% of the time. "The team discovered" not "It was discovered by the team."
5. **Concrete Examples**: Replace every abstract concept with a specific, vivid illustration. "Companies like Tesla and Apple" not "many companies."
6. **Engaging Openings**: Hook immediately with a question, surprising fact, or vivid scene. Never start with "In this article..."
7. **Value-Driven Conclusions**: End with actionable insights, thought-provoking questions, or clear takeaways—never generic summaries.

**Quality Checklist:**
- Every claim backed by specifics (examples, data, sources)
- No forbidden phrases anywhere
- Sentence beginnings vary throughout
- Active voice used consistently
- Natural, human flow maintained
- Professional yet accessible tone

**Output Format:**
Provide a JSON object with:
{
  "title": "Your engaging title",
  "excerpt": "2-3 sentence hook",
  "content": "<html>Full article content here</html>",
  "author": "AI Analyst",
  "category": "AI Insights"
}

Then provide the HTML content formatted for web display with proper paragraph tags, headings, and lists.

