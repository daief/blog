/*
 * @Author: daief
 * @LastEditors: daief
 * @Date: 2019-11-04 23:19:24
 * @LastEditTime: 2019-11-04 23:50:48
 * @Description:
 *  next 本身支持 lazyload image，但需要写成特殊函数，故写了这个用于自动转换文章中的图片
 *  即添加 `data-original` 属性
 *  @ref: https://github.com/Troy-Yang/hexo-lazyload-image
 */

function lazyProcess(htmlContent) {
  const imgRegExp = /<img(\s*?)src="(.*?)"(.*?)>/gi;
  const loadingImage = '/images/loading.gif';

  return htmlContent.replace(imgRegExp, function(str, p1, p2) {
    // might be duplicate
    if (/data-original/gi.test(str)) {
      return str;
    }
    var image = [
      '<span itemprop="image" itemscope itemtype="http://schema.org/ImageObject">',
      str.replace(p2, loadingImage + '" data-original="' + p2),
    ];
    image.push(
      '<meta itemprop="width" content="auto"><meta itemprop="height" content="auto"></span>',
    );
    // return str.replace(p2, loadingImage + '" data-original="' + p2);
    return image.join('');
  });
}

hexo.extend.filter.register('after_post_render', function(data) {
  data.content = lazyProcess.call(this, data.content);
  return data;
});
