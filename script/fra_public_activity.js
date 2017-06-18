var activity_list = [];
var activity_IDSet = [];
//哈希数组，键是社团的id,值是json对象
var clubInfo_list = new Object();
var clubID_list = new Array();
//0上拉加载更多1下拉刷新
function getSchoolPublicActivity(loadMore, schoolID, callback) {

	api.showProgress({
		style : 'default',
		animationType : 'fade',
		title : '努力加载中...',
		text : '先喝杯茶吧...',
		modal : false
	});
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
				column : 'school_id',
				value : schoolID
			});
			query.exceptFields({
				qid : queryID,
				value : ["activity_publisher", "school_id", "activity_public", "updatedAt", "activity_check_site", "activity_detail"]
			});
			query.whereEqual({
				qid : queryID,
				column : 'activity_public',
				value : true
			});

			if (loadMore == 1 && activity_list.length > 0) {
				//				alert(activity_list[activity_list.length - 1].createdAt);
				query.whereLessThan({

					qid : queryID,
					column : 'createdAt',
					value : activity_list[activity_list.length - 1].createdAt
				});

			}
			if (loadMore == 0 && activity_list.length > 0) {
				//				alert(activity_list[0].createdAt);
				query.whereGreaterThan({
					qid : queryID,
					column : 'createdAt',
					value : activity_list[0].createdAt
				});
				query.limit({
					qid : queryID,
					value : 1000
				});

			}
			model.findAll({
				class : 't_society_activity',
				qid : queryID
			}, function(ret, err) {
				if (ret) {
					//1加载更多刷新，0下拉刷新
					if (ret.length > 0) {
						callback(ret);
					} else {
						api.toast({
							msg : '没有更多活动了哦'
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
//						api.alert({
//							msg : err.msg
//						});
					}
					api.hideProgress();

				}

			});

		} else if (ret) {
			api.alert({
				msg : "获取活动失败"
			});
			api.hideProgress();
		} else {
			api.toast({
				msg : "获取活动错误，请重试"
			});
//			api.alert({
//				msg : err.msg
//			}, function(ret, err) {
//				//coding...
//			});
			api.hideProgress();
		}
	});
}

function getSchoolClubs(activityList, callback) {
	var clubIDList = new Array();
	clubIDList.push("123");
	clubIDList.push("456");
	var flag = 0;
	for (var i = 0; i < activityList.length; i++) {
		if (clubID_list.indexOf(activityList[i].society_id) < 0) {
			clubID_list.push(activityList[i].society_id);
			clubIDList.push(activityList[i].society_id);
			flag = 1;
		}
	}

	//	api.alert({
	//		msg:clubIDList
	//	});
	if (flag == 0) {
		callback(clubInfo_list);
		return;
	}
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
			query.whereContainAll({
				qid : queryID,
				column : 'id',
				value : clubIDList
			});

			query.justFields({
				qid : queryID,
				value : ["id", "society_name", "society_badge"]
			});
			query.limit({
            qid:queryID,
            value:1000
        });
        model.findAll({
				class : 't_society',
				qid : queryID
			}, function(ret, err) {
				//coding...
				//				api.alert({
				//					msg : ret
				//				});

				if (ret) {

					if (ret.length > 0) {

						for (var i = 0; i < ret.length; i++) {
							clubInfo_list[ret[i].id] = ret[i];
						}
						callback(clubInfo_list);
					} else {
						callback(clubInfo_list);

					}

				} else {
					//					alert("containAll1 超时");
//					api.alert({
//						msg : err.msg
//					}, function(ret, err) {
//						//coding...
//					});
					api.hideProgress();
				}

			});

		} else if (ret) {

			api.alert({
				msg : "获取社团信息失败"
			});
			api.hideProgress();
		} else {
			//			alert("containAll 超时");
//			api.alert({
//				msg : err.msg
//			});
			api.hideProgress();

		}
	});
}

function pull_down_Activity(activityList) {

	for (var i = activityList.length - 1; i > -1; i--)
		activity_list.unshift(activityList[i]);

	getSchoolClubs(activityList, function(clubInfoList) {
		showPublicActivity(0, activityList, clubInfoList);
	});
}

function load_more_activity(activityList) {
	for (var i = 0; i < activityList.length; i++)
		activity_list.push(activityList[i]);
	getSchoolClubs(activityList, function(clubInfoList) {
		showPublicActivity(1, activityList, clubInfoList);
	});
}

function showPublicActivity(loadMore, activityList, culubInfoList) {
	var html = '';
	//	var userID = "55bae837f17c2fa50c938598";
	var userID = $api.getStorage("user_id");
	var str = "'";
	var end = activityList.length;

	for (var i = 0; i < end; i++) {
		var clubInfo = culubInfoList[activityList[i].society_id];
		var clubID = activityList[i].society_id;
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
		html += '<li><a tapmode="active" onclick="share(' + str + activityList[i].id + str +',' 
			 +str + clubInfo.society_name + str + ',' + str + activityList[i].activity_theme + str + ');" class="comment"><i></i> <span >'+ activityList[i].share_count +'</span></a></li>';
		html += '</ul>';
		html += '</div>';

	}
	if (loadMore) {
		$("#act").append(html);
	} else
		$("#act").prepend(html);
//	alert(html);
	act_bottom(activityList);
	api.parseTapmode();
	api.hideProgress();
}

apiready = function() {
	//getSocietyMember('55b23e8ae6e6419036d0c383', 'section_manage', null);
	//			var clubID = "55b2407f51ffb4040689a636";
	//			var userID = "55bae837f17c2fa50c938598";
	//			var schoolID = "55bebc8997e9982b0da17a2d";
	var schoolID = $api.getStorage("user_school");
				//alert(schoolID);
	var userID = $api.getStorage("user_id");
	getSchoolPublicActivity(0, schoolID, pull_down_Activity);
	api.setRefreshHeaderInfo({
		visible : true,
		// loadingImgae: 'wgt://image/refresh-white.png',
		bgColor : '#f2f2f2',
		textColor : '#4d4d4d',
		textDown : '下拉刷新...',
		textUp : '松开刷新...',
		showTime : true
	}, function(ret, err) {
		refresh_bottom();
		getSchoolPublicActivity(0, schoolID, pull_down_Activity);
		api.refreshHeaderLoadDone();
	});
	//地步加载更多
	api.addEventListener({
		name : 'scrolltobottom',
		extra : {
			threshold : 3 //设置距离底部多少距离时触发，默认值为0，数字类型
		}
	}, function(ret, err) {
		//operation
		getSchoolPublicActivity(1, schoolID, load_more_activity);
	});
	//			getUserInfo(userID, function(ret1) {
	//				api.alert({
	//					msg : ret1
	//				});
	//			});
}