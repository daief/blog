import { type IBusuanziData } from '@app/exts/busuanzi';
import { reactive } from 'vue';

const appState = reactive({
  showIndexSidebar: false,
  busuanzi: null as null | IBusuanziData,
});

export function useAppState() {
  const hideIndexSidebar = () => {
    appState.showIndexSidebar = false;
  };

  const setBusuanzi = (data: IBusuanziData | null) => {
    appState.busuanzi = data;
  };

  return {
    appState,
    hideIndexSidebar,
    setBusuanzi,
  };
}

export type IAppState = ReturnType<typeof useAppState>;
