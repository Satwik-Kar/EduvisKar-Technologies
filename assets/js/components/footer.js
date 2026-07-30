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
                        <img src="assets/img/eduviskar_logo.svg" class="w-9 h-9 object-contain" alt="EduvisKar Logo">
                        <span class="font-medium text-xl tracking-tight text-google-textLightPrimary dark:text-google-textDarkPrimary">
                            EduvisKar Technologies
                        </span>
                    </a>
                    <p class="text-sm text-google-textLightSecondary dark:text-google-textDarkSecondary leading-relaxed max-w-sm">
                        One ecosystem driving educational innovation and enterprise-grade software engineering. Empowering learners and businesses globally.
                    </p>
                    <div class="text-xs text-google-textLightSecondary dark:text-google-textDarkSecondary space-y-1 pt-2">
                        <p><strong class="text-google-textLightPrimary dark:text-google-textDarkPrimary">Entity:</strong> Sole Proprietorship owned & operated by Satwik Sahil Kar</p>
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
                                <img src="assets/img/eduviskar_logo.svg" class="w-4 h-4 object-contain" alt="EduvisKar Live">
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

                <!-- Contact & Support (2 Cols) -->
                <div class="md:col-span-2 space-y-4">
                    <h3 class="text-xs font-semibold uppercase tracking-wider text-google-textLightPrimary dark:text-google-textDarkPrimary">Contact</h3>
                    <ul class="space-y-2.5 text-sm text-google-textLightSecondary dark:text-google-textDarkSecondary">
                        <li><a href="mailto:contact@eduviskar.com" class="hover:text-google-blue dark:hover:text-google-blueDark transition-colors">contact@eduviskar.com</a></li>
                    </ul>
                </div>

            </div>

            <!-- Bottom Sub-Footer -->
            <div class="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-google-textLightSecondary dark:text-google-textDarkSecondary">
                <p>&copy; 2026 EduvisKar Technologies. All rights reserved.</p>
            </div>
        </div>
    `;
}
