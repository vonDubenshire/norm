// ===================================
// Utilities
// ===================================

function debounce(fn, delay) {
    var timer;
    return function() {
        var args = arguments;
        var ctx = this;
        clearTimeout(timer);
        timer = setTimeout(function() { fn.apply(ctx, args); }, delay || 250);
    };
}

function extractVideoId(url) {
    if (!url) return '';
    var match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    return match ? match[1] : '';
}

// ===================================
// URL State Persistence
// ===================================

function saveStateToURL() {
    var params = new URLSearchParams();
    if (state.searchTerm) params.set('q', state.searchTerm);
    if (state.typeFilter !== 'all') params.set('type', state.typeFilter);
    if (state.sortBy !== 'year-desc') params.set('sort', state.sortBy);
    if (state.currentPage > 1) params.set('page', state.currentPage);
    var qs = params.toString();
    history.replaceState(null, '', window.location.pathname + (qs ? '?' + qs : ''));
}

function loadStateFromURL() {
    var params = new URLSearchParams(window.location.search);
    if (params.has('q')) {
        state.searchTerm = params.get('q');
        var searchInput = document.getElementById('search-input');
        if (searchInput) searchInput.value = state.searchTerm;
        var clearBtn = document.getElementById('clear-search');
        if (clearBtn) clearBtn.style.display = state.searchTerm ? 'block' : 'none';
    }
    if (params.has('type')) {
        state.typeFilter = params.get('type');
        document.querySelectorAll('#type-chips .chip').forEach(function(chip) {
            chip.classList.toggle('active', chip.dataset.type === state.typeFilter);
        });
    }
    if (params.has('sort')) {
        state.sortBy = params.get('sort');
        var sortSelect = document.getElementById('sort-select');
        if (sortSelect) sortSelect.value = state.sortBy;
    }
    if (params.has('page')) {
        state.currentPage = parseInt(params.get('page'), 10) || 1;
    }
}

// ===================================
// State
// ===================================

var state = {
    performances: [],
    filtered: [],
    currentPage: 1,
    perPage: 24,
    searchTerm: '',
    sortBy: 'year-desc',
    typeFilter: 'all'
};

// ===================================
// Data Loading
// ===================================

async function loadData() {
    try {
        var response = await fetch('./standup-specials.json');
        if (!response.ok) throw new Error('Failed to load standup data');

        var raw = await response.json();

        state.performances = raw.map(function(item) {
            var videoId = extractVideoId(item.youtube_url || '');
            // Clean up boilerplate descriptions
            var desc = item.description || '';
            if (desc === 'Video url:' || desc.indexOf('Standup archive entry:') === 0) {
                desc = '';
            }
            return {
                id: item.id,
                title: item.title || 'Untitled',
                year: item.year || null,
                venue: item.venue || '',
                description: desc,
                youtube_url: item.youtube_url || '',
                videoId: videoId,
                thumbnail: videoId
                    ? 'https://img.youtube.com/vi/' + videoId + '/mqdefault.jpg'
                    : (item.thumbnail || ''),
                type: item.type || 'appearance'
            };
        });

        updateTypeCounts();
        state.filtered = sortPerformances([].concat(state.performances));

        document.getElementById('loading-state').style.display = 'none';
        document.getElementById('total-standup').textContent = state.performances.length;
        document.getElementById('filtered-count').textContent = state.performances.length;
        renderGrid();
    } catch (error) {
        console.error('Error loading standup data:', error);
        var loading = document.getElementById('loading-state');
        loading.innerHTML = '<h3>Failed to load</h3><p>Please refresh the page</p>';
    }
}

function updateTypeCounts() {
    var counts = { all: state.performances.length, set: 0, appearance: 0 };
    state.performances.forEach(function(p) {
        counts[p.type] = (counts[p.type] || 0) + 1;
    });
    var el;
    el = document.getElementById('count-all');
    if (el) el.textContent = counts.all;
    el = document.getElementById('count-set');
    if (el) el.textContent = counts.set || 0;
    el = document.getElementById('count-appearance');
    if (el) el.textContent = counts.appearance || 0;
}

