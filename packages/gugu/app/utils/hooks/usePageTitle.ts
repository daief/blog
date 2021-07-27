import { useHead } from '@vueuse/head';
import { computed, Ref, unref } from 'vue';
import { useSiteContext } from '../siteContext';

export function usePageTitle(title: string | Ref<string> = '') {
  const site = useSiteContext();
  const finalTitle = computed(() => {
    const t = site.blogConfig.title;
    const inputTitle = unref(title);
    return inputTitle ? `${inputTitle} | ${t}` : t;
  });

  useHead({
    title: finalTitle,
    meta: [
      {
        property: 'og:title',
        content: finalTitle,
      },
      {
        property: 'author',
        content: site.blogConfig.author,
      },
    ],
  });
}
