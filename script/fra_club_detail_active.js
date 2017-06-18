var citySchool = "";
var city = "";
//用一个全局变量存储用户信息，因为js是异步的语言，所以需要存下来
var societyUserInfo = [];
var societyRelativeInfo = [];
var society_id = "";
var societyID = "";
var userID = "";

function openClubActivity(){
	api.openWin({
		name : 'activity_list',
		url : '../html/win_club_activityList.html',
		pageParam: {
			society_id: societyID,
			pageFlag: 'true',
		}
	})
}

function openClubMember() {
	api.openWin({
		name : 'club_member',
		url : '../html/win_club_member_list.html',
		pageParam: {
			society_id: societyID,
			pageFlag: 'true',
		},
	})
}

function openClubFinance() {
	api.openWin({
		name : 'club_finance',
		url : '../html/win_club_finance.html',
		pageParam: {
			society_id: societyID,
			pageFlag: 'true',
		}
	})
}

//2015-7-31,Added by luozhengming,用户登录
/**
 * 用户登录
 * @param {Object} userName: 登录用户名
 * @param {Object} userPWD: 登录密码
 */
function userLogin(userName, userPWD) {
	var user = api.require('user');
	var model = api.require('model');
	//这里设置默认值的方法有待改进，待改进
	var localUserName = userName || '13308397475';
	var localUserPWD = userPWD ||  '123456';
	
	//model config
	model.config({
    	appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8',
    	appId: 'A6982914277502',
    	host: 'https://d.apicloud.com'
    });
	
	//login
	user.login({
	    username: localUserName,
	    password: localUserPWD
    },function(ret,err){
    	//coding...
    	if(ret) {
//			api.toast({
//			    msg: '登录成功!!!',
//			    duration:2000,
//			    location: 'middle'
//			});
    	}
    	else{
    		api.toast({
			    msg: '登录失败!!!',
			    duration:2000,
			    location: 'middle'
			});
    	}
    });
}

/**
 * 用户退出登录
 * @param {Object} NULL:无参数
 */
function userLogout() {
	var user = api.require('user');
	var model = api.require('model');
	
	//model config
	model.config({
    	appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8',
    	appId: 'A6982914277502',
    	host: 'https://d.apicloud.com'
    });
	
	user.logout({
    },function(ret,err){
    	//coding...
    	if(ret) {
    		api.toast({
			    msg: '退出成功!!!',
			    duration:2000,
			    location: 'middle'
			});
    	}
    	else {
    		api.toast({
			    msg: '退出失败!!!',
			    duration:2000,
			    location: 'middle'
			});
    	}
    });
}

