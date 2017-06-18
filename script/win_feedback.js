var dic = new Array();      //注意它的类型是Array
function select_text(id){
	var aabb = document.getElementById(id).style.getPropertyValue("color");
	var color = colorHex(aabb);
	//alert(color);
	if(color=="#74d8d2"){
		document.getElementById(id).style.color="#9F9FA6";//灰色
		dic[id]=false;
	}else if(color==null||color=="#9f9fa6"){
		document.getElementById(id).style.color="#74D8D2";//蓝色
		dic[id]=true;
	}
	//document.getElementById(no_use).style.color="#9F9FA6";
}


function colorHex(rgb){
   var _this = rgb;
   var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
   if(/^(rgb|RGB)/.test(_this)){
           var aColor = _this.replace(/(?:\(|\)|rgb|RGB)*/g,"").split(",");
           var strHex = "#";
           for(var i=0; i<aColor.length; i++){
                   var hex = Number(aColor[i]).toString(16);
                   hex = hex<10 ? 0+''+hex :hex;// 保证每个rgb的值为2位
                   if(hex === "0"){
                           hex += hex;
                   }
                   strHex += hex;
           }
           if(strHex.length !== 7){
                   strHex = _this;
           }
           return strHex;
   }else if(reg.test(_this)){
           var aNum = _this.replace(/#/,"").split("");
           if(aNum.length === 6){
                   return _this;
           }else if(aNum.length === 3){
                   var numHex = "#";
                   for(var i=0; i<aNum.length; i+=1){
                           numHex += (aNum[i]+aNum[i]);
                   }
                   return numHex;
           }
   }else{
           return _this;
   }
}



function sub_promotion(){
	
	
	var real_name= $api.getStorage('user_real_name');
	


	var output ="";
	 	for (var key in dic) {
            if(dic[key]){
            	output += key.substr(8,1);
            }
                
        }
        
    var content="";
    content =document.getElementById("suggestion").value;
    if(output==""&&content==""){
			api.toast({
			msg : "请输入相应的反馈建议在提交哦！"
			});
			return;	
		
			}else{
			api.showProgress({
			style : 'default',
			animationType : 'fade',
			title : '正努力提交中...',
			text : '先歇歇吧...',
			modal : false
			});
    
  
	var model = api.require('model');
	var query = api.require('query');
	model.config({
		appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8'
	});
		
	
		var model = api.require('model');
		model.insert({
			class: 't_feed_back',
			value: {
				name: real_name,
				select: output,
				content:content,
				
			}
		}, function(ret, err) {
			
			if (ret) {	
				alert("您的反馈意见我们已收到哦！");
							api.closeWin({
							});
							api.hideProgress();
				}
			
			});	
		}

}

function backWin(){
	api.closeWin({
    });
}


