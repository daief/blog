import { IListResponse } from '@t/common';
import { Module } from 'vuex';

export interface IModuleGlobalState {
  site: {
    postCount: number;
    tagCount: number;
    categoryCount: number;
    site_pv: number;
    page_pv: number;
    site_uv: number;
  };
  indexPostPagination: IListResponse<ggDB.IPost>;
  postDetail: {
    post: ggDB.IPost;
  };
  tocHtml: string;
  simplePages: Array<{ path: string; id: string }>;
  simplePageDetail: {
    post: ggDB.IPost;
  };
}

const md: Module<IModuleGlobalState, any> = {
  namespaced: true,
  state: () => ({
    site: {
      postCount: 0,
      tagCount: 0,
      categoryCount: 0,
      site_pv: 0,
      page_pv: 0,
      site_uv: 0,
    },
    indexPostPagination: {
      current: 1,
      pageSize: 10,
      totalPages: 0,
      result: [],
    },
    postDetail: {
      post: null,
    },
    tocHtml: '',
    simplePages: [],
    simplePageDetail: {
      post: null,
    },
  }),
  mutations: {
    setState(state, payload) {
      if (typeof payload === 'function') {
        Object.assign(state, payload(state));
      } else {
        Object.assign(state, { ...payload });
      }
    },
  },
};

export default md;
