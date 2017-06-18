var task_id_list = [];
var task_list = [];
var task_involved_id_list = [];
var task_involved_task_id_list = [];
var task_involved_list = [];
var task_involved_info_list = [];
var task_involved_status_list = [];
var task_involved_user_id_list = [];
var task_involved_user_list = [];
var task_involved_section_list = [];

var user_id;
var society_id;

var evaluate_id;
var score;

var perPage = 4;

var date_up = '1900-01-01';
var date_bottom = null;


var string_html = "";

apiready = function() {
	user_id = $api.getStorage('user_id');
	society_id = $api.getStorage('society_id');

	show_task_up();

	api.setRefreshHeaderInfo({
		visible: true,
		bgColor: '#f2f2f2',
		textColor: '#4d4d4d',
		textDown: '下拉刷新...',
		textUp: '松开刷新...',
		showTime: true
	}, function(ret, err) {
		show_task_up();
		api.refreshHeaderLoadDone();
	});

	api.addEventListener({
		name: 'scrolltobottom',
		extra: {
			threshold: 0 //设置距离底部多少距离时触发，默认值为0，数字类型
		}
	}, function(ret, err) {
		//operation
		show_task_bottom();
	});
}

function show_task_up() {
	task_id_list = [];
	task_list = [];
	task_involved_id_list = [];
	task_involved_task_id_list = [];
	task_involved_list = [];
	task_involved_info_list = [];
	task_involved_status_list = [];
	task_involved_user_id_list = [];
	task_involved_user_list = [];
	task_involved_section_list = [];
	string_html = "";
	var section_name;
	api.showProgress({
		title: '加载中...',
		modal: false
	});
	get_section_info_up(function() {
		string_html = "";
		for (var i = 0; i < task_involved_id_list.length; i++) {
//			api.alert({
//				msg: "task_involved_id_list[i]:" + task_involved_id_list[i]
//			});
//			api.alert({
//				msg: "task_involved_section_list[i]:" + task_involved_section_list[i]
//			});
			//2015-10-11,Added by lzm
			if(null == task_involved_section_list[i] || 'undefined' == typeof(task_involved_section_list[i]) || null == task_involved_user_list[i] || 'undefined' == typeof(task_involved_user_list[i])){
//				api.alert({
//					msg: "continue:" + i
//				});
				//如果有无效数据，直接略过这一条展示
				continue;
			}
			var task_time = getDateFromString(task_involved_info_list[i].createdAt);
			var task_end_date = getDateFromString(task_involved_info_list[i].task_end_date);
			task_time = task_time.getFullYear() + '-' + (task_time.getMonth() + 1) + '-' + task_time.getDate();
			task_end_date = task_end_date.getFullYear() + '-' + (task_end_date.getMonth() + 1) + '-' + task_end_date.getDate();

			if( task_involved_section_list[i] == null || task_involved_section_list[i].section_id == null  || task_involved_section_list[i].section_id.section_name == null )
				section_name = '部门已删';
			else
				section_name = task_involved_section_list[i].section_id.section_name + '/' + task_involved_section_list[i].society_member_position;

			if (task_involved_status_list[i] == 1) {
				string_html += '<div class = "task" id = "' + task_involved_id_list[i] + '">';
				string_html += '<div class = "task_header">';
				string_html += '<a>';
				string_html += '<img src="' + task_involved_user_list[i].t_user_info.user_header + '" onclick = "open_personal_info(' + "'" + task_involved_user_id_list[i] + "'" + ')"/>';
				string_html += '</a>';
			
				string_html += '<div class = "task_header_content">';
				string_html += '<span>' + task_involved_user_list[i].t_user_info.user_real_name + '<span style="font-size:0.8em">(' + section_name + ')</span></span>';
				string_html += '<br/><span style="font-size:0.8em;color:#d5d5d5">' + task_time + '</span>';
				string_html += '</div>';
				string_html += '<div class = "overtime">';
				string_html += '正在进行';
				string_html += '</div>';
				string_html += '</div>';
				string_html += '<div class = "task_deadline">';
				string_html += '<h1>截止：' + task_end_date + '</h1>';
				string_html += '</div>';
				string_html += '<div class = "task_content">';
				string_html += '<h1>任务：' + task_involved_info_list[i].task_content + '</h1>';
				string_html += '</div>';
				string_html += '<div id="task_score">';
				string_html += '<h1>评分：</h1>';
				string_html += '<ul>';
				string_html += '<li></li><li></li><li></li><li></li><li></li>';
				string_html += '</ul>';
				string_html += '</div>';
				string_html += '</div>';
			} else if (task_involved_status_list[i] == 2) {
				string_html += '<div class = "task" id = "' + task_involved_id_list[i] + '">';
				string_html += '<div class = "task_header">';
				string_html += '<a>';
				string_html += '<img src="' + task_involved_user_list[i].t_user_info.user_header + '" onclick = "open_personal_info(' + "'" + task_involved_user_id_list[i] + "'" + ')"/>';
				string_html += '</a>';
				string_html += '<div class = "task_header_content">';
				string_html += '<span>' + task_involved_user_list[i].t_user_info.user_real_name + '<span style="font-size:0.8em">(' + section_name + ')</span></span>';
				string_html += '<br/><span style="font-size:0.8em;color:#d5d5d5">' + task_time + '</span>';
				string_html += '</div>';
				string_html += '<div class = "evaluate" tapmode = "tap" onclick = "submit(' + "'" + task_involved_id_list[i] + "','" + task_involved_user_id_list[i] + "'" + ')">';
				string_html += '评分';
				string_html += '</div>';
				string_html += '</div>';
				string_html += '<div class = "task_deadline">';
				string_html += '<h1>截止：' + task_end_date + '</h1>';
				string_html += '</div>';
				string_html += '<div class = "task_content">';
				string_html += '<h1>任务：' + task_involved_info_list[i].task_content + '</h1>';
				string_html += '</div>';
				string_html += '<div id="task_score">';
				string_html += '<h1>评分：</h1>';
				string_html += '<ul>';
				string_html += '<li onclick = "score(' + "'" + task_involved_id_list[i] + "'" + ')"></li>';
				string_html += '<li onclick = "score(' + "'" + task_involved_id_list[i] + "'" + ')"></li>';
				string_html += '<li onclick = "score(' + "'" + task_involved_id_list[i] + "'" + ')"></li>';
				string_html += '<li onclick = "score(' + "'" + task_involved_id_list[i] + "'" + ')"></li>';
				string_html += '<li onclick = "score(' + "'" + task_involved_id_list[i] + "'" + ')"></li>';
				string_html += '</ul>';
				string_html += '</div>';
				string_html += '</div>';
			} else {
				// alert( task_involved_list[i].task_evaluation );
				// alert( task_involved_list[i].task_status );
				string_html += '<div class = "task" id = "' + task_involved_id_list[i] + '">';
				string_html += '<div class = "task_header">';
				string_html += '<a>';
				string_html += '<img src="' + task_involved_user_list[i].t_user_info.user_header + '" onclick = "open_personal_info(' + "'" + task_involved_user_id_list[i] + "'" + ')"/>';
				string_html += '</a>';
				string_html += '<div class = "task_header_content">';
				string_html += '<span>' + task_involved_user_list[i].t_user_info.user_real_name + '<span style="font-size:0.8em">(' + section_name + ')</span></span>';
				string_html += '<br/><span style="font-size:0.8em;color:#d5d5d5">' + task_time + '</span>';
				string_html += '</div>';
				string_html += '<div class = "overtime">';
				string_html += '已评分';
				string_html += '</div>';
				string_html += '</div>';
				string_html += '<div class = "task_deadline">';
				string_html += '<h1>截止：' + task_end_date + '</h1>';
				string_html += '</div>';
				string_html += '<div class = "task_content">';
				string_html += '<h1>任务：' + task_involved_info_list[i].task_content + '</h1>';
				string_html += '</div>';
				string_html += '<div id="task_score">';
				string_html += '<h1>评分：</h1>';
				string_html += '<ul>';
				// alert( task_involved_list[i].task_evaluation );
				for (var j = 0; j < task_involved_list[i].task_evaluation; j++) {
					string_html += '<li class="active"></li>';
				}
				for (var k = task_involved_list[i].task_evaluation; k < 5; k++) {
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
	get_user_info_up(function() {
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
					value: task_involved_user_id_list
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
						for (var i = 0; i < task_involved_user_id_list.length; i++) {
							for (var j = 0; j < ret.length; j++) {
								if (task_involved_user_id_list[i] == ret[j].user_id) {
									task_involved_section_list.push(ret[j]);
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

function get_user_info_up(func_name) {
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
				query.whereContainAll({
					qid: query_id,
					column: 'id',
					value: task_involved_user_id_list
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
						// alert( JSON.stringify( ret ) );
						for (var i = 0; i < task_involved_user_id_list.length; i++) {
							for (var j = 0; j < ret.length; j++) {
								if (task_involved_user_id_list[i] == ret[j].id) {
									task_involved_user_list.push(ret[j]);
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
					column: 'society_id',
					value: society_id
				});

				query.whereEqual({
					qid: query_id,
					column: 'task_publisher',
					value: user_id
				});

				// query.desc({
				// 	qid: query_id,
				// 	column: 'createdAt'
				// });

				query.limit({
            qid:query_id,
            value:1000
        });
        model.findAll({
					class: 't_society_task',
					qid: query_id
				}, function(ret, err) {
					//coding...
					if (ret != null && ret.length != 0) {
						for (var i = 0; i < ret.length; i++) {
							task_id_list.push(ret[i].id);
						}
						task_id_list.push(null);
						task_list = ret;
						query.createQuery({}, function(ret, err) {
							//coding...
							if (ret && ret.qid) {
								var query_id_2 = ret.qid;
								query.whereEqual({
									qid: query_id_2,
									column: 'society_id',
									value: society_id
								});

								query.whereContainAll({
									qid: query_id_2,
									column: 'task_id',
									value: task_id_list
								});

								query.desc({
									qid: query_id_2,
									column: 'createdAt'
								});

								query.whereGreaterThan({
									qid: query_id_2,
									column: 'createdAt',
									value: date_up
								});

								query.limit({
									qid: query_id_2,
									value: perPage
								});

								model.findAll({
									class: 't_society_task_involved',
									qid: query_id_2
								}, function(ret, err) {
									//coding...
									if (ret != null && ret.length != 0) {
										if (date_bottom == null) {
											date_bottom = ret[ret.length - 1].createdAt;
										}
										date_up = ret[0].createdAt;
										for (var i = 0; i < ret.length; i++) {
											task_involved_id_list.push(ret[i].id);
											task_involved_user_id_list.push(ret[i].task_involved_user_id);
											task_involved_status_list.push(ret[i].task_status);
											task_involved_task_id_list.push(ret[i].task_id);
											task_involved_list.push(ret[i]);
										}
										for (var j = 0; j < task_involved_task_id_list.length; j++) {
											for (var k = 0; k < task_list.length; k++) {
												if (task_involved_task_id_list[j] == task_list[k].id) {
													task_involved_info_list.push(task_list[k]);
												}
											}
										}
										task_involved_user_id_list.push(null);
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
					} else if (ret == null || ret.length == 0) {
						api.toast({
							msg: '您还没有发布任务',
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

function score(task_involved_id) {
	var aLi = $('#' + task_involved_id + ' #task_score li');
	// alert( task_involved_id );
	// aLi.innerHTML = "LLLL";
	for (var i = 1; i < 6; i++) {
		aLi[i - 1].index = i;
		aLi[i - 1].onclick = function() {
			var p1 = this.parentNode;
			var p2 = p1.parentNode;
			var p3 = p2.parentNode;
			evaluate_id = $(p3).attr('id');
			for (var j = 0; j < this.index; j++) {
				aLi[j].className = 'active';
			}
			for (var k = aLi.length - 1; k >= this.index; k--) {
				aLi[k].className = "";
			}
			// alert( this.index );
			$(p3).attr('score', this.index);
		}
	}
}

function submit(task_involved_id, task_involved_user_id) {
	var score = $('#' + task_involved_id).attr('score');
	var model = api.require('model');
	var query = api.require('query');
	model.config({
		appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8'
	});

	// alert( score );

	if (typeof(score) != 'undefined' && score != 0) {
		model.updateById({
			class: 't_society_task_involved',
			id: task_involved_id,
			value: {
				task_evaluation: score,
				task_status: 3
			}
		}, function(ret, err) {
			//coding...
			if (ret) {
				add_member_score(task_involved_user_id, society_id, score);
				api.alert({
					msg: "评分成功！"
				});
				$('#' + task_involved_id + ' #task_score').addClass('task_scored');
				$('#' + task_involved_id + ' #task_scored').removeClass('task_score');

				var string_css_1 = '#' + task_involved_id + ' .evaluate';
				var string_css_2 = '#' + task_involved_id + ' .task_header_content';

				$(string_css_1).css('display', 'none');
				var string_html = '<div class = "overtime"><h1>已评分</h1></div>';
				$(string_css_2).after(string_html);
			} else {
				api.alert({
					msg: err.msg
				});
			}
		});
	} else {
		api.alert({
			msg: "您还没有为任务评分"
		});
	}
}

function show_task_bottom() {
	task_id_list = [];
	task_list = [];
	task_involved_id_list = [];
	task_involved_task_id_list = [];
	task_involved_list = [];
	task_involved_info_list = [];
	task_involved_status_list = [];
	task_involved_user_id_list = [];
	task_involved_user_list = [];
	task_involved_section_list = [];
	string_html = "";
	api.showProgress({
		title: '加载中...',
		modal: false
	});
	get_section_info_bottom(function() {
		// alert( task_involved_info_list );
		for (var i = 0; i < task_involved_id_list.length; i++) {
			var task_time = getDateFromString(task_involved_info_list[i].createdAt);
			var task_end_date = getDateFromString(task_involved_info_list[i].task_end_date);
			task_time = task_time.getFullYear() + '-' + (task_time.getMonth() + 1) + '-' + task_time.getDate();
			task_end_date = task_end_date.getFullYear() + '-' + (task_end_date.getMonth() + 1) + '-' + task_end_date.getDate();
			if( task_involved_section_list[i].section_id.section_name == null )
				section_name = '部门已删';
			else
				section_name = task_involved_section_list[i].section_id.section_name + '/' + task_involved_section_list[i].society_member_position;
			if (task_involved_status_list[i] == 1) {
				string_html += '<div class = "task" id = "' + task_involved_id_list[i] + '">';
				string_html += '<div class = "task_header">';
				string_html += '<a>';
				string_html += '<img src="' + task_involved_user_list[i].t_user_info.user_header + '" onclick = "open_personal_info(' + "'" + task_involved_user_id_list[i] + "'" + ')"/>';
				string_html += '</a>';
				string_html += '<div class = "task_header_content">';
				string_html += '<h1>' + task_involved_user_list[i].t_user_info.user_real_name + '(' + section_name + ')</h1>';
				string_html += '<h2>' + task_time + '</h2>';
				string_html += '</div>';
				string_html += '<div class = "overtime">';
				string_html += '正在进行';
				string_html += '</div>';
				string_html += '</div>';
				string_html += '<div class = "task_deadline">';
				string_html += '<h1>截止：' + task_end_date + '</h1>';
				string_html += '</div>';
				string_html += '<div class = "task_content">';
				string_html += '<h1>任务：' + task_involved_info_list[i].task_content + '</h1>';
				string_html += '</div>';
				string_html += '<div id="task_score">';
				string_html += '<h1>评分：</h1>';
				string_html += '<ul>';
				string_html += '<li></li><li></li><li></li><li></li><li></li>';
				string_html += '</ul>';
				string_html += '</div>';
				string_html += '</div>';
			} else if (task_involved_status_list[i] == 2) {
				string_html += '<div class = "task" id = "' + task_involved_id_list[i] + '">';
				string_html += '<div class = "task_header">';
				string_html += '<a>';
				string_html += '<img src="' + task_involved_user_list[i].t_user_info.user_header + '" onclick = "open_personal_info(' + "'" + task_involved_user_id_list[i] + "'" + ')"/>';
				string_html += '</a>';
				string_html += '<div class = "task_header_content">';
				string_html += '<h1>' + task_involved_user_list[i].t_user_info.user_real_name + '(' + task_involved_section_list[i].section_id.section_name + '/' + task_involved_section_list[i].society_member_position + ')</h1>';
				string_html += '<h1>' + task_time + '</h1>';
				string_html += '</div>';
				string_html += '<div class = "evaluate" tapmode = "tap" onclick = "submit(' + "'" + task_involved_id_list[i] + "'" + ')">';
				string_html += '评分';
				string_html += '</div>';
				string_html += '</div>';
				string_html += '<div class = "task_deadline">';
				string_html += '<h1>截止：' + task_end_date + '</h1>';
				string_html += '</div>';
				string_html += '<div class = "task_content">';
				string_html += '<h1>任务：' + task_involved_info_list[i].task_content + '</h1>';
				string_html += '</div>';
				string_html += '<div id="task_score">';
				string_html += '<h1>评分：</h1>';
				string_html += '<ul>';
				string_html += '<li onclick = "score(' + "'" + task_involved_id_list[i] + "'" + ')"></li>';
				string_html += '<li onclick = "score(' + "'" + task_involved_id_list[i] + "'" + ')"></li>';
				string_html += '<li onclick = "score(' + "'" + task_involved_id_list[i] + "'" + ')"></li>';
				string_html += '<li onclick = "score(' + "'" + task_involved_id_list[i] + "'" + ')"></li>';
				string_html += '<li onclick = "score(' + "'" + task_involved_id_list[i] + "'" + ')"></li>';
				string_html += '</ul>';
				string_html += '</div>';
				string_html += '</div>';
			} else {
				string_html += '<div class = "task" id = "' + task_involved_id_list[i] + '">';
				string_html += '<div class = "task_header">';
				string_html += '<a>';
				string_html += '<img src="' + task_involved_user_list[i].t_user_info.user_header + '" onclick = "open_personal_info(' + "'" + task_involved_user_id_list[i] + "'" + ')"/>';
				string_html += '</a>';
				string_html += '<div class = "task_header_content">';
				string_html += '<h1>' + task_involved_user_list[i].t_user_info.user_real_name + '(' + task_involved_section_list[i].section_id.section_name + '/' + task_involved_section_list[i].society_member_position + ')</h1>';
				string_html += '<h1>' + task_time + '</h1>';
				string_html += '</div>';
				string_html += '<div class = "overtime">';
				string_html += '已评分';
				string_html += '</div>';
				string_html += '</div>';
				string_html += '<div class = "task_deadline">';
				string_html += '<h1>截止：' + task_end_date + '</h1>';
				string_html += '</div>';
				string_html += '<div class = "task_content">';
				string_html += '<h1>任务：' + task_involved_info_list[i].task_content + '</h1>';
				string_html += '</div>';
				string_html += '<div id="task_score">';
				string_html += '<h1>评分：</h1>';
				string_html += '<ul>';
				// alert( task_involved_list[i].task_evaluation );
				for (var j = 0; j < task_involved_list[i].task_evaluation; j++) {
					string_html += '<li class="active"></li>';
				}
				for (var k = task_involved_list[i].task_evaluation; k < 5; k++) {
					string_html += '<li></li>';
				}
				string_html += '</ul>';
				string_html += '</div>';
				string_html += '</div>';
			}
		}
		// alert( string_html );
		$('#main_frame').append(string_html);
		api.hideProgress();
	});
}

function get_section_info_bottom(func_name) {
	get_user_info_bottom(function() {
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
					value: task_involved_user_id_list
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
						for (var i = 0; i < task_involved_user_id_list.length; i++) {
							for (var j = 0; j < ret.length; j++) {
								if (task_involved_user_id_list[i] == ret[j].user_id) {
									task_involved_section_list.push(ret[j]);
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

function get_user_info_bottom(func_name) {
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
				query.whereContainAll({
					qid: query_id,
					column: 'id',
					value: task_involved_user_id_list
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
						// alert( JSON.stringify( ret ) );
						for (var i = 0; i < task_involved_user_id_list.length; i++) {
							for (var j = 0; j < ret.length; j++) {
								if (task_involved_user_id_list[i] == ret[j].id) {
									task_involved_user_list.push(ret[j]);
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

function get_task_id_bottom(func_name) {
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
					column: 'society_id',
					value: society_id
				});

				query.whereEqual({
					qid: query_id,
					column: 'task_publisher',
					value: user_id
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
					// alert( JSON.stringify( ret ) );
					if (ret != null && ret.length != 0) {
						for (var i = 0; i < ret.length; i++) {
							task_id_list.push(ret[i].id);
						}
						task_id_list.push(null);
						task_list = ret;
						query.createQuery({},
							function(ret_2, err) {
								//coding...
								if (ret_2 && ret_2.qid) {
									var query_id_2 = ret_2.qid;
									query.whereEqual({
										qid: query_id_2,
										column: 'society_id',
										value: society_id
									});

									query.whereContainAll({
										qid: query_id_2,
										column: 'task_id',
										value: task_id_list
									});

									query.desc({
										qid: query_id_2,
										column: 'createdAt'
									});

									query.whereLessThan({
										qid: query_id_2,
										column: 'createdAt',
										value: date_bottom
									});

									query.limit({
										qid: query_id,
										value: perPage
									});

									model.findAll({
										class: 't_society_task_involved',
										qid: query_id_2
									}, function(ret_1, err) {
										//coding...
										if (ret_1 != null && ret_1.length != 0) {
											date_bottom = ret_1[ret_1.length - 1].createdAt;
											for (var i = 0; i < ret_1.length; i++) {
												task_involved_id_list.push(ret_1[i].id);
												task_involved_user_id_list.push(ret_1[i].task_involved_user_id);
												task_involved_status_list.push(ret_1[i].task_status);
												task_involved_task_id_list.push(ret_1[i].task_id);
												task_involved_list.push(ret_1[i]);
											}
											for (var j = 0; j < task_involved_task_id_list.length; j++) {
												for (var k = 0; k < task_list.length; k++) {
													if (task_involved_task_id_list[j] == task_list[k].id) {
														task_involved_info_list.push(task_list[k]);
													}
												}
											}
											task_involved_user_id_list.push(null);
											func_name();
										} else if (ret_1 == null || ret_1.length == 0) {
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
					} else if (ret == null || ret.length == 0) {
						api.toast({
							msg: '您还没有发布任务',
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