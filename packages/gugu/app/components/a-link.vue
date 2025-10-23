<template>
  <component
    :is="props.tag || 'a'"
    :href="href"
    :target="props.target"
    @click="handleClick"
    :class="{ [props.activeClass || 'active']: link.isActive }"
  >
    <slot />
  </component>
</template>

<script setup lang="tsx">
import { computed } from 'vue';
import { useLink, useRouter } from 'vue-router';

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

// TODO
const base = '';

const router = useRouter();

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
    if (replace.value) {
      router.replace(href.value!);
    } else {
      router.push(href.value!);
    }

    return;
  }
};
</script>
