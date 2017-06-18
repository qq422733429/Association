var activity_list = [];
function getNowDate() {
	var myDate = new Date();
	var year = myDate.getFullYear();
	var month = myDate.getMonth() + 1;
	var day = myDate.getDate();
	var hour = myDate.getHours();
	var minute = myDate.getMinutes();
	return year + '-' + month + '-' + day + ' ' + hour + ':' + minute;
}

function dateChangeFormation(date) {
	date = date.replace('T', ' ');
	var pos = date.lastIndexOf(':');
	var subStr = date.substring(pos);
	return date.replace(subStr, '');

}

function compareDate(date1, date2) {
	
	date1 = date1.replace(/\-/g, "\/");
	date2 = date2.replace(/\-/g, "\/");
	var new_date = new Date(date2);
	new_date.setTime(new_date.getTime() + 8 * 60 * 60 * 1000);
	var a = new Date(date1).getTime();
	var b = new_date.getTime();
//	a>b ? api.alert({msg:1}):api.alert({msg:0});
	return a>b;
}

function getActivityTheme(clubID) {

	var model = api.require('model');
	var query = api.require('query');
	model.config({
		appKey : '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8',
		host : "https://d.apicloud.com"
	});
	api.showProgress({
		style : 'default',
		animationType : 'fade',
		title : '加载中...',
		text : '先喝杯茶吧...',
		modal : false
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
			if (activity_list.length > 0) {
//				alert(activity_list.length);
				query.whereLessThan({
					qid : queryID,
					column : 'createdAt',
					value : activity_list[activity_list.length - 1].createdAt
				});
			}
			query.justFields({
				qid : queryID,
				value : ["id", "activity_theme", "activity_check_status", "activity_start_date","createdAt"]
			});
			model.findAll({
				class : 't_society_activity',
				qid : queryID
			}, function(ret, err) {
				//coding..
				//				api.alert({
				//					msg : ret
				//				});
				if (ret.length > 0) {
					load_more_checkActivity(ret);
				} else if (ret) {
					api.toast({
						msg : '没有更多了'
					});
					api.hideProgress();
				} else {
					api.alert({
						msg : err.msg
					}, function(ret, err) {
						//coding...
					});
					api.hideProgress();
				}

			});

		}
	});

}

function load_more_checkActivity(activityList) {
	for (var i = 0; i < activityList.length; i++)
		activity_list.push(activityList[i]);
	showCheck(activityList);
}

//0发布签到，1正在签到，2签到完成
function showCheck(activityList) {
	var html = '';
	var content = $api.byId("content");
	for (var i = 0; i < activityList.length; i++) {
		var activity = activityList[i];
		if (activity.activity_check_status == 0) {
			html += ' <div id="publishCheck" ><div class="theme">' + activity.activity_theme;
			html += '</div><div tapmode="tap"onclick="publishCheck(this,' + "'" + activity.id + "'" + ')" class="publishCheck">开始签到</div><div style="clear:both"></div></div>';
			//		alert(html);

		} else {
			html += '<div id="checking" tapmode="tap"onclick="checkDetail(' + "'" + activity.id + "'" + ');"><div class="theme">' + activity.activity_theme;
			if (compareDate(getNowDate(),dateChangeFormation(activity.activity_start_date))) {
				html += '</div><div class="checked">签到完成</div><div style="clear:both"></div></div>';
				
			} else {
				html += '</div><div class="checking">签到中</div><div style="clear:both"></div></div>';
			}

		}

	}
	$api.append(content, html);
	api.parseTapmode();
	api.hideProgress();
}

