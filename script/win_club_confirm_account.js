apiready = function() {
	createCode();
}

var code;

function createCode() {
	code = "";
	var codeLength = 5; //验证码的长度
	var codeChars = new Array(0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
		'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
		'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'); //所有候选组成验证码的字符，当然也可以用中文的
	for (var i = 0; i < codeLength; i++) {
		var charNum = Math.floor(Math.random() * 52);
		code += codeChars[charNum];
	}
	$('.verify_image').html(code);
}

function save_verify() {
	var phone = $('.phone input').val();
	var verify_code = $('.verify_code input').val();
	if (isMobile(phone)) {
		if (verify_code.toLowerCase() == code.toLowerCase()) {
			api.showProgress({
				style: 'default',
				animationType: 'fade',
				title: '请稍等',
				text: '努力加载中...',
				modal: false
			});

			var model = api.require('model');
			var query = api.require('query');

			model.config({
				appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8'
			});

			//联网查询手机是否存在
			query.createQuery(function(ret, err) {
				if (ret && ret.qid) {
					query.whereEqual({
						qid: ret.qid,
						column: 'username',
						value: phone
					});

					query.limit({
            qid:ret.qid,
            value:1000
        });
        model.findAll({
						class: 'user',
						qid: ret.qid
					}, function(ret2, err) {
						if (ret2 && (0 != ret2.length)) {
							api.hideProgress();
							api.openWin({
								name: "win_club_safe_verify",
								url: "./win_club_safe_verify.html",
								pageParam: {
									phone: phone,
									userId: ret2[0].id
								}
							});
						} else {
							api.hideProgress();
//							api.toast({
//								msg: '加载失败，请重试',
//								duration: 1500,
//								location: 'top'
//							});
							api.alert({
								msg: '手机号码不存在,请输入已经注册的手机号!'
							});
						}
					});
				}
			});

		} else {
			api.alert({
				msg: '验证码不正确'
			});
//			alert('验证码不正确');
			createCode();
		}
	} else {
		api.alert({
			msg: '请输入合法的手机号!'
		});
//		alert("请输入合法的手机号！");
	}
}