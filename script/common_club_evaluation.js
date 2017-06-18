var oneStarScore = 50;
var twoStartScore = 200;
var threeStarScore = 500;
var fourStartScore = 1000;

/*
* add by lzm
* 用于放置社团考核部分公用的功能函数
*/

/*
 * 函数名:getClubYearMaxOrganizedAct()
 * 函数功能:获取某社团某一年度组织的活动总次数
 * 参数:societyID -- 社团ID,
 *     yearStr -- 年度
 *  @param {Object} obj 触发查询的对象 ,可以为空
 *  @param {Object} where 来自哪里,可以为空
 * */
function getClubYearMaxOrganizedAct(societyID, yearStr, where, obj){
	
}

function testFunc(evalMsg){
	//just for test
}

/*
 * 函数名:updateSocietyYearEva()
 * 函数功能:更新某社团某一年度的考核信息
 * 参数:societyID -- 社团ID,
 *     yearStr -- 年度
 * */
function updateSocietyYearEva(societyID, yearStr){
	var model = api.require('model');
	var relation = api.require('relation');
	var query = api.require('query');
	model.config({
    	appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8',
    });
    var clubYearMaxOrganizedActNum = 0;
    var clubYearMaxPublishedTaskNum = 0;
    var returnResult = [];
    
    //查询某社团某一年度组织的活动次数
    query.createQuery(function(ret, err) {
	    if (ret && ret.qid) {
	        var queryId = ret.qid;
	        //do something
	        
	        //查询某一社团，某一年度组织的所有活动
	        //societyID,whereLike
		    query.whereGreaterThanOrEqual({
	        	qid: queryId,
	            column: 'createdAt',
	            value: yearStr
	        });
	        query.limit({
            qid:queryId,
            value:1000
        });
	        
	        //whereEqual
	        query.whereEqual({
	            qid: queryId,
	            column: 'society_id',
	            value: societyID
	        });
			//查询所有满足条件的值
	        model.findAll({
	            class: "t_society_activity",
	            qid: queryId
	        }, function(ret, err) {
	            if (ret) {
	                clubYearMaxOrganizedActNum = ret.length;
	            }
	            
	            //继续查询社团里面组织的任务数
			    query.createQuery(function(ret, err) {
				    if (ret && ret.qid) {
				        var queryId = ret.qid;
				        //do something
				        
				        //查询某一社团，某一年度发布的所有任务
				        //societyID,whereLike
					    query.whereGreaterThanOrEqual({
				        	qid: queryId,
				            column: 'createdAt',
				            value: yearStr
				        });
				        query.limit({
            qid:queryId,
            value:1000
        });
				        //whereEqual
				        query.whereEqual({
				            qid: queryId,
				            column: 'society_id',
				            value: societyID
				        });
						//查询所有满足条件的值
				        model.findAll({
				            class: "t_society_task",
				            qid: queryId
				        }, function(ret, err) {
				            if (ret) {
				                clubYearMaxPublishedTaskNum = ret.length;           
				            }
				            //2015-9-1,Added by lzm,进行本地缓存，方便下次读取
				            $api.setStorage('clubYearMaxPublishedTaskNum', clubYearMaxPublishedTaskNum);
				            $api.setStorage('clubYearMaxOrganizedActNum', clubYearMaxOrganizedActNum);
				            
				            //创建查询,查询社团考核表里面是否有相应年度的记录，有则更新，没有则创建
						    query.createQuery(function(ret, err) {
							    if (ret && ret.qid) {
							        var queryId = ret.qid;
							        
							        //societyID,whereEqual
								    query.whereEqual({
							            qid: queryId,
							            column: 'evaluation_year',
							            value: yearStr
							        });
							        query.limit({
            qid:queryId,
            value:1000
        });
							        //yearStr,whereEqual
							        query.whereEqual({
							            qid: queryId,
							            column: 't_society',
							            value: societyID
							        });
							        
							        //查找符合条件的数据
							        model.findAll({
							            class: "t_society_evaluation",
							            qid: queryId
							        }, function(ret, err) {
//									api.alert({
//					                	msg: 'clubYearMaxOrganizedActNum:' + clubYearMaxOrganizedActNum + ',clubYearMaxPublishedTaskNum:' + clubYearMaxPublishedTaskNum,
//					                });
									
							            //如果有就更新,没有就创建记录
							            if (ret && (0 != ret.length)) {
							            	var clubEvaMsg = ret[0];
							            	//更新
							            	model.updateById({
											    class: 't_society_evaluation',
											    id: clubEvaMsg.id,
											    value: {
											        organized_act_num: clubYearMaxOrganizedActNum,
											        published_task_num: clubYearMaxPublishedTaskNum,
											    }
											}, function(ret, err){
											    if(ret){
											        //将结果回调回去
											        returnResult['clubYearMaxOrganizedActNum'] = clubYearMaxOrganizedActNum;
											        returnResult['clubYearMaxPublishedTaskNum'] = clubYearMaxPublishedTaskNum;
//											        funcName(returnResult);
											    }
											    else{
											    	api.toast({
													    msg: '更新社团考核信息失败!!!',
													    duration: 2000,
													    location: 'middle'
													});
											    }
											});
							            	
							            }
							            else{
							            	//没有对应的记录则插入添加
							            	relation.insert({
							            		class: 't_society',
							            		id: societyID,
							            		column:'t_society_evaluation',
							            		value: {
							            			organized_act_num: clubYearMaxOrganizedActNum,
											        published_task_num: clubYearMaxPublishedTaskNum,
											        evaluation_year: yearStr,
											        t_society: societyID
							            		}
							            	}, function(ret, err){
							            		if(ret){
							            			//将结果回调回去
							            			returnResult['clubYearMaxOrganizedActNum'] = clubYearMaxOrganizedActNum;
											        returnResult['clubYearMaxPublishedTaskNum'] = clubYearMaxPublishedTaskNum;
//											        funcName(returnResult);
							            		}
							            		else{
							            			api.toast({
													    msg: '更新社团考核信息失败!!!',
													    duration: 2000,
													    location: 'middle'
													});
							            		}
							            	});
							            }
							        });  
							    }
							});
				        });   
				    }
				});
	        });
	    }
	});
}

/*
 * 函数名:updateSocietyMemYearEva()
 * 函数功能:更新某一社团用户某一年度的考核信息
 * 参数:societyID -- 社团ID,
 * 	   userID  -- 用户ID
 *     yearStr -- 年度
 *	   funcName -- 回调函数名(用来做回调用)
 * */
