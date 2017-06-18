var citySchool = "";
var city = "";
//用一个全局变量存储用户信息，因为js是异步的语言，所以需要存下来
var societyUserInfo = [];
var societyRelativeInfo = [];
var society_id = "";
var joinClikFlag = 1;
var societyName = "";

function openClubActivity() {
	api.openWin({
		name: 'activity_list',
		url: '../html/win_club_activityList.html',
		pageParam: {
			society_id: society_id,
			pageFlag: 'true',
		},
	})
}

function openClubMember() {
	api.openWin({
		name: 'club_member',
		url: '../html/win_club_member_list.html',
		pageParam: {
			society_id: society_id,
			pageFlag: 'true',
		},
	})
}

/**
 * 函数名:isJoinClubAlready
 * 函数功能：判断用户是否已经加入某社团
 * 函数参数:userID--用户ID;societyID:社团ID;obj:触发查询的对象，相当于回调功能;
 * where:来自哪里
 * */
function isJoinClubAlready(userID, societyID, obj, where) {

}

//某个时间离现在的毫秒数，可以是未来的某个时间,fromDateStr:某个时间字符串,格式可以为'2015-08-15 08:00:00'等时间字符串形式
function diffMilliSecBetweenNow(fromDateStr) {
	var dateNow = new Date();
	var nowMilliSeconds = dateNow.getTime();
	//1970/01/01 到某个时间距离转换为毫秒
	var fromMilliSeconds = Date.parse(fromDateStr);

	return Math.abs((nowMilliSeconds - fromMilliSeconds));
}

//格式化Apicloud数据库返回时间
function formateACDbTime(dateStr) {
	//返回19位日期格式,形式为 '2015-08-15 10:42:00'
	var changeDateStr = dateStr.substring(0, 19);
	return dateStr.replace('T', ' ');
}

/*
 * 函数名:toastSuccessMsg
 * 函数功能:提示成功与否
 * 参数:type--提示类型
 * 		flag--提示标志
 * */
function toastSuccessMsg(type, flag) {
	//根据type类型和flag标志来提示不同的消息
	if ('true' == flag) {
		switch (type) {
			case 1:
				{}
				break;
			case 2:
				break;
			case 3:
				break;
			case 4:
				break;
			case 5:
				break;
			case 6:
				break;
			case 7:
				{
					api.toast({
						msg: '等待社长同意之后，就成为正式社员了哟~',
						duration: 2000,
						location: 'middle'
					});
				}
				break;
			case 8:
				break;
			default:
				{}
		}
	} else {
		switch (type) {
			case 1:
				{}
				break;
			case 2:
				break;
			case 3:
				break;
			case 4:
				break;
			case 5:
				break;
			case 6:
				break;
			case 7:
				{
					api.toast({
						msg: '申请发送失败,请稍后重试...',
						duration: 2000,
						location: 'middle'
					});
				}
				break;
			case 8:
				break;
			default:
				{}
		}
	}

}

/*
 * 函数名:insertJoinClubNotice
 * 函数功能:插入申请加入社团通知
 * 参数:noticeMsg--通知消息 (JSON格式:{notice_type: 7,
 *			notice_status: 0})
 * 		funcName--回调函数
 * */
function insertJoinClubNotice(noticeMsg, societyPresidentID, funcName) {
	var model = api.require('model');
	//一键真机调试时候，下边的这个config是必须的,appKey里面的K是大写，appId也必须填写,注意一下!
	model.config({
		appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8',
		appId: 'A6982914277502',
		host: 'https://d.apicloud.com'
	});

	//在社团通知表里面也插入一条记录
	model.insert({
		class: 't_society_notice',
		value: noticeMsg
	}, function(ret, err) {
		if (ret) {
			//提示
			toastSuccessMsg(7, 'true');

			//给社团负责人发送提干通知推送
			var message = {
				type: 7,
				content: '社长大大,我很喜欢你们社团[' + societyName + ']，想加入你们,快同意我吧:',
				title: $api.getStorage('user_real_name'),
				receiver_id: societyPresidentID,
			};
			sendMessage(message);
		} else {
			toastSuccessMsg(7, 'false');
		}
	});
}

