var school_date = "";

function save() {
	api.showProgress({
		title: '加载中...',
		msg: '注册中，请稍后...',
		modal: false
	});
	var pageParam = api.pageParam;
	var user_id = pageParam.user_id;
	var school_name = pageParam.school_name;
	var department_name = pageParam.department_name;
	var header_url = pageParam.header_url;
	var nickname = pageParam.nickname;
	var sex = pageParam.sex;

	var real_name = $('.real_name input').val();
	var school_num = $('.school_num input').val();

	if (real_name == null || real_name.length == 0 || school_num == null || school_num.length == 0 || school_date == null || school_date.length == 0) {
		api.alert({
			msg:"请输入必要信息"
		});
	} else {
		var model = api.require('model');
		var query = api.require('query');

		model.config({
			appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8',
			host: "https://d.apicloud.com"
		});

		// alert( header_url );

		model.uploadFile({
			report: false,
			data: {
				file: {
					url: header_url
				}
			}
		}, function(ret, err) {
			if (ret) {
				// alert( JSON.stringify( ret ) );
				var img_url = ret.id;
				model.insert({
					class: 't_user_info',
					value: {
						user_sex: sex,
						user_nickname: nickname,
						user_student_num: school_num,
						user_real_name: real_name,
						user_header: ret.url,
						user_school: school_name,
						user_department: department_name,
						user_school_date: school_date,
						user_signature: "",
						user_interests: "",
						user_love_status: ""
					}
				}, function(ret, err) {
					//coding...
					if (ret) {
						model.updateById({
							class: 'user',
							id: user_id,
							value: {
								t_user_info: ret.id,
								info_status: true
							}
						}, function(ret, err) {
							//coding...
							if (ret) {
								api.alert({
									msg: "旅程已开启！"
								});
								api.hideProgress();
								api.closeToWin({
									name: 'root'
								});
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
			} else {
				api.hideProgress();
				api.alert({
					msg: err.msg
				});
			}
		});
	}
}

function select_date() {
	api.openPicker({
		type: 'date',
		title: '选择入学时间'
	}, function(ret, err) {
		school_date = ret.year + '-' + ret.month + '-' + ret.day;
		$('.school_year .date').html(school_date);
	});
	// var obj = api.require('UICustomPicker');
	// obj.open({
	// 	rect:{
	// 		x: 0,
	// 		y: 64,
	// 		w: 320,
	// 		h: 250
	// 	},
	// 	styles:{
	// 		bg: 'rgba(0, 0, 0, 0)',
	// 		normalColor: '#959595',
	// 		selectedColor: '#3685dd',
	// 		selectedSize: 36,
	// 		tagColor: '#3685dd',
	// 		tagSize: 10
	// 	},
	// 	data:[{
	// 		tag: '年',
	// 		scope: '2000-2030'
	// 	}],
	// 	fixedOn: '',
	// 	fixed: true
	// }, function( ret, err ){
	// 	if( ret ){
	// 		alert( JSON.stringify( ret ) );
	// 	}
	// });
}

function get_back() {
	api.closeWin();
}

function apiready(){
	api.parseTapmode();
	var $header = $api.byId('header1');
	$api.fixIos7Bar($header);
}