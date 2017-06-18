var imageArray = new Array();
var count = 0;
var time = "";
var Date1 = "";
var uploadTime;

function timePicker(obj) {
	api.openPicker({
		type : 'date',
		title : '选择时间'
	}, function(ret, err) {
		var year = ret.year;
		var month = ret.month;
		var day = ret.day;

		api.openPicker({
			type : 'time'
		}, function(ret, err) {
			//coding...
			var hour = ret.hour;
			var minute = ret.minute;
			if (minute < 10) {
				minute = "0" + minute;
			}
			if (hour < 10)
				hour = "0" + hour;
			Date1 = year + "-" + month + "-" + day;
			time = hour + ":" + minute;
			obj.value = year + "年" + month + "月" + day + "日" + ' ' + hour + ":" + minute;
		});
	})
}

function selectImage() {

	api.getPicture({
		sourceType : 'library',
		encodingType : 'jpg',
		mediaValue : 'pic',
		destinationType : 'url',
		allowEdit : true,
		quality : 100,
		targetWidth : 800,
		targetHeight : 800,
		saveToPhotoAlbum : false
	}, function(ret, err) {
		if (ret) {
			if (ret.data !== "") {
				imageArray.push(ret.data);
				$("#add").before('<li ><img tapmode="tap" onclick="deleteImg(this,' + "'" + ret.data + "'" + ')"src="' + ret.data + '" ></li>');
				api.parseTapmode();
			}
		} else {
			api.alert({
				msg : err.msg
			});
		}
	});

}

function deleteImg(obj, imgSrc) {

	api.confirm({
		title : '删除图片',
		msg : '亲，您确定要删除图片吗？',
		buttons : ['确定', '取消']
	}, function(ret, err) {
		if (ret.buttonIndex == 1) {
			obj.className = "hidden";
			var pos = imageArray.indexOf(imgSrc);
			imageArray.splice(pos, 1);
		}
	});

}

function returnBack() {

	api.closeWin({
	});
}

var click = 0;
function publishActivity() {

	var flag = 0;

	if ($api.trim($api.byId("activity_theme").value) === '') {
		api.alert({
			msg : "您没有填写主题哦，亲"
		})
		return;
	}
	if ($api.trim($api.byId("date").value) == '') {
		api.alert({
			msg : "您没有填写日期或时间，亲"
		})
		return;
	}
	if ($api.trim($api.byId("activity_site").value) === '') {
		api.alert({
			msg : "您没有填写活动地点，亲"
		})
		return;
	}
	if ($api.trim($api.byId("activity_personLimited").value) === '') {
		api.alert({
			msg : "您没有填写限制人数，亲"
		})
		return;
	}
	if ($api.trim($api.byId("activity_detail").value) === '') {
		api.alert({
			msg : "您没有填写活动详情，亲"
		})
		return;
	}

	if (click) {
		return;
	}
	click = 1;
	var clubID = $api.getStorage("society_id");
	var model = api.require('model');
	model.config({
		appKey : '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8',
		host : "https://d.apicloud.com"
	});
	//这里缺少一个判断提醒用户是否要修改活动，确定是否发送。

	var relation = api.require('relation');
	if (imageArray.length === 0) {

		api.confirm({
			title : '海报图片',
			msg : '亲，您确定不传海报图片',
			buttons : ['确定', '取消']
		}, function(ret, err) {
			if (ret.buttonIndex == 1) {
				api.showProgress({
					style : 'default',
					animationType : 'fade',
					title : '活动发布中...',
					text : '先喝杯茶吧...',
					modal : false
				});
				relation.insert({
					class : 't_society',
					id : clubID,
					column : 't_society_activity',
					value : {
						"activity_theme" : $api.byId("activity_theme").value,
						//						"activity_publish_date": 发布日期就是可以是表里自带的产生时间。
						"activity_start_date" : Date1 + " " + time,
						"activity_site" : $api.byId("activity_site").value,
						"activity_person_limited" : $api.byId("activity_personLimited").value,
						"activity_detail" : $api.byId("activity_detail").value,
						"activity_public" : document.getElementsByName("publishActivity")[0].checked,
						"society_id" : $api.getStorage("society_id"),
						"activity_check_status" : 0,
						"activity_publisher" : $api.getStorage("user_id"),
						"school_id" : $api.getStorage("user_school"),
						"activity_person_joined" : 0,
						"share_count":0,

					}
				}, function(ret, err) {
					//coding...
					if (ret) {

						if (ret.id == null) {
							api.alert({
								msg : "活动发布错误，请重试"
							});
							click = 0;
							return;
						}
						//						api.alert({
						//							msg : imageArray.length
						//						});
						var activityID = ret.id;
						add_member_score($api.getStorage("user_id"), clubID, 5)
						if (imageArray.length == 0) {
							insertMessage(clubID, activityID);
							api.execScript({
								name : "managerActivity",
								script : 'addNewActivity("' + $api.byId("activity_theme").value + '","' + $api.byId("activity_personLimited").value +
								'",'+"'"+activityID+"'"+');'
							});
						}
					} else {
						click = 0;
						api.alert({
							msg : err.msg
						});
						api.hideProgress();
					}
				});

			} else if (ret.buttonIndex == 2) {
				click = 0;

				api.hideProgress();
				return;
			}

		});

	} else {
		api.showProgress({
			style : 'default',
			animationType : 'fade',
			title : '活动发布中...',
			text : '先喝杯茶吧...',
			modal : false
		});

		relation.insert({
			class : 't_society',
			id : clubID,
			column : 't_society_activity',
			value : {
				"activity_theme" : $api.byId("activity_theme").value,
				//						"activity_publish_date": 发布日期就是可以是表里自带的产生时间。
				"activity_start_date" : Date1 + " " + time,
				"activity_site" : $api.byId("activity_site").value,
				"activity_person_limited" : $api.byId("activity_personLimited").value,
				"activity_detail" : $api.byId("activity_detail").value,
				"activity_public" : document.getElementsByName("publishActivity")[0].checked,
				"society_id" : $api.getStorage("society_id"),
				"activity_check_status" : 0,
				"activity_publisher" : $api.getStorage("user_id"),
				"school_id" : $api.getStorage("user_school"),
				"activity_person_joined" : 0,
				"share_count":0,

			}
		}, function(ret, err) {
			//coding...
			if (ret) {

				var activityID = ret.id;
				add_member_score($api.getStorage("user_id"), clubID, 5);
				for (var i = 0; i < imageArray.length; i++) {
					model.uploadFile({
						report : false,
						data : {
							file : {
								url : imageArray[i]
							}

						}
					}, function(ret, err) {
						if (ret) {
							relation.insert({
								class : 't_society_activity',
								id : activityID,
								column : 't_society_activity_album',
								value : {
									"activity_photo" : ret.url
								}
							}, function(ret, err) {
								count++;
								if (count == imageArray.length) {
									api.execScript({
										name : "managerActivity",
										script : 'addNewActivity("' + $api.byId("activity_theme").value + '","' + $api.byId("activity_personLimited").value +
								'",'+"'"+activityID+"'"+');'
									});
									insertMessage(clubID, activityID);

								}
							});
						}
					})
				}
			} else {
				api.hideProgress();
				click = 0;
				return;
			}
		});

	}
}

