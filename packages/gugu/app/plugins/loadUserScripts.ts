export function loadUserScripts() {
  const modules = [
    (import.meta as any).glob('../../dist/client/customRuntime/*.js'),
    (import.meta as any).glob('../../dist/client/customRuntime/*.ts'),
    (import.meta as any).glob('../../dist/client/customRuntime/*.less'),
    (import.meta as any).glob('../../dist/client/customRuntime/*.css'),
  ];

  for (const md of modules) {
    for (const path in md) {
      const displayPath = path.replace('../../dist/client/customRuntime', '');
      md[path]()
        .then(() => {
          console.log(`Load [${displayPath}] Success`);
        })
        .catch((e) => {
          console.warn(`Load [${displayPath}] Fail:`, e);
        });
    }
  }
}
