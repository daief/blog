<script lang="tsx">
import { IStoreState } from '@app/store/types';
import { useSiteContext } from '@app/utils/siteContext';
import { getThemeColorRgb, setTheme } from '@app/utils/theme';
import { computed, defineComponent, ref } from 'vue';
import { useStore } from 'vuex';
import ColorPickerVue from '../ColorPicker.vue';
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

    const themeColorStr = ref(`rgb(${getThemeColorRgb()})`);
    setTheme(getThemeColorRgb()); // 初始化赋值

    const handleColorChange = (color: string, rgba: number[]) => {
      themeColorStr.value = color;
      setTheme(rgba.slice(0, 3).join(','));
    };

    return () => (
      <div class="footer text-center text-sm">
        <div>
          <div>{copyright.value}</div>
        </div>
        <div class="flex items-center justify-center">
          {author.value}&nbsp;-&nbsp;
          <ColorPickerVue
            value={themeColorStr.value}
            onUpdateValue={handleColorChange}
          />
        </div>
        {store.state.global.site.site_pv ? (
          <div>本站访问量 {store.state.global.site.site_pv}</div>
        ) : null}
        {store.state.global.site.site_uv ? (
          <div>本站访客数 {store.state.global.site.site_uv}</div>
        ) : null}
      </div>
    );
  },
});
</script>

<style lang="less" scoped>
.footer {
  & > * {
    @apply mb-1;
  }
}
</style>
