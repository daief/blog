<template>
  <div
    class="h-8 flex justify-center items-center text-md gap-x-4 text-foreground"
  >
    <router-link
      :to="links.prev"
      class="text-xl foreground-link"
      v-if="links.prev"
    >
      <i-mdi-arrow-left class="block" />
    </router-link>
    <span v-else aria-disabled="true" class="text-xl opacity-50">
      <i-mdi-arrow-left class="block" />
    </span>

    <div class="space-x-2">
      <span>{{ current }}</span>
      <span>/</span>
      <span>{{ total }}</span>
    </div>

    <router-link
      v-if="links.next"
      :to="links.next"
      class="text-xl foreground-link"
    >
      <i-mdi-arrow-right class="block" />
    </router-link>
    <span v-else aria-disabled="true" class="text-xl opacity-50">
      <i-mdi-arrow-right class="block" />
    </span>
  </div>
</template>

<script setup lang="tsx">
import { computed } from 'vue';

defineOptions({
  name: 'Pagination',
});

const { current, total, pattern } = defineProps<{
  current: number;
  total: number;
  // '/xxx/:page'
  // :page replace with current
  pattern: string;
}>();

const links = computed(() => {
  const prev = current - 1;
  const next = current + 1;

  return {
    prev: prev > 0 ? pattern.replace(':page', String(prev)) : '',
    next: next <= total ? pattern.replace(':page', String(next)) : '',
  };
});
</script>

<style lang="scss" scoped></style>
