<template>
  <div class="mb-14 flex flex-col items-center justify-center">
    <h1 class="text-9xl font-bold text-accent">404</h1>
    <span aria-hidden="true">¯\_(ツ)_/¯</span>
    <p class="mt-4 text-2xl sm:text-3xl">Page Not Found</p>
    <router-link to="/" class="my-6 text-lg foreground-link">
      返回首页
    </router-link>
  </div>
</template>

<script setup lang="tsx">
defineOptions({
  name: '404',
});

const render = () => {
  return <div>404</div>;
};
</script>

<style lang="scss" scoped></style>
