var user_id;
var society_id;

var task_id_list = [];
var task_status_list = [];
var task_score_list = [];
var task_list = [];
var task_publisher_id_list = [];
var task_publisher_list = [];
var task_publisher_section_list = [];
var task_involved_id_list = [];

var string_html = "";

var perPage = 4;

var up_date = '1900-01-01';
var bottom_date = null;

apiready = function() {
	user_id = $api.getStorage('user_id');
	society_id = $api.getStorage('society_id');

	up_refresh();

	api.setRefreshHeaderInfo({
		visible: true,
		bgColor: '#f2f2f2',
		textColor: '#4d4d4d',
		textDown: '下拉刷新...',
		textUp: '松开刷新...',
		showTime: true
	}, function(ret, err) {
		up_refresh();
		api.refreshHeaderLoadDone();
	});

	api.addEventListener({
		name: 'scrolltobottom',
		extra: {
			threshold: 0 //设置距离底部多少距离时触发，默认值为0，数字类型
		}
	}, function(ret, err) {
		//operation
		bottom_refresh();
	});
}

function up_refresh() {
	task_id_list = [];
	task_status_list = [];
	task_score_list = [];
	task_list = [];
	task_publisher_id_list = [];
	task_publisher_list = [];
	task_publisher_section_list = [];
	task_involved_id_list = [];

	show_task_up();
}

function bottom_refresh() {
	task_id_list = [];
	task_status_list = [];
	task_score_list = [];
	task_list = [];
	task_publisher_id_list = [];
	task_publisher_list = [];
	task_publisher_section_list = [];
	task_involved_id_list = [];

	show_task_bottom();
}

