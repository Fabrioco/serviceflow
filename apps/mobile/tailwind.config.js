/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{js,ts,tsx}'],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        deep: '#0B2B2E',
        surface: '#F6F8F8',
        ink: '#0F1B1E',
        line: '#D5E0E2',
        muted: '#4B5B5F',
      },
    },
  },
  plugins: [],
};
