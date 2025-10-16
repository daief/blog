<template>
  <div class="md-prose dark:prose-invert max-w-none" ref="mdEl">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, useTemplateRef } from 'vue';

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
