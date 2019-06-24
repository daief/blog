{% if theme.leancloud_visitors.enable %}

  {# custom analytics part create by xiamo #}
  {#
    leancloud 域名被扳：https://blog.avoscloud.com/6805/
    api 文档：https://leancloud.github.io/javascript-sdk/docs/AV.Query.html
    文档：https://avoscloud.com/docs/leanstorage_guide-js.html#hash860317
  #}
  <script src="//cdn.jsdelivr.net/npm/leancloud-storage@3.13.2/dist/av-min.js"></script>
  <script>
    AV.init({
      appId: "{{theme.leancloud_visitors.app_id}}",
      appKey: "{{theme.leancloud_visitors.app_key}}",
      serverURLs: {
        push: "{{theme.leancloud_visitors.api_url}}",
        stats: "{{theme.leancloud_visitors.api_url}}",
        engine: "{{theme.leancloud_visitors.api_url}}",
        api: "{{theme.leancloud_visitors.api_url}}",
      }
    });
    /*AV.useAVCloudUS();*/
  </script>
  <script>
    function showTime(Counter) {
      var query = new AV.Query(Counter);
      var entries = [];
      var $visitors = $(".leancloud_visitors");

      $visitors.each(function () {
        entries.push( $(this).attr("id").trim() );
      });

      query.containedIn('url', entries);
      query.find()
        .then(function (results) {
          var COUNT_CONTAINER_REF = '.leancloud-visitors-count';

          if (results.length === 0) {
            $visitors.find(COUNT_CONTAINER_REF).text(0);
            return;
          }

          for (var i = 0; i < results.length; i++) {
            var item = results[i];
            var url = item.get('url');
            var time = item.get('time');
            var element = document.getElementById(url);

            $(element).find(COUNT_CONTAINER_REF).text(time);
          }
          for(var i = 0; i < entries.length; i++) {
            var url = entries[i];
            var element = document.getElementById(url);
            var countSpan = $(element).find(COUNT_CONTAINER_REF);
            if( countSpan.text() == '') {
              countSpan.text(0);
            }
          }
        })
        .catch(function (error) {
          console.log("Find Counter Error: " + error);
        });
    }

    function addCount(Counter) {
      var $visitors = $(".leancloud_visitors");
      var url = $visitors.attr('id').trim();
      var title = $visitors.attr('data-flag-title').trim();
      var query = new AV.Query(Counter);

      query.equalTo("url", url);
      query
        .find()
        .then(function(results) {
          if (results.length > 0) {
            var counter = results[0];
            counter.fetchWhenSave(true);
            counter.increment("time");
            counter.save().then(function(counter) {
              var $element = $(document.getElementById(url));
              $element.find('.leancloud-visitors-count').text(counter.get('time'));
            }).catch(function(counter, error) {
                console.log('Failed to save Visitor num, with error message: ' + error.message);
            });
          } else {
            var newcounter = new Counter();
            /* Set ACL */
            var acl = new AV.ACL();
            acl.setPublicReadAccess(true);
            acl.setPublicWriteAccess(true);
            newcounter.setACL(acl);
            /* End Set ACL */
            newcounter.set("title", title);
            newcounter.set("url", url);
            newcounter.set("time", 1);
            newcounter.save(null, {
              success: function(newcounter) {
                var $element = $(document.getElementById(url));
                $element.find('.leancloud-visitors-count').text(newcounter.get('time'));
              },
              error: function(newcounter, error) {
                console.log('Failed to create');
              }
            });
          }
        }).catch(function(error) {
          console.log('Error:' + error.code + " " + error.message);
        });
    }

    $(function() {
      var Counter = AV.Object.extend("Counter");
      if ($('.leancloud_visitors').length === 1) {
        addCount(Counter);
      } else if ($('.post-title-link').length > 1) {
        showTime(Counter);
      }
    });
  </script>

{% endif %}
