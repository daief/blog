<template>
  <div class="blog-base-area-box p-8">
    <h1 class="text-2xl font-normal break-words mb-5">分类</h1>

    <div class="text-sm my-8 text-center">
      目前共计 {{ cats.length }} 个分类
    </div>

    <div class="flex justify-center flex-wrap">
      <ALink
        v-for="cat in cats"
        :to="`/categories/${cat.name}`"
        :key="cat.id"
        class="unset inline-block whitespace-nowrap mx-3 my-1"
      >
        <Icon name="tag" />
        {{ cat.name }}
        <span class="text-c-secondary">({{ cat.postCount }})</span>
      </ALink>
    </div>
  </div>
</template>

<script lang="ts">
import { getCategoryList } from '@app/api';
import { usePageTitle } from '@app/utils/hooks/usePageTitle';
import { computed, defineComponent } from 'vue';
import { useStore } from 'vuex';

export default defineComponent({
  name: 'CategoriesPage',
  asyncData({ store, site }) {
    return getCategoryList(site.axios).then((resp) =>
      store.commit('labels/setState', { labels: resp }),
    );
  },
});
</script>

<script lang="ts" setup>
import Icon from '@app/components/Icon.vue';
import ALink from '@app/components/ALink.vue';
const store = useStore();
const cats = computed(() =>
  ([...store.state.labels.labels] as ggDB.ITag[]).sort(
    (a, b) => b.postCount - a.postCount,
  ),
);

usePageTitle(computed(() => `标签（${cats.value.length}）`));
</script>

<style scoped lang="less"></style>
