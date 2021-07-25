<template>
  <div class="blog-base-area-box p-8">
    <Gap class="mb-6">
      <h1 class="text-lg">
        「{{ catName }}」
        <small class="text-c-secondary">分类</small>
      </h1>
    </Gap>
    <PostItem v-for="item in data.result" :key="item.id" :post="item" />
  </div>
  <div class="my-8">
    <Pagination
      :total="data.totalPages"
      :current="data.current"
      :link-pattern="`/tags/${catName}/%d`"
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
import Gap from '@app/components/Gap.vue';

export default defineComponent({
  name: 'CategoriesPostPagination',
  components: {
    PostItem,
    Pagination,
    Gap,
  },
  async asyncData({ store, route, site }) {
    const current = +route.params.no || 1;
    const cat = route.params.category as string;
    const resp = await getPostList(site.axios, { current, category: cat });
    await store.commit('labels/setState', {
      postPagination: resp,
    });
  },
  setup(_) {
    const store = useStore();
    const route = useRoute();

    const catName = computed(() => route.params.category as string);

    const data: ComputedRef<IListResponse<ggDB.IPost>> = computed(
      () => store.state.labels.postPagination,
    );

    usePageTitle(
      computed(() => {
        const page = +route.params.no || 1;
        return `「${catName.value}」分类 - 第${page}页`;
      }),
    );

    return {
      catName,
      data,
    };
  },
});
</script>

<style scoped lang="less"></style>
