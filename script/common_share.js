/*
 *模块1：用于新浪微博分享的公共模块
 * */
var sinaAPPKey = '2022922800';
var sinaAppSecret = '56f9f0af528e2c9519068b0aea4e42b2';

/*
 * 函数名:wbShareText()
 * 函数功能:新浪分享文本内容
 * 参数:textContent -- 文本内容,
 *  @param {Object} obj 触发查询的对象 ,可以为空
 *  @param {Object} where 来自哪里,可以为空
 * */
function wbShareText(textContent){
	var weibo = api.require('weibo');
	weibo.shareText({
		apiKey: sinaAPPKey,
	    text: textContent,
	},function(ret,err){
	    if (ret.status) {
		    api.alert({
		    	msg: "分享文本内容成功~"
		    });
	    }
	    else{
	    	api.alert({
		      	msg: "分享文本内容失败,失败信息:" + err.msg
		      });
	    }
	});
}
