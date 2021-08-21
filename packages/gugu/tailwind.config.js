const colors = require('tailwindcss/colors');
const path = require('path');

const resolveApp = (p) => path.resolve(__dirname, p);

module.exports = {
  purge: [
    resolveApp('./app/index.html'),
    resolveApp('./app/**/*.{vue,js,ts,jsx,tsx}'),
    resolveApp('./app/styles/**/*.{ts,css}'),
  ],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        transparent: 'transparent',
        current: 'currentColor',
        primary: ({ opacityVariable, opacityValue }) => {
          if (opacityValue !== undefined) {
            return `rgba(var(--base-primary), ${opacityValue})`;
          }
          if (opacityVariable !== undefined) {
            return `rgba(var(--base-primary), var(${opacityVariable}, 1))`;
          }
          return `rgb(var(--base-primary))`;
        },
        'c-title': colors.gray[800], // 标题
        'c-text': colors.gray[600], // 文本
        'c-secondary': colors.gray[400], // 浅灰
        'c-weak': colors.gray[300], // 浅灰
        danger: colors.red[600], // 危险
        success: colors.green[400], // 成功
        warn: colors.yellow[500], // 警告
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [require('@tailwindcss/line-clamp')],
};
