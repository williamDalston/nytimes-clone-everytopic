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
    if (!themeToggle) return;
    
    const moonIcon = themeToggle.querySelector('.icon-moon');
    const sunIcon = themeToggle.querySelector('.icon-sun');
    
    if (theme === 'light') {
        if (moonIcon) moonIcon.style.display = 'block';
        if (sunIcon) sunIcon.style.display = 'none';
    } else {
        if (moonIcon) moonIcon.style.display = 'none';
        if (sunIcon) sunIcon.style.display = 'block';
    }
}

// ============================================
// MOBILE MENU
// ============================================

function initMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');

    mobileMenuToggle.addEventListener('click', () => {
        const isActive = navMenu.classList.toggle('active');
        const menuIcon = mobileMenuToggle.querySelector('.icon-menu');
        const closeIcon = mobileMenuToggle.querySelector('.icon-close');
        
        if (isActive) {
            if (menuIcon) menuIcon.style.display = 'none';
            if (closeIcon) closeIcon.style.display = 'block';
            mobileMenuToggle.setAttribute('aria-expanded', 'true');
        } else {
            if (menuIcon) menuIcon.style.display = 'block';
            if (closeIcon) closeIcon.style.display = 'none';
            mobileMenuToggle.setAttribute('aria-expanded', 'false');
        }
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.header-container')) {
            navMenu.classList.remove('active');
            const menuIcon = mobileMenuToggle.querySelector('.icon-menu');
            const closeIcon = mobileMenuToggle.querySelector('.icon-close');
            if (menuIcon) menuIcon.style.display = 'block';
            if (closeIcon) closeIcon.style.display = 'none';
            mobileMenuToggle.setAttribute('aria-expanded', 'false');
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
        <button class="search-close" id="search-close" aria-label="Close search">
          <svg class="icon icon-close" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
          <span class="sr-only">Close search</span>
        </button>
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
    
    .search-result-item {
      display: block;
      padding: var(--space-4);
      border-bottom: 1px solid rgba(0,0,0,0.1);
      text-decoration: none;
      color: inherit;
      transition: background-color var(--transition-fast), transform var(--transition-fast);
      border-radius: var(--border-radius);
      margin-bottom: var(--space-2);
    }
    
    .search-result-item:hover,
    .search-result-item.selected {
      background-color: var(--color-surface);
      transform: translateX(4px);
    }
    
    .search-result-category {
      font-size: var(--text-xs);
      color: var(--color-accent);
      font-weight: 700;
      text-transform: uppercase;
      margin-bottom: var(--space-1);
    }
    
    .search-result-title {
      font-size: var(--text-base);
      font-weight: 700;
      color: var(--color-primary);
      margin: var(--space-2) 0;
      line-height: 1.4;
    }
    
    .search-result-excerpt {
      font-size: var(--text-sm);
      color: var(--color-text-light);
      margin-bottom: var(--space-2);
      line-height: 1.5;
    }
    
    .search-result-meta {
      font-size: var(--text-xs);
      color: var(--color-text-light);
    }
    
    .search-result-item mark {
      background-color: rgba(187, 25, 25, 0.2);
      color: var(--color-accent);
      font-weight: 700;
      padding: 0 2px;
      border-radius: 2px;
    }
    
    .search-no-results,
    .search-hint {
      text-align: center;
      padding: var(--space-8);
      color: var(--color-text-light);
    }
    
    .search-hint {
      font-size: var(--text-sm);
      font-style: italic;
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

    const searchInput = overlay.querySelector('#search-input');
    const resultsContainer = overlay.querySelector('#search-results');
    let selectedIndex = -1;
    let searchResults = [];

    // Search input functionality with debounce
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            if (query.length > 1) {
                performSearch(query, resultsContainer);
                const resultItems = resultsContainer.querySelectorAll('.search-result-item');
                searchResults = Array.from(resultItems);
                selectedIndex = -1;
            } else if (query.length === 0) {
                resultsContainer.innerHTML = '<div class="search-hint">Start typing to search articles...</div>';
            }
        }, 200);
    });

    // Keyboard navigation
    overlay.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            overlay.classList.remove('active');
            setTimeout(() => overlay.remove(), 300);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIndex = Math.min(selectedIndex + 1, searchResults.length - 1);
            updateSelectedItem(searchResults, selectedIndex);
            if (searchResults[selectedIndex]) {
                searchResults[selectedIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIndex = Math.max(selectedIndex - 1, -1);
            updateSelectedItem(searchResults, selectedIndex);
        } else if (e.key === 'Enter' && selectedIndex >= 0 && searchResults[selectedIndex]) {
            e.preventDefault();
            searchResults[selectedIndex].click();
        }
    });

    // Keyboard shortcut to open search (Ctrl+K or Cmd+K)
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            if (!document.querySelector('.search-overlay.active')) {
                document.body.appendChild(overlay);
                overlay.classList.add('active');
                searchInput.focus();
            }
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
        resultsContainer.innerHTML = `
            <div class="search-no-results">
                <p>No articles found matching "${query}"</p>
                <p style="font-size: var(--text-sm); margin-top: var(--space-2);">Try different keywords or browse our categories.</p>
            </div>
        `;
    } else {
        const slug = (article) => article.slug || article.title.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
        
        resultsContainer.innerHTML = results.map((article, index) => {
            const articleUrl = `articles/${slug(article)}.html`;
            return `
                <a href="${articleUrl}" class="search-result-item" data-index="${index}" role="option" aria-label="Article: ${article.title}">
                    <div class="search-result-category">${article.category}</div>
                    <h4 class="search-result-title">${highlightMatch(article.title, searchQuery)}</h4>
                    <p class="search-result-excerpt">${highlightMatch(article.excerpt.substring(0, 120), searchQuery)}...</p>
                    <div class="search-result-meta">${article.author} · ${formatDate(article.date)}</div>
                </a>
            `;
        }).join('');
        
        // Add keyboard navigation
        const resultItems = resultsContainer.querySelectorAll('.search-result-item');
        let selectedIndex = -1;
        
        resultItems.forEach((item, index) => {
            item.addEventListener('mouseenter', () => {
                selectedIndex = index;
                updateSelectedItem(resultItems, selectedIndex);
            });
            
            item.addEventListener('click', (e) => {
                // Navigation will happen naturally via href
            });
        });
    }
}

