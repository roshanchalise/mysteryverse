/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mystery: {
          dark: '#1a1a2e',
          purple: '#16213e',
          gold: '#e94560',
          light: '#f5f5f5'
        }
      },
      fontFamily: {
        title: ['Cinzel', 'serif'],
        body: ['Inter', 'sans-serif']
      }
    },
  },
  plugins: [],
}