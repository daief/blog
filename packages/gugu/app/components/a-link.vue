<template>
  <component
    :is="props.tag || 'a'"
    :href="href"
    :target="props.target"
    @click="handleClick"
    :class="{
      [props.activeClass || 'active']: link.isActive.value,
      'flex items-center w-80 mx-auto my-4 p-3 bg-background max-w-full rounded-md no-underline min-h-20 shadow dark:shadow-xl dark:border dark:border-border':
        state,
    }"
  >
    <template v-if="state">
      <div class="text-foreground flex-grow w-0 break-all">
        <div class="text-c-title text-sm mb-0.5 line-clamp-2">
          <span :title="state.title">{{ state.title }}</span>
        </div>
        <div class="text-c-secondary text-xs line-clamp-3 opacity-80">
          <span :title="state.description">{{ state.description }}</span>
        </div>
      </div>
      <img
        class="block bg-background w-16 h-16 rounded object-contain m-0 ml-3 border-0"
        style="text-indent: -2000em"
        :src="state.image"
      />
    </template>
    <slot v-else />
  </component>
</template>

<script setup lang="tsx">
import { computed, useAttrs } from 'vue';
import { useLink, useRouter } from 'vue-router';
import { useAsyncState } from '@vueuse/core';
import { getPageAttributesByUrl } from '@app/shared/link-card';

defineOptions({
  name: 'ALink',
});

const props = defineProps<{
  href?: string;
  target?: '_blank' | '_self' | '_parent' | '_top';
  activeClass?: string;
  tag?: string;
  replace?: boolean;
}>();

const attrs = useAttrs() as {
  'data-layout'?: 'card';
};

const router = useRouter();

const { state } = useAsyncState(
  async () => {
    if (attrs['data-layout'] !== 'card') return;
    return getPageAttributesByUrl(props.href);
  },
  null,
  { immediate: true },
);

// TODO
const base = '';

const href = computed(() => {
  if (typeof props.href === 'string' && props.href.startsWith('/')) {
    return base + props.href;
  }
  return props.href || '';
});

const replace = computed(() => props.replace);
const link = useLink({ to: href, replace: replace });

const handleClick = (e: MouseEvent) => {
  // 如果有 target="_blank" 等外部行为，不处理
  if (props.target && props.target !== '_self') return;

  // 检查是否按了 ctrl / meta / alt / shift
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

  // TODO exclude 404
  if (router.resolve(href.value!).matched.length) {
    e.preventDefault();
    router[replace.value ? 'replace' : 'push'](href.value!);
    return;
  }
};
</script>
