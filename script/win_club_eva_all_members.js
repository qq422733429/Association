var section_list = [];
//社团部门列表

var member_list = [];
//成员列表

var section_member_map = new Object();
//部门-成员列表的map

var is_first_show = new Object();
//所有用户成员信息和所有用户个人信息
var allUserMsgArr = [];
var allUserInfoMsgArr = [];
var allMemberMsgArr = [];
var allUserIDArr = [];
var societyID = '';

apiready = function() {
	//2015-8-23,Added by lzm
	societyID =  $api.getStorage('society_id');
	if('' == societyID || ('undefined'== typeof(societyID))){
		api.toast({
		    msg: '获取本社团ID错误,请重试或者重新登录~',
		    duration:2000,
		    location: 'bottom'
		});
		return;
	}
	
	getSocietyMember( societyID, 'section_manage', null);

}
function showSectionList_sectionManage(members, sections, section_member_map, obj) {

	section_list = sections;
	member_list = members;
	this.section_member_map = section_member_map;
	//保存部门列表
	var section = sections;
	var tpl = '';
	//			alert(section.length);
	for (var i = 0; i < section.length; i++) {
		//保存所有的id
		tpl += '';
		tpl += '<li tapmode="tap" id="' + section[i].id + '" class="expandable" >';
		tpl += '<div>' + section[i].section_name + '(' + section_member_map[section[i].id].length + ')</div>';
		tpl += '</li>';
		tpl += '<li class="member hidden">';
		tpl += '</li>';
	}
//	api.alert({
//		msg: "tpl:" + JSON.stringify(tpl),
//	});
	$('.member_list').html(tpl);

	for (var i = 0; i < section.length; i++) {
		is_first_show[section.id] = false;
	}

	$('.expandable').on('click', function() {
		var section_id = $(this).attr('id');
		if (is_first_show[section_id]) {
			showSectionMember(this);
		} else {
//			alert('没有');
			setSectionInfo(section_id, this);
		}
	});
	
	//隐藏刷新
	api.hideProgress();
}

function showSectionMember(obj) {
	var el = $(obj).next(); //取得父元素
	if (el.hasClass('member')) {
		//2015-8-2,Added by lzm
		if(el.hasClass('hidden')){
			//当前被隐藏的话，开启右边箭头，否则开启下边箭头
			var expandableCSS = "url(../image/icon_club_evaluation_down.png)";
			$(obj).css('background-image', expandableCSS);
		}
		else{
			var expandableCSS = "url(../image/icon_club_evaluation_right.png)";
			$(obj).css('background-image', expandableCSS);
		}
		
		el.toggleClass('hidden'); //切换，有则移除，没有则添加
	}
}

