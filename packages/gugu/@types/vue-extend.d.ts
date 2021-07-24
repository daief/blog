import { IUserConfig } from '@t';
import { AxiosInstance } from 'axios';
import { RouteLocationNormalized } from 'vue-router';
import { Store } from 'vuex';

declare global {
  interface IAsyncDataCtx {
    store: Store<any>;
    route: RouteLocationNormalized;
    site: ISiteContext;
    fromRoute?: RouteLocationNormalized;
  }

  interface IAsyncData {
    (ctx: IAsyncDataCtx): Promise<any> | any;
  }

  interface ISiteContext {
    axios: AxiosInstance;
    blogConfig: IUserConfig;
  }
}

declare module '@vue/runtime-core' {
  export interface ComponentCustomProperties {
    $site: ISiteContext;
  }

  export function defineComponent(options: { asyncData?: IAsyncData }): any;
}
