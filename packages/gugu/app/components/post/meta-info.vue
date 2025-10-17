<template>
  <div class="flex items-center gap-x-3 text-foreground opacity-80">
    <component :is="render()" />
  </div>
</template>

<script setup lang="tsx">
import { CalendarOutline } from '@vicons/ionicons5';
import { Icon } from '@vicons/utils';
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
  return <div class="inline-flex items-center gap-x-1">{cnt}</div>;
};

const render = () => {
  let nodes: any[] = [];

  if (meta.isDraft) {
    nodes.push(
      renderWrapper(
        <div class="text-xs text-red-500 py-0.5 px-1 border border-red-400">
          草稿
        </div>,
      ),
    );
  }

  if (meta.sort! > 0) {
    nodes.push(
      renderWrapper(
        <div class="text-xs text-accent py-0.5 px-1 border border-accent">
          置顶
        </div>,
      ),
    );
  }

  if (meta.modified || meta.date) {
    nodes.push(
      renderWrapper(
        <>
          <Icon>
            <CalendarOutline />
          </Icon>
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
      renderWrapper(
        meta.tags.map((tag) => (
          <span class="mr-2">
            <span class="select-none">#</span>
            {tag}
          </span>
        )),
      ),
    );
  }

  nodes = nodes.map((node, i) => (
    <>
      {i !== 0 && <div class="inline-block h-[1em] w-px bg-gray-200" />}
      {node}
    </>
  ));

  return <>{nodes}</>;
};
</script>

<style lang="scss" scoped></style>
