var societyID = '';
var userID = '';
/*
 * 2015-8-16,Added by lzm,定义本模块用到的一些全局变量，用于本地缓存，以及解决
 * APICLOUD官方model函数回调和异步执行带来的问题
 */
var allPerEvaInfo = new Object;

function openOtherPerEva()
{
	//通过页面参数保存的最首页传递的参数
//	var header_h = api.pageParam.header_h;
//	var footer_h = api.pageParam.footer_h;
//	var rect_h = api.pageParam.rect_h;
	
	api.openWin({
		name : 'win_club_eva_all_members',
		url : 'win_club_eva_all_members.html'
	});
}

/*
 * 作者:lzm
 * 编写日期:2015-8-16 09:38
 * 函数名:getUserSection
 * 函数功能:获得用户在社团中的部门
 * 函数参数:societyID--所在社团ID,UserID:用户ID
 * 	  funcName--回调函数
 * 返回值:
 * */
function getUserSection(societyID, UserID, funcName){
	
}

/*
 * 作者:lzm
 * 编写日期:2015-8-16 09:38
 * 函数名:getUserSectionAndPosition
 * 函数功能:获得用户所在部门和职位
 * 函数参数:callbackRet--用此函数作为参数回调得到的结果
 * societyID--所在社团ID,UserID:用户ID
 * 	  funcName--回调函数
 * 返回值:回调函数执行结果
 * */
function getUserSectionAndPosition(callbackRet, societyID, userID, funcName){
	var model = api.require('model');
	var query = api.require('query');
	var relation = api.require('relation');

	var result;

	model.config({
		appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8'
	});
	
//	api.alert({
//		msg: "callbackRet:" + callbackRet + ",societyID:" + societyID + ", userID:" + userID + ",funcName:" + funcName,
//	});
	
	relation.findAll({
		class: 't_society',
		id: societyID,
		column: 't_society_member'
	}, function(ret, err) {
		//coding...
		// alert( JSON.stringify( ret ) );
		for (var i = 0; i < ret.length; i++) {
			if (ret[i].user_id == userID) {
				result = ret[i];
				break;
			}
		}
		model.findById({
			class: 't_society_section',
			id: result.section_id
		}, function(ret, err) {
			//coding...
			if(ret){
				result["section_name"] = ret.section_name;
				result["callbackRet"] = callbackRet;
				funcName(result);
			}
		});
	});
}

/*
 * 作者:lzm
 * 编写日期:2015-8-16 09:38
 * 函数名:getUserEvaInfo
 * 函数功能:获得某社团中用户某一年度的考核信息
 * 函数参数:callbackRet--上一个函数的回调结果
 * societyID--所在社团ID,UserID:用户ID
 * 	  yearStr:所在年度
 * 	  funcName--回调函数
 * 返回值:回调函数执行结果
 * */
function getUserEvaInfo(callbackRet, societyID, userID, yearStr,funcName){
	var model = api.require('model');
	var relation = api.require('relation');
	var query = api.require('query');
	var returnResult;
	
	//一键真机调试时候，下边的这个config是必须的,appKey里面的K是大写，appId也必须填写,注意一下!
	model.config({
	    appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8',
	    appId: 'A6982914277502',
	    host: 'https://d.apicloud.com'
    });
//  api.alert({
//		msg: "callbackRet:" + callbackRet + ",societyID:" + societyID + ", userID:" + userID + "yearStr:" + yearStr + ",funcName:" + funcName,
//	});
    
    relation.findAll({
	    class: 't_society',
	    id: societyID,
	    column: 't_society_member'
	}, function (ret, err) {
	    if (ret) {
	    	var i = 0;
	        for (; i < ret.length; i++) {
				if (ret[i].user_id == userID) {
					break;
				}
			}
	        
	        //如果找到对应用户就继续查找
	        if(i != ret.length){
	        	//继续查用户的社团考核信息
		        relation.findAll({
				    class: 't_society_member',
				    id: ret[i].id,
				    column: 't_society_member_evaluation'
				}, function (ret, err) {
				    if (ret) {
				        //do something
				        var j = 0;
				        for (; j < ret.length; j++) {
							if (ret[j].eva_year == yearStr) {
								returnResult = ret[j];
								break;
							}
						}
				        
				        if(j != ret.length){
				        	returnResult['callbackRet'] = callbackRet;
				        	funcName(returnResult);
				        }
				        else{
				        	api.toast({
							    msg: '没有找到对应用户年度的考核信息!',
							    duration:2000,
							    location: 'middle'
							});
				        }
				    }
				});
	        }
	        else{
	        	api.toast({
				    msg: '没有找到对应用户成员，请检查!',
				    duration:2000,
				    location: 'middle'
				});
	        }
	    }
	});
}

/*
 * 作者:lzm
 * 编写日期:2015-8-16 09:38
 * 函数名:getUserRelativeInfo
 * 函数功能:获得某一用户的user所有相关信息
 * 函数参数:callbackRet--上一个函数的回调结果
 * 	  userID:用户ID
 * 	  funcName--回调函数
 * 返回值:回调函数执行结果
 * */
