var appkey = '9d680881667f';
var appsecret = '48a09474a939acf3305467096831c4a6';
var countDownTime = 0;
var phone;
var userId;
var timer;
var clickable = true;

function reset_pwd() {

	var verify_num = $('.verify_num input').val();

	//验证验证码是否正确
	//	alert(verify_num);
	var sendsms = api.require('sendSms');
	var param = {
		code: verify_num
	};

	sendsms.enterCode(param, function(ret, err) {
		if (ret.result == "ok") {
			api.toast({
				msg: '短信验证成功!',
				duration: 1000,
				location: 'middle'
			});

			api.openWin({
				name: "win_club_reset_pwd",
				url: "./win_club_reset_pwd.html",
				pageParam: {
					phone: phone,
					userId: userId
				}
			});
		} else {
			api.alert({
				msg: "短信验证失败！"
			});
		}
	});
}

//获取验证码按钮,倒计时函数
function regSmsCountDown() {
	var showDownTimeStr = countDownTime + "s" + "后重试";
	$('.get_verify').text(showDownTimeStr);
	countDownTime--;
	if (countDownTime == 0 || countDownTime < 0) {
		clickable = true;
		$('.get_verify').text('获取验证码');
		$('.get_verify').css('background-color', '#4DD0C8');
		//清除定时器
		clearTimeout(timer);
	} else {
		timer = setTimeout("regSmsCountDown()", 1000);
	}
}

function get_verify_code() {

	if (!clickable)
		return;
	clickable = false;
	//	120秒内只能注册一次， 不然会失败， 注意下;
	var sendsms = api.require('sendSms');
	//	注册应用
	var param = {
		appkey: appkey,
		appsecret: appsecret
	};
	var regMsg = sendsms.regSms(param);
	//	alert("sendsms:" + sendsms + "regMsg:" + regMsg + ",appkey:" + appkey + ",appsecret:" + appsecret);

	var sendMsgParam = {
		phone: phone
	};
	//	获取验证码申请
	sendsms.sendMessage(sendMsgParam, function(ret, err) {
		if (ret.result == "ok") {
			//禁用区域
			$('.get_verify').css('background-color', 'red');
			api.toast({
				msg: '短信发送成功!',
				duration: 1500,
				location: 'top'
			});
			//alert("短信发送成功~");
			//倒计时
			countDownTime = 90;
			regSmsCountDown();
		} else {
			clickable = true;
			api.alert({
				msg: "短信发送失败,失败原因:" + ret.result
			});
		}
	});
}

apiready = function() {
	var pageParam = api.pageParam;
	phone = pageParam.phone;
	userId = pageParam.userId;
	var string_html = "<h1>" + phone + "</h1>";
	$('.null').before(string_html);
}