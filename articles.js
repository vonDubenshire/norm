// ===================================
// Utilities
// ===================================

function debounce(fn, delay = 250) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

// ===================================
// Articles Page - State & Logic
// ===================================

const state = {
    articles: [],
    filteredArticles: [],
    currentPage: 1,
    articlesPerPage: 12,
    searchTerm: '',
    selectedCategory: ''
};

// ===================================
// Load Articles Data
// ===================================

async function loadArticles() {
    try {
        const response = await fetch('./articles-data.json');
        if (!response.ok) throw new Error('Failed to load articles');

        state.articles = await response.json();

        document.getElementById('loading-state').style.display = 'none';
        document.getElementById('total-articles').textContent = state.articles.length;

        if (state.articles.length === 0) {
            document.getElementById('empty-state').style.display = 'block';
            return;
        }

        // Show controls once data is loaded
        document.getElementById('controls-section').style.display = '';

        state.filteredArticles = [...state.articles];
        renderArticles();
        renderPagination();
    } catch (error) {
        console.error('Error loading articles:', error);
        document.getElementById('loading-state').style.display = 'none';
        document.getElementById('empty-state').style.display = 'block';
    }
}

// ===================================
// Search and Filter Logic
// ===================================

function applyFilters() {
    const term = state.searchTerm.toLowerCase();

    state.filteredArticles = state.articles.filter(article => {
        const matchesSearch = !term ||
            article.title.toLowerCase().includes(term) ||
            article.source.toLowerCase().includes(term) ||
            article.excerpt.toLowerCase().includes(term) ||
            (article.tags && article.tags.some(t => t.toLowerCase().includes(term)));

        const matchesCategory = !state.selectedCategory ||
            article.category === state.selectedCategory;

        return matchesSearch && matchesCategory;
    });

    state.currentPage = 1;

    const filteredWrapper = document.getElementById('filtered-count-wrapper');
    const filteredCount = document.getElementById('filtered-count');
    if (state.searchTerm || state.selectedCategory) {
        filteredWrapper.style.display = '';
        filteredCount.textContent = state.filteredArticles.length;
    } else {
        filteredWrapper.style.display = 'none';
    }

    renderArticles();
    renderPagination();
}

// ===================================
// Render Articles
// ===================================

function renderArticles() {
    const container = document.getElementById('articles-container');
    const emptyState = document.getElementById('empty-state');

    container.innerHTML = '';

    if (state.filteredArticles.length === 0) {
        container.style.display = 'none';
        emptyState.style.display = 'block';
        emptyState.querySelector('h3').textContent = state.searchTerm || state.selectedCategory
            ? 'No matching articles'
            : 'No articles yet';
        emptyState.querySelector('p').textContent = state.searchTerm || state.selectedCategory
            ? 'Try a different search or filter'
            : 'More coming soon';
        return;
    }

    container.style.display = 'grid';
    emptyState.style.display = 'none';

    // Pagination
    const startIndex = (state.currentPage - 1) * state.articlesPerPage;
    const endIndex = startIndex + state.articlesPerPage;
    const articlesToShow = state.filteredArticles.slice(startIndex, endIndex);

    const fragment = document.createDocumentFragment();
    articlesToShow.forEach((article, index) => {
        const card = createArticleCard(article);
        card.style.animationDelay = (index * 0.05) + 's';
        fragment.appendChild(card);
    });
    container.appendChild(fragment);
}

