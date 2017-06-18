var deleteStatus = false;

var user_id;

var delete_list = [];

apiready = function() {
	var pageParam = api.pageParam;
	user_id = pageParam.user_id;
	if( user_id == null || typeof(user_id) == undefined )
		user_id = $api.getStorage('user_id');
	//	alert(user_id);
	//联网获取图片
	var model = api.require('model');
	var query = api.require('query');
	var relation = api.require('relation');
	model.config({
		appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8'
	});

	model.findById({
		class: 'user',
		id: user_id
	}, function(ret1, err1) {
		if (ret1) {
			//			alert(JSON.stringify(ret1));
			relation.findAll({
				class: 't_user_info',
				id: ret1.t_user_info,
				column: 'user_album'
			}, function(ret2, err2) {
				if (ret2) {
					//					alert(JSON.stringify(ret2));
					showPhoto(ret2);
				} else {
					alert(JSON.stringify(err2));
				}
			});

		} else {
			alert(JSON.stringify(err1));
		}
	});
}


function showPhoto(albumList) {
	var tpl = '';
	for (var i = 0; i < albumList.length; i++) {
		// alert( JSON.stringify(albumList[i]) );
		tpl += '<li>';
		tpl += '<img src="' + albumList[i].user_photo + '" onclick="openFullPicture(this)"/>';
		tpl += '<img class="seleted hidden" src="../image/icon_save.png" />';
		tpl += '</li>';
	}
	tpl += '<div class="clear"></div>';
	$('.album').html(tpl);
}

function openFullPicture(obj) {
	var url = $(obj).attr('src');
	if (url && !deleteStatus)
		seeFullPicture(url);
}


