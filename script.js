// ===================================
// State Management
// ===================================

const state = {
    jokes: [],
    filteredJokes: [],
    currentPage: 1,
    jokesPerPage: 10,
    searchTerm: '',
    selectedGuest: '',
    currentRandomJoke: null
};

// ===================================
// Load Jokes Data
// ===================================

async function loadJokes() {
    try {
        const response = await fetch('./jokes-data.json?v=2');
        if (!response.ok) throw new Error('Failed to load jokes');

        state.jokes = await response.json();
        state.filteredJokes = [...state.jokes];

        updateTotalCount();
        populateGuestFilter();
        renderJokes();
    } catch (error) {
        console.error('Error loading jokes:', error);
        showError();
    }
}

function updateTotalCount() {
    document.getElementById('total-jokes').textContent = state.jokes.length;
}

function updateFilteredCount() {
    document.getElementById('filtered-count').textContent = state.filteredJokes.length;
}

// ===================================
// Guest Filter Population
// ===================================

function populateGuestFilter() {
    const guestFilter = document.getElementById("guest-filter");
    const guestsSet = new Set();

    // Single pass to collect unique non-empty guests
    state.jokes.forEach(joke => {
        if (joke.guest) {
            guestsSet.add(joke.guest);
        }
    });

    const guests = Array.from(guestsSet).sort();
    const fragment = document.createDocumentFragment();

    guests.forEach(guest => {
        const option = document.createElement("option");
        option.value = guest;
        option.textContent = guest;
        fragment.appendChild(option);
    });

    guestFilter.appendChild(fragment);
}

// ===================================
// Search and Filter Logic
// ===================================

function applyFilters() {
    state.filteredJokes = state.jokes.filter(joke => {
        const matchesSearch = joke.joke.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
                            joke.guest?.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
                            joke.episode?.toLowerCase().includes(state.searchTerm.toLowerCase());

        const matchesGuest = !state.selectedGuest || joke.guest === state.selectedGuest;

        return matchesSearch && matchesGuest;
    });

    state.currentPage = 1;
    updateFilteredCount();
    renderJokes();
    renderPagination();
}

// ===================================
// Render Jokes
// ===================================

function renderJokes() {
    const container = document.getElementById('jokes-container');
    const emptyState = document.getElementById('empty-state');

    // Clear container
    container.innerHTML = '';

    // Check if no jokes
    if (state.filteredJokes.length === 0) {
        container.style.display = 'none';
        emptyState.style.display = 'block';
        document.getElementById('pagination').style.display = 'none';
        return;
    }

    container.style.display = 'grid';
    emptyState.style.display = 'none';
    document.getElementById('pagination').style.display = 'flex';

    // Calculate pagination
    const startIndex = (state.currentPage - 1) * state.jokesPerPage;
    const endIndex = startIndex + state.jokesPerPage;
    const jokesToShow = state.filteredJokes.slice(startIndex, endIndex);

    // Render jokes
    const fragment = document.createDocumentFragment();
    jokesToShow.forEach(joke => {
        const jokeCard = createJokeCard(joke);
        fragment.appendChild(jokeCard);
    });
    container.appendChild(fragment);

    renderPagination();

    // Smooth scroll to top on page change
    if (state.currentPage > 1) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Helper function to safely render joke text with paragraph breaks (XSS-safe)
function renderJokeText(element, jokeText) {
    element.textContent = ''; // Clear existing content

    // Split by double newlines for paragraphs
    const paragraphs = jokeText.split('\n\n');
    paragraphs.forEach((para, index) => {
        // Split by single newlines within paragraphs
        const lines = para.split('\n');
        lines.forEach((line, lineIndex) => {
            const textNode = document.createTextNode(line);
            element.appendChild(textNode);
            if (lineIndex < lines.length - 1) {
                element.appendChild(document.createElement('br'));
            }
        });
        if (index < paragraphs.length - 1) {
            element.appendChild(document.createElement('br'));
            element.appendChild(document.createElement('br'));
        }
    });
}

function createJokeCard(joke) {
    const card = document.createElement('div');
    card.className = 'joke-card';

    const jokeText = document.createElement('p');
    jokeText.className = 'joke-text';
    // Safely render joke text with paragraph breaks
    renderJokeText(jokeText, joke.joke);

    const meta = document.createElement('div');
    meta.className = 'joke-meta';

    if (joke.episode) {
        meta.appendChild(createBadge('episode', joke.episode));
    }

    if (joke.guest) {
        meta.appendChild(createBadge('guest', joke.guest));
    }

    if (joke.time) {
        meta.appendChild(createBadge('time', joke.time));
    }

    const actions = document.createElement('div');
    actions.className = 'joke-actions';

    if (joke.url) {
        const watchBtn = createActionButton('Watch', 'video', () => {
            window.open(`https://youtube.com/watch?v=${joke.url}`, '_blank');
        });
        actions.appendChild(watchBtn);
    }

    const shareBtn = createActionButton('Share', 'share', () => {
        shareJoke(joke);
    });
    actions.appendChild(shareBtn);

    card.appendChild(jokeText);
    card.appendChild(meta);
    card.appendChild(actions);

    return card;
}

function createBadge(type, text) {
    const badge = document.createElement('span');
    badge.className = 'joke-badge';

    let icon = '';
    if (type === 'episode') {
        icon = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>';
    } else if (type === 'guest') {
        icon = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
    } else if (type === 'time') {
        icon = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>';
    }

    badge.innerHTML = `${icon} <span>${text}</span>`;
    return badge;
}

function createActionButton(text, type, onClick) {
    const button = document.createElement('button');
    button.className = 'action-btn';

    let icon = '';
    if (type === 'video') {
        icon = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
    } else if (type === 'share') {
        icon = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>';
    }

    button.innerHTML = `${icon} <span>${text}</span>`;
    button.onclick = onClick;
    return button;
}

// ===================================
// Pagination
// ===================================

function renderPagination() {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    const totalPages = Math.ceil(state.filteredJokes.length / state.jokesPerPage);

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
        renderJokes();
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
            renderJokes();
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
        renderJokes();
    };
    pagination.appendChild(nextBtn);
}

