function select_department( department_name ){
    api.openWin({
        name: "win_club_complete_info_1",
        url: "./win_club_complete_info_1.html",
        pageParam:{
            user_id: user_id,
            school_name: school_name,
            department_name: department_name
        }
    });
}
apiready = function(){
	var model = api.require( 'model' );
	var query = api.require( 'query' );
    var relation = api.require( 'relation' );
	
	model.config({
		appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8'
	})

    pageParam = api.pageParam;
    user_id = pageParam.user_id;
    school_id = pageParam.school_id;
    school_name = pageParam.school_name;
    
    relation.findAll({
	    class: 't_school',
	    id: school_id,
	    column:'t_department'
    },function(ret,err){
    	//coding...
        department = ret;
        var string_html = "";
        for( var i = 0; i < department.length; i++ ){
            string_html += '<h1 onclick="select_department(' + "'" + 
                department[i].department_name + "'" + ')">' + department[i].department_name + "</h1>";
        }
        $('.department .content').append( string_html );
    });
}

function go_back(){
    api.closeWin();
}
