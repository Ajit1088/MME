// Map clean URL paths directly to their isolated HTML templates
const routes = {
    '/': 'templates/about.html',
    '/about': 'templates/about.html',
    '/md-profile': 'templates/md-profile.html',
    '/manufacturing': 'templates/manufacturing.html',
    '/services': 'templates/services.html',
    '/approvals': 'templates/approvals.html',
    '/why-mmg': 'templates/why-mmg.html',
    '/solar-ev': 'templates/solar-ev.html',
    '/cinema': 'templates/cinema.html',
    '/contact': 'templates/contact.html'
};

// Internal RAM cache to eliminate secondary network fetches
const templateCache = {};

async function navigateTo(path) {
    window.history.pushState({}, "", path);
    await handleRouting(path);
    updateActiveNavigationLink(path);
}

async function handleRouting(path) {
    const viewport = document.getElementById('content-viewport');
    let templatePath = routes[path] || routes['/'];

    // Smooth CSS Opacity Fade-Out
    viewport.style.opacity = '0';

    setTimeout(async () => {
        try {
            // Fetch content snippet if missing from RAM cache
            if (!templateCache[templatePath]) {
                const response = await fetch(templatePath);
                if (!response.ok) throw new Error('Failed to retrieve content asset.');
                templateCache[templatePath] = await response.text();
            }

            viewport.innerHTML = templateCache[templatePath];
            viewport.style.opacity = '1';

            // Post-rendering lifecycle triggers (e.g., gallery filter initialization)
            executeSectionScripts(path);
            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (error) {
            console.error(error);
            viewport.innerHTML = `
                <section class="error-pane">
                    <h2>Content Unavailable</h2>
                    <p>The requested section is temporarily offline. Please refresh or contact support.</p>
                </section>
            `;
            viewport.style.opacity = '1';
        }
    }, 200); // Matches the 0.2s transition set in main.css
}

function updateActiveNavigationLink(path) {
    const normalizePath = path === '/' ? '/about' : path;
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('href') === normalizePath) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

function executeSectionScripts(path) {
    // Dedicated hooks for complex layouts like filtering data fields
    if (path === '/manufacturing') {
        if (typeof initGalleryFilter === 'function') initGalleryFilter();
    }
}

// Global Intercept Hook for Dynamic Links
document.addEventListener('click', e => {
    const targetLink = e.target.closest('[data-link]');
    if (targetLink) {
        e.preventDefault();
        navigateTo(targetLink.getAttribute('href'));
        
        // Auto-close mobile responsive menu drawer on click
        const mainNav = document.getElementById('mainNav');
        if(mainNav.classList.contains('mobile-open')) {
            mainNav.classList.remove('mobile-open');
        }
    }
});

// Mobile Responsive Burger Menu Toggle Logic
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');
    
    if(menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('mobile-open');
        });
    }
});

// Browser Forward/Back Button Event Synchronization
window.addEventListener('popstate', () => {
    handleRouting(window.location.pathname);
    updateActiveNavigationLink(window.location.pathname);
});

// Primary Boot Sequence
document.addEventListener('DOMContentLoaded', () => {
    handleRouting(window.location.pathname);
    updateActiveNavigationLink(window.location.pathname);
});


// Localized Translation Switcher for MD Profile Container Module
function switchProfileLanguage(langCode) {
    // 1. Locate view components
    const enBlock = document.getElementById('profile-content-en');
    const knBlock = document.getElementById('profile-content-kn');
    const btnEn = document.getElementById('btn-lang-en');
    const btnKn = document.getElementById('btn-lang-kn');

    if (!enBlock || !knBlock) return;

    // 2. Clear out active styling conditions
    enBlock.classList.remove('profile-active');
    knBlock.classList.remove('profile-active');
    btnEn.classList.remove('active');
    btnKn.classList.remove('active');

    // 3. Inject current language state selection rules
    if (langCode === 'kn') {
        knBlock.classList.add('profile-active');
        btnKn.classList.add('active');
    } else {
        enBlock.classList.add('profile-active');
        btnEn.classList.add('active');
    }
}


// Initialization Engine for Manufacturing Content Filter Toggles
function initGalleryFilter() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const items = document.querySelectorAll('.spec-card-item');

    if (filterButtons.length === 0 || items.length === 0) return;

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active formatting token across all filter triggers
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const filterValue = button.getAttribute('data-filter');

            items.forEach(item => {
                if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                    item.classList.remove('hidden');
                } else {
                    item.classList.add('hidden');
                }
            });
        });
    });
}