//申请加入社团
function joinClub() {
	api.confirm({
		title: '加入社团',
		msg: '您确定申请加入该社团吗？',
		buttons: ['确定', '取消']
	}, function(ret, err) {
		if (ret.buttonIndex == 1) {
			if (1 != joinClikFlag) {
				api.alert({
					msg:"您最近已经发送了申请,请不要重复点击发送~"});
				return;
			} else {
				joinClikFlag = 0;
			}
			//2015-8-3,Added by lzm,添加插入申请消息逻辑
			//取要跳转的社团ID，全局存储
			var societyID = society_id;
			var userID = $api.getStorage('user_id');
			var senderID = userID;
			//获取当前日期
			var myDate = new Date();
			//			alert( "localStorage societyID:" + societyID + ",userID:" + userID );
			if ('' == societyID || '' == userID || ('undefined' == typeof(societyID)) || ('undefined' == typeof(userID))) {
				api.toast({
					msg: '获取用户ID或本社团ID错误,请重试或者重新登录~',
					duration: 2000,
					location: 'bottom'
				});
				joinClikFlag = 1;
				return;
			}

			var model = api.require('model');
			var relation = api.require('relation');
			var query = api.require('query');
			//一键真机调试时候，下边的这个config是必须的,appKey里面的K是大写，appId也必须填写,注意一下!
			model.config({
				appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8',
				appId: 'A6982914277502',
				host: 'https://d.apicloud.com'
			});

			//先查询是否已经是本社团成员，是的话就提示不要再申请了
			relation.findAll({
				class: 't_society',
				id: societyID,
				column: 't_society_member'
			}, function(ret, err) {
				if (ret && (0 != ret.length)) {
					//do something
					var i = 0;
					for (; i < ret.length; i++) {
						if (senderID == ret[i].user_id && (ret[i].is_deleted == false)) {
							api.toast({
								msg: '您已是本社团成员，请不要发起申请!',
								duration: 2000,
								location: 'middle'
							});
							joinClikFlag = 1;
							return;
						}
					}

					//如果查遍整个成员表没有用户ID记录，说明不是社团成员，就可以发起申请
					if (i == ret.length) {
						//查询社团对应的社长
						model.findById({
							class: 't_society',
							id: societyID
						}, function(ret, err) {
							if (ret) {
								var societyPresidentID = ret.society_president;
								//插入申请记录,插入前检查是否已经存在了同样的申请记录，没被处理，有的话删了后插入
								query.createQuery(function(ret, err) {
									if (ret && ret.qid) {
										var queryId = ret.qid;

										//notice_sender_id
										query.whereEqual({
											qid: queryId,
											column: 'notice_sender_id',
											value: senderID,
										});
										//notice_receiver_id
										query.whereEqual({
											qid: queryId,
											column: 'notice_receiver_id',
											value: societyPresidentID,
										});
										query.limit({
            qid:queryId,
            value:1000
        });
										//relative_society_id
										query.whereEqual({
											qid: queryId,
											column: 'relative_society_id',
											value: societyID,
										});
										query.whereEqual({
								            qid: queryId,
								            column: 'notice_status',
								            value: '0'
								        });
//										//不查已经被标记为删除的记录
//										query.whereNotEqual({
//											qid: queryId,
//											column: 'notice_status',
//											value: '2',
//										});

										model.findAll({
											class: "t_society_notice",
											qid: queryId
										}, function(ret, err) {
											if (ret && (0 != ret.length)) {
												//					            	api.alert({
												//					            		msg: "joinClub() same society notice num:" + ret.length,
												//					            	});
												var joinNoticeLen = ret.length;
												for (var i = 0; i < ret.length; i++) {
													var noticeMsg = ret[i];
													var noticeMsgID = ret[i].id;

													//查询是否在距离当前限定时间内已经发送过申请，有的话就限制不让发送申请,这里直接返回
													var applyCreatedTime = ret[i].createdAt;
													var changeApplyCreatedTime = formateACDbTime(applyCreatedTime);
													var diffMilliSec = diffMilliSecBetweenNow(changeApplyCreatedTime);
													//								                	api.alert({
													//								                		msg: "diffMilliSec:" + diffMilliSec,
													//								                	});
													//相距小于3天,不让发送,直接返回
													if ((diffMilliSec / 86400000) < 3) {
														api.alert({
															msg: "亲,您最近已发送过申请了，请耐心等待社长的处理吧!"
														});
														//								                		alert("亲,您最近已发送过申请了，请耐心等待社长的处理吧!");
														joinClikFlag = 1;
														return;
													}

													//								                	//删除查到的以前申请同一个社团记录
													//								                	model.deleteById({
													//								                		class: 't_society_notice',
													//													    id: noticeMsgID
													//								                	}, function(ret, err){
													//													    if(ret){
													//													        //do something      
													//													    }
													//													});
													//								                	model.updateById({
													//													    class: 't_society_notice',
													//													    id: noticeMsgID,
													//													    value: {
													//													        notice_status: '2'
													//													    }
													//													}, function(ret, err){
													//													    if(ret){
													//													        //do something      
													//													    }
													//													});

												}
//												api.alert({
//													msg: "societyID:" + societyID + ",promote_user_id:" + userID
//												});
//												relation.insert({
//													class: 't_society',
//													id: societyID,
//													column: 't_society_prompt',
//													value: {
//														promote_type: '社员',
//														promote_content: '社长大大,我很喜欢你们社团[]，想加入你们,快同意我吧~',
//														promote_date: '2015-09-26T03:19:03.588Z',
//														promote_section: '社员部',
//														society_id: '1123',
//														promote_user_id: '2222'
//													}
//												}, function(ret, err) {
//													api.alert({
//														msg : ret
//													});
//												});
												
												var promote_content = '社长大大,我很喜欢你们社团[' + societyName + ']，想加入你们,快同意我吧~';
												//在社团提干表里面同样插入一条提干社员部/社员记录
//												api.alert({
//													msg: "societyID:" + societyID + ",promote_user_id:" + userID + ',societyName:' + societyName + ',myDate:' + myDate + ",promote_content:" + promote_content
//												});
												
												//在社团提干表里面同样插入一条提干社员部/社员记录
												relation.insert({
													class: 't_society',
													id: societyID,
													column: 't_society_prompt',
													value: {
														promote_type: '社员',
														promote_content: promote_content,
//														promote_date: myDate,
														promote_section: '社员部',
														society_id: societyID,
														promote_user_id: userID

													}
												}, function(ret, err) {
//													api.alert({
//														msg : ret
//													});
													if (ret) {
														//在社团通知表里面也插入一条记录
														model.insert({
															class: 't_society_notice',
															value: {
																notice_type: 7,
																notice_status: 0,
																notice_content: '社长大大,我很喜欢你们社团[' + societyName + ']，想加入你们,快同意我吧~',
																relative_society_transaction_id: ret.id,
																notice_sender_id: userID,
																relative_society_id: societyID,
																notice_receiver_id: societyPresidentID
															}
														}, function(ret, err) {
															if (ret) {
																api.toast({
																	msg: '申请已成功发送,请耐心等候...',
																	duration: 2000,
																	location: 'middle'
																});
																joinClikFlag = 1;
																//在这里发送推送，没必要保证成功
																//给社团负责人发送提干通知
																var message = {
																	type: 7,
																	content: '社长大大,我很喜欢你们社团[' + societyName + ']，想加入你们,快同意我吧:',
																	title: $api.getStorage('user_real_name'),
																	receiver_id: societyPresidentID
																};
																sendMessage(message);

															} else {
																api.toast({
																	msg: '申请发送失败,请稍后重试...',
																	duration: 2000,
																	location: 'middle'
																});
																joinClikFlag = 1;
																return;
															}
														});
													} else {
														api.toast({
															msg: '申请发送失败,请稍后重试...',
															duration: 2000,
															location: 'middle'
														});
														joinClikFlag = 1;
														return;
													}

												});
											} else {
												
//												relation.insert({
//													class: 't_society',
//													id: societyID,
//													column: 't_society_prompt',
//													value: {
//														promote_type: '社员',
//														promote_content: '社长大大,我很喜欢你们社团[]，想加入你们,快同意我吧~',
//														promote_date: '2015-09-26T03:19:03.588Z',
//														promote_section: '社员部',
//														society_id: '11234',
//														promote_user_id: '3333'
//													}
//												}, function(ret, err) {
//													api.alert({
//														msg : ret
//													});
//												});
												
												var promote_content = '社长大大,我很喜欢你们社团[' + societyName + ']，想加入你们,快同意我吧~';
												//在社团提干表里面同样插入一条提干社员部/社员记录
//												api.alert({
//													msg: "societyID:" + societyID + ",promote_user_id:" + userID + ',societyName:' + societyName + ',myDate:' + myDate + ",promote_content:" + promote_content
//												});
												//在社团提干表里面同样插入一条提干社员部/社员记录
												relation.insert({
													class: 't_society',
													id: societyID,
													column: 't_society_prompt',
													value: {
														promote_type: '社员',
														promote_content: promote_content,
//														promote_date: myDate,
														promote_section: '社员部',
														society_id: societyID,
														promote_user_id: userID

													}
												}, function(ret, err) {
//													api.alert({
//														msg : ret
//													});
													if (ret) {
														//在社团通知表里面也插入一条记录
														model.insert({
															class: 't_society_notice',
															value: {
																notice_type: 7,
																notice_status: 0,
																notice_content: '社长大大,我很喜欢你们社团[' + societyName + ']，想加入你们,快同意我吧~',
																relative_society_transaction_id: ret.id,
																notice_sender_id: userID,
																relative_society_id: societyID,
																notice_receiver_id: societyPresidentID
															}
														}, function(ret, err) {
															if (ret) {
																api.toast({
																	msg: '申请已成功发送,请耐心等候...',
																	duration: 2000,
																	location: 'middle'
																});
																joinClikFlag = 1;
																//在这里发送推送，没必要保证成功
																//给社团负责人发送提干通知
																var message = {
																	type: 7,
																	content: '社长大大,我很喜欢你们社团[' + societyName + ']，想加入你们,快同意我吧:',
																	title: $api.getStorage('user_real_name'),
																	receiver_id: societyPresidentID
																};
																sendMessage(message);

															} else {
																api.toast({
																	msg: '申请发送失败,请稍后重试...',
																	duration: 2000,
																	location: 'middle'
																});
																joinClikFlag = 1;
																return;
															}
														});
													} else {
														api.toast({
															msg: '申请发送失败,请稍后重试...',
															duration: 2000,
															location: 'middle'
														});
														joinClikFlag = 1;
														return;
													}
												});
											}

										});
									}
								});

							} else {
								api.toast({
									msg: '查询对应的社团信息失败,请稍后重试...',
									duration: 2000,
									location: 'middle'
								});
								joinClikFlag = 1;
								return;
							}
						});
					}
				}
			});
		}
	});
}

