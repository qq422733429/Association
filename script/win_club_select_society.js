apiready = function() {
	var model = api.require('model');
	var query = api.require('query');

	var user_id = $api.getStorage('user_id');


	api.showProgress({
		style: 'default',
		animationType: 'fade',
		title: '努力加载中...',
		text: '客官莫着急...',
		modal: false
	});
	//获取用户的所有社团
	query.createQuery({}, function(ret, err) {
		//coding...
		if (ret && ret.qid) {
			var query_id = ret.qid;
			query.whereEqual({
				qid: query_id,
				column: 'user_id',
				value: user_id
			});

			query.whereEqual({
				qid: query_id,
				column: 'is_deleted',
				value: false
			});

			query.include({
				qid: query_id,
				column: 'society_id'
			});
			
        model.findAll({
				class: 't_society_member',
				qid: query_id
			}, function(ret, err) {
				//coding...
				if (ret) {
					//					alert(JSON.stringify(ret));
					var society_list = [];
					var obj = api.require('UIListView');
					var current_society;
					for (var i = 0; i < ret.length; i++) {
						var tmp = {};
						tmp['title'] = ret[i].society_id.society_name;
						tmp['uid'] = ret[i].society_id.id;
						tmp['imgPath'] = ret[i].society_id.society_badge;
						//2015-8-22,modified by lzm
						tmp['society_pos'] = ret[i].society_member_position;
						tmp['section_id'] = ret[i].section_id;
						tmp['society_member_score'] = ret[i].society_member_score;
						society_list.push(tmp);
					}
					api.hideProgress();
					obj.open({
						rect: {
							x: 0,
							y: 70,
							w: 700,
							h: 700
						},
						data: society_list,
						styles: {
							borderColor: '#F0F0F0',
							item: {
								bgColor: '#FFFFFF',
								titleSize: 18
							}
						}
					}, function(ret) {
						//						alert(JSON.stringify(ret));
						if (ret.eventType == 'clickContent') {
							current_society = society_list[ret.index].uid;
							//2015-8-22,Added by lzm
							var current_pos = society_list[ret.index].society_pos;
							var current_section_id = society_list[ret.index].section_id;
							var current_member_score = society_list[ret.index].society_member_score;
							if (current_society != $api.getStorage('society_id')) {
								//不相同才切换
								$api.setStorage('society_id', current_society);
								$api.setStorage('position', current_pos);
								$api.setStorage('section_id', current_section_id);
								$api.setStorage('society_member_score', current_member_score);
								api.setPrefs({
									key: 'last_society_id',
									value: current_society
								});
								//alert("current_pos:" + current_pos);
								api.closeWin({
									name: 'index',
								});
								api.openWin({
									name: 'index',
									url: '../index.html',
									slidBackEnabled: false,
									pageParam: {
										frameName: 'my_club'
									}

								});
							}
							obj.close();
							api.closeWin();
						}
					});

				} else {
					api.hideProgress();
					api.alert({
						msg: err.msg
					})
				}
			});
		}
	});
}

function get_back() {
	api.closeWin();
}