function show_task_up() {
	string_html = "";
	api.showProgress({
		title: '加载中...',
		modal: false
	});
	get_section_info_up(function() {
		// alert( task_involved_id_list );
		for (var i = 0; i < task_id_list.length - 1; i++) {
			var task_time = getDateFromString(task_list[i].createdAt);
			var task_end_date = getDateFromString(task_list[i].task_end_date);
			task_time = task_time.getFullYear() + '-' + (task_time.getMonth() + 1) + '-' + task_time.getDate();
			task_end_date = task_end_date.getFullYear() + '-' + (task_end_date.getMonth() + 1) + '-' + task_end_date.getDate();
			if (task_status_list[i] == 1) {
				string_html += '<div class = "task" id = "' + task_involved_id_list[i] + '">';
				string_html += '<div class = "task_header">';
				string_html += '<a>';
				string_html += '<img src="' + task_publisher_list[i].t_user_info.user_header + '"  onclick = "open_personal_info(' + "'" + task_publisher_id_list[i] + "'" + ')"/>';
				string_html += '</a>';
				
				string_html += '<div class = "task_header_content">';
				string_html += '<span>' + task_publisher_list[i].t_user_info.user_real_name + '<span style="font-size:0.8em">(' + task_publisher_section_list[i].section_id.section_name + '/' ;
				string_html += task_publisher_section_list[i].society_member_position + ')</span></span>';
				string_html += '<br/><span style="font-size:0.8em;color:#d5d5d5">' + task_time + '</span>';
				string_html += '</div>';
				
				string_html += '<div class = "submit" tapmode = "tap" onclick="submit(' + "'" + task_involved_id_list[i] + "'" + ')">';
				string_html += '提交';
				string_html += '</div>';
				string_html += '<div class="clear"></div>';
				string_html += '</div>';
				string_html += '<div class = "task_deadline">';
				string_html += '<h1>截止：' + task_end_date + '</h1>';
				string_html += '</div>';
				string_html += '<div class = "task_content">';
				string_html += '<h1>任务：' + task_list[i].task_content + '</h1>';
				string_html += '</div>';
				string_html += '<div id="task_score">';
				string_html += '<h1>评分：</h1>';
				string_html += '<ul>';
				string_html += '<li></li><li></li><li></li><li></li><li></li>';
				string_html += '</ul>';
				string_html += '</div>';
				string_html += '</div>';
			} else if (task_status_list[i] == 2) {
				string_html += '<div class = "task" id = "' + task_involved_id_list[i] + '">';
				string_html += '<div class = "task_header">';
				string_html += '<a>';
				string_html += '<img src="' + task_publisher_list[i].t_user_info.user_header + '" onclick = "open_personal_info(' + "'" + task_publisher_id_list[i] + "'" + ')"/>';
				string_html += '</a>';
				string_html += '<div class = "task_header_content">';
				string_html += '<span>' + task_publisher_list[i].t_user_info.user_real_name + '<span style="font-size:0.8em">(' + task_publisher_section_list[i].section_id.section_name + '/' ;
				string_html += task_publisher_section_list[i].society_member_position + ')</span></span>';
				string_html += '<br/><span style="font-size:0.8em;color:#d5d5d5">' + task_time + '</span>';
				string_html += '</div>';
				string_html += '<div class = "overtime">';
				string_html += '已提交';
				string_html += '</div>';
				string_html += '<div class="clear"></div>';
				string_html += '</div>';
				string_html += '<div class = "task_deadline">';
				string_html += '<h1>截止：' + task_end_date + '</h1>';
				string_html += '</div>';
				string_html += '<div class = "task_content">';
				string_html += '<h1>任务：' + task_list[i].task_content + '</h1>';
				string_html += '</div>';
				string_html += '<div id="task_score">';
				string_html += '<h1>评分：</h1>';
				string_html += '<ul>';
				string_html += '<li></li><li></li><li></li><li></li><li></li>';
				string_html += '</ul>';
				string_html += '</div>';
				string_html += '</div>';
			} else {
				string_html += '<div class = "task" id = "' + task_involved_id_list[i] + '">';
				string_html += '<div class = "task_header">';
				string_html += '<a>';
				string_html += '<img src="' + task_publisher_list[i].t_user_info.user_header + '" onclick = "open_personal_info(' + "'" + task_publisher_id_list[i] + "'" + ')"/>';
				string_html += '</a>';
				string_html += '<div class = "task_header_content">';
				string_html += '<span>' + task_publisher_list[i].t_user_info.user_real_name + '<span style="font-size:0.8em">(' + task_publisher_section_list[i].section_id.section_name + '/' ;
				string_html += task_publisher_section_list[i].society_member_position + ')</span></span>';
				string_html += '<br/><span style="font-size:0.8em;color:#d5d5d5">' + task_time + '</span>';
				string_html += '</div>';
				string_html += '<div class = "overtime">';
				string_html += '已评分';
				string_html += '</div>';
				string_html += '<div class="clear"></div>';
				string_html += '</div>';
				string_html += '<div class = "task_deadline">';
				string_html += '<h1>截止：' + task_end_date + '</h1>';
				string_html += '</div>';
				string_html += '<div class = "task_content">';
				string_html += '<h1>任务：' + task_list[i].task_content + '</h1>';
				string_html += '</div>';
				string_html += '<div id="task_score">';
				string_html += '<h1>评分：</h1>';
				string_html += '<ul>';
				for (var j = 0; j < task_score_list[i]; j++) {
					string_html += '<li class="active"></li>';
				}
				for (var j = task_score_list[i]; j < 5; j++) {
					string_html += '<li></li>';
				}
				string_html += '</ul>';
				string_html += '</div>';
				string_html += '</div>';
			}
		}
		$('#main_frame').prepend(string_html);
		api.hideProgress();
	});
}

