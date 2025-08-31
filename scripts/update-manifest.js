#!/usr/bin/env node

/**
 * PasswordMonkey News Manifest Updater
 * 
 * This script automatically scans the /news directory and updates the news-manifest.json file.
 * It can be run manually or integrated with n8n automation workflows.
 * 
 * Usage:
 *   node update-manifest.js [--scan-dir=/path/to/news] [--output=/path/to/manifest.json]
 * 
 * Features:
 * - Automatically discovers HTML files in the news directory
 * - Extracts metadata from HTML files (title, description, date)
 * - Generates excerpts from article content
 * - Updates the manifest with new articles
 * - Maintains article order by date (newest first)
 * - Provides detailed logging for automation workflows
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

class NewsManifestUpdater {
    constructor(options = {}) {
        this.newsDir = options.scanDir || path.join(__dirname);
        this.manifestPath = options.output || path.join(__dirname, 'news-manifest.json');
        this.excludeFiles = ['index.html', 'article-template.html', 'QUICK-REFERENCE.md', 'README.md', 'update-manifest.js', 'news-aggregator.js'];
        this.manifest = null;
        this.articles = [];
        this.stats = {
            totalFiles: 0,
            processedFiles: 0,
            newArticles: 0,
            updatedArticles: 0,
            errors: 0
        };
    }

    async run() {
        try {
            console.log('🚀 Starting PasswordMonkey News Manifest Update...');
            console.log(`📁 Scanning directory: ${this.newsDir}`);
            
            // Load existing manifest if it exists
            await this.loadExistingManifest();
            
            // Scan for HTML files
            const htmlFiles = await this.scanForHtmlFiles();
            console.log(`📄 Found ${htmlFiles.length} HTML files to process`);
            
            // Process each HTML file
            for (const file of htmlFiles) {
                await this.processHtmlFile(file);
            }
            
            // Sort articles by date (newest first)
            this.sortArticlesByDate();
            
            // Update manifest
            await this.updateManifest();
            
            // Generate report
            this.generateReport();
            
            console.log('✅ News manifest update completed successfully!');
            return true;
            
        } catch (error) {
            console.error('❌ Error updating news manifest:', error);
            return false;
        }
    }

    async loadExistingManifest() {
        try {
            if (fs.existsSync(this.manifestPath)) {
                const manifestContent = fs.readFileSync(this.manifestPath, 'utf8');
                this.manifest = JSON.parse(manifestContent);
                console.log('📋 Loaded existing manifest');
            } else {
                this.manifest = {
                    lastUpdated: new Date().toISOString(),
                    totalArticles: 0,
                    articles: [],
                    categories: [],
                    schema: {
                        version: "1.0",
                        description: "News manifest for PasswordMonkey news section. Auto-generated and updated by n8n automation.",
                        fields: {
                            filename: "HTML filename in /news directory",
                            title: "Article headline",
                            date: "Publish date in YYYY-MM-DD format",
                            excerpt: "First 150-200 characters of article content",
                            url: "Full URL to the article",
                            metaDescription: "SEO meta description",
                            keywords: "Comma-separated keywords for SEO",
                            author: "Article author (usually PasswordMonkey)",
                            readTime: "Estimated reading time",
                            category: "Article category for organization"
                        }
                    }
                };
                console.log('📋 Created new manifest structure');
            }
        } catch (error) {
            console.warn('⚠️ Could not load existing manifest, creating new one:', error.message);
            this.manifest = null;
        }
    }

    async scanForHtmlFiles() {
        try {
            const files = fs.readdirSync(this.newsDir);
            return files.filter(file => {
                const isHtml = file.endsWith('.html');
                const isExcluded = this.excludeFiles.includes(file);
                return isHtml && !isExcluded;
            });
        } catch (error) {
            console.error('❌ Error scanning directory:', error);
            return [];
        }
    }

    async processHtmlFile(filename) {
        this.stats.totalFiles++;
        const filePath = path.join(this.newsDir, filename);
        
        try {
            console.log(`📖 Processing: ${filename}`);
            
            const fileContent = fs.readFileSync(filePath, 'utf8');
            const articleData = await this.extractArticleData(filename, fileContent);
            
            if (articleData) {
                // Check if article already exists
                const existingIndex = this.articles.findIndex(a => a.filename === filename);
                
                if (existingIndex >= 0) {
                    // Update existing article
                    this.articles[existingIndex] = { ...this.articles[existingIndex], ...articleData };
                    this.stats.updatedArticles++;
                    console.log(`  ✅ Updated: ${articleData.title}`);
                } else {
                    // Add new article
                    this.articles.push(articleData);
                    this.stats.newArticles++;
                    console.log(`  ➕ New: ${articleData.title}`);
                }
            }
            
            this.stats.processedFiles++;
            
        } catch (error) {
            this.stats.errors++;
            console.error(`  ❌ Error processing ${filename}:`, error.message);
        }
    }

    async extractArticleData(filename, htmlContent) {
        try {
            const dom = new JSDOM(htmlContent);
            const document = dom.window.document;
            
            // Extract title
            const title = this.extractTitle(document);
            if (!title) {
                console.warn(`  ⚠️ No title found in ${filename}`);
                return null;
            }
            
            // Extract meta description
            const metaDescription = this.extractMetaDescription(document);
            
            // Extract publish date
            const date = this.extractPublishDate(document);
            if (!date) {
                console.warn(`  ⚠️ No publish date found in ${filename}`);
                return null;
            }
            
            // Extract excerpt from content
            const excerpt = this.extractExcerpt(document);
            
            // Extract keywords
            const keywords = this.extractKeywords(document);
            
            // Extract author
            const author = this.extractAuthor(document);
            
            // Generate URL
            const url = `/news/${filename}`;
            
            // Estimate read time
            const readTime = this.estimateReadTime(htmlContent);
            
            // Determine category based on content
            const category = this.determineCategory(title, excerpt, keywords);
            
            return {
                filename,
                title,
                date,
                excerpt,
                url,
                metaDescription,
                keywords,
                author,
                readTime,
                category
            };
            
        } catch (error) {
            console.error(`  ❌ Error extracting data from ${filename}:`, error.message);
            return null;
        }
    }

    extractTitle(document) {
        // Try to get title from meta tag first, then from h1, then from title tag
        const metaTitle = document.querySelector('meta[name="description"]')?.getAttribute('content');
        const h1Title = document.querySelector('h1')?.textContent?.trim();
        const titleTag = document.querySelector('title')?.textContent?.trim();
        
        // Clean up title tag (remove "| Password Monkey" suffix)
        const cleanTitleTag = titleTag?.replace(/\s*\|\s*Password\s*Monkey.*$/i, '');
        
        return metaTitle || h1Title || cleanTitleTag || null;
    }

    extractMetaDescription(document) {
        const metaDesc = document.querySelector('meta[name="description"]')?.getAttribute('content');
        return metaDesc || '';
    }

    extractPublishDate(document) {
        // Try multiple date sources
        const metaDate = document.querySelector('meta[name="date"]')?.getAttribute('content');
        const ogDate = document.querySelector('meta[property="article:published_time"]')?.getAttribute('content');
        const jsonLdDate = this.extractDateFromJsonLd(document);
        
        // Parse and validate date
        const date = metaDate || ogDate || jsonLdDate;
        if (date && this.isValidDate(date)) {
            return this.formatDate(date);
        }
        
        return null;
    }

    extractDateFromJsonLd(document) {
        try {
            const jsonLdScript = document.querySelector('script[type="application/ld+json"]');
            if (jsonLdScript) {
                const jsonData = JSON.parse(jsonLdScript.textContent);
                return jsonData.datePublished || jsonData.dateModified;
            }
        } catch (error) {
            // Ignore JSON parsing errors
        }
        return null;
    }

    extractExcerpt(document) {
        // Try to get excerpt from meta description first
        const metaDesc = document.querySelector('meta[name="description"]')?.getAttribute('content');
        if (metaDesc && metaDesc.length > 50) {
            return metaDesc;
        }
        
        // Fallback: extract from first paragraph
        const firstP = document.querySelector('p');
        if (firstP) {
            let text = firstP.textContent.trim();
            // Limit to 200 characters
            if (text.length > 200) {
                text = text.substring(0, 197) + '...';
            }
            return text;
        }
        
        return 'Article content available.';
    }

    extractKeywords(document) {
        const metaKeywords = document.querySelector('meta[name="keywords"]')?.getAttribute('content');
        return metaKeywords || 'password security, cybersecurity, digital security';
    }

    extractAuthor(document) {
        const metaAuthor = document.querySelector('meta[name="author"]')?.getAttribute('content');
        return metaAuthor || 'PasswordMonkey';
    }

    estimateReadTime(htmlContent) {
        // Simple word count estimation (average reading speed: 200 words per minute)
        const textContent = htmlContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        const wordCount = textContent.split(' ').length;
        const minutes = Math.ceil(wordCount / 200);
        return `${minutes} min read`;
    }

    determineCategory(title, excerpt, keywords) {
        const text = `${title} ${excerpt} ${keywords}`.toLowerCase();
        
        if (text.includes('breach') || text.includes('hack') || text.includes('compromise')) {
            return 'Data Breaches';
        } else if (text.includes('threat') || text.includes('attack') || text.includes('vulnerability')) {
            return 'Security Threats';
        } else if (text.includes('password') && (text.includes('tip') || text.includes('guide') || text.includes('best practice'))) {
            return 'Password Best Practices';
        } else if (text.includes('industry') || text.includes('update') || text.includes('trend')) {
            return 'Industry Updates';
        } else {
            return 'Cybersecurity News';
        }
    }

    isValidDate(dateString) {
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0]; // YYYY-MM-DD format
    }

    sortArticlesByDate() {
        this.articles.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    async updateManifest() {
        // Update manifest data
        this.manifest.lastUpdated = new Date().toISOString();
        this.manifest.totalArticles = this.articles.length;
        this.manifest.articles = this.articles;
        
        // Update categories
        const categories = [...new Set(this.articles.map(a => a.category))];
        this.manifest.categories = categories.sort();
        
        // Write manifest file
        const manifestContent = JSON.stringify(this.manifest, null, 2);
        fs.writeFileSync(this.manifestPath, manifestContent, 'utf8');
        
        console.log(`💾 Manifest updated: ${this.manifestPath}`);
    }

    generateReport() {
        console.log('\n📊 Update Report:');
        console.log('================');
        console.log(`📁 Total files scanned: ${this.stats.totalFiles}`);
        console.log(`✅ Successfully processed: ${this.stats.processedFiles}`);
        console.log(`➕ New articles added: ${this.stats.newArticles}`);
        console.log(`🔄 Articles updated: ${this.stats.updatedArticles}`);
        console.log(`❌ Errors encountered: ${this.stats.errors}`);
        console.log(`📚 Total articles in manifest: ${this.articles.length}`);
        console.log(`📅 Last updated: ${this.manifest.lastUpdated}`);
        
        if (this.articles.length > 0) {
            console.log('\n📰 Articles in manifest:');
            this.articles.forEach((article, index) => {
                console.log(`  ${index + 1}. ${article.title} (${article.date})`);
            });
        }
    }
}

// Command line interface
async function main() {
    const args = process.argv.slice(2);
    const options = {};
    
    // Parse command line arguments
    args.forEach(arg => {
        if (arg.startsWith('--scan-dir=')) {
            options.scanDir = arg.split('=')[1];
        } else if (arg.startsWith('--output=')) {
            options.output = arg.split('=')[1];
        } else if (arg === '--help' || arg === '-h') {
            console.log(`
PasswordMonkey News Manifest Updater

Usage: node update-manifest.js [options]

Options:
  --scan-dir=PATH    Directory to scan for HTML files (default: current directory)
  --output=PATH      Output path for manifest file (default: news-manifest.json)
  --help, -h         Show this help message

Examples:
  node update-manifest.js
  node update-manifest.js --scan-dir=/path/to/news
  node update-manifest.js --output=/path/to/manifest.json

This script automatically discovers HTML files in the specified directory,
extracts metadata, and updates the news manifest for the PasswordMonkey website.
            `);
            process.exit(0);
        }
    });
    
    const updater = new NewsManifestUpdater(options);
    const success = await updater.run();
    
    process.exit(success ? 0 : 1);
}

// Run if called directly
if (require.main === module) {
    main().catch(error => {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    });
}

module.exports = NewsManifestUpdater; 