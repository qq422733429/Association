var school_opend = "";

function select_school( school_id, school_name ){
	api.openWin({
		name: "win_club_complete_info_1",
		url: "./win_club_complete_info_1.html",
		pageParam: { 
            user_id: user_id,
			school_id: school_id,
			school_name: school_name }
	});
}

apiready = function(){
	api.addEventListener({
    	name:'keyback'
	},function(ret,err){
    	//operation
    	api.closeToWin({
	        name: 'root'
        });
	});
	var model = api.require( 'model' );
	var query = api.require( 'query' );
	
	model.config({
		appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8'
	})

    pageParam = api.pageParam;
    user_id = pageParam.user_id;


	query.createQuery({
    },function(ret,err){
    	//coding...
    	if( ret && ret.qid ){
    		var query_id = ret.qid;
    		query.whereEqual({
	            qid: query_id,
	            column: 'is_opened',
	            value: true
            });
            query.limit({
            qid:query_id,
            value:1000
        });
            model.findAll({
	            class: 't_school',
	            qid: query_id
            },function(ret,err){
            	//coding...
            	if( ret ){
            		var school_opened = ret;
            		var string_html = "";
            		for( var i = 0; i < school_opened.length; i++ ){
            			string_html += '<h1 onclick="select_school(' + "'" +  
            			school_opened[i].id + "'," + "'" +  school_opened[i].school_name + 
            			"'" + ')">' + school_opened[i].school_name + '</h1>';
            		}
            		// alert( string_html );
            		$(".opened .content").append( string_html );
            	}
            	else{
            		alert( JSON.stringify( err ) );
            	}
            });
    	}
    });

    query.createQuery({
    },function(ret,err){
    	//coding...
    	if( ret && ret.qid ){
    		var query_id = ret.qid;
    		query.whereEqual({
	            qid: query_id,
	            column: 'is_opened',
	            value: false
            });
            query.limit({
            qid:query_id,
            value:1000
        });
            model.findAll({
	            class: 't_school',
	            qid: query_id
            },function(ret,err){
            	//coding...
            	if( ret ){
            		var school_closed = ret;
            		var string_html = "";
            		for( var i = 0; i < school_closed.length; i++ ){
            			string_html += "<h1>" + school_closed[i].school_name + "</h1>";
            		}
            		$(".closed .content").append( string_html );
            	}
            	else{
            		alert( JSON.stringify( err ) );
            	}
            });
    	}
    });
}

function go_back(){
    api.closeWin();
}
