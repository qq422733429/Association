var section_list = [];
//社团部门列表

var member_list = [];
//成员列表

var section_member_map = new Object();
//部门-成员列表的map

var is_first_show = new Object();
var deleting = false;
var user_info_list = [];
var section_number_length = new Object();
var clickable = true;

function createSection() {
	var $sectioName = $api.byId('setction_name');
	var name = $sectioName.value;
	if (name === "") {
		api.alert({
			msg: '部门名不能为空！'
		});
		return;
	}
	if (name.length > 5) {
		api.alert({
			msg: '部门名不能多于五个字！'
		});
	}

	for (var k = 0; k < section_list; k++) {
		if (name.trim() == section_list[k].section_name) {
			api.alert({
				msg: '部门名不能重复！'
			});
			return;
		}
	}
	//联网创建部门
	//	alert(name);

	api.showProgress({
		style: 'default',
		animationType: 'fade',
		title: '加载中...',
		text: '先喝口茶...',
		modal: false
	});

	var relation = api.require('relation');
	relation.insert({
		class: 't_society',
		column: 't_society_section',
		id: $api.getStorage('society_id'),
		value: {
			section_name: name
		}
	}, function(ret, err) {
		if (ret) {

			api.hideProgress();
			$sectioName.value = '';
			loadSectionList();

		} else {
			alertError(err);
		}
	});

}

apiready = function() {
	loadSectionList();
}

function loadSectionList() {
	api.showProgress({
		style: 'default',
		animationType: 'fade',
		title: '加载中...',
		text: '先喝口茶...',
		modal: false
	});
	getSocietyMember($api.getStorage('society_id'), 'section_manage', null);
}

function showSectionList_sectionManage(members, sections, section_member_map, obj) {

	api.hideProgress();
	section_list = sections;
	member_list = members;
	this.section_member_map = section_member_map;
	//保存部门列表
	var section = sections;
	var tpl = '';
	//			alert(section.length);
	for (var i = 0; i < section.length; i++) {
		section_number_length[section[i].id] = section_member_map[section[i].id].length;
		//保存所有的id
		tpl += '';
		tpl += '<li tapmode="" id="' + section[i].id + '" class="expandable" >';
		tpl += '<div class = "section_number">' + section[i].section_name + '(' + section_member_map[section[i].id].length + ')</div>';
		tpl += '</li>';
		tpl += '<li class="member hidden">';
		tpl += '</li>';
	}
	$('.member_list').html(tpl);

	for (var i = 0; i < section.length; i++) {
		is_first_show[section.id] = false;
	}

	$('.expandable').on('click', function() {

		var section_id = $(this).attr('id');

		if (deleting == false && section_member_map[section_id].length > 0) {
			var el = $(this).next();
			if (el.hasClass('hidden')) {
				//未展开
				var expandableCSS = "url(../image/icon_club_evaluation_down.png)";
				$(this).css('background-image', expandableCSS);
			} else {
				var expandableCSS = "url(../image/icon_club_evaluation_right.png)";
				$(this).css('background-image', expandableCSS);
			}
			if (is_first_show[section_id]) {
				showSectionMember(this);
			} else {
				if (clickable == true) {
					getMemberInfo(section_id, this);
					clickable = false;
				}
			}
		} else if (deleting == true && section_member_map[section_id].length == 0) {
			deleteSection(section_id, this);
		}
	});
}

function showSectionMember(obj) {
	var el = $(obj).next();
	if (el.hasClass('member')) {
		el.toggleClass('hidden');
		//切换，有则移除，没有则添加
	}
}

function findUserInfoIndex(userId) {
	for (var i = 0; i < user_info_list.length; i++) {
		if (userId == user_info_list[i].id)
			return i;
	}
	return -1;
}

function getMemberInfo(sectionId, obj) {

	var member_in_section = section_member_map[sectionId];

	//alert(JSON.stringify(member_in_section));
	var user_id_list = [];
	for (var i = 0; i < member_in_section.length; i++) {
		user_id_list.push(member_in_section[i].user_id);
	}
	user_id_list.push('********');
	api.showProgress({
		style: 'default',
		animationType: 'fade',
		title: '加载中...',
		text: '先喝口茶...',
		modal: false
	});
	getUserKeyInfo(user_id_list, addMemberSection, obj);
}

function addMemberSection(result, obj) {

	var section_id = $(obj).attr('id');
	var member_list = section_member_map[section_id];

	for (var i = 0; i < result.length; i++) {
		user_info_list.push(result[i]);
	}

	var content = '';
	for (var j = 0; j < member_list.length; j++) {

		var userIndex = findUserInfoIndex(member_list[j].user_id);
		content += '<ul>';
		content += '<li class="person_item">';
		content += '<a class="person_head"><img src="' + user_info_list[userIndex].head + '" onclick="open_personal_info(\'' + member_list[j].user_id + '\')"/></a>';
		content += '<div class="left">';
		content += '	<span class="person_name">';
		content += user_info_list[userIndex].real_name;
		content += '	</span>';
		content += '	<span class="duty">';
		content += member_list[j].society_member_position; 
		content += "<br/>"
		content += user_info_list[j].user_school_date.substring(2,4);
		content += "级"
		content += '	</span>';
		content += '</div >';
		content += '<a class="button" tapmode="" id="' + member_list[j].user_id + '" onclick="callphones(this)">电话</a>';
		content += '<a class="button" tapmode="" id="' + member_list[j].user_id + '" onclick="chat(this)">私信</a>';
		if (member_list[j].society_member_position != '社长')
			content += '<a class="button warming" tapmode=""  id="' + member_list[j].id + '" onclick="deleteMember(this)">删除</a>';
		content += '</li>';
		content += '</ul>';
	}
	//取得下一个元素
	var el = $(obj).next();
	el.html(content);
	api.hideProgress();
	clickable = true;
	is_first_show[$(obj).attr('id')] = true;
	showSectionMember(obj);
}

