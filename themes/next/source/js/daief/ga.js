// Google Analytics
!(function() {
  window.ga =
    window.ga ||
    function() {
      (ga.q = ga.q || []).push(arguments);
    };
  ga.l = +new Date();
  ga('create', 'UA-146082840-1', 'auto');
  ga('send', 'pageview');

  // <script async src='https://www.google-analytics.com/analytics.js'></script>
  var script = document.createElement('script');
  script.async = true;
  script.setAttribute('src', 'https://www.google-analytics.com/analytics.js');
  document.head.appendChild(script);
})();
