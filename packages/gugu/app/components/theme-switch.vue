<template>
  <button @click="toggleTheme" class="transition-all cursor-pointer relative">
    <!-- track -->
    <div
      class="w-10 h-6 rounded-3xl border-[3px] border-[#d1d5da] transition-all duration-300 ease-in-out dark:border-[#6E40C9]"
    >
      <!-- thumb -->
      <div
        :class="[
          'absolute top-1/2 left-0 transform -translate-y-1/2 transition-all duration-300 ease-in-out',
          'w-[28px] h-[28px] bg-[#2f363d] rounded-full flex justify-center items-center',
          'dark:bg-[#6E40C9] dark:left-[calc(100%-28px)]',
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
