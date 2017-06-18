var vote_list = [];

var temp_user_info_list;
var temp_section_position_list;
var temp_user_id_list;
var temp_vote_list;
var temp_my_vote_list;

var pageIndex = 1;
//默认加载第一页
var pageCount = 5;
//每页加载五条
var load_type = 0;
var newest_time = '';
var firstLoad = true;
var hasContent = false;
var clickable = true;



function voteAction(type, obj) {

	if (clickable == false)
		return;
	clickable = false;
	//修改投票状态
	var parent = $api.closest(obj, '.action');
	var my_vote_id = $(parent).attr('id');
	//alert(my_vote_id);
	var vote_id = $(parent).attr('name');
	//alert(vote_id);
	if (type == '1') {
		api.confirm({
			msg: '您将要投支持票',
			buttons: ['确定', '取消']
		}, function(action, err) {
			if (action.buttonIndex == 1) {
				//支持，更新投票结果
				api.showProgress({
					style: 'default',
					animationType: 'fade',
					title: '发送中...',
					text: '先喝口茶...',
					modal: false
				});
				var model = api.require('model');
				model.updateById({
					class: 't_society_vote_involved',
					id: my_vote_id,
					value: {
						vote_result: 1
					}
				}, function(ret, err) {
					if (ret) {
						//支持数加1
						model.findById({
							class: 't_society_vote',
							id: vote_id
						}, function(vote, err) {
							clickable = true;
							if (vote) {
								model.updateById({
									class: 't_society_vote',
									id: vote_id,
									value: {
										total_agree: parseInt(vote.total_agree) + 1
									}
								}, function(ret, err) {
									if (ret) {
										//alert(JSON.stringify(ret));
										api.hideProgress();
										var tpl = '';
										tpl += '<li class="processed ">';
										tpl += '已同意';
										tpl += '</li>';
										$(parent).after(tpl);
										$api.addCls(parent, 'hidden');
									}
								});
							}
						});
					}
				});

			}
		});
	} else {
		api.confirm({
			msg: '您将要投反对票',
			buttons: ['确定', '取消']
		}, function(action, err) {
			if (action.buttonIndex == 1) {
				//反对，更新投票结果
				api.showProgress({
					style: 'default',
					animationType: 'fade',
					title: '发送中...',
					text: '先喝口茶...',
					modal: false
				});
				var model = api.require('model');
				model.updateById({
					class: 't_society_vote_involved',
					id: my_vote_id,
					value: {
						vote_result: 2
					}
				}, function(ret, err) {
					if (ret) {
						//反对数加1
						model.findById({
							class: 't_society_vote',
							id: vote_id
						}, function(vote, err) {
							clickable = true;
							if (vote) {
								model.updateById({
									class: 't_society_vote',
									id: vote_id,
									value: {
										total_disagree: parseInt(vote.total_disagree) + 1
									}
								}, function(ret, err) {
									if (ret) {
										//alert(JSON.stringify(ret));
										var tpl = '';
										tpl += '<li class="processed ">';
										tpl += '已反对';
										tpl += '</li>';
										$(parent).after(tpl);
										$api.addCls(parent, 'hidden');
										api.hideProgress();
									}
								});
							}
						});
					}
				});

			}
		});
	}
}

function deleteVote(obj) {
	var vote_id = $(obj).attr('id');
	var vote_index = -1;
	for (var i = 0; i < vote_list.length; i++) {
		if (vote_id == vote_list[i].id) {
			vote_index = i;
			break;
		}
	}
	var model = api.require('model');
	model.config({
		appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8'
	});

	var relation_m = api.require('relation');

	api.confirm({
		title: '提示',
		msg: '确定删除投票"' + vote_list[vote_index].vote_name + '"吗?',
		buttons: ['确定', '取消']
	}, function(ret, err) {
		if (ret.buttonIndex == 1) {

			relation_m.deleteAll({
				class: 't_society_vote',
				id: vote_id,
				column: 't_society_vote_involved'
			}, function(ret, err) {
				if (ret) {
					//do something
					model.deleteById({
						class: 't_society_vote',
						id: vote_id,
					}, function(ret, err) {
						if (ret) {
							api.toast({
								msg: '删除成功'
							});
							var parent = $api.closest(obj, '.vote_item');
							$api.addCls(parent, 'hidden');
						}
					});
				}
			});
		}
	});
}

function getPublisherInfo(result) {
	//	alert(JSON.stringify(result));
	temp_user_info_list = result;
	getUserSectionAndPostion(temp_user_id_list, 'vote_list');
}

function getSectionIndex(id) {
	for (var i = 0; i < temp_section_position_list.length; i++) {
		if (id == temp_section_position_list[i].user_id) {
			return i;
		}
	}
	return -1;
}

