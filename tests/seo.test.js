/**
 * Phase 1.6: Unit Tests for SEO Optimizer
 * Standalone test suite (no testing framework required)
 */

const SEOOptimizer = require('../generator/seo-optimizer');

// Simple test runner
function runTests() {
    let passed = 0;
    let failed = 0;
    const failures = [];

    function test(name, fn) {
        try {
            fn();
            passed++;
            console.log(`  ✅ ${name}`);
        } catch (error) {
            failed++;
            failures.push({ name, error: error.message });
            console.log(`  ❌ ${name}: ${error.message}`);
        }
    }

    function expect(value) {
        return {
            toBe: (expected) => {
                if (value !== expected) {
                    throw new Error(`Expected ${expected}, got ${value}`);
                }
            },
            toHaveProperty: (prop) => {
                if (!(prop in value)) {
                    throw new Error(`Expected property ${prop}`);
                }
            },
            toBeGreaterThanOrEqual: (expected) => {
                if (value < expected) {
                    throw new Error(`Expected >= ${expected}, got ${value}`);
                }
            },
            toBeLessThanOrEqual: (expected) => {
                if (value > expected) {
                    throw new Error(`Expected <= ${expected}, got ${value}`);
                }
            },
            not: {
                toContain: (str) => {
                    if (value.includes(str)) {
                        throw new Error(`Expected not to contain ${str}`);
                    }
                }
            }
        };
    }

    console.log('Running SEO Optimizer Tests...\n');

    const optimizer = new SEOOptimizer();
    const siteConfig = {
        name: 'Test Site',
        domain: 'https://example.com'
    };

    test('should analyze article SEO comprehensively', () => {
        const article = {
            title: 'Perfect Title Length Between 30-60 Characters',
            excerpt: 'This is a perfect meta description length between 120-160 characters which is optimal for search engines.',
            content: '<h1>Heading</h1><p>Content paragraph one.</p><p>Content paragraph two.</p>',
            image: 'https://example.com/image.jpg',
            author: 'Test Author',
            date: '2024-01-01',
            category: 'Test'
        };

        const result = optimizer.analyzeArticle(article);
        
        expect(result).toHaveProperty('title');
        expect(result).toHaveProperty('meta');
        expect(result).toHaveProperty('content');
        expect(result).toHaveProperty('structure');
        expect(result).toHaveProperty('images');
        expect(result).toHaveProperty('url');
        expect(result).toHaveProperty('overall');
        expect(result.overall.score).toBeGreaterThanOrEqual(0);
        expect(result.overall.score).toBeLessThanOrEqual(100);
    });

    test('should analyze title optimization', () => {
        const title = 'Perfect Title Length Between 30-60 Characters';
        const result = optimizer.analyzeTitle(title);
        
        expect(result).toHaveProperty('length');
        expect(result).toHaveProperty('score');
        expect(result).toHaveProperty('optimal');
        expect(result.length).toBe(title.length);
    });

    test('should generate valid JSON-LD structured data', () => {
        const article = {
            title: 'Test Article',
            excerpt: 'Test excerpt',
            image: 'https://example.com/image.jpg',
            author: 'Test Author',
            date: '2024-01-01',
            category: 'Test'
        };

        const structuredData = optimizer.generateStructuredData(article, siteConfig);
        
        expect(structuredData['@context']).toBe('https://schema.org');
        expect(structuredData['@type']).toBe('Article');
        expect(structuredData.headline).toBe(article.title);
        expect(structuredData.description).toBe(article.excerpt);
        expect(structuredData.author).toHaveProperty('@type');
        expect(structuredData.publisher).toHaveProperty('@type');
    });

    test('should generate Open Graph meta tags', () => {
        const article = {
            title: 'Test Article',
            excerpt: 'Test excerpt',
            image: 'https://example.com/image.jpg',
            author: 'Test Author',
            date: '2024-01-01',
            category: 'Test'
        };

        const tags = optimizer.generateOpenGraphTags(article, siteConfig);
        
        expect(tags['og:type']).toBe('article');
        expect(tags['og:title']).toBe(article.title);
        expect(tags['og:description']).toBe(article.excerpt);
        expect(tags['og:image']).toBe(article.image);
    });

    test('should convert title to URL slug correctly', () => {
        const title = 'Test Article Title With Spaces!';
        const slug = optimizer.titleToSlug(title);
        
        expect(slug).toBe('test-article-title-with-spaces');
        expect(slug).not.toContain(' ');
        expect(slug).not.toContain('!');
    });

    console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);
    
    if (failed > 0) {
        console.log('\n❌ Failures:');
        failures.forEach(f => {
            console.log(`  - ${f.name}: ${f.error}`);
        });
        process.exit(1);
    }
    
    console.log('\n✅ All SEO tests passed!');
}

// Run tests if executed directly
if (require.main === module) {
    const siteConfig = {
        name: 'Test Site',
        domain: 'https://example.com'
    };

    const testArticle = {
        title: 'Test Article Title With Optimal Length',
        excerpt: 'This is a test excerpt that is between 120-160 characters in length which is optimal for meta descriptions and social media sharing.',
        content: '<h1>Main Heading</h1><p>First paragraph.</p><h2>Subheading</h2><p>Second paragraph.</p>',
        image: 'https://example.com/image.jpg',
        author: 'Test Author',
        date: '2024-01-01',
        category: 'Test'
    };

    runTests();
    
    // Also run demo
    console.log('\n--- SEO Optimization Demo ---\n');
    const demoOptimizer = new SEOOptimizer();
    const analysis = demoOptimizer.analyzeArticle(testArticle);
    
    console.log('Overall SEO Score:', analysis.overall.score.toFixed(2));
    console.log('Grade:', analysis.overall.grade);
    console.log('\nComponent Scores:');
    console.log('  Title:', analysis.title.score.toFixed(2));
    console.log('  Meta:', analysis.meta.score.toFixed(2));
    console.log('  Content:', analysis.content.score.toFixed(2));
    console.log('  Structure:', analysis.structure.score.toFixed(2));
    console.log('  Images:', analysis.images.score.toFixed(2));
    console.log('  URL:', analysis.url.score.toFixed(2));
    
    if (analysis.overall.issues.length > 0) {
        console.log('\nIssues:');
        analysis.overall.issues.forEach((issue, i) => {
            console.log(`  ${i + 1}. ${issue}`);
        });
    }
    
    if (analysis.overall.recommendations.length > 0) {
        console.log('\nRecommendations:');
        analysis.overall.recommendations.forEach((rec, i) => {
            console.log(`  ${i + 1}. ${rec}`);
        });
    }
}

module.exports = { SEOOptimizer };

