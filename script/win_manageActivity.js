var activity_list = [];
var showed_activity_join = [];
var joinInfoList = new Object();
function changDateFormation(date) {
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

function manageJoin(clubID, getOneJoinInfo) {
	api.showProgress({
		style : 'default',
		animationType : 'fade',
		title : '活动加载ing...',
		text : '先喝杯茶吧...',
		modal : false
	});
	var model = api.require('model');
	var query = api.require('query');
	var queryID;
	model.config({
		appKey : '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8',
		host : "https://d.apicloud.com"
	});
	query.createQuery({
	}, function(ret, err) {
		//coding...
		if (ret && ret.qid) {
			var queryID = ret.qid;
			query.whereEqual({
				qid : queryID,
				column : 'society_id',
				value : clubID
			});
			query.justFields({
				qid : queryID,
				value : ["id", "activity_theme", "activity_person_limited", "activity_person_joined"]
			});
			query.desc({
				qid : queryID,
				column : 'createdAt'
			});
			query.whereGreaterThanOrEqual({
				qid : queryID,
				column : 'activity_start_date',
				value : getNowDate()
			});
			query.limit({
            qid:queryID,
            value:1000
        });
        model.findAll({
				class : 't_society_activity',
				qid : queryID
			}, function(ret, err) {
				//coding...
				if (ret) {
					if (ret.length > 0) {
						//						api.alert({
						//							msg : ret
						//						}, function(ret, err) {
						//							//coding...
						//						});
						activity_list = ret;
						for (var i = 0; i < ret.length; i++) {
							getOneJoinInfo(ret[i]);
						}

					} else {
						api.alert({
							msg : "亲，没有正在报名的活动,赶快去发一个吧！！"
						});
						//						var html = '<div style="text-align:center;margin-top:50%;padding:3px;font-size:1em ;color:#0000ff;">还没有报名的活动哦！！！</div>';
						//						$api.append($api.byId('managerActivityList'), html);
						api.hideProgress();
					}
				} else
					api.alert({
						msg : err.msg
					});
				api.hideProgress();
			});
		} else {
			api.alert({
				msg : err.msg
			});
			api.hideProgress();
		}
	});
}

function getOneJoinInfo(activity) {
	//	api.alert({
	//		msg:activity
	//  },function(ret,err){
	//  	//coding...
	//  });
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
			//			alert(queryID);
			query.whereEqual({
				qid : queryID,
				column : 'activity_id',
				value : activity.id
			});
			query.desc({
				qid : queryID,
				column : 'createdAt'
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

				//				api.alert({
				//					msg : ret
				//				});
				if (ret.length > 0 && ret) {
					joinInfoList[activity.id] = ret;
					showJoinInfo(activity, ret);
				} else if (ret) {
					showJoinInfo(activity, new Array());
				} else {
					api.alert({
						msg : err.msg
					});
					api.hideProgress();
				}
			});

		}
	});
}

