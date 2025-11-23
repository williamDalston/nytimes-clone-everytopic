/**
 * Progress Bar Utility
 * Provides a unified progress bar interface for long-running operations
 */

const cliProgress = require('cli-progress');

class ProgressBar {
    constructor(options = {}) {
        this.bar = null;
        this.total = options.total || 100;
        this.current = 0;
        this.format = options.format || 'progress [{bar}] {percentage}% | {value}/{total} | {stage}';
        this.enabled = options.enabled !== false;
        
        if (this.enabled) {
            this.bar = new cliProgress.SingleBar({
                format: this.format,
                barCompleteChar: '\u2588',
                barIncompleteChar: '\u2591',
                hideCursor: true,
                clearOnComplete: true,
                stopOnComplete: true
            });
        }
    }

    /**
     * Start the progress bar
     * @param {number} total - Total number of steps
     * @param {number} startValue - Starting value (default: 0)
     * @param {object} payload - Initial payload data
     */
    start(total, startValue = 0, payload = {}) {
        this.total = total;
        this.current = startValue;
        
        if (this.bar) {
            this.bar.start(total, startValue, payload);
        }
    }

    /**
     * Update progress
     * @param {number} value - Current value
     * @param {object} payload - Additional data to display
     */
    update(value, payload = {}) {
        this.current = value;
        
        if (this.bar) {
            this.bar.update(value, payload);
        }
    }

    /**
     * Increment progress by a specific amount
     * @param {number} increment - Amount to increment (default: 1)
     * @param {object} payload - Additional data to display
     */
    increment(increment = 1, payload = {}) {
        this.current += increment;
        
        if (this.bar) {
            this.bar.increment(increment, payload);
        }
    }

    /**
     * Set the current stage/status
     * @param {string} stage - Stage name
     * @param {object} additionalPayload - Additional payload data
     */
    setStage(stage, additionalPayload = {}) {
        this.update(this.current, { stage, ...additionalPayload });
    }

    /**
     * Stop the progress bar
     */
    stop() {
        if (this.bar) {
            this.bar.stop();
        }
    }

    /**
     * Complete the progress bar (set to 100%)
     * @param {object} payload - Final payload data
     */
    complete(payload = {}) {
        this.update(this.total, { stage: 'Complete', ...payload });
        this.stop();
    }
}

/**
 * Create a multi-bar progress manager for tracking multiple operations
 */
class MultiProgressBar {
    constructor(options = {}) {
        this.multibar = null;
        this.bars = [];
        this.enabled = options.enabled !== false;
        
        if (this.enabled) {
            this.multibar = new cliProgress.MultiBar({
                format: options.format || 'progress [{bar}] {percentage}% | {value}/{total} | {stage}',
                barCompleteChar: '\u2588',
                barIncompleteChar: '\u2591',
                hideCursor: true,
                clearOnComplete: true,
                stopOnComplete: true
            });
        }
    }

    /**
     * Create a new progress bar
     * @param {number} total - Total number of steps
     * @param {number} startValue - Starting value
     * @param {object} payload - Initial payload
     * @returns {object} Progress bar instance
     */
    create(total, startValue = 0, payload = {}) {
        if (this.multibar) {
            const bar = this.multibar.create(total, startValue, payload);
            this.bars.push(bar);
            return bar;
        }
        return null;
    }

    /**
     * Stop all progress bars
     */
    stop() {
        if (this.multibar) {
            this.multibar.stop();
        }
    }
}

module.exports = {
    ProgressBar,
    MultiProgressBar
};

