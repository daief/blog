import { type MaybeRef, unref } from 'vue';

import { useHead, useSeoMeta } from '@unhead/vue';
import { useRoute } from 'vue-router';

export const usePageTitle = (opts: {
  title: MaybeRef<string>;
  description?: MaybeRef<string>;
  image?: MaybeRef<string>;
}) => {
  const { title, description, image } = opts;
  const route = useRoute();

  const titleInput = () =>
    [unref(title), __BLOG_CONFIG__.title].filter(Boolean).join(' | ');

  const descInput = () =>
    unref(description) || __BLOG_CONFIG__.description || '';

  const imgInput = () => {
    const imageUrl = unref(image) || __BLOG_CONFIG__.avatar;
    return imageUrl ? new URL(imageUrl, __BLOG_CONFIG__.url).toString() : '';
  };
  const urlInput = () => new URL(route.path, __BLOG_CONFIG__.url).toString();

  useSeoMeta({
    title: titleInput,
    description: descInput,

    ogTitle: titleInput,
    ogDescription: descInput,
    ogImage: imgInput,
    ogUrl: urlInput,
    ogType: 'website',

    twitterCard: 'summary_large_image',
    twitterTitle: titleInput,
    twitterDescription: descInput,
    twitterImage: imgInput,

    author: __BLOG_CONFIG__.author,
  });

  useHead({
    link: [{ rel: 'canonical', href: urlInput }],
  });
};
