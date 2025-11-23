/**
 * Article Quality Scoring System
 * Evaluates articles on multiple dimensions: readability, SEO, originality, coherence
 */

class ArticleQualityScorer {
    constructor() {
        this.readabilityMetrics = {
            averageWordsPerSentence: { optimal: 15, max: 25, min: 10 },
            averageCharsPerWord: { optimal: 5, max: 7, min: 4 },
            sentenceCount: { optimal: 15, max: 30, min: 8 }
        };
    }

    /**
     * Score article on multiple quality dimensions
     */
    scoreArticle(article) {
        const scores = {
            readability: this.scoreReadability(article),
            seo: this.scoreSEO(article),
            structure: this.scoreStructure(article),
            engagement: this.scoreEngagement(article),
            overall: 0
        };

        // Calculate overall score (weighted average)
        // Handle SEO score which might be an object
        const seoScore = typeof scores.seo === 'object' && scores.seo.score !== undefined 
            ? scores.seo.score 
            : (typeof scores.seo === 'number' ? scores.seo : 0);
        
        scores.overall = (
            scores.readability * 0.3 +
            seoScore * 0.3 +
            scores.structure * 0.2 +
            scores.engagement * 0.2
        );

        return {
            scores: scores,
            grade: this.getGrade(scores.overall),
            recommendations: this.getRecommendations(scores, article)
        };
    }

    /**
     * Score readability using Flesch Reading Ease approximation
     */
    scoreReadability(article) {
        const content = this.stripHTML(article.content || '');
        const text = article.title + ' ' + article.excerpt + ' ' + content;
        
        const sentences = text.split(/[.!?]+\s/).filter(s => s.length > 0);
        const words = text.split(/\s+/).filter(w => w.length > 0);
        const syllables = this.estimateSyllables(words.join(' '));

        if (sentences.length === 0 || words.length === 0) {
            return 50; // Default score
        }

        const avgSentenceLength = words.length / sentences.length;
        const avgSyllablesPerWord = syllables / words.length;

        // Simplified Flesch Reading Ease
        const score = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
        
        // Normalize to 0-100 scale
        return Math.max(0, Math.min(100, score));
    }

    /**
     * Estimate syllables in text (simplified)
     */
    estimateSyllables(text) {
        text = text.toLowerCase();
        if (text.length <= 3) return 1;
        text = text.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
        text = text.replace(/^y/, '');
        const matches = text.match(/[aeiouy]{1,2}/g);
        return matches ? matches.length : 1;
    }

    /**
     * Score SEO optimization
     */
    scoreSEO(article) {
        let score = 0;
        const checks = [];

        // Title optimization (20 points)
        const titleLength = article.title?.length || 0;
        if (titleLength >= 30 && titleLength <= 60) {
            score += 20;
            checks.push({ item: 'Title length', status: 'good' });
        } else {
            checks.push({ item: 'Title length', status: 'needs improvement', message: `Title should be 30-60 characters (current: ${titleLength})` });
        }

        // Meta description optimization (20 points)
        const excerptLength = article.excerpt?.length || 0;
        if (excerptLength >= 120 && excerptLength <= 160) {
            score += 20;
            checks.push({ item: 'Meta description', status: 'good' });
        } else {
            checks.push({ item: 'Meta description', status: 'needs improvement', message: `Excerpt should be 120-160 characters (current: ${excerptLength})` });
        }

        // Content length (20 points)
        const wordCount = this.getWordCount(article.content || '');
        if (wordCount >= 300 && wordCount <= 5000) {
            score += 20;
            checks.push({ item: 'Content length', status: 'good' });
        } else {
            checks.push({ item: 'Content length', status: 'needs improvement', message: `Content should be 300-5000 words (current: ${wordCount})` });
        }

        // Heading structure (20 points)
        const headingStructure = this.checkHeadingStructure(article.content || '');
        if (headingStructure.hasH1 || headingStructure.hasH2) {
            score += headingStructure.score * 20;
            checks.push({ item: 'Heading structure', status: headingStructure.score >= 0.5 ? 'good' : 'needs improvement' });
        } else {
            checks.push({ item: 'Heading structure', status: 'needs improvement', message: 'Add H1 and H2 headings for better structure' });
        }

        // Image optimization (20 points)
        if (article.image) {
            score += 20;
            checks.push({ item: 'Image presence', status: 'good' });
        } else {
            checks.push({ item: 'Image presence', status: 'missing', message: 'Add a featured image' });
        }

        return {
            score: score,
            checks: checks
        };
    }

