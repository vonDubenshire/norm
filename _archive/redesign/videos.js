// ===================================
// State Management
// ===================================

const state = {
    videos: [],
    filteredVideos: [],
    currentPage: 1,
    videosPerPage: 12,
    searchTerm: ''
};

// ===================================
// Theme Management
// ===================================

function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    }

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
        }
    });
}

// ===================================
// Load Videos Data
// ===================================

async function loadVideos() {
    try {
        const response = await fetch('../consolidated_youtube_data.json');
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
            thumbnail: video['Thumbnail url'] || ''
        })).filter(video => video.url); // Only keep videos with valid URLs

        state.filteredVideos = [...state.videos];

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

// ===================================
// Search and Filter Logic
// ===================================

function applyFilters() {
    state.filteredVideos = state.videos.filter(video => {
        const matchesSearch = video.title.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
                            video.description.toLowerCase().includes(state.searchTerm.toLowerCase());

        return matchesSearch;
    });

    state.currentPage = 1;
    updateFilteredCount();
    renderVideos();
    renderPagination();
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

    // Render videos
    videosToShow.forEach(video => {
        const videoCard = createVideoCard(video);
        container.appendChild(videoCard);
    });

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

    // Use YouTube thumbnail or placeholder
    const thumbnailUrl = video.thumbnail !== 'N/A' && video.thumbnail
        ? video.thumbnail
        : `https://img.youtube.com/vi/${video.url}/mqdefault.jpg`;

    thumbnail.style.backgroundImage = `url('${thumbnailUrl}')`;

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

    searchInput.addEventListener('input', (e) => {
        state.searchTerm = e.target.value;
        clearBtn.style.display = state.searchTerm ? 'block' : 'none';
        applyFilters();
    });

    clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        state.searchTerm = '';
        clearBtn.style.display = 'none';
        applyFilters();
    });
}

// ===================================
// Initialize App
// ===================================

async function init() {
    initTheme();
    initEventListeners();
    await loadVideos();
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
