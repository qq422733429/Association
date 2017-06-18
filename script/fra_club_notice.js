var notice_list = [];

var pageIndex = 1;
//默认加载第一页
var pageCount = 8;
//每页加载五条

var load_type = 0;
var temp_notice_list;
var temp_user_info_list;
var temp_user_id_list;
var temp_notice_list;
var temp_society_list;

var newest_time = '';
var firstLoad = true;
var hasContent = false;

apiready = function() {
	api.setRefreshHeaderInfo({
		visible: true,
		loadingImg: 'widget://image/refresh.png',
		bgColor: '#ccc',
		textColor: '#fff',
		textDown: '下拉刷新...',
		textUp: '松开刷新...',
		showTime: true
	}, function(ret, err) {
		//从服务器加载数据，完成后调用api.refreshHeaderLoadDone()方法恢复组件到默认状态
		loadNotice(0);
	});

	loadNotice(1);

	//上拉加载
	api.addEventListener({
		name: 'scrolltobottom',
		extra: {
			threshold: 0 //设置距离底部多少距离时触发，默认值为0，数字类型
		}
	}, function(ret, err) {
		loadNotice(1);
	});
}

function loadNotice(flag) {

	//没有最新的则变为加载更多
	if (flag == 0 && newest_time == '')
		flag = 1;

	var user_id = $api.getStorage('user_id');
	//	alert(user_id);

	var model = api.require('model');
	var query = api.require('query');

	model.config({
		appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8'
	});

	var page = 0;
	//根据上拉还是下来设定第几页
	load_type = flag;

	if (flag == 1) {
		page = (pageIndex - 1) * pageCount;

		api.showProgress({
			style: 'default',
			animationType: 'fade',
			title: '努力加载中...',
			text: '客官莫着急...',
			modal: false
		});
	}

	query.createQuery(function(ret, err) {
		if (ret && ret.qid) {
			var queryId = ret.qid;

			query.whereEqual({
				qid: queryId,
				column: 'notice_receiver_id',
				value: user_id
			});

			query.whereEqual({
				qid: queryId,
				column: 'relative_society_id',
				value: $api.getStorage('society_id')
			});

			if (flag == 1) {
				query.limit({
					qid: queryId,
					value: pageCount
				});
				query.skip({
					qid: queryId,
					value: page
				});
			} else {
				query.whereGreaterThan({
					qid: queryId,
					column: 'createdAt',
					value: newest_time
				});
			}
			query.desc({
				qid: queryId,
				column: 'createdAt'
			});

			model.findAll({
				class: 't_society_notice',
				qid: queryId
			}, function(noticeList, err) {
				if (noticeList) {
					if (noticeList.length > 0) {

						if (firstLoad || load_type == 0) {
							newest_time = noticeList[0].createdAt;
						}

						firstLoad = false;
						if (noticeList.length == pageCount && load_type == 1)
							pageIndex++;
						//页数加1
						temp_notice_list = new Array();

						//去除重复的信息
						for (var i = 0; i < noticeList.length; i++) {
							if (findIndex(noticeList[i].id, notice_list) == -1) {
								notice_list.push(noticeList[i]);
								temp_notice_list.push(noticeList[i]);
							}
						}

						temp_user_id_list = new Array();

						for (var i = 0; i < temp_notice_list.length; i++) {
							//保存发送者信息
							if (findIndex(temp_notice_list[i].notice_sender_id, temp_user_id_list) == -1) {
								temp_user_id_list.push(temp_notice_list[i].notice_sender_id);
							}
						}

						temp_user_id_list.push('*********');
						//获取发起者信息
						if (temp_notice_list.length > 0) {
							getUserKeyInfo(temp_user_id_list, get_society_list);
						} else {
							//							alert(JSON.stringify(err));
							api.refreshHeaderLoadDone();
							api.hideProgress();
							api.toast({
								msg: '没有更多内容了...',
								duration: 1500,
								location: 'middle'
							});
						}

					} else {
						//没有数据
						api.refreshHeaderLoadDone();
						api.hideProgress();
						if (!hasContent) {
							$('#notice_list').html('<div class="tips">暂时没有通知内容</div>');
						} else {
							api.toast({
								msg: '没有更多内容了...',
								duration: 1500,
								location: 'middle'
							});
						}
					}

				} else {
					api.refreshHeaderLoadDone();
					api.hideProgress();
					alertError(err);
				}
			});
		}
	});
}

