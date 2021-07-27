<script lang="tsx">
import { defineComponent } from 'vue';

export default defineComponent({
  name: '404',
  setup: () => {
    return () => <div class="blog-base-area-box p-8">页面丢失了 o(╥﹏╥)o</div>;
  },
});
</script>

<style scoped lang="less"></style>