function get_section_info_up(func_name) {
	get_publisher_info_up(function() {
		var model = api.require('model');
		var query = api.require('query');

		model.config({
			appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8'
		});

		query.createQuery({}, function(ret, err) {
			//coding...
			if (ret && ret.qid) {
				var query_id = ret.qid;

				query.whereEqual({
					qid: query_id,
					column: 'society_id',
					value: society_id
				});

				query.whereContainAll({
					qid: query_id,
					column: 'user_id',
					value: task_publisher_id_list
				});

				query.include({
					qid: query_id,
					column: 'section_id'
				});

				query.limit({
            qid:query_id,
            value:1000
        });
        model.findAll({
					class: 't_society_member',
					qid: query_id
				}, function(ret, err) {
					//coding...
					if (ret) {
						// alert( JSON.stringify( ret ) );
						for (var i = 0; i < task_publisher_id_list.length - 1; i++) {
							for (var j = 0; j < ret.length; j++) {
								if (task_publisher_id_list[i] == ret[j].user_id) {
									task_publisher_section_list.push(ret[j]);
								}
							}
						}
						func_name();
					} else {
						api.alert({
							msg: err.msg
						});
					}

				});
			} else {
				api.alert({msg:"获取qid失败！"});
			}
		});


	});
}


function get_publisher_info_up(func_name) {
	get_task_info_up(function() {
		var model = api.require('model');
		var query = api.require('query');

		model.config({
			appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8'
		});

		query.createQuery({}, function(ret, err) {
			//coding...
			if (ret && ret.qid) {
				var query_id = ret.qid;
				query.whereContainAll({
					qid: query_id,
					column: 'id',
					value: task_publisher_id_list
				});

				query.include({
					qid: query_id,
					column: 't_user_info'
				});

				query.limit({
            qid:query_id,
            value:1000
        });
        model.findAll({
					class: 'user',
					qid: query_id
				}, function(ret, err) {
					//coding...
					if (ret) {
						for (var i = 0; i < task_publisher_id_list.length - 1; i++) {
							for (var j = 0; j < ret.length; j++) {
								if (task_publisher_id_list[i] == ret[j].id) {
									task_publisher_list.push(ret[j]);
								}
							}
						}
						func_name();
					} else {
						api.alert({
							msg: err.msg
						});
					}
				});
			} else {
				api.alert({msg:"获取qid失败！"});
			}
		});
	});
}

function get_task_info_up(func_name) {
	get_task_id_up(function() {
		var model = api.require('model');
		var query = api.require('query');

		model.config({
			appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8'
		});

		query.createQuery({}, function(ret, err) {
			//coding...
			if (ret && ret.qid) {
				var query_id = ret.qid;
				query.whereEqual({
					qid: query_id,
					column: 'society_id',
					value: society_id
				});

				query.whereContainAll({
					qid: query_id,
					column: 'id',
					value: task_id_list
				});



				query.limit({
            qid:query_id,
            value:1000
        });
        model.findAll({
					class: 't_society_task',
					qid: query_id
				}, function(ret, err) {
					//coding...
					if (ret) {
						for (var i = 0; i < task_id_list.length; i++) {
							for (var j = 0; j < ret.length; j++) {
								if (task_id_list[i] == ret[j].id) {
									task_list.push(ret[j]);
									task_publisher_id_list.push(ret[j].task_publisher);
								}
							}
						}
						task_publisher_id_list.push(null);
						func_name();
					} else {
						api.alert({
							msg: err.msg
						});
					}
				});
			} else {
				api.alert({msg:"无法获取qid！"});
			}
		});


	});
}

function get_task_id_up(func_name) {
	var model = api.require('model');
	var query = api.require('query');

	model.config({
		appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8'
	});

	query.createQuery({},
		function(ret, err) {
			//coding...
			if (ret && ret.qid) {
				var query_id = ret.qid;
				query.whereEqual({
					qid: query_id,
					column: 'task_involved_user_id',
					value: user_id
				});

				query.whereEqual({
					qid: query_id,
					column: 'society_id',
					value: society_id
				});

				query.desc({
					qid: query_id,
					column: 'createdAt'
				});

				query.whereGreaterThan({
					qid: query_id,
					column: 'createdAt',
					value: up_date
				});

				query.limit({
					qid: query_id,
					value: perPage
				});

				model.findAll({
					class: 't_society_task_involved',
					qid: query_id
				}, function(ret, err) {
					//coding...
					if (ret != null && ret.length != 0) {
						if (bottom_date == null) {
							bottom_date = ret[ret.length - 1].createdAt;
						}
						up_date = ret[0].createdAt;
						for (var i = 0; i < ret.length; i++) {
							task_id_list.push(ret[i].task_id);
							task_involved_id_list.push(ret[i].id);
							task_status_list.push(ret[i].task_status);
							task_score_list.push(ret[i].task_evaluation);
						}
						task_id_list.push(null);
						func_name();
					} else if (ret == null || ret.length == 0) {
						api.toast({
							msg: '没有更多任务了',
							duration: 2000,
							location: 'bottom'
						});
						api.hideProgress();
					} else {
						api.alert({
							msg: err.msg
						});
						api.hideProgress();
					}
				});
			} else {
				api.alert({msg:"获取qid失败！"});
			}
		});
}