//0是为等待处理处理，1是已同意，2是拒绝
function showJoinInfo(activity, joinInfo) {
	//	alert("showJoinInfo");
	//	var acceptedNum = 0;
	//	for (var j = 0; j < joinInfo.length; j++) {
	//		if (joinInfo[j].status == 1)
	//			acceptedNum++;
	//	}

	var html = '';
	var handling = '<ul class="handlingApply" id ="' + activity.id + '">';
	var handled = '<ul class="handledApply"   id ="' + activity.id + "a" + '">';
	var accepted = '';
	var rejected = '';
	html += '<div id="managerActivityItem" >';
	html += '<div id="theme">';
	html += '<div class="title" onclick="deleteActivity(this,' + "'" + activity.id + "'," + "'" + joinInfo.length + "'" + ');">';
	html += '<span >' + activity.activity_theme + '</span>';
	html += '<span class="person_num" id="' + activity.id + 'x">' + activity.activity_person_joined + '/' + activity.activity_person_limited + '</span>';
	html += '</div><ul class="btn">';
	html += '<li class="accept"  onclick="accept(this,' + "'" + activity.id + "'" + ');">同意</li>';
	html += '<li class="reject" onclick="reject(this,' + "'" + activity.id + "'" + ');">拒绝</li></ul>';
	html += '<div class="clear"></div></div>';
	for (var i = 0; i < joinInfo.length; i++) {
		//		var sex = '';
		//		if (joinInfo[i].user_sex === '男') {
		//			sex += '<img class="sex" src="../image/icon_male_gray.png">';
		//		} else {
		//			sex += '<img class="sex" src="../image/icon_female_gray.png">'
		//		}
		var position = '';
		position += '<span style="color:#f1944e;font-size:0.8em">' + joinInfo[i].user_position + '</span>';

		if (joinInfo[i].status == 0) {
			handling += '<li id="' + joinInfo[i].id + '">';
			handling += '<img tapmode="tap"onclick="open_personal_info(' + "'" + joinInfo[i].enroll_user_id + "'" + ')" class="head" src=' + joinInfo[i].user_head + '>'
			handling += '<div  class="name">' + joinInfo[i].user_name + position + '<br/><span class="set_up_time">' + changDateFormation(joinInfo[i].createdAt) + '</span></div>';
			handling += '<div  class="check"><input name="checkbox" type="checkbox" value="' + joinInfo[i].id + '" checked="checked" /></div>';
			handling += '</li>';
		} else if (joinInfo[i].status == 1) {
			accepted += '<li id="' + joinInfo[i].id + '">';
			accepted += '<img tapmode="tap"onclick="open_personal_info(' + "'" + joinInfo[i].enroll_user_id + "'" + ')" class="head"src=' + joinInfo[i].user_head + '>';
			accepted += '<div  class="name">' + joinInfo[i].user_name + position + '<br/><span class="set_up_time">' + changDateFormation(joinInfo[i].createdAt) + '</span></div>';
			accepted += '<div  class="check"><span class="state1">已同意</span></div>';
			accepted += '</li>';
		} else if (joinInfo[i].status == 2) {
			rejected += '<li id="' + joinInfo[i].id + '">';
			rejected += '<img  tapmode="tap"onclick="open_personal_info(' + "'" + joinInfo[i].enroll_user_id + "'" + ')" class="head"src=' + joinInfo[i].user_head + '>'
			rejected += '<div  class="name">' + joinInfo[i].user_name + position + '<br/><span class="set_up_time">' + changDateFormation(joinInfo[i].createdAt) + '</span></div>';
			rejected += '<div  class="check"><span class="state2">已拒绝</span></div>';
			rejected += '</li>';
		}
	}
	handling += '</ul>';
	handled += accepted;
	handled += rejected;
	handled += '</ul>';
	html += handling + handled + '</div>';
	//		alert(html);
	$api.append($api.byId('managerActivityList'), html);
	api.parseTapmode();
	api.hideProgress();
}

function deleteActivity(obj, id, length) {
	
	if ( length != 0) {
		api.alert({
			msg : "已经有人报名参加活动了，不能删除哦 ！ ！"
		});
		return;
	}
	var model = api.require('model');
	model.config({
		appKey : '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8',
		host : "https://d.apicloud.com"
	});
	api.confirm({
		msg : "您确定要删除该活动吗？",
		buttons : ['确定', '取消']
	}, function(ret, err) {
		if (ret.buttonIndex == 1) {
			model.deleteById({
				class : 't_society_activity',
				id : id
			}, function(ret, err) {
				//coding...
				if (ret) {
					api.toast({
	                    msg:'删除成功'
                    });
                    obj.parentNode.parentNode.className = "hidden";
				}
			});
		}
	});
}

