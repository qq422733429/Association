var section_list = [];
//社团部门列表

var member_list = [];
//成员列表

var section_member_map = new Object();
var societyID = '';
var userID = '';
var deletePromptIDSet = [];
var subFlag = 1;

//展示提干区域
function show_promotion_msg(members, sections, section_member_map, obj) {
	var tpl = '';
	//根据部门不同加载不同的职位
	var i = 0;
	for (; i < sections.length; i++) {
		tpl += '<option value="' + sections[i].id + '">' + sections[i].section_name + '</option>';
	}
//	alert("depart_sel:" + tpl);
	$('#depart_sel').append(tpl);
	//收起刷新
	api.hideProgress();
}

function changePos(value, content) {
	var changeTpl = '';
	if (content == '社长部') {
		changeTpl += '<option value="president2">副社长</option>';
	} else if (content == '社员部') {
//		changeTpl += '<option value="members1">部长</option>';
//		changeTpl += '<option value="members2">副部长</option>';
		changeTpl += '<option value="members3">社员</option>';
	} else if(content == ''){
		changeTpl += '<option value="empty"></option>';
	}
	else {
		changeTpl += '<option value="dep_pos1">部长</option>';
		changeTpl += '<option value="dep_pos2">副部长</option>';
		changeTpl += '<option value="dep_pos3">干事</option>';
	}
	$('#pos_sel').html(changeTpl);
}

//提交提干申请
function sub_promotion() {
	if(1 != subFlag){
		api.alert({
			msg: "您刚点击过申请，请不要重复点击发送~"
		});
		return;
	}
	else{
		subFlag = 0;
	}
	var model = api.require('model');
	var user = api.require('user');
	var query = api.require('query');
	var relation = api.require('relation');
	model.config({
		appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8',
		appId: 'A6982914277502',
		host: 'https://d.apicloud.com'
	});

	var societyPresidentID;
	var applyReasonCont = $('#apply_reason_text').val();
	var applySectionID = document.getElementById("depart_sel");
	var applySection = applySectionID.options[applySectionID.selectedIndex].text;
	var applyTitleID = document.getElementById("pos_sel");
	var applyTitle = applyTitleID.options[applyTitleID.selectedIndex].text;
	
	if(('' == applySection) || ('' == applyTitle)){
		api.toast({
		    msg: '亲,您输入的提干信息为空,请检查~',
		    duration:2000,
		    location: 'middle'
		});
		subFlag = 1;
		return;
	}
	
	api.confirm({
		title: '提干申请',
		msg: '您确定要进行:(' + applySection + '/' + applyTitle + ')类型提干吗?',
		buttons: ['确定', '取消']
	}, function(ret, err) {
		if (ret.buttonIndex == 1) {
			//获取当前日期
			var myDate = new Date();
			//根据选择的提干部门和职位发送对应的申请
			societyID = $api.getStorage('society_id');
			userID = $api.getStorage('user_id');
			//	alert( "localStorage societyID:" + societyID + ",userID:" + userID );
			//下边这句只是为了测试,正式版去掉
			if (!societyID || !userID ) {
				api.toast({
					msg: '您未登陆或者所在社团没有找到，请检查!!!',
					duration: 2000,
					location: 'middle'
				});
				subFlag = 1;
				return;
			}

			//查询本社团社长ID
			model.findById({
				class: 't_society',
				id: societyID
			}, function(ret, err) {
				if (ret) {
					societyPresidentID = ret.society_president;
					//先查是否有未处理的提干申请通知，有的话全部逻辑删除
					query.createQuery(function(ret, err) {
						if (ret && ret.qid) {
							var queryId = ret.qid;

							//notice_status!=2
							query.whereNotEqual({
								qid: queryId,
								column: 'notice_status',
								value: '2'
							});
							//nitice_type:4,提干申请
							query.whereEqual({
								qid: queryId,
								column: 'notice_type',
								value: '4'
							});
							//notice_sender_id
							query.whereEqual({
								qid: queryId,
								column: 'notice_sender_id',
								value: userID
							});
							//society_id
							query.whereEqual({
								qid: queryId,
								column: 'relative_society_id',
								value: societyID
							});
							//notice_receiver_id
							query.whereEqual({
								qid: queryId,
								column: 'notice_receiver_id',
								value: societyPresidentID
							});
							//查找所有满足条件的数据
							query.limit({
            qid:queryId,
            value:1000
        });
        model.findAll({
								class: "t_society_notice",
								qid: queryId
							}, function(ret, err) {
								if (ret && (0 != ret.length)) {
									var i = 0;
									var sum = ret.length;
//									for (; i < ret.length; i++) {
//										deletePromptIDSet.push(ret[i].relative_society_transaction_id);
//										model.deleteById({
//											class: 't_society_notice',
//											id: ret[i].id
//										}, function(ret, err) {
//											if (ret) {
////												alert("i:" + i + ",sum:" + sum);
//												if(i == (sum - 1) || i == sum){
//													for(var j = 0; j < sum; j++){
//														//把相应的社团里面对应的提干申请也删了
//														model.deleteById({
//															class: 't_society_prompt',
//															id: deletePromptIDSet[j]
//														}, function(ret, err) {
//															if (ret) {
//																
//															}
//														});
//													}
//													
//												}
//												
//											}
//										});
//										model.updateById({
//											class: 't_society_notice',
//											id: ret[i].id,
//											value: {
//												notice_status: '2'
//											}
//										}, function(ret, err) {
//											if (ret) {
//
//											}
//										});
									}
//								}
								
								if(null == applyReasonCont || "" == applyReasonCont){
									applyReasonCont = "无";
								}
//								api.alert({
//									msg: "promote_type:" + applyTitle + ",promote_content:" + applyReasonCont + ",promote_date:" + myDate + ",promote_section:" + applySection + ",society_id:" + societyID + ",promote_user_id:" + userID
//								});
								//更新完毕后在社团提干表里面插入一条提干记录
								relation.insert({
									class: 't_society',
									id: societyID,
									column: 't_society_prompt',
									value: {
										promote_type: applyTitle,
										promote_content: applyReasonCont,
//										promote_date: myDate,
										promote_section: applySection,
										society_id: societyID,
										promote_user_id: userID,

									},
								}, function(ret, err) {
									if (ret) {

										//在社团通知表里面也插入一条记录
										model.insert({
											class: 't_society_notice',
											value: {
												notice_type: 4,
												notice_status: 0,
												notice_content: applyReasonCont,
												relative_society_transaction_id: ret.id,
												notice_sender_id: userID,
												relative_society_id: societyID,
												notice_receiver_id: societyPresidentID
											}
										}, function(ret, err) {
											if (ret) {
												//在这里发送推送，没必要保证成功
												//给社团负责人发送提干通知
												var message = {
													type: 4,
													content: '申请提干:(' + applySection + '/' + applyTitle + ')',
													title: $api.getStorage('user_real_name'),
													receiver_id: societyPresidentID,
												};
												sendMessage(message);
												
												alertSuccess();
												//										api.openWin({
												//											name : 'win_personnel_center',
												//											url : 'win_personnel_center.html'
												//										});
												//												api.closeToWin({
												//												    name: 'index',
												//												    animation: {
												//												        type: 'fade',
												//												        subType: 'from_bottom',
												//												        duration: 500
												//												    }
												//												});

											}
										});
									} else {
										api.toast({
											msg: '提干发送失败,请检查下您的网络!!!',
											duration: 2000,
											location: 'middle'
										});
										subFlag = 1;
									}
								});
							});
						}
						else{
							subFlag = 1;
						}
					});
				}
				else{
					api.toast({
						msg: '未查询到本社团对应的社长信息，请稍后重试~',
						duration: 2000,
						location: 'middle'
					});
					subFlag = 1;
				}
			});

		} else {
			subFlag = 1;
			return;
		}
	});

}

