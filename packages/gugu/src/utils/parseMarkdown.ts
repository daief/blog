import fm from 'front-matter';
import { omit } from 'lodash';
import marked from 'marked';

export const escapeHtml = (str: string) =>
  str.replace(
    /[&<>'"]/g,
    (tag) =>
      ((
        {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          "'": '&#39;',
          '"': '&quot;',
        } as any
      )[tag] || tag),
  );

const strToArray = (s: string | string[] | null) => {
  if (typeof s === 'string') {
    return [s];
  }
  if (Array.isArray(s)) {
    return s;
  }
  return [];
};

export function parseMarkdown(source: string, renderer: marked.Renderer) {
  const { attributes: metadata, body: markdownBody } = fm<
    Partial<{
      title: string;
      date: string;
      published: boolean;
      id: string;
      categories: string | string[];
      tags: string | string[];
      description: string;
      comments: boolean;
    }>
  >(source);

  const [excerpt, more = ''] = marked(markdownBody, {
    renderer,
  }).split('<!-- more -->');

  return {
    ...omit(metadata, ['tags', 'categories']),
    strCategories: strToArray(metadata.categories),
    strTags: strToArray(metadata.tags),
    excerpt,
    more,
    raw: source,
  };
}
