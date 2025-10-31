<template>
  <AppProvider>
    <DefaultLayout />
  </AppProvider>
</template>

<script setup lang="tsx">
import AppProvider from '@app/components/app-provider.vue';
import DefaultLayout from '@app/layouts/default.vue';

defineOptions({
  name: 'App',
});
</script>
