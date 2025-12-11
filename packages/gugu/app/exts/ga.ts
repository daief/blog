import { type Router } from 'vue-router';

declare global {
  interface Window {
    dataLayer: any[];
    gtag(..._args: any[]): void;
  }
}

if (!import.meta.env.SSR) {
  window.dataLayer = window.dataLayer || [];
  window.gtag ||= function gtag() {
    window.dataLayer.push(arguments);
  };

  window.gtag('js', new Date());
}

// https://developers.google.com/tag-platform/gtagjs/configure?hl=zh-cn
export async function registerGoogleAnalytics(router: Router) {
  const ID = __BLOG_CONFIG__.googleAnalytics?.id;
  if (import.meta.env.SSR || !ID) return;

  // <script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
  const script = document.createElement('script');
  script.async = true;
  script.setAttribute(
    'src',
    `https://www.googletagmanager.com/gtag/js?id=${ID}`,
  );
  document.head.appendChild(script);
  window.gtag('config', ID, {});
}
