function safe_verify(){
	
}

apiready = function(){
	var pageParam = api.pageParam;
	var phone = pageParam.phone;
	var verify_image = pageParam;
	alert( phone );
	var string_html = "<h1>" + phone + "</h1>";
	$('.null').before( string_html );
}