//活动同意和拒绝的人数的相加还是有bug的
function accept(obj, actID) {
	var flag = 0;
	var joinIDList = [];
	var handling = $api.byId(actID);
	var id = "li div [type=checkbox]";
	var Gbox = handling.querySelectorAll(id);
	for (var i = 0; i < Gbox.length; i++) {
		if (Gbox[i].checked) {
			//      		alert(obj[i].value);
			//			joinIDList.push(Gbox[i].value);
			//			Gbox[i].checked = 0;
			//			$api.byId(Gbox[i].value).className = "hidden";
			flag = 1;
			break;
		}
	}
	if (flag == 0) {
		api.toast({
			msg : '您没有选中任何人'
		});
		return;
	}

	var accepted = '';
	var model = api.require('model');
	model.config({
		appKey : '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8',
		host : "https://d.apicloud.com"
	});
	api.confirm({
		msg : "您确定要同意选中的人参加活动吗？",
		buttons : ['确定', '取消']
	}, function(ret, err) {
		if (ret.buttonIndex == 1) {
			//			alert(actID);
			for (var i = 0; i < Gbox.length; i++) {
				if (Gbox[i].checked) {
					//      		alert(obj[i].value);
					joinIDList.push(Gbox[i].value);
					Gbox[i].checked = 0;
					$api.byId(Gbox[i].value).className = "hidden";
					flag = 1;
				}
			}
			//      api.alert({msg:joinIDList});
			var joined = 0;
			var activity;
			for (var j = 0; j < activity_list.length; j++) {
				if (activity_list[j].id == actID) {
					joined = activity_list[j].activity_person_joined;
					activity = activity_list[j];
					break;
				}
			}
			//			alert(joined);
			joined += joinIDList.length;
			var messageList = [];

			for (var n = 0; n < joinIDList.length; n++) {
				model.updateById({
					class : 't_society_activity_enroll',
					id : joinIDList[n],
					value : {
						status : 1
					}

				}, function(ret, err) {
					//coding...
					if (err) {
						api.alert({
							msg : err.msg
						});
					}
				});

			}
			var join = joinInfoList[actID];
			for (var n = 0; n < join.length; n++) {
				if (joinIDList.indexOf(join[n].id) < 0) {
					continue;
				}
				messageList[n] = new Object();
				var pushMessage = new Object();
				messageList[n].type = 15;
				messageList[n].status = 0;
				messageList[n].content = activity.activity_theme + "社长同意你的报名，准备签到参加活动吧";
				messageList[n].sender = $api.getStorage("user_id");
				messageList[n].receiver = join[n].enroll_user_id;
				messageList[n].transaction_id = actID
				messageList[n].society = $api.getStorage("society_id");

				pushMessage.sender_id = $api.getStorage("user_id");
				pushMessage.receiver_id = join[n].enroll_user_id;
				pushMessage.title = activity.activity_theme;
				pushMessage.content = "社长同意你的报名，准备签到参加活动吧";
				pushMessage.type = 15;
				sendMessage(pushMessage);
			}
			insertMyNotice(messageList);

			var personNum = $api.byId(actID + "x");
			model.updateById({
				class : 't_society_activity',
				id : actID,
				value : {
					"activity_person_joined" : joined
				}
			}, function(ret, err) {
				//coding...
				if (ret) {
					$api.html(personNum, '<span class="person_num" id="' + activity.id + 'x">' + joined + '/' + activity.activity_person_limited + '</span>');
				}
			});
			var joinInfo = joinInfoList[actID];
			//			api.alert({
			//				msg:joinInfo
			//			});
			for (var j = 0; j < joinInfo.length; j++) {
				if (joinIDList.indexOf(joinInfo[j].id) >= 0) {
					//					var sex = '';
					//					if (joinInfo[j].user_sex === '男') {
					//						sex += '<img class="sex" src="../image/icon_male_gray.png">';
					//					} else {
					//						sex += '<img class="sex" src="../image/icon_female_gray.png">'
					//					}
					var position = '';
					//					if (joinInfo[j].user_position == '社员' || joinInfo[j].user_position == '非社员') {
					//						position += joinInfo[j].user_position;
					//					} else {}
					position += '<span style="color:#f1944e;font-size:0.8em">' + joinInfo[j].user_position + '</span>';

					accepted += '<li id="' + joinInfo[j].id + '">';
					accepted += '<img tapmode="tap"onclick="open_personal_info(' + "'" + joinInfo[j].enroll_user_id + "'" + ')"  class="head"src=' + joinInfo[j].user_head + '>'
					accepted += '<div  class="name">' + joinInfo[j].user_name + position + '<br/><span class="set_up_time">' + changDateFormation(joinInfo[j].createdAt) + '</span></div>';
					accepted += '<div  class="check"><span class="state1">已同意</span></div>';
					accepted += '</li>';
				}
			}
			handled = $api.byId(actID + "a");
			$api.prepend(handled, accepted);
			api.hideProgress();

		}
	});
}