//2015-7-31,Added by luozhengming,用户登录
/**
 * 用户登录
 * @param {Object} userName: 登录用户名
 * @param {Object} userPWD: 登录密码
 */
function userLogin(userName, userPWD) {
	var user = api.require('user');
	var model = api.require('model');
	//这里设置默认值的方法有待改进，待改进
	var localUserName = userName || '13308397475';
	var localUserPWD = userPWD || '123456';

	//model config
	model.config({
		appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8',
		appId: 'A6982914277502',
		host: 'https://d.apicloud.com'
	});

	//login
	user.login({
		username: localUserName,
		password: localUserPWD
	}, function(ret, err) {
		//coding...
		if (ret) {} else {
			api.toast({
				msg: '登录失败!!!',
				duration: 2000,
				location: 'middle'
			});
		}
	});
}

/**
 * 用户退出登录
 * @param {Object} NULL:无参数
 */
function userLogout() {
	var user = api.require('user');
	var model = api.require('model');

	//model config
	model.config({
		appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8',
		appId: 'A6982914277502',
		host: 'https://d.apicloud.com'
	});

	user.logout({}, function(ret, err) {
		//coding...
		if (ret) {
			api.toast({
				msg: '退出成功!!!',
				duration: 2000,
				location: 'middle'
			});
		} else {
			api.toast({
				msg: '退出失败!!!',
				duration: 2000,
				location: 'middle'
			});
		}
	});
}

