const defaultTheme = '255, 140, 22';

const storageThemeKey = '__gugu__theme__';

export function getThemeColorRgb() {
  if (import.meta.env.SSR) return '';
  return localStorage.getItem(storageThemeKey) || defaultTheme;
}

let styleEl: HTMLStyleElement | null = null;

export function setTheme(rgbString: string) {
  if (import.meta.env.SSR) return;
  localStorage.setItem(storageThemeKey, rgbString);

  if (!styleEl) {
    styleEl = document.createElement('style');
    document.head.append(styleEl);
  }

  styleEl.innerHTML = `
    :root {
      --base-primary: ${rgbString};
    }
  `;
}