// ===================================
// Sort and Filter
// ===================================

function sortPerformances(items) {
    var sorted = [].concat(items);
    switch (state.sortBy) {
        case 'year-desc':
            sorted.sort(function(a, b) { return (b.year || 0) - (a.year || 0); });
            break;
        case 'year-asc':
            sorted.sort(function(a, b) { return (a.year || 9999) - (b.year || 9999); });
            break;
        case 'title-asc':
            sorted.sort(function(a, b) { return a.title.localeCompare(b.title); });
            break;
        case 'title-desc':
            sorted.sort(function(a, b) { return b.title.localeCompare(a.title); });
            break;
    }
    return sorted;
}

function applyFilters() {
    var term = state.searchTerm.toLowerCase();
    var filtered = state.performances.filter(function(p) {
        var matchesSearch = !term ||
            p.title.toLowerCase().indexOf(term) !== -1 ||
            p.description.toLowerCase().indexOf(term) !== -1 ||
            p.venue.toLowerCase().indexOf(term) !== -1 ||
            (p.year && String(p.year).indexOf(term) !== -1);
        var matchesType = state.typeFilter === 'all' || p.type === state.typeFilter;
        return matchesSearch && matchesType;
    });

    state.filtered = sortPerformances(filtered);
    state.currentPage = 1;
    document.getElementById('filtered-count').textContent = state.filtered.length;
    renderGrid();
    renderPagination();
    saveStateToURL();
}

function showRandom() {
    if (state.filtered.length === 0) return;
    var item = state.filtered[Math.floor(Math.random() * state.filtered.length)];
    if (item.youtube_url) {
        window.open(item.youtube_url, '_blank');
    }
}

// ===================================
// Render
// ===================================

