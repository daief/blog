import { Module } from 'vuex';

const md: Module<
  {
    count: number;
    site: {
      postCount: number;
      tagCount: number;
      categoryCount: number;
    };
  },
  any
> = {
  namespaced: true,
  state: () => ({
    count: 0,
    site: { postCount: 0, tagCount: 0, categoryCount: 0 },
  }),
  mutations: {
    setState(state, payload) {
      Object.assign(state, { ...payload });
    },
  },
};

export default md;
