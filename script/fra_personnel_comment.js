var comment_list = [];
function getUserComment(loadMore, userID, callback) {
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
				value : 10
			});
			query.desc({
				qid : queryID,
				column : 'createdAt'
			});
			query.whereEqual({
				qid : queryID,
				column : 'comment_receiver_id',
				value : userID
			});
			if (loadMore == 1 && comment_list.length > 0) {
				//				alert(activity_list[activity_list.length - 1].createdAt);
				query.whereLessThan({

					qid : queryID,
					column : 'createdAt',
					value : comment_list[comment_list.length - 1].createdAt
				});

			}
			if (loadMore == 0 && comment_list.length > 0) {
				//				alert(activity_list[0].createdAt);
				query.whereGreaterThan({
					qid : queryID,
					column : 'createdAt',
					value : comment_list[0].createdAt
				});
				query.limit({
					qid : queryID,
					value : 100
				});

			}
			model.findAll({
				class : 't_society_activity_comment',
				qid : queryID
			}, function(ret, err) {

				//				api.alert({
				//					msg : ret
				//				});
				if (ret) {
					if (ret.length > 0) {
						callback(ret);
					} else {
						api.toast({
							msg : '没有更多评论了'
						});
						api.hideProgress();
						return;
					}

				} else {
					api.alert({
						msg : err.msg
					});
					api.hideProgress();

				}

			});

		} else if (ret) {
			alert("获取评论失败，请重试");
			api.hideProgress();
		} else {
			alert("获取活动错误，请重试");
			api.alert({
				msg : err.msg
			}, function(ret, err) {
				//coding...
			});
			api.hideProgress();
		}
	});
}

function pull_down_comment(commentList) {

	for (var i = commentList.length - 1; i > -1; i--)
		comment_list.unshift(commentList[i]);

	showActivityComment(0, commentList);

}

function load_more_comment(commentList) {
	for (var i = 0; i < commentList.length; i++)
		comment_list.push(commentList[i]);
	showActivityComment(1, commentList);
}

var first = 1;
function showActivityComment(loadMore, commentList) {
	//	if (commentList.length < 2){
	//		api.alert({
	//			msg:commentList
	//		});
	//	}
	var html = '';
	var handling = '<ul id= "handling">';
	var handled = '<ul  id = "handled">';
	var pull_down = '';
	var loadMore_handling = '';
	var loadMore_handled = '';
	var str = "'";
	for (var i = 0; i < commentList.length; i++) {
		var common = '';
		common += '<li tapmode="tap"class="comment_item " >';
		common += '<img tapmode="tap"onclick="open_personal_info(' + str + commentList[i].comment_publisher_id + str + ')"class="head" src=' + commentList[i].comment_publisher_head + '></img>';
		common += '<div class="comment_right"onclick="open_activityDetail(this,1,' + "'" + commentList[i].society_id + "'," + "'" + commentList[i].activity_id + "'" + ',' + "'" + commentList[i].id + "',";
		common += "'" + commentList[i].status + "'" + ')">';
		common += '<div class="first_line">';
		common += '<div class="person_name">' + commentList[i].publisher_name + '</div>';
		common += '<div class="activity">[ ' + commentList[i].society_name + ' ] ' + commentList[i].activity_theme + '</div>';
		common += '<div style="clear:both"></div>';
		common += '</div>';
		common += '<div class="comment_content">' + commentList[i].comment_content + '</div>';
		common += '<div class="comment_time">' + changDateFormation(commentList[i].createdAt) + '</div>';
		//		alert(commentList[i].status);

		if (commentList[i].status == '0') {
			common += '<img class="new_active" src="../image/new.png"/>';
			common += '</div>';
			common += '</li>';
			if (first) {
				handling += common;
			} else {
				if (loadMore == 1) {
					loadMore_handling += common;
				} else {
					pull_down += common;
				}

			}
		} else {
			if (first) {
				handled += common;
			} else {
				if (loadMore == 1) {
					loadMore_handled += common;
				}

			}

		}

	}

	var obj = $api.byId("comment_list");

	if (first) {
		handling += '</ul>';
		handled += '</ul>';
		html += handling + handled;
		//		alert(html);
		$api.prepend(obj, html);

	} else if (loadMore == '1') {
		$api.prepend($api.byId("handling"), loadMore_handling);
		$api.append($api.byId("handled"), loadMore_handled);
	} else {
		api.alert(pull_down);
		$api.prepend($api.byId("handling"), pull_down);
	}

	//	alert(html);
	first = 0;
	api.parseTapmode();
	api.hideProgress();

}

function open_activityDetail(obj, comment, clubID, actID, id, status) {

	//	alert(clubID + '\n' + actID);
	if (status == 0) {
		var img = $api.dom(obj,".new_active");
		img.className = "hidden";
		var model = api.require('model');
		model.updateById({
			class : 't_society_activity_comment',
			id : id,
			value : {
				status : 1
			}
		}, function(ret, err) {
			//coding...

		});
	}
	api.openWin({
		name : 'activityDetail',
		url : 'win_activity_detail.html',
		pageParam : {
			"clubID" : clubID,
			"actID" : actID,
			"comment" : comment
		}

	});

}

apiready = function() {
	var userID = $api.getStorage("user_id");

	getUserComment(0, userID, pull_down_comment);
	api.setRefreshHeaderInfo({
		visible : true,
		// loadingImgae: 'wgt://image/refresh-white.png',
		bgColor : '#f2f2f2',
		textColor : '#4d4d4d',
		textDown : '下拉刷新...',
		textUp : '松开刷新...',
		showTime : true
	}, function(ret, err) {
		getUserComment(0, userID, pull_down_comment);
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
		getUserComment(1, userID, load_more_comment);
	});
}
