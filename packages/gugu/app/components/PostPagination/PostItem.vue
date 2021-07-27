<script lang="tsx">
import { defineComponent, PropType } from 'vue';
import ALinkVue from '../ALink.vue';
import PostMetaVue from '../PostMeta.vue';
import RichTextVue from '../RichText.vue';

export default defineComponent({
  name: 'PostItem',
  props: {
    post: {
      type: Object as PropType<ggDB.IPost>,
      required: true,
    },
    center: Boolean,
  },
  setup(props) {
    return () => (
      <div
        class={[
          'post-item border-b border-gray-200 pb-6 mb-6',
          props.center && 'justify-center',
        ]}
      >
        <h1 class="text-xl font-normal break-words">
          <ALinkVue class="unset post-title" to={props.post.path}>
            {props.post.title}
          </ALinkVue>
        </h1>
        <div class="my-4 break-words">
          <RichTextVue htmlText={props.post.excerpt} disabledAnchor />
        </div>
        <div class="text-xs flex justify-between items-center">
          <PostMetaVue post={props.post} />
          <ALinkVue class="unset whitespace-nowrap" to={props.post.path}>
            查看全文&gt;&gt;
          </ALinkVue>
        </div>
      </div>
    );
  },
});
</script>

<style scoped lang="less">
.post-item {
  &:last-of-type {
    @apply border-b-0 mb-0;
  }

  .post-title {
    @apply relative;

    &::after {
      content: '';
      @apply absolute -bottom-1 left-0 right-0 bg-primary transform scale-0 transition;
      height: 2px;
    }

    &:hover {
      &::after {
        @apply transform scale-x-100;
      }
    }
  }
}
</style>
