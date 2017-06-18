var sectionMember = new Object();
function showMember(obj) {
	var el = $(obj).next();
	if (el.hasClass('member')) {
		//2015-8-2,Added by lzm
		if (el.hasClass('hidden')) {
			//当前被隐藏的话，开启右边箭头，否则开启下边箭头
			var expandableCSS = "url(../image/icon_club_evaluation_down.png)";
			$(obj).css('background-image', expandableCSS);
		} else {
			var expandableCSS = "url(../image/icon_club_evaluation_right.png)";
			$(obj).css('background-image', expandableCSS);
		}

		el.toggleClass('hidden');
		//切换，有则移除，没有则添加
	}

}



//获取社团的部门信息
function getClubSection(clubID, getSectionMember) {
	api.showProgress({
		style : 'default',
		animationType : 'fade',
		title : '努力加载...',
		text : '先歇歇吧...',
		modal : false
	});
	var model = api.require('model');
	var relation = api.require('relation');
	model.config({
		appKey : '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8',
		host : "https://d.apicloud.com"
	});
	relation.findAll({
		class : 't_society',
		id : clubID,
		column : 't_society_section'
	}, function(ret, err) {
		//coding...
		if (ret)
			if (ret.length > 0) {
				//  			api.alert({
				//  				msg:ret
				//  			});
				//  			alert("部门列表");
				getSectionMember(ret);
			} else {
				api.alert({msg:"该社团未创建任何部门"});
				api.hideProgress();
			}
		else{
		
			api.alert({msg:err.msg});
			api.hideProgress();
			 
		}
	});
}

function getSectionMember(sectionList) {

	//	api.alert({
	//		msg : sectionList
	//	});
	//	alert("部门列表");

	var actID = api.pageParam.activity_id;
	var model = api.require('model');
	var query = api.require('query');
	var qureyID;
	model.config({
		appKey : '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8',
		host : "https://d.apicloud.com"
	});
	query.createQuery({
	}, function(ret, err) {
		//coding...
		if (ret && ret.qid) {
			queryID = ret.qid;
			//  		alert(queryID);
			query.whereEqual({
				qid : queryID,
				column : 'activity_id',
				value : actID
			});
			query.desc({
				qid : queryID,
				column : 'createdAt'
			});
			query.whereEqual({
				qid : queryID,
				column : 'status',
				value : '1'
			});
			query.limit({
            qid:queryID,
            value:1000
        });
        model.findAll({
				class : 't_society_activity_enroll',
				qid : queryID
			}, function(ret, err) {
				//coding...
				if (ret) {
					if (ret.length > 0) {
						showMemberList(ret);
					} else {
						
						api.alert({msg:"还没有人报名哦"});
						api.hideProgress();
					}
				} else{
					api.alert({msg:err});
					api.hideProgress();
				}
			});
		} else
			alert(err);
	});

}

function changDateFormation(date) {
	date = date.replace('T', ' ');
	var pos = date.lastIndexOf(':');
	var subStr = date.substring(pos);
	return date.replace(subStr, '');

}

function isToday(date) {
	var myDate = new Date();
	var month = myDate.getMonth() + 1;
	var day = myDate.getDate();
	var hour = myDate.getHours();
	var minute = myDate.getMinutes();

	var pos = date.lastIndexOf(' ');
	var str = date.substring(0, pos);
//	alert(str);
	var month1 = str.substring(str.indexOf('-') + 1, str.lastIndexOf('-'));
	//	alert( month1);
	var day1 = str.substring(str.lastIndexOf('-') + 1, str.length);
	month1 = parseInt(month1, 10);
	day1 = parseInt(day1);
	// 	alert( month1);

	if (hour < 10)
		hour = "0" + hour.toString();
	if (minute < 10)
		minute = "0" + minute.toString;
	if (month1 == month && day == day1) {

		return "今天 " + hour + ':' + minute;
	} else
		return date;
}

