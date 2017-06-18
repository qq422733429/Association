function get_back() {
	api.closeWin();
}

function save() {
	var model = api.require('model');
	var user = api.require('user');

	model.config({
		appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8'
	});

	var pageParam = api.pageParam;
	var user_name = pageParam.user_name;

	var password_1 = $(".password1 input").val();
	var password_2 = $(".password2 input").val();

	if (password_1.length < 6) {
		api.alert({
			msg: "密码长度不能低于6位！"
		});
		return;
	} else if (password_1.length > 16) {
		api.alert({
			msg: "密码长度不能多于16位！"
		});
		//		alert( "密码长度不能多于16位！" );
		return;
	} else if (password_1 != password_2) {
		api.alert({
			msg: "两次输入的密码不一致！"
		});
		//		alert( "两次输入的密码不一致！" );
		return;
	} else {
		api.showProgress({
			title: '加载中...',
			msg: '注册中，请稍后...',
			modal: false
		});
		user.register({
			username: user_name,
			password: password_1,
			email: ''
		}, function(ret, err) {
			//coding...
			// alert( ret.id );
			model.updateById({
				class: 'user',
				id: ret.id,
				value: {
					info_status: false,
					emailVerified: true
				}
			}, function(ret, err) {
				//coding...
				if (ret) {
					api.alert({
						msg: "注册成功，请完善必要的个人信息"
					});
					api.hideProgress();
					api.openWin({
						name: 'win_club_school_select',
						url: './win_club_school_select.html',
						pageParam: {
							user_id: ret.id,
						}
					});
				}
				else{
					api.alert({
						msg: "网络超时，请重试"
					})
				}
			});

		});
	}
}

apiready = function() {
	api.parseTapmode();
	var $header = $api.byId('header1');
	$api.fixIos7Bar($header);
}