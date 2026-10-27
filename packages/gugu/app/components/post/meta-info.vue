<template>
  <div
    class="flex items-center gap-x-3.5 gap-y-0.5 text-foreground opacity-80 flex-wrap"
  >
    <component :is="render()" />
  </div>
</template>

<script setup lang="tsx">
import { type IMarkdown } from '../../../types/markdown.mjs';
import { formatDate } from '@vueuse/core';

defineOptions({
  name: 'PostMetaInfo',
});

const { meta = {} } = defineProps<{
  meta: Partial<IMarkdown['frontmatter']>;
}>();

const render = () => {
  let nodes: any[] = [];

  if (meta.draft) {
    nodes.push(
      <div class="text-xs text-red-500 py-0.5 px-1 border border-red-400 rounded-xs">
        草稿
      </div>,
    );
  }

  if (meta.sort! > 0) {
    nodes.push(
      <div class="text-xs text-accent py-0.5 px-1 border border-accent rounded-xs">
        置顶
      </div>,
    );
  }

  if (meta.ai === true) {
    nodes.push(
      <span
        class="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-accent/25 bg-accent/8 px-2 py-0.5 text-xs font-medium text-accent"
        title="本文由 AI 主导编写"
      >
        <i-mdi-auto-fix class="block" aria-hidden="true" />
        AI
      </span>,
    );
  }

  if (meta.modified || meta.date) {
    nodes.push(
      <div class="inline-flex items-center gap-x-0.5 whitespace-nowrap">
        <i-mdi-calendar-month-outline class="block" />
        <span>
          {meta.modified ? '更新于：' : '发表于：'}
          <time datetime={meta.modified || meta.date}>
            {formatDate(new Date(meta.modified || meta.date!), 'YYYY/MM/DD')}
          </time>
        </span>
      </div>,
    );
  }

  if (meta.tags?.length) {
    nodes.push(
      meta.tags.map((tag) => (
        <router-link
          class="inline-flex items-center foreground-link"
          to={`/tags/${encodeURIComponent(tag)}/1/`}
        >
          <i-mdi-pound class="block select-none mr-0.5 text-foreground" />
          {tag}
        </router-link>
      )),
    );
  }

  return <>{nodes}</>;
};
</script>

<style lang="css"></style>
