/*
* add by 小明
* 用于放置公用的功能函数
*/

/**add by 小明
 * 根据社团id查询社团成员,返回成员列表,部门列表和部门-成员列表的map
 * @param {Object} societyId 社团id，不能为空
 * @param {Object} obj 触发查询的对象 ,可以为空
 * @param {Object} where 来自哪里,可以为空
 */

function getSocietyMember(societyId, where, obj) {

	var model = api.require('model');
	var query = api.require('query');
	var relation = api.require('relation');

	model.config({
		appKey : '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8'
	});

	relation.findAll({
		class : 't_society',
		id : societyId,
		column : 't_society_member'
	}, function(ret_member_list, err) {
		if (ret_member_list) {

			var member_list = new Array();
			for (var i = 0; i < ret_member_list.length; i++) {
				if (ret_member_list[i].is_deleted != true) {
					member_list.push(ret_member_list[i]);
				}
			}

			//获取社团所有的部门
			relation.findAll({
				class : 't_society',
				id : societyId,
				column : 't_society_section'
			}, function(section_list, err) {
				//		alert(JSON.stringify(err));

				if (section_list) {

					var section_member_map = new Object();
					//部门-成员列表的map
					//alert("member_list="+JSON.stringify(member_list));
					//						alert("section_list=" + JSON.stringify(section_list));
					for (var i = 0; i < section_list.length; i++) {
						var list = [];
						var id = section_list[i].id;

						for (var j = 0; j < member_list.length; j++) {
							if (id == member_list[j].section_id) {
								list.push(member_list[j]);
							}
						}
						section_member_map[id] = list;
					}
					//alert("section_member_map=" + JSON.stringify(section_member_map));
					//在这里回调
					if (where == 'section_manage') {
						//部门管理
						showSectionList_sectionManage(member_list, section_list, section_member_map, obj);
					}
					//2015-8-16,Added by lzm
					if (where == 'club_evaluation') {
						//社团考核
						showSectionList_sectionManage(member_list, section_list, section_member_map, obj);
					}
					//2015-8-20,Added by lzm
					if (where == 'promotion_apply') {
						show_promotion_msg(member_list, section_list, section_member_map, obj);
					}

					if (where == 'new_vote') {
						//发起新投票
						getUserInfo_newVote(member_list, section_list, section_member_map);
					}

					if (where == 'club_member_list') {
						//发起新投票
						showSectionList_MemberList(member_list, section_list, section_member_map);
					}
				} else {
					api.hideProgress();

					api.alert({
						msg : err.msg
					});
				}
			});
		} else {
			api.hideProgress();
			api.alert({
				msg : err.msg
			});
		}
	});
}

/**add by 小明
 * 根据用户id查询多个用户的关键信息，包括用户昵称，头像，性别，签名，真实姓名，积分，其他字段可以自己获取
 * @param {Object} userIdList 用户id的字符串数组
 * @param {Object} where 来自哪里，字符串，用于区分回调
 */

function getUserKeyInfo(userIdList, func_name, obj) {

	var model = api.require('model');
	var query = api.require('query');
	var relation = api.require('relation');
	model.config({
		appKey : '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8'
	});

	var result = [];
	userIdList.push('*************');

	//	alert(JSON.stringify(userIdList));
	query.createQuery(function(ret, err) {
		if (ret && ret.qid) {
			query.include({
				qid : ret.qid,
				column : 't_user_info'
			});
			query.limit({
            qid:ret.qid,
            value:1000
        });
			query.whereContainAll({
				qid : ret.qid,
				column : 'id',
				value : userIdList
			});
			

			model.findAll({
				class : "user",
				qid : ret.qid
			}, function(ret2, err) {
				if (ret2) {
					
					//alert(JSON.stringify(ret2));
					api.hideProgress();
					for (var i = 0; i < ret2.length; i++) {
						var userInfo = new Object();
						userInfo['id'] = ret2[i].id;
						userInfo['nick_name'] = ret2[i].t_user_info.user_nickname;
						if (ret2[i].t_user_info.user_header)
							userInfo['head'] = ret2[i].t_user_info.user_header;
						else
							userInfo['head'] = '../image/person_head_default.jpg';
						userInfo['signature'] = ret2[i].t_user_info.user_signature;
						userInfo['score'] = ret2[i].t_user_info.user_score;
						userInfo['real_name'] = ret2[i].t_user_info.user_real_name;
						userInfo['sex'] = ret2[i].t_user_info.user_sex;
						userInfo['user_school_date'] = ret2[i].t_user_info.user_school_date;
						result.push(userInfo);
					}
					//					for (var j = 0; j < result.length; j++) {
					//						alert(JSON.stringify(result[j]));
					//					}
					//在这里根据where回调

					func_name(result, obj);

				} else {
					api.hideProgress();
					api.alert({
						msg : "查询用户信息-:" + JSON.stringify(err)
					});
				}
			});
		} else {
			api.hideProgress();
			api.alert({
				msg : "用户信息-创建query:" + JSON.stringify(err)
			});
		}
	});
}

