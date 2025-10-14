import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./app/**/*.{vue,js,ts,jsx,tsx,ejs}'],
  theme: {
    extend: {},
  },
  plugins: [typography],
};
