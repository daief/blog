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
    const hasCats = !!props.post.categories.length;
    const formated = computed(() => formatTime(props.post.date));
    return () => (
      <div class="flex items-center">
        <div>
          <IconVue name="calendar" class="text-c-secondary mx-1" />
          {formated.value}
        </div>
        {hasCats && (
          <>
            <span class="mx-1">|</span>
            <div>
              <IconVue name="folder" class="text-c-secondary mx-1" />
              {props.post.categories.map((cat, i) => (
                <Fragment key={cat.name}>
                  <ALinkVue to={cat.path} class="unset">
                    {cat.name}
                  </ALinkVue>
                  {i !== props.post.categories.length - 1 ? '，' : ''}
                </Fragment>
              ))}
            </div>
          </>
        )}
      </div>
    );
  },
});
</script>
