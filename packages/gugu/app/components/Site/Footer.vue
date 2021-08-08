<script lang="tsx">
import { IStoreState } from '@app/store/types';
import { useSiteContext } from '@app/utils/siteContext';
import { getThemeColorRgb, setTheme } from '@app/utils/theme';
import { computed, defineComponent, ref } from 'vue';
import { useStore } from 'vuex';
import ColorPickerVue from '../ColorPicker.vue';

export default defineComponent({
  name: 'SiteFooter',
  setup: () => {
    const store = useStore<IStoreState>();
    const site = useSiteContext();
    const copyright = computed(
      () => `© ${site.blogConfig.since}-${new Date().getFullYear()}`,
    );

    const initialThemeValue =
      site.blogConfig.primaryColorRGB || getThemeColorRgb();
    const themeColorStr = ref(`rgb(${initialThemeValue})`);
    setTheme(initialThemeValue); // 初始化赋值

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
          By&nbsp;
          <a
            href="https://github.com/daief/blog/tree/master/packages/gugu"
            target="_blank"
          >
            gugu
          </a>
          &nbsp; & {site.blogConfig.author}&nbsp;-&nbsp;
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
        <div>
          <a href="/sitemap.xml" target="_blank">
            站点地图
          </a>
        </div>
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
