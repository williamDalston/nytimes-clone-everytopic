const config = require('./config');

// Simulated LLM Client
const generateArticle = async (topic) => {
    console.log(`🤖 Generating article for topic: ${topic}...`);

    // In a real implementation, this would call OpenAI/Gemini API
    // For now, we return a structured object
    return {
        title: `The Future of ${topic}: What You Need to Know`,
        excerpt: `An in-depth look at how ${topic} is transforming the industry and what experts are predicting for the coming year.`,
        content: `
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
      <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
      <h3>Key Takeaways</h3>
      <ul>
        <li>Revolutionary changes in ${topic}</li>
        <li>Expert analysis and predictions</li>
        <li>Strategic implementation guides</li>
      </ul>
      <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.</p>
    `,
        author: "AI Analyst",
        date: new Date().toISOString().split('T')[0],
        readTime: "5 min read",
        category: "AI Insights"
    };
};

// Simulated "Nano Banana" Image Generator
const generateImage = async (prompt) => {
    console.log(`🍌 Nano Banana generating image for: ${prompt}...`);

    // In a real implementation, this would call the image gen API
    // For now, return a high-quality Unsplash placeholder based on keywords
    const keywords = prompt.split(' ').slice(0, 2).join(',');
    return `https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=1200&h=800&fit=crop&q=80&keywords=${keywords}`;
};

// Topic Expander
const expandTopics = async (seedTopic) => {
    console.log(`🧠 Expanding topic: ${seedTopic}...`);
    return [
        `${seedTopic} Trends 2025`,
        `Best ${seedTopic} Tools`,
        `How to Master ${seedTopic}`,
        `${seedTopic} for Beginners`,
        `Advanced ${seedTopic} Techniques`
    ];
};

module.exports = {
    generateArticle,
    generateImage,
    expandTopics
};