/**add by 小明
 * 向社团通知表里插入若干条消息
 * @param {Object} messageList 带插入的消息数组
 */

function insertNotice(messageList, func_name) {

	var model = api.require('model');
	var query = api.require('query');
	var relation = api.require('relation');
	model.config({
		appKey : '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8'
	});
	var count = 0;

	for (var i = 0; i < messageList.length; i++) {
		//		alert(JSON.stringify(messageList[i]));
		var model = api.require('model');
		model.insert({
			class : 't_society_notice',
			value : {
				notice_type : messageList[i].type,
				notice_status : messageList[i].status,
				notice_content : messageList[i].content,
				notice_sender_id : messageList[i].sender,
				notice_receiver_id : messageList[i].receiver,
				relative_society_id : messageList[i].society,
			}
		}, function(ret, err) {
			if (ret) {
				count++;
				if (count == messageList.length) {
					//回调
					func_name();
				}
			} else {
				api.hideProgress();
				api.alert({
					msg : err.msg
				});
			}
		});
	}
}

/**add by 小明
 * 查询一个组用户的所在的部门和职位
 * @param {Object} userIdList
 * @param {Object} where
 */
function getUserSectionAndPostion(userIdList, where) {

	var model = api.require('model');
	var query = api.require('query');
	var relation = api.require('relation');

	model.config({
		appKey : '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8'
	});

	userIdList.push('***********');
	//	alert(JSON.stringify(userIdList));
	api.showProgress({
		style : 'default',
		animationType : 'fade',
		title : '加载中...',
		text : '先喝口茶...',
		modal : false
	});
	query.createQuery(function(ret, err) {
		if (ret && ret.qid) {
			query.include({
				qid : ret.qid,
				column : 'section_id'
			});
query.limit({
            qid:ret.qid,
            value:1000
        });
			query.whereNotEqual({
				qid : ret.qid,
				column : 'is_deleted',
				value : true
			});

			query.whereContainAll({
				qid : ret.qid,
				column : 'user_id',
				value : userIdList
			});

			model.findAll({
				class : "t_society_member",
				qid : ret.qid,
				limit:200
			}, function(ret2, err) {

				if (ret2) {
					if (where == 'vote_list') {
						showVoteList(ret2);
					}
				} else {
					api.hideProgress();
					api.alert({
						msg : err.msg
					});
				}
			});
		}
	});
}

function closeWin(target) {
	if (target) {
		api.closeToWin({
			name : target,
			animation : {
				type : 'flip',
				subType : 'from_bottom',
				duration : 500
			}
		});
	} else
		api.closeWin({});
}

/**
 * added by zyw
 */

//传递user_id和society_id返回成员在该社团中职位
function get_user_position(user_id, society_id, func_name) {
	var model = api.require('model');
	var query = api.require('query');
	var relation = api.require('relation');

	var result;

	model.config({
		appKey : '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8'
	});

	relation.findAll({
		class : 't_society',
		id : society_id,
		column : 't_society_member'
	}, function(ret, err) {
		//coding...
		// alert( JSON.stringify( ret ) );
		if (ret !== null) {
			for (var i = 0; i < ret.length; i++) {
				if (ret[i].user_id == user_id) {
					result = ret[i];
					break;
				}
			}
			if (result == null) {
				func_name(result);
				return;
			}
			model.findById({
				class : 't_society_section',
				id : result.section_id
			}, function(ret, err) {
				//coding...
				result["section_name"] = ret.section_name;
				func_name(result);
			});
		} else if (ret === null) {
			func_name(ret);
		} else {
			api.alert({
				msg : err.msg
			});
		}
	});
}