/**
 * 根据社团id查询社团的的所有信息
 * @param {Object} clubId: 社团id字符串,不能为空
 */
function getClubDetailById(clubId) {
	var model = api.require('model');
	model.config({
		appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8',
	});

	api.alert({
		title: 'hello, getClubDetailById 000',
		msg: 'clubId:' + clubId,
	});
	model.findById({
		class: 't_society',
		id: clubId
	}, function(ret, err) {
		api.alert({
			title: 'ret：' + JSON.stringify(ret),
			msg: 'err:' + err,
		});
		//返回查到的社团信息，有可能为空，记得调用该函数需要判断
		return ret;
	});
}

/**
 * 根据某数据库表表名,ID查询该表的的所有信息
 * @param {Object} tableName:数据库表名字字符串,不能为空
 * @param {Object} tableId:数据库表id字符串,不能为空
 */
function getTableDetailById(tableName, tableId) {
	var model = api.require('model');
	model.config({
		appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8',
	});

	model.findById({
		class: tableName,
		id: clubId
	}, function(ret, err) {
		//返回查到的该表信息，有可能为空，记得调用该函数需要判断返回信息是否为空
		return ret;
	});
}

/**
 * 根据某数据库表表名,ID查询该表的的所有信息
 * @param {Object} userId:user表中的userId
 */
