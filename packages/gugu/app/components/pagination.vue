<template>
  <component :is="render()" />
</template>

<script setup lang="tsx">
defineOptions({
  name: 'Pagination',
});

const render = () => {
  return <div></div>;
};
</script>

<style lang="scss" scoped></style>
