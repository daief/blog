/*
 * @Author: daief
 * @LastEditors  : daief
 * @Date: 2018-07-15 20:09:26
 * @LastEditTime : 2020-01-16 17:53:35
 * @Description:
 */
setTimeout(() => {
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
   * 获得一个随机的颜色
   */
  function getRandomColor() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
  }

  /**
   * ref: https://stackoverflow.com/a/13532993
   * @param {*} color
   * @param {*} percent
   */
  function shadeColor(color, percent) {
    var R = parseInt(color.substring(1, 3), 16);
    var G = parseInt(color.substring(3, 5), 16);
    var B = parseInt(color.substring(5, 7), 16);

    R = parseInt((R * (100 + percent)) / 100);
    G = parseInt((G * (100 + percent)) / 100);
    B = parseInt((B * (100 + percent)) / 100);

    R = R < 255 ? R : 255;
    G = G < 255 ? G : 255;
    B = B < 255 ? B : 255;

    var RR = R.toString(16).length == 1 ? '0' + R.toString(16) : R.toString(16);
    var GG = G.toString(16).length == 1 ? '0' + G.toString(16) : G.toString(16);
    var BB = B.toString(16).length == 1 ? '0' + B.toString(16) : B.toString(16);

    return '#' + RR + GG + BB;
  }

  /**
   * 获取每日一言
   */
  function getHitokoto() {
    if (getHitokoto.loading) {
      return;
    }
    getHitokoto.loading = true;

    /**
     * 随机出圆角
     */
    var generateBorderRadius = function() {
      var delta = Math.random() * 10 - 5;
      var long = 220 + 2 * delta + 'px';
      var short = 30 + delta + 'px';
      return Math.random() * 100 > 50 ? long + ' ' + short : short + ' ' + long;
    };

    $.get('https://v1.hitokoto.cn/?encode=json')
      .done(function(data) {
        if (data && data.hitokoto) {
          var content = data.hitokoto || '';

          $('#hitokoto')
            .addClass(`kto-br`)
            .css({
              borderTopLeftRadius: generateBorderRadius(),
              borderTopRightRadius: generateBorderRadius(),
              borderBottomRightRadius: generateBorderRadius(),
              borderBottomLeftRadius: generateBorderRadius(),
              borderColor: getRandomColor(),
            });
          $('#hitokoto .hko-content').html(
            '<strong>' +
              content.substring(0, 1) +
              '</strong>' +
              content.substring(1),
          );
          $('#hitokoto .hko-author').html(
            '<span style="font-family:cursive;">—— </span>' + data.from,
          );
        }
      })
      .fail(function() {
        // ...
      })
      .always(function() {
        // ...
        getHitokoto.loading = false;
      });
  }

  registerTitleChange();
  getHitokoto();
  $('#hitokoto').on('click', getHitokoto);
});
