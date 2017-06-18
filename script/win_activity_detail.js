var clubInfo = new Object();
var activity = new Object();
function changDateFormation(date) {
	date = date.replace('T', ' ');
	var pos = date.lastIndexOf(':');
	var subStr = date.substring(pos);
	return date.replace(subStr, '');

}

function getClubInfo(clubID, callback) {

	var model = api.require('model');
	var query = api.require('query');
	model.config({
		appKey : '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8',
		host : "https://d.apicloud.com"
	});
	model.findById({
		class : 't_society',
		id : clubID
	}, function(ret, err) {
		if (ret) {
			if (ret != null) {
				clubInfo = ret;
				callback(ret);
			} else {
				api.alert({
					msg : "社团信息为空"
				});
				api.hideProgress();
			}
		} else {
			api.toast({
				msg : err.msg
			});
			api.hideProgress();
		}
	});
}

function getUserInfo(userID, callback) {
	var model = api.require('model');
	var query = api.require('query');
	//	var relation = api.require('relation');
	model.config({
		appKey : '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8'
	});
	query.createQuery(function(ret, err) {
		if (ret && ret.qid) {
			var queryID = ret.qid;
			query.include({
				qid : queryID,
				column : 't_user_info'
			});
			query.whereEqual({
				qid : queryID,
				column : 'id',
				value : userID
			});
			query.justFields({
				qid : queryID,
				value : ["id", "t_user_info"]
			});
			query.limit({
            qid:queryID,
            value:1000
        });
        model.findAll({
				class : "user",
				qid : ret.qid
			}, function(ret, err) {
				//coding...
				if (ret)
					callback(ret[0]);
			});
		}
	});

}

function getOneActivty(clubID, actID, getActivity) {

	api.showProgress({
		style : 'default',
		animationType : 'fade',
		title : '努力加载...',
		text : '先歇歇吧...',
		modal : false
	});
	var model = api.require('model');
	var relation = api.require('relation');
	model.config({
		appKey : '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8',
		host : "https://d.apicloud.com"
	});
	model.findById({
		class : 't_society_activity',
		id : actID
	}, function(ret, err) {

		//coding...
		if (ret) {
			if (!ret.id) {
				api.toast({
					msg : '该活动社长已删除或不存在'
				});
				api.hideProgress();
			} else if (ret != null) {
				
				activity = ret;
				relation.findAll({
					class : 't_society_activity',
					id : actID,
					column : 't_society_activity_comment'
				}, function(ret, err) {
					//coding...
					if (ret) {
						var commentlist = ret;
						getActivity(clubID, activity, ret)
					}
				});
			} 

		} else if (err) {
			api.alert({
				msg : err.msg
			});
			api.hideProgress();
		}
	});
}

function getActivity(clubID, activity, commentList) {

	//	api.alert({
	//		msg:activity
	//  });
	// api.alert({
	//		msg:commentList
	//  });
	var model = api.require('model');
	var relation = api.require('relation');
	model.config({
		appKey : '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8',
		host : "https://d.apicloud.com"
	});
	relation.findAll({
		class : 't_society_activity',
		id : activity.id,
		column : 't_society_activity_album'
	}, function(ret, err) {
		//coding...
		var album = ret;
		getClubInfo(clubID, function(ret) {
			var clubInfo = ret;
			showActivity(clubInfo, activity, commentList, album);

		});
	});

}

function showActivity(clubInfo, activity, commentList, album) {
	var html = '<div id="scroll">';
	var str = "'";
	var clubID = clubInfo.id;
	html += '<div class="activity_brif ">';
	html += '<div class="topic">' + activity.activity_theme + '</div>';
	html += '<ul class = "activityItem" id="' + activity.id + 'a">';
	html += '<li><span  class="time"><i></i>' + changDateFormation(activity.activity_start_date) + '</span></li>';
	html += '<li><span  class="site"><i></i>' + activity.activity_site + '</span></li>';
	html += '<li><span  class="person_num"><i></i><span>' + activity.activity_person_joined + '/' + activity.activity_person_limited + '</span></span></li>';
	html += '</ul></div>';
	html += '<div class="descrptionAndImg" >';
	html += ' <div class="descrption"> ' + activity.activity_detail + '</div>'
	html += '<div class="images">';
	for (var j = 0; j < album.length; j++) {
		html += '<img src="' + album[j].activity_photo + '">';
	}
	html += '</div></div>';
	html += '<div class="club" tapmode="tap"   onclick="open_club_detail(' + str + clubInfo.id + str + ');"> ';
	html += '<img  id="club_head" src="' + clubInfo.society_badge + '">';
	html += '<div class="font-clubName">' + clubInfo.society_name + '</div>';
	html += '</div>';

	html += '<div class="comnentslist">';

	for (var j = 0; j < commentList.length; j++) {
		html += '<div tapmode="tap_comment" class="commentItem"onclick="publishComment(' + str + commentList[j].comment_publisher_id + str + ',' + str + commentList[j].publisher_name + str + ')">';
		if (commentList[j].comment_receiver_id != '0') {
			html += '<span class="sendUser" onclick="open_personal_info(' + str + commentList[j].comment_publisher_id + str + ')">' + commentList[j].publisher_name + '</span><span>回复</span>';
			html += '<span class="recvUser" onclick="open_personal_info(' + str + commentList[j].comment_receiver_id + str + ')">' + commentList[j].receiver_name + '</span><span class="fengHao">:</span>';
		} else {
			html += '<span class="sendUser" onclick="open_personal_info(' + str + commentList[j].comment_publisher_id + str + ')">' + commentList[j].publisher_name + '</span><span class="fengHao">:</span>';
		}
		html += commentList[j].comment_content;
		html += '</div>';
	}

	html += '</div>';
	html += '<div id ="flag"></div>';
	html += '</div>';
	html += '<div class="publishComment">';
	html += '<input class="inputComment"type="text" placeholder="  输入评论"  id="comment" value="">';
	html += '<div class="send" tapmode="tap_send" onclick="send(' + str + activity.id + str + ')">发送</div>';
	html += '</div>';

	//	alert(html);
	$("#wrap").append(html);
	var flag = api.pageParam.comment;
	if (flag == 1) {
		//		alert(flag);
		location.hash = null;
		location.hash = "#flag";
	}
	api.parseTapmode();
	api.hideProgress();

}

