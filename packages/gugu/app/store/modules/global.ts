import { Module } from 'vuex';

const md: Module<
  {
    count: number;
  },
  any
> = {
  namespaced: true,
  state: () => ({
    count: 0,
  }),
  mutations: {
    setState(state, payload) {
      Object.assign(state, { ...payload });
    },
  },
};

export default md;
