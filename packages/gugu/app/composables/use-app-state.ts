import { reactive } from 'vue';

export function useAppState() {
  const appState = reactive({
    showIndexSidebar: false,
  });

  const hideIndexSidebar = () => {
    appState.showIndexSidebar = false;
  };

  return {
    appState,
    hideIndexSidebar,
  };
}
