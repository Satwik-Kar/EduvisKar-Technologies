/**
 * Theme Toggle Component
 * Manages dark and light mode persistence and DOM state
 */
export function initThemeToggle() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const darkIcon = document.getElementById('theme-toggle-dark-icon');
    const lightIcon = document.getElementById('theme-toggle-light-icon');

    if (!themeToggleBtn) return;

    // Check system preference or localStorage
    if (localStorage.getItem('color-theme') === 'dark' || (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
        if (lightIcon) lightIcon.classList.remove('hidden');
        if (darkIcon) darkIcon.classList.add('hidden');
    } else {
        document.documentElement.classList.remove('dark');
        if (darkIcon) darkIcon.classList.remove('hidden');
        if (lightIcon) lightIcon.classList.add('hidden');
    }

    themeToggleBtn.addEventListener('click', function() {
        if (darkIcon) darkIcon.classList.toggle('hidden');
        if (lightIcon) lightIcon.classList.toggle('hidden');

        if (document.documentElement.classList.contains('dark')) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('color-theme', 'light');
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('color-theme', 'dark');
        }
    });
}