function setSectionInfo(sectionId, obj) {
	//2015-8-17,Modified by lzm
	var member_list = section_member_map[sectionId];
	var count = 0;
	var user_list = [];
	var model = api.require('model');
	var query = api.require('query');
	
	var count = 0;
	
	if(0 == member_list.length){
		api.toast({
		    msg: '本部门没有成员~',
		    duration:2000,
		    location: 'middle'
		});
	}else if(0 != member_list.length){
		api.showProgress({
			style : 'default',
			animationType : 'fade',
			title : '加载人员信息中...',
			text : '先喝口茶吧...',
			modal : false
		});
	}
	for (var i = 0; i < member_list.length; i++) {
		
//		api.alert({
//			msg: "member_list[i]:" + JSON.stringify(member_list[i])
//		});
		var singleMem = member_list[i];
		var user_id = singleMem.user_id;
		
//		api.alert({
//			msg:"setSectionInfo user_id:" + user_id + ",singleMem:" + JSON.stringify(singleMem),
//		});
//		allUserMsgArr[user_id] = 
		allMemberMsgArr[user_id] = singleMem;
		//查询用户把t_user_info表里面信息都查出来
		model.findById({
		    class: 'user',
		    id: user_id
		},function(ret, err){
		    if(ret){
		        var t_user_info = ret.t_user_info;
		        var userIDCur = ret.id;
//		        api.alert({
//		        	msg: "test userIDCur:" + userIDCur,
//		        });
		        allUserMsgArr[userIDCur] = ret;
		        
		        //继续查t_user_info信息
		        model.findById({
				    class: 't_user_info',
				    id: t_user_info
				},function(ret, err){
				    if(ret){
				        allUserInfoMsgArr[userIDCur] = ret;
				        
				        var content = '';
				        content += '<ul>';
						content += '<li class="person_item">';
						content += '<a class="person_head"><img src="' + allUserInfoMsgArr[userIDCur].user_header + '"' + ' tapmode="tap" onclick=\'open_personal_info("' + userIDCur + '")\'' + '/></a>';
						content += '<div class="left" tapmode="tap" onclick="openMemberEva(\'' + userIDCur + '\')">';
						content += '<span class="person_name">';
						content += allUserInfoMsgArr[userIDCur].user_real_name;
						content += '</span>';
						content += '<span class="duty">';
						content += allMemberMsgArr[userIDCur].society_member_position;
						content += '</span>';
						content += '<span id="clik_eva_tip" class="clik_eva_tip"></span>';
						content += '</div>';
						content += '</li>';
						content += '</ul>';
						
						var el = $(obj).next();
//						api.alert({
//							msg: "content:" + JSON.stringify(content),
//						});
						el.append(content);
						api.parseTapmode();
						count++;
						if(count == member_list.length){
							//全刷出来隐藏刷新
							api.hideProgress();
						}
				    }
				});
		    }
		});
		
//		query.createQuery(function(ret, err) {
////		    api.alert({
////				msg: "test000 member_list[i]:" + JSON.stringify(singleMem)
////			});
//		    
//		    if (ret && ret.qid) {
//		        var queryId = ret.qid;
//		        
//		        query.include({
//		            qid: queryId,
//		            column: 't_user_info'
//		        });
////		        api.alert({
////					msg: "test member_list[i]:" + JSON.stringify(singleMem)
////				});
//		        query.whereEqual({
//		            qid: queryId,
//		            column: 'id',
//		            value: user_id
//		        });
//		        api.alert({
//					msg:"setSectionInfo 222 user_id:" + user_id + ",singleMem:" + JSON.stringify(singleMem),
//				});
//		        model.findAll({
//		            class: "user",
//		            qid: queryId
//		        }, function(ret, err) {
//		            count++;
//					if (ret && (0 != ret.length)) {
//						var user_id_cur = ret[0].id;
//						allUserMsgArr[user_id_cur] = ret[0];
//						api.alert({
//							msg: "user_id_cur:" + user_id_cur,
//						});
//						//存储所有用户ID
//						allUserIDArr.push(user_id_cur);
//						
//						user_list.push(ret[0]);
//						if (count == member_list.length) {
//							//已经查询完毕
//							alert(member_list.length);
//							for (var j = 0; j < allUserIDArr.length; j++) {
//								var userID = allUserIDArr[j];
//								api.alert({
//									msg: "allUserIDArr in for userID:" + userID + ",allUserMsgArr[userID]:" + JSON.stringify(allUserMsgArr[userID]),
//								});
//								
//								content += '<ul>';
//								content += '<li class="person_item">';
//								content += '<a class="person_head"><img src="' + allUserMsgArr[userID].t_user_info.user_header + '" /></a>';
//								content += '<div class="left" tapmode="tap" onclick="openMemberEva(\'' + allUserMsgArr[userID].id + '\')">';
//								content += '<span class="person_name">';
//								content += allUserMsgArr[userID].t_user_info.user_real_name;
//								content += '</span>';
//								content += '<span class="duty">';
//								content += allMemberMsgArr[userID].society_member_position;
//								content += '</span>';
//								content += '<span id="clik_eva_tip" class="clik_eva_tip">点击跳转到该社员考核页面</span>';
//								content += '</div>';
//								content += '</li>';
//								content += '</ul>';
//							}
//							//取得下一个元素
//							var el = $(obj).next();
//		//					api.alert({
//		//						msg: "content:" + JSON.stringify(content),
//		//					});
//							el.append(content);
//							api.parseTapmode();
//							is_first_show[sectionId] = true;
//							showSectionMember(obj);
//						}
//					}
//		
//		        });
//		    }
//		});

	}
	
	
//	//取得下一个元素
//	var el = $(obj).next();
//	api.alert({
//		msg: "content:" + JSON.stringify(content),
//	});
//	el.append(content);
	is_first_show[sectionId] = true;
	showSectionMember(obj);
}

function showMember(obj) {
	var el = $(obj).next(); //取得父元素
	if (el.hasClass('member')) {
		//2015-8-2,Added by lzm
		if(el.hasClass('hidden')){
			//当前被隐藏的话，开启右边箭头，否则开启下边箭头
			var expandableCSS = "url(../image/icon_club_evaluation_down.png)";
			$(obj).css('background-image', expandableCSS);
		}
		else{
			var expandableCSS = "url(../image/icon_club_evaluation_right.png)";
			$(obj).css('background-image', expandableCSS);
		}
		
		el.toggleClass('hidden'); //切换，有则移除，没有则添加
	}
}

function returnParentWin() {
	api.closeWin({
	});
}

function openMemberEva(userID) {
	api.openWin({
		name : 'win_club_evaluation_members',
		url : 'win_club_evaluation_members.html',
		pageParam: {
			user_id: userID,
			pageFlag: 'true',
		}
	});
}
