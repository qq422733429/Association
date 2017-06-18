function b(a) {
	alert("DKDLK");
	alert(a);
}

apiready = function() {

	var user_name;
	var password;
	api.getPrefs({
		key: 'password'
	}, function(ret, err) {
		var v = ret.value;
		password = BASE64.decode(v);
		api.getPrefs({
			key: 'user_name'
		}, function(ret, err) {
			user_name = ret.value;
//			alert(user_name + "," + password);
			if (user_name && password) {
				login(user_name, password);
			} else {
				api.openWin({
					name: 'win_club_login',
					url: './win_club_login.html'
				});
			}
		});
	});

}