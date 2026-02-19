// ===================================
// Global Search
// Self-initializing: injects UI and lazy-loads data
// ===================================

(function() {
    'use strict';

    var searchData = null;
    var searchOverlay = null;
    var searchInput = null;
    var searchResults = null;
    var isOpen = false;

    // Debounce utility
    function debounce(fn, delay) {
        var timer;
        return function() {
            var args = arguments;
            clearTimeout(timer);
            timer = setTimeout(function() { fn.apply(null, args); }, delay);
        };
    }

    // ===================================
    // Inject Search Button & Modal
    // ===================================

    function injectUI() {
        // Search trigger button (positioned next to theme toggle)
        var btn = document.createElement('button');
        btn.id = 'search-trigger';
        btn.className = 'search-trigger';
        btn.setAttribute('aria-label', 'Search the archive');
        btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>';
        btn.addEventListener('click', openSearch);
        document.body.appendChild(btn);

        // Search overlay
        searchOverlay = document.createElement('div');
        searchOverlay.id = 'search-overlay';
        searchOverlay.className = 'search-overlay';
        searchOverlay.setAttribute('role', 'dialog');
        searchOverlay.setAttribute('aria-label', 'Search the archive');
        searchOverlay.style.display = 'none';

        searchOverlay.innerHTML =
            '<div class="search-modal">' +
                '<div class="search-modal-header">' +
                    '<div class="search-modal-input-wrap">' +
                        '<svg class="search-modal-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>' +
                        '<input type="text" id="global-search-input" class="search-modal-input" placeholder="Search jokes, videos, quotes, articles..." autocomplete="off" autocapitalize="off" spellcheck="false">' +
                    '</div>' +
                    '<button class="search-modal-close" aria-label="Close search">' +
                        '<kbd class="search-kbd">esc</kbd>' +
                    '</button>' +
                '</div>' +
                '<div id="search-results" class="search-results">' +
                    '<div class="search-hint">' +
                        '<p>Search across 939 videos, 74 jokes, 41 articles, 39 NML episodes, and 50 quotes.</p>' +
                    '</div>' +
                '</div>' +
            '</div>';

        document.body.appendChild(searchOverlay);

        // Cache references
        searchInput = document.getElementById('global-search-input');
        searchResults = document.getElementById('search-results');

        // Events
        searchOverlay.addEventListener('click', function(e) {
            if (e.target === searchOverlay) closeSearch();
        });

        searchOverlay.querySelector('.search-modal-close').addEventListener('click', closeSearch);

        var debouncedSearch = debounce(performSearch, 200);
        searchInput.addEventListener('input', function() {
            debouncedSearch(searchInput.value.trim());
        });

        // Keyboard shortcut: / to open, Escape to close
        document.addEventListener('keydown', function(e) {
            if (e.key === '/' && !isOpen && !isInputFocused()) {
                e.preventDefault();
                openSearch();
            }
            if (e.key === 'Escape' && isOpen) {
                closeSearch();
            }
        });
    }

    function isInputFocused() {
        var el = document.activeElement;
        return el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT');
    }

    // ===================================
    // Open / Close
    // ===================================

    function openSearch() {
        if (!searchOverlay) return;
        isOpen = true;
        searchOverlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        searchInput.value = '';
        searchInput.focus();
        showHint();
        // Load data on first open
        if (!searchData) loadSearchData();
    }

    function closeSearch() {
        if (!searchOverlay) return;
        isOpen = false;
        searchOverlay.style.display = 'none';
        document.body.style.overflow = '';
    }

    function showHint() {
        searchResults.innerHTML =
            '<div class="search-hint">' +
                '<p>Search across 939 videos, 74 jokes, 41 articles, 39 NML episodes, and 50 quotes.</p>' +
                '<p class="search-hint-shortcut">Tip: Press <kbd>/</kbd> anywhere to open search</p>' +
            '</div>';
    }

    // ===================================
    // Data Loading (lazy, on first open)
    // ===================================

    async function loadSearchData() {
        try {
            var results = await Promise.all([
                fetch('./jokes-data.json').then(function(r) { return r.json(); }),
                fetch('./consolidated_youtube_data.json').then(function(r) { return r.json(); }),
                fetch('./quotes-data.json').then(function(r) { return r.json(); }),
                fetch('./articles-data.json').then(function(r) { return r.json(); }),
                fetch('./nml-episodes-data.json').then(function(r) { return r.json(); })
            ]);

            searchData = {
                jokes: results[0].map(function(j) {
                    return { text: j.joke, episode: j.episode || '', guest: j.guest || '', url: j.url, time: j.time };
                }),
                videos: results[1].map(function(v) {
                    var vidMatch = (v['Video url'] || '').match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
                    return { title: v['Title'] || '', channel: v['Channel name'] || '', videoId: vidMatch ? vidMatch[1] : '', category: v['category'] || '' };
                }).filter(function(v) { return v.videoId; }),
                quotes: results[2].map(function(q) {
                    return { quote: q.quote, source: q.source || '', category: q.category || '' };
                }),
                articles: results[3].map(function(a) {
                    return { title: a.title, source: a.source || '', url: a.url, excerpt: a.excerpt || '' };
                }),
                nml: results[4].map(function(e) {
                    return { guest: e.guest, season: e.season, episode: e.episode, youtube_url: e.youtube_url || '', slug: e.slug || '' };
                })
            };
        } catch (err) {
            console.error('Search data load failed:', err);
            searchResults.innerHTML = '<div class="search-hint"><p>Failed to load search data. Please refresh.</p></div>';
        }
    }

    // ===================================
    // Search Logic
    // ===================================

    function performSearch(query) {
        if (!query || query.length < 2) {
            showHint();
            return;
        }
        if (!searchData) {
            searchResults.innerHTML = '<div class="search-hint"><p>Loading data...</p></div>';
            return;
        }

        var term = query.toLowerCase();
        var groups = [];

        // Search jokes
        var jokeResults = searchData.jokes.filter(function(j) {
            return j.text.toLowerCase().indexOf(term) !== -1 ||
                   j.episode.toLowerCase().indexOf(term) !== -1 ||
                   j.guest.toLowerCase().indexOf(term) !== -1;
        });
        if (jokeResults.length > 0) {
            groups.push({ label: 'Jokes', icon: 'smile', count: jokeResults.length, items: jokeResults.slice(0, 4).map(function(j) {
                var snippet = j.text.length > 120 ? j.text.substring(0, 120) + '...' : j.text;
                var href = './jokes.html' + (j.episode ? '?q=' + encodeURIComponent(j.episode) : '');
                return { title: snippet, subtitle: j.episode || '', href: href };
            })});
        }

        // Search videos
        var videoResults = searchData.videos.filter(function(v) {
            return v.title.toLowerCase().indexOf(term) !== -1 ||
                   v.channel.toLowerCase().indexOf(term) !== -1 ||
                   v.category.toLowerCase().indexOf(term) !== -1;
        });
        if (videoResults.length > 0) {
            groups.push({ label: 'Videos', icon: 'video', count: videoResults.length, items: videoResults.slice(0, 4).map(function(v) {
                return { title: v.title, subtitle: v.channel || v.category, href: 'https://www.youtube.com/watch?v=' + v.videoId, external: true };
            })});
        }

        // Search NML episodes
        var nmlResults = searchData.nml.filter(function(e) {
            return e.guest.toLowerCase().indexOf(term) !== -1;
        });
        if (nmlResults.length > 0) {
            groups.push({ label: 'NML Episodes', icon: 'mic', count: nmlResults.length, items: nmlResults.slice(0, 4).map(function(e) {
                return { title: 'S' + e.season + 'E' + e.episode + ': ' + e.guest, subtitle: 'Norm Macdonald Live', href: e.youtube_url || './nml-episodes.html', external: !!e.youtube_url };
            })});
        }

        // Search quotes
        var quoteResults = searchData.quotes.filter(function(q) {
            return q.quote.toLowerCase().indexOf(term) !== -1 ||
                   q.source.toLowerCase().indexOf(term) !== -1;
        });
        if (quoteResults.length > 0) {
            groups.push({ label: 'Quotes', icon: 'quote', count: quoteResults.length, items: quoteResults.slice(0, 3).map(function(q) {
                var snippet = q.quote.length > 120 ? q.quote.substring(0, 120) + '...' : q.quote;
                return { title: snippet, subtitle: q.source || '', href: './quotes.html' };
            })});
        }

        // Search articles
        var articleResults = searchData.articles.filter(function(a) {
            return a.title.toLowerCase().indexOf(term) !== -1 ||
                   a.source.toLowerCase().indexOf(term) !== -1 ||
                   a.excerpt.toLowerCase().indexOf(term) !== -1;
        });
        if (articleResults.length > 0) {
            groups.push({ label: 'Articles', icon: 'book', count: articleResults.length, items: articleResults.slice(0, 3).map(function(a) {
                return { title: a.title, subtitle: a.source, href: a.url, external: true };
            })});
        }

        renderResults(groups, query);
    }

    // ===================================
    // Render Results
    // ===================================

    function renderResults(groups, query) {
        if (groups.length === 0) {
            searchResults.innerHTML =
                '<div class="search-no-results">' +
                    '<p>No results for "<strong>' + escapeHtml(query) + '</strong>"</p>' +
                    '<p class="search-no-results-hint">Try a different search term</p>' +
                '</div>';
            return;
        }

        var html = '';
        var categoryPages = {
            'Jokes': './jokes.html',
            'Videos': './videos.html',
            'NML Episodes': './nml-episodes.html',
            'Quotes': './quotes.html',
            'Articles': './articles.html'
        };

        groups.forEach(function(group) {
            html += '<div class="search-group">';
            html += '<div class="search-group-header">';
            html += '<span class="search-group-label">' + escapeHtml(group.label) + '</span>';
            html += '<span class="search-group-count">' + group.count + ' result' + (group.count !== 1 ? 's' : '') + '</span>';
            html += '</div>';

            group.items.forEach(function(item) {
                var target = item.external ? ' target="_blank" rel="noopener noreferrer"' : '';
                html += '<a href="' + escapeHtml(item.href) + '" class="search-result-item"' + target + '>';
                html += '<span class="search-result-title">' + highlightMatch(escapeHtml(item.title), query) + '</span>';
                if (item.subtitle) {
                    html += '<span class="search-result-subtitle">' + escapeHtml(item.subtitle) + '</span>';
                }
                html += '</a>';
            });

            // "See all" link if more results exist
            if (group.count > group.items.length) {
                var pageUrl = categoryPages[group.label];
                if (pageUrl) {
                    html += '<a href="' + pageUrl + '?q=' + encodeURIComponent(query) + '" class="search-see-all">See all ' + group.count + ' ' + group.label.toLowerCase() + ' results</a>';
                }
            }

            html += '</div>';
        });

        searchResults.innerHTML = html;

        // Close search when a result is clicked
        searchResults.querySelectorAll('a').forEach(function(link) {
            link.addEventListener('click', function() {
                closeSearch();
            });
        });
    }

    function escapeHtml(str) {
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    function highlightMatch(html, query) {
        if (!query) return html;
        var escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        var regex = new RegExp('(' + escaped + ')', 'gi');
        return html.replace(regex, '<mark>$1</mark>');
    }

    // ===================================
    // Init
    // ===================================

    function init() {
        injectUI();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
