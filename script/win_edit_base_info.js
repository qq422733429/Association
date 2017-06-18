var appkey = '9d680881667f';
var appsecret = '48a09474a939acf3305467096831c4a6';
var countDownTime = 90;
var timer;
var clickFlag = 1;

var user_id;
var society_id;

var string_html = "";

apiready = function(){
	user_id = $api.getStorage('user_id');
	society_id = $api.getStorage('society_id');

	var model = api.require('model');
	var query = api.require('query');

	var pageParam = api.pageParam;
	var phone = pageParam.phone;

	
}

function alertModifyPhoneSuccess() {
	api.toast({
	    msg: '修改新手机号码成功!',
	    duration:2000,
	    location: 'top'
	});

	setTimeout('api.closeWin()', 2000);
}

function save(){
	var model = api.require('model');
	
	model.config({
	    appKey:'5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8'
    });

	username = $('#phone').val();
	var verify_num = $('#verify').val();
	if( username == null ){
		api.alert({
			msg: "手机号码不能为空！"
		});
//		alert( "手机号码不能为空！" );
		return;
	}
	else if( username.length != 11 ){
		api.alert({
			msg: "号码长度不符,请输入正确长度的手机号码！"
		});
//		alert( "号码长度不符,请输入正确长度的手机号码！" );
		return;
	}
	else if(!isMobile(username)){
		api.alert({
			msg: "请输入合法的手机号"
		});
//		alert("请输入合法的手机号");
		return;
	} 
	else if( verify_num == null ){
		api.alert({
			msg: "验证码不能为空！"
		});
//		alert( "验证码不能为空！" );
		return;
	}
	
    api.confirm({
    	title: '警告',
    	msg: '修改联系电话将导致登录账号改变，请确认是否继续',
    	buttons:['确定', '取消']
    },function( ret, err){
    	if( ret.buttonIndex == 1 ){
    		//2015-8-26,Added by lzm,判断输入验证码是否正确,正确的话才修改手机号
    		//验证验证码是否正确
    		var sendsms = api.require('sendSms');
    		var param={code:verify_num};
			sendsms.enterCode(param,function(ret,err){
			    if(ret.result == "ok"){
			        api.toast({
					    msg: '短信验证成功!',
					    duration:2000,
					    location: 'top'
					});
					model.updateById({
			            class: 'user',
			            id: user_id,
			            value:{
			            	username: username
			            }
		            },function(ret,err){
		            	//coding...
		            	if( ret ){
		            		alertModifyPhoneSuccess();
		            	}
		            	else{
		            		api.alert({
								msg: "修改手机号码失败,失败信息:" + err.msg
							});
//		            		alert("修改手机号码失败,失败信息:" + err.msg);
		            	}
		            });

        			
			    }else{
			    	api.alert({
						msg: "验证码验证失败，请重新输入！"
					});
//			        alert("验证码验证失败，请重新输入！");
			    }
			});
    		
    	}
    });
}

//获取验证码按钮,倒计时函数
function regSmsCountDown(){
	var showDownTimeStr = countDownTime + "s" + "后重试";
	$('#get_verify').text(showDownTimeStr);
	countDownTime--;
	if(countDownTime == 0 || countDownTime < 0){
		$('#get_verify').attr('onclick', 'get_verify()');
		$('#get_verify').text('获取验证码');
		$('#get_verify').css('background-color', '#4DD0C8');
		clickFlag = 1;
		//清除定时器
		clearTimeout(timer);
	}
	else if(countDownTime > 0){
		timer = setTimeout("regSmsCountDown()", 1000);
	}
	
}

//2015-8-24,Added by lzm
function get_verify(){
	if(1 != clickFlag){
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
	if( phone == null ){
		api.alert({
			msg: "手机号码不能为空!"
		});
//		alert("手机号码不能为空!");
		return;
	}
	else if( phone.length != 11 ){
		api.alert({
			msg: "手机号码长度不符,请输入正确长度的手机号码！"
		});
//		alert("手机号码长度不符,请输入正确长度的手机号码！");
		return;
	} else if (!isMobile(phone)) {
		api.alert({
			msg: "请输入合法的手机号！"
		});
//		alert("请输入合法的手机号！");
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
						msg: "您输入的新手机号码已经被注册过了,请换个号码试试~"
					});
//					alert("您输入的新手机号码已经被注册过了,请换个号码试试~");
					return ;
	            }
	            else{
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
					sendsms.sendMessage(sendMsgParam,function(ret,err){
					    if(ret.result == "ok"){
					    	clickFlag = 0;
							//禁用区域
							$('#get_verify').removeAttr('onclick');
							$('#get_verify').css('background-color', 'red');
//						    $('#verify').attr('placeholder', '输入验证码');
					        api.toast({
							    msg: '短信发送成功!',
							    duration:2000,
							    location: 'top'
							});
							//重发倒计时
							countDownTime = 90;
							regSmsCountDown();
					    }else{
					    	api.alert({
								msg: "短信发送失败,失败原因:" + err.msg
							});
//							alert("短信发送失败,失败原因:" + err.msg);
					    }
					});
	            }
	
	        });
	    }
	}); 

//	$('#get_verify').removeAttr('onclick');
//	$('#get_verify').css('background-color', 'red');
//  $('#verify').attr('placeholder', '输入验证码');
//	countDownTime = 60;
//	regSmsCountDown();

}

function returnBack(){
	api.closeWin();
}
