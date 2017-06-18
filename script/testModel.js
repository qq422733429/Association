//insertSociety
function insertSociety()
{
	//insert
	//端方mcm访问数据库,并相应的填充前端页面
    var model = api.require('model');
    var relation = api.require('relation');
    model.config({
    	appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8',
    	appId: 'A6982914277502',
    	host: 'https://d.apicloud.com'
    });
    
    
    //insert
    model.insert({
	    class:'t_society',
	    value:{
	    	//这里id没有生效，而是系统直接自动分配给了
	    	society_name: '老罗文学社',
	    	society_info: '欢迎加入老罗文学社，在这里你能够发挥自己的能量，与一群热爱文学的人进行深入交流！',
	    	author: 'laoluo',
	    	publish: '55a8cb4b129969913baa25fb'
	    }
    },function(ret,err){
    	//coding...
    	if(ret) {
    		api.alert({
    			title: 'insert book success',
    			msg: 'insert book success msg'
            },function(ret,err){
            	//coding...
            });
    	}
    	else {
    		api.alert({
            	title: 'insert book failed',
            	msg: 'insert book failed msg'
    		},function(ret,err){
            	//coding...
            });
    	}
    });
}