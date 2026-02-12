// ===================================
// Shared Theme & Navigation
// Used across all pages
// ===================================

function initNav() {
    const navToggle = document.getElementById('nav-toggle');
    const nav = document.querySelector('.nav');

    if (navToggle && nav) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            nav.classList.toggle('open');
        });

        // Close nav when a link is clicked
        nav.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('active');
                nav.classList.remove('open');
            });
        });

        // Close nav when clicking outside
        document.addEventListener('click', (e) => {
            if (!navToggle.contains(e.target) && !nav.contains(e.target)) {
                navToggle.classList.remove('active');
                nav.classList.remove('open');
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