//验证用户是否登录
function verify_login(func_name) {
	var model = api.require('model');
	var query = api.require('query');

	model.config({
		appKey : '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8'
	});

	var token = $api.getStorage('token');
	var user_id = $api.getStorage('user_id');

	query.createQuery({}, function(ret, err) {
		//coding...
		if (ret && ret.qid) {
			var query_id = ret.qid;
			var result;
			query.whereEqual({
				qid : query_id,
				column : 'user_id',
				value : user_id
			});
			query.limit({
            qid:query_id,
            value:1000
        });
			model.findAll({
				class : 'accessToken',
				qid : query_id,
				limit:200
			}, function(ret, err) {
				//coding...
				if (token == ret.id) {
					result = true;
					func_name(true);
				} else {
					func_name(false);
				}
			});
		}
	});
}

//判断用户是否在社团中
function is_user_in(user_id, society_id, func_name) {
	var model = api.require('model');
	var relation = api.require('relation');

	model.config({
		appKey : '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8'
	});

	var result = false;

	relation.findAll({
		class : 't_society',
		id : society_id,
		column : 't_society_member'
	}, function(ret, err) {
		//coding...
		// alert( JSON.stringify( ret ) );
		if (ret.length > 0) {
			for (var i = 0; i < ret.length; i++) {
				if (user_id == ret[i].user_id && (ret[i].is_deleted == false)) {
					result = true;

					// alert( result );
					break;
				}
			}
			func_name(result);
		} else if (ret.length == 0) {
			result = false;
			// alert( result );
			func_name(result);
		} else {
			api.alert({
				msg : err.msg
			});
		}
	});
}

//判断用户在社团成员表中状态
function user_member_state(user_id, society_id, func_name) {
	var model = api.require('model');
	var relation = api.require('relation');

	model.config({
		appKey : '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8'
	});

	var result = 0;

	relation.findAll({
		class : 't_society',
		id : society_id,
		column : 't_society_member'
	}, function(ret, err) {
		//coding...
		// alert( JSON.stringify( ret ) );
		if (ret.length > 0) {
			for (var i = 0; i < ret.length; i++) {
				if (user_id == ret[i].user_id && (ret[i].is_deleted == false)) {
					result = 1;

					// alert( result );
					break;
				} else if (user_id == ret[i].user_id && (ret[i].is_deleted == true)) {
					result = ret[i].id;
					break;
				}
			}
			func_name(result);
		} else if (ret.length == 0) {
			result = 0;
			// alert( result );
			func_name(result);
		} else {
			api.alert({
				msg : err.msg
			});
		}
	});
}

//打开个人中心
function open_personal_info(user_id) {
	api.openWin({
		name : 'win_personal_page',
		url : 'win_personal_page.html',
		pageParam : {
			user_id : user_id
		}
	});
}

function add_member_score(user_id, society_id, score) {
	var model = api.require('model');
	var query = api.require('query');

	model.config({
		appKey : '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8'
	});

	query.createQuery({}, function(ret, err) {
		//coding...
		if (ret && ret.qid) {
			var query_id = ret.qid;
			query.whereEqual({
				qid : query_id,
				column : 'society_id',
				value : society_id
			});
			query.limit({
            qid:query_id,
            value:1000
        });

			query.whereEqual({
				qid : query_id,
				column : 'user_id',
				value : user_id
			});

			query.justFields({
				qid : query_id,
				value : ['id', 'society_member_score']
			});

			model.findAll({
				class : 't_society_member',
				qid : query_id,
				limit:200
			}, function(ret, err) {
				//coding...
				if (ret) {
					var score_after = ret[0].society_member_score + score;
					var id = ret[0].id;
					model.updateById({
						class : 't_society_member',
						id : id,
						value : {
							society_member_score : score_after
						}
					}, function(ret, err) {
						//coding...
						if (ret) {

						} else {
							api.alert({
								msg : err.msg
							});

						}
					});
				} else {
					api.alert({
						msg : err.msg
					});
				}
			});
		} else {
			api.alert({
				msg : err.msg
			});
		}
	});

}

/**
 * add by 小明
 * @param {Object} func_name回调的函数名
 * @param {Object} message待发送的消息，JSON对象，内部字段如下：
 * sender_id:发送者ID,一般用$api.getStorage('user_id')取
 * receiver_id:接受者Id，一个或者多个，用逗号隔开
 * title:消息的标题
 * content:消息的内容
 * type:消息类型
 */

