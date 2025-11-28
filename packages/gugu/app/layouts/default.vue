<template>
  <div class="flex flex-col min-h-screen transition-colors duration-300">
    <CommonHeader />
    <main
      :class="[
        'flex-grow max-w-app mx-auto px-4 py-8 w-full text-foreground',
        mainClass,
      ]"
    >
      <router-view />
    </main>
    <footer class="text-center py-6 text-gray-500 dark:text-gray-400 text-sm">
      <div>
        <span>&copy; {{ year }} {{ blogConfig.title }}</span>
      </div>
    </footer>
    <BackToTop />
  </div>
</template>
<script setup lang="ts">
import CommonHeader from '@app/components/common-header.vue';
import BackToTop from '@app/components/back-to-top.vue';
import { useRoute } from 'vue-router';
import { computed } from 'vue';

const route = useRoute();

const mainClass = computed(() => {
  return (route.meta.layoutClass as string) || '';
});

const blogConfig = __BLOG_CONFIG__;
const currentYear = new Date().getFullYear();
const year = blogConfig.since
  ? `${blogConfig.since}-${currentYear}`
  : currentYear;
</script>