function getSocietyPresidentInfo(userId) {
	var model = api.require('model');
	model.config({
		appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8',
	});

	//查询user表
	query.createQuery(function(ret, err) {
		if (ret && ret.qid) {
			query.include({
				qid: ret.qid,
				column: 't_user_info'
			});

			var queryId = ret.qid;
			//query condition
			query.whereEqual({
				qid: queryId,
				column: 'id',
				value: leaderUserID
			});
			query.limit({
            qid:queryId,
            value:1000
        });

			//查询对应条件的用户信息
			model.findAll({
				class: 'user',
				qid: queryId
			}, function(ret, err) {
				if (ret) {
					//用户信息表字段
					societyUserInfo['t_user_info'] = ret.t_user_info;
					//继续查t_user_info信息表
					model.findById({
						class: 't_user_info',
						id: ret.t_user_info
					}, function(ret, err) {
						if (ret) {
							//负责人电话
							societyUserInfo['user_name'] = ret.user_name;
							societyUserInfo['user_city'] = ret.user_city;
							societyUserInfo['user_nickname'] = ret.user_nickname;
							societyUserInfo['user_head'] = ret.user_head;

							//返回查到的用户信息
							return societyUserInfo;
						} else {
							api.toast({
								msg: '查询用户信息表失败!!!',
								duration: 2000,
								location: 'middle'
							});
						}
					});
				} else {
					api.toast({
						msg: '查询社团负责人信息失败!!!',
						duration: 2000,
						location: 'middle'
					});
				}
			});
		}
	});

}

