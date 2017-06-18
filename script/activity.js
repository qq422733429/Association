var activity_list = [];
var activity_IDSet = [];
//键是活动的ID，存储是否被赞，参加活动，赞的人数，评论数，参加活动的人数。
var activity_map = new Object();

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
			callback(ret);
		} else
			api.toast({
				msg : '社团信息查询失败:' + JSON.Stringify(err)
			});
	});
}

//活动的获取每次应该是一页
function get_club_activities(loadMore, userID, clubID, getActivities) {
	api.showProgress({
		style : 'default',
		animationType : 'fade',
		title : '努力加载中...',
		text : '先喝杯茶吧...',
		modal : false
	});
	is_user_in(userID, clubID, function(result) {
		var model = api.require('model');
		var query = api.require('query');
		model.config({
			appKey : '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8',
			host : "https://d.apicloud.com"
		});
		query.createQuery({
		}, function(ret, err) {
			//coding...
			if (ret && ret.qid) {
				var queryID = ret.qid;
				query.limit({
					qid : queryID,
					value : 5
				});

				query.desc({
					qid : queryID,
					column : 'createdAt'
				});
				query.whereEqual({
					qid : queryID,
					column : 'society_id',
					value : clubID
				});
				//				query.whereGreaterThanOrEqual({
				//					qid : queryID,
				//					column : 'activity_start_date',
				//					value : getNowDate()
				//				});
				if (loadMore == 1 && activity_list.length > 0) {
					//					alert(activity_list[activity_list.length-1].createdAt);
					query.whereLessThan({
						qid : queryID,
						column : 'createdAt',
						value : activity_list[activity_list.length - 1].createdAt
					});

				}
				if (loadMore == 0 && activity_list.length > 0) {
					//					alert(activity_list[activity_list.length-1].createdAt);
					query.whereGreaterThanOrEqual({
						qid : queryID,
						column : 'createdAt',
						value : activity_list[0].createdAt
					});
					
				}
				
				if (result == false) {
					//					alert(0);

					query.whereEqual({
						qid : queryID,
						column : 'activity_public',
						value : true
					});
				}
				//改善，这里需要首先查一下是否有更新的，节省流量。
				model.findAll({
					class : 't_society_activity',
					qid : queryID
				}, function(ret, err) {
					//				 if(ret){
					if (ret) {
						//					api.alert({
						//						msg:ret
						//					});
						if (loadMore == 1 && ret.length > 0) {
							load_more(clubID, ret);
						} else if (loadMore == 0 && ret.length > 0)//应该与activity_list[0]比较生成的时间比较活动的时间
							getActivities(clubID, ret);
						else {
							api.toast({
								msg : '没有活动了'
							});
							if (loadMore == 0) {
								act_bottom(activity_list);
							}
							api.hideProgress();
							return;
						}

					} else {
						if (err.status == 0) {
							api.toast({
								msg : '没有更多活动了哦'
							});
						} else {
							//							api.alert({
							//								msg : err.msg
							//							});
						}
						api.hideProgress();
					}

				});

			} else {
				if (err.status == 0) {
					api.toast({
						msg : '没有更多活动了哦'
					});
				} else {
					//					api.alert({
					//						msg : err.msg
					//					});
				}

				api.hideProgress();
			}
		});
	});
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

function getActivities(clubID, activityList) {

	var preLength = activity_list.length;
	if (activity_list.length === 0) {
		activity_list = activityList;
		//   	alert(activity_list);
		for (var i = 0; i < activity_list.length; i++) {
			activity_IDSet.push(activity_list[i].id);

			//   		activity_list[i].activity_start_date = changDateFormation(activity_list[i].activity_start_date);
		}
	} else {
		for (var j = 0; j < activityList.length; j++) {
			if (activity_IDSet.indexOf(activityList[j].id) < 0) {
				activity_IDSet.push(activityList[j].id);
				//   			activityList[j].activity_start_date = changDateFormation(activityList[j].activity_start_date);
				activity_list.unshift(activityList[j]);
			} else {
				break;
			}

		}

	}
	//社团信息应该本地存起来
	if (preLength === activity_list.length) {
		api.hideProgress();
		return;
	}
	getClubInfo(clubID, function(ret) {
		var clubInfo = ret;
		//		alert(activity_list);
		showActivities(0, preLength, activity_list, clubInfo);
	});

}

function load_more(clubID, activityList) {

	for (var i = 0; i < activityList.length; i++) {
		activity_list.push(activityList[i]);
		activity_IDSet.push(activity_list[i].id);

	}

	getClubInfo(clubID, function(ret) {

		var clubInfo = ret;
		//		alert(activity_list);
		showActivities(1, 0, activityList, clubInfo)

	});

}

function showActivities(loadMore, preLength, activityList, clubInfo) {

	var html = '';
	var end = activityList.length - preLength;
	var userID = $api.getStorage("user_id");

	var clubID = clubInfo.id;
	var str = "'";
	for (var i = 0; i < end; i++) {
		html += '<div id="activity" >';
		html += '<div class="topic">' + activityList[i].activity_theme + '</div>';
		html += '<ul class = "activityItem" id="' + activityList[i].id + 'a" tapmode="tap" onclick="open_activityDetail(0,' + str + clubID + str + ',' + str + activityList[i].id + str + ');">';
		html += '<li><span class="club_name"><i></i>' + clubInfo.society_name + '</span></li>';
		html += '<li><span  class="time"><i></i>' + changDateFormation(activityList[i].activity_start_date) + '</span></li>';
		html += '<li><span  class="site"><i></i>' + activityList[i].activity_site + '</span></li>';
		html += '<li><span  class="person_num"><i></i><span>' + activityList[i].activity_person_joined + '/' + activityList[i].activity_person_limited + '</span></span></li>';
		html += '</ul>';
		html += '<ul class="bottom" id="' + activityList[i].id + '">';
		html += '<li ><a tapmode="active"onclick="addLike(' + 'this' + ',' + str + activityList[i].id + str + "," + str + clubID + str + ');" class="like"><i></i><span >' + 0 + ' </span></a></li>';
		html += '<li><a tapmode="active" onclick="addJoin(' + 'this' + ',' + str + activityList[i].id + str + ',' + str + clubID + str + ');" class="join"><i></i> <span >' + 0 + '</span></a></li>';
		html += '<li><a tapmode="active" onclick="share(' + str + activityList[i].id + str + ',' + str + clubInfo.society_name + str + ',' + str + activityList[i].activity_theme + str + ');" class="comment"><i></i> <span >' + activityList[i].share_count + '</span></a></li>';
		html += '</ul>';
		html += '</div>';

	}
	//	alert(html);
	if (loadMore) {
		$("#act").append(html);
	} else
		$("#act").prepend(html);
	act_bottom(activityList);
	api.parseTapmode();
	api.hideProgress();

}

function refresh_bottom() {
	//	api.alert({
	//		msg:activity_list
	//	});
	var relation = api.require('relation');
	var model = api.require('model');
	var query = api.require('query');
	var userID = $api.getStorage("user_id");
	model.config({
		appKey : '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8',
		host : "https://d.apicloud.com"
	});
	for (var i = 0; i < activity_list.length; i++) {

		model.findById({
			class : 't_society_activity',
			id : activity_list[i].id
		}, function(ret, err) {
			//coding...
			if (ret) {
				//				api.alert({
				//					msg : ret.activity_person_joined + '/' + ret.activity_person_limited
				//				});
				var id = ret.id + 'a';
				var el = $api.byId(id);
				//				el.className = "hidden";
				var person_num = $api.dom(el, ".person_num");

				$(person_num).children("span").text(ret.activity_person_joined + '/' + ret.activity_person_limited);

				var el = $api.byId(ret.id);
				var comment = $api.dom(el, ".comment");
				$(comment).children("span").text(ret.share_count);
				if (ret.share_count != '0') {
					comment.className = "comment light";
				}
			}
		});
		relation.findAll({
			class : 't_society_activity',
			id : activity_list[i].id,
			column : 't_society_activity_enroll'
		}, function(ret, err) {
			//coding...
			if (err) {
				//				api.alert({
				//					msg : err
				//				});
			}
			if (ret.length > 0) {

				var id = ret[0].activity_id;
				var el = $api.byId(id);
				var join = $api.dom(el, ".join");
				$(join).children("span").text(ret.length);
				for (var j = 0; j < ret.length; j++) {
					if (ret[j].enroll_user_id == userID) {
						join.className = "join light";
						break;
					}
				}

			}

		});
		relation.findAll({
			class : 't_society_activity',
			id : activity_list[i].id,
			column : 't_society_activity_like'
		}, function(ret, err) {
			//coding...
			if (err) {
				//				api.alert({
				//					msg : err.msg
				//				});
			}
			if (ret.length > 0) {
				var id = ret[0].activity_id;
				var el = $api.byId(id);
				var like = $api.dom(el, ".like");
				$(like).children("span").text(ret.length);
				for (var j = 0; j < ret.length; j++) {
					if (ret[j].like_user_id == userID) {
						like.className = "like light";
						break;
					}
				}

			}
		});
		//		relation.findAll({
		//			class : 't_society_activity',
		//			id : activity_list[i].id,
		//			column : 't_society_activity_comment'
		//		}, function(ret, err) {
		//			//coding...
		//			if (err) {
		//				api.alert({
		//					msg : err.msg
		//				});
		//			}
		//			if (ret.length > 0) {
		//
		//				var id = ret[0].activity_id;
		//				var el = $api.byId(id);
		//				var comment = $api.dom(el, ".comment");
		//				$(comment).children("span").text(ret.length);
		//				for (var j = 0; j < ret.length; j++) {
		//					if (ret[j].comment_publisher_id == userID || ret[j].comment_receiver_id == userID) {
		//						comment.className = "comment light";
		//						break;
		//					}
		//				}
		//
		//			}
		//		});

	}

}

function act_bottom(activity_list) {
	//	api.alert({
	//		msg : activity_list
	//	}, function(ret, err) {
	//		//coding...
	//	});
	var relation = api.require('relation');
	var model = api.require('model');
	var userID = $api.getStorage("user_id");
	model.config({
		appKey : '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8',
		host : "https://d.apicloud.com"
	});

	for (var i = 0; i < activity_list.length; i++) {
		var id = activity_list[i].id;
		var el = $api.byId(id);
		var comment = $api.dom(el, ".comment");
		if (activity_list[i].share_count != '0') {
			comment.className = "comment light";
		}

		relation.findAll({
			class : 't_society_activity',
			id : activity_list[i].id,
			column : 't_society_activity_like'
		}, function(ret, err) {
			//coding...
			if (err) {
				//				api.alert({
				//					msg : err.msg
				//				});
			}
			if (ret.length > 0) {
				var id = ret[0].activity_id;
				var el = $api.byId(id);
				var like = $api.dom(el, ".like");
				$(like).children("span").text(ret.length);
				for (var j = 0; j < ret.length; j++) {
					if (ret[j].like_user_id == userID) {
						like.className = "like light";
						break;
					}
				}

			}
		});
		relation.findAll({
			class : 't_society_activity',
			id : activity_list[i].id,
			column : 't_society_activity_enroll'
		}, function(ret, err) {
			//coding...
			if (err) {
				//				api.alert({
				//					msg : err.msg
				//				});
			}
			if (ret.length > 0) {

				var id = ret[0].activity_id;
				var el = $api.byId(id);
				var join = $api.dom(el, ".join");
				$(join).children("span").text(ret.length);
				for (var j = 0; j < ret.length; j++) {
					if (ret[j].enroll_user_id == userID) {
						join.className = "join light";
						break;
					}
				}

			}

		});
		//		relation.findAll({
		//			class : 't_society_activity',
		//			id : activity_list[i].id,
		//			column : 't_society_activity_comment'
		//		}, function(ret, err) {
		//			//coding...
		//			if (err) {
		//				api.alert({
		//					msg : err.msg
		//				});
		//			}
		//			if (ret.length > 0) {
		//
		//				var id = ret[0].activity_id;
		//				var el = $api.byId(id);
		//				var comment = $api.dom(el, ".comment");
		//				$(comment).children("span").text(ret.length);
		//				for (var j = 0; j < ret.length; j++) {
		//					if (ret[j].comment_publisher_id == userID || ret[j].comment_receiver_id == userID) {
		//						comment.className = "comment light";
		//						break;
		//					}
		//				}
		//
		//			}
		//		});

	}

}

//插入的时候应该查询是否存在，存在就不能往里面插入了。
function addLike(obj, actID) {

	var relation = api.require('relation');
	var model = api.require('model');
	var query = api.require('query');
	//	var userID = "55bae837f17c2fa50c938598";
	var userID = $api.getStorage("user_id");
	var flag = 1;
	model.config({
		appKey : '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8',
		host : "https://d.apicloud.com"
	});
	var n = $(obj).children("span").text();
	if ($api.hasCls(obj, "light")) {
		$api.removeCls(obj, "light");
		n--;
		$(obj).children("span").text(n);
		flag = 0;
	} else {

		obj.className = "like light";
		n++;
		$(obj).children("span").text(n);
	}
	query.createQuery({}, function(ret, err) {
		if (ret && ret.qid) {
			var queryID = ret.qid;
			query.whereEqual({
				qid : queryID,
				column : 'activity_id',
				value : actID
			});
			query.limit({
            qid:queryID,
            value:1000
        });
			query.whereEqual({
				qid : queryID,
				column : 'like_user_id',
				value : userID
			});
			model.findAll({
				class : 't_society_activity_like',
				qid : queryID
			}, function(ret, err) {
				//coding...
				if (flag == 0 && ret.length > 0) {
					model.deleteById({
						class : 't_society_activity_like',
						id : ret[0].id,

					}, function(ret, err) {
						//coding...
					});
				} else if (flag == 1 && ret.length == 0) {
					relation.insert({
						class : 't_society_activity',
						id : actID,
						column : 't_society_activity_like',
						value : {
							"like_user_id" : userID,
							"activity_id" : actID
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

function upadateShare(act_id) {
	var model = api.require('model');
	model.config({
		appKey : '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8'
	});
	model.findById({
		class : 't_society_activity',
		id : act_id
	}, function(ret, err) {
		if (ret) {
			var count = 1 + parseInt(ret.share_count);
			model.updateById({
				class : 't_society_activity',
				id : act_id,
				value : {
					share_count : count
				}
			}, function(ret, err) {
				//coding...
				var el = $api.byId(act_id);
				var comment = $api.dom(el, ".comment");
				$(comment).children("span").text(ret.share_count);
				comment.className = "comment light";
			});
		}
	});
}

function share(act_id, clubName, actTheme) {

	var wx = api.require('wx');
	wx.shareWebpage({
		apiKey : '',
		scene : 'timeline',
		title : '我报名参加了圈R的活动，加入圈R和我一起玩吧!!!',
		description : '',
		thumb : 'widget:image/quanr1.png',
		contentUrl : 'http://www.520qqsj.com/quanrLoad/app.html'
	}, function(ret, err) {
		if (ret.status) {
			api.toast({
				msg : '分享成功'
			});
			upadateShare(act_id);

		} else {
			switch(err.code) {
				case '-1':
					api.toast({
						msg : "未知错误"
					});
					break;
				case '1':
					api.alert({
						msg : "appkey 非法"
					});
					break;
				case '2':
					api.toast({
						msg : "您取消了分享"
					});
					break;
				case '3':
					api.alert({
						msg : "发送失败，请重试"
					});
					break;
				case '4':
					api.alert({
						msg : "授权拒绝"
					});

					break;
				case '5':
					api.alert({
						msg : "微信服务器返回未知名错误。"
					});
					break;
				case '6':
					api.alert({
						msg : "当前设备未安装微信客户端"
					});
					break;
				case '7':
					api.alert({
						msg : "注册sdk失败"
					});
					break;

			}
		}
	});

}

function open_activityDetail(comment, clubID, actID) {
	api.openWin({
		name : 'activityDetail',
		url : 'win_activity_detail.html',
		pageParam : {
			"clubID" : clubID,
			"actID" : actID,
			"comment" : comment,

		}
		//			    pageParam: {name: 'test'}
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
			query.limit({
            qid:queryID,
            value:1000
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
			model.findAll({
				class : "user",
				qid : ret.qid
			}, function(ret, err) {
				//coding...
				if (ret)
					callback(ret[0]);
				else {
					//					api.alert({
					//						msg : err.msg
					//					});
				}
			});
		}
	});

}

function dateChangeFormation(date) {
	date = date.replace('T', ' ');
	var pos = date.lastIndexOf(':');
	var subStr = date.substring(pos);
	return date.replace(subStr, '');

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

function addJoin(obj, actID, clubID) {

	for (var m = 0; m < activity_list.length; m++) {
		if (activity_list[m].id == actID)
			if (compareDate(getNowDate(), dateChangeFormation(activity_list[m].activity_start_date))) {
				api.alert({
					msg : "对不起，该活动已结束了，感兴趣就去评论吧"
				});
				return;

			}
	}
	var relation = api.require('relation');
	var model = api.require('model');
	var query = api.require('query');
	//	var userID = "55bae837f17c2fa50c938598";
	//	var clubID = "55b2407f51ffb4040689a636";
	//	var clubID = $api.getStorage("society_id");
	var userID = $api.getStorage("user_id");
	model.config({
		appKey : '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8',
		host : "https://d.apicloud.com"
	});

	if ($api.hasCls(obj, "light")) {
		api.toast({
			msg : "您已经报名该活动"
		});
		return;
	}

	api.confirm({
		msg : "您确定要报名该活动吗？",
		buttons : ['确定', '取消']
	}, function(ret, err) {
		//coding...n
		if (ret.buttonIndex == 1) {
			obj.className = "join light";
			var n = $(obj).children("span").text();
			n++;
			$(obj).children("span").text(n);
			api.showProgress({
				style : 'default',
				animationType : 'fade',
				title : '报名中...',
				text : '歇歇吧...',
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
					query.limit({
            qid:queryID,
            value:1000
        });
					query.whereEqual({
						qid : queryID,
						column : 'enroll_user_id',
						value : userID
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
									$api.removeCls(obj, "light");
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
										$api.removeCls(obj, "light");
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

function returnBack() {

	api.closeWin({
		name : "",
		animation : {
			type : 'flip',
			subType : 'from_bottom',
			duration : 500
		}
	});
}

