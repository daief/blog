<template>
  <div class="blog-base-area-box p-8">
    <PostItem v-for="item in data.result" :key="item.id" :post="item" />
  </div>
  <div class="my-8">
    <Pagination
      :total="data.totalPages"
      :current="data.current"
      link-pattern="/page/%d"
    />
  </div>
</template>

<script lang="tsx">
import { getPostList } from '@app/api';
import type { IListResponse } from '@t/common';
import { computed, ComputedRef, defineComponent, ref } from 'vue';
import { useStore } from 'vuex';
import PostItem from '@app/components/PostPagination/PostItem.vue';
import Pagination from '@app/components/Pagination.vue';
import { usePageTitle } from '@app/utils/hooks/usePageTitle';
import { useRoute } from 'vue-router';

export default defineComponent({
  name: 'PostPagination',
  components: {
    PostItem,
    Pagination,
  },
  async asyncData({ store, route, site }) {
    const current = +route.params.no || 1;
    const { indexPostPagination } = store.state.global;
    if (
      current === indexPostPagination.current &&
      !!indexPostPagination.result.length
    ) {
      return;
    }
    const resp = await getPostList(site.axios, { current });
    await store.commit('global/setState', {
      indexPostPagination: resp,
    });
  },
  setup(_) {
    const store = useStore();
    const route = useRoute();

    const data: ComputedRef<IListResponse<ggDB.IPost>> = computed(
      () => store.state.global.indexPostPagination,
    );

    usePageTitle(
      computed(() => {
        const page = +route.params.no || 1;
        return `第${page}页`;
      }),
    );

    return {
      data,
    };
  },
});
</script>

<style scoped lang="less"></style>
