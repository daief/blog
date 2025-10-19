<template>
  <button
    @click="toggleTheme"
    class="w-9 h-9 bg-gray-200 rounded-lg dark:bg-gray-600 flex items-center justify-center hover:ring-2 ring-gray-300 transition-all cursor-pointer"
  >
    <i-mdi-white-balance-sunny v-if="theme === 'light'" />
    <i-mdi-moon-and-stars v-else />
  </button>
</template>
<script setup lang="ts">
import { useTheme } from '@app/composables/use-theme';
const { theme, toggleTheme } = useTheme();
</script>
