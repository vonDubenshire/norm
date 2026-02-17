// ===================================
// Quotes Page
// ===================================

const state = {
    quotes: [],
    filteredQuotes: [],
    selectedCategory: ''
};

const categoryLabels = {
    'on-comedy': 'On Comedy',
    'on-life': 'On Life',
    'on-comedians': 'On Other Comedians',
    'on-current-events': 'On Current Events'
};

// ===================================
// Load Quotes Data
// ===================================

async function loadQuotes() {
    try {
        const response = await fetch('./quotes-data.json');
        if (!response.ok) throw new Error('Failed to load quotes');

        state.quotes = await response.json();
        state.filteredQuotes = [...state.quotes];

        document.getElementById('total-quotes').textContent = state.quotes.length;
        showSpotlightQuote();
        renderQuotes();
    } catch (error) {
        console.error('Error loading quotes:', error);
        document.getElementById('quotes-container').innerHTML = `
            <div class="empty-state">
                <h3>Failed to load quotes</h3>
                <p>Please refresh the page to try again</p>
            </div>
        `;
    }
}

// ===================================
// Spotlight Quote
// ===================================

function showSpotlightQuote() {
    if (state.quotes.length === 0) return;

    const quote = state.quotes[Math.floor(Math.random() * state.quotes.length)];

    const textEl = document.getElementById('spotlight-text');
    textEl.textContent = '"' + quote.quote + '"';

    const metaEl = document.getElementById('spotlight-meta');
    metaEl.textContent = '';

    const parts = [];
    if (quote.source) parts.push(quote.source);
    if (quote.year) parts.push(quote.year);

    if (parts.length > 0) {
        const sourceSpan = document.createElement('span');
        sourceSpan.className = 'joke-badge';
        sourceSpan.textContent = parts.join(' \u2022 ');
        metaEl.appendChild(sourceSpan);
    }

    if (quote.category && categoryLabels[quote.category]) {
        const catSpan = document.createElement('span');
        catSpan.className = 'joke-badge';
        catSpan.textContent = categoryLabels[quote.category];
        metaEl.appendChild(catSpan);
    }
}

// ===================================
// Render All Quotes
// ===================================

function renderQuotes() {
    const container = document.getElementById('quotes-container');
    const emptyState = document.getElementById('empty-state');

    container.innerHTML = '';

    if (state.filteredQuotes.length === 0) {
        container.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    container.style.display = 'grid';
    emptyState.style.display = 'none';

    const fragment = document.createDocumentFragment();
    state.filteredQuotes.forEach(quote => {
        const card = createQuoteCard(quote);
        fragment.appendChild(card);
    });
    container.appendChild(fragment);
}

function createQuoteCard(quote) {
    const card = document.createElement('div');
    card.className = 'joke-card';

    const text = document.createElement('blockquote');
    text.className = 'joke-text';
    text.textContent = '"' + quote.quote + '"';

    const meta = document.createElement('div');
    meta.className = 'joke-meta';

    if (quote.source) {
        const sourceBadge = document.createElement('span');
        sourceBadge.className = 'joke-badge';
        sourceBadge.textContent = quote.source;
        meta.appendChild(sourceBadge);
    }

    if (quote.year) {
        const yearBadge = document.createElement('span');
        yearBadge.className = 'joke-badge';
        yearBadge.textContent = String(quote.year);
        meta.appendChild(yearBadge);
    }

    if (quote.category && categoryLabels[quote.category]) {
        const catBadge = document.createElement('span');
        catBadge.className = 'joke-badge';
        catBadge.textContent = categoryLabels[quote.category];
        meta.appendChild(catBadge);
    }

    const actions = document.createElement('div');
    actions.className = 'joke-actions';

    const shareBtn = document.createElement('button');
    shareBtn.className = 'action-btn';
    shareBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg> <span>Share</span>';
    shareBtn.onclick = () => shareQuote(quote);
    actions.appendChild(shareBtn);

    card.appendChild(text);
    card.appendChild(meta);
    card.appendChild(actions);

    return card;
}

// ===================================
// Filter
// ===================================

function applyFilter() {
    if (state.selectedCategory) {
        state.filteredQuotes = state.quotes.filter(q => q.category === state.selectedCategory);
    } else {
        state.filteredQuotes = [...state.quotes];
    }
    renderQuotes();
}

// ===================================
// Share
// ===================================

function shareQuote(quote) {
    const shareText = '"' + quote.quote + '"\n\n\u2014 Norm Macdonald';

    if (navigator.share) {
        navigator.share({ title: 'Norm Macdonald Quote', text: shareText }).catch(() => {
            copyToClipboard(shareText);
        });
    } else {
        copyToClipboard(shareText);
    }
}

function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => showToast('Copied to clipboard!'));
    } else {
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
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = 'position:fixed;bottom:2rem;left:50%;transform:translateX(-50%);background:var(--accent);color:white;padding:0.75rem 1.5rem;border-radius:var(--radius-full);box-shadow:var(--shadow-lg);z-index:3000;animation:slideUp 0.3s ease;font-weight:500;';

    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// ===================================
// Event Listeners
// ===================================

function initEventListeners() {
    document.getElementById('refresh-quote').addEventListener('click', showSpotlightQuote);
    document.getElementById('spotlight-quote').addEventListener('click', showSpotlightQuote);

    document.getElementById('category-filter').addEventListener('change', (e) => {
        state.selectedCategory = e.target.value;
        applyFilter();
    });
}

// ===================================
// Initialize
// ===================================

async function init() {
    initTheme();
    initNav();
    initFooterQuote();
    initEventListeners();
    await loadQuotes();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
