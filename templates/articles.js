// ============================================
// ARTICLE DATA STRUCTURE
// ============================================

const articles = [
    {
        id: 1,
        title: "Power BI Desktop 2024: Revolutionary Features Transforming Data Analytics",
        excerpt: "Explore the groundbreaking new features in Power BI Desktop that are reshaping how organizations visualize and analyze their data. From AI-powered insights to enhanced performance optimization.",
        category: "Latest Updates",
        author: "Sarah Mitchell",
        date: "2024-11-22",
        readTime: "8 min read",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=800&fit=crop",
        featured: true
    },
    {
        id: 2,
        title: "Mastering DAX: Advanced Calculations for Business Intelligence",
        excerpt: "Deep dive into Data Analysis Expressions (DAX) with practical examples and best practices for creating powerful calculated columns and measures.",
        category: "Advanced Analytics",
        author: "Michael Chen",
        date: "2024-11-21",
        readTime: "12 min read",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=800&fit=crop"
    },
    {
        id: 3,
        title: "Building Interactive Dashboards: A Complete Guide",
        excerpt: "Learn how to create stunning, interactive dashboards that engage stakeholders and drive data-driven decision making across your organization.",
        category: "Visualizations",
        author: "Emily Rodriguez",
        date: "2024-11-20",
        readTime: "10 min read",
        image: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=1200&h=800&fit=crop"
    },
    {
        id: 4,
        title: "Power BI Service vs Desktop: Choosing the Right Tool",
        excerpt: "Understanding the key differences between Power BI Service and Desktop to optimize your analytics workflow and collaboration capabilities.",
        category: "Power BI Basics",
        author: "David Thompson",
        date: "2024-11-19",
        readTime: "6 min read",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=800&fit=crop&sat=-20"
    },
    {
        id: 5,
        title: "Data Modeling Best Practices for Enterprise Solutions",
        excerpt: "Essential strategies for designing scalable and efficient data models that support complex business requirements and maintain optimal performance.",
        category: "Data Modeling",
        author: "Jennifer Park",
        date: "2024-11-18",
        readTime: "15 min read",
        image: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=1200&h=800&fit=crop"
    },
    {
        id: 6,
        title: "Power Query: Transform Your Data with Confidence",
        excerpt: "Master the art of data transformation using Power Query's intuitive interface and powerful M language capabilities.",
        category: "Data Preparation",
        author: "Robert Kim",
        date: "2024-11-17",
        readTime: "9 min read",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=800&fit=crop&hue=30"
    },
    {
        id: 7,
        title: "Custom Visuals: Extending Power BI's Visualization Capabilities",
        excerpt: "Discover how to leverage custom visuals from AppSource and create your own to meet unique business visualization requirements.",
        category: "Visualizations",
        author: "Amanda Foster",
        date: "2024-11-16",
        readTime: "7 min read",
        image: "https://images.unsplash.com/photo-1543286386-713bdd548da4?w=1200&h=800&fit=crop"
    },
    {
        id: 8,
        title: "Row-Level Security: Protecting Your Data Assets",
        excerpt: "Implement robust security measures with row-level security to ensure users only access data they're authorized to view.",
        category: "Security",
        author: "Marcus Johnson",
        date: "2024-11-15",
        readTime: "11 min read",
        image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&h=800&fit=crop"
    },
    {
        id: 9,
        title: "Performance Optimization: Speed Up Your Reports",
        excerpt: "Proven techniques to dramatically improve report loading times and enhance user experience across your Power BI solutions.",
        category: "Performance",
        author: "Lisa Anderson",
        date: "2024-11-14",
        readTime: "10 min read",
        image: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=1200&h=800&fit=crop&sat=20"
    },
    {
        id: 10,
        title: "Power BI Embedded: Analytics in Your Applications",
        excerpt: "Learn how to seamlessly integrate Power BI reports and dashboards into your custom applications using Power BI Embedded.",
        category: "Integration",
        author: "Kevin Wright",
        date: "2024-11-13",
        readTime: "13 min read",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=800&fit=crop&hue=60"
    },
    {
        id: 11,
        title: "Paginated Reports: When and How to Use Them",
        excerpt: "Understanding the role of paginated reports in your BI strategy and mastering their creation for pixel-perfect printing.",
        category: "Reporting",
        author: "Rachel Green",
        date: "2024-11-12",
        readTime: "8 min read",
        image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=800&fit=crop"
    },
    {
        id: 12,
        title: "AI Insights: Leveraging Machine Learning in Power BI",
        excerpt: "Harness the power of AI and machine learning features in Power BI to uncover hidden patterns and predictive insights.",
        category: "AI & ML",
        author: "Daniel Lee",
        date: "2024-11-11",
        readTime: "14 min read",
        image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=800&fit=crop"
    }
];

