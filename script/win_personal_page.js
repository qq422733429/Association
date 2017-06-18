apiready = function() {
	user_id = api.pageParam.user_id;

	show_personal_info(user_id, function(user_info, user_album) {
		var interests = user_info[0].t_user_info.user_interests;
		var birth = user_info[0].t_user_info.user_birth;
		var signature = user_info[0].t_user_info.user_signature;
		var love_status = user_info[0].t_user_info.user_love_status;
		var school_date = user_info[0].t_user_info.user_school_date;

		if (interests == null || interests.length == 0) {
			interests = "";
		}
		if (signature == null || signature.length == 0) {
			signature = "";
		}
		if (love_status == null || love_status.length == 0) {
			love_status == "";
		}
		if (birth == null || birth.length == 0) {
			birth = "";
		} else {
			birth = getDateFromString(birth);
			birth = birth.getFullYear() + '-' + birth.getMonth() + birth.getDate();
		}
		school_date = getDateFromString(school_date);
		school_date = school_date.getFullYear();
		var string_header = '<img src="' + user_info[0].t_user_info.user_header + '"/>';
		$('.person_head .head').append(string_header);
		$('.person_head .person_nick').append(user_info[0].t_user_info.user_nickname);
		if (user_info[0].t_user_info.user_sex == 'man') {
			var string_sex = '<img class = "sex" src = "../image/icon_male.png"  />';
			$('.person_head .person_nick').after(string_sex);
		} else {
			var string_sex = '<img class = "sex" src = "../image/icon_female.png"  />';
			$('.person_head .person_nick').after(string_sex);
		}
		$('.person_signature .value').append(signature);
		$('.school .value').append(user_info[0].t_user_info.user_school);
		// $('.department .value').append(user_info[0].t_user_info.user_department);
		$('.school_year .value').append(school_date);
		$('.interests .value').append(user_info[0].t_user_info.user_interests);
		$('.birth .value').append(birth);
		$('.love_status .value').append(user_info[0].t_user_info.user_love_status);
		if (typeof(user_album) != undefined && user_album != null && 　user_album.length != 0) {
			var photo_html = '';
			var num;
			if( user_album.length > 3 ){
				num = 3;
			}
			else{
				num = user_album.length;
			}
			photo_html += '<ul id="images" onclick="open_album(' + "'" + user_id + "'" + ')">';

			for (var i = 0; i < num; i++) {
				photo_html += '<li id="add"><img src="' + user_album[i].user_photo + '"></li>';
			}
			photo_html += '<div class="float"></div>';
			photo_html += '</ul>';
			$('.person_album').append(photo_html);
		}
	});

	$('.send_message').on('click', function() {
		writeMessage(user_id);
	});
}

function show_personal_info(user_id, func_name) {
	var model = api.require('model');
	var query = api.require('query');
	var relation = api.require('relation');

	model.config({
		appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8'
	});

	query.createQuery({}, function(ret, err) {
		//coding...
		if (ret && ret.qid) {
			var query_id = ret.qid;
			query.whereEqual({
				qid: query_id,
				column: 'id',
				value: user_id
			});

			query.include({
				qid: query_id,
				column: 't_user_info'
			});

			query.limit({
            qid:query_id,
            value:1000
        });
        model.findAll({
				class: 'user',
				qid: query_id
			}, function(ret, err) {
				//coding...
				if (ret) {
					var user_info = ret;
					relation.findAll({
						class: 't_user_info',
						id: user_info[0].t_user_info.id,
						column: 'user_album'
					}, function(ret_1, err) {
						//coding...
						if (ret_1.length != 0) {
							var user_album = ret_1;
							func_name(user_info, user_album);
						} else if (ret_1.length == 0) {
							func_name(user_info, null);
						} else {
							alert({
								msg: err.msg
							});
						}
					});

				} else {
					alert({
						msg: err.msg
					});
				}
			});
		} else {
			alert("无法获取qid!");
		}
	});

}

function open_album( user_id ) {
	api.openWin({
		name: 'win_personal_album_1',
		url: 'win_personal_album_1.html',
		pageParam:{
			user_id : user_id
		}
	});
}

function get_back() {
	api.closeWin();
}