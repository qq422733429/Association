apiready = function(){
	var user_id = $api.getStorage( 'user_id' );
	var society_id = $api.getStorage( 'society_id' );
	var position = $api.getStorage( 'position' );
	// get_user_position( user_id, society_id, function( ret ){
	// 	var position = ret.society_member_position;
	// 	if( position == "社长" || position == "副社长" || position == "部长" ){
	// 		$('#manage').remove();
	// 		string_html = '<img src = "../image/icon_manage.png" tapmode = "tap" onclick = "manage_task()"/>';
	// 		$('.title').after( string_html );
	// 		api.parseTapmode();
	// 	}
	// });
	if( position == "社长" || position == "副社长" || position == "部长" ){
			// $('#manage').remove();
			// string_html = '<img src = "../image/icon_manage.png" tapmode = "tap" onclick = "manage_task()"/>';
			// $('.title').after( string_html );
			// api.parseTapmode();
			$('.rightHeader').css('background-image', 'url(../image/icon_manage.png)');

	}

	api.openFrame({
	    name: 'fra_club_task',
	    url: 'fra_club_task.html',
	    rect: {
		    x:0,
		    y:50,
		    w:'auto',
		    h:'auto'
	    }
    });
}

function manage_task(){
	api.openWin({
	    name: 'win_club_manage_task',
	    url: './win_club_manage_task.html'
    });
}

function go_back(){
	api.closeWin();
}