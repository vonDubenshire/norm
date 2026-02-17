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

// URL state persistence
function saveStateToURL() {
    const params = new URLSearchParams();
    if (state.searchTerm) params.set('q', state.searchTerm);
    if (state.category !== 'all') params.set('cat', state.category);
    if (state.sortBy !== 'title-asc') params.set('sort', state.sortBy);
    if (state.currentPage > 1) params.set('page', state.currentPage);
    const qs = params.toString();
    const url = window.location.pathname + (qs ? '?' + qs : '');
    history.replaceState(null, '', url);
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
    if (params.has('cat')) {
        state.category = params.get('cat');
        // Update active chip
        document.querySelectorAll('#category-chips .chip').forEach(chip => {
            chip.classList.toggle('active', chip.dataset.category === state.category);
        });
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
// State Management
// ===================================

const state = {
    videos: [],
    filteredVideos: [],
    currentPage: 1,
    videosPerPage: 12,
    searchTerm: '',
    sortBy: 'title-asc',
    category: 'all'
};

// ===================================
// Load Videos Data
// ===================================

async function loadVideos() {
    try {
        const response = await fetch('./consolidated_youtube_data.json');
        if (!response.ok) throw new Error('Failed to load videos');

        const rawVideos = await response.json();

        // Process and normalize video data
        state.videos = rawVideos.map((video, index) => ({
            id: index,
            url: extractVideoId(video['Video url'] || ''),
            title: video['Title'] || 'Untitled Video',
            description: video['Description'] || '',
            channel: video['Channel name'] || 'N/A',
            duration: video['Duration'] || 'N/A',
            views: video['Views'] || 'N/A',
            thumbnail: video['Thumbnail url'] || '',
            category: video['category'] || 'Other'
        })).filter(video => video.url); // Only keep videos with valid URLs

        updateCategoryCounts();
        state.filteredVideos = sortVideos([...state.videos]);

        document.getElementById('loading-state').style.display = 'none';
        updateTotalCount();
        renderVideos();
    } catch (error) {
        console.error('Error loading videos:', error);
        showError();
    }
}

function extractVideoId(url) {
    if (!url) return '';
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    return match ? match[1] : '';
}

function updateTotalCount() {
    document.getElementById('total-videos').textContent = state.videos.length;
}

function updateFilteredCount() {
    document.getElementById('filtered-count').textContent = state.filteredVideos.length;
}

function updateCategoryCounts() {
    const counts = { all: state.videos.length };
    state.videos.forEach(v => {
        counts[v.category] = (counts[v.category] || 0) + 1;
    });
    const map = {
        'all': 'count-all',
        'Late Night Appearance': 'count-late-night',
        'Standup': 'count-standup',
        'NML': 'count-nml',
        'Weekend Update': 'count-weekend-update',
        'Roast': 'count-roast',
        'Other': 'count-other'
    };
    for (const [cat, id] of Object.entries(map)) {
        const el = document.getElementById(id);
        if (el) el.textContent = counts[cat] || 0;
    }
}

// ===================================
// Search and Filter Logic
// ===================================

function parseDuration(dur) {
    if (!dur || dur === 'N/A') return 0;
    const parts = String(dur).split(':').map(Number);
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return parts[0] || 0;
}

function parseViews(views) {
    if (!views || views === 'N/A') return 0;
    const str = String(views).replace(/[^0-9]/g, '');
    return parseInt(str, 10) || 0;
}

function sortVideos(videos) {
    const sorted = [...videos];
    switch (state.sortBy) {
        case 'title-asc':
            sorted.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'title-desc':
            sorted.sort((a, b) => b.title.localeCompare(a.title));
            break;
        case 'views-desc':
            sorted.sort((a, b) => parseViews(b.views) - parseViews(a.views));
            break;
        case 'duration-desc':
            sorted.sort((a, b) => parseDuration(b.duration) - parseDuration(a.duration));
            break;
        case 'duration-asc':
            sorted.sort((a, b) => parseDuration(a.duration) - parseDuration(b.duration));
            break;
    }
    return sorted;
}

function applyFilters() {
    let filtered = state.videos.filter(video => {
        const matchesSearch = video.title.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
                            video.description.toLowerCase().includes(state.searchTerm.toLowerCase());
        const matchesCategory = state.category === 'all' || video.category === state.category;

        return matchesSearch && matchesCategory;
    });

    state.filteredVideos = sortVideos(filtered);
    state.currentPage = 1;
    updateFilteredCount();
    renderVideos();
    renderPagination();
    saveStateToURL();

    // Show NML crosslink when NML category is active
    const nmlBanner = document.getElementById('nml-crosslink');
    if (nmlBanner) {
        nmlBanner.style.display = state.category === 'NML' ? 'block' : 'none';
    }
}

function showRandomVideo() {
    if (state.filteredVideos.length === 0) return;
    const video = state.filteredVideos[Math.floor(Math.random() * state.filteredVideos.length)];
    window.open('https://www.youtube.com/watch?v=' + video.url, '_blank');
}

// ===================================
// Render Videos
// ===================================

function renderVideos() {
    const container = document.getElementById('videos-container');
    const emptyState = document.getElementById('empty-state');

    container.innerHTML = '';

    if (state.filteredVideos.length === 0) {
        container.style.display = 'none';
        emptyState.style.display = 'block';
        document.getElementById('pagination').style.display = 'none';
        return;
    }

    container.style.display = 'grid';
    emptyState.style.display = 'none';
    document.getElementById('pagination').style.display = 'flex';

    // Calculate pagination
    const startIndex = (state.currentPage - 1) * state.videosPerPage;
    const endIndex = startIndex + state.videosPerPage;
    const videosToShow = state.filteredVideos.slice(startIndex, endIndex);

    // Render videos using DocumentFragment for fewer reflows
    const fragment = document.createDocumentFragment();
    videosToShow.forEach(video => {
        const videoCard = createVideoCard(video);
        fragment.appendChild(videoCard);
    });
    container.appendChild(fragment);

    renderPagination();

    // Smooth scroll to top on page change
    if (state.currentPage > 1) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function createVideoCard(video) {
    const card = document.createElement('div');
    card.className = 'video-card';

    // Thumbnail
    const thumbnail = document.createElement('div');
    thumbnail.className = 'video-thumbnail';

    // Use an img element with lazy loading instead of background-image
    const thumbnailUrl = video.thumbnail !== 'N/A' && video.thumbnail
        ? video.thumbnail
        : `https://img.youtube.com/vi/${video.url}/mqdefault.jpg`;

    const thumbImg = document.createElement('img');
    thumbImg.src = thumbnailUrl;
    thumbImg.alt = video.title;
    thumbImg.loading = 'lazy';
    thumbImg.decoding = 'async';
    thumbImg.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
    thumbnail.appendChild(thumbImg);

    // Play overlay
    const playOverlay = document.createElement('div');
    playOverlay.className = 'play-overlay';
    playOverlay.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
    `;
    thumbnail.appendChild(playOverlay);

    // Video info
    const info = document.createElement('div');
    info.className = 'video-info';

    const title = document.createElement('h3');
    title.className = 'video-title';
    title.textContent = video.title;

    const meta = document.createElement('div');
    meta.className = 'video-meta';
    meta.innerHTML = `
        ${video.channel !== 'N/A' ? `<span class="video-channel">${video.channel}</span>` : ''}
        ${video.views !== 'N/A' ? `<span class="video-views">${video.views} views</span>` : ''}
    `;

    info.appendChild(title);
    info.appendChild(meta);

    // Click handler to open video
    card.addEventListener('click', () => {
        window.open(`https://www.youtube.com/watch?v=${video.url}`, '_blank');
    });

    card.appendChild(thumbnail);
    card.appendChild(info);

    return card;
}

// ===================================
// Pagination
// ===================================

function renderPagination() {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    const totalPages = Math.ceil(state.filteredVideos.length / state.videosPerPage);

    if (totalPages <= 1) {
        pagination.style.display = 'none';
        return;
    }

    pagination.style.display = 'flex';

    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.className = 'page-btn';
    prevBtn.textContent = '← Prev';
    prevBtn.disabled = state.currentPage === 1;
    prevBtn.onclick = () => {
        state.currentPage--;
        renderVideos();
        saveStateToURL();
    };
    pagination.appendChild(prevBtn);

    // Page numbers
    const maxPagesToShow = 5;
    let startPage = Math.max(1, state.currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = 'page-btn';
        if (i === state.currentPage) pageBtn.classList.add('active');
        pageBtn.textContent = i;
        pageBtn.onclick = () => {
            state.currentPage = i;
            renderVideos();
            saveStateToURL();
        };
        pagination.appendChild(pageBtn);
    }

    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'page-btn';
    nextBtn.textContent = 'Next →';
    nextBtn.disabled = state.currentPage === totalPages;
    nextBtn.onclick = () => {
        state.currentPage++;
        renderVideos();
        saveStateToURL();
    };
    pagination.appendChild(nextBtn);
}

// ===================================
// Error State
// ===================================

function showError() {
    const container = document.getElementById('videos-container');
    const loadingState = document.getElementById('loading-state');
    loadingState.style.display = 'none';
    container.innerHTML = `
        <div class="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <h3>Failed to load videos</h3>
            <p>Please refresh the page to try again</p>
        </div>
    `;
    container.style.display = 'block';
}

// ===================================
// Event Listeners
// ===================================

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

    // Category chips
    document.querySelectorAll('#category-chips .chip').forEach(chip => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('#category-chips .chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            state.category = chip.dataset.category;
            applyFilters();
        });
    });

    // Sort
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            state.sortBy = e.target.value;
            applyFilters();
        });
    }

    // Random video
    const randomBtn = document.getElementById('random-video-btn');
    if (randomBtn) {
        randomBtn.addEventListener('click', showRandomVideo);
    }
}

// ===================================
// Initialize App
// ===================================

async function init() {
    initTheme();
    initNav();
    initFooterQuote();
    loadStateFromURL();
    initEventListeners();
    await loadVideos();
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