function getUserRelativeInfo(callbackRet, userID, funcName){
	var model = api.require('model');
	var query = api.require('query');
	var relation = api.require('relation');
	
	//保存返回结果
	var result;
	var returnResult;
	
	//一键真机调试时候，下边的这个config是必须的,appKey里面的K是大写，appId也必须填写,注意一下!
	model.config({
	    appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8',
	    appId: 'A6982914277502',
	    host: 'https://d.apicloud.com'
    });
//	api.alert({
//		msg: 'callbackRet:' + callbackRet + ", userID:" + userID + ",funcName:" + funcName,
//	});
	
	query.createQuery(function(ret, err) {
	    if (ret && ret.qid) {
	        var queryId = ret.qid;
	        //包含t_user_info列
	        query.include({
	            qid: queryId,
	            column: 't_user_info'
	        });
	        //设置用户ID进行查询
	        query.whereEqual({
	            qid: queryId,
	            column: 'id',
	            value: userID
	        });
	        
	        query.limit({
            qid:queryId,
            value:1000
        });
        model.findAll({
	            class: "user",
	            qid: queryId
	        }, function(ret, err) {
	            if (ret) {
	            	//只有一个用户信息，所以保存组号1的信息
	            	result = ret[0];
	            	result['callbackRet'] = callbackRet;
	            	
	            	//函数回调
	            	funcName(result);
	            }
	            else{
	            	api.toast({
					    msg: '没有找到对应用户信息，请检查!',
					    duration:2000,
					    location: 'middle'
					});
	            }
	        });
	    }
	});
}

/*
 * 作者:lzm
 * 编写日期:2015-8-16 10:38
 * 函数名:getOtherClubYearMaxActNum
 * 函数功能:展示某社团中社长某一年度的考核信息(此函数需要用用户在社团中的社团和职位，以及年度考核信息)
 * 函数参数: callbackRet--上一个函数的回调结果
 * 	  funcName--回调函数
 * 返回值:回调函数执行结果
 * */
function getOtherClubYearMaxActNum(callbackRet, funcName){
	var model = api.require('model');
	var query = api.require('query');
	//组织的最多活动次数
	var maxOrganizedActNum = 0;
	var result;
	//一键真机调试时候，下边的这个config是必须的,appKey里面的K是大写，appId也必须填写,注意一下!
	model.config({
	    appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8',
	    appId: 'A6982914277502',
	    host: 'https://d.apicloud.com'
    });
	
	query.createQuery(function(ret, err) {
	    if (ret && ret.qid) {
	        var queryId = ret.qid;
	        //查找所有的社团考核信息
	        query.limit({
            qid:queryId,
            value:1000
        });
model.findAll({
	            class: "t_society_evaluation",
	            qid: queryId
	        }, function(ret, err) {
	            if (ret) {
	                var i = 0;
	                for(; i < ret.length; i++){
	                	//查找最大的活动次数
	                	if(ret[i].organized_act_num > maxOrganizedActNum){
	                		maxOrganizedActNum = ret[i].organized_act_num;
	                	}
	                }
	                
	                result['maxOrganizedActNum'] = maxOrganizedActNum;
	                result['callbackRet'] = callbackRet;
	                //回调
	                funcName(result);
	            }
	
	        });
	    }
	});
}

/*
 * 作者:lzm
 * 编写日期:2015-8-16 10:38
 * 函数名:showPresidentUserEvaInfo
 * 函数功能:展示某社团中社长某一年度的考核信息(此函数需要用用户在社团中的社团和职位，以及年度考核信息)
 * 函数参数: userID--用户ID,
 * 		   societyID--社团ID
 * 		   yearStr--哪一年度
 * 返回值:回调函数执行结果
 * */