function sendMessage(message, func_name) {

	//	alert(message.receiver_id);

	var appId = 'A6982914277502';
	var key = '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8';

	var now = Date.now();
	var appKey = SHA1(appId + "UZ" + key + "UZ" + now) + "." + now;

	api.ajax({
		url : 'https://p.apicloud.com/api/push/message',
		method : 'post',
		timeout : 30,
		method : 'post',
		dataType : 'json',
		returnAll : false,
		headers : {
			"Content-type" : "application/json;charset=UTF-8",
			"X-APICloud-AppId" : appId,
			"X-APICloud-AppKey" : appKey
		},
		data : {
			body : {
				userIds : message.receiver_id,
				platform : 0,
				content : message.title + '#' + message.content + '#' + message.type,
				title : message.title,
				type : 1, //发送的是消息
			},
		}
	}, function(ret1, err) {
		api.hideProgress();
		if (ret1) {
			var urlJson = JSON.stringify(ret1);
			//回调
			if (func_name)
				func_name(message);
		}
	});

}

/**add by 小明
 *填写私信
 * @param {Object} receiver_id 接受者id
 */

function writeMessage(receiver_id) {
	api.prompt({
		buttons : ['确定', '取消'],
		title : '发送私信'
	}, function(ret, err) {
		if (ret.buttonIndex == 1) {

			if ($api.trim(ret.text) == "") {
				api.toast({
					msg : '内容不能为空',
					duration : 1000,
					location : 'bottom'
				});
				return;
			}
			var message = {
				type : 0,
				sender_id : $api.getStorage('user_id'),
				receiver_id : receiver_id,
				content : ret.text,
				title : $api.getStorage('user_real_name')
			};
			insertChatMessage(message, sendMessage);
		}
	});
}

/**
 *向私信表中插入信息
 * @param {Object} message
 */

function insertChatMessage(message, fun_name) {

	//写入私信表
	var model = api.require('model');

	model.config({
		appKey : '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8'
	});

	var model = api.require('model');

	api.showProgress({
		style : 'default',
		animationType : 'fade',
		title : '发送中...',
		text : '客官莫着急...',
		modal : false
	});

	model.insert({
		class : 't_chat_message',
		value : {
			sender_id : message.sender_id,
			receiver_id : message.receiver_id,
			title : message.title,
			status : '0',
			involved_user_id : message.sender_id + ',' + message.receiver_id,
			content : message.content
		}
	}, function(ret3, err) {
		if (ret3) {
			api.hideProgress();
			api.toast({
				msg : '发送成功',
				duration : 1000,
				location : 'bottom'
			});
			api.execScript({
				name : 'index',
				frameName : 'chat',
				script : 'loadingChat(0)'
			});

			fun_name(message);
		} else {
			api.alert({
				msg : '网络错误，请重试'
			})
		}
	});
}

/**
 *add by 小明
 * 注册各种监听器
 */
function bindListener() {
	var push = api.require('push');
	//	alert($api.getStorage('user_id'));

	push.bind({
		userName : $api.getStorage('user_name'),
		userId : $api.getStorage('user_id')
	}, function(ret1, err) {
		if (ret1) {
			push.joinGroup({
				groupName : 'allUser'
			}, function(ret2, err) {
				if (ret2) {
					//api.alert({
					//			msg: ret2.status
					//});
					push.setListener(function(ret3, err) {
						if (ret3) {
							//							alert(JSON.stringify(ret3));
							var data = ret3.data;
							var contents = data[0].split('#');

							if (contents[2] == '0') {

								//聊天信息
								api.execScript({
									name : 'index',
									frameName : 'chat',
									script : 'loadingChat(0)'
								});

								//alert(api.frameName);
								api.execScript({
									name : 'index',
									script : 'showChatActive()'
								});

							} else if (contents[2] == '5' || contents[2] == '8') {
								//提干后重新登录
								api.alert({
									title : '提示',
									msg : contents[1] + ',重新登录后起效',
									buttons : ['确定']
								}, function(ret, err) {
									if (ret.buttonIndex == 1) {
										reLogin();
									}
								});
							} else {
								//在个人中心提示
								if (contents[2] == '17') {
									//评论
									$api.setStorage('unread_comment_count', parseInt($api.getStorage('unread_comment_count')) + 1);
								} else {
									//社团通知
									$api.setStorage('unread_notice_count', parseInt($api.getStorage('unread_notice_count')) + 1);
								}

								api.execScript({
									name : 'index',
									script : 'showUserCenterActive()'

								})

								api.execScript({
									name : 'index',
									frameName : 'userCenter',
									script : 'showNewActive()'

								})
							}

							api.notification({
								vibrate : [300, 500], //震动时间节奏
								sound : 'default', //系统默认提示音
								light : false, //是否亮灯，需设备支持
								notify : {//状态栏通知
									title : contents[0], //通知标题
									content : contents[1], //通知内容
									extra : contents[2]
									//额外的键值对，通知被点击后将通过noticeclicked交给网页
								}
							}, function(ret, err) {
								if (ret) {
									//api.alert(ret.id);//id为通知ID，可用于取消通知
								}
							});
						}
					});

				} else {
					api.alert({
						msg : err.msg
					});
				}
			});

		} else {
			api.alert({
				msg : err.msg
			});
		}
	});

	//监听通知被点击
	api.addEventListener({
		name : 'noticeclicked'
	}, function(ret) {

		//		api.alert({
		//			msg: JSON.stringify(ret)
		//		});

		if (ret) {
			var extra = ret.value;
			switch (extra) {
				case '0':
					{

					}
					break;
				case '1':
					{
						api.openWin({
							name : 'check',
							url : 'win_check_other.html'
						});
					}
					break;
				case '2':
					{
						//类型是投票通知
						api.openWin({
							name : 'win_vote_list',
							url : 'win_vote_list.html',
						});
					}
					break;
				//
				//2015-8-29,Added by lzm,增加提干的点击跳转
				case '4':
				case '5':
				case '6':
				case '7':
				case '8':
					{
						api.openWin({
							name : 'win_personnel_center',
							url : 'win_personnel_center.html'
						});
					}
					break;
				case '9':
					{
					}
					break;
				case '10': {

				}
				case '13':
					//发布新活动，连接到社团活动
					{
						api.closeWin({
							name : 'index'
						});

						api.openWin({
							name : 'index',
							url : '../index.html',
							slidBackEnabled : false,
							pageParam : {
								frameName : 'my_club_activity'
							}
						});
					}
					break;
				case '17':
					//别人评论我
					{
						api.openWin({
							name : "win_personal_comment",
							url : 'win_personal_commet.html'
						});

					}
					break;
			}
		}
	});
}

