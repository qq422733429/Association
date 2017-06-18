var header_url;

function add_header(){
	api.getPicture({
		sourceType: 'library',
		encodingType: 'jpg',
		mediaValue: 'pic',
		destinationType: 'url',
		quality: 100,
		targetWidth: 100,
		targetHeight: 100
    },function(ret,err){
    	//coding...
    	// alert( JSON.stringify( ret ) );
    	header_url = ret.data;
    	$('.user_header img').remove();
    	var photo_string = '<img src="' + header_url + '"  onclick="add_header()"/>';
    	$('.user_header h1').after( photo_string );
    });
}


function save(){
	var model = api.require( 'model' );
	var query = api.require( 'query' );
	model.config({
	    appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8',
	    host: "https://d.apicloud.com"
    });

    var pageParam = api.pageParam;
	var user_id = pageParam.user_id;
	var school_name = pageParam.school_name;

	var nickname = $('.nickname input').val();
	var sex = $('.sex input[name="sex"]:checked').val();
	if( header_url == null ){
		header_url == "";
	}
	if( nickname == null || sex == null || nickname.length == 0 ){
		api.alert({
			msg : "信息不能为空，请重新输入！"
		});
	}	
	else{
		api.openWin({
			name: 'win_club_complete_info_2',
			url: './win_club_complete_info_2.html',
			pageParam:{
				user_id: user_id,
				school_name: school_name,
				header_url: header_url,
				nickname: nickname,
				sex: sex
			}
		});
	}
	// alert( sex );
}

function go_back(){
	api.closeWin();
}

function apiready(){
	api.parseTapmode();
	var $header = $api.byId('header1');
	$api.fixIos7Bar($header);
	
	api.closeWin({
    	name: 'win_club_register_1'
	});
	api.closeWin({
		name: 'win_club_register_2'
	});
}


























