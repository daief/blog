<template>
  <n-button text @click="toggleTheme">
    <template #icon>
      <n-icon>
        <Sunny v-if="theme === 'light'" />
        <Moon v-else />
      </n-icon>
    </template>
  </n-button>
</template>
<script setup lang="ts">
import { NButton, NIcon } from 'naive-ui';
import { Sunny, Moon } from '@vicons/ionicons5';
import { useTheme } from '@app/composables/use-theme';
const { theme, toggleTheme } = useTheme();
</script>