function renderGrid() {
    var container = document.getElementById('standup-container');
    var emptyState = document.getElementById('empty-state');
    container.innerHTML = '';

    if (state.filtered.length === 0) {
        container.style.display = 'none';
        emptyState.style.display = 'block';
        document.getElementById('pagination').style.display = 'none';
        return;
    }

    container.style.display = 'grid';
    emptyState.style.display = 'none';

    var start = (state.currentPage - 1) * state.perPage;
    var end = start + state.perPage;
    var page = state.filtered.slice(start, end);

    var fragment = document.createDocumentFragment();
    page.forEach(function(item) {
        fragment.appendChild(createCard(item));
    });
    container.appendChild(fragment);
    renderPagination();

    if (state.currentPage > 1) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function createCard(item) {
    var card = document.createElement('div');
    card.className = 'video-card';

    // Thumbnail
    var thumb = document.createElement('div');
    thumb.className = 'video-thumbnail';

    if (item.thumbnail) {
        var img = document.createElement('img');
        img.src = item.thumbnail;
        img.alt = item.title;
        img.loading = 'lazy';
        img.decoding = 'async';
        img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
        thumb.appendChild(img);
    }

    // Play overlay
    var playOverlay = document.createElement('div');
    playOverlay.className = 'play-overlay';
    playOverlay.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
    thumb.appendChild(playOverlay);

    // Year badge on thumbnail
    if (item.year) {
        var yearBadge = document.createElement('span');
        yearBadge.className = 'standup-year-badge';
        yearBadge.textContent = item.year;
        thumb.appendChild(yearBadge);
    }

    // Type badge on thumbnail
    if (item.type === 'set') {
        var typeBadge = document.createElement('span');
        typeBadge.className = 'standup-type-badge';
        typeBadge.textContent = 'Full Set';
        thumb.appendChild(typeBadge);
    }

    // Info section
    var info = document.createElement('div');
    info.className = 'video-info';

    var title = document.createElement('h3');
    title.className = 'video-title';
    title.textContent = item.title;
    info.appendChild(title);

    var meta = document.createElement('div');
    meta.className = 'video-meta';

    if (item.venue) {
        var venueSpan = document.createElement('span');
        venueSpan.className = 'video-channel';
        venueSpan.textContent = item.venue;
        meta.appendChild(venueSpan);
    }

    if (item.description) {
        var descSpan = document.createElement('span');
        descSpan.className = 'video-views';
        // Truncate long descriptions
        descSpan.textContent = item.description.length > 80
            ? item.description.substring(0, 80) + '...'
            : item.description;
        meta.appendChild(descSpan);
    }

    info.appendChild(meta);

    // Click to open
    if (item.youtube_url) {
        card.addEventListener('click', function() {
            window.open(item.youtube_url, '_blank');
        });
    }

    card.appendChild(thumb);
    card.appendChild(info);
    return card;
}

// ===================================
// Pagination
// ===================================

function renderPagination() {
    var pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    var totalPages = Math.ceil(state.filtered.length / state.perPage);
    if (totalPages <= 1) {
        pagination.style.display = 'none';
        return;
    }

    pagination.style.display = 'flex';

    var prevBtn = document.createElement('button');
    prevBtn.className = 'page-btn';
    prevBtn.textContent = '\u2190 Prev';
    prevBtn.disabled = state.currentPage === 1;
    prevBtn.onclick = function() { state.currentPage--; renderGrid(); saveStateToURL(); };
    pagination.appendChild(prevBtn);

    var maxPages = 5;
    var startPage = Math.max(1, state.currentPage - 2);
    var endPage = Math.min(totalPages, startPage + maxPages - 1);
    if (endPage - startPage < maxPages - 1) {
        startPage = Math.max(1, endPage - maxPages + 1);
    }

    for (var i = startPage; i <= endPage; i++) {
        var btn = document.createElement('button');
        btn.className = 'page-btn';
        if (i === state.currentPage) btn.classList.add('active');
        btn.textContent = i;
        btn.onclick = (function(page) {
            return function() { state.currentPage = page; renderGrid(); saveStateToURL(); };
        })(i);
        pagination.appendChild(btn);
    }

    var nextBtn = document.createElement('button');
    nextBtn.className = 'page-btn';
    nextBtn.textContent = 'Next \u2192';
    nextBtn.disabled = state.currentPage === totalPages;
    nextBtn.onclick = function() { state.currentPage++; renderGrid(); saveStateToURL(); };
    pagination.appendChild(nextBtn);
}

// ===================================
// Event Listeners
// ===================================

function initEventListeners() {
    var searchInput = document.getElementById('search-input');
    var clearBtn = document.getElementById('clear-search');
    var debouncedFilter = debounce(function() { applyFilters(); }, 250);

    searchInput.addEventListener('input', function(e) {
        state.searchTerm = e.target.value;
        clearBtn.style.display = state.searchTerm ? 'block' : 'none';
        debouncedFilter();
    });

    clearBtn.addEventListener('click', function() {
        searchInput.value = '';
        state.searchTerm = '';
        clearBtn.style.display = 'none';
        applyFilters();
    });

    // Type filter chips
    document.querySelectorAll('#type-chips .chip').forEach(function(chip) {
        chip.addEventListener('click', function() {
            document.querySelectorAll('#type-chips .chip').forEach(function(c) {
                c.classList.remove('active');
            });
            chip.classList.add('active');
            state.typeFilter = chip.dataset.type;
            applyFilters();
        });
    });

    // Sort
    var sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', function(e) {
            state.sortBy = e.target.value;
            applyFilters();
        });
    }

    // Random
    var randomBtn = document.getElementById('random-standup-btn');
    if (randomBtn) {
        randomBtn.addEventListener('click', showRandom);
    }
}

// ===================================
// Init
// ===================================

async function init() {
    initTheme();
    initNav();
    initFooterQuote();
    loadStateFromURL();
    initEventListeners();
    await loadData();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
