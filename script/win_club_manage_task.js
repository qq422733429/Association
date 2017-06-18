apiready = function(){
	api.openFrame({
	    name: 'fra_club_manage_task',
	    url: 'fra_club_manage_task.html',
	    rect: {
		    x:0,
		    y:50,
		    w:'auto',
		    h:'auto'
	    }
    });
}

function add_task(){
	api.openWin({
	    name: 'win_club_new_task',
	    url: './win_club_new_task.html'
    });
}

function get_back(){
	api.closeWin();
}
