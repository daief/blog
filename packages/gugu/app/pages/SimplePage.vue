<template>
  <div class="blog-base-area-box p-8">
    <div v-if="!post">loading</div>
    <div v-else>
      <h1 class="text-2xl font-normal break-words mb-5">{{ post.title }}</h1>

      <!-- content -->
      <RichText
        v-if="!!postContent"
        :html-text="postContent"
        ref="contentRef"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { getPostDetail, getSimplePageContent } from '@app/api';
import { computed, defineComponent, nextTick, ref, watch } from 'vue';
import { useStore } from 'vuex';

export default defineComponent({
  name: 'SimplePage',
  async asyncData({ store, route, site }) {
    const path = route.name as string;
    const { simplePageDetail } = store.state.global;
    const post: ggDB.IPost = simplePageDetail.post;
    if (post && post.path === path) {
      return;
    }
    const resp = await getSimplePageContent(site.axios, path);
    await store.commit('global/setState', {
      simplePageDetail: {
        ...simplePageDetail,
        post: resp,
      },
    });
  },
});
</script>

<script lang="ts" setup>
import RichText from '@app/components/RichText.vue';
import { createTocHtmlStrByList, getContentTocFromEl } from '@app/utils/dom';

const store = useStore();
const post = computed(
  () => store.state.global.simplePageDetail.post as ggDB.IPost,
);

const postContent = computed(() =>
  post.value
    ? [post.value.excerpt || '', post.value.more || '']
        .filter(Boolean)
        .join('\n')
    : '',
);
</script>

<style scoped lang="less"></style>
