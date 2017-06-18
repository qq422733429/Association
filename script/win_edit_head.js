var user_id;
var society_id;

var header_url = "";

apiready = function() {
	user_id = $api.getStorage('user_id');
	society = $api.getStorage('society_id');

	var user_info;

	var model = api.require('model');
	var query = api.require('query');

	var string_html = "";

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
			}, function(ret, err) {
				//coding...
				if (ret) {
					string_html += '<div class="user_header">';
					string_html += '<h1>头像：</h1>';
					string_html += '<img src="' + ret[0].t_user_info.user_header + '"  onclick="add_header()"/>';
					string_html += '</div>';
					string_html += '<div class="nickname">';
					string_html += '<h1>昵称：</h1>';
					string_html += '<input type="text" size = 20 value="' + ret[0].t_user_info.user_nickname + '"/>';
					string_html += '</div>';
					if (ret[0].t_user_info.user_signature != null && ret[0].t_user_info.user_signature.length != 0) {
						string_html += '<div class="signature">';
						string_html += '<h1>个性签名：</h1>';
						string_html += '<input type="text" size = 20 value="' + ret[0].t_user_info.user_signature + '"/>';
						string_html += '</div>';
					} else {
						string_html += '<div class="signature">';
						string_html += '<h1>个性签名：</h1>';
						string_html += '<input type="text" size = 20 />';
						string_html += '</div>';
					}
					$('.content').append(string_html);
				} else {
					alert(JSON.stringify(err));
				}

			});

		} else {
			alert("无法获取qid!");
		}
	});


}

function add_header() {
	api.getPicture({
		sourceType: 'library',
		encodingType: 'jpg',
		mediaValue: 'pic',
		destinationType: 'url',
		allowEdit : true,
		quality : 100,
		targetWidth : 100,
		targetHeight : 100
	}, function(ret, err) {
		//coding...
		header_url = ret.data;
		$('.user_header img').remove();
		var photo_html = '<img src="' + ret.data + '"  onclick="add_header()"/>';
		$('.user_header h1').after(photo_html);
	});
}

function save() {
	var model = api.require('model');
	var query = api.require('query');

	model.config({
		appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8'
	});

	var nickname = $('.nickname input').val();
	var signature = $('.signature input').val();


	if (header_url.length != 0) {
		api.showProgress({
			style: 'default',
			animationType: 'fade',
			title: '上传中...',
			text: '客官莫着急...',
			modal: false
		});
		model.uploadFile({
			report: false,
			data: {
				file: {
					url: header_url
				}
			}
		}, function(ret, err) {
			if (ret) {
				var photo_url = ret.url;
				query.createQuery({}, function(ret_1, err) {
					//coding...
					if (ret_1 && ret_1.qid) {
						var query_id = ret_1.qid;
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
						}, function(ret_2, err) {
							//coding...
							var id = ret_2[0].t_user_info.id;
							model.updateById({
								class: 't_user_info',
								id: id,
								value: {
									user_header: photo_url,
									user_nickname: nickname,
									user_signature: signature
								}
							}, function(ret_3, err) {
								//coding...
								if (ret_3) {
									$api.setStorage('user_header', photo_url);
									$api.setStorage('user_nick_name', nickname);

									api.execScript({
										name: 'win_edit_personal_page',
										script: 'refresh();'
									});
									api.execScript({
										name: 'index',
										frameName: 'userCenter',
										script: 'showUserInfo()'
									});
									api.hideProgress();
									api.alert({ 
										msg : '修改成功！'
									});
									api.closeWin();
								} else {
									api.hideProgress();
									alert(JSON.stringify(err));
								}

							});
						});
					} else {
						api.hideProgress();
						alert('获取qid失败！');
					}
				});
			} else {
				api.hideProgress();
				alert("上传图像失败，请重试");
			}
		});
	} else {
		query.createQuery({}, function(ret_1, err) {
			//coding...
			if (ret_1 && ret_1.qid) {
				var query_id = ret_1.qid;
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
				}, function(ret_2, err) {
					//coding...
					var id = ret_2[0].t_user_info.id;
					model.updateById({
							class: 't_user_info',
							id: id,
							value: {
								user_nickname: nickname,
								user_signature: signature
							}
						},
						function(ret_3, err) {
							//coding...
							if (ret_3) {
								api.execScript({
									name: 'win_edit_personal_page',
									script: 'refresh();'
								});
								alert('修改成功！');
								api.closeWin();
							} else {
								alert(JSON.stringify(err));
							}
						});
				});
			} else {
				alert('获取qid失败！');
			}
		});
	}
}

function returnBack() {
	api.closeWin();
}