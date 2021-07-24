<template>
  <div class="mx-auto my-6 max-w-screen-xl flex">
    <div class="blog-base-area-box w-48 py-6 sticky top-6">
      <img
        class="block w-24 h-24 rounded-full mx-auto"
        src="https://avatars.githubusercontent.com/u/19222089?v=4"
      />
      <div class="mt-5 px-3 text-center">
        <h1 class="text-c-title font-normal">
          <a href="" class="unset"> 个人博客站点 </a>
        </h1>
        <p class="mt-2 text-sm text-c-secondary break-words">
          可以随便写一点描述，也可以长一点试试。可以随便写一点描述，也可以长一点试试。可以随便写一点描述，也可以长一点试试。可以随便写一点描述，也可以长一点试试。
        </p>
        <div class="mt-3 text-xs flex justify-center">
          <router-link to="" class="unset">
            <Icon name="wenzhang" />({{ site.postCount }})
          </router-link>
          <span class="mx-1 text-c-secondary">|</span>
          <router-link to="" class="unset">
            <Icon name="tag" />({{ site.tagCount }})
          </router-link>
          <span class="mx-1 text-c-secondary">|</span>
          <router-link to="" class="unset">
            <Icon name="category" />({{ site.categoryCount }})
          </router-link>
        </div>
      </div>
      <div class="mt-6 text-center">
        <ALink
          v-for="(item, index) in menus"
          :key="index"
          :to="item.link"
          class="
            unset
            h-10
            flex
            items-center
            justify-center
            border-b border-t border-gray-100
            text-sm text-c-text
            menu-link
          "
        >
          {{ item.label }}
        </ALink>
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
    <div class="blog-base-area-box w-48 sticky top-6 p-3">
      <Toc />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, useSSRContext } from 'vue';
import { useStore } from 'vuex';

export default defineComponent({});
</script>

<script lang="ts" setup>
import Icon from '@app/components/Icon.vue';
import ALink from './components/ALink.vue';
import Toc from './components/Site/Toc.vue';
const store = useStore();
const site = computed(() => store.state.global.site);

const menus = [
  {
    link: '/',
    label: '首页',
  },
  {
    link: '/archives',
    label: '归档',
  },
  {
    link: '/about',
    label: '关于',
  },
];
</script>

<style lang="less">
.blog-base-area-box {
  @apply bg-white shadow-md rounded-lg flex-shrink-0 self-start;
}
</style>

<style scoped lang="less">
.menu-link.router-link-active {
  color: #fff;
  @apply bg-primary bg-opacity-50;
}
</style>
