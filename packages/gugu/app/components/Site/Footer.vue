<script lang="tsx">
import { IStoreState } from '@app/store/types';
import { useSiteContext } from '@app/utils/siteContext';
import { computed, defineComponent, ref } from 'vue';
import { useStore } from 'vuex';
import IconVue from '../Icon.vue';

export default defineComponent({
  name: 'SiteFooter',
  setup: () => {
    const store = useStore<IStoreState>();
    const site = useSiteContext();
    const copyright = computed(
      () => `© ${site.blogConfig.since}-${new Date().getFullYear()}`,
    );
    const author = computed(() => `By gugu & ${site.blogConfig.author}`);
    return () => (
      <div class="text-center text-sm">
        <div class="mb-2">{copyright.value}</div>
        <div class="mb-2">{author.value}</div>
        {store.state.global.site.site_pv ? (
          <div>本站总访问量 {store.state.global.site.site_pv}</div>
        ) : null}
      </div>
    );
  },
});
</script>

<style lang="less" scoped></style>
