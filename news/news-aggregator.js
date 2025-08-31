/**
 * PasswordMonkey News Aggregator
 * Automatically detects and displays news articles from the /news directory
 * Compatible with GitHub Pages and ready for n8n automation
 */

class NewsAggregator {
    constructor() {
        this.newsContainer = document.getElementById('news-list');
        this.paginationContainer = document.getElementById('pagination');
        this.articlesPerPage = 10;
        this.currentPage = 1;
        this.allArticles = [];
        this.newsDirectory = '/news/';
        this.init();
    }

    async init() {
        try {
            await this.discoverArticles();
            this.renderNews();
            this.setupEventListeners();
        } catch (error) {
            console.error('Error initializing news aggregator:', error);
            this.showError('Unable to load news articles. Please try again later.');
        }
    }

    async discoverArticles() {
        try {
            const response = await fetch(this.newsDirectory + 'news-manifest.json');
            if (!response.ok) throw new Error('Manifest not found');
            const manifest = await response.json();
            const rawArticles = manifest.articles || [];

            // Map manifest fields to aggregator fields
            this.allArticles = rawArticles.map(item => ({
                title: item.title || '',
                date: item.published || item.updated || '',
                url: this.newsDirectory + (item.file || item.slug || ''),
                excerpt: (item.description || '').toString().slice(0, 200),
                filename: item.file || undefined,
                readingTime: item.readTime || '5 min read'
            }));

        } catch (error) {
            console.warn('Manifest not found, using fallback discovery:', error);
            await this.discoverArticlesFallback();
        }

        // Sort newest first
        this.allArticles.sort((a, b) => new Date(b.date) - new Date(a.date));
        this.hideLoadingState();
    }

    async discoverArticlesFallback() {
        const fallbackArticles = [
            {
                filename: '2025-01-15-sample-article.html',
                title: 'New Password Security Threat Discovered',
                date: '2025-01-15',
                excerpt: 'Learn about the latest password security threat and how to protect your accounts.',
                url: '/news/2025-01-15-sample-article.html',
                readingTime: '5 min read'
            }
        ];
        this.allArticles = fallbackArticles;
    }

    renderNews() {
        if (this.allArticles.length === 0) {
            this.showNoArticles();
            return;
        }

        const startIndex = (this.currentPage - 1) * this.articlesPerPage;
        const endIndex = startIndex + this.articlesPerPage;
        const currentArticles = this.allArticles.slice(startIndex, endIndex);

        this.renderArticles(currentArticles);
        this.renderPagination();
        this.updatePageInfo();
        this.hideLoadingState();
    }

    renderArticles(articles) {
        if (!this.newsContainer) return;
        this.newsContainer.innerHTML = '';

        articles.forEach(article => {
            const articleElement = this.createArticleCard(article);
            this.newsContainer.appendChild(articleElement);
        });
    }

    createArticleCard(article) {
        const articleElement = document.createElement('article');
        articleElement.className = 'news-card bg-white rounded-lg shadow-md p-6 dark:bg-gray-800 hover:shadow-lg transition-all duration-300';
        const displayDate = this.formatDate(article.date);

        articleElement.innerHTML = `
            <header class="mb-4">
                <h2 class="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                    <a href="${article.url}" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        ${this.escapeHtml(article.title)}
                    </a>
                </h2>
                <div class="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <i class="fas fa-calendar-alt mr-2"></i>
                    <time datetime="${article.date}">${displayDate}</time>
                    <span class="mx-2">•</span>
                    <i class="fas fa-clock mr-2"></i>
                    <span>${article.readingTime}</span>
                </div>
            </header>
            <div class="mb-4">
                <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
                    ${this.escapeHtml(article.excerpt)}
                </p>
            </div>
            <footer class="flex items-center justify-between">
                <a href="${article.url}" class="inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors">
                    Read more 
                    <i class="fas fa-arrow-right ml-2 text-sm"></i>
                </a>
                ${article.filename ? `<span class="text-xs text-gray-500 dark:text-gray-400">${this.escapeHtml(article.filename)}</span>` : ''}
            </footer>
        `;
        return articleElement;
    }

