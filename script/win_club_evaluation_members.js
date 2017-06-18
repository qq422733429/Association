function openOtherPerEva()
{
	var $header = $api.byId('person_general');
	$api.fixIos7Bar($header);
	var header_h = $api.offset($header).h;
	api.openFrame({
		name: 'other_per_eva',
		url: 'other_per_eva.html',
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

apiready = function() {
	//获取页面传递的参数
	var pageParam = api.pageParam;
	var pageFlag = pageParam.pageFlag;
	var userID = pageParam.user_id;
//	api.alert({
//		msg: "win_club_evaluation_members pageFlag:" + pageFlag + ",userID:" + userID + ",",
//	});
	
	var $header = $api.byId('part3_header');
	$api.fixIos7Bar($header);
	var header_h = $api.offset($header).h;
	api.openFrame({
		name: 'fra_club_evaluation_members',
		url: 'fra_club_evaluation_members.html',
		rect: {
			x: 0,
			y: header_h,
			w: 'auto',
			h: 'auto'
		},
		pageParam: {
			pageFlag: pageFlag,
			user_id: userID,
		},
		bounces: true,
		vScrollBarEnabled: true,
		hScrollBarEnabled: false
	});
}
