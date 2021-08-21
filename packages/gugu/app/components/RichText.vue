<script lang="tsx">
import { defineComponent, nextTick, ref, watch } from 'vue';
import { loadMermaid } from './richTextHelpers/loadMermaid';
import { transformALink } from './richTextHelpers/transformALink';

export default defineComponent({
  name: 'RichText',
  props: {
    htmlText: {
      type: String,
    },
    disabledAnchor: Boolean,
  },
  setup: (props, { attrs }) => {
    const el = ref<HTMLDivElement>(null);

    watch(
      () => props.htmlText,
      (_1, _2, onInvalidate) => {
        const opts = { root: el, disabledAnchor: props.disabledAnchor };

        const cleanUpList: any[] = [];
        [loadMermaid, transformALink].forEach((plugin) => {
          nextTick(() => {
            cleanUpList.push(plugin(opts));
          });
        });

        onInvalidate(() => {
          cleanUpList.forEach((clean) => clean && clean());
        });
      },
      { immediate: true },
    );
    return () => (
      <div
        innerHTML={props.htmlText}
        class="markdown-body text-sm text-gray-800 leading-loose"
        ref={el}
        {...attrs}
      ></div>
    );
  },
});
</script>

<style scoped lang="less"></style>

<style lang="less">
.markdown-body {
  ul {
    list-style: disc;
  }
  ul ul {
    list-style: circle;
  }
  ::selection {
    color: #fff;
    @apply bg-primary;
  }
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    position: relative;
    & .headerlink {
      position: absolute;
      padding-right: 0.25em;
      width: 1.25em;
      height: 1em;
      left: -1.25em;
      top: 0.2em;
      fill: currentColor;
      font-size: inherit;
      display: none;
    }
    &:hover .headerlink {
      display: block;
    }
  }

  // 卡片样式
  a[data-layout='card'][data-layout-status='complete'] {
    @apply flex items-center w-80 mx-auto my-4 p-3 bg-gray-50 max-w-full rounded-md no-underline;
    min-height: 84px;

    &:hover {
      @apply shadow-sm;
    }
  }
}
</style>
