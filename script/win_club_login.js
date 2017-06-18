function register() {
	api.openWin({
		name: 'win_club_register_1',
		url: './win_club_register_1.html'
	});
}

function reset_password() {
	api.openWin({
		name: "win_club_confirm_account",
		url: "./win_club_confirm_account.html",
		reload: 'true'
	});
}

function getLoginInfo() {
	var user_name = $(".phone input").val();
	var password = $(".password input").val();
	login(user_name, password);
}

apiready = function() {
	api.parseTapmode();
	var $header = $api.byId('header1');
	$api.fixIos7Bar($header);
	
	getChechedInfo();
}

function getChechedInfo() {
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
			//alert(user_name + "," + password);
			if (user_name && password) {
				$(".phone input").val(user_name);
				$(".password input").val(password);
				login(user_name, password);
			}
		});
	});

	api.addEventListener({
		name: 'keyback'
	}, function(ret, err) {
		api.closeWidget({
			silent: true
		})
	});
}
