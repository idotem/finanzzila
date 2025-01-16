import plugin from 'tailwindcss/plugin.js';

/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
    media: false, // or 'media' or 'class'
    theme: {
        extend: {}
    },
    variants: {
        extend: {}
    },
    plugins: [
        plugin(function ({ addUtilities }) {
            addUtilities({
                '.no-scrollbar::-webkit-scrollbar': {
                    'display': 'none'
                },
                '.no-scrollbar': {
                    '-ms-overflow-style': 'none',
                    'scrollbar-width': 'none'
                }
            });
        })
    ]
};
