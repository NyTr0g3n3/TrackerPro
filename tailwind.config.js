/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        'light-bg': '#F9FAFB',
        'light-card': '#FFFFFF',
        'light-text-main': '#334155',
        'light-text-secondary': '#64748B',
        'light-border': '#E2E8F0',
        'dark-bg': '#1E293B',
        'dark-card': '#334155',
        'dark-text-main': '#F1F5F9',
        'dark-text-secondary': '#94A3B8',
        'dark-border': '#475569',
        'accent': '#14B8A6',
        'positive': '#22C55E',
        'negative': '#EF4444',
        'positive-dark': '#4ADE80',
        'negative-dark': '#F87171',
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms')
  ],
}