function getUserIdIndex(id) {
	for (var i = 0; i < temp_user_info_list.length; i++) {
		if (id == temp_user_info_list[i].id) {
			return i;
		}
	}
	return -1;
}

function getMyVoteIndex(id) {
	for (var i = 0; i < temp_my_vote_list.length; i++) {
		if (id == temp_my_vote_list[i].vote_id) {
			return i;
		}
	}
	return -1;
}

function isExits(id, obj_list) {
	//	alert(JSON.stringify(vote));
	for (var i = 0; i < obj_list.length; i++) {
		if (id == obj_list[i].id)
			return true;
	}
	return false;
}

function showVoteList(sectionAndPostion) {

	temp_section_position_list = sectionAndPostion;
	//	alert("section_position_list=" + JSON.stringify(section_position_list));

	//	alert(vote_list.length);
	var tpl = '';
	for (var i = 0; i < temp_vote_list.length; i++) {

		var idIndex = getUserIdIndex(temp_vote_list[i].t_publisher_id);
		var sectionIndex = getSectionIndex(temp_vote_list[i].t_publisher_id);
		var myVoteIndex = getMyVoteIndex(temp_vote_list[i].id);

		tpl += '<li class="vote_item ">';
		tpl += '<ul class="item_content_list ">';

		tpl += '<li class="title ">';
		tpl += '<img class="head " src = "' + temp_user_info_list[idIndex].head + '" onclick="open_personal_info(\'' + temp_vote_list[i].t_publisher_id + '\')"></img>';
		tpl += '<div class="person ">';
		tpl += '<span class="name ">' + temp_user_info_list[idIndex].real_name + '</span>';

		if (temp_section_position_list[sectionIndex])
			tpl += '<span class="duty ">(' + temp_section_position_list[sectionIndex].section_id.section_name + '/' + temp_section_position_list[sectionIndex].society_member_position + ')</span>';
		else
			tpl += '<span class="duty ">(部门已删/无职位)</span>';
		tpl += '<p class="time ">';
		tpl += changDateFormation(temp_vote_list[i].createdAt);
		tpl += '</p>';
		tpl += '</div>';
		if (temp_vote_list[i].t_publisher_id == $api.getStorage('user_id')) {
			tpl += '<img class="delete_vote " id = "' + temp_vote_list[i].id + '" onclick="deleteVote(this)" src="../image/remove.png"/>';
		} else {
			tpl += '<img class="delete_vote hidden" id = "' + temp_vote_list[i].id + '" onclick="deleteVote(this)" src="../image/remove.png"/>';
		}
		tpl += '</li>';

		tpl += '<li class="topic ">';
		tpl += '主题：<span>' + temp_vote_list[i].vote_name + '</span>';
		tpl += '</li>';

		tpl += '<li class="deadline ">';
		tpl += '截止：<span>' + changDateFormation(temp_vote_list[i].vote_end_time) + '</span>';
		tpl += '</li>';

		var deadline = getDateFromString(temp_vote_list[i].vote_end_time);
		var date_now = new Date();

		var vote_total = temp_vote_list[i].vote_total_number;
		var waiver = temp_vote_list[i].vote_total_number - temp_vote_list[i].total_agree - temp_vote_list[i].total_disagree;

		if (date_now.getTime() > deadline.getTime() || waiver == 0) {
			//*****************已到结束时间或者所有人已经投票****
			//已结束,显示投票结果
			tpl += '<li class="result">';
			tpl += '<span>结果：</span>';
			tpl += '<div>';
			tpl += '总票：<span class="total ">' + vote_total + '</span> &nbsp;&nbsp;&nbsp;&nbsp; 弃权：';
			tpl += '<span class="total ">' + waiver + '</span>';
			tpl += '<br/> 同意：';
			tpl += '<span class="agree ">' + temp_vote_list[i].total_agree + '</span> &nbsp;&nbsp;&nbsp;&nbsp; 反对：';
			tpl += '<span class="disagree ">' + temp_vote_list[i].total_disagree + '</span>';
			tpl += '</div>';
			tpl += '</li>';
		} else if (temp_my_vote_list[myVoteIndex].vote_result == 0) {
			//还没投票
			tpl += '<li class="action " id = "' + temp_my_vote_list[myVoteIndex].id + '"  name = "' + temp_vote_list[i].id + '">';
			tpl += '<div class="agree" tapmode="" onclick="voteAction(1,this)">同意</div>';
			tpl += '<div class="disagree" tapmode="" onclick="voteAction(0,this)">反对</div>';
			tpl += '</li>';
		} else if (temp_my_vote_list[myVoteIndex].vote_result == 1) {
			tpl += '<li class="processed">';
			tpl += '已同意';
			tpl += '</li>';
		} else {
			tpl += '<li class="processed">';
			tpl += '已反对';
			tpl += '</li>';
		}
		tpl += '</ul>';
		tpl += '</li>';

	}
	if ($('.vote_list').html() == '<div class="tips">暂时没有投票内容</div>') {
		$('.vote_list').html('');
		hasContent = false;
	}

	if (load_type == 0) {
		$('.vote_list').prepend(tpl);
	} else
		$('.vote_list').append(tpl);
	hasContent = true;
	api.refreshHeaderLoadDone();
	api.hideProgress();
}

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
		loadingVote(0);
	});

	loadingVote(1);

	//上拉加载
	api.addEventListener({
		name: 'scrolltobottom',
		extra: {
			threshold: -50 //设置距离底部多少距离时触发，默认值为0，数字类型
		}
	}, function(ret, err) {
		loadingVote(1);
	});
};

