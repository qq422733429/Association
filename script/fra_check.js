var enroll_list = new Object();
var activityList;
var clubList = new Object();
var EARTH_RADIUS = 6378137.0;
//单位M
var PI = Math.PI;

function getRad(d) {
	return d * PI / 180.0;
}

function getFlatternDistance(lat1, lng1, lat2, lng2) {
	var f = getRad((lat1 + lat2) / 2);
	var g = getRad((lat1 - lat2) / 2);
	var l = getRad((lng1 - lng2) / 2);

	var sg = Math.sin(g);
	var sl = Math.sin(l);
	var sf = Math.sin(f);

	var s, c, w, r, d, h1, h2;
	var a = EARTH_RADIUS;
	var fl = 1 / 298.257;

	sg = sg * sg;
	sl = sl * sl;
	sf = sf * sf;

	s = sg * (1 - sl) + (1 - sf) * sl;
	c = (1 - sg) * (1 - sl) + sf * sl;

	w = Math.atan(Math.sqrt(s / c));
	r = Math.sqrt(s * c) / w;
	d = 2 * w * a;
	h1 = (3 * r - 1) / 2 / c;
	h2 = (3 * r + 1) / 2 / s;

	return d * (1 + fl * (h1 * sf * (1 - sg) - h2 * (1 - sf) * sg));
}

//签到编程已签到

