declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare const __PROD__: boolean;

interface Window {
  __INITIAL_STATE__: any;
}

interface ImportMeta {
  env: {
    SSR: boolean;
  };
}