function submit(id) {
	var model = api.require('model');

	model.config({
		appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8'
	});

	model.updateById({
		class: 't_society_task_involved',
		id: id,
		value: {
			task_status: 2
		}
	}, function(ret, err) {
		//coding...
		if (ret) {
			$('#' + id + ' ' + '.submit').remove();
			var tmp = '<div class="overtime"><h1>已提交</h1></div>';
			$('#' + id + ' ' + '.task_header_content').after(tmp);
			api.alert({
				msg: "任务提交成功！"
			});
		} else {
			api.alert({
				msg: err.msg
			});
		}
	});

}

//下拉刷新
function show_task_bottom() {
	string_html = "";
	api.showProgress({
		title: '加载中...',
		modal: false
	});
	get_section_info_bottom(function() {
		// alert( task_involved_id_list );
		for (var i = 0; i < task_id_list.length - 1; i++) {
			var task_time = getDateFromString(task_list[i].createdAt);
			var task_end_date = getDateFromString(task_list[i].task_end_date);
			task_time = task_time.getFullYear() + '-' + (task_time.getMonth() + 1) + '-' + task_time.getDate();
			task_end_date = task_end_date.getFullYear() + '-' + (task_end_date.getMonth() + 1) + '-' + task_end_date.getDate();
			if (task_status_list[i] == 1) {
				string_html += '<div class = "task" id = "' + task_involved_id_list[i] + '">';
				string_html += '<div class = "task_header">';
				string_html += '<a>';
				string_html += '<img src="' + task_publisher_list[i].t_user_info.user_header + '" onclick = "open_personal_info(' + "'" + task_publisher_id_list[i] + "'" + ')"/>';
				string_html += '</a>';
				string_html += '<div class = "task_header_content">';
				string_html += '<h1>' + task_publisher_list[i].t_user_info.user_real_name + '(' + task_publisher_section_list[i].section_id.section_name + '/' + task_publisher_section_list[i].society_member_position + ')</h1>';
				string_html += '<h2>' + task_time + '</h2>';
				string_html += '</div>';
				string_html += '<div class = "submit" tapmode = "tap" onclick="submit(' + "'" + task_involved_id_list[i] + "'" + ')">';
				string_html += '<h1>提交任务</h1>';
				string_html += '</div>';
				string_html += '<div class="clear"></div>';
				string_html += '</div>';
				string_html += '<div class = "task_deadline">';
				string_html += '<h1>截止：' + task_end_date + '</h1>';
				string_html += '</div>';
				string_html += '<div class = "task_content">';
				string_html += '<h1>任务：' + task_list[i].task_content + '</h1>';
				string_html += '</div>';
				string_html += '<div id="task_score">';
				string_html += '<h1>评分：</h1>';
				string_html += '<ul>';
				string_html += '<li></li><li></li><li></li><li></li><li></li>';
				string_html += '</ul>';
				string_html += '</div>';
				string_html += '</div>';
			} else if (task_status_list[i] == 2) {
				string_html += '<div class = "task" id = "' + task_involved_id_list[i] + '">';
				string_html += '<div class = "task_header">';
				string_html += '<a>';
				string_html += '<img src="' + task_publisher_list[i].t_user_info.user_header + '" onclick = "open_personal_info(' + "'" + task_publisher_id_list[i] + "'" + ')"/>';
				string_html += '</a>';
				string_html += '<div class = "task_header_content">';
				string_html += '<h1>' + task_publisher_list[i].t_user_info.user_real_name + '(' + task_publisher_section_list[i].section_id.section_name + '/' + task_publisher_section_list[i].society_member_position + ')</h1>';
				string_html += '<h2>' + task_time + '</h2>';
				string_html += '</div>';
				string_html += '<div class = "overtime">';
				string_html += '<h1>已提交</h1>';
				string_html += '</div>';
				string_html += '<div class="clear"></div>';
				string_html += '</div>';
				string_html += '<div class = "task_deadline">';
				string_html += '<h1>截止：' + task_end_date + '</h1>';
				string_html += '</div>';
				string_html += '<div class = "task_content">';
				string_html += '<h1>任务：' + task_list[i].task_content + '</h1>';
				string_html += '</div>';
				string_html += '<div id="task_score">';
				string_html += '<h1>评分：</h1>';
				string_html += '<ul>';
				string_html += '<li></li><li></li><li></li><li></li><li></li>';
				string_html += '</ul>';
				string_html += '</div>';
				string_html += '</div>';
			} else {
				string_html += '<div class = "task" id = "' + task_involved_id_list[i] + '">';
				string_html += '<div class = "task_header">';
				string_html += '<a>';
				string_html += '<img src="' + task_publisher_list[i].t_user_info.user_header + '" onclick = "open_personal_info(' + "'" + task_publisher_id_list[i] + "'" + ')"/>';
				string_html += '</a>';
				string_html += '<div class = "task_header_content">';
				string_html += '<h1>' + task_publisher_list[i].t_user_info.user_real_name + '(' + task_publisher_section_list[i].section_id.section_name + '/' + task_publisher_section_list[i].society_member_position + ')</h1>';
				string_html += '<h2>' + task_time + '</h2>';
				string_html += '</div>';
				string_html += '<div class = "overtime">';
				string_html += '<h1>已评分</h1>';
				string_html += '</div>';
				string_html += '<div class="clear"></div>';
				string_html += '</div>';
				string_html += '<div class = "task_deadline">';
				string_html += '<h1>截止：' + task_end_date + '</h1>';
				string_html += '</div>';
				string_html += '<div class = "task_content">';
				string_html += '<h1>任务：' + task_list[i].task_content + '</h1>';
				string_html += '</div>';
				string_html += '<div id="task_score">';
				string_html += '<h1>评分：</h1>';
				string_html += '<ul>';
				for (var j = 0; j < task_score_list[i]; j++) {
					string_html += '<li class="active"></li>';
				}
				for (var j = task_score_list[i]; j < 5; j++) {
					string_html += '<li></li>';
				}
				string_html += '</ul>';
				string_html += '</div>';
				string_html += '</div>';
			}
		}
		$('#main_frame').append(string_html);
		api.hideProgress();
	});
}

