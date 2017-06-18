/*
 * 2015-8-25,Added by lzm,重构人员认证部门，使用上拉和下拉刷新
 * */
//人员认证通知
var personnelNoticeMsgArr = [];
//人员认证通知与提干映射(注意加入的没有对应映射)
var Notice2PromptMap = [];


/*
 * 函数名:getPersonnelNotice
 * 函数功能:获取跟他相关的人员认证通知
 * 参数:userID--相关用户
 * 		cludId--对应社团
 * 		funcName--回调函数
 * */
function getPersonnelNotice(userID, clubId, funcName){
	
}

/**
 * 根据某社团ID查询该社团的的所有相关人员认证信息,并显示出来
 * @param {Object} clubId:社团id字符串,不能为空
 */
//展示社团里面的人员认证信息
function showClubRelativeCertMsg(userID, clubId) {
	certTypeArr[0] = 4;
	certTypeArr[1] = 7;
	var str = "'";
	//用户在该社团的角色
	var memPos = "";
	var societyPresident = "";
	//刷新计数
	var count = 0;
	var noticeSum = 0;

	api.showProgress({
		style: 'default',
		animationType: 'fade',
		title: '努力加载人员认证信息中...',
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
					memPos = ret[0].society_member_position;

					//继续查询该社团的社长ID
					model.findById({
						class: 't_society',
						id: clubId
					}, function(ret, err) {
						if (ret) {
							societyPresident = ret.society_president;

							if ('社长' == memPos || '副社长' == memPos) {
								//find club relative personnel cert,type 4
								query.createQuery(function(ret, err) {
									if (ret && ret.qid) {
										queryQid = ret.qid;
										//	    	api.alert({
										//	    		msg: certTypeArr
										//	    	});
										//notice_type包含4和7字段
										query.whereContainAll({
											qid: queryQid,
											column: 'notice_type',
											value: certTypeArr
										});
										//notice_status!=2
										query.whereNotEqual({
											qid: queryQid,
											column: 'notice_status',
											value: 2
										});
										//本社团的认证
										query.whereEqual({
											qid: queryQid,
											column: 'relative_society_id',
											value: clubId
										});

										//设置排序条件
										//时间
										query.desc({
											qid: queryQid,
											column: 'createdAt'
										});
										//			query.asc({
										//				qid: queryQid,
										//				column: 'notice_status'
										//			});
										//			query.asc({
										//				qid: queryQid,
										//				column: 'notice_type'
										//			});

										//findAll
										query.limit({
            qid:queryQid,
            value:1000
        });
        model.findAll({
											class: 't_society_notice',
											qid: queryQid
										}, function(ret, err) {
											//				alert("t_society_notice info:" + JSON.stringify(ret));
											if (0 != ret.length) {
												//		    		api.alert({
												//		    			msg: "notice num:" + ret.length,
												//		    		});
												noticeSum = ret.length;
												for (var i = 0; i < ret.length; i++) {
													var noticeSenderID = ret[i].notice_sender_id;
													allNoticeMsgArr[noticeSenderID] = ret[i];
													var NoticeMsg = ret[i];
													//		    			api.alert({
													//		    				msg: "NoticeMsg:" + JSON.stringify(NoticeMsg),
													//		    			});

													if (4 === NoticeMsg.notice_type) {
														//查询对应社团提干表查对应的提干信息
														var relativeTransactionId = NoticeMsg.relative_society_transaction_id;
														model.findById({
															class: 't_society_prompt',
															id: relativeTransactionId
														}, function(ret, err) {
															if (ret) {
																//do something
																//这里四个表关联的标志就是这个发起提干的用户，所以将其记录下来,作为查找连接的标志
																var promote_user_id = ret.promote_user_id;
																//本处采用算法中的Hash法存储算出来的元素，以便于查找以及统一处理
																allPromptMsgArr[promote_user_id] = ret;
																var PromptMsg = ret;
																//							        api.alert({
																//							        	msg: "PromptMsg info:" + JSON.stringify(PromptMsg),
																//							        });

																//继续查询用户信息
																query.createQuery(function(ret, err) {
																	if (ret && ret.qid) {
																		var queryId = ret.qid;
																		query.include({
																			qid: queryId,
																			column: 't_user_info'
																		});
																		//									        api.alert({
																		//									 			msg: "prompt info, promote_user_id:" + promote_user_id , 
																		//									 		});
																		query.whereEqual({
																			qid: queryId,
																			column: 'id',
																			//提干用户ID
																			value: promote_user_id
																		});

																		//do something
																		query.limit({
            qid:queryId,
            value:1000
        });
        model.findAll({
																			class: "user",
																			qid: queryId
																		}, function(ret, err) {
																			if (ret) {
																				//do something
																				//保存用户相关信息,这里是findAll返回数组形式，取第一个也是那唯一的一个就好
																				var userID = ret[0].id;
																				//本处采用算法中的Hash法存储算出来的元素，以便于查找以及统一处理
																				allUserMsgArr[userID] = ret[0];
																				var UserMsg = ret[0];
																				//									                api.alert({
																				//									                	msg: "UserMsg info:" + JSON.stringify(UserMsg),
																				//									                });

																				//继续查询社团成员表
																				query.createQuery(function(ret, err) {
																					if (ret && ret.qid) {
																						var queryId = ret.qid;
																						//do something
																						//include section_id
																						query.include({
																							qid: queryId,
																							column: 'section_id'
																						});
																						//user_id
																						//													 		api.alert({
																						//													 			msg: "userID:" + userID + ",clubId:" + clubId, 
																						//													 		});
																						query.whereEqual({
																							qid: queryId,
																							column: 'user_id',
																							value: userID
																						});
																						//society id
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
																							if (ret) {
																								//																	api.alert({
																								//																		msg: "ret:" + JSON.stringify(ret),
																								//																	});
																								//																	var singleSocietyMem = ret[0];
																								//do something
																								var SocietyUserID = ret[0].user_id;
																								//本处采用算法中的Hash法存储算出来的元素，以便于查找以及统一处理
																								allSocietyMemberMsgArr[SocietyUserID] = ret[0];
																								var SocietyMemberMsg = ret[0];
																								//													                api.alert({
																								//													                	msg: "SocietyMemberMsg:" + JSON.stringify(SocietyMemberMsg) + ",SocietyUserID:" + SocietyUserID,
																								//													                });

																								//展示到前端
																								//配置前端展示数据,注意下边的所有连接点为SocietyUserID，即用户ID
																								var tpl = "";
																								tpl += '<div id="section1" class="section">';
																								tpl += '<div id="person_info" class="person_info" >';
																								tpl += '<ul id="person_title" class="person_title">';
																								tpl += '<div id="club_head">';
																								tpl += '<img id = "club_head_img" src="' + allUserMsgArr[SocietyUserID].t_user_info.user_header + '"  />';
																								tpl += '</div>';
																								tpl += '<div id="club_person_title_other">';
																								tpl += '<span id="nickname">' + allUserMsgArr[SocietyUserID].t_user_info.user_real_name + '</span>';
																								tpl += '<span id="title">(' + allSocietyMemberMsgArr[SocietyUserID].section_id.section_name + '/' + allSocietyMemberMsgArr[SocietyUserID].society_member_position + ')</span>';
																								tpl += '<p id="apply_time">' + allNoticeMsgArr[SocietyUserID].createdAt.substring(0, 19) + '</p>';
																								tpl += '</div>';
																								tpl += '</ul>';
																								tpl += '</div>';
																								tpl += '<div id="apply_position" class="apply_position">';
																								tpl += '<ul class="ul1">';
																								tpl += '<li class="li1">申请职位：</li>';
																								tpl += '<li class="li2">' + allPromptMsgArr[SocietyUserID].promote_section + '/' + allPromptMsgArr[SocietyUserID].promote_type + '</li>';
																								tpl += '</ul>';
																								tpl += '</div>';
																								tpl += '<div id="apply_declaration" class="apply_declaration">';
																								tpl += '<ul class="ul1">';
																								tpl += '<li class="li1">申请宣言：</li>';
																								tpl += '<li class="li2">' + allPromptMsgArr[SocietyUserID].promote_content + '</li>';
																								tpl += '</ul>';
																								tpl += '</div>';
																								tpl += '<div id="handle_btn"  class="handle_btn">';
																								//2015-8-12,Added by lzm,这里增加notice_result字段判断,0:已同意,1:已拒绝
																								if (0 == allNoticeMsgArr[SocietyUserID].notice_result) {
																									tpl += '<li class="action hidden">';
																									tpl += '<div class="agree" tapmode="" onclick="certAction(1, this, ' + str + SocietyUserID + str + ', 4)">同意</div>';
																									tpl += '<div class="refuse" tapmode="" onclick="certAction(0,this, ' + str + SocietyUserID + str + ', 4)">拒绝</div>';
																									tpl += '</li>';
																									tpl += '<li class="processed">';
																									tpl += '已同意';
																									tpl += '</li>';
																								} else if (1 == allNoticeMsgArr[SocietyUserID].notice_result) {
																									tpl += '<li class="action hidden">';
																									tpl += '<div class="agree" tapmode="" onclick="certAction(1,this, ' + str + SocietyUserID + str + ', 4)">同意</div>';
																									tpl += '<div class="refuse" tapmode="" onclick="certAction(0,this, ' + str + SocietyUserID + str + ', 4)">拒绝</div>';
																									tpl += '</li>';
																									tpl += '<li class="processed">';
																									tpl += '已拒绝';
																									tpl += '</li>';
																								} else {
																									tpl += '<li class="action">';
																									tpl += '<div class="agree" tapmode="" onclick="certAction(1,this, ' + str + SocietyUserID + str + ', 4)">同意</div>';
																									tpl += '<div class="refuse" tapmode="" onclick="certAction(0,this, ' + str + SocietyUserID + str + ', 4)">拒绝</div>';
																									tpl += '</li>';
																									tpl += '<li class="processed hidden">';
																									tpl += '已同意/已拒绝';
																									tpl += '</li>';
																								}
																								tpl += '</div>';
																								tpl += '</div>';
																								//																	api.alert({
																								//																		msg: "tpl:" + tpl,
																								//																	});
																								$("#main").append(tpl);
																								count++;
																								if (count == noticeSum) {
																									api.hideProgress();
																								}

																								//																	var mainDom = $api.dom('#main');
																								//			$api.append(mainDom, tpl);

																							}

																						});
																					}
																				});
																			}
																		});

																	}
																});

															}

														});
													} else if (7 === NoticeMsg.notice_type) {
														//		    				api.alert({
														//		    					msg: "notice_type 7..."
														//		    				});
														var applyType7UserID = NoticeMsg.notice_sender_id;
														//		    				api.alert({
														//		    					msg: "notice_type 7 applyType7UserID:" + applyType7UserID
														//		    				});
														//notice_type === 7
														//继续查询用户信息
														model.findById({
															class: 'user',
															id: applyType7UserID
														}, function(ret, err) {
															if (ret) {
																//将user信息先存起来
																allType7UserIDArr.push(ret.id);
																allType7UserMsgArr[ret.id] = ret;
																//将userInfoID与userID的映射存起来
																allType7User2UserInfoHashArr[ret.t_user_info] = ret.id;
																//继续查用户信息表
																var userInfoID = ret.t_user_info;
																model.findById({
																	class: 't_user_info',
																	id: userInfoID
																}, function(ret, err) {
																	if (ret) {
																		//继续查用户信息表
																		var userInfoID = ret.id;
																		//将hash数组allType7User2UserInfoHashArr里面的映射UserID关系取出来
																		allType7UserInfoMsgArr[allType7User2UserInfoHashArr[ret.id]] = ret;
																		var applyType7UserID = allType7User2UserInfoHashArr[ret.id];
																		//									        api.alert({
																		//									        	msg: "applyType7UserID:" + applyType7UserID,
																		//									        });

																		//配置前端展示数据,注意下边的所有连接点为applyType7UserID，即用户ID

																		var tpl = "";
																		tpl += '<div id="section1" class="section">';
																		tpl += '<div id="person_info" class="person_info" >';
																		tpl += '<ul id="person_title" class="person_title">';
																		tpl += '<div id="club_head">';
																		tpl += '<img id = "club_head_img" src="' + allType7UserInfoMsgArr[applyType7UserID].user_header + '"  />';
																		tpl += '</div>';
																		tpl += '<div id="club_person_title_other">';
																		tpl += '<span id="nickname">' + allType7UserInfoMsgArr[applyType7UserID].user_real_name + '</span>';
																		tpl += '<span id="title">' + '(' + '非本社团成员' + '/' + '无' + ')</span>';
																		tpl += '<p id="apply_time">' + allNoticeMsgArr[applyType7UserID].createdAt.substring(0, 19) + '</p>';
																		tpl += '</div>';
																		tpl += '</ul>';
																		tpl += '</div>';
																		tpl += '<div id="apply_position" class="apply_position">';
																		tpl += '<ul class="ul1">';
																		tpl += '<li class="li1">申请职位：</li>';
																		//对于还未加入本社团的人员的提干申请，一律用"社员部/社员"来做
																		tpl += '<li class="li2">' + '社员部' + '/' + '社员' + '</li>';
																		tpl += '</ul>';
																		tpl += '</div>';
																		tpl += '<div id="apply_declaration" class="apply_declaration">';
																		tpl += '<ul class="ul1">';
																		tpl += '<li class="li1">申请宣言：</li>';
																		tpl += '<li class="li2">' + allNoticeMsgArr[applyType7UserID].notice_content + '</li>';
																		tpl += '</ul>';
																		tpl += '</div>';
																		tpl += '<div id="handle_btn"  class="handle_btn">';
																		//2015-8-12,Added by lzm,这里增加notice_result处理结果的判断
																		if (0 == allNoticeMsgArr[applyType7UserID].notice_result) {
																			tpl += '<li class="action hidden">';
																			tpl += '<div class="agree" tapmode="" onclick="certAction(1,this, ' + str + applyType7UserID + str + ', 7)">同意</div>';
																			tpl += '<div class="refuse" tapmode="" onclick="certAction(0,this, ' + str + applyType7UserID + str + ', 7)">拒绝</div>';
																			tpl += '</li>';
																			tpl += '<li class="processed">';
																			tpl += '已同意';
																			tpl += '</li>';
																		} else if (1 == allNoticeMsgArr[applyType7UserID].notice_result) {
																			tpl += '<li class="action hidden">';
																			tpl += '<div class="agree" tapmode="" onclick="certAction(1,this, ' + str + applyType7UserID + str + ', 7)">同意</div>';
																			tpl += '<div class="refuse" tapmode="" onclick="certAction(0,this, ' + str + applyType7UserID + str + ', 7)">拒绝</div>';
																			tpl += '</li>';
																			tpl += '<li class="processed">';
																			tpl += '已拒绝';
																			tpl += '</li>';
																		} else {
																			tpl += '<li class="action">';
																			tpl += '<div class="agree" tapmode="" onclick="certAction(1,this, ' + str + applyType7UserID + str + ', 7)">同意</div>';
																			tpl += '<div class="refuse" tapmode="" onclick="certAction(0,this, ' + str + applyType7UserID + str + ', 7)">拒绝</div>';
																			tpl += '</li>';
																			tpl += '<li class="processed hidden">';
																			tpl += '已同意/已拒绝';
																			tpl += '</li>';
																		}
																		tpl += '</div>';
																		tpl += '</div>';

																		//											api.alert({
																		//												msg: "tpl:" + tpl,
																		//											});
																		$("#main").append(tpl);
																		count++;
																		if (count == noticeSum) {
																			api.hideProgress();
																		}
																	}

																});
															}
														});

													}
												}
											} else if (0 == ret.length) {
												api.alert({
													msg: "您没有人员认证信息~"
												});
//												alert("您没有人员认证信息~");
												api.hideProgress();
											} else {
												api.toast({
													msg: '加载社团人员认证信息失败!!!',
													duration: 2000,
													location: 'middle'
												});
												api.hideProgress();
											}
										});
									}
								});


							} else {
								//其他人员
								query.createQuery(function(ret, err) {
									if (ret && ret.qid) {
										queryQid = ret.qid;
										//	    	api.alert({
										//	    		msg: certTypeArr
										//	    	});
										//notice_type包含4
										query.whereEqual({
											qid: queryQid,
											column: 'notice_type',
											value: 4
										});
										//										//notice_status!=2
										//										query.whereNotEqual({
										//											qid: queryQid,
										//											column: 'notice_status',
										//											value: 2
										//										});
										//本人在本社团的认证
										query.whereEqual({
											qid: queryQid,
											column: 'relative_society_id',
											value: clubId
										});
										//本人
										query.whereEqual({
											qid: queryQid,
											column: 'notice_sender_id',
											value: userID
										});

										//设置排序条件
										//时间
										query.desc({
											qid: queryQid,
											column: 'createdAt'
										});
										//			query.asc({
										//				qid: queryQid,
										//				column: 'notice_status'
										//			});
										//			query.asc({
										//				qid: queryQid,
										//				column: 'notice_type'
										//			});

										//findAll
										query.limit({
            qid:queryQid,
            value:1000
        });
        model.findAll({
											class: 't_society_notice',
											qid: queryQid
										}, function(ret, err) {
											//				alert("t_society_notice info:" + JSON.stringify(ret));
											if (0 != ret.length) {
												//		    		api.alert({
												//		    			msg: "notice num:" + ret.length,
												//		    		});
												//												memOwnNoticeMsgArr = ret;
												noticeSum = ret.length;
												for (var i = 0; i < ret.length; i++) {
													var noticeSenderID = ret[i].notice_sender_id;
													var NoticeMsg = ret[i];
													//		    			api.alert({
													//		    				msg: "NoticeMsg:" + JSON.stringify(NoticeMsg),
													//		    			});
													//查询对应社团提干表查对应的提干信息
													var relativeTransactionId = NoticeMsg.relative_society_transaction_id;
													memOwnNoticeMsgArr[relativeTransactionId] = NoticeMsg;
													model.findById({
														class: 't_society_prompt',
														id: relativeTransactionId
													}, function(ret, err) {
														if (ret) {
															//do something
															//这里四个表关联的标志就是这个发起提干的用户，所以将其记录下来,作为查找连接的标志
															var promote_user_id = ret.promote_user_id;
															var PromptMsg = ret;
															var relativeTransactionIdCur = PromptMsg.id;
															//															api.alert({
															//													        	msg: "noticeMsgCur relativeTransactionIdCur:" + relativeTransactionIdCur,
															//													        });
															//																						        api.alert({
															//																						        	msg: "PromptMsg info:" + JSON.stringify(PromptMsg),
															//																						        });

															//继续查询用户信息
															query.createQuery(function(ret, err) {
																if (ret && ret.qid) {
																	var queryId = ret.qid;
																	query.include({
																		qid: queryId,
																		column: 't_user_info'
																	});
																	//									        api.alert({
																	//									 			msg: "prompt info, promote_user_id:" + promote_user_id , 
																	//									 		});
																	query.whereEqual({
																		qid: queryId,
																		column: 'id',
																		//提干用户ID
																		value: promote_user_id
																	});

																	//do something
																	query.limit({
            qid:queryId,
            value:1000
        });
        model.findAll({
																		class: "user",
																		qid: queryId
																	}, function(ret, err) {
																		if (ret && (0 != ret.length)) {
																			//do something
																			//保存用户相关信息,这里是findAll返回数组形式，取第一个也是那唯一的一个就好
																			var userID = ret[0].id;
																			var UserMsg = ret[0];
																			//									                api.alert({
																			//									                	msg: "UserMsg info:" + JSON.stringify(UserMsg),
																			//									                });

																			//继续查询社团成员表
																			query.createQuery(function(ret, err) {
																				if (ret && ret.qid) {
																					var queryId = ret.qid;
																					//do something
																					//include section_id
																					query.include({
																						qid: queryId,
																						column: 'section_id'
																					});
																					//user_id
																					//																			 		api.alert({
																					//																			 			msg: "test query t_society_member ---" + "userID:" + userID + ",clubId:" + clubId, 
																					//																			 		});
																					query.whereEqual({
																						qid: queryId,
																						column: 'user_id',
																						value: userID
																					});
																					//society id
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
																							//																	api.alert({
																							//																		msg: "ret:" + JSON.stringify(ret),
																							//																	});
																							//																	var singleSocietyMem = ret[0];
																							//do something
																							var SocietyUserID = ret[0].user_id;
																							var SocietyMemberMsg = ret[0];
																							//													                api.alert({
																							//													                	msg: "SocietyMemberMsg:" + JSON.stringify(SocietyMemberMsg) + ",SocietyUserID:" + SocietyUserID,
																							//													                });

																							//展示到前端
																							//配置前端展示数据,注意下边的所有连接点为SocietyUserID，即用户ID
																							var tpl = "";
																							tpl += '<div id="section1" class="section">';
																							tpl += '<div id="person_info" class="person_info" >';
																							tpl += '<ul id="person_title" class="person_title">';
																							tpl += '<div id="club_head">';
																							tpl += '<img id = "club_head_img" src="' + UserMsg.t_user_info.user_header + '"  />';
																							tpl += '</div>';
																							tpl += '<div id="club_person_title_other">';
																							tpl += '<span id="nickname">' + UserMsg.t_user_info.user_real_name + '</span>';
																							tpl += '<span id="title">(' + SocietyMemberMsg.section_id.section_name + '/' + SocietyMemberMsg.society_member_position + ')</span>';
																							tpl += '<p id="apply_time">' + memOwnNoticeMsgArr[relativeTransactionIdCur].createdAt.substring(0, 19) + '</p>';
																							tpl += '</div>';
																							tpl += '</ul>';
																							tpl += '</div>';
																							tpl += '<div id="apply_position" class="apply_position">';
																							tpl += '<ul class="ul1">';
																							tpl += '<li class="li1">申请职位：</li>';
																							tpl += '<li class="li2">' + PromptMsg.promote_section + '/' + PromptMsg.promote_type + '</li>';
																							tpl += '</ul>';
																							tpl += '</div>';
																							tpl += '<div id="apply_declaration" class="apply_declaration">';
																							tpl += '<ul class="ul1">';
																							tpl += '<li class="li1">申请宣言：</li>';
																							tpl += '<li class="li2">' + PromptMsg.promote_content + '</li>';
																							tpl += '</ul>';
																							tpl += '</div>';
																							tpl += '<div id="handle_btn"  class="handle_btn">';
																							//2015-8-12,Added by lzm,这里增加notice_result字段判断,0:已同意,1:已拒绝
																							var noticeResult = memOwnNoticeMsgArr[relativeTransactionIdCur].notice_result;
																							//																							api.alert({
																							//																								msg: "memOwnNoticeMsgArr[relativeTransactionIdCur]:" + JSON.stringify(memOwnNoticeMsgArr[relativeTransactionIdCur]),
																							//																							});

																							if (0 == noticeResult) {
																								tpl += '<li class="action hidden">';
																								tpl += '<div class="agree" tapmode="" onclick="certAction(1, this, ' + str + SocietyUserID + str + ', 4)">同意</div>';
																								tpl += '<div class="refuse" tapmode="" onclick="certAction(0,this, ' + str + SocietyUserID + str + ', 4)">拒绝</div>';
																								tpl += '</li>';
																								tpl += '<li class="processed">';
																								tpl += '已同意';
																								tpl += '</li>';
																							} else if (1 == noticeResult) {
																								tpl += '<li class="action hidden">';
																								tpl += '<div class="agree" tapmode="" onclick="certAction(1,this, ' + str + SocietyUserID + str + ', 4)">同意</div>';
																								tpl += '<div class="refuse" tapmode="" onclick="certAction(0,this, ' + str + SocietyUserID + str + ', 4)">拒绝</div>';
																								tpl += '</li>';
																								tpl += '<li class="processed">';
																								tpl += '已拒绝';
																								tpl += '</li>';
																							} else {
																								tpl += '<li class="action hidden">';
																								tpl += '<div class="agree" tapmode="" onclick="certAction(1,this, ' + str + SocietyUserID + str + ', 4)">同意</div>';
																								tpl += '<div class="refuse" tapmode="" onclick="certAction(0,this, ' + str + SocietyUserID + str + ', 4)">拒绝</div>';
																								tpl += '</li>';
																								tpl += '<li class="processed" id="unprocessed">';
																								tpl += '未处理';
																								tpl += '</li>';
																							}
																							tpl += '</div>';
																							tpl += '</div>';
																							//																	api.alert({
																							//																		msg: "tpl:" + tpl,
																							//																	});
																							$("#main").append(tpl);
																							//																	var mainDom = $api.dom('#main');
																							//		$api.append(mainDom, tpl);
																							count++;
																							if (count == noticeSum) {
																								api.hideProgress();
																							}
																						}

																					});
																				}
																			});
																		}
																	});

																}
															});

														}

													});

												}
												//												//收起刷新条
												//												api.hideProgress();
											} else if (0 == ret.length) {
												api.alert({
													msg: "您没有人员认证信息~"
												});
//												alert("您没有人员认证信息~");
												api.hideProgress();
											} else {
												api.toast({
													msg: '加载社团人员认证信息失败!!!',
													duration: 2000,
													location: 'middle'
												});
												api.hideProgress();
											}
										});
									}
									////									//收起刷新条
									//									api.hideProgress();
								});


							}
						}
					});

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