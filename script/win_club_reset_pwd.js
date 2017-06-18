var phone;
var user_id;

function update_password() {
	if (user_id) {
		var psd1 = $('#new_pwd').val().trim();
		var psd2 = $('#comfirm').val().trim();

		if (psd1.length < 6 || psd1.match(/[\x01-\xFF]*/) == false) {
			api.alert({
				msg: '密码长度至少六位且不能为中文'
			});
			//			alert('密码长度至少六位且不能为中文');
		} else if (psd1.length > 16) {
			api.alert({
				msg: '密码长度不能多于16位且不能为中文'
			});
			//			alert('密码长度不能多于16位且不能为中文');
		} else if (psd1 != psd2) {
			api.alert({
				msg: '两次输入的密码不一致'
			});
			//			alert('两次输入的密码不一致');
		} else {
			//联网查询

			var model = api.require('model');
			model.config({
				appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8'
			});

			api.showProgress({
				style: 'default',
				animationType: 'fade',
				title: '请稍等',
				text: '提交中...',
				modal: false
			});
			model.updateById({
				class: 'user',
				id: user_id,
				value: {
					password: psd1
				}
			}, function(ret, err) {
				if (ret) {
					api.hideProgress();
					api.toast({
						msg: '修改成功',
						duration: 1000,
						location: 'bottom'
					});
					
					api.openWin({
						name: "win_club_login",
						url: "win_club_login.html"
					});
					
					api.closeWin();
				} else {
					api.hideProgress();
					api.alert({
						msg: err.msg
					});
					//					alert(err.msg);
				}
			});
		}
	} else {
		api.alert({
			msg: '获取用户id失败'
		});
		//		alert('获取用户id失败');
	}
}

apiready = function() {
	var pageParam = api.pageParam;
	phone = pageParam.phone;
	user_id = pageParam.userId;
}