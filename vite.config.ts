import { defineConfig } from 'vite';
import { extendConfig } from '@blog/gugu';

export default defineConfig((env) => {
  return extendConfig(
    {
      mode: env.mode,
      title: `Daief's Blog`,
      url: 'https://daief.tech',
      author: 'daief',
      avatar: 'https://avatars.githubusercontent.com/u/19222089?v=4',
      since: 2017,
      googleAnalytics: {
        id: 'G-NPFWE07FQ2',
      },
      utteranc: {
        enable: true,
        repo: 'daief/daief.github.io',
        'issue-term': 'pathname',
        label: 'Comment',
        lightTheme: 'github-light',
        darkTheme: 'github-dark-orange',
      },
    },
    {
      plugins: [],
      server: {
        host: '0.0.0.0',
      },
      // @ts-ignore
      ssgOptions: {
        dirStyle: 'nested',
      } satisfies import('vite-ssg').ViteSSGOptions,
    },
  );
});
