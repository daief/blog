import { Module } from 'vuex';

const md: Module<
  {
    count: number;
    site: {};
  },
  any
> = {
  namespaced: true,
  state: () => ({
    count: 0,
    site: {},
  }),
  mutations: {
    setState(state, payload) {
      Object.assign(state, { ...payload });
    },
  },
};

export default md;
