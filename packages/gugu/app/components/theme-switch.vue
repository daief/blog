<template>
  <button @click="toggleTheme" class="cursor-pointer relative">
    <!-- track -->
    <div
      class="w-10 h-6 rounded-3xl border-[3px] border-[#d1d5da] transition-300 dark:border-[#6E40C9]"
    >
      <!-- thumb -->
      <div
        :class="[
          'absolute top-1/2 -left-0.5 transform -translate-y-1/2 transition-300',
          'w-[28px] h-[28px] bg-[#2f363d] rounded-full flex-center',
          'dark:bg-[#6E40C9] dark:left-[calc(100%-28px+2px)]',
        ]"
      >
        <span class="text-[16px]" v-html="svgMoonHtml" />
      </div>
    </div>
  </button>
</template>
<script setup lang="ts">
import { useTheme } from '@app/composables/use-theme';
// @ts-ignore
import svgMoonHtml from '@app/assets/moon.svg?raw';
const { toggleTheme } = useTheme();
</script>
