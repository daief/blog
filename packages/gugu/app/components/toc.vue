<template>
  <component :is="renderToc(toc)" />
</template>

<script setup lang="tsx">
import { computed, ref } from 'vue';
import { type ITocItem } from '../../types/markdown.mjs';
import { useEventListener } from '@vueuse/core';

defineOptions({
  name: 'Toc',
});

const { toc } = defineProps<{
  toc: ITocItem[];
}>();

const tocMap = computed(() => {
  const map = new Map<string, ITocItem>();
  toc.forEach(function dfs(item) {
    map.set(item.id, item);
    item.children?.forEach(dfs);
  });
  return map;
});

const active = ref<ITocItem | null>(toc[0].children![0]);

const actives = computed(() => {
  const list: ITocItem[] = [];
  let item = active.value;
  while (item) {
    list.push(item);
    item = tocMap.value.get(item.parent!) || null;
  }
  return list.map((it) => it.id);
});

if (!import.meta.env.SSR) {
  const TOP_BASE = 2;
  const headingList = computed<HTMLElement[]>(() => {
    return Array.from(
      tocMap.value
        .values()
        .map((it) => document.getElementById(it.id) as HTMLElement),
    );
  });

  useEventListener(window, 'scroll', () => {
    const headingArray = headingList.value;
    for (let index = 0; index < headingArray.length - 1; index++) {
      const ele = headingArray[index];
      const nextEle = headingArray[index + 1];
      const eleRect = ele.getBoundingClientRect();
      const nextRect = nextEle.getBoundingClientRect();

      if (eleRect.top < TOP_BASE && nextRect.top > TOP_BASE) {
        active.value = tocMap.value.get(nextEle.id)!;
        break;
      }
    } // for
  });
}

const renderToc = (list?: ITocItem[], level = 0) => {
  if (!list?.length) return null;
  return (
    <ul
      class={[
        {
          'group/root': level === 0,
        },
      ]}
    >
      {list.map((item) => (
        <li>
          <a
            key={item.id}
            href={`#${item.id}`}
            class={[
              'group/item text-foreground flex flex-nowrap items-center mb-1',
            ]}
          >
            <span
              class={[
                'block h-1 bg-foreground rounded-sm opacity-30 transition-300',
                'group-hover/item:opacity-85',
              ]}
              style={{
                width: `${16 - level * 2}px`,
                marginRight: `${18 - (6 - level) * 2}px`,
              }}
            />
            <span
              class={[
                'text-[color-mix(in_srgb,var(--foreground)_70%,transparent)] text-sm overflow-hidden text-ellipsis whitespace-nowrap transition-300',
                'w-0 flex-grow',
                'group-hover/root:opacity-100 group-hover/item:text-foreground',
                actives.value.includes(item.id)
                  ? 'font-bold opacity-100 text-foreground'
                  : 'opacity-0',
              ]}
              title={item.text}
            >
              {item.text}
            </span>
          </a>
          {renderToc(item.children, level + 1)}
        </li>
      ))}
    </ul>
  );
};
</script>

<style lang="scss" scoped></style>
