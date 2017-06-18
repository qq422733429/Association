apiready = function() {

	//getSocietyMember('55b23e8ae6e6419036d0c383', 'section_manage', null);
	//	var clubID = "55b2407f51ffb4040689a636";
	//	var userID = "55bae837f17c2fa50c938598";
	var userID = $api.getStorage("user_id");
	var clubID;
	if (api.pageParam.society_id)
		clubID = api.pageParam.society_id;
	else if ($api.getStorage("society_id")) 
		clubID = $api.getStorage("society_id");
	else
		clubID = 0;
	if (clubID == 0 ){
		var el = $api.byId("act");
		var html = '<div style="text-align:center;margin-top:50% ">您未加入任何社团,请到社团风采里查找对应感兴趣的社团，申请加入!</div>';
		$api.append(el, html);		
		return ;
	}
//	alert(userID);
//	alert(clubID);
	get_club_activities(0, userID, clubID, getActivities);

	api.setRefreshHeaderInfo({
		visible : true,
		// loadingImgae: 'wgt://image/refresh-white.png',
		bgColor : '#f2f2f2',
		textColor : '#4d4d4d',
		textDown : '下拉刷新...',
		textUp : '松开刷新...',
		showTime : true
	}, function(ret, err) {
		refresh_bottom();
		get_club_activities(0, userID, clubID, getActivities);
		api.refreshHeaderLoadDone();
	});
	//地步加载更多
	api.addEventListener({
		name : 'scrolltobottom',
		extra : {
			threshold : 3 //设置距离底部多少距离时触发，默认值为0，数字类型
		}
	}, function(ret, err) {
		//operation
		get_club_activities(1, userID, clubID, load_more)
	});
	//	getUserInfo(userID,function(ret1){
	//		api.alert({
	//			msg:ret1
	//		});
	//	});
	
	
}
