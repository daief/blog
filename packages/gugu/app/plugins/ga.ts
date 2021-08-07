declare global {
  interface Window {
    dataLayer: any[];
    gtag(..._args: any[]): void;
  }
}

window.dataLayer = window.dataLayer || [];
window.gtag =
  window.gtag ||
  function gtag(..._args: any[]) {
    window.dataLayer.push(arguments);
  };

window.gtag('js', new Date());

export function loadGoogleGA(site: ISiteContext) {
  const ID = site.blogConfig.google_analytics.GA_MEASUREMENT_ID;
  if (!ID) return;

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

  site.router.afterEach((to, from) => {
    if (to.path !== from.path) {
      track(to.path);
    }
  });
}
