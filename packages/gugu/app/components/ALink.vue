<script lang="tsx">
import { useSiteContext } from '@app/utils/siteContext';
import { defineComponent, PropType } from 'vue';
import type { RouteLocationRaw } from 'vue-router';

export default defineComponent({
  name: 'ALink',
  props: {
    to: {
      type: [String, Object] as PropType<RouteLocationRaw>,
      required: true,
    },
    replace: {
      type: Boolean,
    },
  },
  setup: (props, { attrs, slots }) => {
    const { to } = props;
    const site = useSiteContext();
    const isExternal =
      typeof to === 'string' &&
      to.startsWith('http') &&
      !to.startsWith(site.blogConfig.url);
    return () =>
      !isExternal && !!to ? (
        <router-link {...attrs} {...props}>
          {slots}
        </router-link>
      ) : (
        <a {...props} href={to as string} target="_blank" {...attrs}>
          {slots.default()}
        </a>
      );
  },
});
</script>
