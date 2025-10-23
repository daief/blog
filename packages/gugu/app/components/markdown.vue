<template>
  <div class="md-prose max-w-none dark:prose-invert" ref="mdEl">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { onMounted, useTemplateRef } from 'vue';
import ALink from './a-link.vue'; // 给 markdown 渲染后的 html 使用

const elRef = useTemplateRef<HTMLElement | null>('mdEl');

onMounted(async () => {
  if (!elRef.value) return;
  const { default: mermaid } = await import('mermaid');
  mermaid.initialize({ startOnLoad: false });
  mermaid.run({
    nodes: Array.from(elRef.value.querySelectorAll('pre.mermaid')),
  });
});
</script>

<style lang="css"></style>
