/*
 * 2015-8-25,Added by lzm
 * 本部分主要编写一些用于获取验证码相关的函数,注意要引入jqury包才可以正常使用
 * */
//下边是Android用到的短信注册使用的appkey和appsecret
var appkey = '9d680881667f';
var appsecret = '48a09474a939acf3305467096831c4a6';
//倒计时时间
var countDownTime = 90;
//定时器
var timer;

/**
 * @func:获取验证码按钮,倒计时函数
 * @funcname:regSmsCountDown
 * @param {Object} selector:选择器
 */
function regSmsCountDown(selector){
	var showDownTimeStr = countDownTime + "s" + "后重试";
	$(selector).text(showDownTimeStr);
	countDownTime--;
	if(countDownTime == 0){
		$(selector).attr('onclick', 'get_verify()');
		$(selector).text('获取验证码');
		$(selector).css('background-color', '#4DD0C8');
		
	}
	else if(countDownTime > 0){
		timer = setTimeout("regSmsCountDown()", 1000);
	}
	else{
		//清除定时器
		clearTimeout(timer);
	}
	
}

/*
 * 函数名:judgeInputPhone
 * 函数功能:判断选择器里面的输入手机号是否正确
 * 返回值:true--手机号格式正确,false--手机号错误
 * */
function judgeInputPhone(selector){
	var query = api.require('query');
	var model = api.require('model');
	model.config({
		appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8',
		appId: 'A6982914277502',
		host: 'https://d.apicloud.com'
	});
	
	var phone = $(selector).val();
	
	if( phone == null ){
		api.toast({
			msg: '手机号码不能为空~',
			duration: 2000,
			location: 'top'
		});
		return false;
	}
	else if( phone.length != 11 ){
		api.toast({
			msg: '请输入正确的手机号码格式~',
			duration: 2000,
			location: 'top'
		});
		return false;
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
	                api.toast({
					    msg: '您输入的新手机号码已经被注册过了,请换个号码或试着找回密码吧~',
					    duration:1500,
					    location: 'top'
					});
					
					return false;
	            }
	
	        });
	    }
	}); 
	
	return true;
}

/*
 * 函数名:disableGetVerySelect
 * 函数功能:禁用获取短信验证码的操作区域
 * 函数参数:selector--选择器
 * */
function disableGetVerySelect(selector){
	//禁用区域
	$(selector).removeAttr('onclick');
	$(selector).css('background-color', 'red');
}

function alertSuccessMsg(){
	api.toast({
	    msg: '短信发送成功!',
	    duration:1500,
	    location: 'top'
	});
	
	//倒计时
	countDownTime = 90;
	regSmsCountDown();
}

/*
 * 函数名:registerAndSendSms
 * 函数功能:注册短信验证功能并发送验证短信
 * 函数参数:phone--输入的手机号
 * 			funcName--回调函数(用于输入成功时候调用的函数)
 * 返回值:true--发送验证短信成功,false--发送验证短信失败
 * */
function registerAndSendSms(phone, funcName){
	//120秒内只能注册一次，不然会失败，注意下;
	var sendsms = api.require('sendSms');
	var param = {
	    appkey: appkey,
	    appsecret: appsecret
	};
	//注册应用
	var regMsg = sendsms.regSms(param);
	
	var sendMsgParam = {
		phone: phone
	};
	//获取验证码申请
	sendsms.sendMessage(sendMsgParam,function(ret,err){
	    if(ret.result == "ok"){
			//禁用区域
			disableGetVerySelect('#verify');
	        
	        //回调
			funcName();
	    }else{
	        alert("短信发送失败,失败原因:" + ret.result);
	    }
	});
	
}

/*
 * 函数名:get_verify
 * 函数功能:点击获取验证码
 * 函数参数:selector--选择器
 * 返回值:true--发送验证短信成功,false--发送验证短信失败
 * */
function get_verify(selector){
	//获取手机号
	var phone = $(selector).val();
	
	var phoneFlag = judgeInputPhone(phone);
	if('false' == phoneFlag){
		return false;
	}
	
	//注册短信验证模块并发送申请
	registerAndSendSms(phone, alertSuccessMsg);
	
}

