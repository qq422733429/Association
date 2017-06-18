var appkey = '9d680881667f';
var appsecret = '48a09474a939acf3305467096831c4a6';
var countDownTime = 0;
var timer;
//获取验证码倒计时是否结束,1/0 -- 已结束/未结束 (已结束时候可以再次点击)
var countEndFlag = 1;
//点击标志 1/0 -- 可以点击/不能点击
var clickFlag = 1;

function get_back() {
	api.closeWin();
}

function save() {
	var phone = $('#phone').val();
	var verify_num = $('#verify').val();
	//	alert("phone:" + phone + ",isMobile(phone):" + isMobile(phone));
	if (!isMobile(phone)) {
		api.alert({
			msg: "请输入合法的手机号"
		});
		//		alert("请输入合法的手机号");
		return;
	} else if (verify_num == null) {
		api.alert({
			msg: "验证码不能为空！"
		});
		//		alert("验证码不能为空！");
		return;
	} else {
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
					column: 'username',
					value: phone
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
					if (typeof(ret[0]) != 'undefined') {
						api.alert({
							msg: "该号码已经注册，请直接登录！"
						});
						//						alert("该号码已经注册，请直接登录！");
						return;
					} else {
						//验证验证码是否正确
						var sendsms = api.require('sendSms');
						var param = {
							code: verify_num
						};
						 sendsms.enterCode(param, function(ret, err) {
						 	if (ret.result == "ok") {
						 		api.toast({
						 			msg: '短信验证成功!',
						 			duration: 1500,
						 			location: 'top'
						 		});
						 		api.openWin({
						 			name: 'win_club_register_2',
						 			url: './win_club_register_2.html',
						 			pageParam: {
						 				user_name: phone
						 			}
						 		});
						 		return;
						 	}

						 	api.alert({
						 		msg:"验证码错误，请重新输入！"
						 	});
						 });

//						if (verify_num == '091031') {
//							api.openWin({
//								name: 'win_club_register_2',
//								url: './win_club_register_2.html',
//								pageParam: {
//									user_name: phone
//								}
//							});
//						} else {
//							api.alert({
//								msg: "验证码不正确，请重新输入！"
//							});
//							//							alert('验证码不正确，请重新输入！');
//						}

					}
				});
			} else {
				api.alert({
					msg: "无法获取qid!"
				});
				//				alert('无法获取qid!');
			}
		});
	}
}

//获取验证码按钮,倒计时函数
function regSmsCountDown() {
	//2015-9-25,Added by lzm
	if(clickFlag == 1)
	{
		clearTimeout(timer);
		$('.get_verify').attr('onclick', 'get_verify()');
		$('.get_verify').text('获取验证码');
		$('.get_verify').css('background-color', '#4DD0C8');
		
		return;
	}
	
	var showDownTimeStr = countDownTime + "s" + "后重试";
	$('.get_verify').text(showDownTimeStr);
	countDownTime--;
		
	if (countDownTime == 0) {
		countEndFlag = 1;
		clickFlag = 1;
		$('.get_verify').attr('onclick', 'get_verify()');
		$('.get_verify').text('获取验证码');
		$('.get_verify').css('background-color', '#4DD0C8');
		//		alert("000 countDownTime:" + countDownTime);
	} else if (countDownTime > 0) {
		timer = setTimeout("regSmsCountDown()", 1000);
	} else {
		//清除定时器
		countEndFlag = 1;
		clickFlag = 1;
		$('.get_verify').text('获取验证码');
		clearTimeout(timer);
		//		alert("--- countDownTime:" + countDownTime);
	}

}

//2015-8-24,Added by lzm
function get_verify() {
	if (1 == clickFlag) {
		clickFlag = 0;
		//2015-9-25,Modified by lzm
		//禁用区域
		$('.get_verify').removeAttr('onclick');
		$('.get_verify').css('background-color', 'red');
		$('#verify').attr('placeholder', '输入验证码');
		//倒计时
		countDownTime = 90;
		regSmsCountDown();
	} else {
		//		api.alert({
		//			msg: "您刚点击过发送验证码了,请不要重复点击发送~"
		//		});
		//		alert("您刚点击过发送验证码了,请不要重复点击发送~");
		return;
	}
	var query = api.require('query');
	var model = api.require('model');
	model.config({
		appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8',
		appId: 'A6982914277502',
		host: 'https://d.apicloud.com'
	});
	var phone = $('#phone').val();
	if (!isMobile(phone)) {
		api.alert({
			msg: "请输入合法的手机号！"
		});
		//		alert("请输入合法的手机号！");
		clickFlag = 1;
		return;
	} else if (countEndFlag != 1) {
		//正在倒计时不能响应点击
		return;
	}
	//查询要修改的手机号是否已存在
	query.createQuery(function(ret, err) {
		if (ret && ret.qid) {
			var queryId = ret.qid;

			query.whereEqual({
				qid: queryId,
				column: 'username',
				value: phone
			});

			query.limit({
            qid:queryId,
            value:1000
        });
        model.findAll({
				class: "user",
				qid: queryId
			}, function(ret, err) {
				if (ret && (0 != ret.length)) {
					api.alert({
						msg: "您输入的手机号码已经被注册过了,请换个号码或试着找回密码吧~"
					});
					//					alert("您输入的手机号码已经被注册过了,请换个号码或试着找回密码吧~");
					clickFlag = 1;
					return;
				} else {
					//发送短信验证码
					//120秒内只能注册一次，不然会失败，注意下;
					var sendsms = api.require('sendSms');
					//注册应用
					var param = {
						appkey: appkey,
						appsecret: appsecret
					};
					var regMsg = sendsms.regSms(param);
					//	alert("sendsms:" + sendsms + "regMsg:" + regMsg + ",appkey:" + appkey + ",appsecret:" + appsecret);

					var sendMsgParam = {
						phone: phone
					};
					//获取验证码申请
					sendsms.sendMessage(sendMsgParam, function(ret, err) {
						if (ret.result == "ok") {
							countEndFlag = 0;

//							//禁用区域
//							$('.get_verify').removeAttr('onclick');
//							$('.get_verify').css('background-color', 'red');
//							$('#verify').attr('placeholder', '输入验证码');
							api.toast({
								msg: '短信发送成功!',
								duration: 1500,
								location: 'top'
							});
							//			alert("短信发送成功~");
//							//倒计时
//							countDownTime = 90;
//							regSmsCountDown();
//							clickFlag = 1;
						} else {
							api.alert({
								msg: "短信发送失败,失败原因:" + ret.result
							});
							//							alert("短信发送失败,失败原因:" + ret.result);
							clickFlag = 1;
						}
					});
				}

			});
		}
	});
	//	$('.get_verify').removeAttr('onclick');
	//	$('.get_verify').css('background-color', 'red');
	//  $('#verify').attr('placeholder', '输入验证码');
	//	countDownTime = 60;
	//	regSmsCountDown();
}

apiready = function() {
	api.parseTapmode();
	var $header = $api.byId('header1');
	$api.fixIos7Bar($header);
}