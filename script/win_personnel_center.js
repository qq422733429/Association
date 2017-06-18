var societyID = '';
var userID = '';

function createNewPrompt(){
	api.openWin({
		name : 'win_promotion_apply',
		url : 'win_promotion_apply.html',
	});
}

//apiready里一个进行打开新的frame
apiready = function() {
	var model = api.require('model');
	var user = api.require('user');
	var query = api.require('query');
	model.config({
		appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8',
		appId: 'A6982914277502',
		host: 'https://d.apicloud.com'
	});
	//页面传过来
	var pageParam = api.pageParam;
	society_id = pageParam.society_id;
	var pageFlag = pageParam.pageFlag;
	
	//查询对应的角色，如果非社长就可以进行提干申请
	//获取本地缓存里的社团ID，用户ID
	societyID =  $api.getStorage('society_id');
	userID = $api.getStorage('user_id');
	if('true' == pageFlag) {
		societyID = society_id;
	}
//	alert( "localStorage societyID:" + societyID + ",userID:" + userID );
	if('' == societyID || '' == userID || ('undefined'== typeof(societyID)) || ('undefined'== typeof(userID))){
		api.toast({
		    msg: '获取不到对应信息~',
		    duration:2000,
		    location: 'bottom'
		});
		return;
	}
	
	//查询该人在社团中的角色，根据角色来加载不同的数据
	query.createQuery(function(ret, err) {
	    if (ret && ret.qid) {
	        var queryId = ret.qid;
	        
	        //userID
	        query.whereEqual({
	            qid: queryId,
	            column: 'user_id',
	            value: userID
	        });
	        //societyID
	        query.whereEqual({
	            qid: queryId,
	            column: 'society_id',
	            value: societyID
	        });
	        query.limit({
            qid:queryId,
            value:1000
        });
        model.findAll({
	            class: "t_society_member",
	            qid: queryId
	        }, function(ret, err) {
	            if (ret && (0 != ret.length)) {
	            	memPos = ret[0].society_member_position;
	            	if('社长' != memPos){
//	            		api.alert({
//	            			msg: "memPos:" + memPos
//	            		});
	            		//非社长，加载提干图标
//	            		$('.right_click').css("background-image", "url(" + "../image/add_normal.png" + ")");
						$('.right_click').css("display", "block");
						$('.right_click').removeClass('hidden');
	            	}
	            }
	        });
	    }
	});
	
	
	var $header = $api.byId('part3_header');
	$api.fixIos7Bar($header);
	var header_h = $api.offset($header).h;
	api.openFrame({
		name: 'fra_personnel_center',
		url: 'fra_personnel_center.html',
		rect: {
			x: 0,
			y: header_h,
			w: 'auto',
			h: 'auto'
		},
		pageParam: {
			pageFlag: 'true',
			society_id: societyID
		},
		bounces: true,
		vScrollBarEnabled: true,
		hScrollBarEnabled: false
		
	});
}

function returnParentWin() {
	api.closeWin({
	});
}