//展示社团风采里面的社团详情信息
function showClubRelativeMsg(clubId) {
	api.showProgress({
		style: 'default',
		animationType: 'fade',
		title: '努力加载社团资料中...',
		text: '先喝杯茶吧...',
		modal: false
	});

	//端方mcm访问数据库,并相应的填充前端页面
	var model = api.require('model');
	var user = api.require('user');
	var query = api.require('query');
	model.config({
		appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8',
		appId: 'A6982914277502',
		host: 'https://d.apicloud.com'
	});

	//find club msg
	model.findById({
		class: 't_society',
		id: clubId
	}, function(ret, err) {
		if (ret) {
			//  		alert("club info:" + JSON.stringify(ret));
			societyRelativeInfo['societyName'] = ret.society_name;
			societyBadgeURL = ret.society_badge;
			societyRelativeInfo['societyBadgeURL'] = ret.society_badge;
			societyBadgeCSS = "background-image: url(" + ret.society_badge + ");";
			societyRelativeInfo['societyBadgeCSS'] = societyBadgeCSS;
			//社团简介
			clubBrief = ret.society_info;
			societyRelativeInfo['clubBrief'] = ret.society_info;
			//社团社长ID
			leaderUserID = ret.society_president;
			societyRelativeInfo['leaderUserID'] = ret.society_president;
			t_school_ID = ret.t_school;
			societyRelativeInfo['t_school_ID'] = ret.t_school;
			t_user_info = "";
			tpl = "";

			query.createQuery(function(ret, err) {
				if (ret && ret.qid) {
					query.include({
						qid: ret.qid,
						column: 't_user_info'
					});

					var queryId = ret.qid;
					//query condition
					query.whereEqual({
						qid: queryId,
						column: 'id',
						value: leaderUserID
					});
					query.limit({
            qid:queryId,
            value:1000
        });

					//findAll
					model.findAll({
						class: 'user',
						//						id: leaderUserID
						qid: queryId
					}, function(ret, err) {
						//				    	alert("user info:" + JSON.stringify(ret));
						if (ret && (0 != ret.length)) {
							//负责人姓名
							societyRelativeInfo['user_name'] = ret[0].username;
							t_user_info = ret[0].t_user_info;
							societyRelativeInfo['t_user_info'] = ret[0].t_user_info;
							//				    		alert("ret.user_name:" + ret[0].username);
							societyRelativeInfo['t_user_info_id'] = t_user_info.id;
							societyRelativeInfo['user_city'] = t_user_info.user_city;
							societyRelativeInfo['user_nickname'] = t_user_info.user_nickname;
							societyRelativeInfo['user_real_name'] = t_user_info.user_real_name;
							societyRelativeInfo['user_header'] = t_user_info.user_header;
							societyRelativeInfo['user_school'] = t_user_info.user_school;
							societyRelativeInfo['user_department'] = t_user_info.user_department;
							//				    		citySchool = societyRelativeInfo['user_city'] + "/" + societyRelativeInfo['user_school'];
							citySchool = societyRelativeInfo['user_school'];
							societyRelativeInfo['citySchool'] = citySchool;
							//综合展示到前端
							tpl += '<div id="club_general">';
							tpl += '<img id="club_head_img" src="' + societyRelativeInfo['societyBadgeURL'] + '"/>';
							tpl += '<div id="club_other">';
							tpl += '<div id="club_other1">';
							tpl += '<p id="club_name">' + societyRelativeInfo['societyName'] + '</p>';
							tpl += '<p id="city_school">' + societyRelativeInfo['citySchool'] + '</p>'
							tpl += '</div>';
							tpl += '<div id="club_other2">';
							tpl += '<p id=\'blank\'>&nbsp;</p>';
							tpl += '</div>';
							tpl += '</div>';
							tpl += '</div>';
							if(null == societyRelativeInfo['clubBrief'] || '' == societyRelativeInfo['clubBrief']){
					    		tpl += '<div id="brief">&#8195;&#8195;社团简介:' + '无' + '</div>';
					    	}
					    	else{
					    		tpl += '<div id="brief">&#8195;&#8195;社团简介:' + societyRelativeInfo['clubBrief'] + '</div>';
					    	}
							tpl += '<div id="club_info_list">';
							tpl += '<div id="club_activity" class="info_item info_item1" tapmode="tap" onclick="openClubActivity()">社团活动</div>';
							tpl += '<div id="club_member" class="info_item" tapmode="tap" onclick="openClubMember()">社团成员</div>';
							tpl += '</div>';
							tpl += '<div id="club_leader" class="leaderInfo">';
							tpl += '<span id="club_leader_sign">负&#8194;责&#8194;人：' + '</span>';
							tpl += '<span id="club_leader_name">' + societyRelativeInfo['user_real_name'] + '</span>';
							tpl += '</div>';
							tpl += '<div id="club_contact" class="leaderInfo">';
							tpl += '<span>联系方式：</span>';
							tpl += '<span id="club_contact_tel">' + societyRelativeInfo['user_name'] + '</span>';
							tpl += '</div>';
							tpl += '<div tapmode="" class="bottom_btn" tapmode="tap" onclick="joinClub()">';
							tpl += '申请加入';
							tpl += '</div>';
							tpl += '</div> ';
							$("#main_frm").html(tpl);
							//解析动态生成的HTML的tapmode
							api.parseTapmode();
							//				    		var joinTpl = ''; 
							//				    		joinTpl += '<div tapmode="" class="bottom_btn" onclick="joinClub()">';
							//				    		joinTpl += '申请加入';
							//				    		joinTpl += '</div>';
							//				    		$('#main_frm').after(joinTpl);
							api.hideProgress();
						} else {
							api.toast({
								msg: '查询社团负责人信息失败!!!',
								duration: 2000,
								location: 'middle'
							});
							api.hideProgress();
						}
					});
				}
			});
		} else {
			api.toast({
				msg: '查询社团详情信息失败!!!',
				duration: 2000,
				location: 'middle'
			});
			api.hideProgress();
		}
	});
}

apiready = function() {
	var pageParam = api.pageParam;
	society_id = pageParam.society_id;
	if ('' == society_id) {
		api.toast({
			msg: '没有获取到对应的社团ID,请重试~',
			duration: 2000,
			location: 'middle'
		});
	}
	//获取社团名称,用于发送通知社团名称
	var model = api.require('model');
	var query = api.require('query');
	model.config({
		appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8',
		appId: 'A6982914277502',
		host: 'https://d.apicloud.com'
	});
	query.createQuery(function(ret, err) {
		if (ret && ret.qid) {
			var queryId = ret.qid;
			query.whereEqual({
				qid: queryId,
				column: 'id',
				value: society_id
			});
			query.justFields({
				qid: queryId,
				value: ["id", "society_name"]
			});
			query.limit({
            qid:queryId,
            value:1000
        });

			model.findAll({
				class: "t_society",
				qid: queryId
			}, function(ret, err) {
				if (ret && (0 != ret.length)) {
					societyName = ret[0].society_name;
					//	                alert("societyName:" + societyName);
				}

			});
		}
	});

	showClubRelativeMsg(society_id);
}

function returnParentWin() {
	api.closeWin({});
}