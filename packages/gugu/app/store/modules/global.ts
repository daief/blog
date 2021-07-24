import { IListResponse } from '@t/common';
import { Module } from 'vuex';
import { getCurrentInstance } from 'vue';

const md: Module<
  {
    site: {
      postCount: number;
      tagCount: number;
      categoryCount: number;
    };
    indexPostPagination: IListResponse<ggDB.IPost>;
  },
  any
> = {
  namespaced: true,
  state: () => ({
    site: { postCount: 0, tagCount: 0, categoryCount: 0 },
    indexPostPagination: {
      current: 1,
      pageSize: 10,
      totalPages: 0,
      result: [],
    },
  }),
  mutations: {
    setState(state, payload) {
      Object.assign(state, { ...payload });
    },
  },
};

export default md;