function showPresidentUserEvaInfo(userID, societyID, yearStr){
	api.showProgress({
        title: '加载社团考核详情中...',
        modal: false
    });
	//组织的最多活动次数
	var maxOrganizedActNum = 0;
	var tpl = "";
	
	var model = api.require('model');
	var query = api.require('query');
	var relation = api.require('relation');

	//一键真机调试时候，下边的这个config是必须的,appKey里面的K是大写，appId也必须填写,注意一下!
	model.config({
	    appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8',
	    appId: 'A6982914277502',
	    host: 'https://d.apicloud.com'
    });
	
	//其他社团组织最多活动的社团
	query.createQuery(function(ret, err) {
	    if (ret && ret.qid) {
	        var queryId = ret.qid;
	        //查找所有的社团考核信息
	        query.limit({
            qid:queryId,
            value:1000
        });
model.findAll({
	            class: "t_society_evaluation",
	            qid: queryId
	        }, function(ret, err) {
	            if (ret) {
	                var i = 0;
	                for(; i < ret.length; i++){
	                	//查找最大的活动次数
	                	if(ret[i].organized_act_num > maxOrganizedActNum){
	                		maxOrganizedActNum = ret[i].organized_act_num;
	                	}
	                }
	                
	                allPerEvaInfo['maxOrganizedActNum'] = maxOrganizedActNum;
					//继续查找用户相关信息
					query.createQuery(function(ret, err) {
					    if (ret && ret.qid) {
					        var queryId = ret.qid;
					        //包含t_user_info列
					        query.include({
					            qid: queryId,
					            column: 't_user_info'
					        });
					        //设置用户ID进行查询
					        query.whereEqual({
					            qid: queryId,
					            column: 'id',
					            value: userID
					        });
					        
					        query.limit({
            qid:queryId,
            value:1000
        });
        model.findAll({
					            class: "user",
					            qid: queryId
					        }, function(ret, err) {
					            if (ret) {
					            	//只有一个用户信息，所以保存组号0的信息
					            	allPerEvaInfo['allUserMsgInfo'] = ret[0];
//									api.alert({
//										msg: 'allPerEvaInfo.allUserMsgInfo:' + ret[0],
//									});
									
									//继续查找用户的部门和职位信息
									relation.findAll({
										class: 't_society',
										id: societyID,
										column: 't_society_member'
									}, function(ret, err) {
										//coding...
										// alert( JSON.stringify( ret ) );
										var result;
										for (var j = 0; j < ret.length; j++) {
											if (ret[j].user_id == userID) {
												result = ret[j];
												break;
											}
										}
										model.findById({
											class: 't_society_section',
											id: result.section_id
										}, function(ret, err) {
											//coding...
											if(ret){
												result["section_name"] = ret.section_name;
												
												allPerEvaInfo['sectionAndPosition'] = result;
//												api.alert({
//									        		msg: 'result:' + JSON.stringify(allPerEvaInfo['sectionAndPosition']),
//									        	});
												
												//继续查找用户的考核信息
												relation.findAll({
												    class: 't_society',
												    id: societyID,
												    column: 't_society_member'
												}, function (ret, err) {
												    if (ret) {
												    	var k = 0;
												        for (; k < ret.length; k++) {
															if (ret[k].user_id == userID) {
																break;
															}
														}
												        
												        //如果找到对应用户就继续查找
												        if(k != ret.length){
												        	//继续查用户的社团考核信息
													        relation.findAll({
															    class: 't_society_member',
															    id: ret[k].id,
															    column: 't_society_member_evaluation'
															}, function (ret, err) {
															    if (ret) {
															        //do something
															        var m = 0;
															        for (; m < ret.length; m++) {
																		if (ret[m].eva_year == yearStr) {
																			returnResult = ret[m];
																			break;
																		}
																	}
															        
															        if(m != ret.length){
															        	allPerEvaInfo['memberEvaInfo'] = returnResult;
//															        	api.alert({
//															        		msg: 'allPerEvaInfo:' + JSON.stringify(allPerEvaInfo),
//															        	});
															        	
															        	//动态渲染页面
															        	tpl += '<div id="person_general" style="background-image: url(' + allPerEvaInfo.allUserMsgInfo.t_user_info.user_header + ');">';
																		tpl += '<ul id="person_info" class="person_info">';
																		tpl += '<span id="person_name" class="person_name">' + allPerEvaInfo.allUserMsgInfo.t_user_info.user_real_name + '</span>';
																		tpl += '<span id="person_title" class="person_title">(' + allPerEvaInfo.sectionAndPosition.section_name + '/' + allPerEvaInfo.sectionAndPosition.society_member_position + ')</span>';
																		tpl += '</ul>';
																		tpl += '<ul id="person_medal">';
																		tpl += '<span id="person_medal_li1"></span>';
																		tpl += '<span id="person_medal_li2"></span>';
																		tpl += '<span id="person_medal_li3"></span>';
																		tpl += '<span id="person_medal_li4"></span>';
																		tpl += '<span id="person_medal_li5"></span>';
																		tpl += '</ul>';
																		tpl += '</div>';
																		tpl += '<div id="brief">';
																		tpl += '<ul id="total_org_act_num" class="brif_bom">';
																		tpl += '<span id="li1">组织活动次数</span>';
																		tpl += '<span id="li2">' + allPerEvaInfo.memberEvaInfo.organized_act_num + '</span>';
																		tpl += '</ul>';
																		tpl += '<ul id="other_club_total_act" class="brif_bom">';
																		tpl += '<span id="li1">其他社团本年度最高活动次数</span>';
																		tpl += '<span id="li2">' + allPerEvaInfo['maxOrganizedActNum'] + '</span>';
																		tpl += '</ul>';
																		tpl += '<ul id="org_act_degree" class="brif_bom">';
																		tpl += '<span id="li1">组织活动活跃度</span>';
																		tpl += '<span id="li2">' + allPerEvaInfo.memberEvaInfo.organized_act_active_degree + '</span>';
																		tpl += '</ul>';
																		tpl += '<ul id="other_club_per_assessment" tapmode="tap" onclick="openOtherPerEva()">';
																		tpl += '<span id="li1">社团其他人员考核</span>';
																		tpl += '<span id="li2"><a id="other_club_tip"></a></span>';
																		tpl += '</ul>';
																		tpl += '</div>';
																		tpl += '</div>';
																		
																		$("#main").html(tpl);
															        	api.hideProgress();
															        }
															        else{
															        	api.toast({
																		    msg: '没有找到对应用户年度的考核信息!',
																		    duration:2000,
																		    location: 'middle'
																		});
															        }
															    }
															});
												        }
												        else{
												        	api.toast({
															    msg: '没有找到对应用户成员，请检查!',
															    duration:2000,
															    location: 'middle'
															});
												        }
												    }
												});
												
											}
											else{
												api.toast({
												    msg: '没有找到对应社员相关的部门职位信息!',
												    duration:2000,
												    location: 'middle'
												});
											}
										});
									});
									
					            }
					            else{
					            	api.toast({
									    msg: '没有找到对应用户信息，请检查!',
									    duration:2000,
									    location: 'middle'
									});
					            }
					        });
					    }
					});
	            }
	
	        });
	    }
	});
	
//	var tpl = "";
//	var userSecAndPos = evaInfo['callbackRet'];
//	var userRelativeInfo = userSecAndPos['callbackRet'];
//	var otherClubMaxYearActNum = userSecAndPos['callbackRet'];
//	
//	api.alert({
//		msg: "userSecAndPos:" + userSecAndPos,
//	});
//	api.alert({
//		msg: "userRelativeInfo:" + userRelativeInfo,
//	});
//	api.alert({
//		msg: "otherClubMaxYearActNum:" + otherClubMaxYearActNum,
//	});
//	
//	tpl += '<div id="person_general">';
//	tpl += '<ul id="person_info" class="person_info">';
//	tpl += '<span id="person_name" class="person_name">' + userRelativeInfo.t_user_info.user_real_name + '</span>';
//	tpl += '<span id="person_title" class="person_title">(' + userSecAndPos.section_name + '/' + userSecAndPos.society_member_position + ')</span>';
//	tpl += '</ul>';
//	tpl += '<ul id="person_medal">';
//	tpl += '<span id="person_medal_li1"></span>';
//	tpl += '<span id="person_medal_li2"></span>';
//	tpl += '<span id="person_medal_li3"></span>';
//	tpl += '<span id="person_medal_li4"></span>';
//	tpl += '<span id="person_medal_li5"></span>';
//	tpl += '</ul>';
//	tpl += '</div>';
//	tpl += '<div id="brief">';
//	tpl += '<ul id="total_org_act_num" class="brif_bom">';
//	tpl += '<span id="li1">组织活动次数</span>';
//	tpl += '<span id="li2">' + evaInfo.organized_act_num + '</span>';
//	tpl += '</ul>';
//	tpl += '<ul id="other_club_total_act" class="brif_bom">';
//	tpl += '<span id="li1">其他社团本年度最高活动次数</span>';
//	tpl += '<span id="li2">' + otherClubMaxYearActNum.maxOrganizedActNum + '</span>';
//	tpl += '</ul>';
//	tpl += '<ul id="org_act_degree" class="brif_bom">';
//	tpl += '<span id="li1">组织活动活跃度</span>';
//	tpl += '<span id="li2">' + evaInfo.organized_act_active_degree + '</span>';
//	tpl += '</ul>';
//	tpl += '<ul id="other_club_per_assessment" tapmode="tap" onclick="openOtherPerEva()">';
//	tpl += '<span id="li1">社团其他人员考核</span>';
//	tpl += '<span id="li2"><a id="other_club_tip"></a></span>';
//	tpl += '</ul>';
//	tpl += '</div>';
//	tpl += '</div>';
//	
//	$("#main").append(tpl);
	//收起刷新条
//	api.hideProgress();
}

