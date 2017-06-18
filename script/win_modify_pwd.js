function save() {
	var originPwd = $api.byId("originPwd").value;
	var modifyPwd1 = $api.byId("modifyPwd1").value;
	var modifyPwd2 = $api.byId("modifyPwd2").value;
	if (modifyPwd1.length < 6 || modifyPwd1.length > 16) {
		api.toast({
			msg : "密码长度限制6~16位,请重新输入。"
		});
		return;
	}
	if (escape(modifyPwd1).indexOf("%u") > 0) {
		api.toast({
			msg : "新密码含有中文字符。"
		});
		return;
	}
	if (modifyPwd1 !== modifyPwd2) {
		api.toast({
			msg : "两次输入的密码不同。"
		});
		return;
	}
	api.showProgress({
		style : 'default',
		animationType : 'fade',
		title : '正在验证...',
		text : '先喝杯茶吧...',
		modal : false
	});
	api.getPrefs({
		key : 'user_name'
	}, function(ret, err) {
		//coding...
		if (ret) {
			var user_name = ret.value;
			var user = api.require('user');
			user.login({
				username : user_name,
				password : originPwd
			}, function(ret, err) {
				//coding...
				if (ret) {
					var model = api.require('model');
					model.config({
						appKey : '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8',
						host : "https://d.apicloud.com"
					});
					model.updateById({
						class : 'user',
						id : $api.getStorage("user_id"),
						value : {
							password : modifyPwd1
						}
					}, function(ret, err) {
						if (ret) {
							alert("密码修改成功");
							api.closeWin({
							});
							api.hideProgress();
						}
					});
				}else{
					api.alert({msg:"验证出错，请确认原密码"});
					api.hideProgress();
				}
			});

		}
	});

}

function get_back() {
	api.closeWin({
    });
}