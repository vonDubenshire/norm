// ===================================
// NML Episodes Page
// ===================================

const state = {
    episodes: [],
    filteredEpisodes: [],
    season: 'all'
};

function extractVideoId(url) {
    if (!url) return '';
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    return match ? match[1] : '';
}

async function loadEpisodes() {
    try {
        const response = await fetch('./nml-episodes-data.json');
        if (!response.ok) throw new Error('Failed to load episodes');

        state.episodes = await response.json();
        state.filteredEpisodes = [...state.episodes];

        const linked = state.episodes.filter(e => e.youtube_url).length;
        document.getElementById('total-episodes').textContent = state.episodes.length;
        document.getElementById('linked-count').textContent = linked;

        document.getElementById('loading-state').style.display = 'none';
        renderEpisodes();
    } catch (error) {
        console.error('Error loading NML episodes:', error);
        document.getElementById('loading-state').innerHTML =
            '<h3>Failed to load episodes</h3><p>Please refresh the page to try again</p>';
    }
}

function applyFilter() {
    if (state.season === 'all') {
        state.filteredEpisodes = [...state.episodes];
    } else {
        const s = parseInt(state.season, 10);
        state.filteredEpisodes = state.episodes.filter(e => e.season === s);
    }
    renderEpisodes();
}

function renderEpisodes() {
    const container = document.getElementById('episodes-container');
    container.innerHTML = '';

    // Group by season
    const seasons = {};
    state.filteredEpisodes.forEach(ep => {
        if (!seasons[ep.season]) seasons[ep.season] = [];
        seasons[ep.season].push(ep);
    });

    const fragment = document.createDocumentFragment();

    Object.keys(seasons).sort((a, b) => a - b).forEach(seasonNum => {
        const seasonHeader = document.createElement('h2');
        seasonHeader.className = 'section-title nml-season-title';
        seasonHeader.textContent = 'Season ' + seasonNum;
        fragment.appendChild(seasonHeader);

        const grid = document.createElement('div');
        grid.className = 'nml-episode-grid';

        seasons[seasonNum].forEach(ep => {
            grid.appendChild(createEpisodeCard(ep));
        });

        fragment.appendChild(grid);
    });

    container.appendChild(fragment);
}

function createEpisodeCard(ep) {
    const card = document.createElement('div');
    card.className = 'nml-card' + (ep.youtube_url ? ' has-video' : '');

    const videoId = extractVideoId(ep.youtube_url);
    const thumbUrl = (ep.thumbnail && ep.thumbnail !== 'N/A')
        ? ep.thumbnail
        : videoId
            ? 'https://img.youtube.com/vi/' + videoId + '/mqdefault.jpg'
            : '';

    // Thumbnail area
    if (thumbUrl) {
        const thumb = document.createElement('div');
        thumb.className = 'nml-thumb';
        const img = document.createElement('img');
        img.src = thumbUrl;
        img.alt = ep.guest;
        img.loading = 'lazy';
        img.decoding = 'async';
        thumb.appendChild(img);

        const overlay = document.createElement('div');
        overlay.className = 'play-overlay';
        overlay.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
        thumb.appendChild(overlay);
        card.appendChild(thumb);
    }

    // Info
    const info = document.createElement('div');
    info.className = 'nml-info';

    const epLabel = document.createElement('span');
    epLabel.className = 'nml-ep-label';
    epLabel.textContent = 'S' + ep.season + ' E' + ep.episode;
    info.appendChild(epLabel);

    const guest = document.createElement('h3');
    guest.className = 'nml-guest';
    guest.textContent = ep.guest;
    info.appendChild(guest);

    // Actions
    const actions = document.createElement('div');
    actions.className = 'nml-actions';

    if (ep.youtube_url) {
        const watchBtn = document.createElement('a');
        watchBtn.href = ep.youtube_url;
        watchBtn.target = '_blank';
        watchBtn.rel = 'noopener';
        watchBtn.className = 'btn btn-primary btn-sm';
        watchBtn.textContent = 'Watch';
        actions.appendChild(watchBtn);
    }

    if (ep.archive_url) {
        const archiveBtn = document.createElement('a');
        archiveBtn.href = ep.archive_url;
        archiveBtn.target = '_blank';
        archiveBtn.rel = 'noopener';
        archiveBtn.className = 'btn btn-secondary btn-sm';
        archiveBtn.textContent = 'Archive';
        actions.appendChild(archiveBtn);
    }

    info.appendChild(actions);
    card.appendChild(info);

    if (ep.youtube_url) {
        card.style.cursor = 'pointer';
        card.addEventListener('click', (e) => {
            if (e.target.closest('a')) return;
            window.open(ep.youtube_url, '_blank');
        });
    }

    return card;
}

function initEventListeners() {
    document.querySelectorAll('#season-chips .chip').forEach(chip => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('#season-chips .chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            state.season = chip.dataset.season;
            applyFilter();
        });
    });
}

async function init() {
    initTheme();
    initNav();
    initFooterQuote();
    initEventListeners();
    await loadEpisodes();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
