<script lang="tsx">
import { computed, defineComponent, PropType } from 'vue';
import { useRouter } from 'vue-router';
import IconVue from './Icon.vue';

export default defineComponent({
  name: 'Pagination',
  props: {
    total: Number,
    current: Number,
    linkPattern: String,
  },
  setup(props, { emit, attrs }) {
    const router = useRouter();
    const delta = 3;

    const total = computed(() => {
      const s = +props.total;
      return s || 0;
    });

    const current = computed(() => {
      const s = +props.current;
      return s || 1;
    });

    type IItem = 'pre' | 'next' | 'dot' | number;

    const config = computed(() => {
      const currentValue = current.value;
      const totalValue = total.value;

      const headDelta = currentValue;
      const tailDelta = totalValue - currentValue;

      return [
        ['pre', currentValue > 1],
        [1, currentValue !== 1],
        ['dot', headDelta > delta + 1],
        [currentValue - 2, currentValue > delta],
        [currentValue - 1, currentValue > delta - 1],
        [currentValue, true],
        [currentValue + 1, currentValue <= totalValue - delta + 1],
        [currentValue + 2, currentValue <= totalValue - delta],
        ['dot', tailDelta > delta],
        [totalValue, currentValue !== totalValue],
        ['next', currentValue !== totalValue],
      ]
        .filter(([, show]) => show)
        .map((_) => _[0]) as IItem[];
    });

    function getNewPage(item: IItem) {
      let newPage = current.value;

      if (item === 'pre') {
        newPage = current.value - 1;
      } else if (item === 'next') {
        newPage = current.value + 1;
      } else if (item === 'dot') {
        // empty
      } else {
        newPage = item;
      }
      return newPage;
    }

    function handleClickItem(item: IItem) {
      const newPage = getNewPage(item);

      if (newPage === current.value) {
        return;
      }

      if (typeof props.linkPattern === 'string') {
        const newPath = props.linkPattern.replace(/\%d/gi, newPage + '');
        router.push(newPath);
      }

      emit('onPageChange', newPage);
    }

    return () => {
      if (total.value > 1) {
        return (
          <div {...attrs}>
            <nav class="flex justify-center">
              {config.value.map((page, index) => (
                <a
                  key={index}
                  class={[
                    'inline-flex justify-center items-center mx-1 w-9 h-9 cursor-pointer bg-white shadow-sm rounded-lg',
                    page === current.value
                      ? 'text-white bg-primary hover:text-white'
                      : 'unset',
                  ]}
                  onClick={() => handleClickItem(page)}
                >
                  {(() => {
                    if (page === 'pre') {
                      return <IconVue name="arrow-double-left" class="mt-0" />;
                    }
                    if (page === 'next') {
                      return <IconVue name="arrow-double-right" class="mt-0" />;
                    }
                    if (page === 'dot') {
                      return ' ... ';
                    }
                    return page;
                  })()}
                </a>
              ))}
            </nav>
          </div>
        );
      }
      return null;
    };
  },
});
</script>

<style scoped lang="less"></style>
