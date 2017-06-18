var task_involved_id_list = [];
var task_involved_list = [];
var task_involved_name_list = [];
var task_involved_header_list = [];
var task_involved_select_list = [];
var task_involved_selected_index_list = [];
var new_member_list = [];
var task_involved_new_select_list = [];

var user_id;
var society_id;
var user_real_name;
var task_date;
var position = 0;

var is_new = 1;

var selector = new Object();



apiready = function() {
	user_id = $api.getStorage('user_id');
	society_id = $api.getStorage('society_id');
	user_real_name = $api.getStorage('user_real_name');
	
}
function save() {
	api.showProgress({
		style : 'default',
		animationType : 'fade',
		title : '发布中...',
		text : '请稍后...',
		modal : false
	});

	var task_topic = $('.task_topic input').val();

	var model = api.require('model');
	var relation = api.require('relation');

	model.config({
		appKey : '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8'
	});

	if (task_topic == null || task_topic.length == 0) {
		api.alert({
			msg : "请输入任务必要信息！"
		});
		api.hideProgress();
	} else if (task_involved_selected_index_list == null || task_involved_selected_index_list.length == 0) {
		api.alert({
			msg : "您还没有添加发布任务的对象"
		});
		api.hideProgress();
	} else if (task_date == null || typeof (task_date ) == undefined) {
		api.alert({
			msg : "请选择任务截止日期"
		});
		api.hideProgress();
	} else {
		relation.insert({
			class : 't_society',
			id : society_id,
			column : 't_society_task',
			value : {
				task_content : task_topic,
				task_publisher : user_id,
				task_status : true,
				task_end_date : task_date,
				society_id : society_id
			}
		}, function(ret, err) {
			//coding...
			if (ret) {
				var task_id = ret.id;
				for (var i = 0; i < task_involved_selected_index_list.length; i++) {
					var index = task_involved_selected_index_list[i];
					relation.insert({
						class : 't_society_task',
						id : task_id,
						column : 't_society_task_involved',
						value : {
							task_involved_user_id : task_involved_id_list[index],
							task_id : task_id,
							society_id : society_id,
							task_status : 1,
							task_evaluation : 0
						}
					}, function(ret, err) {
						//coding...
					});
				}

				for (var j = 0; j < task_involved_selected_index_list.length; j++) {
					var index = task_involved_selected_index_list[j];
					model.insert({
						class : 't_society_notice',
						value : {
							notice_type : 10,
							notice_status : 1,
							notice_content : '您收到一条任务',
							relative_society_transaction : task_id,
							notice_sender_id : user_id,
							relative_society_id : society_id,
							notice_receiver_id : task_involved_id_list[index],
						}
					}, function(ret, err) {
						//coding...
					});
				}

				add_member_score(user_id, society_id, 5);
				var receiver_list = "";
				for (var k = 0; k < task_involved_selected_index_list.length; k++) {
					var index = task_involved_selected_index_list[k];
					receiver_list += (task_involved_id_list[index] + ',');
				}

				var message = {
					sender_id : user_id,
					receiver_id : receiver_list,
					type : 10,
					title : user_real_name,
					content : '您收到一条任务'
				};

				sendMessage(message, function() {
					api.alert({
						msg : "添加任务成功！"
					});
					api.closeWin();
				});

			} else {
				api.alert({
					msg : err.msg
				});
				api.hideProgress();
			}
		});
	}
}

function add_member() {
	if (is_new == 1) {
		is_new = 0;
		task_involved_list = [];
		task_involved_id_list = [];
		task_involved_name_list = [];
		task_involved_header_list = [];
		task_involved_select_list = [];
		task_involved_new_select_list = [];

		var string_html = [];

		api.showProgress({
			title : '加载中...',
			modal : false
		});
		
		

		get_user_info(function() {
			// alert( JSON.stringify( task_involved_list ) );
			for (var i = 0; i < task_involved_id_list.length - 1; i++) {
				var tmp = task_involved_list[i].section_id.section_name + '/' + task_involved_name_list[i];
				task_involved_select_list.push(tmp);
			}
			// alert( task_involved_select_list );
			selector = api.require('multiSelector');
			selector.open({
				content : task_involved_select_list,
				y : api.winHeight - 325,
				height : 325,
				cancelImg : 'widget://image/icon_cancel.png',
				enterImg : 'widget://image/icon_confirm.png',
				titleImg : 'widget://image/bg_select_title.png'
			}, function(ret, err) {
				//coding...
				if (ret) {
					//alert( JSON.stringify( ret ) );
					var selected_name_list = ret.selectArray;
					for (var i = 0; i < selected_name_list.length; i++) {
						//2015-10-11,Modified by lzm,不能假定部门长度一定是3个字，所以这里改为以'/'作为名字的分割
						var name = selected_name_list[i].substring(selected_name_list[i].indexOf('/') + 1);
						//					api.alert({
						//						msg: "name:" + name
						//					});
						var j = task_involved_name_list.indexOf(name);
						var k = task_involved_selected_index_list.indexOf(j);
						// alert( k );
						if (k != -1)
							continue;
						//2015-10-11,Modified by lzm,-1的匹配不能添加进去
						if (-1 != j) {
							task_involved_selected_index_list.push(j);
							task_involved_new_select_list.push(j);
						}
					}

					string_html = "";
					for (var i = 0; i < task_involved_new_select_list.length; i++) {
						var index = task_involved_new_select_list[i];
						//					api.alert({
						//						msg: "index:" + index + "task_involved_new_select_list[i]:" + task_involved_new_select_list[i] + ",task_involved_list[index]:" + task_involved_list[index]
						//					});
						var section = task_involved_list[index].section_id.section_name + '/' + task_involved_list[index].society_member_position;

						string_html += '<li class = "task_involed" id = "' + index + '">';
						string_html += '<img src="' + task_involved_header_list[index] + '"/>';
						string_html += '<div class = "task_involed_content">';
						string_html += '<h1>' + task_involved_name_list[index] + '</h1>';
						string_html += '<h1>' + section + '</h1>';
						string_html += '</div>';
						string_html += '<img class = "delete" src="../image/remove.png" onclick = "delete_member(' + "'" + index + "'" + ')"/>';
						string_html += '</li>';
					}
					// alert( string_html );
					$('.task_in').before(string_html);

				} else {
					api.alert({
						msg : err.msg
					});
				}
			});
			api.hideProgress();
		});
	} else {
		task_involved_new_select_list = [];
		
		selector = api.require('multiSelector');
		selector.show();
		
		api.hideProgress();
	}
}

