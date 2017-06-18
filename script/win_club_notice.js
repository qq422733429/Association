apiready = function() {
	var $header = $api.byId('part3_header');
	$api.fixIos7Bar($header);
	var header_h = $api.offset($header).h;
	api.openFrame({
		name: 'fra_club_notice',
		url: 'fra_club_notice.html',
		rect: {
			x: 0,
			y: header_h,
			w: 'auto',
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

function clearNotice() {
	api.execScript({
		name: 'win_club_notice',
		frameName: 'fra_club_notice',
		script: 'clear_notice()'
	});
}