//展示社团风采里面的社团详情信息
function showClubRelativeMsg(clubId) {
	api.showProgress({
	    style: 'default',
	    animationType: 'fade',
	    title: '努力加载社团资料中...',
	    text: '先喝杯茶吧...',
	    modal: false
	});
    
    //端方mcm访问数据库,并相应的填充前端页面
    var model = api.require('model');
    var user = api.require('user');
    var query = api.require('query');
    model.config({
    	appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8',
    	appId: 'A6982914277502',
    	host: 'https://d.apicloud.com'
    });

    //find club msg
    model.findById({
    	class: 't_society',
		id: clubId
    }, function(ret, err) {
    	if(ret) {
//  		alert("club info:" + JSON.stringify(ret));
			societyName = ret.society_name;
			societyRelativeInfo['societyName'] = ret.society_name;
			societyBadgeURL = ret.society_badge;
			societyRelativeInfo['societyBadgeURL'] = ret.society_badge;
			societyBadgeCSS = "background-image: url(" + ret.society_badge + ");";
			societyRelativeInfo['societyBadgeCSS'] = societyBadgeCSS;
			//社团简介
			clubBrief = ret.society_info;
			societyRelativeInfo['clubBrief'] = ret.society_info;
			//社团社长ID
			leaderUserID = ret.society_president;
			societyRelativeInfo['leaderUserID'] = ret.society_president;
			t_school_ID = ret.t_school;
			societyRelativeInfo['t_school_ID'] = ret.t_school;
		    t_user_info = "";
		    tpl = "";

		    query.createQuery(function (ret, err) {
			    if (ret && ret.qid) {
			        query.include({
			            qid: ret.qid,
			            column: 't_user_info'
			        });
			        
			        var queryId = ret.qid;
				    //query condition
		    		query.whereEqual({
			            qid: queryId,
			            column:'id',
			            value: leaderUserID
		            });
		            query.limit({
            qid:queryId,
            value:1000
        });
				    
				    //findAll
				    model.findAll({
				    	class: 'user',
//						id: leaderUserID
						qid: queryId
				    }, function(ret, err) {
//				    	alert("user info:" + JSON.stringify(ret));
				    	if(ret && (0 != ret.length)) {
				    		//负责人姓名
				    		societyRelativeInfo['user_name'] = ret[0].username;
				    		t_user_info = ret[0].t_user_info;
				    		societyRelativeInfo['t_user_info'] = ret[0].t_user_info;
//				    		alert("ret.user_name:" + ret[0].username);
				    		societyRelativeInfo['t_user_info_id'] = t_user_info.id;
				    		societyRelativeInfo['user_city'] = t_user_info.user_city;
							societyRelativeInfo['user_nickname'] = t_user_info.user_nickname;
							societyRelativeInfo['user_real_name'] = t_user_info.user_real_name;
							societyRelativeInfo['user_header'] = t_user_info.user_header;
							societyRelativeInfo['user_school'] = t_user_info.user_school; 
							societyRelativeInfo['user_department'] = t_user_info.user_department;
//				    		citySchool = societyRelativeInfo['user_city'] + "/" + societyRelativeInfo['user_school'];
				    		citySchool = societyRelativeInfo['user_school'];
				    		societyRelativeInfo['citySchool'] = citySchool;
				    		//综合展示到前端
					    	tpl += '<div id="club_general">';
					    	tpl += '<img id="club_head_img" src="' + societyRelativeInfo['societyBadgeURL'] + '"/>';
					    	tpl += '<div id="club_other">';
					    	tpl += '<div id="club_other1">';
					    	tpl += '<p id="club_name">' + societyName + '</p>';
					    	tpl += '<p id="city_school">' + citySchool + '</p>'
					    	tpl += '</div>';
					    	tpl += '<div id="club_other2">';
					    	tpl += '<p id=\'blank\'>&nbsp;</p>';
					    	tpl += '</div>';
					    	tpl += '</div>';
					    	tpl += '</div>';
					    	if(null == clubBrief || '' == clubBrief){
					    		tpl += '<div id="brief">&#8195;&#8195;社团简介:' + '无' + '</div>';
					    	}
					    	else{
					    		tpl += '<div id="brief">&#8195;&#8195;社团简介:' + clubBrief + '</div>';
					    	}
					    	
					    	tpl += '<div id="club_info_list">';
					    	tpl += '<div id="club_activity" class="info_item info_item1" tapmode="tap" onclick="openClubActivity()">社团活动</div>';
					    	tpl += '<div id="club_member" class="info_item info_item1" tapmode="tap" onclick="openClubMember()">社团成员</div>';
					    	tpl += '<div id="club_finance" class="info_item" tapmode="tap" onclick="openClubFinance()">社团财务</div>';
					    	tpl += '</div>';
					    	tpl += '<div id="club_leader" class="leaderInfo">';
					    	tpl += '<span id="club_leader_sign">负&#8194;责&#8194;人：' + '</span>';
					    	tpl += '<span id="club_leader_name">' + societyRelativeInfo['user_real_name'] + '</span>'; 
					    	tpl += '</div>';
					    	tpl += '<div id="club_contact" class="leaderInfo">';
					    	tpl += '<span>联系方式：</span>';
					    	tpl += '<span id="club_contact_tel">' + societyRelativeInfo['user_name'] + '</span>';
					    	tpl += '</div>';
					    	tpl += '</div> ';
				    		$("#main_frm").html(tpl);
				    		api.parseTapmode();
				    		api.hideProgress();
				    	} 
				    	else
				    	{
				    		api.toast({
							    msg: '查询社团负责人信息失败!!!',
							    duration:2000,
							    location: 'middle'
							});
							api.hideProgress();
				    	}
			    	});
			    }		    	
			});
    	}
    	else {
    		api.toast({
			    msg: '查询社团详情信息失败!!!',
			    duration:2000,
			    location: 'middle'
			});
			api.hideProgress();
    	}
    });
}

//2015-7-30,Added by luozhengming,模仿玩转晋城进行动态数据加载
apiready = function() {
	var myDate = new Date();
	var yearStr = myDate.getFullYear();
	//页面传过来
	var pageParam = api.pageParam;
	society_id = pageParam.society_id;
	var pageFlag = pageParam.pageFlag;
	societyID =  $api.getStorage('society_id');
	userID = $api.getStorage('user_id');
//	alert( "localStorage societyID:" + societyID + ",userID:" + userID );
	if('true' == pageFlag){
		//页面传递参数为真，就将页面传递的用户ID赋值给userID
		societyID = society_id;
	}

	if('' == societyID || 'undefined' == typeof(societyID)){
		$('#main_frm').html('您未加入任何社团,请到社团风采里查找对应感兴趣的社团，申请加入!');
		$('#main_frm').css({"text-align":"center", "margin-top":"50%", "background-color":"#f5f5f5"});
		$('#main_frm').css({"background-color":"#f5f5f5"});
		return;
	}
	if('' == userID || 'undefined' == typeof(userID)){
		api.toast({
		    msg: '没有获取到您的用户ID,请登录后重试~',
		    duration:2000,
		    location: 'bottom'
		});
		return;
	}
	
	showClubRelativeMsg(societyID);

	if('true' != pageFlag){
		//下拉刷新
		api.setRefreshHeaderInfo({
			visible: true,
			// loadingImgae: 'wgt://image/refresh-white.png',
			bgColor: '#f2f2f2',
			textColor: '#4d4d4d',
			textDown: '下拉刷新...',
			textUp: '松开刷新...',
			showTime: true
		}, function(ret, err) {

			societyID = $api.getStorage('society_id');
			showClubRelativeMsg(societyID);
			api.refreshHeaderLoadDone();
		});
	}
	
}

function returnParentWin() {
	api.closeWin({
	});
}