function getMySocietyMember(clubID, callback) {
	var model = api.require('model');
	var relation = api.require('relation');
	//	var receiverIDListDot = '';
	var receiverIDList = [];
	model.config({
		appKey : '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8',
		host : "https://d.apicloud.com"
	});

	relation.findAll({
		class : 't_society',
		id : clubID,
		column : 't_society_member'
	}, function(member_list, err) {
		//		api.alert({
		//			msg : member_list
		//		});

		if (member_list != null) {
			for (var i = 0; i < member_list.length; i++) {
				receiverIDList.push(member_list[i].user_id);
			}

			var query = api.require('query');
			query.createQuery({
			}, function(ret, err) {
				//coding...
				if (ret && ret.qid) {
					var queryID = ret.qid;
					query.justFields({
						qid : queryID,
						value : ["society_name"]
					});
					query.whereEqual({
						qid : queryID,
						column : 'id',
						value : clubID
					});
					query.limit({
            qid:queryID,
            value:1000
        });
        model.findAll({
						class : 't_society',
						qid : queryID
					}, function(ret, err) {
						if (ret != null) {
							callback(receiverIDList, ret[0].society_name);

						}
					});
				}
			});

		} else {
			alert("获取成员列表失败");
		}
	});
}

function insertMessage(clubID, actID) {

	getMySocietyMember(clubID, function(receiverIDList, society_name) {
		var messageList = [];
		var pushMessage = [];
		for (var i = 0; i < receiverIDList.length; i++) {

			messageList[i] = new Object();
			pushMessage[i] = new Object();
			messageList[i].type = 13;
			messageList[i].status = 0;
			messageList[i].content = society_name + "发活动了，快去看看吧";
			messageList[i].sender = $api.getStorage("user_id");
			messageList[i].receiver = receiverIDList[i];
			messageList[i].transaction_id = actID
			messageList[i].society = clubID;
			pushMessage[i].sender_id = $api.getStorage("user_id");
			pushMessage[i].receiver_id = receiverIDList[i];
			pushMessage[i].title = society_name;
			pushMessage[i].content = "发活动了，快去看看吧";
			pushMessage[i].type = 13;
			sendMessage(pushMessage[i]);
		}
		//		api.alert(messageList);
		insertMyNotice(messageList, function() {
			api.toast({
				msg : '活动发布成功，获得5个积分'
			});
			api.hideProgress();
			api.closeWin({
			});
		});
	});
}

function insertMyNotice(messageList, func_name) {

	var model = api.require('model');
	var query = api.require('query');
	var relation = api.require('relation');
	model.config({
		appKey : '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8'
	});
	var count = 0;
	api.showProgress({
		style : 'default',
		animationType : 'fade',
		title : '发送中...',
		text : '先喝口茶...',
		modal : false
	});
	for (var i = 0; i < messageList.length; i++) {
		//		alert(JSON.stringify(messageList[i]));
		var model = api.require('model');
		model.insert({
			class : 't_society_notice',
			value : {
				notice_type : messageList[i].type,
				notice_status : messageList[i].status,
				notice_content : messageList[i].content,
				notice_sender_id : messageList[i].sender,
				notice_receiver_id : messageList[i].receiver,
				relative_society_id : messageList[i].society,
				relative_society_transaction_id : messageList[i].transaction_id,

			}
		}, function(ret, err) {
			if (ret) {
				count++;
				if (count === messageList.length) {
					//回调
					func_name();
				}
			} else {
				api.hideProgress();
				api.alert({
					msg : err.msg
				});
			}
		});
	}
}