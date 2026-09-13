import defaultTheme from 'tailwindcss/defaultTheme';
import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ['class'],
    content: [
        './resources/views/**/*.blade.php',
        './resources/js/**/*.{js,jsx,ts,tsx}',
        './app/View/Components/**/*.php',
    ],
    theme: {
        extend: {
            colors: {
                congress: {
                    green: '#008000',
                    'green-deep': '#006400',
                    red: '#C8102E',
                    white: '#FFFFFF',
                },
            },
            fontFamily: {
                sans: ['Inter', 'Poppins', 'Noto Sans Devanagari', ...defaultTheme.fontFamily.sans],
                display: ['Poppins', 'Noto Sans Devanagari', ...defaultTheme.fontFamily.sans],
                nepali: ['Noto Sans Devanagari', 'Hind', ...defaultTheme.fontFamily.sans],
            },
            boxShadow: {
                campaign: '0 24px 80px -32px rgba(0, 100, 0, 0.45)',
                patriotic: '0 22px 70px -36px rgba(200, 16, 46, 0.65)',
            },
            backgroundImage: {
                'congress-stripe': 'linear-gradient(135deg, #C8102E 0%, #C8102E 33%, #FFFFFF 33%, #FFFFFF 66%, #008000 66%, #008000 100%)',
                'congress-soft': 'linear-gradient(135deg, rgba(200, 16, 46, 0.96), rgba(255, 255, 255, 0.92) 50%, rgba(0, 128, 0, 0.96))',
            },
            keyframes: {
                'flag-wave': {
                    '0%, 100%': { transform: 'skewX(-7deg) translateY(0)' },
                    '50%': { transform: 'skewX(7deg) translateY(-3px)' },
                },
                'rise-in': {
                    '0%': { opacity: '0', transform: 'translateY(18px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
            animation: {
                'flag-wave': 'flag-wave 4s ease-in-out infinite',
                'rise-in': 'rise-in 0.75s ease-out both',
            },
        },
    },
    plugins: [typography],
};
