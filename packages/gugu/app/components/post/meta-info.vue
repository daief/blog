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
  meta: Partial<
    IMarkdown['frontmatter'] & {
      isDraft: boolean;
    }
  >;
}>();

const renderWrapper = (cnt: any) => {
  return (
    <div class="inline-flex items-center gap-x-0.5 whitespace-nowrap">
      {cnt}
    </div>
  );
};

const render = () => {
  let nodes: any[] = [];

  if (meta.isDraft) {
    nodes.push(
      renderWrapper(
        <div class="text-xs text-red-500 py-0.5 px-1 border border-red-400 rounded-xs">
          草稿
        </div>,
      ),
    );
  }

  if (meta.sort! > 0) {
    nodes.push(
      renderWrapper(
        <div class="text-xs text-accent py-0.5 px-1 border border-accent rounded-xs">
          置顶
        </div>,
      ),
    );
  }

  if (meta.modified || meta.date) {
    nodes.push(
      renderWrapper(
        <>
          <i-mdi-calendar-month-outline class="block" />
          <span>
            {meta.modified ? '更新于：' : '发表于：'}
            <time datetime={meta.modified || meta.date}>
              {formatDate(new Date(meta.modified || meta.date!), 'YYYY/MM/DD')}
            </time>
          </span>
        </>,
      ),
    );
  }

  if (meta.tags?.length) {
    nodes.push(
      // renderWrapper(
      meta.tags.map((tag) => (
        <router-link class="foreground-link" to={`/tags/${tag}/1`}>
          <i-mdi-tag-outline class="select-none mr-0.5 text-foreground" />
          {tag}
        </router-link>
      )),
      // ),
    );
  }

  // nodes = nodes.map((node, i) => (
  //   <>
  //     {i !== 0 && <div class="inline-block h-[1em] w-px bg-gray-300" />}
  //     {node}
  //   </>
  // ));

  return <>{nodes}</>;
};
</script>

<style lang="scss" scoped></style>
