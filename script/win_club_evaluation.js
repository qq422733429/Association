apiready = function() {
	var userPos = $api.getStorage('position');	
	var target = 'fra_club_evaluation_members';
	switch (userPos) {
		case '社长':
		case '副社长':
			target = 'fra_club_evaluation_president';
			break;
		case '部长':
			target = 'fra_club_evaluation_minister';
			break;
		case '副部长':
		case '干事':
			target = 'fra_club_evaluation_members';
			break;
		case '社员':
			target = 'fra_club_evaluation_ord_members';
			break;
		default:
			{
				target = 'fra_club_evaluation_other';
			}
	}
	
	var $header = $api.byId('part3_header');
	$api.fixIos7Bar($header);
	var header_h = $api.offset($header).h;
	api.openFrame({
		name: target,
		url: '../html/' + target + '.html',
		rect: {
			x: 0,
			y: header_h,
			w: 'auto',
			h: 'auto'
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