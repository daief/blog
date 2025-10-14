<template>
  <div
    class="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-300"
  >
    <CommonHeader />
    <main class="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <router-view />
    </main>
    <footer class="text-center py-4 text-gray-500 text-sm">
      Copyright © 2024 GUGU
    </footer>
    <BackToTop />
  </div>
</template>
<script setup lang="ts">
import CommonHeader from '@app/components/common-header.vue';
import BackToTop from '@app/components/back-to-top.vue';
</script>
