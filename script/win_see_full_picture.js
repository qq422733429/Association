apiready = function() {
	var pageParam = api.pageParam;
	var photo_url = pageParam.url;
	$('#image').attr('src', photo_url);
	api.toast({
		msg: '右滑返回',
		duration: 1500,
		location: 'top'
	});

	$('#image').swipe({
		swipeRight: function(event, distance, duration, fingerCount, fingerData) {
			closeWin();
		}
	});
}

function closeWin() {
	api.closeWin();
}