apiready = function() {
	var clubID = $api.getStorage("society_id");
	getActivityTheme(clubID);
	api.addEventListener({
		name : 'scrolltobottom',
		extra : {
			threshold : 3 //设置距离底部多少距离时触发，默认值为0，数字类型
		}
	}, function(ret, err) {
		//operation
		getActivityTheme(clubID);
	});

}
function getCheckUserList(actID, callback) {
	var model = api.require('model');
	var query = api.require('query');
	var qureyID;
	model.config({
		appKey : '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8',
		host : "https://d.apicloud.com"
	});
	query.createQuery({
	}, function(ret, err) {
		//coding...
		if (ret && ret.qid) {
			queryID = ret.qid;
			//  		alert(queryID);
			query.whereEqual({
				qid : queryID,
				column : 'activity_id',
				value : actID
			});
			query.whereEqual({
				qid : queryID,
				column : 'status',
				value : '1'
			});
			query.justFields({
				qid : queryID,
				value : ["enroll_user_id"]
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
				if (ret != null) {
					var userList = [];
					for (var i = 0; i < ret.length; i++) {
						userList.push(ret[i].enroll_user_id);
					}
					callback(userList);
				}
			});
		}
	});
}

function publishCheck(obj, id) {
	var activity;
	for (var i=0; i<activity_list.length; i++){
		if (activity_list[i].id == id){
			activity = activity_list[i];
			break;
		}
	}
	api.showProgress({
		style : 'default',
		animationType : 'fade',
		title : '正努力定位中...',
		text : '先歇歇吧...',
		modal : false
	});
	var model = api.require('model');
	model.config({
		appKey : '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8',
		host : "https://d.apicloud.com"
	});
	api.startLocation({
		accuracy : '100m',
		filter : 1,
		autoStop : true
	}, function(ret, err) {
		if (ret.status) {
			var lat = ret.latitude;
			var lon = ret.longitude;
			//	        var time = ret.timestamp;
			//	        var str = '经度：'+ lon +'\n';
			//	        str += '纬度：'+ lat +'\n';
			//	        str += '更新时间：'+ time;
			//	        api.alert({msg:str});
			model.updateById({
				class : 't_society_activity',
				id : id,
				value : {
					"activity_check_site" : {
						"lat" : lat,
						"lng" : lon
					},
					"activity_check_status" : 1

				}
			}, function(ret, err) {
				//coding...

				if (err)
					api.alert({msg:err.msg});
				else {
					var actID = id;
					getCheckUserList(actID, function(joinIDList) {
						var messageList = [];
						for (var n = 0; n < joinIDList.length; n++) {
							messageList[n] = new Object();
							var pushMessage = new Object();
							messageList[n].type = 1;
							messageList[n].status = 0;
							messageList[n].content = activity.activity_theme + "开始签到了，赶快去活动地点吧";
							messageList[n].sender = $api.getStorage("user_id");
							messageList[n].receiver = joinIDList[n];
							messageList[n].transaction_id = actID
							messageList[n].society = $api.getStorage("society_id");
							pushMessage.sender_id = $api.getStorage("user_id");
							pushMessage.receiver_id = joinIDList[n];
							pushMessage.title = activity.activity_theme;
							pushMessage.content = "开始签到了，赶快去活动地点吧";
							pushMessage.type = 1;
							sendMessage(pushMessage);
						}
						insertMyNotice(messageList);

					});
					obj.parentNode.className = "hidden";
					var html = '';
					html += '<div id="checking" tapmode="tap"onclick="checkDetail(' + "'" + id + "'" + ');"><span class="theme">' + activity.activity_theme;
					html += '</span><div class="checking">签到中</div></div>';
					var content = $api.byId("content");
					$api.prepend(content, html);
					api.parseTapmode();
				}
				api.hideProgress();
			});
		} else {
			api.alert({
				msg : "GPS飘走了，请重试，实在不行，只能换手机了哦"
			});
			api.hideProgress();
		}
	});

}

function checkDetail(actID) {
	api.openWin({
		name : 'activityDetail',
		url : 'win_checkDetail.html',
		pageParam : {
			activity_id : actID,
			per_frame : 'activityDetail'
		}
	});
}

function returnBack() {

	api.closeWin({
		name : "",
		
	});
}
