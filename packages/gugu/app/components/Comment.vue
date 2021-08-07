<script lang="tsx">
import { useSiteContext } from '@app/utils/siteContext';
import { defineComponent, onMounted, ref } from 'vue';

export default defineComponent({
  name: 'Comment',
  setup: (_, { attrs }) => {
    const nodeRef = ref<HTMLDivElement>();
    const site = useSiteContext();

    onMounted(() => {
      const script = document.createElement('script');
      script.async = true;
      script.defer = true;
      script.crossOrigin = 'anonymous';
      const { enable: _, ...utterancConfig } = site.blogConfig.utteranc;
      Object.entries({ ...utterancConfig }).forEach((kv) => {
        script.setAttribute(...kv);
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
