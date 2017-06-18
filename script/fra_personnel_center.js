/*
 * 2015-8-13,Added by lzm,定义本模块用到的一些全局变量，用于本地缓存，以及解决
 * APICLOUD官方model函数回调和异步执行带来的问题
 */
var societyID = '';
var userID = '';
var societyName = "";

//2015-8-26,Added by lzm,设置几个map存放对应的数据
var noticeID2NoticeMap = new Object();
var notice2PromptMap = new Object();
var prompt2UserMap = new Object();
var user2MemberMap = new Object();
var allNoticeIDSet = [];
var allNotice = [];
var allShowNotice = [];
//用于标示notice对应的信息是否展示
var allNoticeShowFlagObj = new Object();
var allPrompt = [];
var allUser = [];
var allMember = [];
var allNoticeNum = 0;
var CountNoticeNum = 0;
//标记是否为社长/副社长从而进行相关的不同显示
var isPresidentFlag = 'true';
//记录上次最早加载到的人员认证时间以及最新刷新记录的人员认证时间
var oldestTime = "";
var newestTime = "";
//一次加载的基准次数
var baseIndex = 5;

//2015-8-28,Added by lzm,删除人员认证通知和对应提干
function deleteCert(obj){
	var notice_id = $(obj).attr('id');
	var relative_prompt_id = noticeID2NoticeMap[notice_id].relative_society_transaction_id;
//	alert("deleteCert notice_id:" + notice_id + ",relative_prompt_id:" + relative_prompt_id);
	var model = api.require('model');
	model.config({
		appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8'
	});
	
	api.confirm({
		title: '删除人员认证提示',
		msg: '确定删除该条信息吗?',
		buttons: ['确定', '取消']
	}, function(ret, err) {
		if (ret.buttonIndex == 1) {
			//删除对应的通知信息
			model.deleteById({
				class: 't_society_notice',
				id: notice_id
			}, function(ret, err) {
				if (ret) {
					//删除对应的提干信息
					model.deleteById({
						class: 't_society_prompt',
						id: relative_prompt_id
					}, function(ret, err) {
						if (ret) {
							api.toast({
								msg: '删除信息成功~',
								duration: 1500,
								location: 'middle'
							});
							var parent = $api.closest(obj, '.section');
							$api.addCls(parent, 'hidden');
						}
					});						
				}
				else{
					api.toast({
						msg: '删除失败,请重试~',
						duration: 1500,
						location: 'middle'
					});
					return;
				}
			});
		}
	});
}