function check(obj, i) {
	//	api.alert({msg:activityList[i]});
	api.showProgress({
		style : 'default',
		animationType : 'fade',
		title : '正努力定位中...',
		text : '先歇歇吧...',
		modal : false
	});
	api.startLocation({
		accuracy : '100m',
		filter : 1,
		autoStop : true
	}, function(ret, err) {

		if (ret.status) {
			var lat = ret.latitude;
			var lon = ret.longitude;
			//			api.alert({
			//				msg : lat + "\n" + lon
			//			}, function(ret, err) {
			//				//coding...
			//			});
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
					query.whereEqual({
						qid : queryID,
						column : 'id',
						value : activityList[i].id
					});
					query.justFields({
						qid : queryID,
						value : ["activity_check_site", "society_id"]
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
						//						api.alert({
						//							msg : ret
						//						}, function(ret, err) {
						//							//coding...
						//						});
						if (ret && ret.length > 0) {
							var lat1 = ret[0].activity_check_site.lat;
							var lon1 = ret[0].activity_check_site.lng;
							//							api.alert({
							//								msg : lat1 + "\n" + lon1
							//							}, function(ret, err) {
							//								//coding...
							//							});
							var distance = getFlatternDistance(lat1, lon1, lat, lon);
							if (distance > 5000) {
								api.alert({
									msg : "您也离得忒远了吧，靠近点再签到吧"
								}, function(ret, err) {
									//coding...
								});
								api.hideProgress();
								return;
							} else {
					
								model.updateById({
									class : 't_society_activity_enroll',
									id : activityList[i].enroll_id,
									value : {
										"check_status" : 1
									}
								}, function(ret1, err) {
									//coding...
									
									if (ret1) {
										var pos = activityList[i].society_id;
										var clubInfo = clubList[pos];
										var html = '';
										var str = "'";
										add_member_score($api.getStorage("user_id"), clubInfo.id, 5)
										html += '<div id="activity" >';
										html += '<div class="check_topic">' + activityList[i].activity_theme;
										html += '<div class="checked" >已签到</div>';
										html += '<div style="clear:both"></div></div>';
										html += '<ul class = "activityItem" id="' + activityList[i].id + 'a" tapmode="tap" onclick="open_activityDetail(0,' + str + clubInfo.id + str + ',' + str + activityList[i].id + str + ');">';
										html += '<li><span class="club_name"><i></i>' + clubInfo.society_name + '</span></li>';
										html += '<li><span  class="time"><i></i>' + changDateFormation(activityList[i].activity_start_date) + '</span></li>';
										html += '<li><span  class="site"><i></i>' + activityList[i].activity_site + '</span></li>';
										html += '<li><span  class="person_num"><i></i><span>' + activityList[i].activity_person_joined + '/' + activityList[i].activity_person_limited + '</span></span></li>';
										html += '</ul>';
										html += '</div>';
										var act_id = obj.parentNode.parentNode;
										act_id.className = "hidden"
										$("#checked_act").prepend(html);
										api.alert({
											msg : "恭喜您签到成功,获得5个积分"
										});
										api.parseTapmode();
										api.hideProgress();
									} else {
										api.toast({
											msg : '网络问题'
										});
										api.hideProgress();
									}
								});
							}
						} else if (ret) {
							api.alert({
								msg : "请重试"
							});
							api.hideProgress();
						} else {
							api.alert({
								msg : err
							});
							api.hideProgress();
							return;
						}

					});
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

//只会显示发布签到了的 活动的签到和已签到
function getUserJoinActivityIdList(userID, getCheckActivity) {
	api.showProgress({
		style : 'default',
		animationType : 'fade',
		title : '正努力加载中...',
		text : '先歇歇吧...',
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

		if (ret && ret.qid) {
			var queryID = ret.qid;
			query.whereEqual({
				qid : queryID,
				column : 'enroll_user_id',
				value : userID
			});
			query.desc({
				qid : queryID,
				column : 'createdAt'
			});
query.limit({
            qid:queryID,
            value:1000
        });
			query.whereEqual({
				qid : queryID,
				column : 'status',
				value : '1'
			});
			query.justFields({
				qid : queryID,
				value : ["id", "activity_id", "check_status"]
			});
			model.findAll({
				class : 't_society_activity_enroll',
				qid : queryID
			}, function(ret, err) {
				//coding...

				if (ret) {
					if (ret.length > 0) {
						enroll_list = ret;
						getCheckActivity(ret);
					} else {
						api.hideProgress();
						var html = '<div style="text-align:center;margin-top:3px;padding:3px;background-color:#ffffff;font-size:1em ;color:#4dd0c8;">没有正在签到的活动，等待社长发布签到吧</div>';
						$("#fra_check").prepend(html);
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

function getCheckActivity(enrollList) {

	var model = api.require('model');
	var query = api.require('query');
	model.config({
		appKey : '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8',
		host : "https://d.apicloud.com"
	});

	//我报名成功的活动的id
	var activityIDList = new Array();
	//enroll表中的id
	var enrollIDList = new Array();
	//我的签到状态表，0表示没签到，1表示签到
	var checkStatusList = new Array();

	for (var i = 0; i < enrollList.length; i++) {
		activityIDList[i] = enrollList[i].activity_id;
		enrollIDList[i] = enrollList[i].id;
		checkStatusList[i] = enrollList[i].check_status;
	}
	activityIDList.push("*");
	activityIDList.push("**");

	query.createQuery({
	}, function(ret, err) {
		//coding...
		if (ret && ret.qid) {
			var queryID = ret.qid;
			query.whereContainAll({
				qid : queryID,
				column : 'id',
				value : activityIDList
			});
			query.desc({
				qid : queryID,
				column : 'createdAt'
			});
			query.limit({
            qid:queryID,
            value:1000
        });
			query.whereEqual({
				qid : queryID,
				column : 'activity_check_status',
				value : '1'
			});
			query.justFields({
				qid : queryID,
				value : ["activity_person_joined", "activity_person_limited", "id", "activity_theme", "activity_start_date", "activity_site", "society_id", "createdAt"]
			});
			query.whereGreaterThanOrEqual({
				qid : queryID,
				column : 'activity_start_date',
				value : getNowDate()
			});

			model.findAll({
				class : 't_society_activity',
				qid : queryID
			}, function(ret, err) {
				//coding...
				if (ret.length > 0) {
					for (var i = 0; i < ret.length; i++) {
						var pos = activityIDList.indexOf(ret[i].id);
						ret[i].enroll_id = enrollIDList[pos];
						ret[i].check_status = checkStatusList[pos];
					}
					activityList = ret;
					getCheckClubs(ret, showCheckActivity);
				} else if (ret) {
					var html = '<div style="text-align:center;margin-top:3px;padding:3px;background-color:#ffffff;font-size:1em ;color:#4dd0c8;">没有正在签到的活动，等待社长发布再签到吧</div>';
					$("#fra_check").prepend(html);
					api.hideProgress();
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

function getCheckClubs(activityList, showCheckActivity) {
	var clubIDList = new Array();
	clubIDList.push("*");
	clubIDList.push("**");
	for (var i = 0; i < activityList.length; i++) {
		if (clubIDList.indexOf(activityList[i].society_id) < 0) {
			clubIDList.push(activityList[i].society_id);
		}
	}
	//	api.alert({
	//		msg:clubIDList
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
				//          	api.alert({
				//          		msg:ret
				//          	});

				if (ret) {

					if (ret.length > 0) {

						for (var i = 0; i < ret.length; i++) {
							clubList[ret[i].id] = ret[i];
						}
						showCheckActivity(clubList, activityList);
					} else {
						var html = '<div style="text-align:center;margin-top:3px;padding:3px;background-color:#ffffff;font-size:1em ;color:#4dd0c8;">没有正在签到的活动，等待社长发布签到吧</div>';
						$("#fra_check").prepend(html);
						api.hideProgress();
					}

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

//签到应该互动开始时间推迟几个小时都看的到
function showCheckActivity(clubList, activityList) {

	var str = "'";
	var checking = '<div id = "checking_act">';
	var checked = '<div id = "checked_act">';
	var act = '';
	for (var i = 0; i < activityList.length; i++) {
		var pos = activityList[i].society_id;
		var clubInfo = clubList[pos];
		var clubID = clubInfo.id;
		var html = '';
		html += '<div id="activity" >';
		html += '<div class="check_topic">' + activityList[i].activity_theme;
		if (activityList[i].check_status == 0) {
			html += '<div class="check" tapmode="tap" onclick="check(this,' + "'" + i + "'" + ');">签到</div>';
		} else {
			html += '<div class="checked" >已签到</div>';
		}
		html += '<div style="clear:both"></div></div>';
		html += '<ul class = "activityItem" id="' + activityList[i].id + 'a" tapmode="tap" onclick="open_activityDetail(0,' + str + clubID + str + ',' + str + activityList[i].id + str + ');">';
		html += '<li><span class="club_name"><i></i>' + clubInfo.society_name + '</span></li>';
		html += '<li><span  class="time"><i></i>' + changDateFormation(activityList[i].activity_start_date) + '</span></li>';
		html += '<li><span  class="site"><i></i>' + activityList[i].activity_site + '</span></li>';
		html += '<li><span  class="person_num"><i></i><span>' + activityList[i].activity_person_joined + '/' + activityList[i].activity_person_limited + '</span></span></li>';
		html += '</ul>';
		html += '</div>';
		if (activityList[i].check_status == 0) {
			checking += html;
		} else {
			checked += html;
		}
	}

	checking += '</div>';
	checked += '</div>';
	html = checking + checked;
	//	alert(html);
	$("#fra_check").prepend(html);
	api.parseTapmode();
	api.hideProgress();
}

apiready = function() {
	var userID = $api.getStorage("user_id");
	getUserJoinActivityIdList(userID, getCheckActivity);
}
