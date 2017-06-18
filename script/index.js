//previous page id, current page id
var prevPid = '',
	curPid = '';
//save 保存打开过的frame
var frameArr = [];

//保存离开界面时所打开的tab页
var page1_index = 'all_club';
var page2_index = 'my_club_activity';

//frame whether open
function isOpened(frmName) {
	var i = 0,
		len = frameArr.length;
	var mark = false;
	for (i; i < len; i++) {
		if (frameArr[i] === frmName) {
			mark = true;
			return mark;
		}
	}
	return mark;
}

function showHeader(type) {
	if (!type) {
		return;
	}
	var header = $api.dom('#header .tb_bar');
	$api.removeCls(header, 'active');
	var thisHeader = $api.dom('#header .' + type);
	$api.addCls(thisHeader, 'active');
}

function openTab(pageName, level, num) {

	pageName = pageName || 'all_club';
	//默认为社团风采

	prevPid = curPid;
	//记录前一个页面
	curPid = pageName;

	if (pageName == 'userCenter')
		$('.notice_new_active').addClass('hidden');//去红点的

	if (pageName == 'chat') {
		$('.chat_new_active').addClass('hidden');
	}
	if (prevPid !== curPid) {

		if (level == '1') {
			//点击的是下面的导航栏

			//处理头部
			var $header = $api.byId('header');
			var $titleBar = $api.domAll($header, '.topbar');
			for (var i = 0; i < $titleBar.length; i++) {
				$api.removeCls($titleBar[i], 'activebar');
			}

			//处理导航栏样式
			$api.addCls($api.byId(pageName), 'activebar');
			var $footer = $api.byId('footer');
			var $footerBar = $api.domAll($footer, 'li');
			for (var j = 0; j < $footerBar.length; j++) {
				$api.removeCls($footerBar[j], 'active');
			}

			var thisTab = $api.dom('#footer .' + pageName)
			thisTab = thisTab.parentNode;
			$api.addCls(thisTab, 'active');

			//将tab栏设为第一个,首先去除所有的高亮样式
			var tab_bar = $api.dom('#header');
			var list = $api.domAll(tab_bar, 'li');
			//			alert(list.length+'');
			for (var i = 0; i < list.length; i++) {
				$api.removeCls(list[i], 'tabar_active');
			}

			//将对应的tab设为高亮
			if (pageName == 'all_club') {
				var my_activity = $api.byId('all_activity_list');
				$api.addCls(my_activity, 'tabar_active');
			}

		} else if (level == '2') {
			//修改tab栏样式
			if (num == '1') {
				//社团风采的tab栏

				page1_index = pageName;
				var $class = $api.byId('all_club');
				var $tabBar = $api.domAll($class, 'li');
				for (var i = 0; i < $tabBar.length; i++) {
					$api.removeCls($tabBar[i], 'tabar_active');
				}
				$api.addCls($api.byId(pageName), 'tabar_active');

				//处理导航栏样式
				var thisTab = $api.dom('#footer .all_club');
				thisTab = thisTab.parentNode;
				$api.addCls(thisTab, 'active');
			} else if (num == '2') {
				//				alert(pageName);
				//我的社团的tab栏
			}
		}

		if (isOpened(pageName)) {
			//如果已经打开了，就不隐藏
			api.setFrameAttr({
				name: pageName,
				hidden: false
			});
		} else {

			var $header = $api.byId('header');
			$api.fixIos7Bar($header);
			var $body = $api.dom('body');
			var $footer = $api.byId('footer');
			var header_h = $api.offset($header).h;
			var body_h = $api.offset($body).h;
			var footer_h = $api.offset($footer).h;
			var rect_h = body_h - header_h - footer_h;

			var target = '';
			var bounceEnable = true;
			//2015-8-22,Added by lzm
			var userPos = $api.getStorage('position');

			switch (pageName) {
				case 'all_club':
				case 'all_activity_list':
					target = 'fra_public_activity'
					break;
				case 'my_club_activity':
					target = 'fra_activity';
					break;
				case 'my_club':
				case 'club_operation':
					target = 'fra_club_operation';
					break;
				case 'club_evaluation':
					//2015-8-22,Added by lzm,根据用户的职位来加载不同的考核页面
					//alert("userPos:" + userPos);
					switch (userPos) {
						case '社长':
						case '副社长':
							target = 'fra_club_evaluation_president';
							break;
						case '部长':
							target = 'fra_club_evaluation_minister';
							break;
						case '副部长':
						case '干事':
							target = 'fra_club_evaluation_members';
							break;
						case '社员':
							target = 'fra_club_evaluation_ord_members';
							break;
						default:
							{
								target = 'fra_club_evaluation_other';
							}
					}

					break;
				//废弃
				case 'club_detail':
					target = 'fra_club_detail_active'
					break;
				//废弃
				case 'all_club_list':
					target = 'fra_all_club';
					break;
				case 'chat':
					target = 'fra_chat'
					break;
				case 'userCenter':
					target = 'fra_user_center'
					bounceEnable = false;
					break;
				default:
					api.alert({
						msg: 'openTab的page参数不对'
					});
					break;
			}
			//			alert(bounceEnable);
			api.openFrame({
				name: pageName,
				url: './html/' + target + '.html',
				bounces: true,
				opaque: true,
				vScrollBarEnabled: false,
				rect: {
					x: 0,
					y: header_h,
					w: 'auto',
					h: rect_h
				},
				pageParam: {
					name: 'test',
					header_h: header_h,
					footer_h: footer_h,
					rect_h: rect_h
				},

			});
		}

		//把以前的页面隐藏
		if (prevPid) {
			api.setFrameAttr({
				name: prevPid,
				hidden: true
			});
		}

		if (!isOpened(pageName)) {
			//保存没有被打开的页面
			frameArr.push(pageName);
		}
	}
}

