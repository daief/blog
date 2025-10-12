!(function () {
  const GA_ID = 'UA-146082840-1';
  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtag() {
      window.dataLayer.push(arguments);
    };
  window.gtag('js', new Date());
  window.gtag('config', GA_ID);

  // <script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
  const script = document.createElement('script');
  script.async = true;
  script.setAttribute(
    'src',
    `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`,
  );
  document.head.appendChild(script);

  // window.gtag('config', GA_ID, {
  //   page_path: path,
  // });
  window.gtag.GA_ID = GA_ID;
  window.gtag.trackPath = function (path = '') {
    window.gtag('config', GA_ID, {
      page_path: path,
    });
  };
})();
