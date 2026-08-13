/**
 * Footer Component
 * Renders the global multi-column corporate footer dynamically
 */
export function renderFooter() {
    const footerContainer = document.getElementById('site-footer');
    if (!footerContainer) return;

    footerContainer.className = "bg-google-bgLight dark:bg-google-bgDark border-t border-google-borderLight dark:border-google-borderDark py-16 transition-colors duration-300";
    footerContainer.innerHTML = `
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-google-borderLight dark:border-google-borderDark">
                
                <!-- Brand & Entity Details (5 Cols) -->
                <div class="md:col-span-5 space-y-4">
                    <a href="index.html" class="flex items-center gap-3">
                        <img src="assets/img/eduviskar_tech_logo_64x64.png" class="w-9 h-9 object-contain" alt="EduvisKar Logo">
                        <span class="font-medium text-xl tracking-tight text-google-textLightPrimary dark:text-google-textDarkPrimary">
                            EduvisKar Technologies
                        </span>
                    </a>
                    <p class="text-sm text-google-textLightSecondary dark:text-google-textDarkSecondary leading-relaxed max-w-sm">
                        One ecosystem driving educational innovation and enterprise-grade software engineering. Empowering learners and businesses globally.
                    </p>
                    <div class="text-xs text-google-textLightSecondary dark:text-google-textDarkSecondary space-y-1 pt-2">
                        <p><strong class="text-google-textLightPrimary dark:text-google-textDarkPrimary">Entity:</strong> Sole Proprietorship</p>
                        <p><strong class="text-google-textLightPrimary dark:text-google-textDarkPrimary">GSTIN:</strong> 21LHHPK7834B1ZF</p>
                        <p><strong class="text-google-textLightPrimary dark:text-google-textDarkPrimary">Address:</strong> Anandapur, Keonjhar, Odisha 758022, India</p>
                    </div>
                </div>

                <!-- Ecosystem Platforms (3 Cols) -->
                <div class="md:col-span-3 space-y-4">
                    <h3 class="text-xs font-semibold uppercase tracking-wider text-google-textLightPrimary dark:text-google-textDarkPrimary">Core Platforms</h3>
                    <ul class="space-y-2.5 text-sm text-google-textLightSecondary dark:text-google-textDarkSecondary">
                        <li>
                            <a href="https://live.eduviskar.com" target="_blank" rel="noopener noreferrer" class="hover:text-google-blue dark:hover:text-google-blueDark transition-colors inline-flex items-center gap-1.5">
                                <img src="assets/img/eduviskar_live_logo.svg" class="w-4 h-4 object-contain" alt="EduvisKar Live">
                                EduvisKar Live
                            </a>
                        </li>
                        <li>
                            <a href="https://labs.eduviskar.com" target="_blank" rel="noopener noreferrer" class="hover:text-google-blue dark:hover:text-google-blueDark transition-colors inline-flex items-center gap-1.5">
                                <img src="assets/img/logo_labs_light.svg" class="w-4 h-4 object-contain block dark:hidden" alt="EduvisKar Labs">
                                <img src="assets/img/logo_labs_dark.svg" class="w-4 h-4 object-contain hidden dark:block" alt="EduvisKar Labs">
                                EduvisKar Labs
                            </a>
                        </li>
                    </ul>
                </div>

                <!-- Legal & Compliance (2 Cols) -->
                <div class="md:col-span-2 space-y-4">
                    <h3 class="text-xs font-semibold uppercase tracking-wider text-google-textLightPrimary dark:text-google-textDarkPrimary">Legal & Trust</h3>
                    <ul class="space-y-2.5 text-sm text-google-textLightSecondary dark:text-google-textDarkSecondary">
                        <li><a href="privacy.html" class="hover:text-google-blue dark:hover:text-google-blueDark transition-colors">Privacy Policy</a></li>
                        <li><a href="terms.html" class="hover:text-google-blue dark:hover:text-google-blueDark transition-colors">Terms of Service</a></li>
                        <li><a href="mailto:legal@eduviskar.com" class="hover:text-google-blue dark:hover:text-google-blueDark transition-colors">Legal Inquiry Desk</a></li>
                    </ul>
                </div>

                <!-- Contact & Social (2 Cols) -->
                <div class="md:col-span-2 space-y-4">
                    <h3 class="text-xs font-semibold uppercase tracking-wider text-google-textLightPrimary dark:text-google-textDarkPrimary">Contact & Social</h3>
                    <ul class="space-y-2.5 text-sm text-google-textLightSecondary dark:text-google-textDarkSecondary">
                        <li><a href="mailto:contact@eduviskar.com" class="hover:text-google-blue dark:hover:text-google-blueDark transition-colors">contact@eduviskar.com</a></li>
                    </ul>
                    <div class="pt-2 space-y-2">
                        <span class="text-xs font-medium text-google-textLightPrimary dark:text-google-textDarkPrimary block">Follow Us</span>
                        <div class="flex items-center gap-2.5 text-google-textLightSecondary dark:text-google-textDarkSecondary">
                            <a href="https://www.facebook.com/eduviskartechnologies" target="_blank" rel="noopener noreferrer" aria-label="Facebook" class="p-2 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-google-blue/10 dark:hover:bg-google-blueDark/20 hover:text-google-blue dark:hover:text-google-blueDark transition-colors" title="Facebook">
                                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
                            </a>
                            <a href="https://www.instagram.com/eduviskartechnologies" target="_blank" rel="noopener noreferrer" aria-label="Instagram" class="p-2 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-google-blue/10 dark:hover:bg-google-blueDark/20 hover:text-google-blue dark:hover:text-google-blueDark transition-colors" title="Instagram">
                                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"/></svg>
                            </a>
                            <a href="https://www.youtube.com/@EduvisKarTechnologies-o9f" target="_blank" rel="noopener noreferrer" aria-label="YouTube" class="p-2 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-google-blue/10 dark:hover:bg-google-blueDark/20 hover:text-google-blue dark:hover:text-google-blueDark transition-colors" title="YouTube">
                                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                            </a>
                            <a href="https://www.linkedin.com/company/eduviskartechnologies/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" class="p-2 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-google-blue/10 dark:hover:bg-google-blueDark/20 hover:text-google-blue dark:hover:text-google-blueDark transition-colors" title="LinkedIn">
                                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>
                            </a>
                        </div>
                    </div>
                </div>

            </div>

            <!-- Bottom Sub-Footer -->
            <div class="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-google-textLightSecondary dark:text-google-textDarkSecondary">
                <p>&copy; 2026 EduvisKar Technologies. All rights reserved.</p>
                <div class="flex items-center gap-4 flex-wrap justify-center sm:justify-end">
                    <a href="https://www.facebook.com/eduviskartechnologies" target="_blank" rel="noopener noreferrer" aria-label="Facebook" class="hover:text-google-blue dark:hover:text-google-blueDark transition-colors">Facebook</a>
                    <span class="select-none">&bull;</span>
                    <a href="https://www.instagram.com/eduviskartechnologies" target="_blank" rel="noopener noreferrer" aria-label="Instagram" class="hover:text-google-blue dark:hover:text-google-blueDark transition-colors">Instagram</a>
                    <span class="select-none">&bull;</span>
                    <a href="https://www.youtube.com/@EduvisKarTechnologies-o9f" target="_blank" rel="noopener noreferrer" aria-label="YouTube" class="hover:text-google-blue dark:hover:text-google-blueDark transition-colors">YouTube</a>
                    <span class="select-none">&bull;</span>
                    <a href="https://www.linkedin.com/company/eduviskartechnologies/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" class="hover:text-google-blue dark:hover:text-google-blueDark transition-colors">LinkedIn</a>
                </div>
            </div>
        </div>
    `;
}
