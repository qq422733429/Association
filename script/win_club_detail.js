function openClubActivity(){
	api.openWin({
		name : 'activity_list',
		url : '../html/win_club_activityList.html'
	})
}

function openClubMember() {
	api.openWin({
		name : 'club_member',
		url : '../html/win_club_member_list.html'
	})
}

function openClubFinance() {
	api.openWin({
		name : 'club_finance',
		url : '../html/win_club_finance.html'
	})
}

function joinClub() {
	api.confirm({
		title : '加入社团',
		msg : '您确定申请加入该社团吗？',
		buttons : ['确定', '取消']
	}, function(ret, err) {
		if (ret.buttonIndex == 1) {
			api.alert({
				msg : '申请已发送'
			});
		}
	});
}

//2015-8-1，Added by lzm,返回上一个窗口
function returnParentWin() {
	api.closeWin({
	});
}
