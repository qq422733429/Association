var member_list = [];
//成员列表
var societyID = '';
var userID = '';
var secID = '';
var section_member_map = new Object();
//部门-成员列表的map
var sectionMsg;
var is_first_show = new Object();
var pageParam = "";
//所有用户成员信息和所有用户个人信息
var allUserMsgArr = [];
var allUserInfoMsgArr = [];
var allMemberMsgArr = [];
var allUserIDArr = [];
var pageFlag = 'false';

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

/**
 * 根据部门ID查询部门成员,返回成员列表,部门-成员列表的map
 * @param {Object} secId 部门id，不能为空
 * @param {Object} societyID 社团id，不能为空
 * @param {Object} obj 触发查询的对象 ,可以为空
 * @param {Object} where 来自哪里,可以为空
 */
function getDepMember(secId ,societyID ,where, obj) {

	var model = api.require('model');
	var query = api.require('query');
	var relation = api.require('relation');
	var secMemberList = new Object();
	
	model.config({
		appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8'
	});
	
	//创建查询
	query.createQuery(function(ret, err) {
	    if (ret && ret.qid) {
	        var queryId = ret.qid;
	        //查询条件
	        query.whereEqual({
	            qid: queryId,
	            column: 'section_id',
	            value: secId
	        });
	        query.whereEqual({
	            qid: queryId,
	            column: 'society_id',
	            value: societyID
	        });
	        
	        //查询
	        query.limit({
            qid:queryId,
            value:1000
        });
        model.findAll({
	            class: "t_society_member",
	            qid: queryId
	        }, function(ret, err) {
	            if (ret) {
	            	secMemberList[secId] = ret;
//	            	api.alert({
//	            		msg: "secMemberList:" + JSON.stringify(secMemberList[secId]),
//	            	});
	            	//在这里回调
					if (where == 'dep_show') {
						//部门管理
						showSectionList(secMemberList, secId, obj);
					}
	            }
	            else{
	            	api.toast({
					    msg: '没有找到对应部门的社团成员，请检查!',
					    duration:2000,
					    location: 'middle'
					});
	            }
	
	        });
	    }
	});
}

//显示某个部门的所有成员
function showSectionList(secMemberList, secId, obj){
	var tpl = '';
	var localSecMemberList = secMemberList;
	var model = api.require('model');
	model.config({
		appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8'
	});
	//查找部门对应信息
	model.findById({
	    class: 't_society_section',
	    id: secId
	},function(ret, err){
	    if(ret){
	    	sectionMsg = ret;
	    	
	        tpl += '';
			tpl += '<li tapmode="tap" id="' + secId + '" class="expandable" >';
			tpl += '<div>' + sectionMsg.section_name + '(' + secMemberList[secId].length + ')</div>';
			tpl += '</li>';
			tpl += '<li class="member hidden">';
			tpl += '</li>';
			
			$('.member_list').html(tpl);
			api.parseTapmode();
			is_first_show[secId] = false;
			
			//添加点击事件
			$('.expandable').on('click', function() {
				var section_id = $(this).attr('id');
//				api.alert({
//					msg: "secId:" + secId + ", section_id:" + section_id,
//				});
				if (is_first_show[section_id]) {
					showMember(this);
				} else {
		//			alert('没有');
					setSectionInfo(section_id, localSecMemberList,this);
				}
			});
	    }
	});

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

function setSectionInfo(sectionId, secMemberList,obj) {
	//2015-8-17,Modified by lzm
	var member_list = secMemberList[sectionId];
	var user_list = [];
	var model = api.require('model');
	var query = api.require('query');
	//成员显示计数
	var count = 0;
//	api.alert({
//		msg: "member_list:" + JSON.stringify(member_list),
//	});
	if(0 != member_list.length){
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
	}
	
	is_first_show[sectionId] = true;
	showSectionMember(obj);
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

apiready = function() {	
	var myDate = new Date();
	var yearStr = myDate.getFullYear();
//	var yearStr = '2015';
	
	societyID =  $api.getStorage('society_id');
	userID = $api.getStorage('user_id');
//	alert( "localStorage societyID:" + societyID + ",userID:" + userID );
	if('' == societyID || '' == userID || ('undefined'== typeof(societyID)) || ('undefined'== typeof(userID))){
		api.toast({
		    msg: '获取用户ID或本社团ID错误,请重试或者重新登录~',
		    duration:2000,
		    location: 'bottom'
		});
		return;
	}
	
	//获取页面传递的参数
	var pageParam = api.pageParam;
	pageFlag = pageParam.pageFlag;
	var pageParamSecID = pageParam.sec_id;
	if('true' == pageFlag){
		secID = pageParamSecID;
//		alert("pageFlag:" + pageFlag + ",pageParamSecID:" + pageParamSecID);
	}
	else{
		api.toast({
		    msg: '没有获取到对应部门的ID,请重试或者重新登录~',
		    duration:2000,
		    location: 'bottom'
		});
		return;
	}
	getDepMember(secID , societyID, 'dep_show', null);
}