/*
 * 作者:lzm
 * 编写日期:2015-8-19 10:38
 * 函数名:showPresidentUserEvaInfoEx
 * 函数功能:展示某社团中社长某一年度的考核信息(此函数调用common_club_evaluation.js中的公共函数返回的回调结果)
 * 函数参数: userEvaObj - 用户考核信息对象
 * 返回值:回调函数执行结果
 * */
function showPresidentUserEvaInfoEx(userEvaObj){
//	api.showProgress({
//	    style: 'default',
//	    animationType: 'fade',
//	    title: '努力加载考核信息中...',
//	    text: '先喝杯茶吧...',
//	    modal: false
//	});
	var tpl = "";
	var memEvaMsg = userEvaObj;
//	api.alert({
//		msg: "userEvaObj:" + (JSON.stringify(userEvaObj)), 
//	});
	
	var model = api.require('model');
	var query = api.require('query');
	var relation = api.require('relation');
	//一键真机调试时候，下边的这个config是必须的,appKey里面的K是大写，appId也必须填写,注意一下!
	model.config({
	    appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8',
	    appId: 'A6982914277502',
	    host: 'https://d.apicloud.com'
    });
	
	//查找用户相关信息
	query.createQuery(function(ret, err) {
	    if (ret && ret.qid) {
	        var queryId = ret.qid;
	        //包含t_user_info列
	        query.include({
	            qid: queryId,
	            column: 't_user_info'
	        });
	        //设置用户ID进行查询
	        query.whereEqual({
	            qid: queryId,
	            column: 'id',
	            value: userID
	        });
	        
	        query.limit({
            qid:queryId,
            value:1000
        });
        model.findAll({
	            class: "user",
	            qid: queryId
	        }, function(ret, err) {
	            if (ret) {
	            	//只有一个用户信息，所以保存组号0的信息
	            	allPerEvaInfo['allUserMsgInfo'] = ret[0];
//									api.alert({
//										msg: 'allPerEvaInfo.allUserMsgInfo:' + ret[0],
//									});
					
					//继续查找用户的部门和职位信息
					relation.findAll({
						class: 't_society',
						id: societyID,
						column: 't_society_member'
					}, function(ret, err) {
						//coding...
						// alert( JSON.stringify( ret ) );
						var result;
						for (var j = 0; j < ret.length; j++) {
							if (ret[j].user_id == userID) {
								result = ret[j];
								allPerEvaInfo['society_member_score'] = result.society_member_score;
								break;
							}
						}
						model.findById({
							class: 't_society_section',
							id: result.section_id
						}, function(ret, err) {
							//coding...
							if(ret){
								result["section_name"] = ret.section_name;
								
								allPerEvaInfo['sectionAndPosition'] = result;
//												api.alert({
//									        		msg: 'result:' + JSON.stringify(allPerEvaInfo['sectionAndPosition']),
//									        	});
								
								//动态渲染页面
					        	tpl += '<div id="person_general" >';
								tpl += '<img id = "club_head_img" src="' + allPerEvaInfo.allUserMsgInfo.t_user_info.user_header + '" tapmode="tap" onclick=\'open_personal_info("' + allPerEvaInfo.allUserMsgInfo.id + '")\'' + '/>'
								tpl += '<div id="person_general_info">';
								tpl += '<ul id="person_info" class="person_info">';
								tpl += '<span id="person_name" class="person_name">' + allPerEvaInfo.allUserMsgInfo.t_user_info.user_real_name + '</span>';
								tpl += '<span id="person_title" class="person_title">(' + allPerEvaInfo.sectionAndPosition.section_name + '/' + allPerEvaInfo.sectionAndPosition.society_member_position + ')</span>';
								tpl += '</ul>';
								tpl += '<ul id="person_medal">';
								tpl += '<span id="person_medal_li1"></span>';
								if((allPerEvaInfo['society_member_score'] >= oneStarScore) && (allPerEvaInfo['society_member_score'] < twoStartScore)){
									tpl += '<span id="person_medal_li2"></span>';
								}
								else if((allPerEvaInfo['society_member_score'] >= twoStartScore) && (allPerEvaInfo['society_member_score'] < threeStarScore)){
									tpl += '<span id="person_medal_li2"></span>';
									tpl += '<span id="person_medal_li3"></span>';
								}
								else if((allPerEvaInfo['society_member_score'] >= threeStarScore) && (allPerEvaInfo['society_member_score'] < fourStartScore))
								{
									tpl += '<span id="person_medal_li2"></span>';
									tpl += '<span id="person_medal_li3"></span>';
									tpl += '<span id="person_medal_li4"></span>';
								}
								else if(allPerEvaInfo['society_member_score'] >= 100){
									tpl += '<span id="person_medal_li2"></span>';
									tpl += '<span id="person_medal_li3"></span>';
									tpl += '<span id="person_medal_li4"></span>';
									tpl += '<span id="person_medal_li5"></span>';
								}
								tpl += '</ul>';
								tpl += '</div>';
								tpl += '</div>';
								tpl += '<div id="brief">';
								tpl += '<ul id="total_org_act_num" class="brif_bom">';
								tpl += '<span id="li1">组织活动次数</span>';
								tpl += '<span id="li2">' + memEvaMsg.organized_act_num + '</span>';
								tpl += '</ul>';
								tpl += '<ul id="other_club_total_act" class="brif_bom">';
								tpl += '<span id="li1">其他社团本年度最高活动次数</span>';
								tpl += '<span id="li2">' + memEvaMsg.maxOrganizedActNum + '</span>';
								tpl += '</ul>';
								tpl += '<ul id="org_act_degree" class="brif_bom">';
								tpl += '<span id="li1">组织活动活跃度</span>';
								tpl += '<span id="li2">' + memEvaMsg.organized_act_active_degree + '</span>';
								tpl += '</ul>';
								tpl += '<ul id="other_club_per_assessment" tapmode="tap" onclick="openOtherPerEva()">';
								tpl += '<span id="li1">社团其他人员考核</span>';
								tpl += '<span id="li2"><a id="other_club_tip"></a></span>';
								tpl += '</ul>';
								tpl += '</div>';
								tpl += '</div>';
								
								$("#main").html(tpl);
								api.parseTapmode();
					        	api.hideProgress();
	
							}
							else{
								api.toast({
								    msg: '没有找到对应社员相关的部门职位信息!',
								    duration:2000,
								    location: 'middle'
								});
								api.hideProgress();
							}
						});
					});
					
	            }
	            else{
	            	api.toast({
					    msg: '没有找到对应用户信息，请检查!',
					    duration:2000,
					    location: 'middle'
					});
					api.hideProgress();
	            }
	        });
	    }
	});

//	$("#main").append(tpl);
	//收起刷新条
//	api.hideProgress();
}

