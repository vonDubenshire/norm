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

function saveStateToURL() {
    const params = new URLSearchParams();
    if (state.searchTerm) params.set('q', state.searchTerm);
    if (state.sortBy !== 'date-desc') params.set('sort', state.sortBy);
    if (state.currentPage > 1) params.set('page', state.currentPage);
    const qs = params.toString();
    history.replaceState(null, '', window.location.pathname + (qs ? '?' + qs : ''));
}

function loadStateFromURL() {
    const params = new URLSearchParams(window.location.search);
    if (params.has('q')) {
        state.searchTerm = params.get('q');
        const searchInput = document.getElementById('search-input');
        if (searchInput) searchInput.value = state.searchTerm;
        const clearBtn = document.getElementById('clear-search');
        if (clearBtn) clearBtn.style.display = state.searchTerm ? 'block' : 'none';
    }
    if (params.has('sort')) {
        state.sortBy = params.get('sort');
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) sortSelect.value = state.sortBy;
    }
    if (params.has('page')) {
        state.currentPage = parseInt(params.get('page'), 10) || 1;
    }
}

// ===================================
// Appearances Page
// ===================================

const state = {
    appearances: [],
    filteredAppearances: [],
    currentPage: 1,
    perPage: 20,
    searchTerm: '',
    sortBy: 'date-desc'
};

function parseDate(dateStr) {
    if (!dateStr) return 0;
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? 0 : d.getTime();
}

function sortAppearances(items) {
    const sorted = [...items];
    switch (state.sortBy) {
        case 'date-desc':
            sorted.sort((a, b) => parseDate(b.date) - parseDate(a.date));
            break;
        case 'date-asc':
            sorted.sort((a, b) => parseDate(a.date) - parseDate(b.date));
            break;
        case 'title-asc':
            sorted.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'title-desc':
            sorted.sort((a, b) => b.title.localeCompare(a.title));
            break;
    }
    return sorted;
}

function showRandomAppearance() {
    if (state.filteredAppearances.length === 0) return;
    const item = state.filteredAppearances[Math.floor(Math.random() * state.filteredAppearances.length)];
    if (item.media_url) {
        window.open(item.media_url, '_blank');
    } else {
        // Scroll to a random page showing this item
        const idx = state.filteredAppearances.indexOf(item);
        state.currentPage = Math.floor(idx / state.perPage) + 1;
        renderAppearances();
    }
}

async function loadAppearances() {
    try {
        const response = await fetch('./competitor_data/appearances.json');
        if (!response.ok) throw new Error('Failed to load appearances');

        state.appearances = await response.json();
        state.filteredAppearances = sortAppearances([...state.appearances]);

        document.getElementById('loading-state').style.display = 'none';
        document.getElementById('total-appearances').textContent = state.appearances.length;
        document.getElementById('filtered-count').textContent = state.appearances.length;
        renderAppearances();
    } catch (error) {
        console.error('Error loading appearances:', error);
        document.getElementById('loading-state').innerHTML = '<h3>Failed to load</h3><p>Please refresh</p>';
    }
}

function applyFilters() {
    const term = state.searchTerm.toLowerCase();
    const filtered = state.appearances.filter(a => {
        return a.title.toLowerCase().includes(term) ||
               (a.description && a.description.toLowerCase().includes(term)) ||
               (a.show && a.show.toLowerCase().includes(term));
    });
    state.filteredAppearances = sortAppearances(filtered);
    state.currentPage = 1;
    document.getElementById('filtered-count').textContent = state.filteredAppearances.length;
    renderAppearances();
    renderPagination();
    saveStateToURL();
}

