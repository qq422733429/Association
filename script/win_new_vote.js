function removePerson(obj) {
	var parent = $api.closest(obj, 'li');
	var i = $(parent).attr('id');
	selector.setSelect({
		indexs: [i]
	});
	$api.addCls(parent, 'hidden');
}


function getMember() {
	if (!clickable_2)
		return;
	clickable_2 = false;

	if (user_info_list.length != 0) {
		//		alert('不用重新获取');
		selector.show();
		clickable_2 = true;
	} else {
		//这里要调用common.js,拉去社团成员列表

		getSocietyMember($api.getStorage('society_id'), 'new_vote');
		api.showProgress({
			style: 'default',
			animationType: 'fade',
			title: '努力加载中...',
			text: '客官别着急...',
			modal: false
		});
	}
}

var user_info_list = [];
var section_member_map = new Object();
var member_list = [];
var section_list = [];
var array_title = new Array();
var to_select_member = new Array();
var selected_index = [];
var selector = new Object();

var clickable_1 = true;
var clickable_2 = true;

function findUserInfo(id) {
	for (var i = 0; i < user_info_list.length; i++) {
		if (id == user_info_list[i].id) {
			return i;
		}
	}
	return -1;
}

function findSectionInfo(id) {
	for (var i = 0; i < section_list.length; i++) {
		if (id == section_list[i].id) {
			return i;
		}
	}
	return -1;
}

function setMemberList(userInfoList) {

	user_info_list = userInfoList;
	//alert(JSON.stringify(member_list));

	for (var i = 0; i < section_list.length; i++) {
		var section_id = section_list[i].id;
		//		alert('section_id='+section_id);
		var memberInSection = section_member_map[section_id];
		for (var j = 0; j < memberInSection.length; j++) {
			var user_index = findUserInfo(memberInSection[j].user_id);
			var section_index = findSectionInfo(memberInSection[j].section_id);
			var select_item = {
				id: memberInSection[j].user_id,
				name: user_info_list[user_index].real_name,
				section_name: section_list[section_index].section_name,
				pos: memberInSection[j].society_member_position,
				head: user_info_list[user_index].head
			}
			to_select_member.push(select_item);
			array_title.push(select_item.name + '(' + select_item.section_name + '/' + select_item.pos + ')');
		}
	}
	//	alert(JSON.stringify(to_select_member));

	clickable_2 = true;
	selector = api.require('multiSelector');
	selector.open({
		content: array_title,
		y: api.winHeight - 325,
		height: 325,
		cancelImg: 'widget://image/icon_cancel.png',
		enterImg: 'widget://image/icon_confirm.png',
		titleImg: 'widget://image/bg_select_title.png'
	}, function(ret, err) {

		//		alert(JSON.stringify(ret));
		var tpl = '';
		selected_index = new Array();
		for (var index in ret.selectAry) {

			var i = getSelectIndex(ret.selectAry[index]);

			//显示已选中的人列表
			tpl += '<li id = ' + i + '>';
			tpl += '<a class="head"></a>';
			tpl += '<div class="person">';
			tpl += '<span class="name">' + to_select_member[i].name + '</span>';
			tpl += '<div class="duty ">';
			tpl += to_select_member[i].section_name;
			tpl += '/';
			tpl += to_select_member[i].pos;
			tpl += '</div>';
			tpl += '<img src="../image/remove.png" tapmode="" onclick="removePerson(this)" />';
			tpl += '</div>';
			tpl += '</li>';
		}
		tpl += '<li class="add" tapmode="" onclick="getMember()">';
		tpl += '</li>';
		$('#selected_member_list').html(tpl);
	});

	api.hideProgress();
	selector.show();
}

function getUserInfo_newVote(memberList, sectionList, sectionMemberMap) {

	section_member_map = sectionMemberMap;
	member_list = memberList;
	section_list = sectionList;

	var user_id_list = [];

	for (var i = 0; i < memberList.length; i++) {
		user_id_list.push(memberList[i].user_id);
	}

	user_id_list.push(user_id_list[0]); //该API的数组只能大于等于2,只能添加一个不存在的。。。
	//	alert(JSON.stringify(user_id_list))
	getUserKeyInfo(user_id_list, setMemberList);
}


function getSelectIndex(str) {
	for (var i = 0; i < array_title.length; i++) {
		if (str == array_title[i]) {
			selected_index.push(i);
			//			alert(i)
			return i;
		}
	}
}