/*
 * 作者:lzm
 * 编写日期:2015-8-19 10:38
 * 函数名:showPresidentUserEvaInfoEx2
 * 函数功能:展示某社团中部长某一年度的考核信息(此函数在index.js调用了common_club_evaluation.js中updateSocietyMemYearEvaEx,updateSocietyYearEva后直接查询数据库展示)
 * 函数参数: userID:用户ID
 * 		  societyID：所在社团ID
 * 		  yearStr:所在年度形式'2015'
 * 返回值:回调函数执行
 * */
function showPresidentUserEvaInfoEx2(userID, societyID, yearStr){
	api.showProgress({
	    style: 'default',
	    animationType: 'fade',
	    title: '努力加载息中...',
	    text: '先喝杯茶吧...',
	    modal: false
	});
	var tpl = "";
//	api.alert({
//		msg: "userEvaObj:" + (JSON.stringify(userEvaObj)), 
//	});
	
	var model = api.require('model');
	var query = api.require('query');
	var relation = api.require('relation');
	//一键真机调试时候，下边的这个config是必须的,appKey里面的K是大写，appId也必须填写,注意一下!
	model.config({
	    appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8',
	    appId: 'A6982914277502',
	    host: 'https://d.apicloud.com'
    });
	
	//查找用户相关信息
	query.createQuery(function(ret, err) {
	    if (ret && ret.qid) {
	        var queryId = ret.qid;
	        //包含t_user_info列
	        query.include({
	            qid: queryId,
	            column: 't_user_info'
	        });
	        //设置用户ID进行查询
	        query.whereEqual({
	            qid: queryId,
	            column: 'id',
	            value: userID
	        });
	        
	        query.limit({
            qid:queryId,
            value:1000
        });
        model.findAll({
	            class: "user",
	            qid: queryId
	        }, function(ret, err) {
	            if (ret) {
	            	//只有一个用户信息，所以保存组号0的信息
	            	allPerEvaInfo['allUserMsgInfo'] = ret[0];
//									api.alert({
//										msg: 'allPerEvaInfo.allUserMsgInfo:' + ret[0],
//									});
					
					//继续查找用户的部门和职位信息
					relation.findAll({
						class: 't_society',
						id: societyID,
						column: 't_society_member'
					}, function(ret, err) {
						//coding...
						// alert( JSON.stringify( ret ) );
						var result;
						for (var j = 0; j < ret.length; j++) {
							if (ret[j].user_id == userID) {
								result = ret[j];
								allPerEvaInfo['society_member_score'] = result.society_member_score;
								break;
							}
						}
						model.findById({
							class: 't_society_section',
							id: result.section_id
						}, function(ret, err) {
							//coding...
							if(ret){
								result["section_name"] = ret.section_name;
								
								allPerEvaInfo['sectionAndPosition'] = result;
//												api.alert({
//									        		msg: 'result:' + JSON.stringify(allPerEvaInfo['sectionAndPosition']),
//									        	});
								var clubYearMaxOrganizedActNum = $api.getStorage('clubYearMaxOrganizedActNum');
								var joined_act_num = $api.getStorage('joined_act_num');
								var check_num = $api.getStorage('check_num');
								var act_active_degree = $api.getStorage('act_active_degree');
								var received_task_num = $api.getStorage('received_task_num');
								var submit_task_num = $api.getStorage('submit_task_num');
								var task_completed_degree = $api.getStorage('task_completed_degree');
								var task_average_eva_stars = $api.getStorage('task_average_eva_stars');
								var organized_act_num = $api.getStorage('organized_act_num');
								var maxOrganizedActNum = $api.getStorage('maxOrganizedActNum');
								var organized_act_active_degree = $api.getStorage('organized_act_active_degree');
								
								
								//动态渲染页面
					        	tpl += '<div id="person_general" >';
								tpl += '<img id = "club_head_img" src="' + allPerEvaInfo.allUserMsgInfo.t_user_info.user_header + '" tapmode="tap" onclick=\'open_personal_info("' + allPerEvaInfo.allUserMsgInfo.id + '")\'' + '/>'
								tpl += '<div id="person_general_info">';
								tpl += '<ul id="person_info" class="person_info">';
								tpl += '<span id="person_name" class="person_name">' + allPerEvaInfo.allUserMsgInfo.t_user_info.user_real_name + '</span>';
								tpl += '<span id="person_title" class="person_title">(' + allPerEvaInfo.sectionAndPosition.section_name + '/' + allPerEvaInfo.sectionAndPosition.society_member_position + ')</span>';
								tpl += '</ul>';
								tpl += '<ul id="person_medal">';
								tpl += '<span id="person_medal_li1"></span>';
								if((allPerEvaInfo['society_member_score'] >= oneStarScore) && (allPerEvaInfo['society_member_score'] < twoStartScore)){
									tpl += '<span id="person_medal_li2"></span>';
								}
								else if((allPerEvaInfo['society_member_score'] >= twoStartScore) && (allPerEvaInfo['society_member_score'] < threeStarScore)){
									tpl += '<span id="person_medal_li2"></span>';
									tpl += '<span id="person_medal_li3"></span>';
								}
								else if((allPerEvaInfo['society_member_score'] >= threeStarScore) && (allPerEvaInfo['society_member_score'] < fourStartScore))
								{
									tpl += '<span id="person_medal_li2"></span>';
									tpl += '<span id="person_medal_li3"></span>';
									tpl += '<span id="person_medal_li4"></span>';
								}
								else if(allPerEvaInfo['society_member_score'] >= 100){
									tpl += '<span id="person_medal_li2"></span>';
									tpl += '<span id="person_medal_li3"></span>';
									tpl += '<span id="person_medal_li4"></span>';
									tpl += '<span id="person_medal_li5"></span>';
								}
								tpl += '</ul>';
								tpl += '</div>';
								tpl += '</div>';
								tpl += '<div id="brief">';
								tpl += '<ul id="total_org_act_num" class="brif_bom">';
								tpl += '<span id="li1">组织活动次数</span>';
								tpl += '<span id="li2">' + organized_act_num + '</span>';
								tpl += '</ul>';
								tpl += '<ul id="other_club_total_act" class="brif_bom">';
								tpl += '<span id="li1">其他社团本年度最高活动次数</span>';
								tpl += '<span id="li2">' + maxOrganizedActNum + '</span>';
								tpl += '</ul>';
								tpl += '<ul id="org_act_degree" class="brif_bom">';
								tpl += '<span id="li1">组织活动活跃度</span>';
								tpl += '<span id="li2">' + organized_act_active_degree + '</span>';
								tpl += '</ul>';
								tpl += '<ul id="other_club_per_assessment" tapmode="tap" onclick="openOtherPerEva()">';
								tpl += '<span id="li1">社团其他人员考核</span>';
								tpl += '<span id="li2"><a id="other_club_tip"></a></span>';
								tpl += '</ul>';
								tpl += '</div>';
								tpl += '</div>';
								
								$("#main").html(tpl);
								api.parseTapmode();
					        	api.hideProgress();
	
							}
							else{
								api.toast({
								    msg: '没有找到对应社员相关的部门职位信息!',
								    duration:2000,
								    location: 'middle'
								});
								api.hideProgress();
							}
						});
					});
					
	            }
	            else{
	            	api.toast({
					    msg: '没有找到对应用户信息，请检查!',
					    duration:2000,
					    location: 'middle'
					});
					api.hideProgress();
	            }
	        });
	    }
	});

//	$("#main").append(tpl);
	//收起刷新条
//	api.hideProgress();
}

