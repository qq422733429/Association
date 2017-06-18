function newVote() {
	api.openWin({
		name : 'new_vote',
		url : 'win_new_vote.html'
	})
}

apiready = function() {

	var position = $api.getStorage('position');
	position = $.trim(position);
	//	alert("社长");
	if (position == '社长' || position == '副社长' || position == '部长') {
		$('.right').removeClass('hidden');
	}
	var $header = $api.byId('part3_header');
	$api.fixIos7Bar($header);
	var header_h = $api.offset($header).h;
	api.openFrame({
		name : 'fra_vote_list',
		url : 'fra_vote_list.html',
		rect : {
			x : 0,
			y : header_h,
			w : 'auto',
			h : 'auto'
		},
		pageParam : {
			name : 'test'
		},
		bounces : true,
		vScrollBarEnabled : true,
		hScrollBarEnabled : false
	});
}