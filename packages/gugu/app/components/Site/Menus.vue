<script lang="tsx">
import { useSiteContext } from '@app/utils/siteContext';
import { computed, defineComponent } from 'vue';
import ALinkVue from '../ALink.vue';

export default defineComponent({
  name: 'SiteMenus',
  setup: () => {
    const site = useSiteContext();
    const menus = computed(() =>
      Object.entries({ ...site.blogConfig.siteMenus }).map(([_, val]) => ({
        ...val,
      })),
    );
    return () => (
      <div class="text-center">
        {menus.value.map((item) => (
          <ALinkVue
            key={item.link}
            to={item.link}
            class={`
            unset
            h-10
            flex
            items-center
            justify-center
            border-b border-t border-gray-100
            text-sm text-c-text
            menu-link
          `}
          >
            {item.label}
          </ALinkVue>
        ))}
      </div>
    );
  },
});
</script>

<style lang="less" scoped>
.menu-link.router-link-active {
  color: #fff;
  @apply bg-primary bg-opacity-50;
}
</style>
