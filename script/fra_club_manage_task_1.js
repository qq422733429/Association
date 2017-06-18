var task_list = [];
var task_id_list = [];
var task_involved_id = []; //t_society_task_involved中id字段
var involved_task_id = []; //t_society_task_involved中task_id字段	
var task_involved_content = [];
var task_involved_deadline = [];
var task_involved_status = [];
var task_involved_score = [];
var task_involved_user_id = [];
var task_involved_user_header = [];
var task_involved_user_name = [];
var task_involved_section_name = [];
var task_involved_section_position = [];
var task_already = [];

var evaluate_id;
var score;

apiready = function() {
	var user_id = $api.getStorage('user_id');
	var society_id = $api.getStorage('current_society');
	show_task(user_id, society_id);
	api.setRefreshHeaderInfo({
		visible: true,
		// loadingImgae: 'wgt://image/refresh-white.png',
		bgColor: '#f2f2f2',
		textColor: '#4d4d4d',
		textDown: '下拉刷新...',
		textUp: '松开刷新...',
		showTime: true
	}, function(ret, err) {
		show_task('55bae837f17c2fa50c938598', '55b23e8ae6e6419036d0c383');
		api.refreshHeaderLoadDone();
	});
}

function show_task(user_id, society_id) {
	api.showProgress({
		title: '加载中...',
		modal: false
	});
	var string_html = "";
	get_section_info(user_id, society_id, function() {
		for (var i = 0; i < task_involved_id.length; i++) {
			if (task_involved_status[i] == 2) {
				string_html += '<div class = "task" id = "' + task_involved_id[i] + '" score = "0"><div class = "task_header"><div class = "user_header"><img src="' + task_involved_user_header[i] + '"/></div><div class = "task_header_content"><h1>' + task_involved_user_name[i] + '(' + task_involved_section_name[i] + '/' + task_involved_section_position[i] + ')</h1><h1>' + task_involved_deadline[i] + '</h1></div><div class = "null"></div><div class = "evaluate" onclick = "submit(' + "'" + task_involved_id[i] + "'" + ')"><h1>评分</h1></div></div><div class = "task_deadline"><h1>' + task_involved_deadline[i] + '</h1></div><div class = "task_content"><h1>任务：' + task_involved_content[i] + '</h1></div>' + '<div class = "task_score"><h1>评分：</h1><ul><li onclick = "score(' + "'" + task_involved_id[i] + "'" + ')"></li><li onclick = "score(' + "'" + task_involved_id[i] + "'" + ')"></li><li onclick = "score(' + "'" + task_involved_id[i] + "'" + ')"></li><li onclick = "score(' + "'" + task_involved_id[i] + "'" + ')"></li><li onclick = "score(' + "'" + task_involved_id[i] + "'" + ')"></li></ul></div></div>';
			} else {
				string_html += '<div class = "task" id = "' + task_involved_id[i] + '"><div class = "task_header"><div class = "user_header"><img src="' + task_involved_user_header[i] + '"/></div><div class = "task_header_content"><h1>' + task_involved_user_name[i] + '(' + task_involved_section_name[i] + '/' + task_involved_section_position[i] + ')</h1><h1>' + task_involved_deadline[i] + '</h1></div><div class = "null"></div><div class = "done"><h1>已评分</h1></div></div><div class = "task_deadline"><h1>' + task_involved_deadline[i] + '</h1></div><div class = "task_content"><h1>任务：' + task_involved_content[i] + '</h1></div>' + '<div class = "task_scored"><h1>评分：</h1><ul>';
				for (var j = 0; j < task_involved_score[i]; j++) {
					string_html += '<li class="active"></li>';
				}
				for (var k = task_involved_score[i]; k < 5; k++) {
					string_html += '<li></li>';
				}
				string_html += '</ul></div></div>';
			}
		}
		$('#main').append(string_html);
		api.hideProgress();
	});
}

