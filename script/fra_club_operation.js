function openOperation(type) {

	//确定该成员是否已被删除
	var model = api.require('model');
	model.config({
		appKey : '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8'
	});
	var query = api.require('query');

	if (type == 2) {
		var user_position = $api.getStorage("position");
		if (user_position == "社长" || user_position == "副社长") {
			api.openWin({
				name : 'check',
				url : 'win_check.html'
			});
		} else {
			api.openWin({
				name : 'check',
				url : 'win_check_other.html'
			});
		}
		return;
	}

	api.showProgress({
		style : 'default',
		animationType : 'fade',
		title : '努力加载中...',
		text : '客官莫着急...',
		modal : false
	});

	query.createQuery(function(ret, err) {
		if (ret && ret.qid) {
			query.whereEqual({
				qid : ret.qid,
				column : 'user_id',
				value : $api.getStorage('user_id')
			});

			query.whereEqual({
				qid : ret.qid,
				column : 'society_id',
				value : $api.getStorage('society_id')
			});

		}

		query.limit({
            qid:ret.qid,
            value:1000
        });
        model.findAll({
			class : "t_society_member",
			qid : ret.qid
		}, function(ret, err) {
			if (ret && ret.length > 0) {
				if (ret[ret.length - 1].is_deleted == true) {
					api.alert({
						msg : '你已不是该社团成员，将自动重新登录'
					}, function(ret, err) {
						if (ret.buttonIndex == 1) {
							reLogin();
						}
					});
				} else {
					api.hideProgress();
					switch (type) {
						case 1:
							api.openWin({
								name : 'managerActivity',
								//		url : 'win_personnel_certification.html',
								url : '../html/win_manageActivity.html'
							});
							break;
						case 2:
							var user_position = $api.getStorage("position");
							if (user_position == "社长" || user_position == "副社长") {
								api.openWin({
									name : 'check',
									url : 'win_check.html'
								});
							} else {
								api.openWin({
									name : 'check',
									url : 'win_check_other.html'
								});
							}
							break;
						case 3:
							api.openWin({
								name : 'win_vote_list',
								url : 'win_vote_list.html'
							})
							break;
						case 4:
							api.openWin({
								name : 'club_detail',
								url : '../html/win_section_manage.html',
							})
							break;
						case 5:
							api.openWin({
								name : 'win_personnel_center',
								//		url : 'win_personnel_certification.html',
								url : 'win_personnel_center.html'
							});
							break;
						case 6:
							//							api.openWin({
							//								name: 'task_action',
							//								url: 'win_club_task.html'
							//							});
							var user_position = $api.getStorage("position");
							if (user_position == "社长" || user_position == "副社长") {
								api.openWin({
									name : 'win_club_manage_task',
									url : 'win_club_manage_task.html'
								});
							} else {
								api.openWin({
									name : 'win_club_task',
									url : 'win_club_task.html'
								});
							}
							break;
							break;
						case 7:
							api.openWin({
								name : 'finance_action',
								url : 'win_club_finance.html'
							});
							break;
						case 8:
							api.openWin({
								name : 'win_club_info_modify',
								url : 'win_club_info_modify.html',
								bounces : false,
								vScrollBarEnabled : false
							});
							break;
						case 9:
							api.openWin({
								name : 'win_club_member_list',
								url : 'win_club_member_list.html'
							});
							break;
						case 10:
							api.openWin({
								name : 'win_club_evaluation',
								url : 'win_club_evaluation.html'
							});
							break;
						case 11:
							api.openWin({
								name : 'club_activity',
								url : 'win_club_activityList.html'
							});
							break;
						default:
							break;
					}
				}
			} else {
				api.hideProgress();
				api.alert({
					msg : '网络错误，请重试'
				});
			}
		});
	});

}

apiready = function() {
	//根据职位加载不同的操作
	//共有社长，副社长，部长，副部长，干事，社员，游客七种角色
	//共有1-活动管理，2-签到，3-投票，4-部门管理，5-提干认证，6-任务，7-财务，8-社团资料，9-成员，10-考核，11-活动等八种权限;
	var positon = $api.getStorage('position');
	//		alert(positon);
	var authorities = [];
	switch (positon) {
		case '社员':
			authorities = [9, 11, 2, 3, 5, 10, 7, 8];
			break;
		case '干事':
		case '副部长':
			authorities = [9, 11, 2, 3, 5, 6, 10, 7, 8];
			break;
		case '部长':
			authorities = [9, 11, 2, 3, 5, 6, 10, 7, 8];
			break;
		case '副社长':
			authorities = [9, 11, 1, 2, 3, 5, 6, 10, 7, 8];
			break;
		case '社长':
			authorities = [11, 1, 2, 3, 4, 5, 6, 10, 7, 8];
			break;
		default:
			//游客
			authorities = [2];
			break;
	}

	var tpl = '';

	for (var i = 0; i < authorities.length; i++) {
		switch (authorities[i]) {
			case 2:
				tpl += '<li tapmode="tap" id="sign_in" onclick="openOperation(2)"><span>活动签到</span></li>';
				break;
			case 3:
				tpl += '<li tapmode="tap" id="vote" onclick="openOperation(3)"><span>投票</span></li>';
				break;
			case 5:
				tpl += '<li tapmode="tap" id="certication" onclick="openOperation(5) "><span>提干认证</span></li>';
				break;
			case 7:
				tpl += '<li tapmode="tap" id="finance" onclick="openOperation(7)"><span>财务</span></li>';
				break;
			case 6:
				tpl += '<li tapmode="tap" id="task" onclick="openOperation(6)"><span>任务</span></li>';
				break;
			case 8:
				tpl += '<li tapmode="tap" id="club_info" onclick="openOperation(8)"><span>社团资料</span></li>';
				break;
			case 1:
				tpl += '<li tapmode="tap" id="activity_manage" onclick="openOperation(1)"><span>活动管理</span></li>';
				break;
			case 4:
				tpl += '<li tapmode="tap" id="section_manage" onclick="openOperation(4) "><span>部门管理</span></li>';
				break;
			case 9:
				tpl += '<li tapmode="tap" id="member" onclick="openOperation(9) "><span>成员</span></li>';
				break;
			case 10:
				tpl += '<li tapmode="tap" id="evaluation" onclick="openOperation(10) "><span>考核</span></li>';
				break;
			case 11:
				tpl += '<li tapmode="tap" id="activity" onclick="openOperation(11) "><span>活动</span></li>';
				break;
			default:
				break;
		}
	}
	$('.operaion_list').append(tpl);
	api.parseTapmode();
}