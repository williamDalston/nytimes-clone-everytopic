const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Disk-based cache for LLM responses
 * Based on Marketing System's caching approach
 */
class ArticleCache {
    constructor(cacheDir = path.join(__dirname, '../data/cache')) {
        this.cacheDir = cacheDir;
        if (!fs.existsSync(this.cacheDir)) {
            fs.mkdirSync(this.cacheDir, { recursive: true });
        }
    }

    /**
     * Generate cache key from topic and prompt version
     */
    _getCacheKey(topic, promptVersion = 'v1') {
        const keyString = `${topic}_${promptVersion}`;
        return crypto.createHash('md5').update(keyString).digest('hex');
    }

    /**
     * Get cached article if it exists
     * Phase 2: Enhanced error handling with corruption recovery
     */
    get(topic, promptVersion = 'v1') {
        const cacheKey = this._getCacheKey(topic, promptVersion);
        const cacheFile = path.join(this.cacheDir, `${cacheKey}.json`);

        if (fs.existsSync(cacheFile)) {
            try {
                const fileContent = fs.readFileSync(cacheFile, 'utf8');
                
                // Check if file is empty or too small
                if (!fileContent || fileContent.trim().length === 0) {
                    console.warn(`⚠️ Cache file is empty, removing: ${cacheFile}`);
                    this._removeCorruptedCache(cacheFile);
                    return null;
                }
                
                const cacheData = JSON.parse(fileContent);
                
                // Validate cache structure
                if (!cacheData || typeof cacheData !== 'object') {
                    console.warn(`⚠️ Invalid cache structure, removing: ${cacheFile}`);
                    this._removeCorruptedCache(cacheFile);
                    return null;
                }
                
                // Check if cache has required fields
                if (!cacheData.article && !cacheData.topic) {
                    console.warn(`⚠️ Cache missing required fields, removing: ${cacheFile}`);
                    this._removeCorruptedCache(cacheFile);
                    return null;
                }
                
                console.log(`📦 Cache hit for: ${topic}`);
                return cacheData;
            } catch (e) {
                // Handle JSON parsing errors (corrupted cache)
                if (e instanceof SyntaxError) {
                    console.warn(`⚠️ Corrupted cache file detected, removing: ${cacheFile}`);
                    this._removeCorruptedCache(cacheFile);
                } else {
                    console.warn(`⚠️ Error reading cache file: ${e.message}`);
                }
                return null;
            }
        }
        return null;
    }
    
    /**
     * Remove corrupted cache file
     */
    _removeCorruptedCache(cacheFile) {
        try {
            if (fs.existsSync(cacheFile)) {
                fs.unlinkSync(cacheFile);
                console.log(`🗑️ Removed corrupted cache file`);
            }
        } catch (e) {
            console.error(`❌ Failed to remove corrupted cache: ${e.message}`);
        }
    }

    /**
     * Save article to cache
     */
    set(topic, article, promptVersion = 'v1') {
        const cacheKey = this._getCacheKey(topic, promptVersion);
        const cacheFile = path.join(this.cacheDir, `${cacheKey}.json`);

        const cacheData = {
            topic,
            promptVersion,
            article,
            cachedAt: new Date().toISOString()
        };

        try {
            fs.writeFileSync(cacheFile, JSON.stringify(cacheData, null, 2));
            console.log(`💾 Cached article for: ${topic}`);
        } catch (e) {
            console.warn(`⚠️ Error writing cache file: ${e.message}`);
        }
    }

    /**
     * Clear all cached articles
     */
    clear() {
        if (fs.existsSync(this.cacheDir)) {
            const files = fs.readdirSync(this.cacheDir);
            files.forEach(file => {
                if (file.endsWith('.json')) {
                    fs.unlinkSync(path.join(this.cacheDir, file));
                }
            });
            console.log('🗑️ Cache cleared');
        }
    }

    /**
     * Get cache stats
     */
    stats() {
        if (!fs.existsSync(this.cacheDir)) {
            return { count: 0, size: 0 };
        }

        const files = fs.readdirSync(this.cacheDir).filter(f => f.endsWith('.json'));
        let totalSize = 0;

        files.forEach(file => {
            const filePath = path.join(this.cacheDir, file);
            const stats = fs.statSync(filePath);
            totalSize += stats.size;
        });

        return {
            count: files.length,
            size: totalSize,
            sizeMB: (totalSize / 1024 / 1024).toFixed(2)
        };
    }
}

module.exports = ArticleCache;