    renderPagination() {
        if (!this.paginationContainer) return;
        const totalPages = Math.ceil(this.allArticles.length / this.articlesPerPage);
        if (totalPages <= 1) {
            this.paginationContainer.innerHTML = '';
            return;
        }

        let paginationHTML = '<div class="flex items-center justify-center space-x-2">';
        if (this.currentPage > 1) {
            paginationHTML += `<button class="pagination-btn px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700" data-page="${this.currentPage - 1}">
                                <i class="fas fa-chevron-left mr-1"></i> Previous
                               </button>`;
        }

        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(totalPages, this.currentPage + 2);
        for (let i = startPage; i <= endPage; i++) {
            if (i === this.currentPage) {
                paginationHTML += `<span class="px-3 py-2 text-sm font-medium text-blue-600 bg-blue-100 border border-blue-300 rounded-md dark:bg-blue-900 dark:border-blue-700 dark:text-blue-300">${i}</span>`;
            } else {
                paginationHTML += `<button class="pagination-btn px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700" data-page="${i}">${i}</button>`;
            }
        }

        if (this.currentPage < totalPages) {
            paginationHTML += `<button class="pagination-btn px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700" data-page="${this.currentPage + 1}">
                                Next <i class="fas fa-chevron-right ml-1"></i>
                               </button>`;
        }

        paginationHTML += '</div>';
        this.paginationContainer.innerHTML = paginationHTML;
    }

    updatePageInfo() {
        const pageInfoElement = document.getElementById('page-info');
        if (!pageInfoElement) return;

        const totalPages = Math.ceil(this.allArticles.length / this.articlesPerPage);
        const startIndex = (this.currentPage - 1) * this.articlesPerPage + 1;
        const endIndex = Math.min(this.currentPage * this.articlesPerPage, this.allArticles.length);

        pageInfoElement.innerHTML = `<p class="text-sm text-gray-600 dark:text-gray-400">
            Showing ${startIndex}-${endIndex} of ${this.allArticles.length} articles
            ${totalPages > 1 ? `(Page ${this.currentPage} of ${totalPages})` : ''}
        </p>`;
    }

    setupEventListeners() {
        if (this.paginationContainer) {
            this.paginationContainer.addEventListener('click', (e) => {
                if (e.target.classList.contains('pagination-btn')) {
                    const page = parseInt(e.target.dataset.page);
                    this.goToPage(page);
                }
            });
        }

        const searchInput = document.getElementById('news-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterArticles(e.target.value);
            });
        }
    }

    goToPage(page) {
        this.currentPage = page;
        this.renderNews();
        const newsSection = document.getElementById('news-section');
        if (newsSection) newsSection.scrollIntoView({ behavior: 'smooth' });
    }

    filterArticles(searchTerm) {
        if (!searchTerm.trim()) {
            this.currentPage = 1;
            this.renderNews();
            return;
        }

        const filteredArticles = this.allArticles.filter(article => 
            article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            article.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
        );

        this.renderFilteredArticles(filteredArticles);
    }

    renderFilteredArticles(filteredArticles) {
        if (!this.newsContainer) return;
        this.newsContainer.innerHTML = '';

        if (filteredArticles.length === 0) {
            this.newsContainer.innerHTML = `
                <div class="text-center py-12">
                    <i class="fas fa-search text-4xl text-gray-400 mb-4"></i>
                    <p class="text-gray-600 dark:text-gray-400">No articles found matching "${document.getElementById('news-search').value}"</p>
                    <button onclick="window.location.reload()" class="mt-4 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                        Clear search
                    </button>
                </div>`;
            this.hideLoadingState();
            return;
        }

        filteredArticles.forEach(article => {
            const articleElement = this.createArticleCard(article);
            this.newsContainer.appendChild(articleElement);
        });

        if (this.paginationContainer) this.paginationContainer.innerHTML = '';
        this.hideLoadingState();
    }

    formatDate(dateString) {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return dateString;
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showNoArticles() {
        if (!this.newsContainer) return;
        this.newsContainer.innerHTML = `<div class="text-center py-12">
            <i class="fas fa-newspaper text-4xl text-gray-400 mb-4"></i>
            <p class="text-gray-600 dark:text-gray-400">No news articles available at the moment.</p>
            <p class="text-gray-500 dark:text-gray-500 text-sm mt-2">Check back soon for updates!</p>
        </div>`;
        this.hideLoadingState();
    }

    showError(message) {
        if (!this.newsContainer) return;
        this.newsContainer.innerHTML = `<div class="text-center py-12">
            <i class="fas fa-exclamation-triangle text-4xl text-red-400 mb-4"></i>
            <p class="text-red-600 dark:text-red-400">${message}</p>
            <button onclick="window.location.reload()" class="mt-4 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                Try again
            </button>
        </div>`;
        this.hideLoadingState();
    }

    hideLoadingState() {
        const loading = document.getElementById('loading-state');
        if (loading) loading.style.display = 'none';
    }
}

// Initialize aggregator
document.addEventListener('DOMContentLoaded', () => {
    new NewsAggregator();
});

// Export for Node.js compatibility if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NewsAggregator;
}
