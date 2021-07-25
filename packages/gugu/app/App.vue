<template>
  <div class="mx-6 m-6 xl:mx-auto max-w-screen-xl flex">
    <div class="blog-base-area-box w-48 py-6 sticky top-6">
      <img
        class="block w-24 h-24 rounded-full mx-auto"
        :src="siteCtx.blogConfig.avatar"
      />
      <div class="mt-5 px-3 text-center">
        <h1 class="text-c-title font-normal">
          <a href="" class="unset">{{ siteCtx.blogConfig.title }}</a>
        </h1>
        <p
          class="mt-2 text-sm text-c-secondary break-words"
          v-if="!!siteCtx.blogConfig.description"
        >
          {{ siteCtx.blogConfig.description }}
        </p>
        <div class="mt-3 text-xs flex justify-center">
          <router-link to="/archives" class="unset">
            <Icon name="wenzhang" />({{ blogBrief.postCount }})
          </router-link>
          <span class="mx-1 text-c-secondary">|</span>
          <router-link to="/tags" class="unset">
            <Icon name="tag" />({{ blogBrief.tagCount }})
          </router-link>
          <span class="mx-1 text-c-secondary">|</span>
          <router-link to="/categories" class="unset">
            <Icon name="category" />({{ blogBrief.categoryCount }})
          </router-link>
        </div>
      </div>
      <div class="mt-6">
        <Menus />
      </div>
    </div>
    <div class="w-0 flex-grow mx-5">
      <router-view v-slot="{ Component }">
        <div>
          <Suspense>
            <component :is="Component" />
          </Suspense>
        </div>
      </router-view>
    </div>
    <div class="blog-base-area-box w-48 sticky top-6">
      <Toc />
    </div>
  </div>
  <BottomActions />
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { useStore } from 'vuex';

export default defineComponent({
  name: 'App',
});
</script>

<script lang="ts" setup>
import Icon from '@app/components/Icon.vue';
import Toc from './components/Site/Toc.vue';
import Menus from './components/Site/Menus.vue';
import { useSiteContext } from './utils/siteContext';
import BottomActions from './components/Site/BottomActions.vue';
import { usePageTitle } from './utils/hooks/usePageTitle';
const store = useStore();
const blogBrief = computed(() => store.state.global.site);
const siteCtx = useSiteContext();

usePageTitle();
</script>

<style scoped lang="less"></style>
