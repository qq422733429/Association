
function insertMyNotice(messageList) {

	var model = api.require('model');
	var query = api.require('query');
	var relation = api.require('relation');
	model.config({
		appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8'
	});
	var count = 0;
	
	for (var i = 0; i < messageList.length; i++) {
		//		alert(JSON.stringify(messageList[i]));
		var model = api.require('model');
		model.insert({
			class: 't_society_notice',
			value: {
				notice_type: messageList[i].type,
				notice_status: messageList[i].status,
				notice_content: messageList[i].content,
				notice_sender_id: messageList[i].sender,
				notice_receiver_id: messageList[i].receiver,
				relative_society_id: messageList[i].society,
				relative_society_transaction_id:messageList[i].transaction_id,
				
			}
		}, function(ret, err) {
			if (ret) {
				count++;
				if (count == messageList.length) {
					//回调
				  api.hideProgress();
				}
			} else {
				api.hideProgress();
				
			}
		});
	}
	 api.hideProgress();
}