//1表示回复活动,0表示回复别人
var commentActivity = 1;
var publisherID;
var publisherName;
var receiverID;
var receiverName;
function publishComment(recvID, recvName) {
	var userID = $api.getStorage("user_id");
	publisherID = userID;
	receiverID = recvID;
	receiverName = recvName;
	var scroll = $api.byId("wrap");
	var input = $api.dom(scroll, ".inputComment");
	input.focus();
	input.setAttribute("placeholder", "回复" + receiverName);
	var model = api.require('model');
	model.config({
		appKey : '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8',
		host : "https://d.apicloud.com"
	});

	getUserInfo(userID, function(ret) {
		user = ret.t_user_info;
		publisherName = user.user_nickname;

		commentActivity = 0;
	});

}

//还要发消息的。
function send(actID) {
	location.hash = null;
	location.hash = "#flag";
	if ($api.trim($api.dom(".inputComment").value) == '') {
		api.toast({
			msg : "亲，评论不能为空哦"
		});
		return;
	}

	var userID = $api.getStorage("user_id");
	var content = $api.dom(".inputComment").value;

	$api.dom(".inputComment").value = '';
	$api.dom(".inputComment").setAttribute("placeholder", "  输入评论");
	publisherID = userID;

	var model = api.require('model');
	model.config({
		appKey : '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8',
		host : "https://d.apicloud.com"
	});
	getUserInfo(userID, function(ret) {
		//coding...
		if (ret) {
			publisherName = ret.t_user_info.user_nickname;
			var publisherHead = ret.t_user_info.user_header;
			var str = "'";
			var html = '<div class="commentItem" onclick="publishComment(' + str + publisherID + str + ',' + str + publisherName + str + ')">';
			if (commentActivity) {
				receiverID = 0;
				html += '<span class="sendUser" onclick="open_personal_info(' + str + publisherID + str + ')">' + publisherName;
				html += '</span><span class="fengHao">:</span>';

			} else {
				html += '<span class="sendUser" onclick="open_personal_info(' + str + publisherID + str + ')">' + publisherName + '</span><span>回复</span>';
				html += '<span class="recvUser" onclick="open_personal_info(' + str + receiverID + str + ')">' + receiverName + '</span><span class="fengHao">:</span>';
				commentActivity = 1;
			}
			html += content;
			html += '</div>';
			$(".comnentslist").append(html);
			api.parseTapmode();

			//			alert(html);

			var model = api.require('model');
			var relation = api.require('relation');
			model.config({
				appKey : '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8',
				host : "https://d.apicloud.com"
			});
			//			alert(actID);
			if (receiverID) {
				var pushMessage = new Object();
				pushMessage.sender_id = $api.getStorage("user_id");
				pushMessage.receiver_id = receiverID;
				pushMessage.title = publisherName;
				pushMessage.content = content;
				pushMessage.type = 17;
				sendMessage(pushMessage);
			}
			relation.insert({
				class : 't_society_activity',
				id : actID,
				column : 't_society_activity_comment',
				value : {
					comment_publisher_id : publisherID,
					publisher_name : publisherName,
					comment_receiver_id : receiverID,
					receiver_name : receiverName,
					comment_content : content,
					activity_id : actID,
					society_id : clubInfo.id,
					society_name : clubInfo.society_name,
					activity_theme : activity.activity_theme,
					comment_publisher_head : publisherHead,
					status : 0,

				}
			}, function(ret, err) {
				//coding...
				if (ret) {
					//					alert("评论发布了");
					//					api.execScript({
					//						name : 'index',
					//						frameName : 'all_club',
					//						script : 'refresh_bottom();',
					//					});
					//
					//					api.execScript({
					//						name : 'index',
					//						frameName : 'my_club_activity',
					//						script : 'refresh_bottom();',
					//					});
					//					api.execScript({
					//						name : 'activity_list',
					//						frameName : "club_activity_list",
					//						script : 'refresh_bottom();',
					//					});
				}

			});
		}
	});

}

