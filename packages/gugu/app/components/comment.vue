<template>
  <div>
    <h2 class="text-xl font-bold mb-5">
      <a href="#comment" class="text-accent foreground-link">留言板</a>
    </h2>

    <div class="utterances-wrapper" ref="comment" />
  </div>
</template>

<script setup lang="tsx">
import { useTheme } from '@app/composables/use-theme';
import { effect, onMounted, useTemplateRef } from 'vue';

defineOptions({
  name: 'Comment',
});

const { enable, ...utterancConfig } = { ...__BLOG_CONFIG__.utteranc };
const { isDark } = useTheme();
const elRef = useTemplateRef<HTMLElement | null>('comment');

const setTheme = () => {
  const utterances = elRef.value?.querySelector(
    '.utterances-frame',
  ) as HTMLIFrameElement | null;
  if (!utterances) return;

  utterances.contentWindow?.postMessage(
    {
      type: 'set-theme',
      theme: isDark.value
        ? utterancConfig.darkTheme
        : utterancConfig.lightTheme,
    },
    'https://utteranc.es',
  );
};

onMounted(() => {
  if (!elRef.value || !enable) return;

  const script = document.createElement('script');
  script.async = true;
  script.defer = true;
  script.crossOrigin = 'anonymous';
  Object.entries({ ...utterancConfig }).forEach((kv) => {
    script.setAttribute(...kv);
  });
  script.setAttribute('theme', utterancConfig.lightTheme!);
  script.src = 'https://utteranc.es/client.js';
  elRef.value.append(script);

  const initCallback = (event: MessageEvent) => {
    if (event.origin !== 'https://utteranc.es') {
      return;
    }
    setTheme();
    window.removeEventListener('message', initCallback);
  };
  window.addEventListener('message', initCallback);
});

effect(() => {
  isDark.value;
  setTheme();
});
</script>

<style lang="css">
@import '@mcss';

.utterances {
  @apply max-w-full;
}

.utterances-frame {
  @apply block w-full;
}
</style>
