<template>
  <component :is="render()" />
</template>

<script setup lang="tsx">
import { useSlots } from 'vue';

defineOptions({
  name: 'Test',
});

const slots = useSlots();

const render = () => {
  return <div>111222333{slots.default?.()}</div>;
};
</script>
