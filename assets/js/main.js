/**
 * EduvisKar Technologies Main Orchestrator
 */
import { initThemeToggle } from './components/theme.js';
import { renderProducts } from './components/products.js';
import { renderFooter } from './components/footer.js';

document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    renderProducts();
    renderFooter();
});
