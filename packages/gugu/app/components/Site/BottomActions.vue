<script lang="tsx">
import { useSiteContext } from '@app/utils/siteContext';
import { useEventListener } from '@vant/use';
import { defineComponent, PropType, ref, Transition } from 'vue';
import throttle from 'lodash/throttle';
import IconVue from '../Icon.vue';

function useScrollToTop() {
  const scrollTop = ref(0);

  useEventListener(
    'scroll',
    throttle((e) => {
      scrollTop.value = document.documentElement.scrollTop;
    }),
  );

  return {
    scrollTop,
    toTop: () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    },
  };
}

export default defineComponent({
  name: 'BottomActions',
  setup: () => {
    const scrollInfo = useScrollToTop();

    return () => (
      <div class=" fixed z-100 right-8 bottom-8">
        <div
          class={[
            'blog-base-area-box action-btn',
            scrollInfo.scrollTop.value > 300
              ? 'opacity-100'
              : 'opacity-0 pointer-events-none',
          ]}
          onClick={scrollInfo.toTop}
        >
          <IconVue name="top" />
        </div>
      </div>
    );
  },
});
</script>

<style lang="less" scoped>
.action-btn {
  @apply w-10 h-10 flex justify-center items-center rounded-full cursor-pointer transition text-lg;

  &:hover {
    @apply shadow-lg text-primary;
  }
}
</style>