/**add by 小明
 *转换时间格式
 * @param {Object} date
 */

function changDateFormation(date) {

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

	var result = (new_date.getMonth() + 1) + '月' + new_date.getDate() + '日 ' + new_date.getHours() + ':' + minute;
	//	alert(result);
	return result;
}

function getDateFromString(date) {
	date = date.replace('T', ' ');
	var pos = date.lastIndexOf(':');
	var subStr = date.substring(0, pos);
	str = subStr.replace(/-/g, "/");
	var new_date = new Date(str);

	new_date.setTime(new_date.getTime() + 8 * 60 * 60 * 1000);
	return new_date;
}

/**
 *
 * 判断某个列表中某个元素的id
 * @param {Object} id
 * @param {Object} obj_list
 */

function findIndex(id, obj_list) {
	for (var i = 0; i < obj_list.length; i++) {
		if (id == obj_list[i].id)
			return i;
	}
	return -1;
}

function login(user_name, password) {

	$api.clearStorage();
	//!!! 注意每次登陆会清除所有的localstorage ********************************************
	var model = api.require('model');
	var user = api.require('user');
	var query = api.require('query');

	model.config({
		appKey : '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8'
	});

	//	if( user_name.length != 11 ){
	//		alert("请输入正确格式手机号！");

	//	} else

	if (!password || password == null || typeof (password) == 'undefined') {
		api.alert({
			msg : "密码不能为空!"
		});

	} else if (check_net_status() != null) {
		api.showProgress({
			style : 'default',
			animationType : 'fade',
			title : '努力加载中...',
			text : '先喝杯茶...',
			modal : false
		});
		user.login({
			username : user_name,
			password : password
		}, function(ret, err) {
			//coding...
			if (ret) {
				var user_id = ret.userId;
				model.findById({
					class : 'user',
					id : ret.userId
				}, function(ret, err) {
					//coding...
					if (ret.info_status == false) {
						api.alert({
							msg : "您的信息未完善，请先填写必要信息"
						});
						api.openWin({
							name : 'win_club_school_select',
							url : 'win_club_school_select.html',
							pageParam : {
								user_id : user_id
							}
						});
					} else {

						$api.setStorage('user_id', user_id);
						$api.setStorage('user_name', user_name);

						var en_password = BASE64.encode(password);
						api.setPrefs({
							key : 'password',
							value : en_password
						});

						api.setPrefs({
							key : 'user_name',
							value : user_name
						});

						//绑定监听
						bindListener();
						query.createQuery({}, function(ret, err) {
							//coding...
							if (ret && ret.qid) {
								var query_id = ret.qid;
								query.whereEqual({
									qid : query_id,
									column : 'id',
									value : user_id
								});
								query.limit({
            qid:query_id,
            value:1000
        });

								query.include({
									qid : query_id,
									column : 't_user_info'
								});

								model.findAll({
									class : 'user',
									qid : query_id,
									limit:200
								}, function(ret, err) {
									//coding...
									if (ret) {
										$api.setStorage('user_real_name', ret[0].t_user_info.user_real_name);
										$api.setStorage('user_school', ret[0].t_user_info.user_school);
										$api.setStorage('user_nick_name', ret[0].t_user_info.user_nickname);
										$api.setStorage('user_header', ret[0].t_user_info.user_header);

										query.createQuery({}, function(ret, err) {
											//coding...
											if (ret && ret.qid) {
												var query_id = ret.qid;
												query.whereEqual({
													qid : query_id,
													column : 'user_id',
													value : user_id
												});
												query.limit({
            qid:query_id,
            value:1000
        });

												query.whereNotEqual({
													qid : query_id,
													column : 'is_deleted',
													value : 'true'
												});

												query.justFields({
													qid : query_id,
													value : ['society_id', 'society_member_position', 'society_member_score', 'section_id']
												});

												model.findAll({
													class : 't_society_member',
													qid : query_id,
													limit:200
												}, function(ret1, err) {
													//coding...

													if (ret1 != null && ret1.length != 0) {
														api.getPrefs({
															key : 'last_society_id'
														}, function(ret, err) {
															var last_society_id = ret.value;
															//													alert(last_society_id);
															var index = -1;
															for (var i = 0; i < ret1.length; i++) {
																if (last_society_id == ret1[i].society_id) {
																	index = i;
																	break;
																}
															}
															//													alert(index);
															if (index != -1) {
																//成员还在上次退出应用时候选择的社团中
																$api.setStorage('society_id', ret1[index].society_id);
																$api.setStorage('position', ret1[index].society_member_position);
																$api.setStorage('society_member_score', ret1[index].society_member_score);
																$api.setStorage('section_id', ret1[index].section_id);
															} else {
																api.setPrefs({
																	key : 'last_society_id',
																	value : ret1[0].society_id
																});
																$api.setStorage('society_id', ret1[0].society_id);
																$api.setStorage('position', ret1[0].society_member_position);
																$api.setStorage('society_member_score', ret1[0].society_member_score);
																$api.setStorage('section_id', ret1[0].section_id);
															}

															api.hideProgress();
															api.openWin({
																name : 'index',
																url : '../index.html',
																slidBackEnabled : false
															});

														});
													} else if (ret1 == null || ret1.length == 0) {

														api.toast({
															msg : '你还没有加入任何社团',
															duration : 2000,
															location : 'bottom'
														});

														api.hideProgress();
														api.openWin({
															name : 'index',
															url : '../index.html',
															slidBackEnabled : false
														});
													} else {
														api.alert({
															msg : err.msg
														});
														api.hideProgress();
													}
												});

											} else {
												api.alert({
													msg : err.msg
												});
												api.hideProgress();
											}
										});
									} else {
										api.alert({
											msg : err.msg
										});
										api.hideProgress();
									}
								});
							} else {
								api.alert({
									msg : err.msg
								});

								api.hideProgress();
							}
						});
					}

				});

			} else {
				//2015-9-22,Modified by lzm,根据当前是否有网络进行不同的提示

				/**
				 1.密码或用户名错误，status：401，statusCode:401.
				 2.网络错误：status为0；
				 * */
//				api.alert({
//					msg:err
//				});
				var connectionType = api.connectionType;
				if (connectionType == 'unknown' || connectionType == 'none') {
					api.alert({
						msg : "登录失败,您当前没有网络，请开启后重试~"
						//					msg: "登录失败,用户名或密码错误,失败信息：" + err.msg

					});
				} else {
					if (err.status == '0' || err.statusCode == '0') {
						api.toast({
							msg : "当前网络不通畅，请重试或检查网络。"
							
						});
					} else if (err.statusCode == '401' || err.status == '401') {
						api.alert({
							msg : "用户名或密码错误"
							//					msg: "登录失败,用户名或密码错误,失败信息：" + err.msg
						});

					}

				}

				api.hideProgress();
			}
		});
	} else {
		api.toast({
			msg : '您当前没有连接网络，请检查~',
			location : 'middle'
		});
	}
}

