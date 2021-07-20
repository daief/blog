<template>
  <div class="mx-auto my-6 max-w-screen-xl flex">
    <div class="base-box w-48 py-6 px-3">
      <img
        class="block w-24 h-24 rounded-full mx-auto"
        src="https://avatars.githubusercontent.com/u/19222089?v=4"
      />
      <div class="mt-5 text-center">
        <h1 class="text-c-title font-normal">
          <a href="" class="unset"> 个人博客站点 </a>
        </h1>
        <p class="mt-2 text-sm text-c-placeholder break-words">
          可以随便写一点描述，也可以长一点试试。可以随便写一点描述，也可以长一点试试。可以随便写一点描述，也可以长一点试试。可以随便写一点描述，也可以长一点试试。
        </p>
        <div class="mt-3 text-xs flex justify-center">
          <router-link to="" class="unset">
            <Icon name="wenzhang" />({{ site.postCount }})
          </router-link>
          <span class="mx-1 text-c-placeholder">|</span>
          <router-link to="" class="unset">
            <Icon name="tag" />({{ site.tagCount }})
          </router-link>
          <span class="mx-1 text-c-placeholder">|</span>
          <router-link to="" class="unset">
            <Icon name="category" />({{ site.categoryCount }})
          </router-link>
        </div>
      </div>
    </div>
    <div class="base-box flex-grow mx-5 bg-white">
      <router-view v-slot="{ Component }">
        <Suspense>
          <component :is="Component" />
        </Suspense>
      </router-view>
    </div>
    <div class="base-box w-48 bg-white">12</div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, useSSRContext } from 'vue';
import { useStore } from 'vuex';

export default defineComponent({});
</script>

<script lang="ts" setup>
import Icon from '@app/components/Icon.vue';
const store = useStore();
const site = computed(() => store.state.global.site);
</script>

<style scoped lang="less">
.base-box {
  @apply bg-white;
  @apply shadow-md;
  @apply rounded-lg;
}
</style>
