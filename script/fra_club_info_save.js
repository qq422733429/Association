var citySchool = "";
var city = "";
//用一个全局变量存储用户信息，因为js是异步的语言，所以需要存下来
var societyUserInfo = [];
var societyRelativeInfo = [];
var societyID = '';
var userID = '';

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

//上传社团图片
function uploadHeadPic() {
	api.toast({
	    msg: '开始上传社团图片,请耐心等待提示更改社团头像成功后再进行保存点击，效果更好喔~',
	    duration:2000,
	    location: 'top'
	});
	
	//调用AC里面uploadFile函数上传图片到file表，并记录返回的URL存放到社团图像字段里
	//端方mcm访问数据库,并相应的填充前端页面
    var model = api.require('model');
    model.config({
    	appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8',
    	appId: 'A6982914277502',
    	host: 'https://d.apicloud.com'
    });
    //选取图片
    api.getPicture({
		sourceType: 'library',
		encodingType: 'jpg',
		mediaValue: 'pic',
		destinationType: 'url'
    },function(ret,err){
    	//coding...
    	if( ret.data ){
    		societyRelativeInfo['localSocietyBadge'] = ret.data;
    		$(".club_head_edit").css("background-image", "url(" + societyRelativeInfo['localSocietyBadge'] + ')');
    		//上传图片
		    //上传图片
		    model.uploadFile({
			    report:false,
			    data:{
			        file:{
			            name:'club' + societyRelativeInfo['clubId'] + '_head.jpg',
			            url:societyRelativeInfo['localSocietyBadge'],
			        },
			        values:{
			            key1:'value1',
			            key2:'value2'
			        }
			    }
			},function(ret, err) {
			    if (ret) {
			    	//保存返回的url，更新社团头像
			    	var url = ret.url;
			        api.alert({
			        	title: "url:" + url,
			        	msg: "uploadFile ret:" + JSON.stringify(ret),
			        });
			        //更新社团头像
			        model.updateById({
					    class: 't_society',
					    id: societyID,
					    value: {
					        society_badge: url
					    }
					}, function(ret, err){
					    if(ret){
					        api.toast({
					        	msg: '更改社团头像成功!',
					        	duration:2000,
					        	location: 'top'
					        });
					    }
					    else{
					    	api.toast({
					        	msg: '更改社团头像失败,失败信息:' + err.msg,
					        	duration:2000,
					        	location: 'top'
					        });
					    }
					});
			    } else {
					api.toast({
					    msg: '上传图片失败,失败信息:' + err.msg,
					    duration:2000,
					    location: 'middle'
					});
			    }
			});
    	}
    	else{
    		api.toast({
			    msg: '选取本地图片失败,失败信息:' + err.msg,
			    duration:2000,
			    location: 'middle'
			});
    	}
    });
    
}

//展示社团风采里面的社团详情信息
function showClubRelativeMsg(clubId) {
	api.showProgress({
        title: '加载社团资料中...',
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
			societyRelativeInfo['clubId'] = clubId;
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
				    
				    //findAll
				    query.limit({
            qid:queryId,
            value:1000
        });
        model.findAll({
				    	class: 'user',
//						id: leaderUserID
						qid: queryId
				    }, function(ret, err) {
//				    	alert("user info:" + JSON.stringify(ret));
				    	if(ret) {
				    		//负责人姓名
				    		societyRelativeInfo['user_name'] = ret[0].username;
				    		t_user_info = ret[0].t_user_info;
				    		societyRelativeInfo['t_user_info'] = ret[0].t_user_info;
//				    		alert("ret.user_name:" + ret[0].username);
				    		
				    		societyRelativeInfo['user_city'] = t_user_info.user_city;
							societyRelativeInfo['user_nickname'] = t_user_info.user_nickname;
							societyRelativeInfo['user_real_name'] = t_user_info.user_real_name;
							societyRelativeInfo['user_header'] = t_user_info.user_header;
							societyRelativeInfo['user_school'] = t_user_info.user_school; 
							societyRelativeInfo['user_department'] = t_user_info.user_department;
				    		citySchool = societyRelativeInfo['user_city'] + "/" + societyRelativeInfo['user_school'];
				    		societyRelativeInfo['citySchool'] = citySchool;
				    		//将本社团信息设置为本地存储
				    		$api.setStorage('societyRelativeInfo', societyRelativeInfo);
				    		//综合展示到前端
					    	tpl += '<div id="club_head" class="dv_normal">';
					    	tpl += '<span id="li1" >头 &#8195;&#8195;像:</span>';
					    	tpl += '<span id="li2" class="t2 club_head_edit" style="background-image: url(' + societyRelativeInfo['societyBadgeURL'] + ');" tapmode="tap" onclick="uploadHeadPic()"><a>点击修改</a></span>';
					    	tpl += '</div>';
					    	tpl += '<div id="club_name" class="dv_normal">';
					    	tpl += '<span id="li1">社团名称:</span>';
					    	tpl += '<span id="li2"><input type="text"  class="t2" name="club_name_input" placeholder="阳光文学社" value="' + societyRelativeInfo['societyName'] + '"/></span>';
					    	tpl += '</div>';
					    	tpl += '<div id="club_contact_per" class="dv_normal">';
					    	tpl += '<span id="li1">负&#8194;责&#8194;人:</span>';
					    	tpl += '<span id="li2"><input type="text" class="t2" name="club_contact_per_input" placeholder="高大璇" value="' + societyRelativeInfo['user_real_name'] + '"/></span>';
					    	tpl += '</div>';
					    	tpl += '<div id="club_contact_tel" class="dv_normal">';
					    	tpl += '<span id="li1">联系电话:</span>';
					    	tpl += '<span id="li2"><input type="text" class="t2" name="club_contact_tel_input" placeholder="13388888888" value="' + societyRelativeInfo['user_name'] + '"/></span>';
					    	tpl += '</div>';
					    	tpl += '<div id="club_brif_intro">';
					    	tpl += '<li id="li1" class="li1">简&#8195;&#8195;介:</li>';
					    	tpl += '<li id="li2"><textarea class="t2 brif_intro_edit" rows="4" placeholder="请填写社团简介..." >' + societyRelativeInfo['clubBrief'] + '</textarea></li>';
				    		$("#main").append(tpl);
				    		api.parseTapmode();
				    		//收起刷新条
				    		api.hideProgress();
				    	} 
				    	else
				    	{
				    		api.toast({
							    msg: '查询社团负责人信息失败!!!',
							    duration:2000,
							    location: 'middle'
							});
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
    	}
//  	api.hideProgress();
    });
}

//2015-8-8,Added by luozhengming,模仿玩转晋城进行动态数据加载
apiready = function() {
	//获取本地缓存里的社团ID，用户ID
	societyID =  $api.getStorage('society_id');
	var clubId = societyID;
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
	
	showClubRelativeMsg(societyID);
}
