import 'tsx';

/**
 * @type {typeof import('./src/index.mts').extendConfig}
 */
export const extendConfig = async (...args) => {
  const module = await import('./src/index.mts');
  return module.extendConfig(...args);
};