function get_section_info_bottom(func_name) {
	get_publisher_info_bottom(function() {
		var model = api.require('model');
		var query = api.require('query');

		model.config({
			appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8'
		});

		query.createQuery({}, function(ret, err) {
			//coding...
			if (ret && ret.qid) {
				var query_id = ret.qid;

				query.whereEqual({
					qid: query_id,
					column: 'society_id',
					value: society_id
				});

				query.whereContainAll({
					qid: query_id,
					column: 'user_id',
					value: task_publisher_id_list
				});

				query.include({
					qid: query_id,
					column: 'section_id'
				});

				query.limit({
            qid:query_id,
            value:1000
        });
        model.findAll({
					class: 't_society_member',
					qid: query_id
				}, function(ret, err) {
					//coding...
					if (ret) {
						// alert( JSON.stringify( ret ) );
						for (var i = 0; i < task_publisher_id_list.length - 1; i++) {
							for (var j = 0; j < ret.length; j++) {
								if (task_publisher_id_list[i] == ret[j].user_id) {
									task_publisher_section_list.push(ret[j]);
								}
							}
						}
						func_name();
					} else {
						api.alert({
							msg: err.msg
						});
					}

				});
			} else {
				api.alert({msg:"获取qid失败！"});
			}
		});


	});
}