function reflesh() {

	loadingChat(1);
}

function loadingVote(flag) {

	//没有最新的则变为加载更多
	if (flag == 0 && newest_time == '')
		flag = 1;

	//加载投票列表
	var model = api.require('model');
	var query = api.require('query');
	var relation = api.require('relation');
	model.config({
		appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8'
	});

	load_type = flag;
	var page = 0;
	//根据上拉还是下来设定第几页
	if (flag == 1) {
		page = (pageIndex - 1) * pageCount;

		//alert('pageIndex=' + pageIndex);
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

			if (flag == 1) {
				//				alert(pageIndex);
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

			query.whereEqual({
				qid: queryId,
				column: 'vote_user_id',
				value: $api.getStorage('user_id')
			});

			//			alert(page);
			model.findAll({
				class: "t_society_vote_involved",
				qid: queryId
			}, function(myVoteList, err) {

				if (myVoteList) {

					//					alert(myVoteList.length);
					if (myVoteList.length > 0) {

						if (firstLoad || load_type == 0) {
							newest_time = myVoteList[0].createdAt;
						}

						firstLoad = false;

						if (myVoteList.length == pageCount && load_type == 1)
							pageIndex++;
						//页数加1

						temp_my_vote_list = myVoteList;

						var vote_id_list = [];
						//alert(JSON.stringify(my_vote_list));
						for (var i = 0; i < myVoteList.length; i++) {
							vote_id_list.push(myVoteList[i].vote_id);
						}
						vote_id_list.push('**********');
						//						alert(JSON.stringify(vote_id_list));
						query.createQuery(function(ret, err) {
							if (ret && ret.qid) {
								var queryId = ret.qid;

								query.desc({
									qid: queryId,
									column: 'createdAt'
								});

								query.whereContainAll({
									qid: queryId,
									column: 'id',
									value: vote_id_list
								});

								query.limit({
            qid:queryId,
            value:1000
        });
        model.findAll({
									class: "t_society_vote",
									qid: queryId
								}, function(ret, err) {
									if (ret && ret.length > 0) {
										//alert(JSON.stringify(ret));
										temp_vote_list = new Array();

										//去除重复的投票
										for (var i = 0; i < ret.length; i++) {
											if (!isExits(ret[i].id, vote_list)) {
												vote_list.push(ret[i]);
												temp_vote_list.push(ret[i]);
											}
										}
										//alert(temp_vote_list.length);
										temp_user_id_list = new Array();
										//获取发起者信息
										if (temp_vote_list.length > 0) {
											for (var j = 0; j < temp_vote_list.length; j++) {
												if (!isExits(temp_vote_list[j].t_publisher_id, temp_user_id_list)) {
													temp_user_id_list.push(temp_vote_list[j].t_publisher_id);
												}
											}
											temp_user_id_list.push('*****');
											getUserKeyInfo(temp_user_id_list, getPublisherInfo);

										} else {
											api.toast({
												msg: '没有更多内容了...',
												duration: 1500,
												location: 'middle'
											});
											api.hideProgress();
											api.refreshHeaderLoadDone();
										}
									} else {
										if (ret.length == 0) {
											api.toast({
												msg: '没有更多内容了...',
												duration: 1500,
												location: 'middle'
											});
										} else {
											alertError(err);
										}
										api.refreshHeaderLoadDone();
									}
								});
							}
						});
					} else {
						if (!hasContent)
							$('.vote_list').html('<div class="tips">暂时没有投票内容</div>');
						api.hideProgress();
						api.refreshHeaderLoadDone();
					}
				} else {
					alertError(err);
				}
			});
		}
	});
}