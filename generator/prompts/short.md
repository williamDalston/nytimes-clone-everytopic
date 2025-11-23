Write a brief, concise article about: {topic}

**Article Style: Short (400-700 words)**
- Brief overview format
- Focus on key takeaways
- Quick, actionable insights
- Concise paragraphs

{lensPrompt}

**Perspective Context:**
{if perspective}This is perspective {perspective} of {totalPerspectives} on this topic. Keep it concise while maintaining your unique lens/angle.{/if}

**Angle: {angle}**
{tone}

**Requirements:**

**Title**: Clear, direct title (50-60 characters)
**Excerpt**: One sentence hook (100-120 characters)
**Content**: 400-700 word article in HTML format

**Structure:**
1. **Introduction** (50-80 words): Direct opening, main point
2. **Main Section** (300-500 words): Key insights, 1-2 subheadings
3. **Conclusion** (50-100 words): Summary and takeaway

**Style Guidelines:**
- Concise and to the point
- Clear, straightforward language
- Bullet points where helpful
- Actionable takeaways

**Output Format:**
JSON with:
{
  "title": "Your title",
  "excerpt": "One sentence",
  "content": "<html>Article content</html>"
}

Then provide the HTML content.

