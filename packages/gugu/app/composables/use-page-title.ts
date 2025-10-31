import { type MaybeRef, unref } from 'vue';
import { useHead, useSeoMeta } from '@vueuse/head';

export const usePageTitle = (title: MaybeRef<string>) => {
  useHead({
    title: () =>
      [unref(title), __BLOG_CONFIG__.title].filter(Boolean).join(' | '),
  });
};
