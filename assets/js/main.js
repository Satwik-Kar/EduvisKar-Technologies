/**
 * EduvisKar Technologies Main Orchestrator
 */
import { renderNavbar } from './components/navbar.js?v=1.5';
import { initThemeToggle } from './components/theme.js?v=1.5';
import { renderProducts } from './components/products.js?v=1.5';
import { renderFooter } from './components/footer.js?v=1.5';

document.addEventListener('DOMContentLoaded', () => {
    renderNavbar();
    initThemeToggle();
    renderProducts();
    renderFooter();
});
