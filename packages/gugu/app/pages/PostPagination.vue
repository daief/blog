<template>
  <div>
    PostPagination - {{ route.params.no }} - {{ count }}

    <input v-model="aa" @keydown.enter="go" />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, unref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';

export default defineComponent({
  methods: {},
  asyncData({ store, route, site }) {
    return site.axios
      .get(`/blog-api/post/detail/install-nodejs-on-linux.json`)
      .then((resp) => {
        console.log(111111111, resp.data);
      })
      .catch((ee) => {
        console.log({ ee });
      });
  },
});
</script>

<script lang="ts" setup>
const route = useRoute();
const r = useRouter();

const count = computed(() => useStore().state.global.count);

const aa = ref(count.value);

function go() {
  console.log(111);
  r.push({
    params: {
      no: unref(aa),
    },
  });
}
</script>

<style scoped lang="less"></style>