/*
 * 作者:lzm
 * 编写日期:2015-8-19 10:38
 * 函数名:showPresidentUserEvaInfoEx3
 * 函数功能:展示某社团中部长某一年度的考核信息(此函数所有展示数据都取自本地，减少用户等待时间)
 * 函数参数: userID:用户ID
 * 		  societyID：所在社团ID
 * 		  yearStr:所在年度形式'2015'
 * 返回值:回调函数执行
 * */
function showPresidentUserEvaInfoEx3(userID, societyID, yearStr){
	api.showProgress({
	    style: 'default',
	    animationType: 'fade',
	    title: '努力加载息中...',
	    text: '先喝杯茶吧...',
	    modal: false
	});
	var tpl = "";
	var model = api.require('model');
	var query = api.require('query');
	var relation = api.require('relation');
	//一键真机调试时候，下边的这个config是必须的,appKey里面的K是大写，appId也必须填写,注意一下!
	model.config({
	    appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8',
	    appId: 'A6982914277502',
	    host: 'https://d.apicloud.com'
    });
	
	var clubYearMaxOrganizedActNum = $api.getStorage('clubYearMaxOrganizedActNum');
	var joined_act_num = $api.getStorage('joined_act_num');
	var check_num = $api.getStorage('check_num');
	var act_active_degree = $api.getStorage('act_active_degree');
	var received_task_num = $api.getStorage('received_task_num');
	var submit_task_num = $api.getStorage('submit_task_num');
	var task_completed_degree = $api.getStorage('task_completed_degree');
	var task_average_eva_stars = $api.getStorage('task_average_eva_stars');
	var organized_act_num = $api.getStorage('organized_act_num');
	var maxOrganizedActNum = $api.getStorage('maxOrganizedActNum');
	var organized_act_active_degree = $api.getStorage('organized_act_active_degree');
	//用户信息
	var user_header = $api.getStorage('user_header');
	var user_real_name = $api.getStorage('user_real_name');
	var section_name = $api.getStorage('section_name');
	var society_member_position = $api.getStorage('position');
	var society_member_score = $api.getStorage('society_member_score');
	var user_id = $api.getStorage('user_id');
	
	//动态渲染页面
	tpl += '<div id="person_general" >';
	tpl += '<img id = "club_head_img" src="' + user_header + '" tapmode="tap" onclick=\'open_personal_info("' + user_id + '")\'' + '/>'
	tpl += '<div id="person_general_info">';
	tpl += '<ul id="person_info" class="person_info">';
	tpl += '<span id="person_name" class="person_name">' + user_real_name + '</span>';
	tpl += '<span id="person_title" class="person_title">(' + section_name + '/' + society_member_position + ')</span>';
	tpl += '</ul>';
	tpl += '<ul id="person_medal">';
	tpl += '<span id="person_medal_li1"></span>';
	if((society_member_score >= oneStarScore) && (society_member_score < twoStartScore)){
		tpl += '<span id="person_medal_li2"></span>';
	}
	else if((society_member_score >= twoStartScore) && (society_member_score < threeStarScore)){
		tpl += '<span id="person_medal_li2"></span>';
		tpl += '<span id="person_medal_li3"></span>';
	}
	else if((society_member_score >= threeStarScore) && (society_member_score < fourStartScore))
	{
		tpl += '<span id="person_medal_li2"></span>';
		tpl += '<span id="person_medal_li3"></span>';
		tpl += '<span id="person_medal_li4"></span>';
	}
	else if(society_member_score >= fourStartScore){
		tpl += '<span id="person_medal_li2"></span>';
		tpl += '<span id="person_medal_li3"></span>';
		tpl += '<span id="person_medal_li4"></span>';
		tpl += '<span id="person_medal_li5"></span>';
	}
	tpl += '</ul>';
	tpl += '</div>';
	tpl += '</div>';
	tpl += '<div id="brief">';
	tpl += '<ul id="total_org_act_num" class="brif_bom">';
	tpl += '<span id="li1">组织活动次数</span>';
	tpl += '<span id="li2">' + organized_act_num + '</span>';
	tpl += '</ul>';
	tpl += '<ul id="other_club_total_act" class="brif_bom">';
	tpl += '<span id="li1">其他社团本年度最高活动次数</span>';
	tpl += '<span id="li2">' + maxOrganizedActNum + '</span>';
	tpl += '</ul>';
	tpl += '<ul id="org_act_degree" class="brif_bom">';
	tpl += '<span id="li1">组织活动活跃度</span>';
	tpl += '<span id="li2">' + organized_act_active_degree + '</span>';
	tpl += '</ul>';
	tpl += '<ul id="other_club_per_assessment" tapmode="tap" onclick="openOtherPerEva()">';
	tpl += '<span id="li1">社团其他人员考核</span>';
	tpl += '<span id="li2"><a id="other_club_tip"></a></span>';
	tpl += '</ul>';
	tpl += '</div>';
	tpl += '</div>';
	
	$("#main").html(tpl);
	api.parseTapmode();
	api.hideProgress();
}

