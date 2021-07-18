const colors = require('tailwindcss/colors');

module.exports = {
  purge: ['./app/index.html', './app/**/*.{vue,js,ts,jsx,tsx}'],
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
        'c-text': colors.gray[700], // 文本
        'c-placeholder': colors.gray[400], // 浅灰
        danger: colors.red[600], // 危险
        success: colors.green[400], // 成功
        warn: colors.yellow[500], // 警告
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
