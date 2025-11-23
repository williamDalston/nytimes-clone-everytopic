/**
 * Phase 1.6: Unit Tests for Quality Scoring System
 * Standalone test suite (no testing framework required)
 */

const ArticleQualityScorer = require('../generator/quality');

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

    console.log('Running Quality Scoring Tests...\n');

    const scorer = new ArticleQualityScorer();

    test('should score an article with all required fields', () => {
        const article = {
            title: 'Test Article Title',
            excerpt: 'This is a test excerpt that is long enough to be valid.',
            content: '<p>This is test content with multiple paragraphs.</p><p>Another paragraph here.</p>',
            author: 'Test Author',
            category: 'Test Category',
            readTime: '5 min read'
        };

        const result = scorer.scoreArticle(article);
        
        expect(result).toHaveProperty('scores');
        expect(result).toHaveProperty('grade');
        expect(result).toHaveProperty('recommendations');
        expect(result.scores.overall).toBeGreaterThanOrEqual(0);
        expect(result.scores.overall).toBeLessThanOrEqual(100);
    });

    test('should handle missing fields gracefully', () => {
        const article = {
            title: 'Minimal Article'
        };

        const result = scorer.scoreArticle(article);
        
        expect(result).toHaveProperty('scores');
        expect(result.scores.overall).toBeGreaterThanOrEqual(0);
    });

    test('should return readability score between 0-100', () => {
        const article = {
            title: 'Test Title',
            excerpt: 'Test excerpt',
            content: '<p>This is a test paragraph with multiple sentences. It has good readability. The sentences are not too long.</p>'
        };

        const score = scorer.scoreReadability(article);
        
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
    });

    test('should score SEO elements correctly', () => {
        const article = {
            title: 'Perfect Title Length Between 30-60 Characters',
            excerpt: 'This is a perfect meta description length between 120-160 characters which is optimal for search engines and social media sharing.',
            content: '<p>Content with sufficient length</p>'.repeat(50),
            image: 'https://example.com/image.jpg'
        };

        const result = scorer.scoreSEO(article);
        
        expect(result).toHaveProperty('score');
        expect(result).toHaveProperty('checks');
        expect(result.score).toBeGreaterThanOrEqual(0);
        expect(result.score).toBeLessThanOrEqual(100);
    });

    test('should return correct grade for scores', () => {
        expect(scorer.getGrade(95)).toBe('A+');
        expect(scorer.getGrade(85)).toBe('A');
        expect(scorer.getGrade(75)).toBe('B');
        expect(scorer.getGrade(65)).toBe('C');
        expect(scorer.getGrade(55)).toBe('D');
        expect(scorer.getGrade(45)).toBe('F');
    });

    test('should remove HTML tags correctly', () => {
        const html = '<p>Hello <strong>world</strong></p>';
        const result = scorer.stripHTML(html);
        
        expect(result).toBe('Hello world');
        expect(result).not.toContain('<');
        expect(result).not.toContain('>');
    });

    test('should count words correctly', () => {
        const text = '<p>This is a test with five words.</p>';
        const count = scorer.getWordCount(text);
        
        expect(count).toBe(7); // This, is, a, test, with, five, words
    });

    console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);
    
    if (failed > 0) {
        console.log('\n❌ Failures:');
        failures.forEach(f => {
            console.log(`  - ${f.name}: ${f.error}`);
        });
        process.exit(1);
    }
    
    console.log('\n✅ All quality tests passed!');
}

// Run tests if executed directly
if (require.main === module) {
    const scorer = new ArticleQualityScorer();
    
    const testArticle = {
        title: 'Test Article Title',
        excerpt: 'This is a test excerpt for quality scoring system validation.',
        content: '<p>Test content paragraph one.</p><p>Test content paragraph two.</p><h2>Test Heading</h2><p>More content here.</p>',
        author: 'Test Author',
        category: 'Test',
        readTime: '5 min read',
        image: 'https://example.com/image.jpg'
    };

    console.log('Testing Article Quality Scorer...\n');
    const result = scorer.scoreArticle(testArticle);
    
    console.log('Quality Score:', result.scores.overall.toFixed(2));
    console.log('Grade:', result.grade);
    console.log('\nDetailed Scores:');
    console.log('  Readability:', result.scores.readability.toFixed(2));
    console.log('  SEO:', typeof result.scores.seo === 'object' ? result.scores.seo.score.toFixed(2) : result.scores.seo.toFixed(2));
    console.log('  Structure:', result.scores.structure.toFixed(2));
    console.log('  Engagement:', result.scores.engagement.toFixed(2));
    
    if (result.recommendations.length > 0) {
        console.log('\nRecommendations:');
        result.recommendations.forEach((rec, i) => {
            console.log(`  ${i + 1}. ${rec}`);
        });
    }
    
    console.log('\n✅ Quality scoring test complete!');
}

module.exports = { ArticleQualityScorer };

