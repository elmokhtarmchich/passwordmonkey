class NewsAggregator {
    constructor() {
        this.newsContainer = document.getElementById('news-list');
        this.paginationContainer = document.getElementById('pagination');
        this.articlesPerPage = 10;
        this.currentPage = 1;
        this.allArticles = [];
        this.newsDirectory = '/news/';
        this.searchInput = document.getElementById('news-search');

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
            {
                filename: '2025-01-15-sample-article.html',
                title: 'New Password Security Threat Discovered',
                date: '2025-01-15',
                excerpt: 'Learn about the latest password security threat and how to protect your accounts.',
                url: '/news/2025-01-15-sample-article.html',
                readingTime: 5
            },
            {
                filename: '2025-08-20-password-breach.html',
                title: 'Password breach exposes millions of accounts',
                date: '2025-08-20',
                excerpt: 'A major password breach has exposed millions of accounts. Learn what happened.',
                url: '/news/2025-08-20-password-breach.html',
                readingTime: 6
            }
        ];
    }

    renderNews() {
        if (!this.allArticles.length) return this.showNoArticles();

        const startIndex = (this.currentPage - 1) * this.articlesPerPage;
        const endIndex = startIndex + this.articlesPerPage;
        const currentArticles = this.allArticles.slice(startIndex, endIndex);

        this.renderArticles(currentArticles);
        this.renderPagination();
        this.updatePageInfo();
    }

    renderArticles(articles) {
        if (!this.newsContainer) return;

        this.newsContainer.innerHTML = '';
        const template = document.getElementById('article-template');

        articles.forEach(article => {
            const clone = template.content.cloneNode(true);

            // Set title and link
            const titleLink = clone.querySelector('h2 a');
            titleLink.textContent = article.title;
            titleLink.href = article.url;

            // Set date
            const dateEl = clone.querySelector('.article-date');
            const date = new Date(article.date);
            dateEl.textContent = date.toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' });

            // Set reading time
            const readingTimeEl = clone.querySelector('.article-reading-time');
            readingTimeEl.textContent = `${article.readingTime} min read`;

            // Set excerpt
            const excerptEl = clone.querySelector('.article-excerpt');
            excerptEl.textContent = article.excerpt;

            this.newsContainer.appendChild(clone);
        });
    }

    renderPagination() {
        if (!this.paginationContainer) return;

        const totalPages = Math.ceil(this.allArticles.length / this.articlesPerPage);
        if (totalPages <= 1) {
            this.paginationContainer.innerHTML = '';
            return;
        }

        let html = '<div class="flex justify-center gap-2">';
        if (this.currentPage > 1) html += `<button class="pagination-btn px-3 py-1 border rounded" data-page="${this.currentPage-1}">Prev</button>`;
        for (let i=1; i<=totalPages; i++) {
            if (i === this.currentPage) html += `<span class="px-3 py-1 border rounded bg-blue-600 text-white">${i}</span>`;
            else html += `<button class="pagination-btn px-3 py-1 border rounded" data-page="${i}">${i}</button>`;
        }
        if (this.currentPage < totalPages) html += `<button class="pagination-btn px-3 py-1 border rounded" data-page="${this.currentPage+1}">Next</button>`;
        html += '</div>';

        this.paginationContainer.innerHTML = html;
    }

    updatePageInfo() {
        const pageInfoElement = document.getElementById('page-info');
        if (!pageInfoElement) return;
        const totalPages = Math.ceil(this.allArticles.length / this.articlesPerPage);
        const start = (this.currentPage-1)*this.articlesPerPage +1;
        const end = Math.min(this.currentPage*this.articlesPerPage, this.allArticles.length);
        pageInfoElement.textContent = `Showing ${start}-${end} of ${this.allArticles.length} articles ${totalPages>1? `(Page ${this.currentPage} of ${totalPages})`:''}`;
    }

    setupEventListeners() {
        // Pagination
        this.paginationContainer?.addEventListener('click', e => {
            if (e.target.classList.contains('pagination-btn')) {
                this.currentPage = parseInt(e.target.dataset.page);
                this.renderNews();
                document.getElementById('news-section')?.scrollIntoView({behavior:'smooth'});
            }
        });

        // Search
        this.searchInput?.addEventListener('input', e => {
            const term = e.target.value.trim().toLowerCase();
            if (!term) return this.renderNews();
            const filtered = this.allArticles.filter(a => 
                a.title.toLowerCase().includes(term) || a.excerpt.toLowerCase().includes(term)
            );
            this.renderFilteredArticles(filtered);
        });
    }

    renderFilteredArticles(filtered) {
        this.newsContainer.innerHTML = '';
        if (!filtered.length) {
            this.newsContainer.innerHTML = `<p class="col-span-full text-center text-gray-600 dark:text-gray-400">No articles found.</p>`;
            this.paginationContainer.innerHTML = '';
            return;
        }

        const template = document.getElementById('article-template');
        filtered.forEach(article => {
            const clone = template.content.cloneNode(true);
            clone.querySelector('h2 a').textContent = article.title;
            clone.querySelector('h2 a').href = article.url;
            clone.querySelector('.article-date').textContent = new Date(article.date).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'});
            clone.querySelector('.article-reading-time').textContent = `${article.readingTime} min read`;
            clone.querySelector('.article-excerpt').textContent = article.excerpt;
            this.newsContainer.appendChild(clone);
        });

        this.paginationContainer.innerHTML = '';
    }

    showNoArticles() {
        this.newsContainer.innerHTML = `<p class="col-span-full text-center text-gray-600 dark:text-gray-400">No news articles available.</p>`;
    }

    showError(msg) {
        this.newsContainer.innerHTML = `<p class="col-span-full text-center text-red-600 dark:text-red-400">${msg}</p>`;
    }

    hideLoadingState() {
        document.getElementById('loading-state')?.style.display = 'none';
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => new NewsAggregator());
