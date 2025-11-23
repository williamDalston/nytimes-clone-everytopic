/**
 * Site Instance Manager
 * Manages multiple site instances, each with its own configuration and output directory
 * Allows generating different sites for different topics/niches
 */

const fs = require('fs');
const path = require('path');
const { SiteConfigManager } = require('./site-config');

class SiteInstanceManager {
    constructor(baseOutputDir = null) {
        this.baseOutputDir = baseOutputDir || path.join(__dirname, '../sites');
        this.configManager = new SiteConfigManager();
        this.activeInstance = null;
    }

    /**
     * Create a new site instance
     * @param {string} siteName - Unique name for the site (e.g., 'power-bi-news', 'tech-insights')
     * @param {object} configData - Site configuration data
     * @returns {object} Site instance info
     */
    createSiteInstance(siteName, configData = {}) {
        const siteDir = path.join(this.baseOutputDir, siteName);
        
        // Create site directory structure
        const dirs = [
            siteDir,
            path.join(siteDir, 'articles'),
            path.join(siteDir, 'images'),
            path.join(siteDir, 'data')
        ];
        
        dirs.forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });

        // Create or load site config
        let siteConfig;
        try {
            siteConfig = this.configManager.loadSiteConfig(siteName);
        } catch (e) {
            // Config doesn't exist, create it
            siteConfig = this.configManager.createSiteConfig(siteName, configData);
        }

        // Save instance metadata
        const instanceInfo = {
            name: siteName,
            directory: siteDir,
            config: siteConfig,
            createdAt: new Date().toISOString(),
            lastBuilt: null
        };

        const metadataPath = path.join(siteDir, '.site-instance.json');
        fs.writeFileSync(metadataPath, JSON.stringify(instanceInfo, null, 2));

        console.log(`✅ Created site instance: ${siteName}`);
        console.log(`   Directory: ${siteDir}`);

        return instanceInfo;
    }

    /**
     * Load a site instance
     * @param {string} siteName - Name of the site instance
     * @returns {object} Site instance info
     */
    loadSiteInstance(siteName) {
        const siteDir = path.join(this.baseOutputDir, siteName);
        const metadataPath = path.join(siteDir, '.site-instance.json');

        if (!fs.existsSync(metadataPath)) {
            throw new Error(`Site instance not found: ${siteName}`);
        }

        const instanceInfo = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
        instanceInfo.config = this.configManager.loadSiteConfig(siteName);
        instanceInfo.directory = siteDir;

        this.activeInstance = instanceInfo;
        return instanceInfo;
    }

    /**
     * Set active site instance
     * @param {string} siteName - Name of the site instance
     */
    setActiveInstance(siteName) {
        this.activeInstance = this.loadSiteInstance(siteName);
        return this.activeInstance;
    }

    /**
     * Get active site instance
     * @returns {object} Active site instance
     */
    getActiveInstance() {
        if (!this.activeInstance) {
            throw new Error('No active site instance. Use setActiveInstance() or loadSiteInstance() first.');
        }
        return this.activeInstance;
    }

    /**
     * List all site instances
     * @returns {array} Array of site instance names
     */
    listInstances() {
        if (!fs.existsSync(this.baseOutputDir)) {
            return [];
        }

        return fs.readdirSync(this.baseOutputDir)
            .filter(item => {
                const itemPath = path.join(this.baseOutputDir, item);
                return fs.statSync(itemPath).isDirectory() && 
                       fs.existsSync(path.join(itemPath, '.site-instance.json'));
            })
            .map(siteName => {
                try {
                    const instance = this.loadSiteInstance(siteName);
                    return {
                        name: siteName,
                        createdAt: instance.createdAt,
                        lastBuilt: instance.lastBuilt,
                        config: instance.config.identity.name
                    };
                } catch (e) {
                    return { name: siteName, error: e.message };
                }
            });
    }

    /**
     * Get site-specific output directory
     * @param {string} siteName - Optional site name, uses active instance if not provided
     * @returns {string} Output directory path
     */
    getOutputDir(siteName = null) {
        if (siteName) {
            const instance = this.loadSiteInstance(siteName);
            return instance.directory;
        }
        
        if (this.activeInstance) {
            return this.activeInstance.directory;
        }

        // Fallback to default dist directory
        return path.join(__dirname, '../dist');
    }

    /**
     * Update last built timestamp
     * @param {string} siteName - Optional site name, uses active instance if not provided
     */
    updateLastBuilt(siteName = null) {
        const instance = siteName ? this.loadSiteInstance(siteName) : this.getActiveInstance();
        instance.lastBuilt = new Date().toISOString();
        
        const metadataPath = path.join(instance.directory, '.site-instance.json');
        fs.writeFileSync(metadataPath, JSON.stringify(instance, null, 2));
    }

    /**
     * Get site configuration merged with main config
     * @param {string} siteName - Optional site name, uses active instance if not provided
     * @param {object} mainConfig - Main config object
     * @returns {object} Merged configuration
     */
    getMergedConfig(siteName = null, mainConfig) {
        const instance = siteName ? this.loadSiteInstance(siteName) : this.getActiveInstance();
        return this.configManager.mergeWithMainConfig(instance.config, mainConfig);
    }

    /**
     * Delete a site instance
     * @param {string} siteName - Name of the site instance to delete
     */
    deleteInstance(siteName) {
        const siteDir = path.join(this.baseOutputDir, siteName);
        
        if (!fs.existsSync(siteDir)) {
            throw new Error(`Site instance not found: ${siteName}`);
        }

        // Remove directory
        fs.rmSync(siteDir, { recursive: true, force: true });
        
        // Remove config if it exists
        try {
            const configPath = path.join(this.configManager.configDir, `${siteName}.json`);
            if (fs.existsSync(configPath)) {
                fs.unlinkSync(configPath);
            }
        } catch (e) {
            // Config might not exist, that's ok
        }

        console.log(`✅ Deleted site instance: ${siteName}`);
    }
}

module.exports = SiteInstanceManager;

