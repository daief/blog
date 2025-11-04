import { type Router } from 'vue-router';

declare global {
  interface Window {
    dataLayer: any[];
    gtag(..._args: any[]): void;
  }
}

if (!import.meta.env.SSR) {
  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtag() {
      window.dataLayer.push(arguments);
    };

  window.gtag('js', new Date());
}

export async function registerGoogleAnalytics(router: Router) {
  const ID = __BLOG_CONFIG__.googleAnalytics?.GA_MEASUREMENT_ID;
  if (import.meta.env.SSR || !ID) return;

  window.gtag('config', ID);
  // <script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
  const script = document.createElement('script');
  script.async = true;
  script.setAttribute(
    'src',
    `https://www.googletagmanager.com/gtag/js?id=${ID}`,
  );
  document.head.appendChild(script);

  const track = (path: string) => {
    window.gtag('config', ID, {
      page_path: path,
    });
  };

  router.afterEach((to, from) => {
    if (to.path !== from.path) {
      track(to.path);
    }
  });
}