function check_net_status() {
	var connectionType = api.connectionType;
	//2015-9-22,modified by lzm,根据当前网络进行提示
	if (connectionType == 'none')
		return null;
	else
		return connectionType;
}

//验证手机号
function isMobile(phone) {
	return (/^1[3|4|5|7|8][0-9]\d{4,9}$/.test(phone));
}

function seeFullPicture(photo_url) {
	api.openWin({
		name : 'win_see_full_picture',
		url : 'win_see_full_picture.html',
		pageParam : {
			url : photo_url
		}
	});
}

/**
 *重新登录的函数
 */
function reLogin() {
	api.closeWin({
		name : 'index',
	});
	api.openWin({
		name : 'win_club_login',
		url : 'win_club_login.html',
		reload : true
	});
	api.closeWin();
}

function alert(err) {
	api.alert({
		msg : err.msg,
	});
}

var BASE64 = {
	/**
	 * 此变量为编码的key，每个字符的下标相对应于它所代表的编码。
	 */
	enKey : 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
	/**
	 * 此变量为解码的key，是一个数组，BASE64的字符的ASCII值做下标，所对应的就是该字符所代表的编码值。
	 */
	deKey : new Array(-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1),
	/**
	 * 编码
	 */
	encode : function(src) {

		src = 'shetuanbao' + src;
		//用一个数组来存放编码后的字符，效率比用字符串相加高很多。
		var str = new Array();
		var ch1, ch2, ch3;
		var pos = 0;
		//每三个字符进行编码。
		while (pos + 3 <= src.length) {
			ch1 = src.charCodeAt(pos++);
			ch2 = src.charCodeAt(pos++);
			ch3 = src.charCodeAt(pos++);
			str.push(this.enKey.charAt(ch1 >> 2), this.enKey.charAt(((ch1 << 4) + (ch2 >> 4)) & 0x3f));
			str.push(this.enKey.charAt(((ch2 << 2) + (ch3 >> 6)) & 0x3f), this.enKey.charAt(ch3 & 0x3f));
		}
		//给剩下的字符进行编码。
		if (pos < src.length) {
			ch1 = src.charCodeAt(pos++);
			str.push(this.enKey.charAt(ch1 >> 2));
			if (pos < src.length) {
				ch2 = src.charCodeAt(pos);
				str.push(this.enKey.charAt(((ch1 << 4) + (ch2 >> 4)) & 0x3f));
				str.push(this.enKey.charAt(ch2 << 2 & 0x3f), '=');
			} else {
				str.push(this.enKey.charAt(ch1 << 4 & 0x3f), '==');
			}
		}
		//组合各编码后的字符，连成一个字符串。
		return str.join('');
	},
	/**
	 * 解码。
	 */
	decode : function(src) {
		//用一个数组来存放解码后的字符。
		var str = new Array();
		var ch1, ch2, ch3, ch4;
		var pos = 0;
		//过滤非法字符，并去掉'='。
		src = src.replace(/[^A-Za-z0-9\+\/]/g, '');
		//decode the source string in partition of per four characters.
		while (pos + 4 <= src.length) {
			ch1 = this.deKey[src.charCodeAt(pos++)];
			ch2 = this.deKey[src.charCodeAt(pos++)];
			ch3 = this.deKey[src.charCodeAt(pos++)];
			ch4 = this.deKey[src.charCodeAt(pos++)];
			str.push(String.fromCharCode((ch1 << 2 & 0xff) + (ch2 >> 4), (ch2 << 4 & 0xff) + (ch3 >> 2), (ch3 << 6 & 0xff) + ch4));
		}
		//给剩下的字符进行解码。
		if (pos + 1 < src.length) {
			ch1 = this.deKey[src.charCodeAt(pos++)];
			ch2 = this.deKey[src.charCodeAt(pos++)];
			if (pos < src.length) {
				ch3 = this.deKey[src.charCodeAt(pos)];
				str.push(String.fromCharCode((ch1 << 2 & 0xff) + (ch2 >> 4), (ch2 << 4 & 0xff) + (ch3 >> 2)));
			} else {
				str.push(String.fromCharCode((ch1 << 2 & 0xff) + (ch2 >> 4)));
			}
		}
		//组合各解码后的字符，连成一个字符串。
		var result = str.join('');
		return result.substring(10);
	}
}

