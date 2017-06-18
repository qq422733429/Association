//修改社团
function modifyClubInfo() {

	api.openWin({
		name : 'win_club_info_save',
		url : 'win_club_info_save.html',
	});
}

function returnParentWin() {
	api.closeWin({
	});
}

apiready = function() {
	
	var $header = $api.byId('part3_header');
	$api.fixIos7Bar($header);
	var header_h = $api.offset($header).h;
	api.openFrame({
		name: 'fra_club_info_modify_ex',
		url: 'fra_club_info_modify_ex.html',
		rect: {
			x: 0,
			y: header_h,
			w: 'auto',
			h: 'auto'
		},
		pageParam: {
			name: 'test'
		},
		bounces: false,
		vScrollBarEnabled: false,
		hScrollBarEnabled: false
	});
}


