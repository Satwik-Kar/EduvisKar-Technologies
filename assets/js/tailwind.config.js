/**
 * Centralized Tailwind CSS Configuration
 * Preserves the Google Material theme design tokens across all EduvisKar Technologies pages.
 */
tailwind.config = {
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['Roboto', 'sans-serif'],
            },
            colors: {
                google: {
                    blue: '#1a73e8',
                    blueDark: '#8ab4f8',
                    red: '#ea4335',
                    yellow: '#fbbc05',
                    green: '#34a853',
                    bgLight: '#ffffff',
                    surfaceLight: '#f8f9fa',
                    borderLight: '#dadce0',
                    textLightPrimary: '#202124',
                    textLightSecondary: '#5f6368',
                    bgDark: '#202124',
                    surfaceDark: '#303134',
                    borderDark: '#5f6368',
                    textDarkPrimary: '#e8eaed',
                    textDarkSecondary: '#9aa0a6'
                }
            }
        }
    }
};

