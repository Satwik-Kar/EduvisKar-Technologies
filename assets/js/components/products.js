/**
 * Products Component
 * Renders core platform cards for EduvisKar Labs and EduvisKar Live
 */
export const productsData = [
    {
        title: 'EduvisKar Labs',
        description: 'We help enterprises build custom websites, mobile solutions, and cloud software with clear pricing and fast delivery.',
        icon: '<img src="assets/img/logo_labs_light.svg" class="w-16 h-16 object-contain block dark:hidden" alt="EduvisKar Labs"><img src="assets/img/logo_labs_dark.svg" class="w-16 h-16 object-contain hidden dark:block" alt="EduvisKar Labs">',
        link: 'https://labs.eduviskar.com',
        color: '',
        bg: 'bg-transparent'
    },
    {
        title: 'EduvisKar Live',
        description: 'An online learning cum booking platform with live video classrooms for online tuitions, and tutor matching for students.',
        icon: '<img src="assets/img/eduviskar_live_logo.svg" class="w-16 h-16 object-contain" alt="EduvisKar Live">',
        link: 'https://live.eduviskar.com',
        color: '',
        bg: 'bg-transparent'
    }
];

export function createMaterialCard(p) {
    return `
        <a href="${p.link}" target="_blank" rel="noopener noreferrer" class="group block p-8 bg-google-bgLight dark:bg-google-bgDark rounded-2xl border border-google-borderLight dark:border-google-borderDark hover:shadow-lg transition-all duration-300">
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

export function renderProducts() {
    const grid = document.getElementById('products-grid');
    if (!grid) return;

    grid.innerHTML = productsData.map(p => createMaterialCard(p)).join('');
}
