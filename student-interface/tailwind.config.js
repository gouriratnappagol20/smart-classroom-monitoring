/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      colors: {
        exam: {
          blue: '#1e40af',
          sky: '#0284c7',
          emerald: '#059669',
          amber: '#d97706',
          rose: '#e11d48',
        }
      }
    },
  },
  plugins: [],
}