apiready = function() {

	var clubID = api.pageParam.clubID;
	var actID = api.pageParam.actID;
	getOneActivty(clubID, actID, getActivity);
	api.addEventListener({
		name : 'keyback'
	}, function(ret, err) {
		//operation
		api.closeWin({
		});
	});

}
function returnBack() {
	api.closeWin({

	});
}

function dateChangeFormation(date) {
	date = date.replace('T', ' ');
	var pos = date.lastIndexOf(':');
	var subStr = date.substring(pos);
	return date.replace(subStr, '');

}

function getNowDate() {
	var myDate = new Date();
	var year = myDate.getFullYear();
	var month = myDate.getMonth() + 1;
	var day = myDate.getDate();
	var hour = myDate.getHours();
	var minute = myDate.getMinutes();
	return year + '-' + month + '-' + day + ' ' + hour + ':' + minute;

}

function compareDate(date1, date2) {

	date2 = date2.replace(/\-/g, "\/");
	var new_date = new Date(date2);
	new_date.setTime(new_date.getTime() + 8 * 60 * 60 * 1000);
	var a = new Date(date1).getTime();
	var b = new_date.getTime();
	//	alert(a>b);
	return a > b;
}

function addActivityJoin() {
	if (compareDate(getNowDate(), dateChangeFormation(activity.activity_start_date))) {
		api.alert({
			msg : "对不起，该活动已经结束了，感兴趣就去评论吧"
		});
		return;

	}
	var relation = api.require('relation');
	var model = api.require('model');
	var query = api.require('query');
	var userID = $api.getStorage("user_id");
	var actID = activity.id;
	var clubID = clubInfo.id;
	model.config({
		appKey : '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8',
		host : "https://d.apicloud.com"
	});
	api.confirm({
		msg : "您确定要报名该活动吗？",
		buttons : ['确定', '取消']
	}, function(ret, err) {
		//coding...
		if (ret.buttonIndex == 1) {
			api.showProgress({
				style : 'default',
				animationType : 'fade',
				title : '报名中...',
				text : '等等吧...',
				modal : false
			});
			query.createQuery({}, function(ret, err) {
				if (ret && ret.qid) {
					var queryID = ret.qid;
					query.whereEqual({
						qid : queryID,
						column : 'activity_id',
						value : actID
					});
					query.whereEqual({
						qid : queryID,
						column : 'enroll_user_id',
						value : userID
					});
					query.limit({
            qid:queryID,
            value:1000
        });
        model.findAll({
						class : 't_society_activity_enroll',
						qid : queryID
					}, function(ret, err) {
						//coding...
						if (ret.length > 0 && ret) {
							api.toast({
								msg : "您已经报名过该活动了"
							});
							api.hideProgress();
							return;
						} else if (ret.length == 0) {
							get_user_position(userID, clubID, function(ret) {
								var position;
								var section;
								//						api.alert({
								//							msg : ret
								//						})

								if (ret == null) {
									position = "非社员";
									section = "其他";
								} else if (ret != null) {
									position = ret.society_member_position;
									section = ret.section_name;
								} else {
									api.alert({
										msg : "报名失败，请重试"
									}, function(ret, err) {
										//coding...
									});
									api.hideProgress();

									return;
								}

								getUserInfo(userID, function(ret1) {
									//      			   			api.alert({
									//      			   				msg:ret1
									//      			   			});
									if (ret1 == null) {
										api.alert({
											msg : "报名失败，网络慢"
										}, function(ret, err) {
											//coding...
										});
										api.hideProgress();
										return;
									}
									var user = ret1.t_user_info;
									relation.insert({
										class : 't_society_activity',
										id : actID,
										column : 't_society_activity_enroll',
										value : {
											"enroll_user_id" : userID,
											"activity_id" : actID,
											"user_head" : user.user_header,
											"user_name" : user.user_real_name,
											"user_position" : position,
											"user_section" : section,
											"user_sex" : user.user_sex,
											"status" : 0,
											"check_status" : 0,
											"t_society" : clubID
										}
									}, function(ret, err) {
										//coding...
										//							    	api.alert({
										//							    		msg:ret
										//							    	});
										api.toast({
											msg : '报名成功,等待社长同意就可以参加活动了哟!'
										});
										api.hideProgress();
									});
								})
							});

						}
					});
				}
			});
		}
	});

}

function open_club_detail(society_id) {
	//	alert( society_id );
	var user_id = $api.getStorage("user_id");
	is_user_in(user_id, society_id, function(ret) {
		if (ret == true) {
			api.openWin({
				name : 'win_club_detail_active',
				url : 'win_club_detail_active.html',
				pageParam : {
					'society_id' : society_id
				}
			});
		} else {
			api.openWin({
				name : 'win_club_detail_unjoin_active',
				url : 'win_club_detail_unjoin_active.html',
				pageParam : {
					society_id : society_id
				}
			});
		}
	});
}