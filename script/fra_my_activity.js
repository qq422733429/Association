var enroll_list =[];
//我参加过的活动
function getUserJoinActivityIdList(userID,callback) {
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
			query.limit({
	            qid:queryID,
	            value:5
            });
			query.desc({
				qid : queryID,
				column : 'createdAt'
			});
			
			if (enroll_list.length > 0 ){
				query.whereLessThan({
	                qid:queryID,
	                column:'createdAt',
	                value:enroll_list[enroll_list.length-1].createdAt
                });
			}
//			query.whereEqual({
//				qid : queryID,
//				column : 'status',
//				value : '1'
//			});
			query.justFields({
				qid : queryID,
				value : ["activity_id",,"createdAt","status"]
			});
			model.findAll({
				class : 't_society_activity_enroll',
				qid : queryID
			}, function(ret, err) {
				//coding...

				if (ret) {
					if (ret.length > 0) {
						callback(ret)
					} else {
						api.hideProgress();
						api.toast({
							msg:"没有更多了"
						});
					}
				} else {
					api.hideProgress();
					api.alert({
						msg:err.msg
					});
				}

			});
		}

	});
}

function getJoinActivity(enrollList) {
	
	for (var i=0; i<enrollList.length; i++){
		enroll_list.push(enrollList[i]);
	}
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

	for (var i = 0; i < enrollList.length; i++) {
		activityIDList[i] = enrollList[i].activity_id
	}
	activityIDList.push("*");
	activityIDList.push("*");

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
			
			query.exceptFields({
				qid : queryID,
				value : ["activity_publisher","school_id","activity_public", "updatedAt","activity_check_site","activity_detail"]
			});
//			query.whereGreaterThanOrEqual({
//				qid : queryID,
//				column : 'activity_start_date',
//				value : getNowDate()
//			});
query.limit({
            qid:queryID,
            value:1000
        });

			model.findAll({
				class : 't_society_activity',
				qid : queryID
			}, function(ret, err) {
				//coding...
				if(ret.length>0){
					for (var i=0; i<ret.length; i++){
						var pos = activityIDList.indexOf(ret[i].id);
						ret[i].status = enrollList[pos].status;
					}
					getSchoolClubs(ret, function(clubInfoList) {
						showMyJoinActivity(1,ret, clubInfoList);
					});
				}else if(ret){
					api.toast({
						msg:"没有更多活动了"
					});
					api.hideProgress();
				}else{
					api.alert({
						msg:err.msg
					});
					api.hideProgress();
				}
			});

		} else {
			api.alert({msg:err.msg});
			api.hideProgress();
		}

	});
}
function showMyJoinActivity(loadMore, activityList, culubInfoList) {
	var html = '';
	//	var userID = "55bae837f17c2fa50c938598";
	var userID = $api.getStorage("user_id");
	var str = "'";
	var end = activityList.length;
	
	for (var i = 0; i < end; i++) {
		var clubInfo = culubInfoList[activityList[i].society_id];
		var clubID = activityList[i].society_id;
		html += '<div id="activity" >';
		html += '<div class="check_topic">' + activityList[i].activity_theme;
		if (activityList[i].status == '0'){
			html += '<div class="checked" >已报名</div>';
		}else if (activityList[i].status == '1'){
			html += '<div class="checked" >已同意</div>';
		}else if (activityList[i].status == '2'){
			html += '<div class="checked" >已拒绝</div>';
		}
		html += '<div style="clear:both"></div></div>';
		html += '<ul class = "activityItem" id="' + activityList[i].id + 'a" tapmode="tap" onclick="open_activityDetail(0,' + str + clubID + str + ',' + str + activityList[i].id + str + ');">';
		html += '<li><span class="club_name"><i></i>' + clubInfo.society_name + '</span></li>';
		html += '<li><span  class="time"><i></i>' + changDateFormation(activityList[i].activity_start_date) + '</span></li>';
		html += '<li><span  class="site"><i></i>' + activityList[i].activity_site + '</span></li>';
		html += '<li><span  class="person_num"><i></i><span>' + activityList[i].activity_person_joined + '/' + activityList[i].activity_person_limited + '</span></span></li>';
		html += '</ul>';
		html += '<ul class="bottom" id="' + activityList[i].id + '">';
		html += '<li ><a tapmode="active"onclick="addLike(' + 'this' + ',' + str + activityList[i].id + str + ');" class="like"><i></i><span >' + 0 + ' </span></a></li>';
		html += '<li><a tapmode="active" onclick="addJoin(' + 'this' + ',' + str + activityList[i].id + str + ',' + str + clubID + str + ');" class="join"><i></i> <span >' + 0 + '</span></a></li>';
		html += '<li><a tapmode="active" onclick="share(' + str + activityList[i].id + str + ',' + str + clubInfo.society_name + str + ',' + str + activityList[i].activity_theme + str + ');" class="comment"><i></i> <span >' + activityList[i].share_count + '</span></a></li>';
		html += '</ul>';
		html += '</div>';
	}
	if (loadMore) {
		$("#act").append(html);
	} else
		$("#act").prepend(html);
	act_bottom(activityList);
	api.parseTapmode();
	api.hideProgress();
}

apiready = function() {
	var userID = $api.getStorage("user_id");
	getUserJoinActivityIdList(userID, getJoinActivity);
	//异步加载更多
	api.addEventListener({
		name : 'scrolltobottom',
		extra : {
			threshold : 3 //设置距离底部多少距离时触发，默认值为0，数字类型
		}
	}, function(ret, err) {
		//operation
		getUserJoinActivityIdList(userID, getJoinActivity);
	});
}
