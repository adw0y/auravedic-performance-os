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
        brand: {
          50: '#fdf8f0',
          100: '#faefdc',
          200: '#f4dcba',
          300: '#ecc490',
          400: '#e1a660',
          500: '#d98b3a',
          600: '#cb722e',
          700: '#a85727',
          800: '#874625',
          900: '#6f3b22',
          950: '#3c1d10',
        },
        ayur: {
          saffron: '#E87A24',
          turmeric: '#F2A900',
          sandalwood: '#965C38',
          herb: '#2E7D32',
          olive: '#556B2F',
          rose: '#D81B60',
          deep: '#1A1817'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      }
    },
  },
  plugins: [],
}