function createArticleCard(article) {
    const card = document.createElement('a');
    card.className = 'joke-card article-card';
    card.href = article.url;
    card.target = '_blank';
    card.rel = 'noopener noreferrer';
    card.style.textDecoration = 'none';
    card.style.color = 'inherit';
    card.style.cursor = 'pointer';

    // Title
    const title = document.createElement('h3');
    title.className = 'article-title';
    title.textContent = article.title;

    // Excerpt
    const excerpt = document.createElement('p');
    excerpt.className = 'article-excerpt';
    excerpt.textContent = article.excerpt || '';

    // Meta row: source + category + date
    const meta = document.createElement('div');
    meta.className = 'joke-meta';

    // Source badge
    const sourceBadge = document.createElement('span');
    sourceBadge.className = 'joke-badge';
    sourceBadge.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>';
    const sourceText = document.createElement('span');
    sourceText.textContent = article.source;
    sourceBadge.appendChild(sourceText);
    meta.appendChild(sourceBadge);

    // Category badge
    if (article.category) {
        const catBadge = document.createElement('span');
        catBadge.className = 'joke-badge';
        catBadge.textContent = article.category.charAt(0).toUpperCase() + article.category.slice(1);
        meta.appendChild(catBadge);
    }

    // Date badge
    if (article.date) {
        const dateBadge = document.createElement('span');
        dateBadge.className = 'joke-badge';
        dateBadge.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>';
        const dateText = document.createElement('span');
        dateText.textContent = formatDate(article.date);
        dateBadge.appendChild(dateText);
        meta.appendChild(dateBadge);
    }

    // External icon
    const extBadge = document.createElement('span');
    extBadge.className = 'joke-badge';
    extBadge.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg> <span>Read</span>';
    meta.appendChild(extBadge);

    card.appendChild(title);
    card.appendChild(excerpt);
    card.appendChild(meta);

    return card;
}

function formatDate(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// ===================================
// Pagination
// ===================================

function renderPagination() {
    let pagination = document.getElementById('pagination');
    if (!pagination) {
        pagination = document.createElement('div');
        pagination.id = 'pagination';
        pagination.className = 'pagination';
        document.querySelector('.articles-section').appendChild(pagination);
    }
    pagination.innerHTML = '';

    const totalPages = Math.ceil(state.filteredArticles.length / state.articlesPerPage);

    if (totalPages <= 1) {
        pagination.style.display = 'none';
        return;
    }

    pagination.style.display = 'flex';

    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.className = 'page-btn';
    prevBtn.textContent = '\u2190 Prev';
    prevBtn.disabled = state.currentPage === 1;
    prevBtn.onclick = () => {
        state.currentPage--;
        renderArticles();
        renderPagination();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    pagination.appendChild(prevBtn);

    // Page numbers
    const maxPages = 5;
    let startPage = Math.max(1, state.currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxPages - 1);
    if (endPage - startPage < maxPages - 1) {
        startPage = Math.max(1, endPage - maxPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = 'page-btn';
        if (i === state.currentPage) pageBtn.classList.add('active');
        pageBtn.textContent = i;
        pageBtn.onclick = () => {
            state.currentPage = i;
            renderArticles();
            renderPagination();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };
        pagination.appendChild(pageBtn);
    }

    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'page-btn';
    nextBtn.textContent = 'Next \u2192';
    nextBtn.disabled = state.currentPage === totalPages;
    nextBtn.onclick = () => {
        state.currentPage++;
        renderArticles();
        renderPagination();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    pagination.appendChild(nextBtn);
}

// ===================================
// Event Listeners
// ===================================

function initEventListeners() {
    const searchInput = document.getElementById('search-input');
    const clearBtn = document.getElementById('clear-search');
    const categoryFilter = document.getElementById('category-filter');

    if (searchInput) {
        const debouncedFilter = debounce(() => applyFilters(), 250);

        searchInput.addEventListener('input', (e) => {
            state.searchTerm = e.target.value;
            clearBtn.style.display = state.searchTerm ? 'block' : 'none';
            debouncedFilter();
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            searchInput.value = '';
            state.searchTerm = '';
            clearBtn.style.display = 'none';
            applyFilters();
        });
    }

    if (categoryFilter) {
        categoryFilter.addEventListener('change', (e) => {
            state.selectedCategory = e.target.value;
            applyFilters();
        });
    }
}

// ===================================
// Initialize
// ===================================

function init() {
    initTheme();
    initNav();
    initFooterQuote();
    initEventListeners();
    loadArticles();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