// ============================================
// TRENDING ARTICLES
// ============================================

const trendingArticles = [
    {
        title: "Power BI Desktop 2024: Revolutionary Features",
        link: "#"
    },
    {
        title: "Mastering DAX: Advanced Calculations",
        link: "#"
    },
    {
        title: "Building Interactive Dashboards",
        link: "#"
    },
    {
        title: "Performance Optimization Techniques",
        link: "#"
    },
    {
        title: "AI Insights in Power BI",
        link: "#"
    }
];

// ============================================
// UTILITY FUNCTIONS
// ============================================

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function renderArticleCard(article, isFeatured = false) {
    return `
    <article class="article-card ${isFeatured ? 'featured' : ''}">
      <div class="article-image-wrapper">
        <img src="${article.image}" alt="${article.title}" class="article-image">
        <span class="article-category-badge">${article.category}</span>
      </div>
      <div class="article-content">
        <h3 class="article-title">${article.title}</h3>
        <p class="article-excerpt">${article.excerpt}</p>
        <div class="article-meta">
          <span class="article-author">${article.author}</span>
          <span class="article-date">
            ${formatDate(article.date)} · ${article.readTime}
          </span>
        </div>
      </div>
    </article>
  `;
}

function renderTrendingItem(article, index) {
    return `
    <li class="trending-item">
      <span class="trending-number">${index + 1}</span>
      <span class="trending-title">${article.title}</span>
    </li>
  `;
}

// ============================================
// RENDER FUNCTIONS
// ============================================

function renderHeroArticle() {
    const heroArticle = articles.find(article => article.featured);
    if (!heroArticle) return '';

    return `
    <div class="hero-content">
      <div class="hero-text">
        <span class="hero-category">${heroArticle.category}</span>
        <h1 class="hero-title">${heroArticle.title}</h1>
        <p class="hero-excerpt">${heroArticle.excerpt}</p>
        <div class="hero-meta">
          <span>${heroArticle.author}</span>
          <span>•</span>
          <span>${formatDate(heroArticle.date)}</span>
          <span>•</span>
          <span>${heroArticle.readTime}</span>
        </div>
        <button class="btn btn-primary">Read Full Article</button>
      </div>
      <div class="hero-image-wrapper">
        <img src="${heroArticle.image}" alt="${heroArticle.title}" class="hero-image">
      </div>
    </div>
  `;
}

function renderArticles() {
    const articlesGrid = document.getElementById('articles-grid');
    if (!articlesGrid) return;

    const regularArticles = articles.filter(article => !article.featured);
    articlesGrid.innerHTML = regularArticles.map(article => renderArticleCard(article)).join('');
}

function renderTrending() {
    const trendingList = document.getElementById('trending-list');
    if (!trendingList) return;

    trendingList.innerHTML = trendingArticles.map((article, index) =>
        renderTrendingItem(article, index)
    ).join('');
}

// ============================================
// SEARCH & FILTER FUNCTIONALITY
// ============================================

function filterArticlesByCategory(category) {
    const filteredArticles = category === 'all'
        ? articles.filter(article => !article.featured)
        : articles.filter(article => article.category === category && !article.featured);

    const articlesGrid = document.getElementById('articles-grid');
    if (!articlesGrid) return;

    articlesGrid.innerHTML = filteredArticles.map(article => renderArticleCard(article)).join('');
}

function searchArticles(query) {
    const searchQuery = query.toLowerCase();
    const filteredArticles = articles.filter(article =>
        !article.featured && (
            article.title.toLowerCase().includes(searchQuery) ||
            article.excerpt.toLowerCase().includes(searchQuery) ||
            article.category.toLowerCase().includes(searchQuery)
        )
    );

    const articlesGrid = document.getElementById('articles-grid');
    if (!articlesGrid) return;

    if (filteredArticles.length === 0) {
        articlesGrid.innerHTML = '<p style="grid-column: span 2; text-align: center; padding: 3rem;">No articles found matching your search.</p>';
    } else {
        articlesGrid.innerHTML = filteredArticles.map(article => renderArticleCard(article)).join('');
    }
}

// ============================================
// INITIALIZE ON PAGE LOAD
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Render hero article
    const heroSection = document.querySelector('.hero .container');
    if (heroSection) {
        heroSection.innerHTML = renderHeroArticle();
    }

    // Render articles
    renderArticles();

    // Render trending
    renderTrending();

    console.log('Articles loaded successfully!');
});
