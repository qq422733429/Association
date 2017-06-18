var section_list = [];
//社团部门列表

var member_list = [];
//成员列表

var society_id;

var section_member_map = new Object();
//部门-成员列表的map

var is_first_show = new Object();
var deleting = false;
var user_info_list = [];
var clickable = true;

apiready = function() {
	var pageParam = api.pageParam;
	var pageFlag = pageParam.pageFlag;

	if (pageFlag == 'true')
		society_id = pageParam.society_id;
	else
		society_id = $api.getStorage('society_id');
	loadSectionList();
}

function loadSectionList() {
	if (society_id) {
		api.showProgress({
			style: 'default',
			animationType: 'fade',
			title: '加载中...',
			text: '先喝口茶...',
			modal: false
		});
		getSocietyMember(society_id, 'club_member_list', null);
	}
}

function showSectionList_MemberList(members, sections, section_member_map, obj) {

	api.hideProgress();
	section_list = sections;
	member_list = members;
	this.section_member_map = section_member_map;
	//保存部门列表
	var section = sections;
	var tpl = '';
	//alert(section.length);
	for (var i = 0; i < section.length; i++) {
		//保存所有的id
		tpl += '';
		tpl += '<li tapmode="tap" id="' + section[i].id + '" class="expandable" >';
		tpl += '<div>' + section[i].section_name + '(' + section_member_map[section[i].id].length + ')</div>';
		tpl += '</li>';
		tpl += '<li class="member hidden">';
		tpl += '</li>';
	}
	$('.member_list').html(tpl);
	api.parseTapmode();
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
		content += '<li class="person_item" tapmode="tap">';
		content += '<a class="person_head" onclick="open_personal_info(\'' + member_list[j].user_id + '\')"><img src="' + user_info_list[userIndex].head + '" /></a>';
		content += '<div class="left">';
		content += '	<span class="person_name">';
		content += user_info_list[userIndex].real_name;
		content += '	</span>';
		content += '	<span class="duty">';
		content += member_list[j].society_member_position;
		content += '	</span>';
		content += '</div >';
		content += '<a class="button" tapmode="" id="' + member_list[j].user_id + '" onclick="chat(this)">私信</a>';
		content += '</li>';
		content += '</ul>';
	}
	//取得下一个元素
	var el = $(obj).next();
	el.append(content);
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