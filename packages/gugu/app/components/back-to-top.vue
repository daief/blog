<template>
  <button
    v-if="variant === 'toc'"
    class="toc-action w-full border-t border-border mt-4 pt-4"
    type="button"
    aria-label="返回顶部"
    @click="scrollToTop"
  >
    <span class="toc-action__progress" :style="progressStyle">
      <span class="scroll-action__inner">
        <i-mdi-arrow-up class="text-[0.75em]" />
      </span>
    </span>
    <span>返回顶部</span>
  </button>

  <div
    v-else
    :class="[
      'desktop-floating-action fixed z-30 right-4 bottom-5 transition-300',
      'lg:bottom-7',
      isVisible || hasToc
        ? 'opacity-100 translate-y-0'
        : 'pointer-events-none opacity-0 translate-y-3',
      appState.showIndexSidebar ? 'mobile-menu-open' : '',
    ]"
  >
    <button
      v-if="!hasToc"
      class="hidden lg:flex scroll-action"
      type="button"
      aria-label="返回顶部"
      :style="progressStyle"
      @click="scrollToTop"
    >
      <span class="scroll-action__inner">
        <i-mdi-arrow-up class="text-xl" />
      </span>
    </button>

    <div class="flex flex-col items-center gap-2 lg:hidden">
      <button
        v-if="isVisible"
        class="flex scroll-action"
        type="button"
        aria-label="返回顶部"
        :style="progressStyle"
        @click="scrollToTop"
      >
        <span class="scroll-action__inner">
          <i-mdi-arrow-up class="text-lg" />
        </span>
      </button>
      <button
        v-if="hasToc"
        class="flex scroll-action"
        type="button"
        :aria-expanded="appState.showIndexSidebar"
        aria-label="打开目录"
        :style="{ '--scroll-progress': '0deg' }"
        @click="toggleIndexSidebar"
      >
        <span class="scroll-action__inner">
          <i-mdi-format-list-bulleted class="text-lg" />
        </span>
      </button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useAppStore } from '@app/composables/use-app-store';

const route = useRoute();
const { appState, toggleIndexSidebar } = useAppStore();
const { variant = 'floating' } = defineProps<{
  variant?: 'floating' | 'toc';
}>();
const progress = ref(0);
const isVisible = ref(false);

const hasToc = computed(() => {
  const toc = route.meta.toc;
  return Array.isArray(toc) && toc.length > 0;
});

const progressStyle = computed(() => ({
  '--scroll-progress': `${progress.value * 360}deg`,
}));

const updateScrollState = () => {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  progress.value = maxScroll > 0 ? Math.min(window.scrollY / maxScroll, 1) : 0;
  isVisible.value = window.scrollY > Math.min(window.innerHeight * 0.6, 480);
};

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

onMounted(() => {
  updateScrollState();
  window.addEventListener('scroll', updateScrollState, { passive: true });
  window.addEventListener('resize', updateScrollState);
});

onUnmounted(() => {
  window.removeEventListener('scroll', updateScrollState);
  window.removeEventListener('resize', updateScrollState);
});
</script>

<style scoped>
.scroll-action {
  --scroll-progress: 0deg;
  align-items: center;
  background: conic-gradient(
    var(--accent) var(--scroll-progress),
    var(--muted) var(--scroll-progress)
  );
  border-radius: 9999px;
  cursor: pointer;
  height: 2.75rem;
  justify-content: center;
  padding: 0.1875rem;
  transition: transform 0.2s ease;
  width: 2.75rem;
}

.scroll-action:hover {
  transform: translateY(-2px);
}

.scroll-action:active {
  transform: translateY(0);
}

.scroll-action__inner {
  align-items: center;
  background: var(--background);
  border-radius: inherit;
  color: var(--foreground);
  display: flex;
  height: 100%;
  justify-content: center;
  width: 100%;
}

.toc-action {
  cursor: pointer;
  display: none;
}

:global(html:not([data-theme='dark'])) .toc-action {
  border-color: color-mix(in srgb, var(--foreground) 20%, var(--background));
}

@media (min-width: 1024px) {
  .desktop-floating-action {
    left: calc(50% + 20rem + clamp(6px, 17.1875vw - 176px, 50px));
    right: auto;
  }

  .toc-action {
    align-items: center;
    color: var(--foreground);
    display: flex;
    font-size: 0.875rem;
    gap: 0.625rem;
    text-align: left;
    transition: color 0.2s ease;
  }

  .toc-action:hover {
    color: var(--accent);
  }
}

@media (min-width: 1280px) {
  .desktop-floating-action {
    left: calc(50% + 23rem + clamp(6px, 17.1875vw - 176px, 50px));
  }
}

@media (min-width: 1536px) {
  .desktop-floating-action {
    left: calc(50% + 29rem + clamp(6px, 17.1875vw - 176px, 50px));
  }
}

@media (min-width: 1920px) {
  .desktop-floating-action {
    left: calc(50% + 32.75rem + clamp(6px, 17.1875vw - 176px, 50px));
  }
}

.toc-action__progress {
  --scroll-progress: 0deg;
  align-items: center;
  background: conic-gradient(
    var(--accent) var(--scroll-progress),
    var(--muted) var(--scroll-progress)
  );
  border-radius: 9999px;
  display: flex;
  flex: none;
  width: 1.3em;
  height: 1.3em;
  justify-content: center;
  padding: 0.125rem;
}

@media (max-width: 1023px) {
  .mobile-menu-open {
    opacity: 0;
    pointer-events: none;
    transform: translateY(0.75rem);
  }
}
</style>
