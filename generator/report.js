#!/usr/bin/env node
/**
 * Reporting Script
 * Generates reports for costs, analytics, and performance
 * Phase 4: Analytics & Reporting
 */

// Load environment variables if dotenv is available
try {
    require('dotenv').config();
} catch (e) {
    // dotenv not available, continue without it
}

const CostTracker = require('./cost-tracker');
const AnalyticsManager = require('./analytics');
const config = require('./config');

// Initialize managers
const costTracker = new CostTracker({
    dataDir: config.costTracking?.dataDir || 'data',
    budget: config.costTracking?.budget
});

const analyticsManager = new AnalyticsManager({
    ga4Id: config.analytics?.ga4Id,
    enabled: config.analytics?.enabled
});

/**
 * Generate comprehensive report
 */
function generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 PHASE 4 REPORT - Scale & Polish');
    console.log('='.repeat(60) + '\n');

    // Cost Report
    console.log('💰 COST TRACKING');
    console.log('-'.repeat(60));
    const costReport = costTracker.getReport();
    
    console.log(`Total Cost: $${costReport.summary.total.toFixed(4)}`);
    console.log(`Today's Cost: $${costReport.summary.today.toFixed(4)}`);
    console.log(`Articles Generated: ${costReport.summary.articleCount}`);
    
    if (costReport.summary.budget) {
        const usagePercent = (costReport.summary.total / costReport.summary.budget) * 100;
        console.log(`Budget: $${costReport.summary.budget.toFixed(4)} (${usagePercent.toFixed(1)}% used)`);
        console.log(`Remaining: $${costReport.summary.remaining.toFixed(4)}`);
        
        if (usagePercent > 80) {
            console.log('⚠️  Warning: Budget usage exceeds 80%!');
        }
    }
    
    console.log('\nCost Breakdown:');
    Object.entries(costReport.summary.byType).forEach(([type, cost]) => {
        if (costReport.summary.total > 0) {
            const percent = (cost / costReport.summary.total) * 100;
            console.log(`  ${type.toUpperCase()}: $${cost.toFixed(4)} (${percent.toFixed(1)}%)`);
        } else {
            console.log(`  ${type.toUpperCase()}: $${cost.toFixed(4)}`);
        }
    });
    
    if (Object.keys(costReport.summary.byModel).length > 0) {
        console.log('\nCost by Model:');
        Object.entries(costReport.summary.byModel).forEach(([model, cost]) => {
            console.log(`  ${model}: $${cost.toFixed(4)}`);
        });
    }
    
    if (costReport.topArticles.length > 0) {
        console.log('\nTop 10 Most Expensive Articles:');
        costReport.topArticles.forEach((item, index) => {
            console.log(`  ${index + 1}. ${item.articleId}: $${item.cost.toFixed(4)}`);
        });
    }
    
    console.log('\nLast 7 Days:');
    costReport.dailyBreakdown.forEach(day => {
        console.log(`  ${day.date}: $${day.cost.toFixed(4)}`);
    });

    // Analytics Summary
    console.log('\n📈 ANALYTICS SUMMARY');
    console.log('-'.repeat(60));
    const analyticsSummary = analyticsManager.getSummary();
    console.log(`Enabled: ${analyticsSummary.enabled ? 'Yes' : 'No'}`);
    if (analyticsSummary.enabled) {
        console.log(`GA4 ID: ${analyticsSummary.ga4Id || 'Not configured'}`);
        console.log(`Total Page Views: ${analyticsSummary.totalPageViews}`);
        console.log(`Total Events: ${analyticsSummary.totalEvents}`);
        
        if (analyticsSummary.totalPageViews > 0) {
            const avgEventsPerPage = analyticsSummary.totalEvents / analyticsSummary.totalPageViews;
            console.log(`Average Events per Page: ${avgEventsPerPage.toFixed(2)}`);
        }
        
        if (Object.keys(analyticsSummary.eventCounts).length > 0) {
            console.log('\nEvent Counts:');
            const sortedEvents = Object.entries(analyticsSummary.eventCounts)
                .sort((a, b) => b[1] - a[1]);
            sortedEvents.forEach(([event, count]) => {
                if (analyticsSummary.totalEvents > 0) {
                    const percent = (count / analyticsSummary.totalEvents) * 100;
                    console.log(`  ${event}: ${count} (${percent.toFixed(1)}%)`);
                } else {
                    console.log(`  ${event}: ${count}`);
                }
            });
        }
        
        if (analyticsSummary.topPages.length > 0) {
            console.log('\nTop 10 Pages:');
            analyticsSummary.topPages.forEach((page, index) => {
                if (analyticsSummary.totalPageViews > 0) {
                    const percent = (page.views / analyticsSummary.totalPageViews) * 100;
                    console.log(`  ${index + 1}. ${page.path}: ${page.views} views (${percent.toFixed(1)}%)`);
                } else {
                    console.log(`  ${index + 1}. ${page.path}: ${page.views} views`);
                }
            });
        }
    } else {
        console.log('Analytics not enabled. Set GA4_MEASUREMENT_ID to enable.');
    }

    // Performance Metrics Summary
    console.log('\n⚡ PERFORMANCE MONITORING');
    console.log('-'.repeat(60));
    console.log('Performance monitoring is active and tracking Core Web Vitals.');
    console.log('Metrics are sent to Google Analytics 4 when enabled.');
    console.log('Tracked metrics: LCP, FID, CLS, FCP, TTFB, TTI');

    // Summary Statistics
    console.log('\n📊 SUMMARY STATISTICS');
    console.log('-'.repeat(60));
    if (costReport.summary.articleCount > 0) {
        const avgCostPerArticle = costReport.summary.total / costReport.summary.articleCount;
        console.log(`Average Cost per Article: $${avgCostPerArticle.toFixed(4)}`);
    }
    
    if (analyticsSummary.totalPageViews > 0 && costReport.summary.total > 0) {
        const costPerView = costReport.summary.total / analyticsSummary.totalPageViews;
        console.log(`Cost per Page View: $${costPerView.toFixed(4)}`);
    }
    
    console.log(`Total Articles: ${costReport.summary.articleCount}`);
    console.log(`Total Page Views: ${analyticsSummary.totalPageViews}`);
    console.log(`Total Events: ${analyticsSummary.totalEvents}`);

    // Performance Summary
    console.log('\n⚡ PERFORMANCE MONITORING');
    console.log('-'.repeat(60));
    console.log('Performance metrics are tracked via Core Web Vitals');
    console.log('View metrics in Google Analytics 4 dashboard:');
    console.log('  - LCP (Largest Contentful Paint)');
    console.log('  - FID (First Input Delay)');
    console.log('  - CLS (Cumulative Layout Shift)');
    console.log('  - FCP (First Contentful Paint)');
    console.log('  - TTFB (Time to First Byte)');
    console.log('  - DOM Interactive/Complete timing');

    console.log('\n' + '='.repeat(60));
    console.log('✅ Report complete!');
    console.log('='.repeat(60) + '\n');
}

// Run report
generateReport();

