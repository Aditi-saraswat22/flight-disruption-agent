/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        aviation: {
          900: '#0b1329',
          800: '#111c38',
          700: '#1b2a4e',
          600: '#263a66',
          500: '#344e85',
          accent: '#00d2ff',
          cyan: '#06b6d4',
          indigo: '#4f46e5',
          urgent: '#ef4444',
          warning: '#f59e0b',
          success: '#10b981'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