//页面加载完毕入口函数
apiready = function() {
	var myDate = new Date();
	var yearStr = myDate.getFullYear();
//	var yearStr = '2015';
	
	societyID =  $api.getStorage('society_id');
	userID = $api.getStorage('user_id');
//	alert( "localStorage societyID:" + societyID + ",userID:" + userID );
	if('' == societyID || '' == userID || ('undefined'== typeof(societyID)) || ('undefined'== typeof(userID))){
		api.toast({
		    msg: '获取用户ID或本社团ID错误,请重试或者重新登录~',
		    duration:2000,
		    location: 'bottom'
		});
		return;
	}
	
	showPresidentUserEvaInfoEx3(userID, societyID, yearStr);
//	//显示社团考核信息,这里有多层回调，记得顺序
////	showPresidentUserEvaInfo(userID, societyID, yearStr);
//	updateSocietyMemYearEvaEx(societyID, userID, yearStr, showPresidentUserEvaInfoEx);
//	//触发更新社团年度考核信息
//	updateSocietyYearEva(societyID, yearStr);
	//下拉刷新
	api.setRefreshHeaderInfo({
		visible: true,
		// loadingImgae: 'wgt://image/refresh-white.png',
		bgColor: '#f2f2f2',
		textColor: '#4d4d4d',
		textDown: '下拉刷新...',
		textUp: '松开刷新...',
		showTime: true
	}, function(ret, err) {
		//2015-8-22,下边是为了切换社团有可能变换了社团ID使用
		societyID =  $api.getStorage('society_id');
//		updateSocietyMemYearEvaEx(societyID, userID, yearStr, showPresidentUserEvaInfoEx);
		showPresidentUserEvaInfoEx3(userID, societyID, yearStr);
		
		api.refreshHeaderLoadDone();
	});
}
