var image_list = [];
var image_url_list = [];
var user_id;
var society_id;

var finance_time;
var finance_total;

function go_back() {
    api.closeWin();
}

function insert() {
    api.getPicture({
        sourceType: 'library',
        encodingType: 'jpg',
        mediaValue: 'pic',
        destinationType: 'url',
        quality: 50
    }, function(ret, err) {
        //coding...
        if (ret.data) {
            $(".add_image").before("<li><img src='" + ret.data + "' /></li>");
            image_list.push(ret.data);
        } else {
            api.alert({
                msg: err.msg
            });
        }
    });
}

function close() {
    api.closeWin();
}

function save() {
    var model = api.require('model');
    var relation = api.require('relation');
    var query = api.require('query');

    // var finance_time = $(".finance_time .content input").val().substring(0, 9) + $(".finance_time .content input").val().substring(11, 15);
    var finance_activity = $(".finance_activity .content input").val();
    finance_total = $(".finance_total .content input").val();
    var finance_person = $(".finance_person .content input").val();
    var finance_type = $("input[name='finance_type']:checked").val();

    var image_id = [];

    var count = 0;


    //验证财务金额只能为数字
    var reg = new RegExp("^[0-9]*$");


    if ( !reg.test(finance_total) ) {
        api.alert({
            msg: "财务金额只能为数字，请重新输入"
        });
    } else {
        if (finance_type == "out") {
            finance_total = 0 - finance_total;
        }



        model.config({
            appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8',
            host: "https://d.apicloud.com"
        });
        if (finance_person == "" || finance_activity == "" || finance_time == "" || finance_total == "") {
            api.alert({
                msg: "请输入必填信息"
            });
        } else {
            api.confirm({
                title: '警告',
                msg: '财务增加之后不可删除，请慎重',
                buttons: ['确定', '取消']
            }, function(ret, err) {
                //coding...
                if (ret.buttonIndex == 1) {
                    api.showProgress({
                        style: 'default',
                        animationType: 'fade',
                        title: '努力加载中...',
                        text: '先喝杯茶...',
                        modal: false
                    });
                    relation.insert({
                        class: 't_society',
                        id: society_id,
                        column: 't_society_financial',
                        value: {
                            finance_person: finance_person,
                            finance_name: finance_activity,
                            finance_time: finance_time,
                            finance_total: finance_total,
                            society_id: society_id
                        }
                    }, function(ret, err) {
                        //coding...
                        if (ret) {
                            var financial_id = ret.id;
                            var result = true;
                            // alert( image_list );
                            if (image_list == null || image_list.length == 0) {
                                query.createQuery({}, function(ret, err) {
                                    //coding...
                                    if (ret && ret.qid) {
                                        var query_id = ret.qid;
                                        query.whereEqual({
                                            qid: query_id,
                                            column: 'id',
                                            value: society_id
                                        });

                                        query.justFields({
                                            qid: query_id,
                                            value: ['financial_total']
                                        });

                                        query.limit({
            qid:query_id,
            value:1000
        });
        model.findAll({
                                            class: 't_society',
                                            qid: query_id
                                        }, function(ret, err) {
                                            //coding...
                                            if (ret) {
                                                var total_after;
                                                var total = parseInt(ret[0].financial_total);
                                                total_after = total + parseInt(finance_total);
                                                model.updateById({
                                                    class: 't_society',
                                                    id: society_id,
                                                    value: {
                                                        financial_total: total_after
                                                    }
                                                }, function(ret, err) {
                                                    //coding...
                                                    if (ret) {
                                                        api.execScript({
                                                            name: 'win_club_finance',
                                                            frameName: 'fra_club_finance',
                                                            script: 'refresh_total();'
                                                        });
                                                        api.alert({
                                                            msg : "增添财务成功！"
                                                        });
                                                        api.hideProgress();
                                                        api.closeWin();
                                                    } else {
                                                        api.alert({
                                                            msg : err.msg
                                                        });
                                                    }
                                                });
                                            } else {
                                                api.alert({
                                                    msg: err.msg
                                                });
                                            }
                                        });
                                    } else {
                                        api.alert({
                                            msg: err.msg
                                        });
                                    }
                                });
                            }
                            for (var i = 0; i < image_list.length; i++) {
                                model.uploadFile({
                                    report: false,
                                    data: {
                                        file: {
                                            url: image_list[i]
                                        },
                                        value: {
                                            transaction_id: financial_id
                                        }
                                    }
                                }, function(ret_1, err) {
                                    image_url_list.push(ret_1.url);
                                    count++;
                                    if (count == image_list.length) {
                                        for (var j = 0; j < image_url_list.length; j++) {
                                            relation.insert({
                                                class: 't_society_financial',
                                                id: financial_id,
                                                column: 't_society_financial_album',
                                                value: {
                                                    photo_url: image_url_list[j],
                                                    financial_id: financial_id
                                                }
                                            }, function(ret, err) {
                                                //coding...
                                            });
                                        }
                                        query.createQuery({}, function(ret, err) {
                                            //coding...
                                            if (ret && ret.qid) {
                                                var query_id = ret.qid;
                                                query.whereEqual({
                                                    qid: query_id,
                                                    column: 'id',
                                                    value: society_id
                                                });

                                                query.justFields({
                                                    qid: query_id,
                                                    value: ['financial_total']
                                                });

                                                query.limit({
            qid:query_id,
            value:1000
        });
        model.findAll({
                                                    class: 't_society',
                                                    qid: query_id
                                                }, function(ret, err) {
                                                    //coding...
                                                    if (ret) {
                                                        var total_after;
                                                        var total = parseInt(ret[0].financial_total);
                                                        total_after = total + parseInt(finance_total);
                                                        model.updateById({
                                                            class: 't_society',
                                                            id: society_id,
                                                            value: {
                                                                financial_total: total_after
                                                            }
                                                        }, function(ret, err) {
                                                            //coding...
                                                            if (ret) {
                                                                api.execScript({
                                                                    name: 'win_club_finance',
                                                                    frameName: 'fra_club_finance',
                                                                    script: 'refresh_total();'
                                                                });
                                                                api.alert({
                                                                    msg: "增添财务成功！"
                                                                });
                                                                api.hideProgress();
                                                                api.closeWin();
                                                            } else {
                                                                api.hideProgress();
                                                                api.alert({
                                                                    msg: err.msg
                                                                });
                                                            }
                                                        });
                                                    } else {
                                                        api.hideProgress();
                                                        api.alert({
                                                            msg: err.msg
                                                        });
                                                    }
                                                });
                                            } else {
                                                api.alert({
                                                    msg: err.msg
                                                });
                                            }
                                        });
                                    }
                                });
                            }

                        } else {
                            api.hideProgress();
                            api.alert({
                                msg: err.msg
                            });
                            api.closeWin({});
                        }
                    });
                }
            });

        }
    }



}

apiready = function() {
    user_id = $api.getStorage('user_id');
    society_id = $api.getStorage('society_id');
}

function open_date() {
    api.openPicker({
        type: 'date',
        title: '选择财务时间'
    }, function(ret, err) {
        finance_time = ret.year + '-' + ret.month + '-' + ret.day;
        date_html = '<h1>' + finance_time + '</h1>';
        $('.selected_time h1').html(date_html);
    });
}