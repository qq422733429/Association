function returnParentWin() {
	api.closeWin({
	});
}

//页面加载完毕入口函数
apiready = function() {
	var $header = $api.byId('part3_header');
	$api.fixIos7Bar($header);
	var header_h = $api.offset($header).h;
	api.openFrame({
		name: 'fra_promotion_apply',
		url: 'fra_promotion_apply.html',
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
