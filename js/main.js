/**
 * EduvisKar Technologies Main Script (Google UI Version)
 * Handles Theme Toggling and Dynamic Material Components
 */

document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    renderProducts();
});

// ==========================================
// Theme Toggle Logic
// ==========================================
function initThemeToggle() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const darkIcon = document.getElementById('theme-toggle-dark-icon');
    const lightIcon = document.getElementById('theme-toggle-light-icon');

    // Check system preference or localStorage
    if (localStorage.getItem('color-theme') === 'dark' || (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
        lightIcon.classList.remove('hidden');
    } else {
        document.documentElement.classList.remove('dark');
        darkIcon.classList.remove('hidden');
    }

    themeToggleBtn.addEventListener('click', function() {
        // Toggle icons
        darkIcon.classList.toggle('hidden');
        lightIcon.classList.toggle('hidden');

        // Toggle theme and save to localStorage
        if (document.documentElement.classList.contains('dark')) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('color-theme', 'light');
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('color-theme', 'dark');
        }
    });
}

// ==========================================
// Products Ecosystem Data
// ==========================================
const productsData = [
    {
        title: 'EduvisKar Labs',
        description: 'Elite custom software development SaaS. Enterprise-grade engineering and rapid B2B prototyping.',
        icon: '<img src="img/logo_labs_light.svg" class="w-16 h-16 object-contain block dark:hidden" alt="EduvisKar Labs"><img src="img/logo_labs_dark.svg" class="w-16 h-16 object-contain hidden dark:block" alt="EduvisKar Labs">',
        link: '#',
        color: '',
        bg: 'bg-transparent'
    },
    {
        title: 'EduvisKar Live',
        description: 'The core educational platform empowering students with curated knowledge and modern learning tools.',
        icon: '<img src="img/live_light.png" class="w-16 h-16 object-contain block dark:hidden" alt="EduvisKar Live"><img src="img/live_dark.png" class="w-16 h-16 object-contain hidden dark:block" alt="EduvisKar Live">',
        link: '#',
        color: '',
        bg: 'bg-transparent'
    }
];

// ==========================================
// Component Renderers (Google Material Design)
// ==========================================
function createMaterialCard(p) {
    return `
        <a href="${p.link}" class="group block p-8 bg-google-bgLight dark:bg-google-bgDark rounded-2xl border border-google-borderLight dark:border-google-borderDark hover:shadow-lg transition-all duration-300">
            <div class="w-16 h-16 rounded-full ${p.bg} flex items-center justify-center mb-6 transition-colors">
                <div class="${p.color}">
                    ${p.icon}
                </div>
            </div>
            <h3 class="text-2xl font-medium text-google-textLightPrimary dark:text-google-textDarkPrimary mb-3 group-hover:text-google-blue dark:group-hover:text-google-blueDark transition-colors">${p.title}</h3>
            <p class="text-google-textLightSecondary dark:text-google-textDarkSecondary leading-relaxed">
                ${p.description}
            </p>
            <div class="mt-8 flex items-center text-sm font-medium text-google-blue dark:text-google-blueDark">
                Visit Platform
                <svg class="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </svg>
            </div>
        </a>
    `;
}

function renderProducts() {
    const grid = document.getElementById('products-grid');
    if (!grid) return;
    
    grid.innerHTML = productsData.map(p => createMaterialCard(p)).join('');
}
