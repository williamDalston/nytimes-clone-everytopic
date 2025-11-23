/**
 * SEO Optimizer
 * Comprehensive SEO analysis and optimization
 */

class SEOOptimizer {
    constructor() {
        this.targetTitleLength = { min: 30, max: 60 };
        this.targetMetaLength = { min: 120, max: 160 };
        this.targetUrlLength = { max: 60 };
    }

    /**
     * Analyze and optimize article for SEO
     */
    analyzeArticle(article) {
        const analysis = {
            title: this.analyzeTitle(article.title || ''),
            meta: this.analyzeMeta(article.excerpt || ''),
            content: this.analyzeContent(article.content || ''),
            structure: this.analyzeStructure(article.content || ''),
            images: this.analyzeImages(article),
            url: this.analyzeUrl(article.title || ''),
            overall: {
                score: 0,
                grade: 'F',
                issues: [],
                recommendations: []
            }
        };

        // Calculate overall score
        analysis.overall.score = this.calculateOverallScore(analysis);
        analysis.overall.grade = this.getGrade(analysis.overall.score);
        analysis.overall.issues = this.getIssues(analysis);
        analysis.overall.recommendations = this.getRecommendations(analysis);

        return analysis;
    }

    /**
     * Analyze title optimization
     */
    analyzeTitle(title) {
        const length = title.length;
        const hasNumbers = /\d/.test(title);
        const hasKeywords = title.split(/\s+/).length >= 3;
        const hasPowerWords = /essential|ultimate|complete|guide|best|top|how|why|what/i.test(title);

        let score = 0;
        if (length >= this.targetTitleLength.min && length <= this.targetTitleLength.max) score += 30;
        if (hasKeywords) score += 20;
        if (hasPowerWords) score += 20;
        if (hasNumbers) score += 15;
        if (title.length > 0) score += 15;

        return {
            text: title,
            length: length,
            score: score,
            optimal: length >= this.targetTitleLength.min && length <= this.targetTitleLength.max,
            hasNumbers,
            hasKeywords,
            hasPowerWords,
            suggestions: length < this.targetTitleLength.min ? 'Title is too short' :
                        length > this.targetTitleLength.max ? 'Title is too long' : null
        };
    }

    /**
     * Analyze meta description/excerpt
     */
    analyzeMeta(excerpt) {
        const length = excerpt.length;
        const hasCallToAction = /learn|discover|explore|read|find/i.test(excerpt);
        const hasKeywords = excerpt.split(/\s+/).length >= 10;

        let score = 0;
        if (length >= this.targetMetaLength.min && length <= this.targetMetaLength.max) score += 40;
        if (hasKeywords) score += 30;
        if (hasCallToAction) score += 30;

        return {
            text: excerpt,
            length: length,
            score: score,
            optimal: length >= this.targetMetaLength.min && length <= this.targetMetaLength.max,
            hasCallToAction,
            hasKeywords,
            suggestions: length < this.targetMetaLength.min ? 'Meta description is too short' :
                        length > this.targetMetaLength.max ? 'Meta description is too long' : null
        };
    }

    /**
     * Analyze content SEO
     */
    analyzeContent(content) {
        const cleanContent = this.stripHTML(content);
        const wordCount = cleanContent.split(/\s+/).filter(w => w.length > 0).length;
        const paragraphCount = (content.match(/<p>/gi) || []).length;
        const headingCount = (content.match(/<h[1-6]>/gi) || []).length;
        const listCount = (content.match(/<ul>|<ol>/gi) || []).length;
        const linkCount = (content.match(/<a\s+href/gi) || []).length;

        let score = 0;
        if (wordCount >= 300) score += 25;
        if (paragraphCount >= 5) score += 20;
        if (headingCount >= 2) score += 20;
        if (listCount >= 1) score += 15;
        if (linkCount >= 2) score += 20;

        return {
            wordCount: wordCount,
            paragraphCount: paragraphCount,
            headingCount: headingCount,
            listCount: listCount,
            linkCount: linkCount,
            score: score,
            suggestions: wordCount < 300 ? 'Content is too short (aim for 300+ words)' : null
        };
    }

    /**
     * Analyze structure
     */
    analyzeStructure(content) {
        const hasH1 = /<h1[^>]*>/i.test(content);
        const hasH2 = /<h2[^>]*>/i.test(content);
        const hasH3 = /<h3[^>]*>/i.test(content);
        const hasProperHierarchy = hasH1 && hasH2;

        let score = 0;
        if (hasH1) score += 30;
        if (hasH2) score += 30;
        if (hasH3) score += 20;
        if (hasProperHierarchy) score += 20;

        return {
            hasH1,
            hasH2,
            hasH3,
            hasProperHierarchy,
            score: score,
            suggestions: !hasH1 ? 'Add an H1 heading' : !hasH2 ? 'Add H2 headings for structure' : null
        };
    }