    /**
     * Score article structure
     */
    scoreStructure(article) {
        let score = 0;
        const content = article.content || '';

        // Has introduction (25 points)
        if (content.length > 100) {
            score += 25;
        }

        // Has headings (25 points)
        const headingCount = (content.match(/<h[1-6]>/gi) || []).length;
        if (headingCount >= 2) {
            score += 25;
        }

        // Has paragraphs (25 points)
        const paragraphCount = (content.match(/<p>/gi) || []).length;
        if (paragraphCount >= 3) {
            score += 25;
        }

        // Has lists or formatting (25 points)
        if (content.match(/<ul>|<ol>|<blockquote>/gi)) {
            score += 25;
        }

        return score;
    }

    /**
     * Score engagement potential
     */
    scoreEngagement(article) {
        let score = 0;

        // Title is engaging (30 points)
        if (article.title && (article.title.includes('?') || article.title.includes('How') || article.title.includes('Why'))) {
            score += 30;
        } else if (article.title && article.title.length > 0) {
            score += 15;
        }

        // Excerpt is compelling (30 points)
        if (article.excerpt && article.excerpt.length > 50) {
            score += 30;
        } else if (article.excerpt) {
            score += 15;
        }

        // Has clear category (20 points)
        if (article.category) {
            score += 20;
        }

        // Read time is reasonable (20 points)
        const readTime = parseInt(article.readTime) || 0;
        if (readTime >= 3 && readTime <= 15) {
            score += 20;
        }

        return score;
    }

    /**
     * Get letter grade from score
     */
    getGrade(score) {
        if (score >= 90) return 'A+';
        if (score >= 80) return 'A';
        if (score >= 70) return 'B';
        if (score >= 60) return 'C';
        if (score >= 50) return 'D';
        return 'F';
    }

    /**
     * Get recommendations for improvement
     */
    getRecommendations(scores, article) {
        const recommendations = [];

        if (scores.readability < 60) {
            recommendations.push('Improve readability: Use shorter sentences and simpler words');
        }

        if (scores.seo.score < 60) {
            scores.seo.checks.forEach(check => {
                if (check.status !== 'good') {
                    recommendations.push(check.message || `Improve ${check.item}`);
                }
            });
        }

        if (scores.structure < 60) {
            recommendations.push('Improve structure: Add more headings, paragraphs, and formatting');
        }

        if (scores.engagement < 60) {
            recommendations.push('Improve engagement: Make title and excerpt more compelling');
        }

        return recommendations;
    }

    /**
     * Helper: Strip HTML tags
     */
    stripHTML(html) {
        return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    }

    /**
     * Helper: Get word count
     */
    getWordCount(text) {
        const cleanText = this.stripHTML(text);
        return cleanText.split(/\s+/).filter(w => w.length > 0).length;
    }

    /**
     * Helper: Check heading structure
     */
    checkHeadingStructure(html) {
        const hasH1 = /<h1[^>]*>/i.test(html);
        const hasH2 = /<h2[^>]*>/i.test(html);
        const hasH3 = /<h3[^>]*>/i.test(html);
        
        let score = 0;
        if (hasH1) score += 0.5;
        if (hasH2) score += 0.3;
        if (hasH3) score += 0.2;

        return { hasH1, hasH2, hasH3, score };
    }
}

module.exports = ArticleQualityScorer;

