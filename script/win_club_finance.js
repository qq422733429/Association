function add(){
	api.openWin({
	    name: 'win_club_insert_finance',
	    url: 'win_club_insert_finance.html'
    });
}

function go_back(){
	api.closeWin();
}

apiready = function(){
	var user_id = $api.getStorage('user_id');
	var society_id = $api.getStorage('society_id');
	var position = $api.getStorage('position');

	// get_user_position( user_id, society_id, function( ret ){
	// 	var position = ret.society_member_position;
	// 	if( position == '社长' || position == '副社长' ){
	// 		$('.null').remove();
	// 		var string_html = '<img src="../image/add_normal.png" onclick="add()" />';
	// 		$('.title').after( string_html );
	// 	}
	// });
	// 
	if( position == '社长' || position == '副社长' ){
		// $('.null').remove();
		// var string_html = '<img src="../image/add_normal.png" onclick="add()" />';
		// $('.title').after( string_html );
		$('.rightHeader').css('background-image', 'url(../image/add_normal.png)');
	}else{
		
		$api.remove($api.byId('rightxx'));
	}
	api.openFrame({
	    name: 'fra_club_finance',
	    url: 'fra_club_finance.html',
	    rect: {
		    x:0,
		    y:50,
		    w:'auto',
		    h:'auto'
	    }
    });
}











































