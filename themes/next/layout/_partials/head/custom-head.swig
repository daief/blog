{#
Custom head.
#}

<!-- Google Analytics -->
{% if env.env !== 'development' %}
<script>
window.ga=window.ga||function(){(ga.q=ga.q||[]).push(arguments)};ga.l=+new Date;
ga('create', 'UA-146082840-1', 'auto');
ga('send', 'pageview');
</script>
<script async src='https://www.google-analytics.com/analytics.js'></script>
{% endif %}
<!-- End Google Analytics -->
