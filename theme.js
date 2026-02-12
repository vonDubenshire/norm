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
