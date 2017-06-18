var deleteStatus = false;

var user_id;

var delete_list = [];

apiready = function() {

	user_id = $api.getStorage('user_id');
	//	alert(user_id);
	//联网获取图片
	var model = api.require('model');
	var query = api.require('query');
	var relation = api.require('relation');
	model.config({
		appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8'
	});

	model.findById({
		class: 'user',
		id: user_id
	}, function(ret1, err1) {
		if (ret1) {
			//			alert(JSON.stringify(ret1));
			relation.findAll({
				class: 't_user_info',
				id: ret1.t_user_info,
				column: 'user_album'
			}, function(ret2, err2) {
				if (ret2) {
					//					alert(JSON.stringify(ret2));
					showPhoto(ret2);
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
}


function showPhoto(albumList) {
	var tpl = '';
	for (var i = 0; i < albumList.length; i++) {
		// alert( JSON.stringify(albumList[i]) );
		tpl += '<li onclick="select_photo(this' + ", '" + albumList[i].id + "'" + ')" tapmode="">';
		tpl += '<img src="' + albumList[i].user_photo + '" onclick="openFullPicture(this)"/>';
		tpl += '<img class="seleted hidden" src="../image/icon_save.png" />';
		tpl += '</li>';
	}
	tpl += '<div class="clear"></div>';
	$('.album').html(tpl);
}

function openFullPicture(obj) {
	var url = $(obj).attr('src');
	if (url && !deleteStatus)
		seeFullPicture(url);
}


function edit_album() {

	api.actionSheet({
		title: '管理图片',
		cancelTitle: '取消',
		buttons: ['上传图片', '删除图片']
	}, function(ret, err) {

		if (ret.buttonIndex == 2) {
			//删除图片
			deleteStatus = true;
			showDeleteBar();
		}

		if (ret.buttonIndex == 1) {
			//上传图片
			selectPhoto();
		}
		//		api.alert({
		//			msg: '你刚点击了' + ret.buttonIndex
		//		});
	});
}

function selectPhoto() {
	var model = api.require('model');
	var query = api.require('query');
	var relation = api.require('relation');

	model.config({
		appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8'
	});

	api.getPicture({
		sourceType: 'library',
		encodingType: 'jpg',
		mediaValue: 'pic',
		destinationType: 'url',
		//		allowEdit : true,
		quality: 100,
		targetWidth: 800,
		targetHeight: 400,
	}, function(ret, err) {
		if (ret) {
			api.showProgress({
				title: '加载中...',
				modal: false
			});
			model.uploadFile({
				report: false,
				data: {
					file: {
						url: ret.data
					}
				}
			}, function(ret_1, err) {
				if (ret_1.status != 0) {
					photo_url = ret_1.url;

					query.createQuery({}, function(ret_2, err) {
						//coding...
						if (ret_2 && ret_2.qid) {
							var query_id = ret_2.qid;
							query.whereEqual({
								qid: query_id,
								column: 'id',
								value: user_id
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
							}, function(ret_3, err) {
								api.hideProgress();
								//coding...
								var user_info_id = ret_3[0].t_user_info.id;
								relation.insert({
									class: 't_user_info',
									id: user_info_id,
									column: 'user_album',
									value: {
										user_photo: photo_url
									}
								}, function(ret_4, err) {
									//coding...
									if (ret_4) {
										api.hideProgress();
										api.execScript({
											name: 'win_edit_personal_page',
											script: 'refresh();'
										});
										api.alert({
											msg: "插入成功！"
										});
										location.reload();
										api.hideProgress();
									} else {
										api.hideProgress();
										api.alert({
											msg: err.msg
										});
									}
								});
							});
						}
					});
				} else {
					api.hideProgress();
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

function showDeleteBar() {
	$('.back').toggleClass('hidden');
	$('.delete').toggleClass('hidden');
	$('.right').toggleClass('hidden');
	$('.cancel').toggleClass('hidden');
}

function cancel() {
	showDeleteBar();
	//移除所有的选中样式
	var selected_list = $api.domAll('.seleted');
	for (var i = 0; i < selected_list.length; i++) {
		$api.addCls(selected_list[i], 'hidden');
	}

	deleteStatus = false;
}

function select_photo(obj, id) {
	if (deleteStatus == true) {
		var selectIcon = $api.dom(obj, '.seleted');
		$api.toggleCls(selectIcon, 'hidden');
		delete_list.push(id);
	}
}

function dele() {
	var model = api.require('model');
	model.config({
		appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8'
	});

	var status = true;
	api.confirm({
		title: '警告',
		msg: '您确定要删除选定照片？',
		buttons: ['确定', '取消']
	}, function(ret, err) {
		//coding...
		if (ret.buttonIndex == 1) {
			var count = 0;
			for (var i = 0; i < delete_list.length; i++) {
				model.deleteById({
					class: 't_user_album',
					id: delete_list[i],
				}, function(ret, err) {
					//coding...
					if (ret) {
						count++;
						if (count == delete_list.length) {
							api.alert({
								msg: "删除成功"
							});
							api.closeWin();
						}
					} else {
						status = false;
					}
				});
				if (status == false) {
					api.alert({
						msg: "删除失败，请重试"
					});
				}
			}
		}
	});
}

function closeWin() {
	api.closeWin();
}