<template>
  <header
    class="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white dark:bg-black bg-opacity-80 backdrop-blur-md z-10"
  >
    <div class="text-xl font-bold">
      <router-link to="/">GUGU's Blog</router-link>
    </div>
    <div class="flex items-center gap-4">
      <nav class="hidden md:flex items-center gap-6 text-sm">
        <router-link to="/" class="hover:text-blue-500">Home</router-link>
        <router-link to="/about" class="hover:text-blue-500">About</router-link>
      </nav>
      <ThemeSwitch />
    </div>
  </header>
</template>
<script setup lang="ts">
import ThemeSwitch from './theme-switch.vue';
</script>
