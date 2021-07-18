<template>
  <div>
    <router-view v-slot="{ Component }">
      <Suspense>
        <component :is="Component" />
      </Suspense>
    </router-view>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, useSSRContext } from 'vue';
import { useStore } from 'vuex';

export default defineComponent({});
</script>

<script lang="ts" setup>
const x = useSSRContext();
</script>

<style scoped lang="less"></style>
