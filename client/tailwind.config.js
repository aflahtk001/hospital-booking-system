/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class', // Enable dark mode with class strategy
    theme: {
        extend: {
            colors: {
                // Apple Light Mode
                primary: '#007AFF', // Apple Blue
                secondary: '#5856D6', // Apple Purple
                accent: '#34C759', // Apple Green

                // Apple Gray Scale
                appleGray: {
                    50: '#F5F5F7',
                    100: '#E8E8ED',
                    200: '#D2D2D7',
                    300: '#B0B0B5',
                    400: '#86868B',
                    500: '#6E6E73',
                    600: '#515154',
                    700: '#424245',
                    800: '#1D1D1F',
                    900: '#000000',
                },
            },
            fontFamily: {
                sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
            },
            backdropBlur: {
                xs: '2px',
            }
        },
    },
    plugins: [],
}
