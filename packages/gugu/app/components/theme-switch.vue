<template>
  <button @click="toggleTheme" class="w-9 h-9 bg-gray-200 rounded-lg dark:bg-gray-600 flex items-center justify-center hover:ring-2 ring-gray-300 transition-all">
    <n-icon size="20">
      <Sunny v-if="theme === 'light'" />
      <Moon v-else />
    </n-icon>
  </button>
</template>
<script setup lang="ts">
import { NIcon } from 'naive-ui';
import { Sunny, Moon } from '@vicons/ionicons5';
import { useTheme } from '@app/composables/use-theme';
const { theme, toggleTheme } = useTheme();
</script>
