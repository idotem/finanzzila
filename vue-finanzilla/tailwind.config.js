/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
    media: false, // or 'media' or 'class'
    theme: {
        extend: {
            colors: {
                'app-gray-background': '#8B8982'
            }
        }
    },
    variants: {
        extend: {}
    },
    plugins: []
};
