/**
 * Analytics Manager
 * Handles Google Analytics 4 integration and custom event tracking
 * Phase 4: Analytics & Monitoring
 */

const fs = require('fs');
const path = require('path');

class AnalyticsManager {
    constructor(options = {}) {
        this.ga4Id = options.ga4Id || process.env.GA4_MEASUREMENT_ID || null;
        this.enabled = options.enabled !== false && !!this.ga4Id;
        this.dataDir = options.dataDir || path.join(__dirname, '../data');
        this.eventsFile = path.join(this.dataDir, 'analytics-events.json');
        
        // Ensure data directory exists
        if (!fs.existsSync(this.dataDir)) {
            fs.mkdirSync(this.dataDir, { recursive: true });
        }
        
        // Load event history
        this.events = this.loadEvents();
    }

    /**
     * Load analytics events from file
     */
    loadEvents() {
        if (fs.existsSync(this.eventsFile)) {
            try {
                const data = JSON.parse(fs.readFileSync(this.eventsFile, 'utf8'));
                return data;
            } catch (error) {
                console.warn('⚠️ Error loading analytics events:', error.message);
            }
        }
        
        return {
            events: [],
            pageViews: {},
            customEvents: {}
        };
    }

    /**
     * Save analytics events to file
     */
    saveEvents() {
        try {
            fs.writeFileSync(this.eventsFile, JSON.stringify(this.events, null, 2));
        } catch (error) {
            console.error('❌ Error saving analytics events:', error.message);
        }
    }

    /**
     * Generate Google Analytics 4 script
     */
    generateGAScript() {
        if (!this.enabled || !this.ga4Id) {
            return '';
        }

        return `
    <!-- Google Analytics 4 -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=${this.ga4Id}"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${this.ga4Id}', {
            page_path: window.location.pathname
        });
    </script>
        `.trim();
    }

    /**
     * Generate custom analytics tracking script
     */
    generateCustomTrackingScript() {
        return `
    <!-- Custom Analytics Tracking -->
    <script>
        // Track page views
        if (typeof gtag !== 'undefined') {
            gtag('event', 'page_view', {
                page_title: document.title,
                page_location: window.location.href,
                page_path: window.location.pathname
            });
        }

        // Track article engagement
        document.addEventListener('DOMContentLoaded', function() {
            // Track scroll depth
            let maxScroll = 0;
            window.addEventListener('scroll', function() {
                const scrollPercent = Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100);
                if (scrollPercent > maxScroll && scrollPercent % 25 === 0) {
                    maxScroll = scrollPercent;
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'scroll', {
                            scroll_depth: scrollPercent
                        });
                    }
                }
            });

            // Track time on page
            const startTime = Date.now();
            window.addEventListener('beforeunload', function() {
                const timeOnPage = Math.round((Date.now() - startTime) / 1000);
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'time_on_page', {
                        time_on_page: timeOnPage
                    });
                }
            });

            // Track article reads (if article page)
            if (document.querySelector('.article-full')) {
                setTimeout(function() {
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'article_read', {
                            article_title: document.querySelector('h1')?.textContent || '',
                            read_time: document.querySelector('.read-time')?.textContent || ''
                        });
                    }
                }, 30000); // Track after 30 seconds
            }
        });
    </script>
        `.trim();
    }

    /**
     * Track custom event
     */
    trackEvent(eventName, eventParams = {}) {
        try {
            // Validate event name
            if (!eventName || typeof eventName !== 'string') {
                console.warn(`⚠️ Invalid event name: ${eventName}. Skipping event tracking.`);
                return;
            }
            
            const event = {
                name: eventName,
                params: eventParams || {},
                timestamp: new Date().toISOString()
            };

            this.events.events.push(event);
        
        // Track by event type
        if (!this.events.customEvents[eventName]) {
            this.events.customEvents[eventName] = [];
        }
        this.events.customEvents[eventName].push(event);

            // Keep only last 1000 events
            if (this.events.events.length > 1000) {
                this.events.events = this.events.events.slice(-1000);
            }

            this.saveEvents();
        } catch (error) {
            // Don't let analytics errors break the build
            console.warn(`⚠️ Analytics tracking error: ${error.message}. Continuing without tracking.`);
        }
    }

    /**
     * Track page view
     */
    trackPageView(pagePath, pageTitle = '') {
        if (!this.events.pageViews[pagePath]) {
            this.events.pageViews[pagePath] = {
                count: 0,
                firstSeen: new Date().toISOString(),
                lastSeen: new Date().toISOString()
            };
        }

        this.events.pageViews[pagePath].count++;
        this.events.pageViews[pagePath].lastSeen = new Date().toISOString();

        this.trackEvent('page_view', {
            page_path: pagePath,
            page_title: pageTitle
        });
    }

    /**
     * Get analytics summary
     */
    getSummary() {
        const totalPageViews = Object.values(this.events.pageViews)
            .reduce((sum, pv) => sum + pv.count, 0);
        
        const eventCounts = {};
        Object.keys(this.events.customEvents).forEach(eventName => {
            eventCounts[eventName] = this.events.customEvents[eventName].length;
        });

        return {
            enabled: this.enabled,
            ga4Id: this.ga4Id,
            totalPageViews,
            totalEvents: this.events.events.length,
            eventCounts,
            topPages: Object.entries(this.events.pageViews)
                .sort((a, b) => b[1].count - a[1].count)
                .slice(0, 10)
                .map(([path, data]) => ({ path, views: data.count }))
        };
    }

    /**
     * Generate analytics report
     */
    getReport() {
        const summary = this.getSummary();
        const recentEvents = this.events.events.slice(-50);

        return {
            summary,
            recentEvents
        };
    }
}

module.exports = AnalyticsManager;