function chat(obj) {
	var member_id = $(obj).attr('id');
	//	alert(member_id);
	writeMessage(member_id);
}
function callphones(obj) {
	var member_id = $(obj).attr('id');
	//	alert(member_id);
	phoneCallx(member_id);
}

function show_personal_info(user_id, func_name) {
	var model = api.require('model');
	var query = api.require('query');

	model.config({
		appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8'
	});
	

	query.createQuery({}, function(ret, err) {
		//coding...
		if (ret && ret.qid) {
			var query_id = ret.qid;
			query.whereEqual({
				qid: query_id,
				column: 'id',
				value: user_id
			});
			query.limit({
            qid:query_id,
            value:1000
        });

		

			model.findAll({
				class: 'user',
				qid: query_id
			}, function(ret, err) {
				//coding...
				if (ret) {
					func_name(ret);
				} else {
					alert(JSON.stringify(err));
				}
			});
		} else {
			alert("无法获取qid!");
		}
	});

}






function phoneCallx(receiver_id) {
	show_personal_info(receiver_id, function(ret) {
		phone = ret[0].username;
		api.confirm({
		msg : "拨打电话"+phone.substring(0,3)+"****"+phone.substring(7,11),
		buttons : ['确定', '取消']
		}, function(ret, err) {
			if (ret.buttonIndex == 1){
			api.call({
		    number:phone
	    	});
	    	}
	    });
    });
	
}







function deleteSection(section_id, obj) {

	var section_index = -1;
	for (var i = 0; i < section_list.length; i++) {
		if (section_id == section_list[i].id)
			section_index = i;
	}

	api.confirm({
		title: '提示',
		msg: '确定删除部门"' + section_list[section_index].section_name + '"吗?',
		buttons: ['确定', '取消']
	}, function(ret, err) {
		if (ret.buttonIndex == 1) {
			var model = api.require('model');
			model.deleteById({
				class: 't_society_section',
				id: section_id,
			}, function(ret, err) {
				if (ret) {
					api.toast({
						msg: '删除成功'
					});
					$api.addCls(obj, 'hidden');
				}
			});
		}
	});

}

function deleteMember(obj) {

	var member_id = $(obj).attr('id');

	var member_index = -1;
	for (var i = 0; i < member_list.length; i++) {
		if (member_id == member_list[i].id)
			member_index = i;
	}

	var userIndex = findUserInfoIndex(member_list[member_index].user_id);


	//做逻辑删除
	api.confirm({
		title: '提示',
		msg: '确定删除成员"' + user_info_list[userIndex].real_name + '"吗',
		buttons: ['确定', '取消']
	}, function(ret, err) {
		if (ret.buttonIndex == 1) {

			var model = api.require('model');
			//			alert(member_id);
			model.updateById({
				class: 't_society_member',
				id: member_id,
				value: {
					is_deleted: 'true',
				}
			}, function(ret, err) {
				if (ret) {
					api.toast({
						msg: '删除成功'
					});
					var el = $api.closest(obj, '.person_item'); //取得父元素

					//部门人数减1
					var parent = $api.closest(el, '.member');
					var section_line = $(parent).prev();
					var section_brife = section_line.children();

					var section_id = $(section_line).attr('id');
					var index = findIndex(section_id, section_list);
					var number = section_number_length[section_id] - 1;
					section_number_length[section_id] = number;

					$(section_brife).html(section_list[index].section_name + '(' + number + ')');

					$api.addCls(el, 'hidden');
				}
			});
		}
	});
}

function deleteManage() {
	var list = $api.domAll('.expandable');

	if (deleting) {
		//结束删除状态
		deleting = false;
		$('.right').css('background-image', "url(../image/icon_manage.png)");
		for (var i = 0; i < list.length; i++) {
			var expandableCSS = "url(../image/icon_club_evaluation_right.png)";
			$(list[i]).css('background-image', expandableCSS);
		}
	} else {
		//开启删除状态
		deleting = true;
		$('.right').css('background-image', "url(../image/icon_save.png)");
		for (var i = 0; i < list.length; i++) {
			var section_id = $(list[i]).attr('id');
			var index = findIndex(section_id, section_list);
			if (section_member_map[section_id].length == 0 && section_list[index].section_name != '社员部') {
				//只能删除空部门
				var expandableCSS = "url(../image/remove.png)";
				$(list[i]).css('background-image', expandableCSS);
			}
		}
	}
}