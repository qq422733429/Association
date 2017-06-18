//2015-7-30,Added by luozhengming,模仿玩转晋城进行动态数据加载
apiready = function() {
	var pageParam = api.pageParam;
	var society_id = pageParam.society_id;
//	api.alert({
//		msg: "win_club_detail_active pageParam society_id:" + society_id,
//	});
	
	var $header = $api.byId('part3_header');
	$api.fixIos7Bar($header);
	var header_h = $api.offset($header).h;
	api.openFrame({
		name: 'fra_club_detail_active',
		url: 'fra_club_detail_active.html',
		rect: {
			x: 0,
			y: header_h,
			w: 'auto',
			h: 'auto'
		},
		pageParam: {
			society_id: society_id,
			pageFlag: 'true',
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