function get_publisher_info_bottom(func_name) {
	get_task_info_bottom(function() {
		var model = api.require('model');
		var query = api.require('query');

		model.config({
			appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8'
		});

		query.createQuery({}, function(ret, err) {
			//coding...
			if (ret && ret.qid) {
				var query_id = ret.qid;
				query.whereContainAll({
					qid: query_id,
					column: 'id',
					value: task_publisher_id_list
				});

				query.include({
					qid: query_id,
					column: 't_user_info'
				});

				query.limit({
            qid:query_id,
            value:1000
        });
        model.findAll({
					class: 'user',
					qid: query_id
				}, function(ret, err) {
					//coding...
					if (ret) {
						for (var i = 0; i < task_publisher_id_list.length - 1; i++) {
							for (var j = 0; j < ret.length; j++) {
								if (task_publisher_id_list[i] == ret[j].id) {
									task_publisher_list.push(ret[j]);
								}
							}
						}
						func_name();
					} else {
						api.alert({
							msg: err.msg
						});
					}
				});
			} else {
				api.alert({msg:"获取qid失败！"});
			}
		});
	});
}

function get_task_info_bottom(func_name) {
	get_task_id_bottom(function() {
		var model = api.require('model');
		var query = api.require('query');

		model.config({
			appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8'
		});

		query.createQuery({}, function(ret, err) {
			//coding...
			if (ret && ret.qid) {
				var query_id = ret.qid;
				query.whereEqual({
					qid: query_id,
					column: 'society_id',
					value: society_id
				});

				query.whereContainAll({
					qid: query_id,
					column: 'id',
					value: task_id_list
				});

				query.limit({
            qid:query_id,
            value:1000
        });
        model.findAll({
					class: 't_society_task',
					qid: query_id
				}, function(ret, err) {
					//coding...
					if (ret) {
						for (var i = 0; i < task_id_list.length; i++) {
							for (var j = 0; j < ret.length; j++) {
								if (task_id_list[i] == ret[j].id) {
									task_list.push(ret[j]);
									task_publisher_id_list.push(ret[j].task_publisher);
								}
							}
						}
						task_publisher_id_list.push(null);
						func_name();
					} else {
						api.alert({
							msg: err.msg
						});
					}
				});
			} else {
				api.alert({msg:"无法获取qid！"});
			}
		});


	});
}

function get_task_id_bottom(func_name) {
	var model = api.require('model');
	var query = api.require('query');

	model.config({
		appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8'
	});

	query.createQuery({}, function(ret, err) {
		//coding...
		if (ret && ret.qid) {
			var query_id = ret.qid;
			query.whereEqual({
				qid: query_id,
				column: 'task_involved_user_id',
				value: user_id
			});

			query.whereEqual({
				qid: query_id,
				column: 'society_id',
				value: society_id
			});

			query.desc({
				qid: query_id,
				column: 'createdAt'
			});

			query.whereLessThan({
				qid: query_id,
				column: 'createdAt',
				value: bottom_date
			});

			query.limit({
				qid: query_id,
				value: perPage
			});

			model.findAll({
				class: 't_society_task_involved',
				qid: query_id
			}, function(ret, err) {
				//coding...
				if (ret != null && ret.length != 0) {
					bottom_date = ret[ret.length - 1].createdAt;
					// alert( JSON.stringify( ret ) );
					for (var i = 0; i < ret.length; i++) {
						task_id_list.push(ret[i].task_id);
						task_involved_id_list.push(ret[i].id);
						task_status_list.push(ret[i].task_status);
						task_score_list.push(ret[i].task_evaluation);
					}
					task_id_list.push(null);
					func_name();
				} else if (ret == null || ret.length == 0) {
					api.toast({
						msg: '没有更多任务了',
						duration: 2000,
						location: 'bottom'
					});
					api.hideProgress();
				} else {
					api.alert({
						msg: err.msg
					});
				}
			});
		} else {
			api.alert({msg:"获取qid失败！"});
		}
	});
}