function get_section_info(user_id, society_id, func_name) {
	get_user_info(user_id, society_id, function(ret) {
		var model = api.require('model');
		var query = api.require('query');

		model.config({
			appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8'
		});

		for (var i = 0; i < task_involved_user_id.length; i++) {
			for (var j = 0; j < ret.length; j++) {
				if (task_involved_user_id[i] == ret[j].id) {
					task_involved_user_header.push(ret[j].t_user_info.user_header);
					task_involved_user_name.push(ret[j].t_user_info.user_real_name);
				}
			}
		}

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
					value: task_involved_user_id
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
						for (var i = 0; i < task_involved_user_id.length; i++) {
							for (var j = 0; j < ret.length; j++) {
								if (task_involved_user_id[i] == ret[j].user_id) {
									task_involved_section_position.push(ret[j].society_member_position);
									task_involved_section_name.push(ret[j].section_id.section_name);
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
				alert("无法获取qid!");
			}
		});
	});
}

function get_user_info(user_id, society_id, func_name) {
	get_task_involved(user_id, society_id, function(ret) {
		var model = api.require('model');
		var query = api.require('query');

		model.config({
			appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8'
		});

		for (var i = 0; i < ret.length; i++) {
			if (task_already.indexOf(ret[i].id) !== -1) continue;
			else {
				task_involved_id.push(ret[i].id);
				involved_task_id.push(ret[i].task_id);
				task_involved_status.push(ret[i].task_status);
				task_involved_score.push(ret[i].task_evaluation);
				task_involved_user_id.push(ret[i].task_involved_user_id);
				task_already.push(ret[i].id);
				for (var j = 0; j < task_list.length; j++) {
					if (ret[i].task_id == task_list[j].id) {
						task_involved_content.push(task_list[j].task_content);
						var tmp = task_list[j].task_end_date.substring(0, 9) + ' ' + task_list[j].task_end_date.substring(11, 16);
						task_involved_deadline.push(tmp);
					}
				}
			}
		}

		query.createQuery({}, function(ret, err) {
			//coding...
			if (ret && ret.qid) {
				var query_id = ret.qid;
				query.whereContainAll({
					qid: query_id,
					column: 'id',
					value: task_involved_user_id
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
						func_name(ret);
					} else {
						api.alert({
							msg: err.msg
						});
					}
				});
			} else {
				alert('无法获取qid!');
			}
		});
	});
}

function get_task_involved(user_id, society_id, func_name) {
	var model = api.require('model');
	var query = api.require('query');

	model.config({
		appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8'
	});

	get_task_id(user_id, society_id, function(ret) {
		for (var i = 0; i < ret.length; i++) {
			task_id_list.push(ret[i].id);
		}
		query.createQuery({}, function(ret, err) {
			//coding...
			if (ret && ret.qid) {
				var query_id = ret.qid;
				query.whereContainAll({
					qid: query_id,
					column: 'task_id',
					value: task_id_list
				});

				query.whereNotEqual({
					qid: query_id,
					column: 'task_status',
					value: '1'
				});

				query.limit({
            qid:query_id,
            value:1000
        });
        model.findAll({
					class: 't_society_task_involved',
					qid: query_id
				}, function(ret, err) {
					//coding...
					if (ret) {
						func_name(ret);
					} else {
						api.alert({
							msg: err.msg
						});
					}
				});
			} else {
				alert("无法获取qid!");
			}
		});
	});
}

function get_task_id(user_id, society_id, func_name) {
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
				if (ret) {
					task_list = ret;
					func_name(ret);
				} else {
					api.alert({
						msg: err.msg
					});
				}
			});
		} else {
			alert("无法获取qid！");
		}
	});


}

function score(task_involved_id) {
	var aLi = $('#' + task_involved_id + ' .task_score li');
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

			$(p3).attr('score', this.index);
		}
	}
}

function submit(task_involved_id) {
	var score = $('#' + task_involved_id).attr('score');
	var model = api.require('model');
	var query = api.require('query');
	model.config({
		appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8'
	});

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
			alert({
				msg: "评分成功！"
			});
			$('#' + task_involved_id + '#task_score').addClass('task_scored');
			$('#' + task_involved_id + '#task_scored').removeClass('task_score');

			var string_css_1 = '#' + task_involved_id + ' .evaluate';
			var string_css_2 = '#' + task_involved_id + ' .null';

			$(string_css_1).css('display', 'none');
			var string_html = '<div class = "done"><h1>已评分</h1></div>';
			$(string_css_2).after(string_html);
		} else {
			api.alert({
				msg: err.msg
			});
		}
	});
}