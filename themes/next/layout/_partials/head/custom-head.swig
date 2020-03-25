{#
Custom head.
#}

<!-- prismjs style -->
<link rel="stylesheet" href="{{ theme.prismjs }}/themes/prism.css" />
<link rel="stylesheet" href="{{ theme.prismjs }}/plugins/line-numbers/prism-line-numbers.css" />
<link rel="stylesheet" href="{{ theme.prismjs }}/plugins/toolbar/prism-toolbar.css" />
<style>
.code[class*="language-"], pre[class*="language-"] {
  font-size: 13px;
  padding-top: 10px !important;
  padding-bottom: 10px !important;
}
div.code-toolbar > .toolbar .toolbar-item {
  margin-left: 5px;
}
</style>

<!-- Google Analytics -->
{% if env.env !== 'development' %}
<script async src='/js/daief/ga.js'></script>
{% endif %}
<!-- End Google Analytics -->