function highlightMatch(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

function updateSelectedItem(items, index) {
    items.forEach((item, i) => {
        item.classList.toggle('selected', i === index);
    });
}

// ============================================
// NEWSLETTER FORM
// ============================================

function initNewsletter() {
    const newsletterForm = document.getElementById('newsletter-form');
    if (!newsletterForm) return;

    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const emailInput = document.getElementById('newsletter-email');
        const email = emailInput.value.trim();
        const submitButton = newsletterForm.querySelector('button[type="submit"]');
        
        // Basic email validation
        if (!email || !email.includes('@')) {
            showNewsletterMessage('Please enter a valid email address.', 'error');
            return;
        }
        
        // Show loading state
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Subscribing...';
        submitButton.disabled = true;
        
        // Simulate form submission
        setTimeout(() => {
            showNewsletterMessage(`Thank you for subscribing! We'll send you the latest insights to ${email}`, 'success');
            newsletterForm.reset();
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }, 1000);
    });
}

function showNewsletterMessage(message, type = 'success') {
    const newsletterSection = document.querySelector('.newsletter-section');
    if (!newsletterSection) return;
    
    // Remove existing message
    const existingMessage = newsletterSection.querySelector('.newsletter-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create new message
    const messageEl = document.createElement('div');
    messageEl.className = `newsletter-message newsletter-message-${type}`;
    messageEl.textContent = message;
    messageEl.setAttribute('role', 'alert');
    
    const form = newsletterSection.querySelector('.newsletter-form');
    if (form) {
        form.parentNode.insertBefore(messageEl, form);
    } else {
        newsletterSection.appendChild(messageEl);
    }
    
    // Remove message after 5 seconds
    setTimeout(() => {
        messageEl.style.opacity = '0';
        messageEl.style.transform = 'translateY(-10px)';
        setTimeout(() => messageEl.remove(), 300);
    }, 5000);
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
// SCROLL PROGRESS INDICATOR
// ============================================

function initScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', () => {
        const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (window.scrollY / windowHeight) * 100;
        progressBar.style.width = scrolled + '%';
    });
}

// ============================================
// SMOOTH SCROLL TO TOP
// ============================================

function initScrollToTop() {
    const scrollBtn = document.createElement('button');
    scrollBtn.className = 'scroll-to-top';
    scrollBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="19" x2="12" y2="5"></line>
            <polyline points="5 12 12 5 19 12"></polyline>
        </svg>
    `;
    scrollBtn.setAttribute('aria-label', 'Scroll to top');
    scrollBtn.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        width: 48px;
        height: 48px;
        background: var(--color-accent);
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        display: none;
        align-items: center;
        justify-content: center;
        box-shadow: var(--shadow-lg);
        z-index: 999;
        opacity: 0;
        transform: translateY(20px);
        transition: opacity var(--transition-base), transform var(--transition-base), background-color var(--transition-fast);
    `;
    
    document.body.appendChild(scrollBtn);

    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
            scrollBtn.style.display = 'flex';
            setTimeout(() => {
                scrollBtn.style.opacity = '1';
                scrollBtn.style.transform = 'translateY(0)';
            }, 10);
        } else {
            scrollBtn.style.opacity = '0';
            scrollBtn.style.transform = 'translateY(20px)';
            setTimeout(() => {
                scrollBtn.style.display = 'none';
            }, 300);
        }
    });

    scrollBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    scrollBtn.addEventListener('mouseenter', () => {
        scrollBtn.style.backgroundColor = 'var(--color-accent-hover)';
        scrollBtn.style.transform = 'translateY(-4px)';
    });

    scrollBtn.addEventListener('mouseleave', () => {
        scrollBtn.style.backgroundColor = 'var(--color-accent)';
        scrollBtn.style.transform = 'translateY(0)';
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
    initScrollProgress();
    initScrollToTop();

    // Delay scroll animations slightly to ensure articles are rendered
    setTimeout(() => {
        initScrollAnimations();
    }, 100);

    initCategoryFilters();

    console.log('All interactive features initialized!');
});
