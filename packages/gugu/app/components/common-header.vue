<template>
  <header>
    <div
      id="nav-container"
      class="max-w-app mx-auto text-foreground sm:bg-transparent"
    >
      <div
        id="top-nav-wrap"
        :class="[
          'relative grid grid-cols-2 grid-rows-[2] w-full items-center justify-between p-4',
          'sm:py-6 sm:flex sm:grid-rows-1',
        ]"
      >
        <ALink
          href="/"
          class="py-1 text-xl leading-8 font-semibold whitespace-nowrap sm:my-auto sm:text-2xl sm:leading-none"
        >
          {{ title }}
        </ALink>

        <div class="flex-center justify-end space-x-4 sm:hidden">
          <ThemeSwitch />
          <a role="button" @click="toggleExpand" class="text-2xl p-1">
            <i-mdi-window-close class="block" v-if="isExpand" />
            <i-mdi-menu class="block" v-else />
          </a>
        </div>
        <nav
          id="nav-menu"
          :class="[
            'col-start-1 col-end-3',
            'w-full flex-col items-center',
            'static top-full left-0 right-0 z-10 mt-4',
            'sm:mt-0 sm:ms-2 sm:flex-row sm:justify-end sm:space-x-4 sm:py-0 sm:flex',
            !isExpand ? 'hidden' : '',
          ]"
        >
          <ul
            id="menu-items"
            :class="[
              'w-full place-content-center gap-2',
              'sm:flex sm:w-auto sm:gap-x-5 sm:gap-y-0',
            ]"
          >
            <li
              class="col-span-2"
              v-for="(item, index) in navList"
              :key="index"
            >
              <ALink
                :href="item.href"
                class="flex justify-center items-center h-full px-4 py-3 font-medium hover:text-accent sm:px-2 sm:py-1"
                >{{ item.title }}</ALink
              >
            </li>
            <li class="col-span-1 hidden sm:block">
              <a
                class="flex justify-center items-center h-full px-4 py-3 sm:px-2 sm:py-1"
              >
                <ThemeSwitch />
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
    <div class="mx-auto max-w-app px-4">
      <hr class="border-border" aria-hidden="true" />
    </div>
  </header>
</template>
<script setup lang="ts">
import ThemeSwitch from './theme-switch.vue';
import ALink from './a-link.vue';
import { ref } from 'vue';

const navList = [
  {
    title: 'Posts',
    href: '/',
  },
  {
    title: 'Tags',
    href: '/tags',
  },
  {
    title: 'About',
    href: '/about',
  },
];

const title = __BLOG_CONFIG__.title;
const isExpand = ref(false);

const toggleExpand = () => {
  isExpand.value = !isExpand.value;
};
</script>

<style lang="css">
@reference "@mcss";

header a {
  @apply foreground-link;
}
</style>
