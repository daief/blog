import { useDark } from '@vueuse/core';
import { computed } from 'vue';

const isDark = useDark({
  selector: 'html',
  attribute: 'data-theme',
  valueDark: 'dark',
  valueLight: 'light',
});

const theme = computed<'light' | 'dark'>(() =>
  isDark.value ? 'dark' : 'light',
);

export function useTheme() {
  const toggleTheme = () => {
    isDark.value = !isDark.value;
  };

  return {
    theme,
    isDark,
    toggleTheme,
  };
}
