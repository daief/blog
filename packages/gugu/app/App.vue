<template>
  <div
    class="m-4 max-w-screen-xl flex flex-wrap md:m-6 xl:mx-auto md:flex-nowrap"
  >
    <div class="blog-base-area-box w-full py-6 mb-4 md:sticky md:top-6 md:w-48">
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
          <router-link to="/" class="unset">
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

        <div class="mt-6 flex justify-center">
          <a to="https://github.com/daief" class="unset cursor-pointer">
            <Icon name="github" />
          </a>
          <span class="mx-2" />
          <a to="mailto:defeng_mail@163.com" class="unset cursor-pointer">
            <Icon name="email" />
          </a>
        </div>
      </div>
      <div class="mt-6">
        <Menus />
      </div>
    </div>
    <div class="w-full md:w-0 md:flex-grow md:mx-5">
      <router-view v-slot="{ Component }">
        <div>
          <Suspense>
            <component :is="Component" />
          </Suspense>
        </div>
      </router-view>
    </div>
    <div class="blog-base-area-box hidden md:block w-48 sticky top-6">
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
