<script lang="tsx">
import { getCategoryList } from '@app/api';
import { usePageTitle } from '@app/utils/hooks/usePageTitle';
import { computed, defineComponent } from 'vue';
import { useStore } from 'vuex';
import ALink from '@app/components/ALink.vue';

export default defineComponent({
  name: 'CategoriesPage',
  asyncData({ store, site }) {
    return getCategoryList(site.axios).then((resp) =>
      store.commit('labels/setState', { labels: resp }),
    );
  },
  setup: () => {
    type ITree = ggDB.ICategory & {
      children?: ITree[];
    };

    const store = useStore();
    const data = computed(() => {
      const ls: ggDB.ICategory[] = [...store.state.labels.labels];

      const tree: ITree[] = [];

      function appendToTree(it: ITree, treeLs: ITree[]) {
        for (let index = 0; index < treeLs.length; index++) {
          const element = treeLs[index];
          element.children = element.children || [];
          if (element.id === it.parentId) {
            element.children.push({ ...it });
            return true;
          }

          if (appendToTree(it, element.children)) {
            return true;
          }
        }
        return false;
      }

      ls.forEach((it) => {
        if (!it.parentId) {
          return tree.push({ ...it, children: [] });
        }
        appendToTree(it, tree);
      });

      return {
        total: ls.length,
        tree: tree.sort((a, b) => b.postCount - a.postCount),
      };
    });

    function renderLevel(ls: ITree[], level = 0) {
      return (
        <>
          {ls.length ? (
            <ul class={`cat-list`}>
              {ls.map((it) => (
                <li class={`category-item-${level}`}>
                  <ALink class="unset" to={it.path}>
                    {it.name}
                    <small class="text-c-secondary">({it.postCount})</small>
                  </ALink>
                  {renderLevel(it.children || [], level + 1)}
                </li>
              ))}
            </ul>
          ) : null}
        </>
      );
    }

    usePageTitle(computed(() => `分类（${data.value.total}）`));

    return () => (
      <div class="blog-base-area-box p-8">
        <h1 class="text-2xl font-normal break-words mb-5">分类</h1>

        <div class="text-sm my-8 text-center">
          目前共计 {data.value.total} 个分类
        </div>

        {data.value.tree.length ? (
          <nav class="">{renderLevel(data.value.tree)}</nav>
        ) : null}
      </div>
    );
  },
});
</script>

<style scoped lang="less">
.cat-list {
  .cat-list {
    @apply ml-6;
  }
  li {
    list-style-position: inside;
    list-style: circle;
    @apply my-1;

    &.category-item-0 {
      list-style: none;
    }
  }
}
</style>
