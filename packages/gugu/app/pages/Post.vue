<template>
  <div class="blog-base-area-box px-4 py-8 md:px-8">
    <div v-if="!post">您访问的内容不存在🚫</div>
    <div v-else>
      <h1 class="text-2xl font-normal break-words">{{ post.title }}</h1>
      <div class="my-4 text-xs text-c-secondary" v-if="!!post">
        <PostMeta :post="post" />
      </div>

      <!-- content -->
      <RichText
        v-if="!!postContent"
        :html-text="postContent"
        ref="contentRef"
      />

      <Gap class="mt-6">☘️</Gap>

      <div
        v-if="post.tags.length"
        class="flex flex-wrap justify-center text-c-secondary text-sm mt-6"
      >
        <router-link
          class="unset block my-1 mx-2"
          v-for="tag in post.tags"
          :to="`/tags/${tag.name}`"
          :key="tag.id"
        >
          <Icon name="tag" />
          {{ tag.name }}
        </router-link>
      </div>
    </div>
  </div>
  <!-- 上下篇 -->
  <div
    class="blog-base-area-box px-4 py-4 my-8 flex justify-between md:px-8"
    v-if="linkedPosts.filter(Boolean).length > 0"
  >
    <div
      class="w-0 flex-grow break-words"
      v-for="(item, index) in linkedPosts"
      :key="index"
      :class="{
        'w-0': !item,
        'text-right': index === 1,
        'pr-3': index === 0,
        'pl-3': index === 1,
      }"
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
  <!-- 评论 -->
  <div
    id="comment"
    v-if="post && post.comments"
    class="blog-base-area-box p-4 my-8 md:px-8"
  >
    <h1 class="text-c-title text-xl block font-normal mb-5">
      <a
        href="#comment"
        class="unset text-c-title hover:text-c-title hover:underline"
      >
        留言板
      </a>
    </h1>

    <Comment :key="post.id" />
  </div>
</template>

<script lang="ts">
import { getPostDetail } from '@app/api';
import { computed, defineComponent, nextTick, ref, watch } from 'vue';
import { useStore } from 'vuex';

export default defineComponent({
  name: 'PostPage',
  async asyncData({ store, route, site, router }) {
    const postId = route.params.id as string;
    const { postDetail } = store.state.global;
    const post: ggDB.IPost = postDetail.post;
    if (post && post.id === postId) {
      return;
    }
    const resp = await getPostDetail(site.axios, postId).catch((error) => {
      try {
        if (error.response.status === 404 && !import.meta.env.SSR) {
          setTimeout(() => {
            router.push('/404');
          });
        }
      } catch (error) {}
      throw error;
    });
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
import { usePageTitle } from '@app/utils/hooks/usePageTitle';
import Gap from '@app/components/Gap.vue';
import Icon from '@app/components/Icon.vue';
import type { IStoreState } from '@app/store/types';
import Comment from '@app/components/Comment.vue';

const store = useStore<IStoreState>();
const post = computed(() => {
  const p = store.state.global.postDetail.post;
  if (!p) return null;
  return {
    ...p,
    viewCount: store.state.global.site.page_pv,
  } as ggDB.IPost;
});

usePageTitle(computed(() => (post.value ? post.value.title : '')));

const postContent = computed(() =>
  post.value
    ? [
        post.value.excerpt,
        post.value.excerpt && post.value.more
          ? '<a id="more" class="h-0 mt-3 block"></a>'
          : '',
        post.value.more,
      ]
        .filter(Boolean)
        .join('\n')
    : '',
);

const linkedPosts = computed(() =>
  post.value ? [post.value.prev, post.value.next] : [],
);

const contentRef = ref<any>(null);

watch(
  () => postContent.value,
  () => {
    nextTick(() => {
      if (!import.meta.env.SSR && !!contentRef.value)
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