function get_society_list(result) {
	//	alert(JSON.stringify(result));
	temp_user_info_list = result;
	var model = api.require('model');
	var query = api.require('query');
	model.config({
		appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8'
	});

	var society_id_list = new Array();

	for (var i = 0; i < temp_notice_list.length; i++) {
		if ($.inArray(temp_notice_list[i].relative_society_id, society_id_list) == -1) {
			//没有
			society_id_list.push(temp_notice_list[i].relative_society_id);
		}
	}
	society_id_list.push('**********');
	//	alert(JSON.stringify(society_id_list));

	query.createQuery(function(ret, err) {
		if (ret && ret.qid) {
			query.whereContainAll({
				qid: ret.qid,
				column: 'id',
				value: society_id_list
			});

			query.limit({
            qid:ret.qid,
            value:1000
        });
        model.findAll({
				class: 't_society',
				qid: ret.qid
			}, function(societyList, err) {
				if (societyList) {
					//					alert(JSON.stringify(societyList));
					temp_society_list = societyList;
					show_notice_list();
				} else {
					alertError(err);
				}
			});
		}
	});
}

function show_notice_list() {

	var tpl = '';

	//	alert(JSON.stringify(temp_notice_list));
	for (var i = 0; i < temp_notice_list.length; i++) {
		//		if (temp_notice_list[i].notice_type == 9 || temp_notice_list[i].notice_type == 8 || temp_notice_list[i].notice_type == 15 || temp_notice_list[i].notice_type == 16) {

		var userIndex = findIndex(temp_notice_list[i].notice_sender_id, temp_user_info_list);
		var societyIndex = findIndex(temp_notice_list[i].relative_society_id, temp_society_list);

		tpl += '<li class="comment_item" id = "' + temp_notice_list[i].id + '" tapmode="tap">';
		tpl += '<img class="head" src="' + temp_user_info_list[userIndex].head + '" tapmode="" onclick = "open_personal_info(\'' + temp_notice_list[i].notice_sender_id + '\')"></img>';
		tpl += '<div class="comment_right" id="' + temp_notice_list[i].id + '" tapmode="" onclick="openNoticeDetail(this)">';
		tpl += '<div class="first_line">';
		tpl += '<div class="person_name">' + temp_user_info_list[userIndex].real_name + '</div>';
		tpl += '<div class="activity">[' + temp_society_list[societyIndex].society_name + ']</div>';
		tpl += '</div>';
		tpl += '<div class="comment_content">';
		tpl += temp_notice_list[i].notice_content;
		tpl += '</div>';
		tpl += '<div class="comment_time">';
		tpl += changDateFormation(temp_notice_list[i].createdAt);
		tpl += '</div>';
		//未读信息
		if (temp_notice_list[i].notice_status == 0)
			tpl += '<img class="new_active" src="../image/new.png"/>';
		tpl += '</div>';
		tpl += '</li>';
		//		}
	}

	if ($('.notice_list').html() == '<div class="tips">暂时没有通知内容</div>') {
		$('.notice_list').html('');
		hasContent = false;
	}
	//	alert(tpl);
	if (load_type == 0) {
		$('#notice_list').prepend(tpl);
	} else
		$('#notice_list').append(tpl);

	$(".comment_item").swipe({
		swipeLeft: function(event, distance, duration, fingerCount, fingerData) {
			deleteNotice(this);
		},
		swipeRight: function(event, distance, duration, fingerCount, fingerData) {
			deleteNotice(this);
		}
	});
	api.parseTapmode();
	hasContent = true;
	api.refreshHeaderLoadDone();

}

