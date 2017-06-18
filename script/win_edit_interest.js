var user_id;
var society_id;

var interests;
var birth;
var birth_after;
var love_status;

apiready = function() {
	user_id = $api.getStorage('user_id');
	society_id = $api.getStorage('society_id');

	interests = api.pageParam.interests;
	birth = api.pageParam.birth;
	love_status = api.pageParam.love_status;

	if (typeof(interests) == undefined || interests == null || interests.length == 0) {
		interests = "";
	}

	if (typeof(birth) == undefined || birth == null || birth.length == 0) {
		birth = "";
	} 
	if (typeof(love_status) == undefined || love_status == null || love_status.length == 0) {
		love_status = "";
	}

	var string_html = '';



	string_html += '<div class="item">';
	string_html += '<div class="key">兴趣爱好：</div>';
	string_html += '<input type="text" class="value" value="' + interests + '"/>';
	string_html += '</div>';
	string_html += '<div class="item" id="birth" onclick="open_date()">';
	string_html += '<span class="key">出生日期：</span>';
	string_html += '<span class="birth">' + birth + '</span>';
	string_html += '</div>';
	string_html += '<div class="item">';
	string_html += '<span class="key">恋爱状态：</span>';
	if (love_status == '单身汪') {
		string_html += '<input type="radio" name="love" class="love" value="单身汪" checked>单身汪';
		string_html += '<input type="radio" name="love" class="love" value="有主了">有主了';
	} else {
		string_html += '<input type="radio" name="love" class="love" value="单身汪">单身汪';
		string_html += '<input type="radio" name="love" class="love" value="有主了" checked>有主了';
	}
	string_html += '</div>';

	$('.school_info').append(string_html);

}

function save() {
	var model = api.require('model');
	model.config({
		appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8'
	});

	var interest = $('.value').val();
	var love_status = $('input[name="love"]:checked').val();

	var id = api.pageParam.id;

	model.updateById({
		class: 't_user_info',
		id: id,
		value: {
			user_interests: interest,
			user_birth: birth,
			user_love_status: love_status
		}
	}, function(ret, err) {
		//coding...
		if (ret) {
			api.execScript({
				name: 'win_edit_personal_page',
				script: 'refresh();'
			});
			api.alert({
				msg : "修改成功"
			});
			api.closeWin();
		} else {
			alert({
				msg : err.msg 
			});
		}
	});


}

function returnBack() {
	api.closeWin();
}

function open_date(){
	api.openPicker({
		type: 'date',
		title: '选择出生日期'
	},function( ret, err ){
		birth = ret.year + '-' + ret.month + '-' + ret.day;
		$('.birth').html( birth );
	});
}