<template>
  <header>
    <div
      id="nav-container"
      class="mx-auto flex max-w-app flex-col items-center justify-between sm:flex-row"
    >
      <div
        id="top-nav-wrap"
        class="relative flex w-full items-baseline justify-between bg-background p-4 sm:items-center sm:py-6"
      >
        <a
          href="/"
          class="absolute py-1 text-xl leading-8 font-semibold whitespace-nowrap sm:static sm:my-auto sm:text-2xl sm:leading-none"
        >
          AstroPaper
        </a>
        <nav
          id="nav-menu"
          class="flex w-full flex-col items-center sm:ms-2 sm:flex-row sm:justify-end sm:space-x-4 sm:py-0"
        >
          <ul
            id="menu-items"
            :class="[
              'mt-4 grid w-44 grid-cols-2 place-content-center gap-2',
              '[&>li>a]:block [&>li>a]:px-4 [&>li>a]:py-3 [&>li>a]:text-center [&>li>a]:font-medium [&>li>a]:hover:text-accent sm:[&>li>a]:px-2 sm:[&>li>a]:py-1',
              'hidden',
              'sm:mt-0 sm:flex sm:w-auto sm:gap-x-5 sm:gap-y-0',
            ]"
          >
            <li class="col-span-2"><a href="/posts"> Posts </a></li>
            <li class="col-span-2"><a href="/tags"> Tags </a></li>
            <li class="col-span-2"><a href="/about"> About </a></li>
            <!-- <li class="col-span-1 flex items-center justify-center">
              <ThemeSwitch />
            </li> -->
          </ul>
        </nav>
      </div>
    </div>
    <div class="mx-auto max-w-app px-4">
      <hr class="border" aria-hidden="true" />
    </div>
  </header>
</template>
<script setup lang="ts">
import ThemeSwitch from './theme-switch.vue';
</script>
