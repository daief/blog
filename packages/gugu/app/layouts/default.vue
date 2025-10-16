<template>
  <div class="flex flex-col min-h-screen transition-colors duration-300">
    <CommonHeader />
    <main class="flex-grow max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <router-view />
    </main>
    <footer class="text-center py-6 text-gray-500 dark:text-gray-400 text-sm">
      <div>
        <span>&copy; 2024 GUGU's Blog</span>
      </div>
    </footer>
    <BackToTop />
  </div>
</template>
<script setup lang="ts">
import CommonHeader from '@app/components/common-header.vue';
import BackToTop from '@app/components/back-to-top.vue';
</script>
