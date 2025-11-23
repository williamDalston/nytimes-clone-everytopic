/**
 * Performance Monitoring
 * Tracks Core Web Vitals and performance metrics
 * Phase 4: Performance Monitoring
 */

class PerformanceMonitor {
    constructor() {
        this.metrics = {
            LCP: null, // Largest Contentful Paint
            FID: null, // First Input Delay
            CLS: null, // Cumulative Layout Shift
            FCP: null, // First Contentful Paint
            TTFB: null, // Time to First Byte
            TTI: null // Time to Interactive
        };
    }

    /**
     * Generate performance monitoring script
     */
    generateMonitoringScript() {
        return `
    <!-- Performance Monitoring - Core Web Vitals -->
    <script>
        // Track Core Web Vitals with error handling
        (function() {
            if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
                return; // Not in browser or not supported
            }
            
            try {
            // Largest Contentful Paint (LCP)
            try {
                const lcpObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'web_vitals', {
                            event_category: 'Web Vitals',
                            event_label: 'LCP',
                            value: Math.round(lastEntry.renderTime || lastEntry.loadTime),
                            non_interaction: true
                        });
                    }
                });
                lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
            } catch (e) {
                console.warn('LCP observer not supported');
            }

            // First Input Delay (FID)
            try {
                const fidObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach((entry) => {
                        if (typeof gtag !== 'undefined') {
                            gtag('event', 'web_vitals', {
                                event_category: 'Web Vitals',
                                event_label: 'FID',
                                value: Math.round(entry.processingStart - entry.startTime),
                                non_interaction: true
                            });
                        }
                    });
                });
                fidObserver.observe({ entryTypes: ['first-input'] });
            } catch (e) {
                console.warn('FID observer not supported');
            }

            // Cumulative Layout Shift (CLS)
            try {
                let clsValue = 0;
                let clsEntries = [];
                let sessionValue = 0;
                let sessionEntries = [];

                const clsObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (!entry.hadRecentInput) {
                            const firstSessionEntry = sessionEntries[0];
                            const lastSessionEntry = sessionEntries[sessionEntries.length - 1];
                            
                            if (sessionValue && 
                                entry.startTime - lastSessionEntry.startTime < 1000 &&
                                entry.startTime - firstSessionEntry.startTime < 5000) {
                                sessionValue += entry.value;
                                sessionEntries.push(entry);
                            } else {
                                sessionValue = entry.value;
                                sessionEntries = [entry];
                            }
                            
                            if (sessionValue > clsValue) {
                                clsValue = sessionValue;
                                clsEntries = [...sessionEntries];
                                
                                if (typeof gtag !== 'undefined') {
                                    gtag('event', 'web_vitals', {
                                        event_category: 'Web Vitals',
                                        event_label: 'CLS',
                                        value: Math.round(clsValue * 1000),
                                        non_interaction: true
                                    });
                                }
                            }
                        }
                    }
                });
                clsObserver.observe({ entryTypes: ['layout-shift'] });
            } catch (e) {
                console.warn('CLS observer not supported');
            }

            // First Contentful Paint (FCP)
            try {
                const fcpObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach((entry) => {
                        if (entry.name === 'first-contentful-paint') {
                            if (typeof gtag !== 'undefined') {
                                gtag('event', 'web_vitals', {
                                    event_category: 'Web Vitals',
                                    event_label: 'FCP',
                                    value: Math.round(entry.startTime),
                                    non_interaction: true
                                });
                            }
                        }
                    });
                });
                fcpObserver.observe({ entryTypes: ['paint'] });
            } catch (e) {
                console.warn('FCP observer not supported');
            }
        }

        // Track page load performance
        window.addEventListener('load', function() {
            if (window.performance && window.performance.timing) {
                const timing = window.performance.timing;
                const navigation = window.performance.navigation;
                
                // Time to First Byte (TTFB)
                const ttfb = timing.responseStart - timing.navigationStart;
                
                // Time to Interactive (TTI) - approximate
                const domInteractive = timing.domInteractive - timing.navigationStart;
                const domComplete = timing.domComplete - timing.navigationStart;
                
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'page_performance', {
                        event_category: 'Performance',
                        event_label: 'TTFB',
                        value: Math.round(ttfb),
                        non_interaction: true
                    });
                    
                    gtag('event', 'page_performance', {
                        event_category: 'Performance',
                        event_label: 'DOM_Interactive',
                        value: Math.round(domInteractive),
                        non_interaction: true
                    });
                    
                    gtag('event', 'page_performance', {
                        event_category: 'Performance',
                        event_label: 'DOM_Complete',
                        value: Math.round(domComplete),
                        non_interaction: true
                    });
                }
            }
        } catch (e) {
            console.warn('Performance monitoring error:', e);
        }
        })();
    </script>
        `.trim();
    }

    /**
     * Get performance summary
     */
    getSummary() {
        return {
            metrics: this.metrics,
            hasData: Object.values(this.metrics).some(v => v !== null)
        };
    }
}

module.exports = PerformanceMonitor;

