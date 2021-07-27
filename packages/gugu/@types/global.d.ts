declare const __PROD__: boolean;
declare const __INJECTED_USER_CONFIG__: import('@t').IUserConfig;

interface Window {
  __INITIAL_STATE__: any;
}

interface ImportMeta {
  env: {
    SSR: boolean;
  };
}
