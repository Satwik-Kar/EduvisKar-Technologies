/**
 * Navbar Component
 * Renders the global top navigation bar dynamically across all pages
 */
export function renderNavbar() {
    const navContainer = document.getElementById('site-nav');
    if (!navContainer) return;

    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    navContainer.className = "fixed top-0 w-full z-50 bg-google-bgLight dark:bg-google-bgDark border-b border-google-borderLight dark:border-google-borderDark transition-colors duration-300";
    navContainer.innerHTML = `
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
                <!-- Logo Area -->
                <a href="index.html" class="flex-shrink-0 flex items-center gap-3 cursor-pointer">
                    <img src="assets/img/eduviskar_tech_logo_64x64.png" class="w-8 h-8 object-contain" alt="EduvisKar Logo">
                    <span class="font-medium text-xl tracking-tight text-google-textLightPrimary dark:text-google-textDarkPrimary">
                        EduvisKar Technologies
                    </span>
                </a>

                <!-- Right Actions -->
                <div class="flex items-center space-x-6">
                    <a href="${currentPage === 'index.html' || currentPage === '' ? '#products' : 'index.html#products'}" class="hidden sm:block text-sm font-medium text-google-textLightSecondary dark:text-google-textDarkSecondary hover:text-google-textLightPrimary dark:hover:text-google-textDarkPrimary transition-colors">Products</a>
                    <a href="${currentPage === 'index.html' || currentPage === '' ? '#about' : 'index.html#about'}" class="hidden sm:block text-sm font-medium text-google-textLightSecondary dark:text-google-textDarkSecondary hover:text-google-textLightPrimary dark:hover:text-google-textDarkPrimary transition-colors">About</a>
                    <a href="hiring.html" class="hidden sm:block text-sm font-medium ${currentPage === 'hiring.html' ? 'text-google-blue dark:text-google-blueDark font-semibold' : 'text-google-textLightSecondary dark:text-google-textDarkSecondary hover:text-google-textLightPrimary dark:hover:text-google-textDarkPrimary'} transition-colors">Careers</a>
                    ${currentPage !== 'privacy.html' ? '<a href="privacy.html" class="hidden sm:block text-sm font-medium text-google-textLightSecondary dark:text-google-textDarkSecondary hover:text-google-textLightPrimary dark:hover:text-google-textDarkPrimary transition-colors">Privacy</a>' : ''}
                    ${currentPage !== 'terms.html' ? '<a href="terms.html" class="hidden sm:block text-sm font-medium text-google-textLightSecondary dark:text-google-textDarkSecondary hover:text-google-textLightPrimary dark:hover:text-google-textDarkPrimary transition-colors">Terms</a>' : ''}
                    
                    <!-- Theme Toggle Button -->
                    <button id="theme-toggle" class="p-2 rounded-full hover:bg-google-surfaceLight dark:hover:bg-google-surfaceDark text-google-textLightSecondary dark:text-google-textDarkSecondary transition-colors focus:outline-none" aria-label="Toggle Theme">
                        <!-- Sun Icon (shown in dark mode) -->
                        <svg id="theme-toggle-light-icon" class="hidden w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-2.732l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                        </svg>
                        <!-- Moon Icon (shown in light mode) -->
                        <svg id="theme-toggle-dark-icon" class="hidden w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                        </svg>
                    </button>
                    
                    <a href="mailto:contact@eduviskar.com" class="hidden sm:inline-flex items-center justify-center px-6 py-2 border border-transparent text-sm font-medium rounded-full text-white bg-google-blue hover:bg-blue-700 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-google-blue">
                        Contact us
                    </a>
                </div>
            </div>
        </div>
    `;
}
