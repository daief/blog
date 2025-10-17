<template>
  <div class="flex items-center gap-x-2 text-foreground opacity-80">
    <component :is="render()" />
  </div>
</template>

<script setup lang="tsx">
import { NDivider, NIcon } from 'naive-ui';
import { CalendarOutline } from '@vicons/ionicons5';
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

  if (meta.modified || meta.date) {
    nodes.push(
      renderWrapper(
        <>
          <NIcon>
            <CalendarOutline />
          </NIcon>
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
        <>
          {meta.tags.map((tag) => (
            <span class="mr-2">#{tag}</span>
          ))}
        </>,
      ),
    );
  }

  nodes = nodes.map((node, i) => (
    <>
      {i !== 0 && <NDivider vertical />}
      {node}
    </>
  ));

  return <>{nodes}</>;
};
</script>

<style lang="scss" scoped></style>
