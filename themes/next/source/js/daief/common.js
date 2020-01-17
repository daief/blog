/*
 * @Author: daief
 * @LastEditors  : daief
 * @Date: 2018-07-15 20:09:26
 * @LastEditTime : 2020-01-16 17:53:35
 * @Description:
 */
!(function() {
  /**
   * 页面 title 根据 tab 可见性变化而变化
   */
  function registerTitleChange() {
    const title = document.title;
    $(document).on('visibilitychange', function() {
      if (document.visibilityState == 'hidden') {
        document.title = '(╯‵□′)╯︵┻━┻ 程序崩溃了！';
      } else {
        document.title = 'o(*￣3￣)o 什么也没有发生';
        setTimeout(function() {
          if (document.visibilityState != 'hidden') document.title = title;
        }, 2000);
      }
    });
  }

  /**
   * 获取每日一言
   */
  function getHitokoto() {
    $.get('https://v1.hitokoto.cn/?encode=json')
      .done(function(data) {
        if (data && data.hitokoto) {
          var content = data.hitokoto;
          $('#hitokoto .hko-content').text(content);
          $('#hitokoto .hko-author').html(
            '<span style="font-family:cursive;">—— </span>' + data.from,
          );
        }
      })
      .fail(function() {
        // ...
      });
  }

  $(document).ready(function() {
    registerTitleChange();
    getHitokoto();
  });
})();
