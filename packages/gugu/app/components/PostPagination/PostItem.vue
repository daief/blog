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
  setup({ post, center }) {
    return () => (
      <div
        class={[
          'post-item border-b border-gray-200 pb-6 mb-6',
          center && 'justify-center',
        ]}
      >
        <h1 class="text-lg font-normal break-words">
          <ALinkVue class="unset hover:border-b" to={post.path}>
            {post.title}
          </ALinkVue>
        </h1>
        <div class="my-4 break-words">
          <RichTextVue htmlText={post.excerpt} />
        </div>
        <div class="text-xs flex justify-between">
          <PostMetaVue post={post} />
          <ALinkVue class="unset" to={post.path}>
            查看全文{'>>'}
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
}
</style>
