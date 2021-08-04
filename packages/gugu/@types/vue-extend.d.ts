import { IStoreState } from '@app/store/types';
import { IUserConfig } from '@t';
import { AxiosInstance } from 'axios';
import { RouteLocationNormalized, Router } from 'vue-router';
import { Store } from 'vuex';

declare global {
  interface IAsyncDataCtx {
    store: Store<IStoreState>;
    fromRoute?: RouteLocationNormalized;
    route: RouteLocationNormalized;
    site: ISiteContext;
    router: Router;
  }

  interface IAsyncData {
    (ctx: IAsyncDataCtx): Promise<any> | any;
  }

  interface ISiteContext {
    axios: AxiosInstance;
    blogConfig: IUserConfig;
    router: Router;
    store: Store<IStoreState>;
  }
}

declare module '@vue/runtime-core' {
  export interface ComponentCustomProperties {
    $site: ISiteContext;
  }

  export function defineComponent(options: { asyncData?: IAsyncData }): any;
}
