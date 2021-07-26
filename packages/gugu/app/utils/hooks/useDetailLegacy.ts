import { getPostDetail } from '@app/api';
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { useSiteContext } from '../siteContext';

// 历史路径兼容
export function useDetailLegacy() {
  const route = useRoute();
  const router = useRouter();
  const site = useSiteContext();
  const store = useStore();

  onMounted(async () => {
    const postId = route.params.id as string;
    const { postDetail } = store.state.global;
    const post: ggDB.IPost = postDetail.post;
    if (post && post.id === postId) {
      return;
    }
    if (route.redirectedFrom && route.redirectedFrom.name === 'detail-legacy') {
      const resp = await getPostDetail(site.axios, postId).catch((error) => {
        try {
          if (error.response.status === 404 && !import.meta.env.SSR) {
            setTimeout(() => {
              router.push('/404');
            });
          }
        } catch (error) {}
        throw error;
      });
      await store.commit('global/setState', {
        postDetail: {
          ...postDetail,
          post: resp,
        },
      });
    }
  });
}
