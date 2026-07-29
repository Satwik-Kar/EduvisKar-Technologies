/**
 * EduvisKar Technologies Main Orchestrator
 */
import { renderNavbar } from './components/navbar.js';
import { initThemeToggle } from './components/theme.js';
import { renderProducts } from './components/products.js';
import { renderFooter } from './components/footer.js';

document.addEventListener('DOMContentLoaded', () => {
    renderNavbar();
    initThemeToggle();
    renderProducts();
    renderFooter();
});
