var user_id;
var society_id;

var member_info;

function returnBack() {
	api.closeWin();
}

function edit_head() {
	api.openWin({
		name: 'edit_head',
		url: 'win_edit_head.html'
			//			    pageParam: {name: 'test'}
	});
}

function edit_base_info() {
	api.openWin({
		name: 'edit_base_info',
		url: 'win_edit_base_info.html',
		pageParam: {
			phone: phone
		}
	});
}

function edit_school_info() {
	api.openWin({
		name: 'edit_school_info',
		url: 'win_edit_school_info.html'
			//			    pageParam: {name: 'test'}
	});
}

function edit_interest_info() {
	api.openWin({
		name: 'edit_inetrest_info',
		url: 'win_edit_interest.html',
		pageParam: {
			interests: interests,
			birth: birth,
			love_status: love_status,
			id: id
		}
	});
}

function refresh(){
	location.reload();
}

function edit_ablum() {
	api.openWin({
		name: 'personal_album',
		url: 'win_personal_album.html'
	});
}

apiready = function() {
	user_id = $api.getStorage('user_id');
	string_html = "";
	api.showProgress({
		title: '加载中...',
		modal: false
	});
	show_personal_info(user_id, function(ret) {
		phone = ret[0].username;
		interests = ret[0].t_user_info.user_interests;
		birth = ret[0].t_user_info.user_birth;
		love_status = ret[0].t_user_info.user_love_status;
		id = ret[0].t_user_info.id;


		if (interests == null || interests.length == 0) {
			interests = "";
		}

		if (typeof(birth) == undefined || birth == null || birth.length == 0) {
			birth = "";
		}

		if (typeof(love_status) == undefined || love_status == null || love_status.length == 0) {
			love_status = "";
		}

		// var string_header = '<img src="' + ret[0].t_user_info.user_header + '"/>';
		// $('.person_head .head').append(string_header);
		// $('.person_head .person_nick').append(ret[0].t_user_info.user_nickname);
		// if (ret[0].t_user_info.user_sex == 'man') {
		// 	var string_sex = '<img class = "sex" src = "../image/icon_male.png"  />';
		// 	$('.person_head .person_nick').after(string_sex);
		// } else {
		// 	var string_sex = '<img class = "sex" src = "../image/icon_female.png"  />';
		// 	$('.person_head .person_nick').after(string_sex);
		// }
		// $('.person_signature .value').append(ret[0].t_user_info.user_signature);

		var school_date;
		if (ret[0].t_user_info.user_school_date != null && ret[0].t_user_info.user_school_date.length != 0) {
			school_date = getDateFromString(ret[0].t_user_info.user_school_date);
			school_date = school_date.getFullYear() + '-' + (school_date.getMonth() + 1) + '-' + school_date.getDate();
		}

		if (ret[0].t_user_info.user_birth != null && ret[0].t_user_info.user_birth.length != 0) {
			birth = getDateFromString(ret[0].t_user_info.user_birth);
			birth = birth.getFullYear() + '-' + (birth.getMonth() + 1) + '-' + birth.getDate();
		}

		string_html += '<div class="person_head" tapmode="tap"onclick="edit_head()">';
		string_html += '<div class="head">';
		string_html += '<img src="' + ret[0].t_user_info.user_header + '"/>';
		string_html += '</div>';
		string_html += '<div class="nick">';
		string_html += '<span class="person_nick">';
		string_html += ret[0].t_user_info.user_nickname;
		string_html += '</span>';
		if (ret[0].t_user_info.user_sex == 'man') {
			string_html += '<img class = "sex" src = "../image/icon_male.png"  />';
		} else {
			string_html += '<img class = "sex" src = "../image/icon_female.png"  />';
		}
		string_html += '</div>';
		string_html += '<div  class="right_arrow" ><img src="../image/icon_club_evaluation_right.png"/></div>';
		string_html += '</div>';
		string_html += '<div class="person_signature">';
		string_html += '<span class="key">个性签名：';
		string_html += ret[0].t_user_info.user_signature;
		string_html += '</span>';
		string_html += '</div>';
		string_html += '<div class="green_line"></div>';
		string_html += '<div class="person_info">';
		string_html += '<ul class="person_base_info ">';
		string_html += '<li>';
		string_html += '<span class="key">真实姓名：</span>';
		string_html += '<span class="value">' + ret[0].t_user_info.user_real_name + '</span>';
		string_html += '</li>';
		string_html += '<li>';
		string_html += '<span class="key">学<span class="insert_ch">学校</span>号：</span>';
		string_html += '<span class="value">' + ret[0].t_user_info.user_student_num + '</span>';
		string_html += '<div  class="right_arrow" >';
		string_html += '</div>';
		string_html += '</li>';
		string_html += '<li>';
		string_html += '<span class="key">联系电话：</span>';
		string_html += '<span class="value">' + ret[0].username + '</span>';
		string_html += '</li>';
		string_html += '</ul>';
		string_html += '<div class="green_line"></div>';
		string_html += '<ul class="person_school">';
		string_html += '<li>';
		string_html += '<span class="key">学<span class="insert_ch">学校</span>校：</span>';
		string_html += '<span class="value">' + ret[0].t_user_info.user_school + '</span>';
		string_html += '</li>';
		string_html += '<li onclick="edit_school_info();">';
		// string_html += '<span class="key">学<span class="insert_ch">学校</span>院：</span>';
		// string_html += '<span class="value">' + ret[0].t_user_info.user_department + '</span>';
		string_html += '<div  class="right_arrow">';
		// string_html += '<img src="../image/icon_club_evaluation_right.png"/>';
		string_html += '</div>';
		string_html += '</li>';
		string_html += '<li>';
		string_html += '<span class="key">入学年份：</span>';
		string_html += '<span class="value">' + school_date + '</span>';
		string_html += '</li>';
		string_html += '</ul>';
		string_html += '<div class="green_line"></div>';
		string_html += '<ul class="person_intrests">';
		string_html += '<li>';
		string_html += '<span class="key">兴趣爱好：</span>';
		string_html += '<span class="value">' + interests + '</span>';
		string_html += '</li>';
		string_html += '<li tapmode="tap" onclick="edit_interest_info()">';
		string_html += '<span class="key">出生日期：</span>';
		string_html += '<span class="value">' + birth + '</span>';
		string_html += '<div  class="right_arrow" >';
		string_html += '<img src="../image/icon_club_evaluation_right.png"/>';
		string_html += '</div>';
		string_html += '</li>';
		string_html += '<li>';
		string_html += '<span class="key">恋爱状态：</span>';
		string_html += '<span class="value">' + love_status + '</span>';
		string_html += '</li>';
		string_html += '</ul>';
		string_html += '<div class="green_line"></div>';
		string_html += '</div>';
		string_html += '</div>';
		string_html += '<div class="person_album addImage" tapmode="tap" onclick="edit_ablum()">个人相册：';
		string_html += '<ul id="images">';

		get_user_photo(ret[0].t_user_info.id, function(ret) {
			if (ret.length != 0) {
				// alert( JSON.stringify( ret ) );
				var photo_string = '';
				var num;
				if (ret.length > 3) {
					num = 3;
				} else {
					num = ret.length;
				}
				for (var i = 0; i < num; i++) {
					string_html += '<li id="add">';
					string_html += '<img src="' + ret[i].user_photo + '"/>';
					string_html += '</li>';
				}
				string_html += '<div class="float"></div>';
				string_html += '</ul>';
				string_html += '<div  class="right_arrow"><img src="../image/icon_club_evaluation_right.png"/></div>';
				string_html += '</div>';
				string_html += '<div class="green_line"></div>';

				$('#main').append(string_html);
			}
			else{
				$('#main').append(string_html);
			}
		});
		api.hideProgress();
	});
}

function show_personal_info(user_id, func_name) {
	var model = api.require('model');
	var query = api.require('query');

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
					func_name(ret);
				} else {
					alert(JSON.stringify(err));
				}
			});
		} else {
			alert("无法获取qid!");
		}
	});

}

function get_user_photo(id, func_name) {
	var model = api.require('model');
	var relation = api.require('relation');

	model.config({
		appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8'
	});

	relation.findAll({
		class: 't_user_info',
		id: id,
		column: 'user_album'
	}, function(ret, err) {
		//coding...
		if (ret) {
			func_name(ret);
		} else {
			alert(JSON.stringify(err));
		}
	});
}