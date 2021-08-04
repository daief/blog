export function loadUserScripts() {
  const modules = [
    (import.meta as any).glob('../../dist/client/customRuntime/*.@(t|j)s?(x)'),
    // 样式懒加载有问题，同步引入
    (import.meta as any).globEager(
      '../../dist/client/customRuntime/*.@(le|c)ss',
    ),
  ];

  for (const md of modules) {
    for (const path in md) {
      const displayPath = path.replace('../../dist/client/customRuntime', '');
      const moduleOrLoad = md[path];
      if (typeof moduleOrLoad === 'function') {
        moduleOrLoad()
          .then(() => {
            console.log(`Load [${displayPath}] Success`);
          })
          .catch((e) => {
            console.warn(`Load [${displayPath}] Fail:`, e);
          });
      } else {
        console.log(`Load [${displayPath}] Success`);
      }
    }
  }
}
