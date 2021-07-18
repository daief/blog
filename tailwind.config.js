const path = require('path');

module.exports = {
  purge: [
    path.resolve(__dirname, 'src/**/*.{vue,js,ts,jsx,tsx}'),
    path.resolve(__dirname, 'layout/**/*.{vue,js,ts,jsx,tsx}'),
  ],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        primary: ({ opacityVariable, opacityValue }) => {
          if (opacityValue !== undefined) {
            return `rgba(var(--base-primary), ${opacityValue})`;
          }
          if (opacityVariable !== undefined) {
            return `rgba(var(--base-primary), var(${opacityVariable}, 1))`;
          }
          return `rgb(var(--base-primary))`;
        },
        secondary: ({ opacityVariable, opacityValue }) => {
          if (opacityValue !== undefined) {
            return `rgba(var(--color-secondary), ${opacityValue})`;
          }
          if (opacityVariable !== undefined) {
            return `rgba(var(--color-secondary), var(${opacityVariable}, 1))`;
          }
          return `rgb(var(--color-secondary))`;
        },
      },
    },
  },
  variants: {},
  plugins: [],
};