function showMemberList(enroll) {

	for (var i = 0; i < enroll.length; i++) {
		if (Object.prototype.toString.call(sectionMember[enroll[i].user_section]) === '[object Array]') {
			sectionMember[enroll[i].user_section].push(enroll[i]);
		} else {
			sectionMember[enroll[i].user_section] = new Array();
			sectionMember[enroll[i].user_section].push(enroll[i]);

		}
	}

	var html = '';
	for (var key in sectionMember) {
		var expandable = '';
		var checking = '<ul >';
		var checked = '<ul >';
		var total = sectionMember[key].length;
		var checkNum = 0;
		for (var j = 0; j < total; j++) {
			var commen = '<li class="person_item">';
			commen += '<a tapmode="tap"onclick="open_personal_info('+"'"+sectionMember[key][j].enroll_user_id+"'"+')" class="person_head"><img src=' + sectionMember[key][j].user_head + ' /></a>';
			commen += '<div class="left"><div class="name_duty">' + sectionMember[key][j].user_name + ' ( ' + sectionMember[key][j].user_position + ' ) ' + '</div>';
			if (sectionMember[key][j].check_status == 0) {
				checking += commen + '<div style="color:#FFFFFF">12:20</div> </div>';
				var section_index = "'" + key + "'" + ',' + "'" + j + "'";
				checking += '<a tapmode="tap"class=" check" tapmode="" onclick="check(this,' + "'" + sectionMember[key][j].id + "'," + section_index + ');">签到</a></li>';
			} else if (sectionMember[key][j].check_status == 1) {
				checkNum++;
				checked += commen;
				checked += '<div class="check_time ">' + changDateFormation(sectionMember[key][j].updatedAt) + '</div></div>';
				checked += '<a class="button checked" >已签到</a></li>';
			}
		}
		checking += '</ul>';
		checked += '</ul>';
		expandable += '<li tapmode="" id = "' + key + '" class="expandable" onclick="showMember(this)">';
		expandable += '<div >' + key + '<span class="person_check">(' + checkNum + '/' + total + ')</span></div></li>';
		expandable += '<li class="member ">';
		html += expandable + checking + checked + '</li></li>';

	}
	//	alert(html);
	$api.append($api.dom(".member_list"), html);
	api.parseTapmode();
	api.hideProgress();
}

//key是部门名，j该是该成员在部门成员数组中的下表
function check(obj, enrollID, key, j) {
	var model = api.require('model');
	model.updateById({
		class : 't_society_activity_enroll',
		id : enrollID,
		value : {
			check_status : 1
		}
	}, function(ret, err) {
		//coding...
		if (ret) {
			var myDate = new Date();
			var hour = myDate.getHours();
			var minute = myDate.getMinutes();
			var ul = obj.parentNode.parentNode;
			var checkedDom = $(ul).next();
			var commen = '<li class="person_item">';
			commen += '<a class="person_head" tapmode="tap" onclick="open_personal_info('+"'"+sectionMember[key][j].enroll_user_id+"'"+')"><img src=' + sectionMember[key][j].user_head + ' /></a>';
			commen += '<div class="left"><div class="name_duty">' + sectionMember[key][j].user_name + ' ( ' + sectionMember[key][j].user_position + ' ) ' + '</div>';
			var checked = commen;
			checked += '<div class="check_time ">' + '今天 ' + hour + ':' + minute + '</div></div>';
			checked += '<a class="button checked" >已签到</a></li>';
			obj.parentNode.className = "hidden";
			$(checkedDom).prepend(checked);
			api.parseTapmode();
			var checkedNum = 0;
			for (var i = 0; i < sectionMember[key].length; i++) {
				if (sectionMember[key][i].check_status == 1)
					checkedNum++;
			}
			checkedNum++;
			var x = $("#" + key).children("div").children("span").text('( ' + checkedNum + '/' + sectionMember[key].length + ' )');

			api.toast({
				msg : '手动签到成功',

			});
			
		}
	});
}


function check_stop(){
api.showProgress({
		style : 'default',
		animationType : 'fade',
		title : '努力加载...',
		text : '先歇歇吧...',
		modal : false
	});

	api.confirm({
		msg : "您确定要停止签到吗？",
		buttons : ['确定', '取消']
	}, function(ret, err) {
					var actID = api.pageParam.activity_id;
					var model = api.require('model');
					var query = api.require('query');
					model.config({
							appKey : '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8',
							host : "https://d.apicloud.com"
						});
		
					model.updateById({
						class : 't_society_activity',
						id : actID,
						value : {
							activity_check_status : 0
						}
					}, function(ret, err) {
						if (ret) {
							api.alert({msg:"停止签到成功！"});
							
							api.hideProgress();
							api.closeToWin({
	                            name: 'index'
                            });
						}
					});
				});
}


apiready = function() {
	var clubID = $api.getStorage("society_id");
	
	getClubSection(clubID, getSectionMember);
}
