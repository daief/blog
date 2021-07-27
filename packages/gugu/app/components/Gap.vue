<script lang="tsx">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Gap',
  setup: (_, { slots }) => {
    return () => {
      const children = slots.default();
      return (
        <div class={[children.length ? 'has-child' : '', '']}>{children}</div>
      );
    };
  },
});
</script>

<style scoped lang="less">
.has-child {
  position: relative;
  display: flex;
  align-items: center;

  &::before,
  &::after {
    content: '';
    flex-grow: 1;
    height: 1px;
    @apply bg-gray-300;
  }

  &::before {
    margin-right: 20px;
  }
  &::after {
    margin-left: 20px;
  }
}
</style>
