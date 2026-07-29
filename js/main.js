/**
 * EduvisKar Technologies Main Script
 * Handles UI interactions, mobile menu, and dynamic component rendering
 */

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    renderProducts();
    renderServices();
});

// Navigation & Mobile Menu Logic
function initNavigation() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const navbar = document.getElementById('navbar');

    // Toggle Mobile Menu
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // Navbar Scroll Effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            navbar.classList.add('bg-brand-950/80', 'backdrop-blur-md', 'border-glassBorder');
            navbar.classList.remove('border-transparent');
        } else {
            navbar.classList.remove('bg-brand-950/80', 'backdrop-blur-md', 'border-glassBorder');
            navbar.classList.add('border-transparent');
        }
    });
}

// Data for Products Ecosystem
const productsData = [
    {
        title: 'EduvisKar Labs',
        description: 'Advanced custom software development SaaS. Enterprise-grade engineering and rapid prototyping.',
        icon: '<svg class="w-6 h-6 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>',
        link: '#'
    },
    {
        title: 'EduvisKar Official',
        description: 'The core educational platform empowering students with curated knowledge and modern learning tools.',
        icon: '<svg class="w-6 h-6 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>',
        link: '#'
    },
    {
        title: 'AI & Data Analytics',
        description: 'Predictive modeling, natural language processing, and data infrastructure for enterprise scale.',
        icon: '<svg class="w-6 h-6 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>',
        link: '#'
    }
];

// Data for Services
const servicesData = [
    {
        title: 'Custom Software Architecture',
        description: 'We design and build scalable, secure, and highly available architectures for B2B SaaS and enterprise applications.',
        features: ['Microservices', 'Cloud-Native', 'High Availability']
    },
    {
        title: 'CTO as a Service (CaaS)',
        description: 'Strategic technical leadership to guide your product vision, manage engineering teams, and oversee technology stacks.',
        features: ['Tech Strategy', 'Team Building', 'Vendor Management']
    }
];

// Component Renderers (Abstracting UI logic)
function createGlassCard(title, description, icon, link) {
    return `
        <div class="glass-panel rounded-2xl p-6 flex flex-col h-full hover-lift group border border-glassBorder hover:border-brand-500/50 transition-colors">
            <div class="w-12 h-12 rounded-xl bg-brand-900/50 border border-brand-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                ${icon}
            </div>
            <h3 class="text-xl font-semibold text-white mb-3">${title}</h3>
            <p class="text-slate-400 text-sm flex-grow leading-relaxed mb-6">
                ${description}
            </p>
            <a href="${link}" class="inline-flex items-center text-brand-400 font-medium text-sm group-hover:text-brand-300 transition-colors mt-auto">
                Explore 
                <svg class="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </svg>
            </a>
        </div>
    `;
}

function createServiceCard(title, description, features) {
    const featuresList = features.map(f => `
        <li class="flex items-center text-sm text-slate-300">
            <svg class="w-4 h-4 text-brand-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            ${f}
        </li>
    `).join('');

    return `
        <div class="bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 rounded-2xl p-8 hover:bg-white/[0.08] transition-colors relative overflow-hidden group">
            <div class="absolute top-0 right-0 w-32 h-32 bg-brand-600/10 rounded-full blur-2xl group-hover:bg-brand-500/20 transition-colors"></div>
            <h3 class="text-2xl font-bold text-white mb-4 relative z-10">${title}</h3>
            <p class="text-slate-400 mb-6 relative z-10 leading-relaxed">
                ${description}
            </p>
            <ul class="space-y-2 relative z-10">
                ${featuresList}
            </ul>
        </div>
    `;
}

// Render logic
function renderProducts() {
    const grid = document.getElementById('products-grid');
    if (!grid) return;
    
    grid.innerHTML = productsData.map(p => createGlassCard(p.title, p.description, p.icon, p.link)).join('');
}

function renderServices() {
    const grid = document.getElementById('services-grid');
    if (!grid) return;
    
    grid.innerHTML = servicesData.map(s => createServiceCard(s.title, s.description, s.features)).join('');
}