    /**
     * Analyze images
     */
    analyzeImages(article) {
        const hasImage = !!article.image;
        const imageUrl = article.image || '';
        const hasAltText = false; // Would need to check actual alt attribute

        let score = 0;
        if (hasImage) score += 50;
        if (hasAltText) score += 50;

        return {
            hasImage,
            hasAltText,
            score: score,
            suggestions: !hasImage ? 'Add a featured image' : !hasAltText ? 'Add alt text to images' : null
        };
    }

    /**
     * Analyze URL slug
     */
    analyzeUrl(title) {
        const slug = this.titleToSlug(title);
        const length = slug.length;
        const hasHyphens = slug.includes('-');
        const isReadable = /^[a-z0-9-]+$/.test(slug);

        let score = 0;
        if (length <= this.targetUrlLength.max) score += 40;
        if (hasHyphens) score += 30;
        if (isReadable) score += 30;

        return {
            slug: slug,
            length: length,
            score: score,
            optimal: length <= this.targetUrlLength.max,
            suggestions: length > this.targetUrlLength.max ? 'URL slug is too long' : null
        };
    }

    /**
     * Generate structured data (JSON-LD)
     */
    generateStructuredData(article, siteConfig) {
        const url = `${siteConfig.domain || 'https://example.com'}/articles/${this.titleToSlug(article.title)}`;
        
        return {
            '@context': 'https://schema.org',
            '@type': 'Article',
            'headline': article.title,
            'description': article.excerpt,
            'image': article.image || '',
            'datePublished': article.date || new Date().toISOString(),
            'dateModified': article.date || new Date().toISOString(),
            'author': {
                '@type': 'Person',
                'name': article.author || 'AI Analyst'
            },
            'publisher': {
                '@type': 'Organization',
                'name': siteConfig.name || 'News Site',
                'logo': {
                    '@type': 'ImageObject',
                    'url': siteConfig.logo || ''
                }
            },
            'mainEntityOfPage': {
                '@type': 'WebPage',
                '@id': url
            },
            'articleSection': article.category || 'General'
        };
    }

    /**
     * Generate Open Graph tags
     */
    generateOpenGraphTags(article, siteConfig) {
        return {
            'og:type': 'article',
            'og:title': article.title,
            'og:description': article.excerpt,
            'og:image': article.image || '',
            'og:url': `${siteConfig.domain || 'https://example.com'}/articles/${this.titleToSlug(article.title)}`,
            'og:site_name': siteConfig.name || 'News Site',
            'article:published_time': article.date || new Date().toISOString(),
            'article:author': article.author || 'AI Analyst',
            'article:section': article.category || 'General'
        };
    }

    /**
     * Generate Twitter Card tags
     */
    generateTwitterCardTags(article, siteConfig) {
        return {
            'twitter:card': 'summary_large_image',
            'twitter:title': article.title,
            'twitter:description': article.excerpt,
            'twitter:image': article.image || '',
            'twitter:site': siteConfig.twitterHandle || ''
        };
    }

    /**
     * Calculate overall SEO score
     */
    calculateOverallScore(analysis) {
        return (
            analysis.title.score * 0.2 +
            analysis.meta.score * 0.2 +
            analysis.content.score * 0.25 +
            analysis.structure.score * 0.15 +
            analysis.images.score * 0.1 +
            analysis.url.score * 0.1
        );
    }

    /**
     * Get grade from score
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
     * Get all issues
     */
    getIssues(analysis) {
        const issues = [];
        
        if (analysis.title.suggestions) issues.push(analysis.title.suggestions);
        if (analysis.meta.suggestions) issues.push(analysis.meta.suggestions);
        if (analysis.content.suggestions) issues.push(analysis.content.suggestions);
        if (analysis.structure.suggestions) issues.push(analysis.structure.suggestions);
        if (analysis.images.suggestions) issues.push(analysis.images.suggestions);
        if (analysis.url.suggestions) issues.push(analysis.url.suggestions);

        return issues;
    }

    /**
     * Get recommendations
     */
    getRecommendations(analysis) {
        const recommendations = [];

        if (analysis.overall.score < 70) {
            recommendations.push('Overall SEO score is below optimal. Review and address the issues above.');
        }

        if (analysis.title.score < 80) {
            recommendations.push('Optimize title: Ensure it\'s 30-60 characters, includes keywords, and is compelling');
        }

        if (analysis.meta.score < 80) {
            recommendations.push('Optimize meta description: Ensure it\'s 120-160 characters and includes a call to action');
        }

        if (analysis.content.score < 70) {
            recommendations.push('Enhance content: Add more paragraphs, headings, and internal links');
        }

        return recommendations;
    }

    /**
     * Helper: Strip HTML
     */
    stripHTML(html) {
        return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    }

    /**
     * Helper: Convert title to URL slug
     */
    titleToSlug(title) {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
            .substring(0, 60);
    }
}

module.exports = SEOOptimizer;

