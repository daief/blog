<script lang="tsx">
import { formatTime } from '@app/utils/format';
import { defineComponent, PropType, Fragment, computed } from 'vue';
import ALinkVue from './ALink.vue';
import IconVue from './Icon.vue';

export default defineComponent({
  name: 'PostMeta',
  props: {
    post: Object as PropType<ggDB.IPost>,
  },
  setup: (props) => {
    const vals = computed(() => {
      const hasCats = !!props.post.categories.length;
      const hasBrowser = !!props.post.viewCount;
      return {
        hasCats,
        hasBrowser,
        formated: formatTime(props.post.date),
        isShowDraft: !props.post.published && !__PROD__,
        // 默认 sort 为 0，大于 0 即认为是置顶操作
        isShowTop: props.post.sort > 0,
      };
    });

    return () => (
      <div class="flex items-center flex-wrap">
        {vals.value.isShowDraft ? (
          <>
            <div class="whitespace-nowrap bg-danger text-white py-0.5 px-1 rounded-sm">
              草稿
            </div>
            <span class="mx-1">|</span>
          </>
        ) : null}
        {vals.value.isShowTop ? (
          <>
            <div class="whitespace-nowrap bg-primary text-white py-0.5 px-1 rounded-sm">
              置顶
            </div>
            <span class="mx-1">|</span>
          </>
        ) : null}
        <div class="whitespace-nowrap">
          <IconVue name="calendar" class="text-c-secondary mx-1" />
          {vals.value.formated}
        </div>
        {vals.value.hasCats && (
          <>
            <span class="mx-1">|</span>
            <div class="whitespace-nowrap">
              <IconVue name="folder" class="text-c-secondary mx-1" />
              {props.post.categories.map((cat, i) => (
                <Fragment key={cat.name}>
                  <ALinkVue to={cat.path} class="unset">
                    {cat.name}
                  </ALinkVue>
                  <span>
                    {i !== props.post.categories.length - 1 ? '，' : ''}
                  </span>
                </Fragment>
              ))}
            </div>
          </>
        )}
        {vals.value.hasBrowser && (
          <>
            <span class="mx-1">|</span>
            <div class="whitespace-nowrap">
              <IconVue name="browse" class="text-c-secondary mx-1" />
              {props.post.viewCount}
            </div>
          </>
        )}
      </div>
    );
  },
});
</script>
