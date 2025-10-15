<template>
  <div class="prose markdown-body dark:prose-invert max-w-none">
    <slot />
  </div>
</template>

<script setup lang="ts"></script>

<style lang="css">
.markdown-body img.post-image {
  padding: 2px;
  margin-left: auto;
  margin-right: auto;
  margin-top: 0.25rem;
  margin-bottom: 0.25rem;
  display: block;
  border-radius: 0.125rem;
  border-width: 1px;
  border-style: solid;
  --tw-border-opacity: 1;
  border-color: rgba(209, 213, 219, var(--tw-border-opacity));
}
</style>
