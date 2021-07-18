<template>
  <svg class="if-icon" aria-hidden="true">
    <use :xlink:href="`#if-${name}`"></use>
  </svg>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

if (!import.meta.env.SSR) {
  const script = document.createElement('script');
  script.async = true;
  script.defer = true;
  script.src = '//at.alicdn.com/t/font_2433925_t9m84e1923.js';
  document.body.append(script);
}

export default defineComponent({
  name: 'Icon',
  props: {
    name: {
      type: String as any as IName,
      required: true,
    },
  },
});

type IName =
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