function updateSocietyMemYearEva(societyID, userID,yearStr, funcName){
	var model = api.require('model');
	var relation = api.require('relation');
	var query = api.require('query');
	model.config({
    	appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8',
    });

    var returnResult;
    //其他社团组织活动最多的数量
    var maxOrganizedActNum = 0;
    //本社团
    var clubYearMaxOrganizedActNum = 0;
    var clubTaskAveEva = 0;
    //对应字段
    returnResult['t_society'] = societyID;
    returnResult['userID'] = userID;
    //下边一系列的值都用默认值先
    returnResult['joined_act_num'] = 0;
    returnResult['check_num'] = 0;
    returnResult['act_active_degree'] = '0%';
    returnResult['received_task_num'] = 0;
    returnResult['submit_task_num'] = 0;
    returnResult['task_completed_degree'] = '0%';
    returnResult['task_average_eva_stars'] = 0;
    returnResult['eva_year'] = yearStr;
    returnResult['organized_act_num'] = 0;
    returnResult['published_task_num'] = 0;
    returnResult['organized_act_active_degree'] = '0%';
    
    //查询成员表并获取对应的职位
    query.createQuery(function(ret, err) {
	    if (ret && ret.qid) {
	        var queryId = ret.qid;
	        
	        //user_id等于
	        query.whereEqual({
	            qid: queryId,
	            column: 'user_id',
	            value: userID
	        });
	        query.limit({
            qid:queryId,
            value:1000
        });
	        //society_id等于
	        query.whereEqual({
	            qid: queryId,
	            column: 'society_id',
	            value: societyID
	        });
	        //findAll
	        model.findAll({
	            class: "t_society_member",
	            qid: queryId
	        }, function(ret, err) {
	            if (ret) {
	                var societyMemMsg = ret[0];
	                var userSocietyPos = societyMemMsg.society_member_position;
	                
	                //根据相应角色进行相应查询,并赋值
	                if('社长' == userSocietyPos || '副社长' == userSocietyPos){
	                	//查询发布的活动数
	                	query.createQuery(function(ret, err) {
						    if (ret && ret.qid) {
						        var queryId = ret.qid;
						        //activity_publisher
						        query.whereEqual({
						            qid: queryId,
						            column: 'activity_publisher',
						            value: userID
						        });
						        query.limit({
            qid:queryId,
            value:1000
        });
						        //society_id
						        query.whereEqual({
						            qid: queryId,
						            column: 'society_id',
						            value: societyID
						        });
						        model.findAll({
						            class: "t_society_activity",
						            qid: queryId
						        }, function(ret, err) {
						            if (ret) {
						            	//将查询到的活动数为其赋值
						            	returnResult['organized_act_num'] = ret.length;
						            	
						            	//继续查发布的任务数
						            	query.createQuery(function(ret, err) {
										    if (ret && ret.qid) {
										        var queryId = ret.qid;
										        //task_publisher
										        query.whereEqual({
										            qid: queryId,
										            column: 'task_publisher',
										            value: userID
										        });
										        query.limit({
            qid:queryId,
            value:1000
        });
										        //society_id
										        query.whereEqual({
										            qid: queryId,
										            column: 'society_id',
										            value: societyID
										        });
										        model.findAll({
										            class: "t_society_task",
										            qid: queryId
										        }, function(ret, err) {
										            if (ret) {
										            	//将查询到的任务数为其赋值
										            	returnResult['published_task_num'] = ret.length;
	
										            	//其他社团组织最多活动的社团
														query.createQuery(function(ret, err) {
														    if (ret && ret.qid) {
														        var queryId = ret.qid;
														        //查找所有的社团考核信息
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
														                //如果查到的所有社团组织活动的最大记录数为0或者本社团最新查出的组织活动数大于查到的最大数，那么该社长组织的活动活跃数为100%
														                if(0 == maxOrganizedActNum || returnResult['organized_act_num'] >= maxOrganizedActNum){
														                	returnResult['organized_act_active_degree'] = '100%';
														                }
														                else{
														                	var organized_act_active_degree_num = (returnResult['organized_act_num'] / maxOrganizedActNum).toFixed(2);
														                	returnResult['organized_act_active_degree'] = (organized_act_active_degree_num * 100) + '%';
														                }
														                
														                //更新对应成员的考核,有则更新，无则插入
														                query.createQuery(function(ret, err) {
																		    if (ret && ret.qid) {
																		        var queryId = ret.qid;
																		        
																		        //社团ID
																		        query.whereEqual({
																		            qid: queryId,
																		            column: 't_society',
																		            value: societyID
																		        });
																		        query.limit({
            qid:queryId,
            value:1000
        });
																		        //用户ID
																		        query.whereEqual({
																		            qid: queryId,
																		            column: 'userID',
																		            value: userID
																		        });
																		        //考核年度
																		        query.whereEqual({
																		            qid: queryId,
																		            column: 'eva_year',
																		            value: yearStr
																		        });
																		        //查找所有满足要求的记录
																		        model.findAll({
																		            class: "t_society_member_evaluation",
																		            qid: queryId
																		        }, function(ret, err) {
																		            //有记录则更新，没有则插入一个记录
																		            if (ret) {
																		            	var memEvaMsg = ret[0];
																		            	model.updateById({
																						    class: 't_society_member_evaluation',
																						    id: memEvaMsg.id,
																						    value: {
																						        organized_act_num: returnResult['organized_act_num'],
																						        published_task_num: returnResult['published_task_num'],
																						        organized_act_active_degree: returnResult['organized_act_active_degree']
																						    }
																						}, function(ret, err){
																						    if(ret){
																						    	funcName(returnResult);
																						    }
																						    else {
																						    	api.toast({
																								    msg: '更新成员考核信息失败!!!',
																								    duration: 2000,
																								    location: 'middle'
																								});
																						    }
																						});
																		            }
																		            else{
																		            	//插入记录
																		            	model.insert({
																		            		class: 't_society_member_evaluation',
																		            		value: {
																		            			t_society: societyID,
																						        userID: societyID,
																						        joined_act_num: returnResult['joined_act_num'],
																						        check_num: returnResult['check_num'],
																						        act_active_degree: returnResult['act_active_degree'],
																						        received_task_num: returnResult['submit_task_num'],
																						        submit_task_num: returnResult['submit_task_num'],
																						        task_completed_degree: returnResult['task_completed_degree'],
																						        task_average_eva_stars: returnResult['task_average_eva_stars'],
																						        eva_year: returnResult['eva_year'],
																						        organized_act_num: returnResult['organized_act_num'],
																						        published_task_num: returnResult['published_task_num'],
																						        organized_act_active_degree: returnResult['organized_act_active_degree']																					    
																		            		}
																		            	}, function(ret, err){
																		            		if(ret){
																		            			//将结果回调回去
																						        funcName(returnResult);
																		            		}
																		            		else{
																		            			api.toast({
																								    msg: '更新成员考核信息失败!!!',
																								    duration: 2000,
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
														    }
														});
										            }
										
										        });
										    }
										});
						            }
						
						        });
						    }
						});
	                } else if('部长' == userSocietyPos){
	                	query.createQuery(function(ret, err) {
						    if (ret && ret.qid) {
						        var queryId = ret.qid;
						        //task_publisher
						        query.whereEqual({
						            qid: queryId,
						            column: 'task_publisher',
						            value: userID
						        });
						        query.limit({
            qid:queryId,
            value:1000
        });
						        //society_id
						        query.whereEqual({
						            qid: queryId,
						            column: 'society_id',
						            value: societyID
						        });
						        //发布任务年度
						        query.whereLike({
						            qid: queryId,
						            column: 'createdAt',
						            value: yearStr
						        });
						        
						        model.findAll({
						            class: "t_society_task",
						            qid: queryId
						        }, function(ret, err) {
						            if (ret) {
						            	//将查询到的任务数为其赋值
						            	returnResult['published_task_num'] = ret.length;
										
										//查询本年度参加本社团的活动数
										query.createQuery(function(ret, err) {
										    if (ret && ret.qid) {
										        var queryId = ret.qid;
										        //do something
										    }
										    //enroll_user_id
										    query.whereEqual({
									            qid: ret.qid,
									            column: 'enroll_user_id',
									            value: userID
									        });
									        query.limit({
            qid:queryId,
            value:1000
        });
									        //t_society
									        query.whereEqual({
									            qid: ret.qid,
									            column: 't_society',
									            value: societyID
									        });
									        query.whereLike({
									            qid: queryId,
									            column: 'createdAt',
									            value: yearStr
									        });
									        //findAll
									        model.findAll({
									            class: "t_society_activity_enroll",
									            qid: queryId
									        }, function(ret, err) {
									            if (ret) {
									            	returnResult['joined_act_num'] = ret.length;
									            	
									            	//继续查询成员签到的次数(也在参与表里面记录了)
									            	var checkCount = 0;
									            	for(var i = 0; i < ret.length; i++){
									            		if(1 == ret[i].check_status){
									            			checkCount++;
									            		}
									            	}
									            	//签到次数赋值
									            	returnResult['check_num'] = checkCount;
									    			//查询本社团本年度发布的所有活动数
									    			query.createQuery(function(ret, err) {
													    if (ret && ret.qid) {
													        var queryId = ret.qid;
													        query.whereEqual({
													            qid: queryId,
													            column: 'society_id',
													            value: societyID
													        });
													        query.limit({
            qid:queryId,
            value:1000
        });
													        query.whereLike({
													            qid: queryId,
													            column: 'createdAt',
													            value: yearStr
													        });
													        model.findAll({
													            class: "t_society_activity",
													            qid: queryId
													        }, function(ret, err) {
													            if (ret) {
													            	//社团本年度组织的活动次数
													                clubYearMaxOrganizedActNum = ret.length;
													                //计算活动活跃度
													                returnResult['act_active_degree'] = ((returnResult['check_num'] / clubYearMaxOrganizedActNum).toFixed(2) * 100) + '%';
													                
													                //查接收任务数和任务平均评星
													    			query.createQuery(function(ret, err) {
																	    if (ret && ret.qid) {
																	        var queryId = ret.qid;
																	        //do something
																	        //task_involved_user_id
																	        query.whereEqual({
																	            qid: queryId,
																	            column: 'task_involved_user_id',
																	            value: userID
																	        });
																	        query.limit({
            qid:queryId,
            value:1000
        });
																	        //society_id
																	        query.whereEqual({
																	            qid: queryId,
																	            column: 'society_id',
																	            value: societyID
																	        });
																	        query.whereLike({
																	            qid: queryId,
																	            column: 'createdAt',
																	            value: yearStr
																	        });
																	        //findAll
																	        model.findAll({
																	            class: "t_society_task_involved",
																	            qid: queryId
																	        }, function(ret, err) {
																	            if (ret) {
																	            	returnResult['received_task_num'] = ret.length;
																	            	
																	            	var submitTaskNum = 0;
																	            	var taskEvaNum = 0;
																	            	var sumEvaScore = 0;
																	            	for(var i = 0; i < ret.length; i++){
																	            		//计算所有提交的任务数
																	            		if(ret[i].task_status != 1){
																	            			submitTaskNum++;
																	            			
																	            			if(ret[i].task_status == 3){
																		            			//已评分，累加并计算平均
																		            			sumEvaScore += ret[i].task_evaluation;
																		            			taskEvaNum++;
																		            		}
																	            		}
																	            		
																	            	}
																	            	//提交任务数
																	            	returnResult['submit_task_num'] = submitTaskNum;
																	            	//计算任务平均评星
																	            	clubTaskAveEva = (sumEvaScore / taskEvaNum).toFixed(1);
																	            	returnResult['task_average_eva_stars'] = clubTaskAveEva;
																	            	
																	            	//更新对应成员的考核,有则更新，无则插入
																	                query.createQuery(function(ret, err) {
																					    if (ret && ret.qid) {
																					        var queryId = ret.qid;
																					        
																					        //社团ID
																					        query.whereEqual({
																					            qid: queryId,
																					            column: 't_society',
																					            value: societyID
																					        });
																					        query.limit({
            qid:queryId,
            value:1000
        });
																					        //用户ID
																					        query.whereEqual({
																					            qid: queryId,
																					            column: 'userID',
																					            value: userID
																					        });
																					        //考核年度
																					        query.whereEqual({
																					            qid: queryId,
																					            column: 'eva_year',
																					            value: yearStr
																					        });
																					        //查找所有满足要求的记录
																					        model.findAll({
																					            class: "t_society_member_evaluation",
																					            qid: queryId
																					        }, function(ret, err) {
																					            //有记录则更新，没有则插入一个记录
																					            if (ret) {
																					            	var memEvaMsg = ret[0];
																					            	model.updateById({
																									    class: 't_society_member_evaluation',
																									    id: memEvaMsg.id,
																									    value: {
																									        joined_act_num: returnResult['joined_act_num'],
																									        check_num: returnResult['check_num'],
																									        act_active_degree: returnResult['act_active_degree'],
																									        received_task_num: returnResult['received_task_num'],
																									        submit_task_num: returnResult['submit_task_num'],
																									        task_completed_degree: returnResult['task_completed_degree'],
																									        task_average_eva_stars: returnResult['task_average_eva_stars'],
																									        eva_year: returnResult['eva_year'],
																									        organized_act_num: returnResult['organized_act_num'],
																									        published_task_num: returnResult['published_task_num'],
																									        organized_act_active_degree: returnResult['organized_act_active_degree']	
																									    }
																									}, function(ret, err){
																									    if(ret){
																									    	funcName(returnResult);
																									    }
																									    else {
																									    	api.toast({
																											    msg: '更新成员考核信息失败!!!',
																											    duration: 2000,
																											    location: 'middle'
																											});
																									    }
																									});
																					            }
																					            else{
																					            	//插入记录
																					            	model.insert({
																					            		class: 't_society_member_evaluation',
																					            		value: {
																					            			t_society: societyID,
																									        userID: societyID,
																									        joined_act_num: returnResult['joined_act_num'],
																									        check_num: returnResult['check_num'],
																									        act_active_degree: returnResult['act_active_degree'],
																									        received_task_num: returnResult['received_task_num'],
																									        submit_task_num: returnResult['submit_task_num'],
																									        task_completed_degree: returnResult['task_completed_degree'],
																									        task_average_eva_stars: returnResult['task_average_eva_stars'],
																									        eva_year: returnResult['eva_year'],
																									        organized_act_num: returnResult['organized_act_num'],
																									        published_task_num: returnResult['published_task_num'],
																									        organized_act_active_degree: returnResult['organized_act_active_degree']																					    
																					            		}
																					            	}, function(ret, err){
																					            		if(ret){
																					            			//将结果回调回去
																									        funcName(returnResult);
																					            		}
																					            		else{
																					            			api.toast({
																											    msg: '更新成员考核信息失败!!!',
																											    duration: 2000,
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
																	    }
																	});
													            }
													
													        });
													        
													    }
													});
									            }
									            else{
									            	api.toast({
													    msg: '更新成员考核信息失败!!!',
													    duration: 2000,
													    location: 'middle'
													});
									            }
									
									        });
									        
										});

						            }
						
						        });
						    }
						});
	                	
	                } else if('副部长' == userSocietyPos || '干事' == userSocietyPos){
	                	//查询本年度参加本社团的活动数
						query.createQuery(function(ret, err) {
						    if (ret && ret.qid) {
						        var queryId = ret.qid;
						        //do something
						    }
						    //enroll_user_id
						    query.whereEqual({
					            qid: ret.qid,
					            column: 'enroll_user_id',
					            value: userID
					        });
					        query.limit({
            qid:queryId,
            value:1000
        });
					        //t_society
					        query.whereEqual({
					            qid: ret.qid,
					            column: 't_society',
					            value: societyID
					        });
					        query.whereLike({
					            qid: queryId,
					            column: 'createdAt',
					            value: yearStr
					        });
					        //findAll
					        model.findAll({
					            class: "t_society_activity_enroll",
					            qid: queryId
					        }, function(ret, err) {
					            if (ret) {
					            	returnResult['joined_act_num'] = ret.length;
					            	
					            	//继续查询成员签到的次数(也在参与表里面记录了)
					            	var checkCount = 0;
					            	for(var i = 0; i < ret.length; i++){
					            		if(1 == ret[i].check_status){
					            			checkCount++;
					            		}
					            	}
					            	//签到次数赋值
					            	returnResult['check_num'] = checkCount;
					    			//查询本社团本年度发布的所有活动数
					    			query.createQuery(function(ret, err) {
									    if (ret && ret.qid) {
									        var queryId = ret.qid;
									        query.whereEqual({
									            qid: queryId,
									            column: 'society_id',
									            value: societyID
									        });
									        query.whereLike({
									            qid: queryId,
									            column: 'createdAt',
									            value: yearStr
									        });
									        query.limit({
            qid:queryId,
            value:1000
        });
									        model.findAll({
									            class: "t_society_activity",
									            qid: queryId
									        }, function(ret, err) {
									            if (ret) {
									            	//社团本年度组织的活动次数
									                clubYearMaxOrganizedActNum = ret.length;
									                //计算活动活跃度
									                returnResult['act_active_degree'] = ((returnResult['check_num'] / clubYearMaxOrganizedActNum).toFixed(2) * 100) + '%';
									                
									                //查接收任务数和任务平均评星
									    			query.createQuery(function(ret, err) {
													    if (ret && ret.qid) {
													        var queryId = ret.qid;
													        //do something
													        //task_involved_user_id
													        query.whereEqual({
													            qid: queryId,
													            column: 'task_involved_user_id',
													            value: userID
													        });
													        query.limit({
            qid:queryId,
            value:1000
        });
													        //society_id
													        query.whereEqual({
													            qid: queryId,
													            column: 'society_id',
													            value: societyID
													        });
													        query.whereLike({
													            qid: queryId,
													            column: 'createdAt',
													            value: yearStr
													        });
													        //findAll
													        model.findAll({
													            class: "t_society_task_involved",
													            qid: queryId
													        }, function(ret, err) {
													            if (ret) {
													            	returnResult['received_task_num'] = ret.length;
													            	
													            	var submitTaskNum = 0;
													            	var taskEvaNum = 0;
													            	var sumEvaScore = 0;
													            	for(var i = 0; i < ret.length; i++){
													            		//计算所有提交的任务数
													            		if(ret[i].task_status != 1){
													            			submitTaskNum++;
													            			
													            			if(ret[i].task_status == 3){
														            			//已评分，累加并计算平均
														            			sumEvaScore += ret[i].task_evaluation;
														            			taskEvaNum++;
														            		}
													            		}
													            		
													            	}
													            	//提交任务数
													            	returnResult['submit_task_num'] = submitTaskNum;
													            	//计算任务平均评星
													            	clubTaskAveEva = (sumEvaScore / taskEvaNum).toFixed(1);
													            	returnResult['task_average_eva_stars'] = clubTaskAveEva;
													            	
													            	//更新对应成员的考核,有则更新，无则插入
													                query.createQuery(function(ret, err) {
																	    if (ret && ret.qid) {
																	        var queryId = ret.qid;
																	        
																	        //社团ID
																	        query.whereEqual({
																	            qid: queryId,
																	            column: 't_society',
																	            value: societyID
																	        });
																	        query.limit({
            qid:queryId,
            value:1000
        });
																	        //用户ID
																	        query.whereEqual({
																	            qid: queryId,
																	            column: 'userID',
																	            value: userID
																	        });
																	        //考核年度
																	        query.whereEqual({
																	            qid: queryId,
																	            column: 'eva_year',
																	            value: yearStr
																	        });
																	        //查找所有满足要求的记录
																	        model.findAll({
																	            class: "t_society_member_evaluation",
																	            qid: queryId
																	        }, function(ret, err) {
																	            //有记录则更新，没有则插入一个记录
																	            if (ret) {
																	            	var memEvaMsg = ret[0];
																	            	model.updateById({
																					    class: 't_society_member_evaluation',
																					    id: memEvaMsg.id,
																					    value: {
																					        joined_act_num: returnResult['joined_act_num'],
																					        check_num: returnResult['check_num'],
																					        act_active_degree: returnResult['act_active_degree'],
																					        received_task_num: returnResult['received_task_num'],
																					        submit_task_num: returnResult['submit_task_num'],
																					        task_completed_degree: returnResult['task_completed_degree'],
																					        task_average_eva_stars: returnResult['task_average_eva_stars'],
																					        eva_year: returnResult['eva_year'],
																					        organized_act_num: returnResult['organized_act_num'],
																					        published_task_num: returnResult['published_task_num'],
																					        organized_act_active_degree: returnResult['organized_act_active_degree']	
																					    }
																					}, function(ret, err){
																					    if(ret){
																					    	funcName(returnResult);
																					    }
																					    else {
																					    	api.toast({
																							    msg: '更新成员考核信息失败!!!',
																							    duration: 2000,
																							    location: 'middle'
																							});
																					    }
																					});
																	            }
																	            else{
																	            	//插入记录
																	            	model.insert({
																	            		class: 't_society_member_evaluation',
																	            		value: {
																	            			t_society: societyID,
																					        userID: societyID,
																					        joined_act_num: returnResult['joined_act_num'],
																					        check_num: returnResult['check_num'],
																					        act_active_degree: returnResult['act_active_degree'],
																					        received_task_num: returnResult['received_task_num'],
																					        submit_task_num: returnResult['submit_task_num'],
																					        task_completed_degree: returnResult['task_completed_degree'],
																					        task_average_eva_stars: returnResult['task_average_eva_stars'],
																					        eva_year: returnResult['eva_year'],
																					        organized_act_num: returnResult['organized_act_num'],
																					        published_task_num: returnResult['published_task_num'],
																					        organized_act_active_degree: returnResult['organized_act_active_degree']																					    
																	            		}
																	            	}, function(ret, err){
																	            		if(ret){
																	            			//将结果回调回去
																					        funcName(returnResult);
																	            		}
																	            		else{
																	            			api.toast({
																							    msg: '更新成员考核信息失败!!!',
																							    duration: 2000,
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
													    }
													});
									            }
									
									        });
									        
									    }
									});
					            }
					            else{
					            	api.toast({
									    msg: '更新成员考核信息失败!!!',
									    duration: 2000,
									    location: 'middle'
									});
					            }
					
					        });
					        
						});
	                } else {
	                	//查询本年度参加本社团的活动数
						query.createQuery(function(ret, err) {
						    if (ret && ret.qid) {
						        var queryId = ret.qid;
						        //do something
						    }
						    //enroll_user_id
						    query.whereEqual({
					            qid: ret.qid,
					            column: 'enroll_user_id',
					            value: userID
					        });
					        query.limit({
            qid:queryId,
            value:1000
        });
					        //t_society
					        query.whereEqual({
					            qid: ret.qid,
					            column: 't_society',
					            value: societyID
					        });
					        query.whereLike({
					            qid: queryId,
					            column: 'createdAt',
					            value: yearStr
					        });
					        //findAll
					        model.findAll({
					            class: "t_society_activity_enroll",
					            qid: queryId
					        }, function(ret, err) {
					            if (ret) {
					            	returnResult['joined_act_num'] = ret.length;
					            	
					            	//继续查询成员签到的次数(也在参与表里面记录了)
					            	var checkCount = 0;
					            	for(var i = 0; i < ret.length; i++){
					            		if(1 == ret[i].check_status){
					            			checkCount++;
					            		}
					            	}
					            	//签到次数赋值
					            	returnResult['check_num'] = checkCount;
					    			//查询本社团本年度发布的所有活动数
					    			query.createQuery(function(ret, err) {
									    if (ret && ret.qid) {
									        var queryId = ret.qid;
									        query.whereEqual({
									            qid: queryId,
									            column: 'society_id',
									            value: societyID
									        });
									        query.whereLike({
									            qid: queryId,
									            column: 'createdAt',
									            value: yearStr
									        });
									        query.limit({
            qid:queryId,
            value:1000
        });
									        model.findAll({
									            class: "t_society_activity",
									            qid: queryId
									        }, function(ret, err) {
									            if (ret) {
									            	//社团本年度组织的活动次数
									                clubYearMaxOrganizedActNum = ret.length;
									                //计算活动活跃度
									                returnResult['act_active_degree'] = ((returnResult['check_num'] / clubYearMaxOrganizedActNum).toFixed(2) * 100) + '%';
									                
									                //更新对应成员的考核,有则更新，无则插入
									                query.createQuery(function(ret, err) {
													    if (ret && ret.qid) {
													        var queryId = ret.qid;
													        
													        //社团ID
													        query.whereEqual({
													            qid: queryId,
													            column: 't_society',
													            value: societyID
													        });
													        //用户ID
													        query.whereEqual({
													            qid: queryId,
													            column: 'userID',
													            value: userID
													        });
													        query.limit({
            qid:queryId,
            value:1000
        });
													        //考核年度
													        query.whereEqual({
													            qid: queryId,
													            column: 'eva_year',
													            value: yearStr
													        });
													        //查找所有满足要求的记录
													        model.findAll({
													            class: "t_society_member_evaluation",
													            qid: queryId
													        }, function(ret, err) {
													            //有记录则更新，没有则插入一个记录
													            if (ret) {
													            	var memEvaMsg = ret[0];
													            	model.updateById({
																	    class: 't_society_member_evaluation',
																	    id: memEvaMsg.id,
																	    value: {
																	        joined_act_num: returnResult['joined_act_num'],
																	        check_num: returnResult['check_num'],
																	        act_active_degree: returnResult['act_active_degree'],
																	        received_task_num: returnResult['received_task_num'],
																	        submit_task_num: returnResult['submit_task_num'],
																	        task_completed_degree: returnResult['task_completed_degree'],
																	        task_average_eva_stars: returnResult['task_average_eva_stars'],
																	        eva_year: returnResult['eva_year'],
																	        organized_act_num: returnResult['organized_act_num'],
																	        published_task_num: returnResult['published_task_num'],
																	        organized_act_active_degree: returnResult['organized_act_active_degree']	
																	    }
																	}, function(ret, err){
																	    if(ret){
																	    	funcName(returnResult);
																	    }
																	    else {
																	    	api.toast({
																			    msg: '更新成员考核信息失败!!!',
																			    duration: 2000,
																			    location: 'middle'
																			});
																	    }
																	});
													            }
													            else{
													            	//插入记录
													            	model.insert({
													            		class: 't_society_member_evaluation',
													            		value: {
													            			t_society: societyID,
																	        userID: societyID,
																	        joined_act_num: returnResult['joined_act_num'],
																	        check_num: returnResult['check_num'],
																	        act_active_degree: returnResult['act_active_degree'],
																	        received_task_num: returnResult['received_task_num'],
																	        submit_task_num: returnResult['submit_task_num'],
																	        task_completed_degree: returnResult['task_completed_degree'],
																	        task_average_eva_stars: returnResult['task_average_eva_stars'],
																	        eva_year: returnResult['eva_year'],
																	        organized_act_num: returnResult['organized_act_num'],
																	        published_task_num: returnResult['published_task_num'],
																	        organized_act_active_degree: returnResult['organized_act_active_degree']																					    
													            		}
													            	}, function(ret, err){
													            		if(ret){
													            			//将结果回调回去
																	        funcName(returnResult);
													            		}
													            		else{
													            			api.toast({
																			    msg: '更新成员考核信息失败!!!',
																			    duration: 2000,
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
									        
									    }
									});
					            }
					            else{
					            	api.toast({
									    msg: '更新成员考核信息失败!!!',
									    duration: 2000,
									    location: 'middle'
									});
					            }
					
					        });
					        
						});
	                }
	                
	            }
	
	        });
	    }
	});
}

/*
 * 函数名:updateSocietyMemYearEvaEx()
 * 函数功能:更新某一社团用户某一年度的考核信息(此函数是对上边函数的重构，精简代码)
 * 参数:societyID -- 社团ID,
 * 	   userID  -- 用户ID   
 *     yearStr -- 年度
 *	   funcName -- 回调函数名(用来做回调用)
 * */
function updateSocietyMemYearEvaEx(societyID, userID, yearStr, funcName){
//	api.showProgress({
//	    style: 'default',
//	    animationType: 'fade',
//	    title: '努力加载考核信息中...',
//	    text: '先喝杯茶吧...',
//	    modal: false
//	});
	
	var model = api.require('model');
	var relation = api.require('relation');
	var query = api.require('query');
	model.config({
	    appKey: '5DDC1EE4-1A15-4DEB-34C0-F4DAA065F8B8',
	    appId: 'A6982914277502',
	    host: 'https://d.apicloud.com'
    });

    var returnResult = [];
    //其他社团组织活动最多的数量
    var maxOrganizedActNum = 0;
    //本社团
    var clubYearMaxOrganizedActNum = 0;
    var clubTaskAveEva = 0;
    //对应字段
    returnResult['maxOrganizedActNum'] = 0;
    returnResult['clubYearMaxOrganizedActNum'] = 0;
    returnResult['clubTaskAveEva'] = 0;
    returnResult['t_society'] = societyID;
    returnResult['userID'] = userID;
    //下边一系列的值都用默认值先
    returnResult['joined_act_num'] = 0;
    returnResult['check_num'] = 0;
    returnResult['act_active_degree'] = '0%';
    returnResult['received_task_num'] = 0;
    returnResult['submit_task_num'] = 0;
    returnResult['task_completed_degree'] = '0%';
    returnResult['task_average_eva_stars'] = 0;
    returnResult['eva_year'] = yearStr;
    returnResult['organized_act_num'] = 0;
    returnResult['published_task_num'] = 0;
    returnResult['organized_act_active_degree'] = '0%';
    //2015-9-2,Added by lzm,为了后边的查询有数据设置的
    $api.setStorage('joined_act_num', returnResult['joined_act_num']);
    $api.setStorage('clubYearMaxOrganizedActNum', returnResult['clubYearMaxOrganizedActNum']);
    $api.setStorage('check_num', returnResult['check_num']);
    $api.setStorage('act_active_degree', returnResult['act_active_degree']);
    $api.setStorage('received_task_num', returnResult['received_task_num']);
    $api.setStorage('submit_task_num', returnResult['submit_task_num']);
    $api.setStorage('task_completed_degree', returnResult['task_completed_degree']);
    $api.setStorage('task_average_eva_stars', returnResult['task_average_eva_stars']);
    $api.setStorage('organized_act_num', returnResult['organized_act_num']);
    $api.setStorage('maxOrganizedActNum', returnResult['maxOrganizedActNum']);
    $api.setStorage('organized_act_active_degree', returnResult['organized_act_active_degree']);
    //社团成员ID 
    var societyMemberID = "";
    
//  api.alert({
//  	msg: 'updateSocietyYearEvaEx hello hello!',
//  });
    
    //查询成员表并获取对应的职位
    query.createQuery(function(ret, err) {
//  	api.alert({
//	    	msg: 'createQuery ret:' + JSON.stringify(ret),
//	    });
    	
	    if(ret && ret.qid){
	        var queryId = ret.qid;
	        
//	        api.alert({
//		    	msg: 'userID:' + userID + ', societyID:' + societyID + ',yearStr:' + yearStr
//		    });
	        //user_id等于
	        query.whereEqual({
	            qid: queryId,
	            column: 'user_id',
	            value: userID
	        });
	        query.limit({
            qid:queryId,
            value:1000
        });
	        //society_id等于
	        query.whereEqual({
	            qid: queryId,
	            column: 'society_id',
	            value: societyID
	        });
//	        query.whereGreaterThanOrEqual({
//	        	qid: queryId,
//	            column: 'createdAt',
//	            value: yearStr
//	        });
	        //findAll
	        model.findAll({
	            class: "t_society_member",
	            qid: queryId
	        }, function(ret, err) {
	            if (ret && (0 != ret.length)) {
//	            	alert("findAll test 000");
	                var societyMemMsg = ret[0];
	                societyMemberID = societyMemMsg.id;
	                var userSocietyPos = societyMemMsg.society_member_position;
//	                api.alert({
//	                	msg: 'societyMemMsg:' + JSON.stringify(societyMemMsg),
//	                });
	                
	                //查询发布的活动数
                	query.createQuery(function(ret, err) {
					    if (ret && ret.qid) {
					        var queryId = ret.qid;
					        //activity_publisher
					        query.whereEqual({
					            qid: queryId,
					            column: 'activity_publisher',
					            value: userID
					        });
					        query.limit({
            qid:queryId,
            value:1000
        });
					        //society_id
					        query.whereEqual({
					            qid: queryId,
					            column: 'society_id',
					            value: societyID
					        });
					        query.whereGreaterThanOrEqual({
					        	qid: queryId,
					            column: 'createdAt',
					            value: yearStr
					        });
					        model.findAll({
					            class: "t_society_activity",
					            qid: queryId
					        }, function(ret, err) {
//					        	alert("findAll test 111-000");
					            if (ret && (0 != ret.length)) {
//					            	api.alert({
//					                	msg: 't_society_activity:' + JSON.stringify(ret),
//					                });
//					            	alert("findAll test 111");
					            	//将查询到的活动数为其赋值
					            	returnResult['organized_act_num'] = ret.length;
					            	
					            }
					            
					            //继续查发布的任务数
				            	query.createQuery(function(ret, err) {
								    if (ret && ret.qid) {
								        var queryId = ret.qid;
								        //task_publisher
								        query.whereEqual({
								            qid: queryId,
								            column: 'task_publisher',
								            value: userID
								        });
								        query.limit({
            qid:queryId,
            value:1000
        });
								        //society_id
								        query.whereEqual({
								            qid: queryId,
								            column: 'society_id',
								            value: societyID
								        });
								        query.whereGreaterThanOrEqual({
								        	qid: queryId,
								            column: 'createdAt',
								            value: yearStr
								        });
								        model.findAll({
								            class: "t_society_task",
								            qid: queryId
								        }, function(ret, err) {
								            if (ret && (0 != ret.length)) {
//								            	alert("findAll test 222");
//									            	api.alert({
//									                	msg: 't_society_task:' + JSON.stringify(ret),
//									                });
												
								            	//将查询到的任务数为其赋值
								            	returnResult['published_task_num'] = ret.length;
								            	
								            }
								            
								            //其他社团组织最多活动的社团
											query.createQuery(function(ret, err) {
											    if (ret && ret.qid) {
											        var queryId = ret.qid;
											        //查找所有的社团考核信息
											        model.findAll({
											            class: "t_society_evaluation",
											            qid: queryId
											        }, function(ret, err) {
											            if (ret && (0 != ret.length)) {
//											            	alert("findAll test 333");
//													            	api.alert({
//													                	msg: 't_society_evaluation:' + JSON.stringify(ret) + 'ret.length:' + ret.length,
//													                });
															
											                var i = 0;
											                for(; i < ret.length; i++){
											                	//查找最大的活动次数
											                	if(ret[i].organized_act_num > maxOrganizedActNum){
											                		maxOrganizedActNum = ret[i].organized_act_num;
											                	}
											                	
											                }
											                returnResult['maxOrganizedActNum'] = maxOrganizedActNum;
											                //如果查到的所有社团组织活动的最大记录数为0或者本社团最新查出的组织活动数大于查到的最大数，那么该社长组织的活动活跃数为100%
											                if(0 == maxOrganizedActNum || returnResult['organized_act_num'] >= maxOrganizedActNum){
											                	returnResult['organized_act_active_degree'] = '100%';
											                }
											                else if(0 == returnResult['organized_act_num']){
											                	returnResult['organized_act_active_degree'] = '0%';
											                }
											                else{
											                	var organized_act_active_degree_num = (returnResult['organized_act_num'] / maxOrganizedActNum);
											                	returnResult['organized_act_active_degree'] = ((organized_act_active_degree_num).toFixed(2) * 100).toFixed(1) + '%';
//													                	api.alert({
//													                		msg: "returnResult['organized_act_active_degree']:" + returnResult['organized_act_active_degree'] + ",organized_act_active_degree_num:"+organized_act_active_degree_num,
//													                	});
											                }
											                
//													                api.alert({
//													                	msg: 'organized_act_active_degree:' + returnResult['organized_act_active_degree'] + 'maxOrganizedActNum:' + returnResult['maxOrganizedActNum'],
//													                });
											            }
											            else{
											            	//没查到其他社团的考核信息
											            	returnResult['organized_act_active_degree'] = '100%';
											            }
											            
											            //查询本年度参加本社团的活动数
														query.createQuery(function(ret, err) {
														    if (ret && ret.qid) {
														        var queryId = ret.qid;
														        //do something
														    }
														    //enroll_user_id
														    query.whereEqual({
													            qid: ret.qid,
													            column: 'enroll_user_id',
													            value: userID
													        });
													        query.limit({
            qid:queryId,
            value:1000
        });
													        //t_society
													        query.whereEqual({
													            qid: ret.qid,
													            column: 'status',
													            value: 1
													        });
													        //t_society
													        query.whereEqual({
													            qid: ret.qid,
													            column: 't_society',
													            value: societyID
													        });
													        query.whereGreaterThanOrEqual({
													        	qid: queryId,
													            column: 'createdAt',
													            value: yearStr
													        });
													        //findAll
													        model.findAll({
													            class: "t_society_activity_enroll",
													            qid: queryId
													        }, function(ret, err) {
													        	
													            if (ret && (0 != ret.length)) {
													            	returnResult['joined_act_num'] = ret.length;
//													            	alert("findAll test 444");
//															            	api.alert({
//															                	msg: 't_society_activity_enroll:' + JSON.stringify(ret),
//															                });
													            	//继续查询成员签到的次数(也在参与表里面记录了)
													            	var checkCount = 0;
													            	for(var i = 0; i < ret.length; i++){
													            		if(1 == ret[i].check_status){
													            			checkCount++;
													            		}
													            	}
													            	//签到次数赋值
													            	returnResult['check_num'] = checkCount;
													    			
													            }
													            
													            //查询本社团本年度发布的所有活动数
												    			query.createQuery(function(ret, err) {
																    if (ret && ret.qid) {
																        var queryId = ret.qid;
																        query.whereEqual({
																            qid: queryId,
																            column: 'society_id',
																            value: societyID
																        });
																        query.whereGreaterThanOrEqual({
																        	qid: queryId,
																            column: 'createdAt',
																            value: yearStr
																        });
																        query.limit({
            qid:queryId,
            value:1000
        });
																        model.findAll({
																            class: "t_society_activity",
																            qid: queryId
																        }, function(ret, err) {
																        	
																            if (ret && (0 != ret.length)) {
//																            	alert("findAll test 555");
//																			            	api.alert({
//																			                	msg: 't_society_activity:' + JSON.stringify(ret),
//																			                });
																				
																            	//社团本年度组织的活动次数
																                clubYearMaxOrganizedActNum = ret.length;
																                returnResult['clubYearMaxOrganizedActNum'] = clubYearMaxOrganizedActNum;
																                //计算活动活跃度
																                if(0 == clubYearMaxOrganizedActNum){
																                	returnResult['act_active_degree'] = '0%';
																                }
																                else{
																                	var init_act_active_degree = (returnResult['check_num'] / clubYearMaxOrganizedActNum);
																                	returnResult['act_active_degree'] = ((init_act_active_degree).toFixed(2) * 100) + '%';
																                }
																            }
																            
																            //查接收任务数和任务平均评星
															    			query.createQuery(function(ret, err) {
																			    if (ret && ret.qid) {
																			        var queryId = ret.qid;
																			        //do something
																			        //task_involved_user_id
																			        query.whereEqual({
																			            qid: queryId,
																			            column: 'task_involved_user_id',
																			            value: userID
																			        });
																			        //society_id
																			        query.whereEqual({
																			            qid: queryId,
																			            column: 'society_id',
																			            value: societyID
																			        });
																			        query.whereGreaterThanOrEqual({
																			        	qid: queryId,
																			            column: 'createdAt',
																			            value: yearStr
																			        });
																			        query.limit({
            qid:queryId,
            value:1000
        });
																			        //findAll
																			        model.findAll({
																			            class: "t_society_task_involved",
																			            qid: queryId
																			        }, function(ret, err) {
																			        	
																			            if (ret && (0 != ret.length)) {
//																			            	alert("findAll test 666");
			//																		            	api.alert({
			//																		                	msg: 't_society_task_involved:' + JSON.stringify(ret),
			//																		                });
																			                
																			            	returnResult['received_task_num'] = ret.length;
			//																		            	api.alert({
			//																		                	msg: 'received_task_num:' + returnResult['received_task_num'],
			//																		                });
																			            	var submitTaskNum = 0;
																			            	var taskEvaNum = 0;
																			            	var sumEvaScore = 0;
																			            	for(var i = 0; i < ret.length; i++){
																			            		//计算所有提交的任务数
																			            		if(ret[i].task_status != 1){
																			            			submitTaskNum++;
																			            			
																			            			if(ret[i].task_status == 3){
																				            			//已评分，累加并计算平均
																				            			sumEvaScore += ret[i].task_evaluation;
																				            			taskEvaNum++;
																				            		}
																			            		}																		            		
																			            	}
																			            	//提交任务数
																			            	returnResult['submit_task_num'] = submitTaskNum;
																			            	//计算任务完成度
																			            	if(0 == returnResult['received_task_num']){
																			            		returnResult['task_completed_degree'] = '0%';
																			            	}
																			            	else{
																			            		returnResult['task_completed_degree'] = ((returnResult['submit_task_num'] / returnResult['received_task_num']).toFixed(2) * 100) + '%';
																			            	}
																			            	
																			            	//计算任务平均评星
																			            	if(0 != taskEvaNum){
																			            		clubTaskAveEva = (sumEvaScore / taskEvaNum).toFixed(1);
																			            	}
																			            	else{
																			            		clubTaskAveEva = 0;
																			            	}
																			            	returnResult['task_average_eva_stars'] = clubTaskAveEva;
			
																			            }
																			            
																			            //2015-9-1,Added by lzm,进行本地缓存，方便下次读取
																			            $api.setStorage('joined_act_num', returnResult['joined_act_num']);
																			            $api.setStorage('clubYearMaxOrganizedActNum', returnResult['clubYearMaxOrganizedActNum']);
																			            $api.setStorage('check_num', returnResult['check_num']);
																			            $api.setStorage('act_active_degree', returnResult['act_active_degree']);
																			            $api.setStorage('received_task_num', returnResult['received_task_num']);
																			            $api.setStorage('submit_task_num', returnResult['submit_task_num']);
																			            $api.setStorage('task_completed_degree', returnResult['task_completed_degree']);
																			            $api.setStorage('task_average_eva_stars', returnResult['task_average_eva_stars']);
																			            $api.setStorage('organized_act_num', returnResult['organized_act_num']);
																			            $api.setStorage('maxOrganizedActNum', returnResult['maxOrganizedActNum']);
																			            $api.setStorage('organized_act_active_degree', returnResult['organized_act_active_degree']);
																			            
																			            //更新对应成员的考核,有则更新，无则插入
																		                query.createQuery(function(ret, err) {
																						    if (ret && ret.qid) {
																						        var queryId = ret.qid;
																						        
																						        //社团ID
																						        query.whereEqual({
																						            qid: queryId,
																						            column: 't_society',
																						            value: societyID
																						        });
																						        //用户ID
																						        query.whereEqual({
																						            qid: queryId,
																						            column: 'userID',
																						            value: userID
																						        });
																						        query.limit({
            qid:queryId,
            value:1000
        });
																						        //考核年度
																						        query.whereGreaterThanOrEqual({
																						        	qid: queryId,
																						            column: 'createdAt',
																						            value: yearStr
																						        });
																						        //查找所有满足要求的记录
																						        model.findAll({
																						            class: "t_society_member_evaluation",
																						            qid: queryId
																						        }, function(ret, err) {
			//																					            api.alert({
			//																				                	msg: 'joined_act_num:' + returnResult['joined_act_num'] + ', check_num:' + returnResult['check_num'] + ', act_active_degree:' + returnResult['act_active_degree'] + ', received_task_num:' + returnResult['received_task_num'] + ',submit_task_num:' + returnResult['submit_task_num'] + ',task_completed_degree:' + returnResult['task_completed_degree'] + ',task_average_eva_stars:' + returnResult['task_average_eva_stars'] + ',eva_year:' + returnResult['eva_year'] + ',organized_act_num:' + returnResult['organized_act_num'] + ',published_task_num:' + returnResult['published_task_num'] + ',organized_act_active_degree:' + returnResult['organized_act_active_degree'] + ',maxOrganizedActNum:' + maxOrganizedActNum + ',clubYearMaxOrganizedActNum:' + clubYearMaxOrganizedActNum
			//																				                });
//																						            alert("findAll test 777");
																						            
																						            //有记录则更新，没有则插入一个记录
																						            if (ret && (0 != ret.length)) {
			//																					            	api.alert({
			//																					                	msg: 't_society_member_evaluation:' + JSON.stringify(ret),
			//																					                });
																						            	
																						            	var memEvaMsg = ret[0];
																						            	model.updateById({
																										    class: 't_society_member_evaluation',
																										    id: memEvaMsg.id,
																										    value: {
																										    	t_society: societyID,
																										        userID: userID,
																										        joined_act_num: returnResult['joined_act_num'],
																										        check_num: returnResult['check_num'],
																										        act_active_degree: returnResult['act_active_degree'],
																										        received_task_num: returnResult['received_task_num'],
																										        submit_task_num: returnResult['submit_task_num'],
																										        task_completed_degree: returnResult['task_completed_degree'],
																										        task_average_eva_stars: returnResult['task_average_eva_stars'],
																										        eva_year: returnResult['eva_year'],
																										        organized_act_num: returnResult['organized_act_num'],
																										        published_task_num: returnResult['published_task_num'],
																										        organized_act_active_degree: returnResult['organized_act_active_degree']	
																										    }
																										}, function(ret, err){
																										    if(ret){
//																										    	api.toast({
//																												    msg: '刷新成员考核信息成功~',
//																												    duration: 2000,
//																												    location: 'middle'
//																												});
																										    	funcName(returnResult);
																										    	//2015-9-2,Added by lzm
																										    	api.hideProgress();
																										    }
																										    else {
																										    	api.toast({
																												    msg: '更新成员考核信息失败!!!',
																												    duration: 2000,
																												    location: 'middle'
																												});
																												api.hideProgress();
																										    }
																										});
																						            }
																						            else{
																						            	//插入记录
			//																					            	alert("societyMemberID:" + societyMemberID);
																						            	relation.insert({
																						            		class: 't_society_member',
																						            		id: societyMemberID,
																						            		column: 't_society_member_evaluation',
																						            		value: {
																						            			t_society: societyID,
																										        userID: userID,
																										        joined_act_num: returnResult['joined_act_num'],
																										        check_num: returnResult['check_num'],
																										        act_active_degree: returnResult['act_active_degree'],
																										        received_task_num: returnResult['received_task_num'],
																										        submit_task_num: returnResult['submit_task_num'],
																										        task_completed_degree: returnResult['task_completed_degree'],
																										        task_average_eva_stars: returnResult['task_average_eva_stars'],
																										        eva_year: returnResult['eva_year'],
																										        organized_act_num: returnResult['organized_act_num'],
																										        published_task_num: returnResult['published_task_num'],
																										        organized_act_active_degree: returnResult['organized_act_active_degree']																					    
																						            		}
																						            	}, function(ret, err){
																						            		if(ret){
//																						            			api.toast({
//																												    msg: '刷新成员考核信息成功~',
//																												    duration: 2000,
//																												    location: 'middle'
//																												});
																						            			//将结果回调回去
																										        funcName(returnResult);
																										        //2015-9-2,Added by lzm
																										    	api.hideProgress();
																						            		}
																						            		else{
																						            			api.toast({
																												    msg: '更新成员考核信息失败!!!',
																												    duration: 2000,
																												    location: 'middle'
																												});
																												api.hideProgress();
																						            		}
																						            	});
																						            }
																						
																						        });
																						    }
																						    
																						});
																			
																			        });
																			    }
																			   
																			});
																            
																        });
																        
																    }
																    
																});
													            																
													        }); 
														});
											        });
											    }
											   
											});
								        });
								    }
								 
								});
									
					        });
					    }
					 
					});   
	            }
	            else{
	            	api.toast({
					    msg: '查询成员考核信息失败!!!',
					    duration: 2000,
					    location: 'middle'
					});
	            	api.hideProgress();
	            }
	        });
	    }
		    
	});
}
