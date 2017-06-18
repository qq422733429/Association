var user_id;
var user_school;

//apiready = function() {
//	user_id = $api.getStorage('user_id');
//
//	get_all_club(function(ret) {
//		if (ret != null && ret.length != 0) {
//			// alert( JSON.stringify( ret ) );
//			var string_html = "";
//			for (var i = 0; i < ret.length; i++) {
//				string_html += '<li tapmode=""  tapmode="tap" onclick="open_club_detail(' + "'" + ret[i].id + "'" + ')"><img src = "' + ret[i].society_badge + '"/>' + '<span>' + ret[i].society_name + '</span></li>';
//			}
//			// alert( string_html );
//			$('.club_list').append(string_html);
//			api.parseTapmode();
//		} else if (ret == null || ret.length == 0) {
//			alert("暂时没有社团！")
//		} else {
//			alert(JSON.stringify(err));
//		}
//	});
//}

//function get_all_club(func_name) {
//	var model = api.require('model');
//	var query = api.require('query');
//
//	model.config({
//		appKey : '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8'
//	});
//
//	query.createQuery({}, function(ret, err) {
//		//coding...
//		if (ret && ret.qid) {
//			var query_id = ret.qid;
//			model.findAll({
//				class : 't_society',
//				qid : query_id
//			}, function(ret, err) {
//				//coding...
//				if (ret) {
//					func_name(ret);
//				} else {
//					alert(JSON.stringify(err.msg));
//				}
//			});
//		} else {
//			api.alert({
//				msg : "联网出错，请重试"
//			});
//		}
//	});
//}

function open_club_detail(society_id) {
	//	alert( society_id );
	is_user_in(user_id, society_id, function(ret) {
		if (ret == true) {
			api.openWin({
				name: 'win_club_detail_active',
				url: './win_club_detail_active.html',
				pageParam: {
					'society_id': society_id
				}
			});
		} else {
			api.openWin({
				name: 'win_club_detail_unjoin_active',
				url: './win_club_detail_unjoin_active.html',
				pageParam: {
					society_id: society_id
				}
			});
		}
	});
}

var pageIndex = 1;
//默认加载第一页
var pageCount = 16;
//每页加载五条

var user_id;

apiready = function() {
	user_id = $api.getStorage('user_id');
	user_school = $api.getStorage('user_school');
	//	alert( user_school );
	var position = $api.getStorage('position');
	//上拉加载
	api.addEventListener({
		name: 'scrolltobottom',
		extra: {
			threshold: 0 //设置距离底部多少距离时触发，默认值为0，数字类型
		}
	}, function(ret, err) {
		loadClubList();
	});

	loadClubList();

	api.setRefreshHeaderInfo({
		visible: true,
		//		loadingImg: 'widget://image/refresh.png',
		bgColor: '#ccc',
		textColor: '#fff',
		textDown: '下拉刷新...',
		textUp: '松开刷新...',
		showTime: true
	}, function(ret, err) {
		//从服务器加载数据，完成后调用api.refreshHeaderLoadDone()方法恢复组件到默认状态
		loadClubList();

		api.refreshHeaderLoadDone();
	});
}

function loadClubList() {
	get_all_club(function(ret) {
		if (ret.length != 0) {
			// alert( JSON.stringify( ret ) );
			var string_html = "";
			for (var i = 0; i < ret.length; i++) {
				string_html += '<li tapmode="tap" onclick="open_club_detail(' + "'" + user_id + "','" + ret[i].id + "'" + ')"><img src = "' + ret[i].society_badge + '"/>' + '<div>' + ret[i].society_name + '</div></li>';
			}
			// alert( string_html );
			$('.club_list').append(string_html);
			api.parseTapmode();
			api.hideProgress();
		} else if (ret.length == 0) {
			api.alert({
				msg: "暂时没有社团！"
			})
		} else {
			api.alert({
				msg: JSON.stringify(err.msg)
			});
			api.hideProgress();
		}
	});
}

function get_all_club(func_name) {
	var model = api.require('model');
	var query = api.require('query');

	model.config({
		appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8'
	});

	var page = (pageIndex - 1) * pageCount;

	api.showProgress({
		style: 'default',
		animationType: 'fade',
		title: '努力加载中...',
		text: '客官莫着急...',
		modal: false
	});

	query.createQuery({}, function(ret, err) {
		//coding...
		if (ret && ret.qid) {
			var query_id_2 = ret.qid;
			query.whereEqual({
				qid: query_id_2,
				column: 'school_name',
				value: user_school
			});
			query.limit({
            qid:query_id_2,
            value:1000
        });

			model.findAll({
				class: 't_school',
				qid: query_id_2
			}, function(ret_1, err) {
				//coding...
				// alert( JSON.stringify( ret_1 ) );
				if (ret_1) {
					var school_id = ret_1[0].id;
					//					api.alert({
					//						msg: "school_id:" + school_id
					//					});
					query.createQuery({}, function(ret, err) {
						//coding...
						if (ret && ret.qid) {
							var query_id = ret.qid;

							query.whereEqual({
								qid: query_id,
								column: 't_school',
								value: school_id
							});

							query.limit({
								qid: query_id,
								value: pageCount
							});

							query.skip({
								qid: query_id,
								value: page
							});

							model.findAll({
								class: 't_society',
								qid: query_id
							}, function(ret, err) {
								//coding...
								if (ret) {
									if (ret.length > 0) {
										func_name(ret);
										pageIndex++;
										//页数加1
									} else {
										api.toast({
											msg: '没有更多内容了...',
											duration: 1500,
											location: 'middle'
										});
										api.hideProgress();
									}
								} else {
									api.hideProgress();
									api.alert({
										msg: JSON.stringify(err.msg)
									});
								}
							});
						} else {
							api.hideProgress();
							api.alert({
								msg: "无法获取qid!"
							});
						}
					});
				} else {
					api.hideProgress();
					api.alert({
						msg: JSON.stringify(err.msg)
					});
				}
			});
		} else {
			api.alert({
				msg: "无法获取qid!"
			});
			api.hideProgress();
		}
	});

}

function open_club_detail(user_id, society_id) {
	//	alert(society_id);
	is_user_in(user_id, society_id, function(ret) {
		if (ret) {
			api.openWin({
				name: 'win_club_detail_active',
				url: './win_club_detail_active.html',
				pageParam: {
					'society_id': society_id
				}
			});
		} else {
			api.openWin({
				name: 'win_club_detail_unjoin_active',
				url: './win_club_detail_unjoin_active.html',
				pageParam: {
					society_id: society_id
				}
			});
		}
	});
}