function reject(obj, actID) {
	var flag = 0;
	var joinIDList = [];
	var accepted = '';
	var handling = $api.byId(actID);
	var id = "li div [type=checkbox]";
	var Gbox = handling.querySelectorAll(id);
	for (var i = 0; i < Gbox.length; i++) {
		if (Gbox[i].checked) {
			//      		alert(obj[i].value);
			//			joinIDList.push(Gbox[i].value);
			//			Gbox[i].checked = 0;
			//			$api.byId(Gbox[i].value).className = "hidden";
			flag = 1;
			break;
		}
	}
	if (flag == 0) {
		api.toast({
			msg : '您没有选中任何人'
		});
		return;
	}
	var model = api.require('model');
	model.config({
		appKey : '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8',
		host : "https://d.apicloud.com"
	});
	api.confirm({
		msg : "您确定要拒绝选中的人参加活动吗？",
		buttons : ['确定', '取消']
	}, function(ret, err) {
		if (ret.buttonIndex == 1) {
			var handling = $api.byId(actID);
			var id = "li div [type=checkbox]";
			var Gbox = handling.querySelectorAll(id);
			for (var i = 0; i < Gbox.length; i++) {
				if (Gbox[i].checked) {
					//      		alert(obj[i].value);
					joinIDList.push(Gbox[i].value);
					Gbox[i].checked = 0;
					$api.byId(Gbox[i].value).className = "hidden";
				}
			}
			//      api.alert({msg:joinIDList});
			var activity;
			for (var j = 0; j < activity_list.length; j++) {
				if (activity_list[j].id == actID) {
					activity = activity_list[j];
					break;
				}
			}
			var messageList = [];
			for (var n = 0; n < joinIDList.length; n++) {
				model.updateById({
					class : 't_society_activity_enroll',
					id : joinIDList[n],
					value : {
						status : 2
					}

				}, function(ret, err) {
					//coding...
					if (err) {
						api.alert({
							msg : err.msg
						});
					}
				});

			}
			var join = joinInfoList[actID];
			for (var n = 0; n < join.length; n++) {
				if (joinIDList.indexOf(join[n].id) < 0) {
					continue;
				}
				messageList[n] = new Object();
				pushMessage = new Object();
				messageList[n].type = 16;
				messageList[n].status = 0;
				messageList[n].content = activity.activity_theme + "社长拒绝了你的报名，下次还有机会哦";
				messageList[n].sender = $api.getStorage("user_id");
				messageList[n].receiver = join[n].enroll_user_id;
				messageList[n].transaction_id = actID
				messageList[n].society = $api.getStorage("society_id");

				pushMessage.sender_id = $api.getStorage("user_id");
				pushMessage.receiver_id = join[n].enroll_user_id;
				pushMessage.title = activity.activity_theme;
				pushMessage.content = "社长拒绝了你的报名，下次还有机会哦";
				pushMessage.type = 16;
				sendMessage(pushMessage);

			}
			insertMyNotice(messageList);
			var joinInfo = joinInfoList[actID];
			for (var j = 0; j < joinInfo.length; j++) {
				if (joinIDList.indexOf(joinInfo[j].id) >= 0) {
					//					var sex = '';
					//					if (joinInfo[j].user_sex === '男') {
					//						sex += '<img class="sex" src="../image/icon_male_gray.png">';
					//					} else {
					//						sex += '<img class="sex" src="../image/icon_female_gray.png">'
					//					}
					var position = '';
					//					if (joinInfo[j].user_position == '社员' || joinInfo[j].user_position == '非社员') {
					//						position += joinInfo[j].user_position;
					//					} else {}
					position += '<span style="color:#f1944e;font-size:0.8em">' + joinInfo[j].user_position + '</span>';

					accepted += '<li id="' + joinInfo[j].id + '">';
					accepted += '<img tapmode="tap"onclick="open_personal_info(' + "'" + joinInfo[j].enroll_user_id + "'" + ')"  class="head"src=' + joinInfo[j].user_head + '>'
					accepted += '<div  class="name">' + joinInfo[j].user_name + position + '<br/><span class="set_up_time">' + changDateFormation(joinInfo[j].createdAt) + '</span></div>';
					accepted += '<div  class="check"><span class="state2">已拒绝</span></div>';
					accepted += '</li>';
				}
			}
			$api.append($api.byId(actID + "a"), accepted);
			api.hideProgress();
		}
	});
}

apiready = function() {
	var clubID = $api.getStorage("society_id");
	;
	manageJoin(clubID, getOneJoinInfo);
}
function returnBack() {

	api.closeWin({
		name : "",

	});

}

function openPublishActivity() {
	api.openWin({
		name : 'activityDetail',
		url : 'win_publishActivity.html'
		//			    pageParam: {name: 'test'}
	});
}

function addNewActivity(activity_theme, person_limited,id) {
	//	alert(activity_theme);
	//	alert(person_limited);
	var html = '';
	html += '<div id="managerActivityItem">';
	html += '<div id="theme">';
	html += '<div class="title"onclick="deleteActivity(this,' + "'" + id + "'," + "'0'" + ');">';
	html += '<span >' + activity_theme + '</span>';
	html += '<span class="person_num" >0/' + person_limited + '</span>';
	html += '</div><ul class="btn">';
	html += '<li class="accept"  onclick="acceptExc();">同意</li>';
	html += '<li class="reject" onclick="rejectExc();">拒绝</li></ul>';
	html += '<div class="clear"></div></div>';
	html += '<div>';
	$api.prepend($api.byId('managerActivityList'), html);
}

function acceptExc() {
	api.toast({
		msg : "该活动还没有报名信息哦"
	});

}

function rejectExc() {
	api.toast({
		msg : "该活动还没有报名信息哦"
	});
}
