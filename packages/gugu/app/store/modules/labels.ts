import { IListResponse } from '@t/common';
import { Module } from 'vuex';

export interface IModuleLabelsState {
  // tag or category
  labels: ggDB.ITag[];
  postPagination: IListResponse<ggDB.IPost>;
}

const md: Module<IModuleLabelsState, any> = {
  namespaced: true,
  state: () => ({
    labels: [],
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
