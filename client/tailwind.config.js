/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: '#1e4d3b', // Forest Green
                secondary: '#34c759', // Light Green
                accent: '#E4F4EC', // Very Light Green for backgrounds

                // Grays from design
                surface: '#ffffff',
                background: '#f3f4f6',

                // Keeping some grays for utility
                gray: {
                    50: '#F9FAFB',
                    100: '#F3F4F6',
                    200: '#E5E7EB',
                    300: '#D1D5DB',
                    400: '#9CA3AF',
                    500: '#6B7280',
                    600: '#4B5563',
                    700: '#374151',
                    800: '#1F2937',
                    900: '#111827',
                },
                // Donezo specific
                sidebar: '#FAFAFA',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'], // Assuming Inter or similar clean font
            },
        },
    },
    plugins: [],
}
