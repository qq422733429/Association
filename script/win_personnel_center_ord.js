function createNewPrompt(){
	api.openWin({
		name : 'win_promotion_apply',
		url : 'win_promotion_apply.html',
	});
}

//apiready里一个进行打开新的frame
apiready = function() {
	var $header = $api.byId('part3_header');
	$api.fixIos7Bar($header);
	var header_h = $api.offset($header).h;
	api.openFrame({
		name: 'fra_personnel_center',
		url: 'fra_personnel_center.html',
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

function returnParentWin() {
	api.closeWin({
	});
}


