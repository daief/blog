'use strict';

module.exports = function tagcloudHelper() {
  let { tags } = this.site;

  // tags = tags.random();
  tags = tags.sort('length', -1);

  const result = [];
  tags.forEach(tag => {
    result.push(
      `<a href="${this.url_for(tag.path)}">${tag.name}<small>（${
        tag.length
      }）</small></a>`,
    );
  });

  return result.join(' ');
};
