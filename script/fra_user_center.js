/**
 * 从这里跳转到各个用户中心的子界面
 */
apiready = function() {
	showUserInfo();
	showNewActive();
}

function showNewActive() {
	var new_notice_count = $api.getStorage('unread_notice_count');
	var new_comment_count = $api.getStorage('unread_comment_count');
	if (new_notice_count > 0) {
		$('.notice').html(new_notice_count);
		$('.notice').removeClass('hidden');
	}
	if (new_comment_count > 0) {
		$('.comment').html(new_comment_count);
		$('.comment').removeClass('hidden');
	}
}


function showUserInfo(result) {
	$('#user_name').html($api.getStorage('user_nick_name'));
	$("#user_face").attr("src", $api.getStorage('user_header'));
}

function open_edit_userInfo() {

	api.openWin({
		name: "win_edit_personal_page",
		url: "win_edit_personal_page.html"
	});

}

function openClubNotice() {
	//未读数清零
	$api.setStorage('unread_notice_count', 0);
	$('.notice').addClass('hidden');
	api.openWin({
		name: "win_club_notice",
		url: "win_club_notice.html"
	});
}

function openComment() {
	//未读数清零
	$api.setStorage('unread_comment_count', 0);
	$('.comment').addClass('hidden');
	api.openWin({
		name: "win_personal_comment",
		url: 'win_personal_commet.html'
	});
}

function openMyActivity() {
	api.openWin({
		name: "win_my_activity",
		url: 'win_my_activity.html'
	});

}

function openResetPassword() {
	api.openWin({
		name: "win_modify_pwd",
		url: 'win_modify_pwd.html'
	});

}
function openExperienceFeedback(){
	api.openWin({
	    name: "win_experience_Feedback",
	    url: 'win_experience_Feedback.html'
    });

}

function openAbout() {
	api.openWin({
		name: "win_about_Quanr",
		url: 'win_about_quanr.html'
	});

}
	/**
	 * 退出登录
	 */

function Logout() {
	api.confirm({
		title: '提示',
		msg: '确定退出登录吗？',
		buttons: ['确定', '取消']
	}, function(ret, err) {
		if (ret.buttonIndex == 1) {

			var user = api.require('user');
			user.logout(function(ret, err) {
				if (ret) {
					api.removePrefs({
						key: 'password'
					});
					api.removePrefs({
						key: 'user_name'
					});
					api.closeToWin({
						name: 'root'
					});
				}
			});
		}
	});
}