function alertSuccess() {
	api.toast({
		msg: '您的提干申请已发送成功,请耐心等候!!!',
		duration: 2000,
		location: 'middle'
	});


	api.execScript({
		name: 'win_personnel_center',
		frameName: 'fra_personnel_center',
		script: 'showClubRelativeCertMsg(0, \"' + userID + '\",' + '\"' + societyID + '\")'
	});
//	api.execScript({
//		name: 'win_personnel_center',
//		frameName: 'fra_personnel_center',
//		script: 'api.closeWin()'
//	});
//	api.openWin({
//	    name: 'win_personnel_center',
//	    url: '../html/win_personnel_center.html',
////	    reload: 'true'
//	});
	subFlag = 1;
	setTimeout('api.closeWin()', 2000);
}

//页面加载完毕入口函数
apiready = function() {
	var myDate = new Date();
	var yearStr = myDate.getFullYear();
	//	var yearStr = '2015';
	//获取本地缓存里的社团ID，用户ID
	societyID = $api.getStorage('society_id');
	userID = $api.getStorage('user_id');
	//	alert( "localStorage societyID:" + societyID + ",userID:" + userID );
	if('' == societyID || '' == userID || ('undefined'== typeof(societyID)) || ('undefined'== typeof(userID))){
		api.toast({
		    msg: '您已经退出本社团，获取不到对应信息，请重新登录~',
		    duration:2000,
		    location: 'bottom'
		});
		return;
	}
	
	api.showProgress({
		style : 'default',
		animationType : 'fade',
		title : '努力加载中...',
		text : '先喝杯茶吧...',
		modal : true
	});
	//展示提干区域
	getSocietyMember(societyID, 'promotion_apply', null);

}