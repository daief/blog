<script lang="tsx">
import { defineComponent, PropType } from 'vue';

type IName =
  | 'browse'
  | 'wenzhang'
  | 'love'
  | 'top'
  | 'bars'
  | 'arrow-left'
  | 'arrow-double-left'
  | 'arrow-double-right'
  | 'folder'
  | 'calendar'
  | 'Link'
  | 'wechat'
  | 'email'
  | 'github'
  | 'tag'
  | 'home'
  | 'person'
  | 'archive'
  | 'category';

if (!import.meta.env.SSR) {
  const script = document.createElement('script');
  script.async = true;
  script.defer = true;
  script.src = '//at.alicdn.com/t/font_2433925_g3odfyi16xt.js';
  document.body.append(script);
}

export default defineComponent({
  name: 'Icon',
  props: {
    name: {
      type: String as PropType<IName>,
      required: true,
    },
  },
  setup: (props, { attrs }) => {
    const { name } = props;
    return () => (
      <svg class="if-icon" aria-hidden="true" {...attrs}>
        <use xlinkHref={`#if-${name}`}></use>
      </svg>
    );
  },
});
</script>

<style scoped lang="less">
.if-icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
  display: inline-block;
}
</style>