function renderAppearances() {
    const container = document.getElementById('appearances-container');
    const emptyState = document.getElementById('empty-state');
    container.innerHTML = '';

    if (state.filteredAppearances.length === 0) {
        container.style.display = 'none';
        emptyState.style.display = 'block';
        document.getElementById('pagination').style.display = 'none';
        return;
    }

    container.style.display = 'grid';
    emptyState.style.display = 'none';

    const start = (state.currentPage - 1) * state.perPage;
    const end = start + state.perPage;
    const page = state.filteredAppearances.slice(start, end);

    const fragment = document.createDocumentFragment();
    page.forEach(appearance => {
        fragment.appendChild(createCard(appearance));
    });
    container.appendChild(fragment);
    renderPagination();

    if (state.currentPage > 1) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function createCard(item) {
    const card = document.createElement('div');
    card.className = 'joke-card';
    card.style.cursor = item.media_url ? 'pointer' : 'default';

    const title = document.createElement('h3');
    title.className = 'joke-text';
    title.style.fontSize = '1.1rem';
    title.style.fontWeight = '600';
    title.textContent = item.title;

    const desc = document.createElement('p');
    desc.style.color = 'var(--text-2)';
    desc.style.marginTop = 'var(--spacing-xs)';
    desc.style.fontSize = '0.9rem';
    desc.style.lineHeight = '1.5';
    desc.textContent = item.description || '';

    const meta = document.createElement('div');
    meta.className = 'joke-meta';

    if (item.date) {
        const dateBadge = document.createElement('span');
        dateBadge.className = 'joke-badge';
        dateBadge.textContent = item.date;
        meta.appendChild(dateBadge);
    }

    if (item.media_type) {
        const typeBadge = document.createElement('span');
        typeBadge.className = 'joke-badge';
        typeBadge.textContent = item.media_type;
        meta.appendChild(typeBadge);
    }

    if (item.duration) {
        const durBadge = document.createElement('span');
        durBadge.className = 'joke-badge';
        durBadge.textContent = item.duration;
        meta.appendChild(durBadge);
    }

    card.appendChild(title);
    card.appendChild(desc);
    card.appendChild(meta);

    if (item.media_url) {
        card.addEventListener('click', () => {
            window.open(item.media_url, '_blank');
        });
    }

    return card;
}

function renderPagination() {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    const totalPages = Math.ceil(state.filteredAppearances.length / state.perPage);
    if (totalPages <= 1) {
        pagination.style.display = 'none';
        return;
    }

    pagination.style.display = 'flex';

    const prevBtn = document.createElement('button');
    prevBtn.className = 'page-btn';
    prevBtn.textContent = '\u2190 Prev';
    prevBtn.disabled = state.currentPage === 1;
    prevBtn.onclick = () => { state.currentPage--; renderAppearances(); saveStateToURL(); };
    pagination.appendChild(prevBtn);

    const maxPages = 5;
    let startPage = Math.max(1, state.currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxPages - 1);
    if (endPage - startPage < maxPages - 1) {
        startPage = Math.max(1, endPage - maxPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        const btn = document.createElement('button');
        btn.className = 'page-btn';
        if (i === state.currentPage) btn.classList.add('active');
        btn.textContent = i;
        btn.onclick = () => { state.currentPage = i; renderAppearances(); saveStateToURL(); };
        pagination.appendChild(btn);
    }

    const nextBtn = document.createElement('button');
    nextBtn.className = 'page-btn';
    nextBtn.textContent = 'Next \u2192';
    nextBtn.disabled = state.currentPage === totalPages;
    nextBtn.onclick = () => { state.currentPage++; renderAppearances(); saveStateToURL(); };
    pagination.appendChild(nextBtn);
}

function initEventListeners() {
    const searchInput = document.getElementById('search-input');
    const clearBtn = document.getElementById('clear-search');

    const debouncedFilter = debounce(() => applyFilters(), 250);

    searchInput.addEventListener('input', (e) => {
        state.searchTerm = e.target.value;
        clearBtn.style.display = state.searchTerm ? 'block' : 'none';
        debouncedFilter();
    });

    clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        state.searchTerm = '';
        clearBtn.style.display = 'none';
        applyFilters();
    });

    // Sort
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            state.sortBy = e.target.value;
            applyFilters();
        });
    }

    // Random appearance
    const randomBtn = document.getElementById('random-appearance-btn');
    if (randomBtn) {
        randomBtn.addEventListener('click', showRandomAppearance);
    }
}

async function init() {
    initTheme();
    initNav();
    initFooterQuote();
    loadStateFromURL();
    initEventListeners();
    await loadAppearances();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
