import { useDark } from '@vueuse/core';
import { computed } from 'vue';
import { darkTheme } from 'naive-ui';

const isDark = useDark({
  selector: 'html',
  attribute: 'data-theme',
  valueDark: 'dark',
  valueLight: 'light',
});

const theme = computed<'light' | 'dark'>(() =>
  isDark.value ? 'dark' : 'light',
);
const naiveTheme = computed(() => (isDark.value ? darkTheme : null));

export function useTheme() {
  const toggleTheme = () => {
    isDark.value = !isDark.value;
  };

  return {
    theme,
    naiveTheme,
    toggleTheme,
  };
}
