apiready = function() {
	var $header = $api.byId('part3_header');
	$api.fixIos7Bar($header);
	var width = api.winWidth;
	var header_h = $api.offset($header).h;
	api.openFrame({
		name: 'fra_personal_comment',
		url: 'fra_personal_comment.html',
		rect: {
			x: 0,
			y: header_h,
			w: width,
			h: 'auto'
		},
		pageParam: {
			name: 'test'
		},
		bounces: true,
		vScrollBarEnabled: true,
		hScrollBarEnabled: false
	});
}