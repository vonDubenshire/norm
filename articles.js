// ===================================
// Articles Page
// ===================================

async function loadArticles() {
    try {
        const response = await fetch('./articles-data.json');
        if (!response.ok) throw new Error('Failed to load articles');

        const articles = await response.json();

        document.getElementById('loading-state').style.display = 'none';
        document.getElementById('total-articles').textContent = articles.length;

        if (articles.length === 0) {
            document.getElementById('empty-state').style.display = 'block';
            return;
        }

        renderArticles(articles);
    } catch (error) {
        console.error('Error loading articles:', error);
        document.getElementById('loading-state').style.display = 'none';
        document.getElementById('empty-state').style.display = 'block';
    }
}

function renderArticles(articles) {
    const container = document.getElementById('articles-container');
    container.innerHTML = '';
    container.style.display = 'grid';

    const fragment = document.createDocumentFragment();
    articles.forEach(article => {
        const card = createArticleCard(article);
        fragment.appendChild(card);
    });
    container.appendChild(fragment);
}

function createArticleCard(article) {
    const card = document.createElement('a');
    card.className = 'joke-card';
    card.href = article.url;
    card.style.textDecoration = 'none';
    card.style.color = 'inherit';
    card.style.cursor = 'pointer';

    if (article.external) {
        card.target = '_blank';
        card.rel = 'noopener noreferrer';
    }

    const title = document.createElement('h3');
    title.className = 'joke-text';
    title.style.fontSize = '1.25rem';
    title.style.fontWeight = '600';
    title.textContent = article.title;

    const excerpt = document.createElement('p');
    excerpt.style.color = 'var(--text-2)';
    excerpt.style.marginTop = 'var(--spacing-sm)';
    excerpt.style.lineHeight = '1.6';
    excerpt.textContent = article.excerpt || '';

    const meta = document.createElement('div');
    meta.className = 'joke-meta';

    if (article.author) {
        const authorBadge = document.createElement('span');
        authorBadge.className = 'joke-badge';
        authorBadge.textContent = article.author;
        meta.appendChild(authorBadge);
    }

    if (article.source) {
        const sourceBadge = document.createElement('span');
        sourceBadge.className = 'joke-badge';
        sourceBadge.textContent = article.source;
        meta.appendChild(sourceBadge);
    }

    if (article.tags && article.tags.length > 0) {
        article.tags.forEach(tag => {
            const tagBadge = document.createElement('span');
            tagBadge.className = 'joke-badge';
            tagBadge.textContent = tag;
            meta.appendChild(tagBadge);
        });
    }

    if (article.external) {
        const extBadge = document.createElement('span');
        extBadge.className = 'joke-badge';
        extBadge.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg> External';
        meta.appendChild(extBadge);
    }

    card.appendChild(title);
    card.appendChild(excerpt);
    card.appendChild(meta);

    return card;
}

// ===================================
// Initialize
// ===================================

function init() {
    initTheme();
    initNav();
    initFooterQuote();
    loadArticles();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