function openNoticeDetail(obj) {
	var notice_id = $api.attr(obj, 'id');
	var notice_index = findIndex(notice_id, notice_list);
	var notice = notice_list[notice_index];

	if (notice.notice_status == 0) {
		//联网更新已读状态
		//alert('dddd');
		var new_img = $(obj).children('.new_active');
		new_img.addClass('hidden');

		var model = api.require('model');

		model.config({
			appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8'
		});

		model.updateById({
			class: 't_society_notice',
			id: notice.id,
			value: {
				notice_status: 1
			}
		}, function(ret, err) {

		});
	}

	//var society_id = $api.getStorage('society_id');

	//确定该成员是否已被删除
	var model = api.require('model');
	model.config({
		appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8'
	});
	var query = api.require('query');
	query.createQuery(function(ret, err) {
		if (ret && ret.qid) {

			query.whereEqual({
				qid: ret.qid,
				column: 'user_id',
				value: notice.notice_receiver_id
			});

			query.whereEqual({
				qid: ret.qid,
				column: 'society_id',
				value: $api.getStorage('society_id')
			});

			query.limit({
            qid:ret.qid,
            value:1000
        });
        model.findAll({
				class: "t_society_member",
				qid: ret.qid
			}, function(ret, err) {
				if (ret && ret.length > 0) {
					if (ret[ret.length - 1].is_deleted == true) {
						api.alert({
							msg: '你已不是该社团成员，无法处理该消息'
						})
						return;
					} else {
						switch (notice.notice_type) {
							case 0:
								break;
							case 1:
								{
									api.openWin({
										name: 'check',
										url: 'win_check_other.html',
										pageParam: {
											society_id: notice.relative_society_id
										}
									});

								}
								break;
							case 2:
								api.openWin({
									name: 'win_vote_list',
									url: 'win_vote_list.html',
									pageParam: {
										society_id: notice.relative_society_id
									}
								})
								break;
							case 3:
								break;
							case 9:
								break;
							case 4:
							case 5:
							case 6:
							case 7:
							case 8:
								//2015-8-25,Added by lzm,4,5,6,7,8,9都是提干认证/申请加入社团的,放到一块
								api.openWin({
									name: 'win_personnel_center',
									url: 'win_personnel_center.html',
									pageParam: {
										society_id: notice.relative_society_id
									}
								});
								break;
							case 10:
								api.openWin({
									name: 'win_club_task',
									url: 'win_club_task.html',
									pageParam: {
										society_id: notice.relative_society_id
									}
								});
							case 11:
								break;
							case 12:
								break;

								//发布活动，去看看活动详情
							case 13:
								{
									api.openWin({
										name: 'activityDetail',
										url: 'win_activity_detail.html',
										pageParam: {
											"clubID": notice.relative_society_id,
											"actID": notice.relative_society_transaction_id,
											"comment": 0,
										}
									});

								}
								break;
							case 15:
								{
									api.toast({
										msg: "社长同意你参加活动了"
									});
								}
								break;
							case 16:
								{
									api.toast({
										msg: "社长残忍拒绝了你的报名"
									});
								}
								break;
						}
					}
				}
			});
		}
	});
}

function deleteNotice(target) {

	var notice_id = $(target).attr('id');
	if (notice_id == null)
		return;
	//加载投票列表
	//	alert(message_id);
	var model = api.require('model');
	model.config({
		appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8'
	});

	api.confirm({
		title: '提示',
		msg: '确定删除该通知?',
		buttons: ['确定', '取消']
	}, function(ret, err) {
		if (ret.buttonIndex == 1) {
			model.deleteById({
				class: 't_society_notice',
				id: notice_id
			}, function(ret, err) {
				if (ret) {
					api.toast({
						msg: '删除成功'
					});
					$(target).addClass('hidden');
				} else {
					alertError(err);
				}
			});
		} else {
			return;
		}
	});
}

function clear_notice() {
	if (notice_list.length > 0) {
		api.confirm({
			title: '提示',
			msg: '将要清空列表中所有的通知吗',
			buttons: ['确定', '取消']
		}, function(ret, err) {
			if (ret.buttonIndex == 1) {
				var model = api.require('model');
				var query = api.require('query');
				model.config({
					appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8'
				});

				var count = 0;

				api.showProgress({
					style: 'default',
					animationType: 'fade',
					title: '删除中...',
					text: '客官莫着急...',
					modal: false
				});

				for (var i = 0; i < notice_list.length; i++) {
					var id = notice_list[i].id;
					model.deleteById({
						class: 't_society_notice',
						id: id,
					}, function(ret, err) {
						if (ret) {
							count++;
							if (count == notice_list.length) {
								var list = $api.domAll('li');
								for (var j = 0; j < list.length; j++) {
									$api.addCls(list[j], 'hidden');
								}
								notice_list = [];
								api.hideProgress();
							}
						}
					});
				}
			}
		});
	}
}