var timeCount = 0;

apiready = function() {

	var pageParam = api.pageParam;
	var frameName = pageParam.frameName;

	var header = $api.byId('header');
	$api.fixIos7Bar(header);

	//status bar style
	api.setStatusBarStyle({
		style: 'light'
	});

	//注册监听返回键
	api.addEventListener({
		name: 'keyback'
	}, function(ret, err) {
		timeCount++;
		if (timeCount == 1) {
			api.toast({
				msg: '再按一次退出社团宝',
				duration: 500,
				location: 'bottom'
			});
			setTimeout(function() {
				timeCount = 0;
			}, 1500);
		}
		if (timeCount == 2) {
			api.closeWidget({
				silent: true
			})
		}
	});

	showSocietyName();//显示默认社团的名字

	//在这里获取用户新的通知书和评论数
	getNewNoticeCount();




	//从别的页面返回回来的时候，原来在那个页面，比如直接返回个人中心
	switch (frameName) {
		case 'my_club_activity':
			openTab('my_club_activity', 2, 2);
			break;
		case 'chat':
			openTab('chat', 1);
			break;
		case 'my_club':
			openTab('my_club', 1);
			break;
		default:
			openTab('all_club', '1');
			break;
	};

	var model = api.require('model');
	model.config({
		appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8'
	});
	//2015-9-2,Added by lzm,获取本人所在社团所在部门，便于使用
	model.findById({
		class: 't_society_section',
		id: $api.getStorage('section_id')
	}, function(ret, err) {
		if (ret) {
			$api.setStorage('section_name', ret.section_name);
			//	    	api.alert({
			//	    		msg: "section_name:" + $api.getStorage('section_name') + ",society_member_score:" + $api.getStorage('society_member_score') + ",position:" + $api.getStorage('position') + ",section_id:" + $api.getStorage('section_id')
			//	    	});
		}
	});
	//2015-9-1,Added by luozhengming,此处更新社团考核和本人考核数据,以便考核可以直接使用
	//获取本地缓存里的社团ID，用户ID
	var societyID = $api.getStorage('society_id');
	var userID = $api.getStorage('user_id');
	var myDate = new Date();
	var yearStr = myDate.getFullYear();
	if (('undefined' == typeof(userID)) || '' == userID || ('undefined' == typeof(societyID)) || '' == societyID) {
		return;
	} else {
		//用户ID和社团ID都有,更新其在本社团的考核信息
		updateSocietyYearEva(societyID, yearStr);
		updateSocietyMemYearEvaEx(societyID, userID, yearStr, testFunc);
	}

};

//切换社团
function change_society() {
	api.openWin({
		name: 'win_club_select_society',
		url: 'html/win_club_select_society.html',
		reload: true
	});
}

function showSocietyName() {
	var society_id = $api.getStorage('society_id');
	//	alert('society_id=' + society_id);
	if (society_id) {
		var model = api.require('model');
		var query = api.require('query');

		model.config({
			appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8'
		});

		model.findById({
			class: 't_society',
			id: society_id
		}, function(ret, err) {
			if (ret) {
				$('#society_name').html(ret.society_name);
			}
		});
	} else {
		$('#society_name').html('没有加入社团');
	}
}

function getNewNoticeCount() {
	var model = api.require('model');
	var query = api.require('query');

	model.config({
		appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8'
	});

	//查看有没有新的通知
	query.createQuery({}, function(ret, err) {
		if (ret && ret.qid) {
			query.whereEqual({
				qid: ret.qid,
				column: 'notice_status',
				value: 0
			});

			query.whereEqual({
				qid: ret.qid,
				column: 'relative_society_id',
				value: $api.getStorage('society_id')
			});

			query.whereEqual({
				qid: ret.qid,
				column: 'notice_receiver_id',
				value: $api.getStorage('user_id')
			});

			model.count({
				class: "t_society_notice",
				qid: ret.qid
			}, function(ret, err) {
				if (ret) {
					$api.setStorage('unread_notice_count', ret.count);
					if (ret.count > 0) {
						showUserCenterActive();//在个人中心设置高亮红点
					}
				}
			});
		}
	});

	//查看有没有新的评论
	query.createQuery({}, function(ret, err) {
		if (ret && ret.qid) {
			query.whereEqual({
				qid: ret.qid,
				column: 'status',
				value: 0
			});

			query.whereEqual({
				qid: ret.qid,
				column: 'comment_receiver_id',
				value: $api.getStorage('user_id')
			});

			model.count({
				class: "t_society_activity_comment",
				qid: ret.qid
			}, function(ret, err) {
				if (ret) {
					//alert('unread_comment_count=' + ret.count);
					$api.setStorage('unread_comment_count', ret.count);
					if (ret.count > 0) {
						showUserCenterActive();
					}
				}
			});
		}
	});

	//查看有没有新的私信
	query.createQuery({}, function(ret, err) {
		if (ret && ret.qid) {
			query.whereEqual({
				qid: ret.qid,
				column: 'status',
				value: 0
			});

			query.whereEqual({
				qid: ret.qid,
				column: 'receiver_id',
				value: $api.getStorage('user_id')
			});

			model.count({
				class: "t_chat_message",
				qid: ret.qid
			}, function(ret, err) {
				if (ret) {
					if (ret.count > 0) {
						showChatActive();
					}
				}
			});
		}
	});

}

function showUserCenterActive() {
	$('.notice_new_active').removeClass('hidden');
}

function showChatActive() {
	$('.chat_new_active').removeClass('hidden');
}

function clear_message() {
	api.execScript({
		name: 'index',
		frameName: 'chat',
		script: 'clearChatMessage()'
	});
}