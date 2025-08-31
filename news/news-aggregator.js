/**
 * PasswordMonkey News Aggregator
 * Automatically detects and displays news articles from the /news directory
 * Uses readTime from manifest for each article
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
            const response = await fetch(`${this.newsDirectory}news-manifest.json`);
            if (response.ok) {
                const manifest = await response.json();
                const rawArticles = Array.isArray(manifest) ? manifest : (manifest.articles || []);
                this.allArticles = rawArticles.map(item => ({
                    title: item.title || '',
                    date: item.date || '',
                    url: item.url || '#',
                    excerpt: (item.excerpt || item.description || '').toString().slice(0, 200),
                    filename: item.filename || (item.url ? item.url.split('/').pop() : undefined),
                    readingTime: item.readingTime || 5
                }));
            } else {
                await this.discoverArticlesFallback();
            }
        } catch (error) {
            console.warn('Manifest not found, using fallback discovery:', error);
            await this.discoverArticlesFallback();
        }

        this.allArticles.sort((a, b) => new Date(b.date) - new Date(a.date));
        this.hideLoadingState();
    }

    async discoverArticlesFallback() {
        this.allArticles = [
            { filename: '2025-01-15-sample.html', title: 'Sample Article', date: '2025-01-15', excerpt: 'Fallback excerpt...', url: '/news/2025-01-15-sample.html', readingTime: 5 },
            { filename: '2025-08-20-password-breach.html', title: 'Password Breach', date: '2025-08-20', excerpt: 'Fallback excerpt...', url: '/news/2025-08-20-password-breach.html', readingTime: 6 }
        ];
    }

    renderNews() {
        if (!this.allArticles.length) return this.showNoArticles();
        const start = (this.currentPage - 1) * this.articlesPerPage;
        const end = start + this.articlesPerPage;
        this.renderArticles(this.allArticles.slice(start, end));
        this.renderPagination();
        this.updatePageInfo();
    }

    renderArticles(articles) {
        if (!this.newsContainer) return;
        this.newsContainer.innerHTML = '';
        articles.forEach(article => this.newsContainer.appendChild(this.createArticleCard(article)));
    }

    createArticleCard(article) {
        const articleEl = document.createElement('article');
        articleEl.className = 'news-card bg-white rounded-lg shadow-md p-6 dark:bg-gray-800 hover:shadow-lg transition-all duration-300';
        const displayDate = this.formatDate(article.date);
        articleEl.innerHTML = `
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
                    <span>${article.readingTime} min read</span>
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
        return articleEl;
    }

    renderPagination() {
        if (!this.paginationContainer) return;
        const totalPages = Math.ceil(this.allArticles.length / this.articlesPerPage);
        if (totalPages <= 1) return this.paginationContainer.innerHTML = '';
        let html = '<div class="flex items-center justify-center space-x-2">';
        if (this.currentPage > 1) html += `<button class="pagination-btn" data-page="${this.currentPage - 1}">← Previous</button>`;
        for (let i = Math.max(1, this.currentPage - 2); i <= Math.min(totalPages, this.currentPage + 2); i++) {
            html += i === this.currentPage ? `<span class="current-page">${i}</span>` : `<button class="pagination-btn" data-page="${i}">${i}</button>`;
        }
        if (this.currentPage < totalPages) html += `<button class="pagination-btn" data-page="${this.currentPage + 1}">Next →</button>`;
        html += '</div>';
        this.paginationContainer.innerHTML = html;
    }

    updatePageInfo() {
        const info = document.getElementById('page-info');
        if (!info) return;
        const totalPages = Math.ceil(this.allArticles.length / this.articlesPerPage);
        const startIndex = (this.currentPage - 1) * this.articlesPerPage + 1;
        const endIndex = Math.min(this.currentPage * this.articlesPerPage, this.allArticles.length);
        info.innerHTML = `Showing ${startIndex}-${endIndex} of ${this.allArticles.length} articles${totalPages > 1 ? ` (Page ${this.currentPage} of ${totalPages})` : ''}`;
    }

    setupEventListeners() {
        if (this.paginationContainer) {
            this.paginationContainer.addEventListener('click', e => {
                if (e.target.classList.contains('pagination-btn')) this.goToPage(parseInt(e.target.dataset.page));
            });
        }
        const searchInput = document.getElementById('news-search');
        if (searchInput) searchInput.addEventListener('input', e => this.filterArticles(e.target.value));
    }

    goToPage(page) {
        this.currentPage = page;
        this.renderNews();
        const section = document.getElementById('news-section');
        if (section) section.scrollIntoView({ behavior: 'smooth' });
    }

    filterArticles(term) {
        if (!term.trim()) return this.renderNews();
        const filtered = this.allArticles.filter(a => a.title.toLowerCase().includes(term.toLowerCase()) || a.excerpt.toLowerCase().includes(term.toLowerCase()));
        this.renderFilteredArticles(filtered);
    }

    renderFilteredArticles(filtered) {
        if (!this.newsContainer) return;
        this.newsContainer.innerHTML = '';
        if (!filtered.length) {
            this.newsContainer.innerHTML = `<div class="text-center py-12">No articles match your search</div>`;
            return;
        }
        filtered.forEach(article => this.newsContainer.appendChild(this.createArticleCard(article)));
        if (this.paginationContainer) this.paginationContainer.innerHTML = '';
    }

    formatDate(date) {
        try { return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }); } 
        catch { return date; }
    }

    escapeHtml(text) { const div = document.createElement('div'); div.textContent = text; return div.innerHTML; }
    showNoArticles() { if (!this.newsContainer) return; this.newsContainer.innerHTML = `<div class="text-center py-12">No articles available</div>`; }
    showError(msg) { if (!this.newsContainer) return; this.newsContainer.innerHTML = `<div class="text-center py-12 text-red-600">${msg}</div>`; }
    hideLoadingState() { const loading = document.getElementById('loading-state'); if (loading) loading.style.display = 'none'; }
}

document.addEventListener('DOMContentLoaded', () => new NewsAggregator());

if (typeof module !== 'undefined' && module.exports) module.exports = NewsAggregator;
