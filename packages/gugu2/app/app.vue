<template>
  <component :is="render()" />
</template>

<script setup lang="tsx">
defineOptions({
  name: 'App',
});

const render = () => {
  return (
    <div>
      <router-view />
    </div>
  );
};
</script>
