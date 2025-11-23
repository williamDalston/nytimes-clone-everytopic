/**
 * Cost Tracking System
 * Tracks API costs for LLM and image generation
 * Priority 7: Cost Tracking from comparison analysis
 */

const fs = require('fs');
const path = require('path');

// OpenAI pricing (per 1K tokens) as of 2024
const PRICING = {
    'gpt-4o-mini': {
        input: 0.00015,  // $0.15 per 1M tokens
        output: 0.0006   // $0.60 per 1M tokens
    },
    'gpt-4o': {
        input: 0.005,    // $5 per 1M tokens
        output: 0.015    // $15 per 1M tokens
    },
    'gpt-4-turbo': {
        input: 0.01,     // $10 per 1M tokens
        output: 0.03     // $30 per 1M tokens
    },
    'gpt-3.5-turbo': {
        input: 0.0005,   // $0.50 per 1M tokens
        output: 0.0015   // $1.50 per 1M tokens
    },
    // Image generation (Nano Banana / Gemini)
    'image': {
        perImage: 0.02   // $0.02 per image (estimated)
    }
};

class CostTracker {
    constructor(options = {}) {
        this.dataDir = options.dataDir || path.join(__dirname, '../data');
        this.costFile = path.join(this.dataDir, 'costs.json');
        this.budget = options.budget || null; // Optional budget limit
        
        // Ensure data directory exists
        if (!fs.existsSync(this.dataDir)) {
            fs.mkdirSync(this.dataDir, { recursive: true });
        }
        
        // Load existing costs
        this.costs = this.loadCosts();
    }

    /**
     * Load cost data from file
     */
    loadCosts() {
        if (fs.existsSync(this.costFile)) {
            try {
                const data = JSON.parse(fs.readFileSync(this.costFile, 'utf8'));
                return data;
            } catch (error) {
                console.warn('⚠️ Error loading cost data:', error.message);
            }
        }
        
        return {
            total: 0,
            byDate: {},
            byArticle: {},
            byModel: {},
            byType: { llm: 0, image: 0 },
            history: []
        };
    }

    /**
     * Save cost data to file
     */
    saveCosts() {
        try {
            fs.writeFileSync(this.costFile, JSON.stringify(this.costs, null, 2));
        } catch (error) {
            console.error('❌ Error saving cost data:', error.message);
        }
    }

    /**
     * Calculate cost for LLM API call
     */
    calculateLLMCost(model, inputTokens, outputTokens) {
        const pricing = PRICING[model] || PRICING['gpt-4o-mini'];
        const inputCost = (inputTokens / 1000) * pricing.input;
        const outputCost = (outputTokens / 1000) * pricing.output;
        return inputCost + outputCost;
    }

    /**
     * Calculate cost for image generation
     */
    calculateImageCost(count = 1) {
        return count * PRICING.image.perImage;
    }

    /**
     * Track LLM API cost
     */
    trackLLMCost(model, inputTokens, outputTokens, articleId = null) {
        const cost = this.calculateLLMCost(model, inputTokens, outputTokens);
        return this.recordCost(cost, {
            type: 'llm',
            model,
            inputTokens,
            outputTokens,
            articleId
        });
    }

    /**
     * Track image generation cost
     */
    trackImageCost(count = 1, articleId = null) {
        const cost = this.calculateImageCost(count);
        return this.recordCost(cost, {
            type: 'image',
            count,
            articleId
        });
    }