//2015-8-27,Modified by lzm,传递社团通知ID来进行取值
function certAction(type, obj, applyNoticeID, applyType) {
	var model = api.require('model');
	var user = api.require('user');
	var query = api.require('query');
	var relation = api.require('relation');
	model.config({
		appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8',
		appId: 'A6982914277502',
		host: 'https://d.apicloud.com'
	});
	//societyID这个需要存放在本地变量或者数据库里
	var societyID = $api.getStorage('society_id');
	var promptMsg = notice2PromptMap[applyNoticeID];
	var userMsg = prompt2UserMap[promptMsg.id];
	var memberMsg = user2MemberMap[userMsg.id];
	
	if (type == '1') {
		api.confirm({
			msg: '您将要同意人员提干申请',
			buttons: ['确定', '取消']
		}, function(ret, err) {
			if (ret.buttonIndex == 1) {
				api.showProgress({
					style: 'default',
					animationType: 'fade',
					title: '努力加载人员认证信息中...',
					text: '先喝杯茶吧...',
					modal: false
				});
				
				if (4 == applyType) {
					//修改社团成员表对应的部门和职务
					//先查提干对应的部门ID
					relation.findAll({
						class: 't_society',
						id: societyID,
						column: 't_society_section'
					}, function(ret, err) {
						if (ret && (0 != ret.length)) {
							//do something
							//							alert("relation.findAll msg:" + JSON.stringify(ret));
							var sectionID = "";
							for (var i = 0; i < ret.length; i++) {
								if (ret[i].section_name == promptMsg.promote_section) {
									//给sectionID赋值
									sectionID = ret[i].id;
									break;
								}
							}
							//更新社团成员表
							model.updateById({
								class: 't_society_member',
								//社团成员ID
								id: memberMsg.id,
								value: {
									society_member_position: promptMsg.promote_type,
									section_id: sectionID,
								}
							}, function(ret, err) {
								if (ret) {
									//do something
									//继续更新社团通知表，置位
									model.updateById({
										class: 't_society_notice',
										id: applyNoticeID,
										value: {
											//置位已读
											notice_status: '1',
											//结果为已同意
											notice_result: '0',
										}
									}, function(ret, err) {
										if (ret) {
											//向申请者发送一个已经提干成功的社团通知记录,往数据库插入一条记录
											model.insert({
												class: 't_society_notice',
												value: {
													notice_type: 5,
													notice_status: 0,
													notice_content: '[' + societyName + ']已经同意您的提干:(' + promptMsg.promote_section + '/' + promptMsg.promote_type + ')申请,快去看看吧!',
													//关联提干申请记录ID
													relative_society_transaction_id: promptMsg.id,
													relative_society_id: societyID,
													notice_sender_id: noticeID2NoticeMap[applyNoticeID].notice_receiver_id,
													notice_receiver_id: noticeID2NoticeMap[applyNoticeID].notice_sender_id,
												},
											}, function(ret, err) {
												if (ret) {
													api.toast({
														msg: '成功进行社员提干!!!',
														duration: 2000,
														location: 'middle'
													});
													
													var parent = $(obj).closest('.action');
													$(parent).addClass('hidden');
													var done = $(parent).next('.processed');
													$(done).removeClass('hidden');
													$(done).html('已同意');
													
													api.hideProgress();
													//在这里发送推送，没必要保证成功
													var message = {
														type: 5,
														content: '[' + societyName + ']已同意你的提干:(' + promptMsg.promote_section + '/' + promptMsg.promote_type + ')申请',
														title: $api.getStorage('user_real_name'),
														receiver_id: noticeID2NoticeMap[applyNoticeID].notice_sender_id,
													};
													sendMessage(message);
												} else {
													api.toast({
														msg: '进行社团提干失败,失败信息:' + err.msg,
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
										msg: '进行社团提干失败,失败信息:' + err.msg,
										duration: 2000,
										location: 'middle'
									});
									api.hideProgress();
								}
							});

						} else {
							api.toast({
								msg: '进行社团提干失败,失败信息:' + err.msg,
								duration: 2000,
								location: 'middle'
							});
							api.hideProgress();
						}
					});
				} else if (7 == applyType) {
					//先查提干对应的部门ID
					relation.findAll({
						class: 't_society',
						id: societyID,
						column: 't_society_section'
					}, function(ret, err) {
						if (ret && (0 != ret.length)) {
							//do something
							//							alert("relation.findAll msg:" + JSON.stringify(ret));
							var sectionID = "";
							for (var i = 0; i < ret.length; i++) {
								if (ret[i].section_name == '社员部') {
									//给sectionID赋值
									sectionID = ret[i].id;
									break;
								}
							}
							
//							api.alert({
//								msg: "noticeID2NoticeMap[applyNoticeID].notice_sender_id:" + noticeID2NoticeMap[applyNoticeID].notice_sender_id
//							});
							//判断该用户在社团中状态
							user_member_state(noticeID2NoticeMap[applyNoticeID].notice_sender_id, societyID, function(ret) {
								if (ret == 0) {
									//在社团成员表插入对应的部门和职务
									relation.insert({
										class: 't_society',
										id: societyID,
										column: 't_society_member',
										value: {
											user_id: noticeID2NoticeMap[applyNoticeID].notice_sender_id,
											society_id: societyID,
											society_member_position: '社员',
											section_id: sectionID,
											society_member_score: 0,
											is_deleted: 'false'
										},
									}, function(ret, err) {
										if (ret) {
											//继续更新社团通知表，置位
											model.updateById({
												class: 't_society_notice',
												id: noticeID2NoticeMap[applyNoticeID].id,
												value: {
													//置位已读
													notice_status: '1',
													//结果为已同意
													notice_result: '0',
												}
											}, function(ret, err) {
												if (ret) {
													//向申请者发送一个已经提干成功的社团通知记录,往数据库插入一条记录
													model.insert({
														class: 't_society_notice',
														value: {
															notice_type: 8,
															notice_status: 0,
															notice_content: '[' + societyName + ']已经同意您加入社团,成为:' + '(' + '社员部' + '/' + '社员' + ')' + ',快去看看吧!',
															relative_society_transaction_id: promptMsg.id,
															relative_society_id: societyID,
															notice_sender_id: noticeID2NoticeMap[applyNoticeID].notice_receiver_id,
															notice_receiver_id: noticeID2NoticeMap[applyNoticeID].notice_sender_id,
														},
													}, function(ret, err) {
														if (ret) {
															api.toast({
																msg: '成功进行社员加入认证!!!',
																duration: 2000,
																location: 'middle'
															});

															var parent = $(obj).closest('.action');
															$(parent).addClass('hidden');
															var done = $(parent).next('.processed');
															$(done).removeClass('hidden');
															$(done).html('已同意');
															api.hideProgress();
															//给申请者发送加入社团成功的推送
															//在这里发送推送，没必要保证成功
															var message = {
																type: 8,
																content: '[' + societyName + ']已同意你的加入社团申请:',
																title: $api.getStorage('user_real_name'),
																receiver_id: noticeID2NoticeMap[applyNoticeID].notice_sender_id,
															};
															sendMessage(message);
														} else {
															api.toast({
																msg: '进行社员加入认证失败,失败信息:' + err.msg,
																duration: 2000,
																location: 'middle'
															});
															api.hideProgress();
														}
													});
												} else {
													api.toast({
														msg: '进行社员加入认证失败,失败信息:' + err.msg,
														duration: 2000,
														location: 'middle'
													});
													api.hideProgress();
												}
											});
										} else {
											api.toast({
												msg: '进行社员加入认证失败,失败信息:' + err.msg,
												duration: 2000,
												location: 'middle'
											});
											api.hideProgress();
										}
									});
								} else {
									if(1 == ret) {
										api.toast({
											msg: '所认证成员已是本社团成员，请不要重复添加!',
											duration: 2000,
											location: 'middle'
										});
										api.hideProgress();
									}
									else {
//										api.alert({
//											msg: "deleted join" + ",member_id:" + ret
//										});
										//原来已经是被删除的
										var member_id = ret;
										model.updateById({
										    class: 't_society_member',
										    id: member_id,
										    value: {
										        society_member_position: '社员',
										        section_id: sectionID,
										        society_member_score: 0,
												is_deleted: 'false'
										    }
										}, function(ret, err){
										    if(ret){
										        //继续更新社团通知表，置位
												model.updateById({
													class: 't_society_notice',
													id: noticeID2NoticeMap[applyNoticeID].id,
													value: {
														//置位已读
														notice_status: '1',
														//结果为已同意
														notice_result: '0',
													}
												}, function(ret, err) {
													if (ret) {
														//向申请者发送一个已经提干成功的社团通知记录,往数据库插入一条记录
														model.insert({
															class: 't_society_notice',
															value: {
																notice_type: 8,
																notice_status: 0,
																notice_content: '[' + societyName + ']已经同意您加入社团,成为:' + '(' + '社员部' + '/' + '社员' + ')' + ',快去看看吧!',
																relative_society_transaction_id: promptMsg.id,
																relative_society_id: societyID,
																notice_sender_id: noticeID2NoticeMap[applyNoticeID].notice_receiver_id,
																notice_receiver_id: noticeID2NoticeMap[applyNoticeID].notice_sender_id,
															},
														}, function(ret, err) {
															if (ret) {
																api.toast({
																	msg: '成功进行社员加入认证!!!',
																	duration: 2000,
																	location: 'middle'
																});
	
																var parent = $(obj).closest('.action');
																$(parent).addClass('hidden');
																var done = $(parent).next('.processed');
																$(done).removeClass('hidden');
																$(done).html('已同意');
																api.hideProgress();
																//给申请者发送加入社团成功的推送
																//在这里发送推送，没必要保证成功
																var message = {
																	type: 8,
																	content: '[' + societyName + ']已同意你的加入社团申请:',
																	title: $api.getStorage('user_real_name'),
																	receiver_id: noticeID2NoticeMap[applyNoticeID].notice_sender_id,
																};
																sendMessage(message);
															} else {
																api.toast({
																	msg: '进行社员加入认证失败,失败信息:' + err.msg,
																	duration: 2000,
																	location: 'middle'
																});
																api.hideProgress();
															}
														});
													} else {
														api.toast({
															msg: '进行社员加入认证失败,失败信息:' + err.msg,
															duration: 2000,
															location: 'middle'
														});
														api.hideProgress();
													}
												});    
										    }
										});
									}
								}
							});
//							//先在社团成员表里面查询是否有相应的成员，有的话就不增加了
//							relation.findAll({
//								class: 't_society',
//								id: societyID,
//								column: 't_society_member'
//							}, function(ret, err) {
//								if (ret && (0 != ret.length)) {
//									//							    	api.alert({
//									//							    		msg: "relation findAll society_member:" + ret,
//									//							    	});
//									var i = 0;
//									for (; i < ret.length; i++) {
//										if (noticeID2NoticeMap[applyNoticeID].notice_sender_id == ret[i].user_id && (ret[i].is_deleted == 'false')) {
//											break;
//										}
//									}
//
//									//查看是否与数组长度等长，是的话就说明不是本社团成员，可以插入
//									if (i == ret.length) {
//										//在社团成员表插入对应的部门和职务
//										relation.insert({
//											class: 't_society',
//											id: societyID,
//											column: 't_society_member',
//											value: {
//												user_id: noticeID2NoticeMap[applyNoticeID].notice_sender_id,
//												society_id: societyID,
//												society_member_position: '社员',
//												section_id: sectionID,
//												society_member_score: 0,
//												is_deleted: 'false'
//											},
//										}, function(ret, err) {
//											if (ret) {
//												//继续更新社团通知表，置位
//												model.updateById({
//													class: 't_society_notice',
//													id: noticeID2NoticeMap[applyNoticeID].id,
//													value: {
//														//置位已读
//														notice_status: '1',
//														//结果为已同意
//														notice_result: '0',
//													}
//												}, function(ret, err) {
//													if (ret) {
//														//向申请者发送一个已经提干成功的社团通知记录,往数据库插入一条记录
//														model.insert({
//															class: 't_society_notice',
//															value: {
//																notice_type: 8,
//																notice_status: 0,
//																notice_content: '[' + societyName + ']已经同意您加入社团,成为:' + '(' + '社员部' + '/' + '社员' + ')' + ',快去看看吧!',
//																relative_society_transaction_id: promptMsg.id,
//																relative_society_id: societyID,
//																notice_sender_id: noticeID2NoticeMap[applyNoticeID].notice_receiver_id,
//																notice_receiver_id: noticeID2NoticeMap[applyNoticeID].notice_sender_id,
//															},
//														}, function(ret, err) {
//															if (ret) {
//																api.toast({
//																	msg: '成功进行社员加入认证!!!',
//																	duration: 2000,
//																	location: 'middle'
//																});
//
//																var parent = $(obj).closest('.action');
//																$(parent).addClass('hidden');
//																var done = $(parent).next('.processed');
//																$(done).removeClass('hidden');
//																$(done).html('已同意');
//																api.hideProgress();
//																//给申请者发送加入社团成功的推送
//																//在这里发送推送，没必要保证成功
//																var message = {
//																	type: 8,
//																	content: '[' + societyName + ']已同意你的加入社团申请:',
//																	title: $api.getStorage('user_real_name'),
//																	receiver_id: noticeID2NoticeMap[applyNoticeID].notice_sender_id,
//																};
//																sendMessage(message);
//															} else {
//																api.toast({
//																	msg: '进行社员加入认证失败,失败信息:' + err.msg,
//																	duration: 2000,
//																	location: 'middle'
//																});
//																api.hideProgress();
//															}
//														});
//													} else {
//														api.toast({
//															msg: '进行社员加入认证失败,失败信息:' + err.msg,
//															duration: 2000,
//															location: 'middle'
//														});
//														api.hideProgress();
//													}
//												});
//											} else {
//												api.toast({
//													msg: '进行社员加入认证失败,失败信息:' + err.msg,
//													duration: 2000,
//													location: 'middle'
//												});
//												api.hideProgress();
//											}
//										});
//									} else {
//										api.toast({
//											msg: '所认证成员已是本社团成员，请不要重复添加!',
//											duration: 2000,
//											location: 'middle'
//										});
//										api.hideProgress();
//									}
//								}
//							});

						} else {
							api.toast({
								msg: '进行社员加入认证失败,查找不到社员部~' ,
								duration: 2000,
								location: 'middle'
							});
							api.hideProgress();
						}
					});
				} else {
					api.toast({
						msg: '操作提干类型错误，请检查!',
						duration: 2000,
						location: 'middle'
					});
					api.hideProgress();
				}
			}
		});
	} else {
		api.confirm({
			msg: '您将要拒绝人员提干申请',
			buttons: ['确定', '取消']
		}, function(ret, err) {
			if (ret.buttonIndex == 1) {
				if (7 == applyType || 4 == applyType ) {
					//更新社团通知表，置位为已拒绝
					model.updateById({
						class: 't_society_notice',
						id: noticeID2NoticeMap[applyNoticeID].id,
						value: {
							//置位已读
							notice_status: '1',
							//结果为已拒绝
							notice_result: '1',
						}
					}, function(ret, err) {
						if (ret) {
							//在社团通知里发送一条申请失败信息
							if (4 == applyType) {
								model.insert({
									class: 't_society_notice',
									value: {
										notice_type: 6,
										notice_status: 0,
										notice_content: '[' + societyName + ']残忍的拒绝了您的提干:(' + promptMsg.promote_section + '/' + promptMsg.promote_type + ')申请,试着跟社长大大去沟通沟通吧!',
										relative_society_transaction_id: promptMsg.id,
										relative_society_id: societyID,
										notice_sender_id: noticeID2NoticeMap[applyNoticeID].notice_receiver_id,
										notice_receiver_id: noticeID2NoticeMap[applyNoticeID].notice_sender_id,
									},
								}, function(ret, err) {
									if (ret) {
										//do something
										api.toast({
											msg: '您已成功拒绝社员申请提干!!!',
											duration: 2000,
											location: 'middle'
										});

										var parent = $(obj).closest('.action');
										$(parent).addClass('hidden');
										var done = $(parent).next('.processed');
										$(done).removeClass('hidden');
										$(done).html('已拒绝');
										api.hideProgress();
										//在这里发送推送，没必要保证成功
										//给申请者发送提干拒绝通知
										var message = {
											type: 6,
											content: '[' + societyName + ']已拒绝了你的提干:(' + promptMsg.promote_section + '/' + promptMsg.promote_type + ')申请',
											title: $api.getStorage('user_real_name'),
											receiver_id: noticeID2NoticeMap[applyNoticeID].notice_sender_id,
										};
										sendMessage(message);
									} else {
										api.toast({
											msg: '拒绝提干失败,失败信息:' + err.msg,
											duration: 2000,
											location: 'middle'
										});
										api.hideProgress();
									}
								});
							} else if (7 == applyType) {
								model.insert({
									class: 't_society_notice',
									value: {
										notice_type: 9,
										notice_status: 0,
										notice_content: '[' + societyName + ']残忍的拒绝了您加入社团,试着跟社长大人沟通沟通吧!',
										relative_society_id: societyID,
										notice_sender_id: noticeID2NoticeMap[applyNoticeID].notice_receiver_id,
										notice_receiver_id: noticeID2NoticeMap[applyNoticeID].notice_sender_id,
									},
								}, function(ret, err) {
									if (ret) {
										api.toast({
											msg: '您已成功拒绝社员加入社团!!!',
											duration: 2000,
											location: 'middle'
										});

										var parent = $(obj).closest('.action');
										$(parent).addClass('hidden');
										var done = $(parent).next('.processed');
										$(done).removeClass('hidden');
										$(done).html('已拒绝');
										api.hideProgress();
										//在这里发送推送，没必要保证成功
										//给申请者发送申请加入社团被拒绝通知
										var message = {
											type: 9,
											content: '[' + societyName + ']已拒绝了你的加入社团申请:',
											title: $api.getStorage('user_real_name'),
											receiver_id: noticeID2NoticeMap[applyNoticeID].notice_sender_id,
										};
										sendMessage(message);
									} else {
										api.toast({
											msg: '进行社员加入认证失败,失败信息:' + err.msg,
											duration: 2000,
											location: 'middle'
										});
										api.hideProgress();
									}
								});
							}
							else {
								api.toast({
									msg: '所操作的认证消息类型错误，请检查~',
									duration: 2000,
									location: 'middle'
								});
								api.hideProgress();
							}
						} else {
							api.toast({
								msg: '拒绝社员加入失败,失败信息:' + err.msg,
								duration: 2000,
								location: 'middle'
							});
							api.hideProgress();
						}
					});
				}
				else{
					api.toast({
						msg: '所操作的认证消息类型错误，请检查~',
						duration: 2000,
						location: 'middle'
					});
					api.hideProgress();
				}
			}
		});
	}
}

/*
 * Added by xcm
 * 2015-8-25,Modified by lzm
 * */
function changDateFormationEx(date) {

	//	alert(date);
	date = date.replace('T', ' ');
	var pos = date.lastIndexOf(':');
	var subStr = date.substring(0, pos);
	str = subStr.replace(/-/g, "/");
	var new_date = new Date(str);

	new_date.setTime(new_date.getTime() + 8 * 60 * 60 * 1000);
	//增加八个小时
	//	alert(new_date);
	var minute = new_date.getMinutes();
	if (minute < 10)
		minute = '0' + minute;

	var result = (new_date.getFullYear()) + '年' + (new_date.getMonth() + 1) + '月' + new_date.getDate() + '日 ' + new_date.getHours() + ':' + minute;
	//	alert(result);
	return result;
}

//查找一个社团所有相关的人员认证通知(未标记删除的通知,接收者为社长的通知)
/*
 * type: 0/1 -- 下拉刷新/上拉加载更多
 * */
function findAllClubReceivedCertNotice(type, societyID, funcName){
//	alert("findAllClubReceivedCertNotice");
	//端方mcm访问数据库,并相应的填充前端页面
	var model = api.require('model');
	var user = api.require('user');
	var query = api.require('query');
	model.config({
		appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8',
		appId: 'A6982914277502',
		host: 'https://d.apicloud.com'
	});
	
	model.findById({
	    class: 't_society',
	    id: societyID
	},function(ret, err){
	    if(ret){
	        var societyPresidentID = ret.society_president;
	        var certTypeArr = [];
	        certTypeArr[0] = 4;
			certTypeArr[1] = 7;
	        //查找对应的消息
	        query.createQuery(function(ret, err) {
			    if (ret && ret.qid) {
			        var queryId = ret.qid;
			        
			        query.whereContainAll({
						qid: queryId,
						column: 'notice_type',
						value: certTypeArr
					});
					//notice_status!=2
					query.whereNotEqual({
						qid: queryId,
						column: 'notice_status',
						value: 2
					});
					//本社团的认证
					query.whereEqual({
						qid: queryId,
						column: 'relative_society_id',
						value: societyID
					});
					//接收者为社长
					query.whereEqual({
						qid: queryId,
						column: 'notice_receiver_id',
						value: societyPresidentID
					});
					//限制条数
					query.limit({
						qid: queryId, 
						value: baseIndex
					});
//					alert("newestTime:" + newestTime + ", oldestTime:" + oldestTime);
					//1--下拉加载更多
					if(1 == type){
						//上次已有标定了,进行查找限制一下，比上次更早就OK
						if(oldestTime != ""){
							query.whereLessThan({
					        	qid: queryId,
					            column: 'createdAt',
					            value: oldestTime
					        });
						}
						//上拉时候刷出来按最新降序排序
						query.desc({
							qid: queryId,
							column: 'createdAt'
						});
					}
					else {
						//上次已有标定了,进行查找限制一下，比上次最新的更新就OK
						if(newestTime != ""){
							query.whereGreaterThan({
					        	qid: queryId,
					            column: 'createdAt',
					            value: newestTime
					        });
					        //下拉时候刷出来按最新升序排序
							query.asc({
								qid: queryId,
								column: 'createdAt'
							});
						}
						else{
							//初次时候下拉时候刷出来按最新降序排序
							query.desc({
								qid: queryId,
								column: 'createdAt'
							});
						}
					}
					
        model.findAll({
			            class: "t_society_notice",
			            qid: queryId
			        }, function(ret, err) {
			            if (ret && (0 != ret.length)) {
			                allNotice = ret;
			                //回调
			                funcName(allNotice, type);
//			                api.alert({
//			                	msg: "allNotice:" + JSON.stringify(ret)
//			                });
			            }
			            else{
			            	if(1 == type){
								api.toast({
									msg: '没有更多提干信息啦~',
									duration: 2000,
									location: 'bottom'
								});
							}
							else{
								api.toast({
									msg: '没有更多提干信息啦~',
									duration: 2000,
									location: 'top'
								});
							}
							api.hideProgress();
			            }
			
			        });
			    }
			});
	    }
	    else{
	    	api.toast({
			    msg: '查找对应社团提干通知失败,请稍后重试~',
			    duration:2000,
			    location: 'middle'
			});
			api.hideProgress();
	    }
	});
}

//查找一个社团中某人的所有认证通知(未标记删除的通知,申请者为本人的通知)
/*
 * type: 0/1 -- 下拉刷新/上拉加载更多
 * */
function findAllUserClubApplyCertNotice(type, societyID, userID, funcName){
//	alert("findAllUserClubApplyCertNotice");
	//端方mcm访问数据库,并相应的填充前端页面
	var model = api.require('model');
	var user = api.require('user');
	var query = api.require('query');
	model.config({
		appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8',
		appId: 'A6982914277502',
		host: 'https://d.apicloud.com'
	});
	var certTypeArr = [];
    certTypeArr[0] = 4;
	certTypeArr[1] = 7;
    //查找对应的消息
    query.createQuery(function(ret, err) {
	    if (ret && ret.qid) {
	        var queryId = ret.qid;
	        
//	        query.whereEqual({
//				qid: queryId,
//				column: 'notice_type',
//				value: 4
//			});
			query.whereContainAll({
				qid: queryId,
				column: 'notice_type',
				value: certTypeArr
			});
			//notice_status!=2(不查已经被删除的记录)
			query.whereNotEqual({
				qid: queryId,
				column: 'notice_status',
				value: 2
			});
			//所在社团
			query.whereEqual({
				qid: queryId,
				column: 'relative_society_id',
				value: societyID
			});
			//申请者为本人
			query.whereEqual({
				qid: queryId,
				column: 'notice_sender_id',
				value: userID
			});
			//限制条数
			query.limit({
				qid: queryId, 
				value: baseIndex
			});
//			alert("newestTime:" + newestTime + ", oldestTime:" + oldestTime);
			if(1 == type){
				//上次已有标定了,进行查找限制一下，比上次更早就OK
				if(oldestTime != ""){
					query.whereLessThan({
			        	qid: queryId,
			            column: 'createdAt',
			            value: oldestTime
			        });
				}
				//上拉时候刷出来按最新降序排序
				query.desc({
					qid: queryId,
					column: 'createdAt'
				});
			}
			else {
				//上次已有标定了,进行查找限制一下，比上次最新的更新就OK
				if(newestTime != ""){
					query.whereGreaterThan({
			        	qid: queryId,
			            column: 'createdAt',
			            value: newestTime
			        });
			        //下拉时候刷出来按最新升序排序
					query.asc({
						qid: queryId,
						column: 'createdAt'
					});
				}
				else{
					//初次时候下拉时候刷出来按最新降序排序
					query.desc({
						qid: queryId,
						column: 'createdAt'
					});
				}
			}
						
			model.findAll({
	            class: "t_society_notice",
	            qid: queryId
	        }, function(ret, err) {
	            if (ret && (0 != ret.length)) {
	                allNotice = ret;
	                //回调
	                funcName(allNotice, type);
	            }
	            else{
	            	if(1 == type){
						api.toast({
							msg: '没有更多提干信息啦~',
							duration: 2000,
							location: 'bottom'
						});
					}
					else{
						api.toast({
							msg: '没有更多提干信息啦~',
							duration: 2000,
							location: 'top'
						});
					}
					api.hideProgress();
	            }
	
	        });
	    }
	});
}

function helloNull(para){
	//
}

//展示收到的人员认证信息(showCertMsg)
function showCertMsg(funcName, type){
//	alert("showCertMsg");
	var str = "'";
	
	for(var i = 0; i < allShowNotice.length; i++){
		var noticeMsg = allShowNotice[i];
		var applyUserID = noticeMsg.notice_sender_id;
		var applyNoticeID = noticeMsg.id;
		var promptMsg = notice2PromptMap[noticeMsg.id];
		var userMsg = prompt2UserMap[promptMsg.id];
		var memberMsg = user2MemberMap[userMsg.id];
		
		var tpl = '';
		tpl += '<div id="section1" class="section">';
		tpl += '<div id="person_info" class="person_info" >';
		tpl += '<ul id="person_title" class="person_title">';
		tpl += '<div id="club_head">';
		tpl += '<img id = "club_head_img" src="' + userMsg.t_user_info.user_header + '"' + 'tapmode="tap" onclick=\'open_personal_info("' + userMsg.id + '")\'' + '  />';
		tpl += '</div>';
		tpl += '<div id="club_person_title_other">';
		tpl += '<span id="nickname">' + userMsg.t_user_info.user_real_name + '</span>';
		//根据类型来判断
		if(7 == noticeMsg.notice_type){
//			api.alert({
//				msg: "userMsg.id:" + userMsg.id + ",societyID:" + societyID
//			});
			if(memberMsg['is_member'] == 'false')
			{
				tpl += '<span id="title">(' + '非本社团成员' + '/' + memberMsg.society_member_position + ')</span>';
			}
			else{
				tpl += '<span id="title">(' + memberMsg.section_id.section_name + '/' + memberMsg.society_member_position + ')</span>';
			}	
		}
		else if(4 == noticeMsg.notice_type){
			tpl += '<span id="title">(' + memberMsg.section_id.section_name + '/' + memberMsg.society_member_position + ')</span>';	
		}
		tpl += '<p id="apply_time">' + changDateFormationEx(noticeMsg.createdAt) + '</p>';
		tpl += '</div>';
		tpl += '<img class = "club_delete_img" id="' + applyNoticeID + '" src="../image/remove.png" tapmode="tap" onclick=\'deleteCert(this)\' />';
		tpl += '</ul>';
		tpl += '</div>';
		tpl += '<div id="apply_position" class="apply_position">';
		tpl += '<ul class="ul1">';
		tpl += '<li class="li1">申请职位：</li>';
		tpl += '<li class="li2">' + promptMsg.promote_section + '/' + promptMsg.promote_type + '</li>';
		tpl += '</ul>';
		tpl += '</div>';
		tpl += '<div id="apply_declaration" class="apply_declaration">';
		tpl += '<ul class="ul1">';
		tpl += '<li class="li1">申请宣言：</li>';
		tpl += '<li class="li2">' + promptMsg.promote_content + '</li>';
		tpl += '</ul>';
		tpl += '</div>';
		tpl += '<div id="handle_btn"  class="handle_btn">';
//		api.alert({
//			msg: "test notice_result:" + noticeMsg.notice_result
//		});
		//根据是否(社长或副社长)来做不同显示
		if('true' != isPresidentFlag){
			if (0 == noticeMsg.notice_result) {
//				tpl += '<li class="action hidden">';
//				tpl += '<div class="agree" tapmode="tap" onclick="certAction(1, this, ' + str + applyNoticeID + str + ', 4)">同意</div>';
//				tpl += '<div class="refuse" tapmode="tap" onclick="certAction(0,this, ' + str + applyNoticeID + str + ', 4)">拒绝</div>';
//				tpl += '</li>';
				tpl += '<li class="processed">';
				tpl += '已同意';
				tpl += '</li>';
			} else if (1 == noticeMsg.notice_result) {
//				tpl += '<li class="action hidden">';
//				tpl += '<div class="agree" tapmode="tap" onclick="certAction(1,this, ' + str + applyNoticeID + str + ', 4)">同意</div>';
//				tpl += '<div class="refuse" tapmode="tap" onclick="certAction(0,this, ' + str + applyNoticeID + str + ', 4)">拒绝</div>';
//				tpl += '</li>';
				tpl += '<li class="processed">';
				tpl += '已拒绝';
				tpl += '</li>';
			} else {
//				tpl += '<li class="action hidden">';
//				tpl += '<div class="agree" tapmode="tap" onclick="certAction(1,this, ' + str + applyNoticeID + str + ', 4)">同意</div>';
//				tpl += '<div class="refuse" tapmode="tap" onclick="certAction(0,this, ' + str + applyNoticeID + str + ', 4)">拒绝</div>';
//				tpl += '</li>';
				tpl += '<li class="processed" id="unprocessed">';
				tpl += '未处理';
				tpl += '</li>';
			}
		}
		else{
			//根据notice_type来做判断
			if(7 == noticeMsg.notice_type){
				if (0 == noticeMsg.notice_result) {
					tpl += '<li class="action hidden">';
					tpl += '<div class="agree" tapmode="tap" onclick="certAction(1,this, ' + str + applyNoticeID + str + ', 7)">同意</div>';
					tpl += '<div class="refuse" tapmode="tap" onclick="certAction(0,this, ' + str + applyNoticeID + str + ', 7)">拒绝</div>';
					tpl += '</li>';
					tpl += '<li class="processed">';
					tpl += '已同意';
					tpl += '</li>';
				} else if (1 == noticeMsg.notice_result) {
					tpl += '<li class="action hidden">';
					tpl += '<div class="agree" tapmode="tap" onclick="certAction(1,this, ' + str + applyNoticeID + str + ', 7)">同意</div>';
					tpl += '<div class="refuse" tapmode="tap" onclick="certAction(0,this, ' + str + applyNoticeID + str + ', 7)">拒绝</div>';
					tpl += '</li>';
					tpl += '<li class="processed">';
					tpl += '已拒绝';
					tpl += '</li>';
				} else {
					tpl += '<li class="action">';
					tpl += '<div class="agree" tapmode="tap" onclick="certAction(1,this, ' + str + applyNoticeID + str + ', 7)">同意</div>';
					tpl += '<div class="refuse" tapmode="tap" onclick="certAction(0,this, ' + str + applyNoticeID + str + ', 7)">拒绝</div>';
					tpl += '</li>';
					tpl += '<li class="processed hidden">';
					tpl += '已同意/已拒绝';
					tpl += '</li>';
				}
			}
			else if(4 == noticeMsg.notice_type){
				//2015-8-12,Added by lzm,这里增加notice_result字段判断,0:已同意,1:已拒绝
				if (0 == noticeMsg.notice_result) {
					tpl += '<li class="action hidden">';
					tpl += '<div class="agree" tapmode="tap" onclick="certAction(1, this, ' + str + applyNoticeID + str + ', 4)">同意</div>';
					tpl += '<div class="refuse" tapmode="tap" onclick="certAction(0,this, ' + str + applyNoticeID + str + ', 4)">拒绝</div>';
					tpl += '</li>';
					tpl += '<li class="processed">';
					tpl += '已同意';
					tpl += '</li>';
				} else if (1 == noticeMsg.notice_result) {
					tpl += '<li class="action hidden">';
					tpl += '<div class="agree" tapmode="tap" onclick="certAction(1,this, ' + str + applyNoticeID + str + ', 4)">同意</div>';
					tpl += '<div class="refuse" tapmode="tap" onclick="certAction(0,this, ' + str + applyNoticeID + str + ', 4)">拒绝</div>';
					tpl += '</li>';
					tpl += '<li class="processed">';
					tpl += '已拒绝';
					tpl += '</li>';
				} else {
					tpl += '<li class="action">';
					tpl += '<div class="agree" tapmode="tap" onclick="certAction(1,this, ' + str + applyNoticeID + str + ', 4)">同意</div>';
					tpl += '<div class="refuse" tapmode="tap" onclick="certAction(0,this, ' + str + applyNoticeID + str + ', 4)">拒绝</div>';
					tpl += '</li>';
					tpl += '<li class="processed hidden">';
					tpl += '已同意/已拒绝';
					tpl += '</li>';
				}
			}
		}

		tpl += '</div>';
		tpl += '</div>';
		
		if(1 == type){
			//上拉加载更多
			$("#main_fra").append(tpl);
			api.parseTapmode();
		}
		else{
//			alert("type:" + type);
			//下拉刷新
			$("#main_fra").prepend(tpl);
			api.parseTapmode();
//			alert(JSON.stringify(tpl));
		}
		
	}
	api.hideProgress();
	
	//更新最早和最晚时间用来定位(因为每次都是按照最新时间升序排列，所以可以这么来取)
	var noticeLen = allNoticeIDSet.length;
	if("" == oldestTime && "" == newestTime && 0 != noticeLen){
		//初次显示是降序排列的
		oldestTime = noticeID2NoticeMap[allNoticeIDSet[noticeLen-1]].createdAt;
		newestTime = noticeID2NoticeMap[allNoticeIDSet[0]].createdAt;
	}
	else if(0 != noticeLen){
		if(1 == type){
			//上拉加载更多时候
			oldestTime = noticeID2NoticeMap[allNoticeIDSet[noticeLen-1]].createdAt;
		}
		else {
			newestTime = noticeID2NoticeMap[allNoticeIDSet[0]].createdAt;
		}
	}
//	alert("oldestTime:" + oldestTime + ",newestTime:" + newestTime);
	
	//回调
	if('nullFunc' != funcName){
		funcName();
	}
}

//将对应的user和t_society_member对应起来
function insertUser2SocietyMemMap(userMsg, noticeID, type){
//	alert("insertUser2SocietyMemMap");
	var societyID = $api.getStorage('society_id');
	//端方mcm访问数据库,并相应的填充前端页面
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
	        
	        query.include({
				qid: queryId,
				column: 'section_id'
			});
			query.whereEqual({
				qid: queryId,
				column: 'user_id',
				value: userMsg.id
			});
			query.whereEqual({
				qid: queryId,
				column: 'society_id',
				value: societyID
			});
			query.whereEqual({
				qid: queryId,
				column: 'is_deleted',
				value: false
			});
			
			query.limit({
            qid:queryId,
            value:1000
        });
        model.findAll({
				class: "t_society_member",
				qid: queryId
			}, function(ret, err) {
				if (ret && (0 != ret.length)) {
					user2MemberMap[userMsg.id] = ret[0];
					allMember.push(ret[0]);
//					api.alert({
//						msg: ret[0]
//					});
					//计数,便于统计是否全部查询完毕
					CountNoticeNum++;
//					alert("CountNoticeNum:" + CountNoticeNum + ",allNoticeNum:" + allNoticeNum);
//					alert("memMsg:" + JSON.stringify(user2MemberMap[userMsg.id]));
					if(CountNoticeNum == allNoticeNum){
						//立即置位，防止开启alert时候重复显示
						allNoticeNum = 0;
//						alert("CountNoticeNum == allNoticeNum, CountNoticeNum:" +CountNoticeNum + ",allNoticeNum:" + allNoticeNum);
						//查找完毕,展示对应界面
						showCertMsg('nullFunc', type);
					}
				}
				else{
					var noticeType = noticeID2NoticeMap[noticeID].notice_type;
					if(7 == noticeType){
//						构造一个成员对，以便查找显示
						var memberMsg = {};
						memberMsg['user_id'] = userMsg.id;
						memberMsg['society_member_position'] = '无';
						memberMsg['section_id'] = 'null';
						memberMsg['section_name'] = '非本社团成员';
						memberMsg['is_member'] = 'false';
						//type==7的时候,构造一个放置,仅此例外,因为他不是本社团成员,所以需要这么做
						user2MemberMap[userMsg.id] = memberMsg;
						allMember.push(memberMsg);
						CountNoticeNum++;
//						alert("CountNoticeNum:" + CountNoticeNum + ",allNoticeNum:" + allNoticeNum);
	//					alert("memMsg:" + JSON.stringify(user2MemberMap[userMsg.id]));
						if(CountNoticeNum == allNoticeNum){
							//立即置位，防止开启alert时候重复显示
//							alert("CountNoticeNum:" + CountNoticeNum + ",allNoticeNum:" + allNoticeNum);
							allNoticeNum = 0;
							//查找完毕,展示对应界面
							showCertMsg('nullFunc', type);
						}
					}
					else{
//						alert("noticeType:" + noticeType);
//						api.toast({
//							msg: '没有找到对应的成员信息，请稍后重试!!!错误信息:' + err.msg,
//							duration: 2000,
//							location: 'middle'
//						});
						//2015-8-28,Modified by lzm,当查不到成员信息了,就不展示该条了，所以计数值减1
						allNoticeNum--;
						var noticeDelete = noticeID2NoticeMap[noticeID];
						var noticeIndex = allShowNotice.indexOf(noticeDelete);
//						alert("noticeIndex:" + noticeIndex + ",noticeDelete:" + JSON.stringify(noticeDelete));
						allShowNotice.splice(noticeIndex, 1);
						var noticeIDIndex = allNoticeIDSet.indexOf(noticeID);
						allNoticeIDSet.splice(noticeIDIndex, 1);
//						alert("noticeIDIndex:" + noticeIDIndex);
//						alert("CountNoticeNum:" + CountNoticeNum + ",allNoticeNum:" + allNoticeNum);
						if(CountNoticeNum == allNoticeNum){
							allNoticeNum = 0;
							//查找完毕,展示对应界面
//							api.alert({
//								msg: "test for 111"
//							});
							showCertMsg('nullFunc', type);
						}
					}		
				}
			});
	    }
	});
}

//将对应的prompt和user对应起来
function insertPrompt2UserMap(promptMsg, noticeID, type){
//	alert("insertPrompt2UserMap");
	//端方mcm访问数据库,并相应的填充前端页面
	var model = api.require('model');
	var query = api.require('query');
	model.config({
		appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8',
		appId: 'A6982914277502',
		host: 'https://d.apicloud.com'
	});
	
	var promote_user_id = promptMsg.promote_user_id;
//	api.alert({
//		msg: "promote_user_id:" + promote_user_id
//	});
	if(null == promote_user_id || '' == promote_user_id){
		//空的话直接返回
		//2015-9-26,Modified by lzm,当查不到成员信息了,就不展示该条了，所以计数值减1
		var noticeDelete = noticeID2NoticeMap[noticeID];
		var noticeIndex = allShowNotice.indexOf(noticeDelete);
//						alert("noticeIndex:" + noticeIndex + ",noticeDelete:" + JSON.stringify(noticeDelete));
		allShowNotice.splice(noticeIndex, 1);
		var noticeIDIndex = allNoticeIDSet.indexOf(noticeID);
		allNoticeIDSet.splice(noticeIDIndex, 1);
//						alert("CountNoticeNum:" + CountNoticeNum + ",allNoticeNum:" + allNoticeNum);

		return;
	}
	var query = api.require('query');
	query.createQuery(function(ret, err) {
	    if (ret && ret.qid) {
	        var queryId = ret.qid;
	        
	        query.include({
				qid: queryId,
				column: 't_user_info'
			});
			query.whereEqual({
				qid: queryId,
				column: 'id',
				//提干用户ID
				value: promote_user_id
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
	                prompt2UserMap[promptMsg.id] = ret[0];
	                var userMsg = ret[0];
	                
//	                alert("userMsg:" + JSON.stringify(prompt2UserMap[promptMsg.id]));
					allUser.push(userMsg);
					insertUser2SocietyMemMap(userMsg, noticeID,type);
	            }
	            else{
	            	api.toast({
						msg: '没有找到对应的提干用户信息~',
						duration: 2000,
						location: 'middle'
					});
					api.hideProgress();
	            }
	        });
	    }
	});
}

//将对应的notice和prompt对应起来
function insertNotice2PromptMap(noticeMsg, noticeID, type){
//	alert("insertNotice2PromptMap, noticeID:" + noticeID);
	var relativeTransacID = noticeMsg.relative_society_transaction_id;
	var tempNotice = noticeMsg;
	//端方mcm访问数据库,并相应的填充前端页面
	var model = api.require('model');
	model.config({
		appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8',
		appId: 'A6982914277502',
		host: 'https://d.apicloud.com'
	});
	
	model.findById({
	    class: 't_society_prompt',
		id: relativeTransacID
	},function(ret, err){
	    if(ret){
	        allPrompt.push(ret);
	        notice2PromptMap[tempNotice.id] = ret;
//	        alert("promptMsg:" + JSON.stringify(notice2PromptMap[tempNotice.id]));
	        //查找对应的用户信息
	        insertPrompt2UserMap(ret, noticeID, type);
	    }
	    else{
	    	api.toast({
				msg: '没有找到对应的提干申请信息~',
				duration: 2000,
				location: 'middle'
			});
			api.hideProgress();
	    }
	});
}

//查找一个社团提干通知所有对应的prompt并存放到map里
function findAllClubCertRelativePrompt(noticeArr, type)
{
	
	var tempNoticeArr = noticeArr;
	allNoticeNum = noticeArr.length;
	//计数值清0
	CountNoticeNum = 0;
	//清空
	allShowNotice = [];
		
	for(var i = 0; i < noticeArr.length; i++){
		//去重处理，保证一定不会有重复的加载
		if(-1 != allNoticeIDSet.indexOf(noticeArr[i].id)){
			//重复加载,总数减少不处理，直接返回
			allNoticeNum--;
			if(0 == allNoticeNum){
				if(1 == type){
					api.toast({
						msg: '没有更多提干信息啦~',
						duration: 2000,
						location: 'bottom'
					});
				}
				else{
					api.toast({
						msg: '没有更多提干信息啦~',
						duration: 2000,
						location: 'top'
					});
				}
				
				//全部重复,不显示了
				api.hideProgress();
				
			}
			return ;
		}
		//将noticeID和notice关联起来
		noticeID2NoticeMap[noticeArr[i].id] = noticeArr[i];
		//按照最新到最老的排序方式放置notice ID
		if(1 == type){
			allNoticeIDSet.push(noticeArr[i].id);
			allShowNotice.push(noticeArr[i]);
		}
		else{
			if("" == newestTime){
				//初次刷新时候因为按照最新时间降序排列,所以稍微处理下
				allNoticeIDSet.push(noticeArr[i].id);
				//用于展示的数量(这个特殊处理下，以便升序排列)
				allShowNotice.unshift(noticeArr[i]);
			}
			else{
				//下拉刷新放置到前面
				allNoticeIDSet.unshift(noticeArr[i].id);
				//用于展示的数量
				allShowNotice.push(noticeArr[i]);
			}
		}
		
		var noticeID = noticeArr[i].id;
//		alert("findAllClubCertRelativePrompt:noticeID" + noticeID);
//		alert("findAllClubCertRelativePrompt test i:" + i + ",noticeArr[i]:" + JSON.stringify(noticeArr[i]));
		insertNotice2PromptMap(noticeArr[i], noticeArr[i].id, type);
	}
	
}

/**
 * 根据某社团ID和用户ID查询该社团的的所有相关人员认证信息,并显示出来
 * @param {Object} clubId:社团id字符串,不能为空
 *				   type: 0/1 -- 下拉刷新/上拉加载更多
 */
//展示社团里面的人员认证信息
function showClubRelativeCertMsg(type, userID, clubId) {
	var str = "'";
	var societyPresident = "";
	//刷新计数
	var count = 0;
	var noticeSum = 0;
	
	if(1 == type){
		api.showProgress({
			style: 'default',
			animationType: 'fade',
			title: '上拉加载更多...',
			text: '先喝杯茶吧...',
			modal: false
		});
	}
	else{
		api.showProgress({
			style: 'default',
			animationType: 'fade',
			title: '下拉刷新中...',
			text: '先喝杯茶吧...',
			modal: false
		});
	}
	

	//端方mcm访问数据库,并相应的填充前端页面
	var model = api.require('model');
	var query = api.require('query');
	model.config({
		appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8',
		appId: 'A6982914277502',
		host: 'https://d.apicloud.com'
	});
	//查询该人在社团中的角色，根据角色来加载不同的数据
	query.createQuery(function(ret, err) {
		if (ret && ret.qid) {
			var queryId = ret.qid;

			//userID
			query.whereEqual({
				qid: queryId,
				column: 'user_id',
				value: userID
			});
			//societyID
			query.whereEqual({
				qid: queryId,
				column: 'society_id',
				value: clubId
			});
			query.limit({
            qid:queryId,
            value:1000
        });
        model.findAll({
				class: "t_society_member",
				qid: queryId
			}, function(ret, err) {
				if (ret && (0 != ret.length)) {
					var memPos = ret[0].society_member_position;
					if ('社长' == memPos || '副社长' == memPos) {
						isPresidentFlag = 'true';
						findAllClubReceivedCertNotice(type, clubId, findAllClubCertRelativePrompt);
					}
					else{
						isPresidentFlag = 'false';
						findAllUserClubApplyCertNotice(type, clubId, userID, findAllClubCertRelativePrompt);
					}

				} else {
					api.toast({
						msg: '没有查到对应人员的角色信息，请稍后重试!!!',
						duration: 2000,
						location: 'middle'
					});
					api.hideProgress();
				}

			});
		}
	});

}

apiready = function() {
	//获取本地缓存里的社团ID，用户ID
	societyID = $api.getStorage('society_id');
	userID = $api.getStorage('user_id');
	//页面传过来
	var pageParam = api.pageParam;
	society_id = pageParam.society_id;
	var pageFlag = pageParam.pageFlag;
	if('true' == pageFlag) {
		societyID = society_id;
	}
	//	alert( "localStorage societyID:" + societyID + ",userID:" + userID );
	if('' == societyID || '' == userID || ('undefined'== typeof(societyID)) || ('undefined'== typeof(userID))){
		api.toast({
		    msg: '获取不到对应认证信息~',
		    duration:2000,
		    location: 'middle'
		});
		return;
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
	            value: societyID
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
//	                api.alert({
//	                	msg: "api.alert test"
//	                });
	            }
	
	        });
	    }
	});
	
//	findAllClubReceivedCertNotice(societyID, findAllClubCertRelativePrompt);
	showClubRelativeCertMsg(0, userID, societyID);

	//下拉刷新
	api.setRefreshHeaderInfo({
		visible: true,
		// loadingImgae: 'wgt://image/refresh-white.png',
		bgColor: '#f2f2f2',
		textColor: '#4d4d4d',
		textDown: '下拉刷新...',
		textUp: '松开刷新...',
		showTime: true
	}, function(ret, err) {
		showClubRelativeCertMsg(0, userID, societyID);
		api.refreshHeaderLoadDone();
	});
	
	//上拉加载更多
	api.addEventListener({
		name : 'scrolltobottom',
		extra : {
			threshold : 3 //设置距离底部多少距离时触发，默认值为0，数字类型
		}
	}, function(ret, err) {
		//operation
		showClubRelativeCertMsg(1, userID, societyID);
	});
}