// ===================================
// Random Joke Modal
// ===================================

function showRandomJoke() {
    if (state.jokes.length === 0) return;

    const randomIndex = Math.floor(Math.random() * state.jokes.length);
    const joke = state.jokes[randomIndex];
    state.currentRandomJoke = joke;

    const modal = document.getElementById('random-modal');
    const jokeText = document.getElementById('random-joke-text');
    const jokeMeta = document.getElementById('random-joke-meta');

    // Safely render joke text with paragraph breaks
    renderJokeText(jokeText, joke.joke);

    jokeMeta.innerHTML = '';
    if (joke.episode) {
        jokeMeta.appendChild(createBadge('episode', joke.episode));
    }
    if (joke.guest) {
        jokeMeta.appendChild(createBadge('guest', joke.guest));
    }
    if (joke.time) {
        jokeMeta.appendChild(createBadge('time', joke.time));
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeRandomJoke() {
    const modal = document.getElementById('random-modal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// ===================================
// Share Functionality
// ===================================

function shareJoke(joke) {
    const shareText = `"${joke.joke}"\n\n- Norm Macdonald`;

    if (navigator.share) {
        navigator.share({
            title: 'Norm Macdonald Joke',
            text: shareText
        }).catch(() => {
            copyToClipboard(shareText);
        });
    } else {
        copyToClipboard(shareText);
    }
}

function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showToast('Copied to clipboard!');
        });
    } else {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('Copied to clipboard!');
    }
}

function showToast(message) {
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 2rem;
        left: 50%;
        transform: translateX(-50%);
        background: var(--accent);
        color: white;
        padding: 0.75rem 1.5rem;
        border-radius: var(--radius-full);
        box-shadow: var(--shadow-lg);
        z-index: 3000;
        animation: slideUp 0.3s ease;
        font-weight: 500;
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// ===================================
// Error State
// ===================================

function showError() {
    const container = document.getElementById('jokes-container');
    container.innerHTML = `
        <div class="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <h3>Failed to load jokes</h3>
            <p>Please refresh the page to try again</p>
        </div>
    `;
}

// ===================================
// Event Listeners
// ===================================

function initEventListeners() {
    // Search input
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

    // Guest filter
    const guestFilter = document.getElementById('guest-filter');
    guestFilter.addEventListener('change', (e) => {
        state.selectedGuest = e.target.value;
        applyFilters();
    });

    // Random joke button
    const randomBtn = document.getElementById('random-joke-btn');
    randomBtn.addEventListener('click', showRandomJoke);

    // Modal controls
    const modal = document.getElementById('random-modal');
    const modalOverlay = modal.querySelector('.modal-overlay');
    const modalClose = modal.querySelector('.modal-close');
    const anotherJokeBtn = document.getElementById('another-joke-btn');
    const shareJokeBtn = document.getElementById('share-joke-btn');

    modalOverlay.addEventListener('click', closeRandomJoke);
    modalClose.addEventListener('click', closeRandomJoke);
    anotherJokeBtn.addEventListener('click', showRandomJoke);
    shareJokeBtn.addEventListener('click', () => {
        if (state.currentRandomJoke) {
            shareJoke(state.currentRandomJoke);
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeRandomJoke();
        }

        if (e.key === 'r' && !e.ctrlKey && !e.metaKey && document.activeElement.tagName !== 'INPUT') {
            e.preventDefault();
            showRandomJoke();
        }
    });
}

// ===================================
// Initialize App
// ===================================

async function init() {
    initTheme();
    initNav();
    initEventListeners();
    await loadJokes();
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