    /**
     * Record a cost entry
     */
    recordCost(cost, metadata = {}) {
        try {
            // Validate cost
            if (typeof cost !== 'number' || isNaN(cost) || cost < 0) {
                console.warn(`⚠️ Invalid cost value: ${cost}. Skipping cost tracking.`);
                return 0;
            }
            
            const date = new Date().toISOString().split('T')[0];
            const timestamp = new Date().toISOString();
            
            // Update totals
            this.costs.total += cost;
        
        // Update by date
        if (!this.costs.byDate[date]) {
            this.costs.byDate[date] = 0;
        }
        this.costs.byDate[date] += cost;
        
        // Update by article
        if (metadata.articleId) {
            if (!this.costs.byArticle[metadata.articleId]) {
                this.costs.byArticle[metadata.articleId] = 0;
            }
            this.costs.byArticle[metadata.articleId] += cost;
        }
        
        // Update by model
        if (metadata.model) {
            if (!this.costs.byModel[metadata.model]) {
                this.costs.byModel[metadata.model] = 0;
            }
            this.costs.byModel[metadata.model] += cost;
        }
        
        // Update by type
        if (metadata.type) {
            this.costs.byType[metadata.type] = (this.costs.byType[metadata.type] || 0) + cost;
        }
        
        // Add to history
        this.costs.history.push({
            cost,
            timestamp,
            ...metadata
        });
        
        // Check budget with warnings at 90% and 100%
        if (this.budget) {
            const budgetUsed = (this.costs.total / this.budget) * 100;
            if (this.costs.total >= this.budget) {
                console.warn(`⚠️ Budget limit reached: $${this.costs.total.toFixed(4)} / $${this.budget.toFixed(4)} (100%)`);
            } else if (budgetUsed >= 90) {
                console.warn(`⚠️ Budget warning: $${this.costs.total.toFixed(4)} / $${this.budget.toFixed(4)} (${budgetUsed.toFixed(1)}%)`);
            }
        }
        
            // Save to file
            this.saveCosts();
            
            return cost;
        } catch (error) {
            // Don't let cost tracking errors break the build
            console.warn(`⚠️ Cost tracking error: ${error.message}. Continuing without tracking.`);
            return 0;
        }
    }

    /**
     * Get cost summary
     */
    getSummary() {
        const today = new Date().toISOString().split('T')[0];
        const todayCost = this.costs.byDate[today] || 0;
        
        return {
            total: this.costs.total,
            today: todayCost,
            byType: this.costs.byType,
            byModel: this.costs.byModel,
            budget: this.budget,
            remaining: this.budget ? Math.max(0, this.budget - this.costs.total) : null,
            articleCount: Object.keys(this.costs.byArticle).length
        };
    }

    /**
     * Get cost report
     */
    getReport() {
        const summary = this.getSummary();
        const recentHistory = this.costs.history.slice(-20); // Last 20 entries
        
        return {
            summary,
            recentHistory,
            topArticles: Object.entries(this.costs.byArticle)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
                .map(([id, cost]) => ({ articleId: id, cost })),
            dailyBreakdown: Object.entries(this.costs.byDate)
                .sort((a, b) => b[0].localeCompare(a[0]))
                .slice(0, 7)
                .map(([date, cost]) => ({ date, cost }))
        };
    }

    /**
     * Print cost report to console
     */
    printReport() {
        const report = this.getReport();
        
        console.log('\n💰 Cost Report');
        console.log('='.repeat(50));
        console.log(`Total Cost: $${report.summary.total.toFixed(4)}`);
        console.log(`Today's Cost: $${report.summary.today.toFixed(4)}`);
        console.log(`Articles Generated: ${report.summary.articleCount}`);
        
        if (report.summary.budget) {
            console.log(`Budget: $${report.summary.budget.toFixed(4)}`);
            console.log(`Remaining: $${report.summary.remaining.toFixed(4)}`);
        }
        
        console.log('\nBy Type:');
        Object.entries(report.summary.byType).forEach(([type, cost]) => {
            console.log(`  ${type}: $${cost.toFixed(4)}`);
        });
        
        console.log('\nBy Model:');
        Object.entries(report.summary.byModel).forEach(([model, cost]) => {
            console.log(`  ${model}: $${cost.toFixed(4)}`);
        });
        
        if (report.topArticles.length > 0) {
            console.log('\nTop Articles by Cost:');
            report.topArticles.forEach((item, index) => {
                console.log(`  ${index + 1}. Article ${item.articleId}: $${item.cost.toFixed(4)}`);
            });
        }
        
        console.log('\nLast 7 Days:');
        report.dailyBreakdown.forEach(day => {
            console.log(`  ${day.date}: $${day.cost.toFixed(4)}`);
        });
        
        console.log('='.repeat(50) + '\n');
    }

    /**
     * Reset costs (use with caution)
     */
    reset() {
        this.costs = {
            total: 0,
            byDate: {},
            byArticle: {},
            byModel: {},
            byType: { llm: 0, image: 0 },
            history: []
        };
        this.saveCosts();
    }
}

module.exports = CostTracker;
