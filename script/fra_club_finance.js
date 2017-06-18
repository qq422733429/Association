var financial_already = [];
var financial_list = [];
var financial_id_list = [];
var financial_album = [];
var user_id;
var society_id;
var string_html;
var finance_date;
var finance_date_down;
var finance_date_bottom;
var date_up = '1900-01-01';
var date_bottom = null;

function openDate() {
	api.openPicker({
		type: 'date',
		title: '选择财务时间'
	}, function(ret, err) {
		finance_date = ret.year + '年' + ret.month + '月之后';
		document.getElementById('month_select_btn').innerHTML = finance_date;
		finance_date_down = ret.year + '-' + ret.month + '-01';
		refresh();
	});
}

function refresh() {
	financial_list = [];
	financial_id_list = [];
	financial_album = [];

	var model = api.require('model');
	var query = api.require('query');
	var relation = api.require('relation');

	api.showProgress({
		title: '加载中...',
		modal: false
	});

	model.config({
		appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8'
	});

	string_html = '';


	query.createQuery({}, function(ret, err) {
		//coding...
		if (ret && ret.qid) {
			var query_id = ret.qid;
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
				column: 'finance_time',
				value: finance_date_down
			});

			query.limit({
				qid: query_id,
				value: 4
			});

			model.findAll({
				class: 't_society_financial',
				qid: query_id
			}, function(ret, err) {
				//coding...
				if (ret != null && ret.length != 0) {
					date_up = ret[0].createdAt;
					date_bottom = ret[ret.length - 1].createdAt;
					financial_list = ret;
					finance_date_bottom = financial_list[financial_list.length - 1].createdAt;
					// alert( JSON.stringify( ret ) );
					for (var i = 0; i < ret.length; i++) {
						financial_id_list.push(ret[i].id);
					}
					financial_id_list.push(null);

					// alert( financial_id_list );
					query.createQuery({}, function(ret, err) {
						//coding...
						if (ret && ret.qid) {
							var query_id_2 = ret.qid;

							query.whereContainAll({
								qid: query_id_2,
								column: 'financial_id',
								value: financial_id_list
							});

							query.limit({
            qid:query_id_2,
            value:1000
        });
        model.findAll({
								class: 't_society_financial_album',
								qid: query_id_2
							}, function(ret, err) {
								//coding...
								if (ret) {
									// alert( JSON.stringify( ret ) );
									for (var i = 0; i < financial_id_list.length - 1; i++) {
										var date = getDateFromString(financial_list[i].finance_time);
										date = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
										string_html += '<div class="finance_item">';
										string_html += '<div class="brief">';
										string_html += '<div class="left">';
										string_html += '<div class="title">';
										string_html += financial_list[i].finance_name;
										string_html += '</div>';
										string_html += '<div class="person_time">';
										string_html += financial_list[i].finance_person;
										string_html += '&nbsp;&nbsp;';
										string_html += date;
										string_html += '</div>';
										string_html += '</div>';
										string_html += '<div class="right">';
										string_html += financial_list[i].finance_total;
										string_html += '</div>';
										string_html += '</div>';
										string_html += '<ul class="evidence">';
										for (var j = 0; j < ret.length; j++) {
											if (financial_id_list[i] == ret[j].financial_id) {
												string_html += '<li><img src="' + ret[j].photo_url + '" /></li>';
											}
										}
										string_html += '<div class="clear"></div>';
										string_html += '</ul>';
										string_html += '</div>';
									}
									// alert( string_html );
									// $('#month_select_btn').after( string_html );
									$('#content').html(string_html);
									api.hideProgress();

								} else {
									api.alert({
										msg: err.msg
									});
									api.hideProgress();
								}
							});
						} else {
							api.alert({
								msg: err.msg
							});
							api.hideProgress();
						}
					});

				} else if (ret == null || ret.length === 0) {
					$('#content').html(string_html);
					api.toast({
						msg: '没有更多财务了',
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
			api.alert({
				msg: err.msg
			});
			api.hideProgress();
		}
	});


}

function refresh_up() {
	financial_list = [];
	financial_id_list = [];
	financial_album = [];

	var model = api.require('model');
	var query = api.require('query');
	var relation = api.require('relation');

	api.showProgress({
		title: '加载中...',
		modal: false
	});

	model.config({
		appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8'
	});

	string_html = '';

	refresh_total();


	query.createQuery({}, function(ret, err) {
		//coding...
		if (ret && ret.qid) {
			var query_id = ret.qid;
			query.whereEqual({
				qid: query_id,
				column: 'society_id',
				value: society_id
			});

			query.whereGreaterThan({
				qid: query_id,
				column: 'finance_time',
				value: finance_date_down
			});

			query.desc({
				qid: query_id,
				column: 'createdAt'
			});

			query.whereGreaterThan({
				qid: query_id,
				column: 'createdAt',
				value: date_up
			});

			query.limit({
				qid: query_id,
				value: 4
			});

			model.findAll({
				class: 't_society_financial',
				qid: query_id
			}, function(ret, err) {
				//coding...
				if (ret != null && ret.length != 0) {
					date_up = ret[0].createdAt;
					financial_list = ret;
					finance_date_bottom = financial_list[financial_list.length - 1].createdAt;
					// alert( JSON.stringify( ret ) );
					for (var i = 0; i < ret.length; i++) {
						financial_id_list.push(ret[i].id);
					}
					financial_id_list.push(null);

					// alert( financial_id_list );
					query.createQuery({}, function(ret, err) {
						//coding...
						if (ret && ret.qid) {
							var query_id_2 = ret.qid;

							query.whereContainAll({
								qid: query_id_2,
								column: 'financial_id',
								value: financial_id_list
							});

							model.findAll({
								class: 't_society_financial_album',
								qid: query_id_2
							}, function(ret, err) {
								//coding...
								if (ret) {
									// alert( JSON.stringify( ret ) );
									query.createQuery({}, function(ret, err) {
										//coding...
										if (ret && ret.qid) {
											var query_id = ret.qid;
											query.whereEqual({
												qid: query_id,
												column: 'id',
												value: society_id
											});

											query.justFields({
												qid: query_id,
												value: ['financial_total']
											});

											query.limit({
            qid:query_id,
            value:1000
        });
        model.findAll({
												class: 't_society',
												qid: query_id
											}, function(ret, err) {
												//coding...
												if (ret) {
													var total_html = '社团财务结余：' + ret[0].financial_total;
													$('#total').html(total_html);
												} else {
													api.alert({
														msg: err.msg
													});
												}
											});
										} else {
											api.alert({
												msg: err.msg
											});
										}
									});
									for (var i = 0; i < financial_id_list.length - 1; i++) {
										var date = getDateFromString(financial_list[i].finance_time);
										date = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
										string_html += '<div class="finance_item">';
										string_html += '<div class="brief">';
										string_html += '<div class="left">';
										string_html += '<div class="title">';
										string_html += financial_list[i].finance_name;
										string_html += '</div>';
										string_html += '<div class="person_time">';
										string_html += financial_list[i].finance_person;
										string_html += '&nbsp;&nbsp;';
										string_html += date;
										string_html += '</div>';
										string_html += '</div>';
										string_html += '<div class="right">';
										string_html += financial_list[i].finance_total;
										string_html += '</div>';
										string_html += '</div>';
										string_html += '<ul class="evidence">';
										for (var j = 0; j < ret.length; j++) {
											if (financial_id_list[i] == ret[j].financial_id) {
												string_html += '<li><img src="' + ret[j].photo_url + '" /></li>';
											}
										}
										string_html += '<div class="clear"></div>';
										string_html += '</ul>';
										string_html += '</div>';
									}
									// alert( string_html );
									// $('#month_select_btn').after( string_html );
									$('#content').prepend(string_html);
									refresh_total();
									api.hideProgress();
								} else {
									api.alert({
										msg: err.msg
									});
									api.hideProgress();
								}
							});
						} else {
							api.alert({
								msg: err.msg
							});
							api.hideProgress();
						}
					});

				} else if (ret == null || ret.length === 0) {
					api.toast({
						msg: '没有更多财务了',
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
			api.alert({
				msg: err.msg
			});
			api.hideProgress();
		}
	});


}

function refresh_bottom() {
	financial_list = [];
	financial_id_list = [];
	financial_album = [];

	var model = api.require('model');
	var query = api.require('query');
	var relation = api.require('relation');

	// alert( date_bottom );

	api.showProgress({
		title: '加载中...',
		modal: false
	});

	model.config({
		appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8'
	});

	string_html = '';

	query.createQuery({}, function(ret, err) {
		//coding...
		if (ret && ret.qid) {
			var query_id = ret.qid;
			query.whereEqual({
				qid: query_id,
				column: 'society_id',
				value: society_id
			});

			query.whereGreaterThan({
				qid: query_id,
				column: 'finance_time',
				value: finance_date_down
			});

			query.desc({
				qid: query_id,
				column: 'createdAt'
			});

			query.whereLessThan({
				qid: query_id,
				column: 'createdAt',
				value: date_bottom
			});

			query.limit({
				qid: query_id,
				value: 4
			});

			model.findAll({
				class: 't_society_financial',
				qid: query_id
			}, function(ret, err) {
				//coding...
				// alert( JSON.stringify( ret ) );
				if (ret != null && ret.length != 0) {
					financial_list = ret;
					date_bottom = financial_list[financial_list.length - 1].createdAt;
					// alert( JSON.stringify( ret ) );
					for (var i = 0; i < ret.length; i++) {
						financial_id_list.push(ret[i].id);
					}
					financial_id_list.push(null);

					// alert( financial_id_list );
					query.createQuery({}, function(ret, err) {
						//coding...
						if (ret && ret.qid) {
							var query_id_2 = ret.qid;

							query.whereContainAll({
								qid: query_id_2,
								column: 'financial_id',
								value: financial_id_list
							});


							query.limit({
            qid:query_id_2,
            value:1000
        });
        model.findAll({
								class: 't_society_financial_album',
								qid: query_id_2
							}, function(ret, err) {
								//coding...
								if (ret) {
									// alert( JSON.stringify( financial_list ) );
									for (var i = 0; i < financial_id_list.length - 1; i++) {
										var date = getDateFromString(financial_list[i].finance_time);
										date = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
										string_html += '<div class="finance_item">';
										string_html += '<div class="brief">';
										string_html += '<div class="left">';
										string_html += '<div class="title">';
										string_html += financial_list[i].finance_name;
										string_html += '</div>';
										string_html += '<div class="person_time">';
										string_html += financial_list[i].finance_person;
										string_html += '&nbsp;&nbsp;';
										string_html += date;
										string_html += '</div>';
										string_html += '</div>';
										string_html += '<div class="right">';
										string_html += financial_list[i].finance_total;
										string_html += '</div>';
										string_html += '</div>';
										string_html += '<ul class="evidence">';
										for (var j = 0; j < ret.length; j++) {
											if (financial_id_list[i] == ret[j].financial_id) {
												string_html += '<li><img src="' + ret[j].photo_url + '" /></li>';
											}
										}
										string_html += '<div class="clear"></div>';
										string_html += '</ul>';
										string_html += '</div>';
									}
									// alert( string_html );
									// $('#month_select_btn').after( string_html );
									$('#content').append(string_html);
									api.hideProgress();
								} else {
									api.alert({
										msg: err.msg
									});
									api.hideProgress();
								}
							});
						} else {
							api.alert({
								msg: err.msg
							});
							api.hideProgress();
						}
					});

				} else if (ret == null || ret.length === 0) {
					api.toast({
						msg: '已经没有更多财务了',
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
			api.alert({
				msg: err.msg
			});
			api.hideProgress();
		}
	});


}

apiready = function() {
	user_id = $api.getStorage('user_id');
	society_id = $api.getStorage('society_id');

	var date = new Date();
	var year = date.getFullYear();
	var month = date.getMonth() + 1;
	finance_date = year + '年' + month + '月之后';
	finance_date_down = year + '-' + month + '-1' + " 00:00";
	document.getElementById('month_select_btn').innerHTML = finance_date;

	refresh();
	api.setRefreshHeaderInfo({
		visible: true,
		// loadingImgae: 'wgt://image/refresh-white.png',
		bgColor: '#f2f2f2',
		textColor: '#4d4d4d',
		textDown: '下拉刷新...',
		textUp: '松开刷新...',
		showTime: true
	}, function(ret, err) {
		refresh_up();
		api.refreshHeaderLoadDone();
	});

	api.addEventListener({
		name: 'scrolltobottom',
		extra: {
			threshold: 0 //设置距离底部多少距离时触发，默认值为0，数字类型
		}
	}, function(ret, err) {
		//operation
		refresh_bottom();
	});
	refresh_total();
}

function refresh_total() {
	api.showProgress({
		style: 'default',
		animationType: 'fade',
		title: '努力加载中...',
		text: '先喝杯茶...',
		modal: false
	});
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
				column: 'id',
				value: society_id
			});

			query.justFields({
				qid: query_id,
				value: ['financial_total']
			});

			query.limit({
            qid:query_id,
            value:1000
        });
        model.findAll({
				class: 't_society',
				qid: query_id
			}, function(ret, err) {
				//coding...
				if (ret) {
					var total_html = '社团财务结余：' + ret[0].financial_total;
					$('#total').html(total_html);
					api.hideProgress();
				} else {
					api.hideProgress();
					api.alert({
						msg: err.msg
					});
				}
			});
		} else {
			api.hideProgress();
			api.alert({
				msg: err.msg
			});
		}
	});
}