function selectTime(obj) {
	var date = '';
	api.openPicker({
		type: 'date',
		title: '选择日期'
	}, function(ret, err) {
		var year = ret.year;
		var month = ret.month;
		var day = ret.day;
		date = year + '-' + month + '-' + day + ' ';
		api.openPicker({
			type: 'time',
			title: '选择时间'
		}, function(ret, err) {
			var hour = ret.hour;
			var minute = ret.minute;
			if ((minute + '').length === 1) {
				minute = '0' + minute;
			}
			date = date + hour + ':' + minute;
			obj.value = date;
		});
	});
}

function publish() {

	if (!clickable_1)
		return;
	clickable_1 = false;
	if ($api.trim($api.dom('#topic').value) == "") {
		api.toast({
			msg: '主题不能为空',
			duration: 1000,
			location: 'bottom'
		});
		clickable_1 = true;
		return;
	}

	//	if ($api.trim($api.dom('#start_time').value) == "") {
	//		api.toast({
	//			msg: '开始时间不能为空',
	//			duration: 1000,
	//			location: 'bottom'
	//		});
	//		return;
	//	}

	if ($api.trim($api.dom('#end_time').value) == "") {
		api.toast({
			msg: '结束时间不能为空',
			duration: 1000,
			location: 'bottom'
		});
		clickable_1 = true;
		return;
	}

	if (selected_index.length == 0) {
		api.toast({
			msg: '投票人不能为空',
			duration: 1000,
			location: 'bottom'
		});
		clickable_1 = true;
		return;
	}

	//联网提交
	var model = api.require('model');
	model.config({
		appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8'
	});
	var relation = api.require('relation');

	api.showProgress({
		style: 'default',
		animationType: 'fade',
		title: '提交中...',
		text: '客官别着急...',
		modal: false
	});
	model.insert({
		class: 't_society_vote',
		value: {
			vote_name: $api.dom('#topic').value,
			//			vote_start_time: $api.dom('#start_time').value,
			vote_end_time: $api.dom('#end_time').value,
			vote_total_number: selected_index.length,
			t_publisher_id: $api.getStorage('user_id'),
			vote_status: 1, //1正在进行，0表示结束
			total_agree: 0,
			total_disagree: 0
		}
	}, function(ret1, err) {
		if (ret1) {

			//alert(JSON.stringify(ret1));

			var user_id_list = new Array();
			var count = 0;

			var receiver_id_list = [];
			for (var i = 0; i < selected_index.length; i++) {
				receiver_id_list.push(to_select_member[selected_index[i]].id);
			}

			//防止重复添加
			var exists = false;
			var my_id = $api.getStorage('user_id');
			for (var i = 0; i < receiver_id_list.length; i++) {
				if (my_id == receiver_id_list[i]) {
					exists = true;
					break;
				}
			}
			if (!exists)
				receiver_id_list.push(my_id);

			for (var i = 0; i < receiver_id_list.length; i++) {
				//继续联网插入投票人员
				//alert('下标:=' + selected_index[i] + JSON.stringify(to_select_member[selected_index[i]]));
				relation.insert({
					class: 't_society_vote',
					id: ret1.id,
					column: 't_society_vote_involved',
					value: {
						vote_user_id: receiver_id_list[i],
						vote_result: 0,
						vote_id: ret1.id
					}
				}, function(ret, err) {
					if (ret) {
						count++;
						if (count == receiver_id_list.length) {

							//插入消息表
							var message_list = [];
							var receiver_ids = '';
							for (var j = 0; j < receiver_id_list.length; j++) {
								var message = {
									type: 2,
									status: 0,
									content: '发起了新的投票:' + $api.dom('#topic').value,
									sender: $api.getStorage('user_id'),
									receiver: receiver_id_list[j],
									society: $api.getStorage('society_id')
								};
								message_list.push(message);
								receiver_ids += receiver_id_list[j] + ',';
							}
							insertNotice(message_list, alertSuccess);

							//在这里发送推送，没必要保证成功
							var message2 = {
								type: 2,
								content: '发起了新的投票:' + $api.dom('#topic').value,
								title: $api.getStorage('user_real_name'),
								receiver_id: receiver_ids
							};
							sendMessage(message2);
						}
					}
				});
			}
		} else {
			api.alert({
				msg: err.msg
			})
			clickable_1 = true;
		}
	});
}

function alertSuccess() {
	api.toast({
		msg: '发布成功！',
		duration: 1000,
		location: 'bottom'
	});


	api.execScript({
		name: 'win_vote_list',
		frameName: 'fra_vote_list',
		script: 'loadingVote(0)'
	});

	setTimeout('api.closeWin()', 1000);
}