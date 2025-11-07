import { type MaybeRef, unref } from 'vue';

import { useSeoMeta } from '@unhead/vue';

export const usePageTitle = (opts: {
  title: MaybeRef<string>;
  description: MaybeRef<string>;
  image?: MaybeRef<string>;
}) => {
  const { title, description, image } = opts;

  const titleInput = () =>
    [unref(title), __BLOG_CONFIG__.title].filter(Boolean).join(' | ');

  const descInput = () =>
    unref(description) || __BLOG_CONFIG__.description || '';

  const imgInput = () => unref(image) || __BLOG_CONFIG__.avatar;

  useSeoMeta({
    title: titleInput,
    description: descInput,

    ogTitle: titleInput,
    ogDescription: descInput,
    ogImage: imgInput,

    author: __BLOG_CONFIG__.author,
  });
};