function get_user_info(func_name) {
	var model = api.require('model');
	var query = api.require('query');

	model.config({
		appKey : '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8'
	});

	select_task_member(function(ret) {
		for (var i = 0; i < ret.length; i++) {
			task_involved_id_list.push(ret[i].user_id);
			task_involved_list.push(ret[i]);
		}
		task_involved_id_list.push(null);
		query.createQuery({}, function(ret, err) {
			//coding...
			if (ret && ret.qid) {
				var query_id = ret.qid;
				query.whereContainAll({
					qid : query_id,
					column : 'id',
					value : task_involved_id_list
				});

				query.include({
					qid : query_id,
					column : 't_user_info'
				});

				query.limit({
            qid:query_id,
            value:1000
        });
        model.findAll({
					class : 'user',
					qid : query_id
				}, function(ret, err) {
					//coding...
					if (ret) {
						// alert( JSON.stringify( ret ) );
						for (var i = 0; i < task_involved_id_list.length; i++) {
							for (var j = 0; j < ret.length; j++) {
								if (task_involved_id_list[i] == ret[j].id) {
									task_involved_name_list.push(ret[j].t_user_info.user_real_name);
									task_involved_header_list.push(ret[j].t_user_info.user_header);
								}
							}
						}
						func_name();
					} else {
						api.alert({
							msg : err.msg
						});
					}
				});
			} else {
				api.alert({
					msg : "网络飞走，请重试！"
				});
			}
		});

	});
}

function select_task_member(func_name) {
	var model = api.require('model');
	var query = api.require('query');

	model.config({
		appKey : '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8'
	});

	get_user_position(user_id, society_id, function(ret) {
		// alert( JSON.stringify( ret ) );
		var position = ret.society_member_position;
		var section_id = ret.section_id;

		if (position == '社长' || position == '副社长') {
			query.createQuery({}, function(ret, err) {
				//coding...
				if (ret && ret.qid) {
					var query_id = ret.qid;

					query.whereEqual({
						qid : query_id,
						column : 'society_id',
						value : society_id
					});

					query.whereEqual({
						qid : query_id,
						column : 'society_member_position',
						value : '部长'
					});

					query.whereEqual({
						qid : query_id,
						column : 'is_deleted',
						value : false
					});

					query.include({
						qid : query_id,
						column : 'section_id'
					});

					query.limit({
            qid:query_id,
            value:1000
        });
        model.findAll({
						class : 't_society_member',
						qid : query_id
					}, function(ret, err) {
						//coding...
						if (ret != null && ret.length != 0) {
							// alert( JSON.stringify( ret ) );
							func_name(ret);
						} else if (ret == null || ret.length == 0) {
							api.alert({
								msg : "没有可以布置任务的成员"
							});
							api.hideProgress();
						} else {
							api.alert({
								msg : err.msg
							});
							api.hideProgress();
						}
					});
				} else {
					api.alert({
						msg : "获取qid失败！"
					});
					api.hideProgress();
				}
			});
		} else if (position == '部长') {
			var position_list = ['副部长', '干事'];

			query.createQuery({}, function(ret, err) {
				//coding...
				if (ret && ret.qid) {
					var query_id = ret.qid;
					query.whereEqual({
						qid : query_id,
						column : 'society_id',
						value : society_id
					});

					query.whereEqual({
						qid : query_id,
						column : 'section_id',
						value : section_id
					});

					//2015-10-11,Added by lzm,不能选择已被删除成员
					query.whereEqual({
						qid : query_id,
						column : 'is_deleted',
						value : false
					});

					query.whereContainAll({
						qid : query_id,
						column : 'society_member_position',
						value : position_list
					});

					query.include({
						qid : query_id,
						column : 'section_id'
					});

					query.limit({
            qid:query_id,
            value:1000
        });
        model.findAll({
						class : 't_society_member',
						qid : query_id
					}, function(ret, err) {
						//coding...
						if (ret != null && ret.length != 0) {
							func_name(ret);
						} else if (ret == null || ret.length == 0) {
							api.alert({
								msg : "没有可以布置任务的成员"
							});
							api.hideProgress();
						} else {
							api.alert({
								msg : err.msg
							});
							api.hideProgress();
						}
					});
				} else {
					api.alert({
						msg : "无法获取qid！"
					});
					api.hideProgress();
				}
			});
		} else {
			api.alert({
				msg : "你没有布置任务的权限！"
			});
			api.hideProgress();
		}
	});
}

function delete_member(index) {
	$('#' + index).remove();
	var i = task_involved_selected_index_list.indexOf(index);
	task_involved_selected_index_list.splice(i);
}

function open_date() {
	api.openPicker({
		type : 'date',
		title : '选择任务时间'
	}, function(ret, err) {
		task_date = ret.year + '-' + ret.month + '-' + ret.day;
		$('.time').html(task_date);
	});

}

function go_back() {
	api.closeWin();
}