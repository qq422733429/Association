var message_list = [];

var pageIndex = 1;
//默认加载第一页
var pageCount = 10;
//每页加载五条

var load_type = 0;
var temp_message_list;
var temp_user_info_list;
var temp_user_id_list;
var newest_time = '';
var firstLoad = true;
var hasContent = false;

apiready = function() {

	//	//加载私信列表

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
		loadingChat(0);
	});

	loadingChat(1);

	//上拉加载
	api.addEventListener({
		name: 'scrolltobottom',
		extra: {
			threshold: 0 //设置距离底部多少距离时触发，默认值为0，数字类型
		}
	}, function(ret, err) {
		loadingChat(1);
	});
}

function loadingChat(flag) {

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

			query.whereLike({
				qid: ret.qid,
				column: 'involved_user_id',
				value: $api.getStorage('user_id')
			});
			query.limit({
            qid:ret.qid,
            value:1000
        });

			model.findAll({
				class: 't_chat_message',
				qid: queryId
			}, function(messageList, err) {

				//				alert(JSON.stringify(messageList));
				if (messageList.length > 0) {

					if (firstLoad || load_type == 0) {
						newest_time = messageList[0].createdAt;
					}

					firstLoad = false;
					if (messageList.length == pageCount && load_type == 1)
						pageIndex++;
					//页数加1
					temp_message_list = new Array();

					//去除重复的信息
					//vote_list = ret;
					for (var i = 0; i < messageList.length; i++) {
						if (findIndex(messageList[i].id, message_list) == -1) {
							message_list.push(messageList[i]);
							temp_message_list.push(messageList[i]);
						}
					}
					//alert(JSON.stringify(my_vote_list));

					//设置为已读
					setReadStatus();

					temp_user_id_list = new Array();
					for (var i = 0; i < temp_message_list.length; i++) {
						//保存发送者信息
						if (findIndex(temp_message_list[i].sender_id, temp_user_id_list) == -1) {
							temp_user_id_list.push(temp_message_list[i].sender_id);
						}
						//保存接收者信息
						if (findIndex(temp_message_list[i].receiver_id, temp_user_id_list) == -1) {
							temp_user_id_list.push(temp_message_list[i].receiver_id);
						}
					}
					temp_user_id_list.push('*********');
					//获取发起者信息
					if (message_list.length > 0) {
						getUserKeyInfo(temp_user_id_list, show_chat_list);
					} else {
						alertError(err);
						api.refreshHeaderLoadDone();
						api.toast({
							msg: '没有更多内容了...',
							duration: 1500,
							location: 'middle'
						});
					}
				} else {
					if (!hasContent)
						$('#chat_list').html('<div class="tips">没有私信内容哦...赶紧去找个人聊聊吧~</div>');
					api.hideProgress();
					api.refreshHeaderLoadDone();
				}

			});
		}
	});
}

function getUserInfoIndex(id) {
	for (var i = 0; i < temp_user_info_list.length; i++) {
		if (id == temp_user_info_list[i].id) {
			return i;
		}
	}
	return -1;
}

function show_chat_list(userInfoList) {

	temp_user_info_list = new Array();
	temp_user_info_list = userInfoList;

	var tpl = '';
	for (var i = 0; i < temp_message_list.length; i++) {

		var sender_index = getUserInfoIndex(temp_message_list[i].sender_id);
		var receiver_index = getUserInfoIndex(temp_message_list[i].receiver_id);
		var date_time = changDateFormation(temp_message_list[i].createdAt);

		tpl += '<li class="message_item" name ="' + temp_message_list[i].id + '" tapmode="tap">';
		tpl += '<img class="head" src="' + temp_user_info_list[sender_index].head + '" tapmode="" onclick = "open_personal_info(\'' + temp_message_list[i].sender_id + '\')"></img>';

		if (temp_message_list[i].receiver_id == $api.getStorage('user_id')) {
			//别人发送给我的
			tpl += '<div class="message_right" id="' + temp_message_list[i].sender_id + '"  onclick = chat(this)>';
			tpl += '<div class="first_line">';
			tpl += '<div class="person_name">' + temp_user_info_list[sender_index].real_name + '</div>';
		} else {
			//不是别人发送给我的。我发送给别人的或者我发送给自己的
			tpl += '<div class="message_right" id="' + temp_message_list[i].receiver_id + '" tapmode="" onclick = chat(this)>';
			tpl += '<div class="first_line">';
			tpl += '<div class="person_name"> 我对 ' + temp_user_info_list[receiver_index].real_name + '说：</div>';
		}

		tpl += '<div class="activity">' + date_time + '</div>';
		tpl += '</div>';
		tpl += '<div class="message_content">';
		tpl += temp_message_list[i].content;
		tpl += '</div>';
		tpl += '</div>';
		tpl += '</li>';
	}

	if ($('#chat_list').html() == '<div class="tips">没有私信内容哦...赶紧去找个人聊聊吧~</div>') {
		$('#chat_list').html('');
		hasContent = false;
	}

	if (load_type == 0) {
		$('#chat_list').prepend(tpl);
	} else
		$('#chat_list').append(tpl);

	api.refreshHeaderLoadDone();
	hasContent = true;

	$('li').swipe({
		swipeLeft: function(event, distance, duration, fingerCount, fingerData) {
			deleteChat(this);
		},
		swipeRight: function(event, distance, duration, fingerCount, fingerData) {
			deleteChat(this);
		}
	});

	$('li').trigger('swipe');

	api.parseTapmode();
}

function deleteChat(target) {

	var message_id = $(target).attr('name');
	if (message_id == null) {
		api.alert({
			msg: '被删除的id不存在!'
		})
		return;
	}
	//加载投票列表
	//	alert(message_id);
	var model = api.require('model');
	model.config({
		appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8'
	});

	api.confirm({
		title: '提示',
		msg: '确定删除私信?',
		buttons: ['确定', '取消']
	}, function(ret, err) {

		if (ret.buttonIndex == 1) {
			model.deleteById({
				class: 't_chat_message',
				id: message_id
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

function chat(obj) {
	var receiver_id = $api.attr(obj, 'id');
	writeMessage(receiver_id, insertChatMessage);
}

function setReadStatus() {

	for (var i = 0; i < temp_message_list.length; i++) {

		var model = api.require('model');
		model.config({
			appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8'
		});

		if (temp_message_list[i].status == '0') {
			model.updateById({
				class: 't_chat_message',
				id: temp_message_list[i].id,
				value: {
					status: '1'
				}
			}, function(ret, err) {});
		}
	}

}


function clearChatMessage() {
	if (message_list.length > 0) {
		api.confirm({
			title: '提示',
			msg: '将要清空列表中所有的私信',
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

				for (var i = 0; i < message_list.length; i++) {
					var id = message_list[i].id;
					model.deleteById({
						class: 't_chat_message',
						id: id,
					}, function(ret, err) {
						if (ret) {
							count++;
							if (count == message_list.length) {
								var list = $api.domAll('li');
								for (var j = 0; j < list.length; j++) {
									$api.addCls(list[j], 'hidden');
								}
								message_list = [];
								api.hideProgress();
							}
						}
					});
				}
			}
		});
	}
}