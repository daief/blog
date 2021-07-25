import { IListResponse } from '@t/common';
import { Module } from 'vuex';

const md: Module<
  {
    tags: ggDB.ITag[];
    postPagination: IListResponse<ggDB.IPost>;
  },
  any
> = {
  namespaced: true,
  state: () => ({
    tags: [],
    postPagination: {
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
