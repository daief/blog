import { type MaybeRef, unref } from 'vue';

import { useSeoMeta } from '@unhead/vue';

export const usePageTitle = (opts: {
  title: MaybeRef<string>;
  description: MaybeRef<string>;
}) => {
  const { title, description } = opts;

  const titleInput = () =>
    [unref(title), __BLOG_CONFIG__.title].filter(Boolean).join(' | ');

  const descInput = () => unref(description) || '';

  useSeoMeta({
    title: titleInput,
    description: descInput(),
    ogTitle: titleInput,
    ogDescription: descInput(),
  });
};
