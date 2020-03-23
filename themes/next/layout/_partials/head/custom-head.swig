{#
Custom head.
#}

<!-- prismjs style -->
<link rel="stylesheet" href="{{ theme.prismjs }}/plugins/line-numbers/prism-line-numbers.css" />
<link rel="stylesheet" href="{{ theme.prismjs }}/themes/prism.css" />
<style>
.code[class*="language-"], pre[class*="language-"] {
  font-size: 13px;
  padding-top: 10px !important;
  padding-bottom: 10px !important;
}
</style>

<!-- Google Analytics -->
{% if env.env !== 'development' %}
<script async src='/js/daief/ga.js'></script>
{% endif %}
<!-- End Google Analytics -->
