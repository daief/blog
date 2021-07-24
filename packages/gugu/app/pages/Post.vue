<template>
  <div class="blog-base-area-box p-8">
    <div v-if="!post">loading</div>
    <div v-else>
      <h1 class="text-xl break-words">{{ post.title }}</h1>
      <div class="my-4 text-xs text-c-secondary" v-if="!!post">
        <PostMeta :post="post" />
      </div>

      <!-- content -->
      <RichText
        v-if="!!postContent"
        :html-text="postContent"
        ref="contentRef"
      />
    </div>
  </div>
  <div
    class="blog-base-area-box px-8 py-4 my-8 flex justify-between"
    v-if="linkedPosts.filter(Boolean).length > 0"
  >
    <div
      class="w-0 flex-grow break-words"
      v-for="(item, index) in linkedPosts"
      :key="index"
      :class="{ 'w-0': !item, 'text-right': index === 1 }"
    >
      <template v-if="!!item">
        <div class="text-c-secondary text-xs mb-1">
          {{ index === 0 ? '上' : '下' }}一篇
        </div>
        <div class="text-sm">
          <ALink :to="item.path" class="unset">
            {{ item.title }}
          </ALink>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { getPostDetail } from '@app/api';
import { computed, defineComponent, nextTick, ref, watch } from 'vue';
import { useStore } from 'vuex';

export default defineComponent({
  name: 'PostPage',
  async asyncData({ store, route, site }) {
    const postId = route.params.id as string;
    const { postDetail } = store.state.global;
    const post: ggDB.IPost = postDetail.post;
    if (post && post.id === postId) {
      return;
    }
    const resp = await getPostDetail(site.axios, postId);
    await store.commit('global/setState', {
      postDetail: {
        ...postDetail,
        post: resp,
      },
    });
  },
});
</script>

<script lang="ts" setup>
import PostMeta from '@app/components/PostMeta.vue';
import RichText from '@app/components/RichText.vue';
import ALink from '@app/components/ALink.vue';
import { createTocHtmlStrByList, getContentTocFromEl } from '@app/utils/dom';
const store = useStore();
const post = computed(() => store.state.global.postDetail.post as ggDB.IPost);

const postContent = computed(() =>
  [
    post.value.excerpt,
    post.value.excerpt && post.value.more
      ? '<a id="more" class="h-0 mt-3 block"></a>'
      : '',
    post.value.more,
  ]
    .filter(Boolean)
    .join('\n'),
);

const linkedPosts = computed(() =>
  post.value ? [post.value.prev, post.value.next] : [],
);

const contentRef = ref<any>(null);

watch(
  () => postContent.value,
  () => {
    nextTick(() => {
      if (!import.meta.env.SSR || !!contentRef.value)
        store.commit('global/setState', {
          tocHtml: createTocHtmlStrByList(
            getContentTocFromEl(contentRef.value.$el),
          ),
        });
    });
  },
  { immediate: true },
);
</script>

<style scoped lang="less"></style>
