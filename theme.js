// ===================================
// Shared Theme & Navigation
// Used across all pages
// ===================================

function initNav() {
    const navToggle = document.getElementById('nav-toggle');
    const nav = document.querySelector('.nav');

    if (navToggle && nav) {
        nav.id = nav.id || 'site-nav';
        navToggle.setAttribute('aria-controls', nav.id);
        navToggle.setAttribute('aria-expanded', 'false');

        const closeNav = () => {
            navToggle.classList.remove('active');
            nav.classList.remove('open');
            navToggle.setAttribute('aria-expanded', 'false');
            document.body.classList.remove('menu-open');
        };

        const openNav = () => {
            navToggle.classList.add('active');
            nav.classList.add('open');
            navToggle.setAttribute('aria-expanded', 'true');
            document.body.classList.add('menu-open');
        };

        navToggle.addEventListener('click', () => {
            const isOpen = nav.classList.contains('open');
            if (isOpen) {
                closeNav();
            } else {
                openNav();
            }
        });

        // Close nav when a link is clicked
        nav.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                closeNav();
            });
        });

        // Close nav when clicking outside
        document.addEventListener('click', (e) => {
            if (!navToggle.contains(e.target) && !nav.contains(e.target)) {
                closeNav();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && nav.classList.contains('open')) {
                closeNav();
                navToggle.focus();
            }
        });
    }
}

function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('theme');

    // Set initial theme
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
        // Respect system preference by default
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    }

    // Theme toggle handler
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
        }
    });
}

// ===================================
// NormShare — Centralized share utility
// Used by all pages with shareable content
// ===================================

const NormShare = {
    SITE_URL: 'https://normmacdonald.lol',

    SHARE_ICON: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>',

    /**
     * Share content using Web Share API (mobile) or clipboard (desktop)
     * @param {Object} opts
     * @param {string} opts.title - Share dialog title
     * @param {string} opts.text  - Text body to share
     * @param {string} [opts.url] - URL to include
     */
    share(opts) {
        if (navigator.share) {
            const shareData = { title: opts.title, text: opts.text };
            if (opts.url) shareData.url = opts.url;
            navigator.share(shareData).catch((err) => {
                if (err.name !== 'AbortError') {
                    this._copyFallback(opts.text, opts.url);
                }
            });
        } else {
            this._copyFallback(opts.text, opts.url);
        }
    },

    _copyFallback(text, url) {
        const full = url ? text + '\n\n' + url : text;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(full)
                .then(() => this.toast('Copied to clipboard!'))
                .catch(() => this._textareaCopy(full));
        } else {
            this._textareaCopy(full);
        }
    },

    _textareaCopy(text) {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;opacity:0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        this.toast('Copied to clipboard!');
    },

    toast(message) {
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
    },

    /**
     * Create a share button element
     * @param {Function} onClick - Click handler
     * @returns {HTMLButtonElement}
     */
    createButton(onClick) {
        const btn = document.createElement('button');
        btn.className = 'action-btn share-btn';
        btn.innerHTML = this.SHARE_ICON + ' <span>Share</span>';
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            onClick();
        });
        return btn;
    }
};

const normQuotes = [
    '"I\'m not norm." — Norm Macdonald',
    '"The more you delve into science, the more it appears to rely on faith." — Norm Macdonald',
    '"I don\'t really feel like a guy who has been fired. I feel like a guy who has been liberated." — Norm Macdonald',
    '"In showbiz, the weights and measures are all off. Everyone has a different scale." — Norm Macdonald',
    '"A joke should catch someone by surprise, an ambush from the most unexpected direction." — Norm Macdonald',
    '"I think clever is the opposite of funny." — Norm Macdonald',
    '"I always told everybody the perfect joke would be where the setup and the punch line are identical." — Norm Macdonald',
    '"There\'s nothing more fun than sitting in a room trying to be funny." — Norm Macdonald',
    '"You know, with Hitler, the more I learn about that guy, the more I don\'t care for him." — Norm Macdonald',
];

function initFooterQuote() {
    const el = document.getElementById('footer-norm-quote');
    if (el) {
        el.textContent = normQuotes[Math.floor(Math.random() * normQuotes.length)];
    }
}

// ===================================
// Scroll-to-top button
// Auto-initializes on DOMContentLoaded
// ===================================

function initScrollToTop() {
    const btn = document.createElement('button');
    btn.className = 'scroll-to-top';
    btn.setAttribute('aria-label', 'Scroll to top');
    btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>';
    document.body.appendChild(btn);

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                btn.classList.toggle('visible', window.scrollY > 400);
                ticking = false;
            });
            ticking = true;
        }
    });
}

document.addEventListener('DOMContentLoaded', initScrollToTop);
