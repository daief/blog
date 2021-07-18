declare module '*.vue';

declare const __PROD__: boolean;

interface Window {
  __INITIAL_STATE__: any;
}

interface ImportMeta {
  env: {
    SSR: boolean;
  };
}