function alertError(err) {
	api.alert({
		msg : err.msg
	})
}

/**
 *add by 小明
 *  Secure Hash Algorithm (SHA1)
 *  http://www.webtoolkit.info/
 *
 **/

function SHA1(msg) {

	function rotate_left(n, s) {
		var t4 = (n << s) | (n >>> (32 - s));
		return t4;
	};

	function lsb_hex(val) {
		var str = "";
		var i;
		var vh;
		var vl;

		for ( i = 0; i <= 6; i += 2) {
			vh = (val >>> (i * 4 + 4)) & 0x0f;
			vl = (val >>> (i * 4)) & 0x0f;
			str += vh.toString(16) + vl.toString(16);
		}
		return str;
	};

	function cvt_hex(val) {
		var str = "";
		var i;
		var v;

		for ( i = 7; i >= 0; i--) {
			v = (val >>> (i * 4)) & 0x0f;
			str += v.toString(16);
		}
		return str;
	};

	function Utf8Encode(string) {
		string = string.replace(/\r\n/g, "\n");
		var utftext = "";

		for (var n = 0; n < string.length; n++) {

			var c = string.charCodeAt(n);

			if (c < 128) {
				utftext += String.fromCharCode(c);
			} else if ((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			} else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}

		}

		return utftext;
	};

	var blockstart;
	var i, j;
	var W = new Array(80);
	var H0 = 0x67452301;
	var H1 = 0xEFCDAB89;
	var H2 = 0x98BADCFE;
	var H3 = 0x10325476;
	var H4 = 0xC3D2E1F0;
	var A, B, C, D, E;
	var temp;

	msg = Utf8Encode(msg);

	var msg_len = msg.length;

	var word_array = new Array();
	for ( i = 0; i < msg_len - 3; i += 4) {
		j = msg.charCodeAt(i) << 24 | msg.charCodeAt(i + 1) << 16 | msg.charCodeAt(i + 2) << 8 | msg.charCodeAt(i + 3);
		word_array.push(j);
	}

	switch (msg_len % 4) {
		case 0:
			i = 0x080000000;
			break;
		case 1:
			i = msg.charCodeAt(msg_len - 1) << 24 | 0x0800000;
			break;

		case 2:
			i = msg.charCodeAt(msg_len - 2) << 24 | msg.charCodeAt(msg_len - 1) << 16 | 0x08000;
			break;

		case 3:
			i = msg.charCodeAt(msg_len - 3) << 24 | msg.charCodeAt(msg_len - 2) << 16 | msg.charCodeAt(msg_len - 1) << 8 | 0x80;
			break;
	}

	word_array.push(i);

	while ((word_array.length % 16) != 14)
	word_array.push(0);

	word_array.push(msg_len >>> 29);
	word_array.push((msg_len << 3) & 0x0ffffffff);

	for ( blockstart = 0; blockstart < word_array.length; blockstart += 16) {

		for ( i = 0; i < 16; i++)
			W[i] = word_array[blockstart + i];
		for ( i = 16; i <= 79; i++)
			W[i] = rotate_left(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16], 1);

		A = H0;
		B = H1;
		C = H2;
		D = H3;
		E = H4;

		for ( i = 0; i <= 19; i++) {
			temp = (rotate_left(A, 5) + ((B & C) | (~B & D)) + E + W[i] + 0x5A827999) & 0x0ffffffff;
			E = D;
			D = C;
			C = rotate_left(B, 30);
			B = A;
			A = temp;
		}

		for ( i = 20; i <= 39; i++) {
			temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0x6ED9EBA1) & 0x0ffffffff;
			E = D;
			D = C;
			C = rotate_left(B, 30);
			B = A;
			A = temp;
		}

		for ( i = 40; i <= 59; i++) {
			temp = (rotate_left(A, 5) + ((B & C) | (B & D) | (C & D)) + E + W[i] + 0x8F1BBCDC) & 0x0ffffffff;
			E = D;
			D = C;
			C = rotate_left(B, 30);
			B = A;
			A = temp;
		}

		for ( i = 60; i <= 79; i++) {
			temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0xCA62C1D6) & 0x0ffffffff;
			E = D;
			D = C;
			C = rotate_left(B, 30);
			B = A;
			A = temp;
		}

		H0 = (H0 + A) & 0x0ffffffff;
		H1 = (H1 + B) & 0x0ffffffff;
		H2 = (H2 + C) & 0x0ffffffff;
		H3 = (H3 + D) & 0x0ffffffff;
		H4 = (H4 + E) & 0x0ffffffff;

	}

	var temp = cvt_hex(H0) + cvt_hex(H1) + cvt_hex(H2) + cvt_hex(H3) + cvt_hex(H4);

	return temp.toLowerCase();
}