<script lang="tsx">
import { defineComponent, onMounted, ref } from 'vue';

export default defineComponent({
  name: 'Comment',
  setup: (_, { attrs }) => {
    const nodeRef = ref<HTMLDivElement>();
    onMounted(() => {
      const script = document.createElement('script');
      script.async = true;
      script.defer = true;
      script.crossOrigin = 'anonymous';
      [
        ['repo', 'daief/daief.github.io'],
        ['issue-term', 'pathname'],
        ['label', 'Comment'],
        ['theme', 'boxy-light'],
      ].forEach(([key, value]) => {
        script.setAttribute(key, value);
      });
      script.src = 'https://utteranc.es/client.js';
      nodeRef.value && nodeRef.value.append(script);
    });
    return () => (
      <div {...attrs} class={['utterances', attrs.class]} ref={nodeRef} />
    );
  },
});
</script>

<style scoped lang="less"></style>
