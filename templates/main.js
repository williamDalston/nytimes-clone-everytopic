// ============================================
// INTERACTIVE FEATURES & FUNCTIONALITY
// ============================================

// ============================================
// STICKY HEADER
// ============================================

function initStickyHeader() {
    const header = document.querySelector('.header');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });
}

// ============================================
// DARK MODE TOGGLE
// ============================================

function initDarkMode() {
    const themeToggle = document.getElementById('theme-toggle');
    const html = document.documentElement;

    // Check for saved theme preference or default to light mode
    const currentTheme = localStorage.getItem('theme') || 'light';
    html.setAttribute('data-theme', currentTheme);
    updateThemeIcon(currentTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';

        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });
}

function updateThemeIcon(theme) {
    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.textContent = theme === 'light' ? '🌙' : '☀️';
}

// ============================================
// MOBILE MENU
// ============================================

function initMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');

    mobileMenuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        mobileMenuToggle.textContent = navMenu.classList.contains('active') ? '✕' : '☰';
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.header-container')) {
            navMenu.classList.remove('active');
            mobileMenuToggle.textContent = '☰';
        }
    });
}

// ============================================
// SEARCH FUNCTIONALITY
// ============================================

function initSearch() {
    const searchBtn = document.getElementById('search-btn');
    const searchOverlay = createSearchOverlay();

    searchBtn.addEventListener('click', () => {
        document.body.appendChild(searchOverlay);
        searchOverlay.classList.add('active');
        searchOverlay.querySelector('.search-input').focus();
    });
}

function createSearchOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'search-overlay';
    overlay.innerHTML = `
    <div class="search-container">
      <div class="search-header">
        <input type="text" class="search-input" placeholder="Search articles..." id="search-input">
        <button class="search-close" id="search-close">✕</button>
      </div>
      <div class="search-results" id="search-results"></div>
    </div>
  `;

    // Add styles for search overlay
    const style = document.createElement('style');
    style.textContent = `
    .search-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.9);
      z-index: 2000;
      display: none;
      align-items: flex-start;
      justify-content: center;
      padding-top: 10vh;
    }
    
    .search-overlay.active {
      display: flex;
    }
    
    .search-container {
      width: 90%;
      max-width: 800px;
      background-color: var(--color-background);
      border-radius: var(--border-radius-lg);
      padding: var(--space-6);
    }
    
    .search-header {
      display: flex;
      gap: var(--space-4);
      margin-bottom: var(--space-6);
    }
    
    .search-input {
      flex: 1;
      padding: var(--space-4);
      font-size: var(--text-xl);
      border: 2px solid var(--color-accent);
      border-radius: var(--border-radius);
      background-color: var(--color-surface);
      color: var(--color-text);
    }
    
    .search-input:focus {
      outline: none;
      box-shadow: 0 0 0 3px rgba(187, 25, 25, 0.2);
    }
    
    .search-close {
      padding: var(--space-4);
      font-size: var(--text-2xl);
      color: var(--color-text);
      cursor: pointer;
      transition: color var(--transition-fast);
    }
    
    .search-close:hover {
      color: var(--color-accent);
    }
    
    .search-results {
      max-height: 60vh;
      overflow-y: auto;
    }
    
    .nav-menu.active {
      display: flex;
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background-color: var(--color-background);
      flex-direction: column;
      padding: var(--space-4);
      box-shadow: var(--shadow-lg);
    }
  `;
    document.head.appendChild(style);

    // Close button functionality
    overlay.querySelector('#search-close').addEventListener('click', () => {
        overlay.classList.remove('active');
        setTimeout(() => overlay.remove(), 300);
    });

    // Search input functionality
    overlay.querySelector('#search-input').addEventListener('input', (e) => {
        const query = e.target.value;
        if (query.length > 2) {
            performSearch(query, overlay.querySelector('#search-results'));
        } else {
            overlay.querySelector('#search-results').innerHTML = '';
        }
    });

    // Close on escape key
    overlay.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            overlay.classList.remove('active');
            setTimeout(() => overlay.remove(), 300);
        }
    });

    return overlay;
}

function performSearch(query, resultsContainer) {
    const searchQuery = query.toLowerCase();
    const results = articles.filter(article =>
        article.title.toLowerCase().includes(searchQuery) ||
        article.excerpt.toLowerCase().includes(searchQuery) ||
        article.category.toLowerCase().includes(searchQuery) ||
        article.author.toLowerCase().includes(searchQuery)
    );

    if (results.length === 0) {
        resultsContainer.innerHTML = '<p style="text-align: center; padding: 2rem; color: var(--color-text-light);">No articles found.</p>';
    } else {
        resultsContainer.innerHTML = results.map(article => `
      <div class="search-result-item" style="padding: var(--space-4); border-bottom: 1px solid rgba(0,0,0,0.1); cursor: pointer;">
        <span style="font-size: var(--text-xs); color: var(--color-accent); font-weight: 700; text-transform: uppercase;">${article.category}</span>
        <h4 style="margin: var(--space-2) 0; color: var(--color-primary);">${article.title}</h4>
        <p style="font-size: var(--text-sm); color: var(--color-text-light); margin-bottom: var(--space-2);">${article.excerpt.substring(0, 120)}...</p>
        <span style="font-size: var(--text-xs); color: var(--color-text-light);">${article.author} · ${formatDate(article.date)}</span>
      </div>
    `).join('');
    }
}

// ============================================
// NEWSLETTER FORM
// ============================================

function initNewsletter() {
    const newsletterForm = document.getElementById('newsletter-form');

    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('newsletter-email').value;

        // Simulate form submission
        alert(`Thank you for subscribing! We'll send Power BI insights to ${email}`);
        newsletterForm.reset();
    });
}

// ============================================
// SMOOTH SCROLL ANIMATIONS
// ============================================

function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe article cards
    document.querySelectorAll('.article-card').forEach(card => {
        observer.observe(card);
    });
}

// ============================================
// CATEGORY FILTERING
// ============================================

function initCategoryFilters() {
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));

            // Add active class to clicked link
            link.classList.add('active');

            // Get category from data attribute or text
            const category = link.textContent.trim();

            // Filter articles (you can customize this based on your needs)
            if (category === 'All Topics') {
                renderArticles();
            } else {
                filterArticlesByCategory(category);
            }
        });
    });
}

// ============================================
// INITIALIZE ALL FEATURES
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initStickyHeader();
    initDarkMode();
    initMobileMenu();
    initSearch();
    initNewsletter();

    // Delay scroll animations slightly to ensure articles are rendered
    setTimeout(() => {
        initScrollAnimations();
    }, 100);

    initCategoryFilters();

    console.log('All interactive features initialized!');
});
