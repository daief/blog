$(document).ready(function(){
	const title = document.title;
	$(document).on('visibilitychange', function(){
		if (document.visibilityState == 'hidden') {
			document.title = '(╯‵□′)╯︵┻━┻ 程序崩溃了！';
		} else {
			document.title = 'o(*￣3￣)o 什么也没有发生';
			setTimeout(function(){
				if (document.visibilityState != 'hidden')
					document.title = title;
			}, 2000);
		}
	})
})