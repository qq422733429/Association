apiready = function(){
	setInterval( show(), 200000 );
}

function show(){
	get_personal_inform( function( ret ){
		alert( JSON.stringify( ret ) );
	});
}

function get_personal_inform( func_name ){
	var model = api.require('model');
	var query = api.require( 'query' );
	
	model.config({
		appKey : '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8'
	});

	var user_id = '55bed87e08a8f6c224144f6f';
	
	query.createQuery({
    },function(ret,err){
    	//coding...
    	if( ret && ret.qid ){
    		var query_id = ret.qid;
    		query.whereEqual({
	            qid: query_id,
	            column: 'notice_receiver_id',
	            value: user_id
            });
            
            query.whereEqual({
	            qid: query_id,
	            column: 'notice_status',
	            value: 0
            });
            
            query.limit({
            qid:query_id,
            value:1000
        });
        model.findAll({
	            class: 't_society_notice',
	            qid: query_id
            },function(ret,err){
            	//coding...
            	func_name( ret );
            });
    	}
    	else{
    		alert( "无法获取qid!" );
    	}
    });
}

function get_back(){
	api.closeWin();
}
