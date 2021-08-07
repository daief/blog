<script lang="tsx">
import { defineComponent, onMounted, PropType, ref, watch } from 'vue';
// import '@simonwep/pickr/dist/themes/classic.min.css'; // 'classic' theme
// import '@simonwep/pickr/dist/themes/monolith.min.css';  // 'monolith' theme
import '@simonwep/pickr/dist/themes/nano.min.css'; // 'nano' theme
import type IPicker from '@simonwep/pickr';

export default defineComponent({
  name: 'ColorPicker',
  props: {
    value: String,
    onUpdateValue: Function as PropType<
      (color: string, rgba: number[]) => void
    >,
  },
  setup(props, { attrs, emit }) {
    const el = ref<HTMLElement | null>(null);
    let picker: IPicker | null = null;

    const updateColorFromIns = () => {
      if (!picker) return;
      const rgba = picker.getColor().toRGBA();
      // emit('update:value', rgba.toString(), rgba);
      props.onUpdateValue && props.onUpdateValue(rgba.toString(), rgba);
    };

    onMounted(async () => {
      const Pickr = (await import('@simonwep/pickr')).default;
      picker = Pickr.create({
        el: el.value,
        theme: 'nano',
        swatches: [
          '#f5222d',
          '#fa541c',
          '#fa8c16',
          '#faad14',
          '#a0d911',
          '#52c41a',
          '#13c2c2',
          '#1890ff',
          '#722ed1',
          '#eb2f96',
        ],
        default: props.value || null,

        components: {
          // Main components
          preview: true,
          opacity: false,
          hue: true,

          // Input / output Options
          interaction: {
            // hex: true,
            // rgba: true,
            // hsla: true,
            // hsva: true,
            // cmyk: true,
            // input: true,
            // clear: true,
            // save: true,
          },
        },
      });

      picker
        .on('init', (instance) => {
          // console.log('Event: "init"', instance);
        })
        .on('hide', updateColorFromIns)
        .on('show', (color, instance) => {
          // console.log('Event: "show"', color, instance);
        })
        .on('save', (color, instance) => {
          // console.log('Event: "save"', color, instance);
        })
        .on('clear', (instance) => {
          // console.log('Event: "clear"', instance);
        })
        .on('change', (color, source, instance) => {
          // console.log('Event: "change"', color, source, instance);
        })
        .on('changestop', updateColorFromIns)
        .on('cancel', (instance) => {
          // console.log('Event: "cancel"', instance);
        })
        .on('swatchselect', updateColorFromIns);
    });

    watch(
      () => props.value,
      () => {
        props.value && picker && picker.setColor(props.value);
      },
    );

    return () => (
      <span {...attrs} class="picker-wrap">
        <span ref={el} />
      </span>
    );
  },
});
</script>

<style scoped lang="less">
.picker-wrap {
  @apply inline-flex;
  font-size: 8px;

  /deep/ .pcr-button {
    @apply block;
  }
}
</style>
