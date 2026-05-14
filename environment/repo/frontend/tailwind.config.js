/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fruit: {
          brand: '#10b981',      // Fresh green
          light: '#d1fae5',      // Soft emerald highlight
          dark: '#065f46',       // Deep pine
          accent: '#f59e0b',     // Juicy amber
          berry: '#e11d48',      // Vibrant strawberry red
          midnight: '#0f172a',   // Sleek dashboard background
          surface: '#1e293b'     // Premium dark mode cards
        }
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        premium: '0 8px 30px rgba(0, 0, 0, 0.12)',
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
      }
    },
  },
  plugins: [],
}
