import { api } from "@/api";
import store from "@/store";
import { groupDB } from "./groupDB"; 
import { sessionUtil } from "@/session/sessionUtil";
import { Config } from "@/common/config"

export const group = {
    sessionType:1,
    activeIndex:0,//当前活跃索引
    activeLength:0,//当前活跃长度
    /**
     * 
     * @param {*} isNetwork 是否强制请求网络数据
     */
    getGroupAll(isNetwork){
        return new Promise(resolve => {
            if(isNetwork){
                store.dispatch("getGroupList", {}).then(data => {
                    groupDB.clearGroup();
                    groupDB.updateGroupBatch(data);
                    return resolve(data);
                })
            }else{
                groupDB.readGroupAll().then(data => {
                    if(data!=undefined&&data.length>0){
                        let cache={}
                        for(let key in data){
                            let item=data[key];
                            cache[item.groupId]=item;
                        }
                        return resolve(cache);
                    }else{
                        store.dispatch("getGroupList", {}).then(data => {
                            groupDB.clearGroup();
                            groupDB.updateGroupBatch(data);
                            return resolve(data);
                        })
                    }
                })
            }
        })
        
    },
    /**
     * 获取群消息
     * @param {int} groupId 
     */
    getGroupInfo(groupId){
        groupId=Number(groupId);
        return new Promise(resolve => {
            groupDB.readGroup(groupId).then(data =>{
                if(data!=undefined){
                   return resolve(data);
                }
                //获取群信息接口
                api.getGroupSetting({groupId:groupId}).then(data =>{
                    groupDB.updateGroup(data);
                    return resolve(data);
                })
            }).catch(err => {
                console.error(err);
            });

          });
    },
    /**
     * 更新群信息
     * @param {*} data 
     */
    updateGroupInfo(data){
        groupDB.updateGroup(data);
    },

    /**
     * 获取指定群成员
     * @param {*} groupId 
     * @param {boolean} network 是否强行获取网络资源，默认否
     */
    getGroupMember(groupId,network=false){
        groupId=Number(groupId);
        return new Promise(resolve => {
            let groupUpdate=sessionUtil.getGroupUpdateSessionStorage();
            if(!network){
                if(groupUpdate.hasOwnProperty(groupId)){
                    groupDB.readGroupMember(groupId).then(data =>{
                        return resolve(data);
                    }).catch(err => {
                        console.error(err);
                    });
                }else{
                    store.dispatch("getGroupMember", {groupId: groupId}).then(data1 => {
                        groupDB.updateGroupMember(data1);
                        groupUpdate[groupId]=1;
                        sessionUtil.setGroupUpdateSessionStorage(groupUpdate);
                        resolve(data1);
                    });
                }
            }else{
                store.dispatch("getGroupMember", {groupId: groupId}).then(data1 => {
                    groupDB.removeGroupMembers(groupId).then(()=>{
                        groupDB.updateGroupMember(data1);
                    })
                    groupUpdate[groupId]=1;
                    sessionUtil.setGroupUpdateSessionStorage(groupUpdate);
                    resolve(data1);
                });
            }
          });
    },
  /**
   * 获取群成员信息
   * @param {int} groupId 群ID
   * @param {int} userId 群成员ID
   */
  getMemberInfo(groupId, userId) {
      groupId=Number(groupId);
      userId=Number(userId);
    return new Promise(resolve => {
        groupDB.readGroupMemberInfo(groupId,userId).then(data =>{
            if(data){
                return resolve(data);
            }else{
                api.getGroupUser({groupId:groupId,userId:userId}).then(data =>{
                    groupDB.updateMemberInfo(data);
                    return resolve(data);
                })
            }
        })
    });
  },
/**
 * 更新单个群单个成员信息
 * @param {*} data 
 */
updateMemberInfo(data) {
    groupDB.updateMemberInfo(data);
},

/**
 * 更新单个群成员信息
 * @param {*} data 
 */
updateGroupMember(data) {
    groupDB.updateGroupMember(data);
},
  /**
   * 获取群消息
   * @param {int} sessionId 群ID
   * @param {*} maxMsgId 查询的最大消息ID
   * @param {*} firstMsgId 截止ID
   * @param {*} pageSize 页面大小
   */
  getMsg(sessionId,maxMsgId,firstMsgId,pageSize=20){
    sessionId=Number(sessionId);
    maxMsgId=Number(maxMsgId);
    firstMsgId=Number(firstMsgId);
    this.activeIndex=0;//当前活跃ID
    this.activeLength=0;
    return new Promise(resolve => {
        if(maxMsgId!=null&&maxMsgId<=firstMsgId){
            return resolve({firstMsgId:firstMsgId,paramId:sessionId,fromType:this.sessionType});
        }
        groupDB.readGroupMsgPage(sessionId,maxMsgId,pageSize).then(data => {
            let record={firstMsgId:firstMsgId,
                paramId:sessionId,
                fromType:this.sessionType};
            if(data.length==0){
                //获取接口
                let obj = {
                    sessionUserId: sessionId,
                    type: this.sessionType,
                    minId: ++maxMsgId,
                    pageSize: pageSize
                };
                this.httpGet(resolve,record,obj,data,sessionId)
            }else{
                //判断是否缺头
                let mId=null;
                if(data[0].mId==maxMsgId){
                    mId=data[data.length-1].mId
                    if(data.length<pageSize){
                        //，缺尾巴 ，//缺中间
                        if(mId>firstMsgId+1){
                            //获取接口
                            let obj = {
                                sessionUserId: sessionId,
                                type: this.sessionType,
                                minId: mId,
                                pageSize: pageSize
                              };
                              this.httpGet(resolve,record,obj,data,sessionId)
                        }else{
                            record.data=data;
                            return resolve(record);
                        }
                    }else{
                        record.data=data;
                        return resolve(record);
                    }
                }else{
                    //缺头
                    mId=++maxMsgId;
                    let obj = {
                        sessionUserId: sessionId,
                        type: this.sessionType,
                        minId: mId,
                        pageSize: pageSize
                      };
                      this.httpGet(resolve,record,obj,data,sessionId)
                }

            }
        });
      });
  },

/**
 * 消息更新
 * @param {*} sessionId 
 * @param {*} data 
 */
updateMsg(sessionId,data){
    //更新数据库
    sessionId=Number(sessionId);
    groupDB.updateGroupMsg(sessionId,data);
  },
  updateMsgBatch(sessionId,data){
    //更新数据库
    sessionId=Number(sessionId);
    groupDB.updateGroupMsgBatch(sessionId,data);
  },
  //1
  /**
   * 获取断层消息
   * @param {*} resolve 
   * @param {*} record 
   * @param {*} obj 
   * @param {*} rData 
   * @param {*} sessionId 
   */
httpGet(resolve,record,obj,rData,sessionId){
    api.getMesssages(obj).then(data => {
        if(data!=undefined){
            let data1=Object.values(data);
            this.activeLength=data1.length;
            //去重？
            if(this.activeLength==0){
                record.firstMsgId=obj.minId;
                record.data=rData;
                return resolve(record);
            }else{
                if(data1.length<obj.pageSize){
                    //重置firstMsgId
                    record.firstMsgId=data1[0].mId;
                }
                let cache=this.removalDuplicate(rData,data1);
                for(var key in cache){
                    let c=cache[key];
                    if(sessionId==c.bodyFrom){
                        this.fillUserInfo(resolve,record,cache,sessionId)
                    }else{
                        if(!c.chatInfo&&!c.noChatInfo){
                            this.getMemberInfo(sessionId,c.bodyFrom).then(member=>{
                                c.chatInfo={
                                    nickName:member.nickName,
                                    userId:c.bodyFrom,
                                    isAdmin:member.isAdmin,
                                    headImg: member.avatar
                                }
                                this.fillUserInfo(resolve,record,cache,sessionId)
                            })
                        }else{
                            this.fillUserInfo(resolve,record,cache,sessionId)
                        }
                    }
                }
            }
        }else{
            record.firstMsgId=obj.minId-1;
            record.data=rData;
            return resolve(record);
        }
    })
},

//去重
removalDuplicate(rData,data1){
    let cache={}
    for(let key in rData){
        let a=rData[key];
        cache[a.mId]=a;
    }
    for(let i=data1.length-1;i>=0;i--){
        let a=data1[i];
        let b=cache[a.mId];
        if(b){
            b.bodyContent=a.bodyContent;
            b.bodyFrom=a.bodyFrom;
            b.bodyTime=a.bodyTime;
            b.bodyType=a.bodyType;
            b.preview=a.preview;
            b.checked=a.checked;
            b.readNum=a.readNum;
        }else{
            cache[a.mId]=a;
        }
    }
    return cache;
},
  //2
  /**
   * 数据归一
   * @param {*} resolve 
   * @param {*} record 
   * @param {*} rData 
   * @param {*} data1 
   * @param {*} sessionId 
   * @param {*} pageSize 
   */
fillUserInfo(resolve,record,cache,sessionId){
    this.activeIndex++;
    if(this.activeIndex>=this.activeLength){
        record.data=cache;
        //更新数据库
        groupDB.updateGroupMsgBatch(sessionId,cache);
        return resolve(record);
    }
},
  /**
   * 移除指定会话所有消息
   */
  removeMsgAll(sessionId){
    groupDB.removeMsgAll(sessionId);
  },
  /**
   * 移除指定消息
   */
  removeMsg(sessionId,mId,isAll){
    groupDB.removeMsg(sessionId,mId,isAll);
  },
  /**
   * 清空所有缓存数据
   */
  clearMsg(){
    groupDB.clearMsg();
  },
      /**
   * 定期清理
   * @param {*} sessionId 
   * @param {*} lastTime 
   * @param {*} cycle 
   */
  regularCleaning(sessionId, lastTime, cycle){
    groupDB.regularCleaning(sessionId, lastTime, cycle);
  },
  editMsg(sessionId, mId, content){
    groupDB.editMsg(sessionId,mId,content);
  },
  setReadMsgBySessionId(sessionId,maxReadId){
    groupDB.setReadMsgBySessionId(sessionId,maxReadId);
  },
  getChatInfo(sessionId,memberId){
    let chatInfo={};
    chatInfo.userId=sessionId;
    return new Promise(resolve => {
        if(memberId){
            //获取群成员信息
            this.getMemberInfo(sessionId,memberId).then(data=>{
                chatInfo.nickName=data.nickName;
                chatInfo.userId=memberId;
                chatInfo.isAdmin=data.isAdmin;
                chatInfo.headImg= data.avatar
                return resolve(chatInfo);
            });
        }else{
            //获取群信息
            this.getGroupInfo(sessionId).then(data=>{
                // chatInfo.headImg=data.headImg;
                chatInfo.nickName=data.groupName;
                chatInfo.isTop=data.isTop
                chatInfo.isInterruption=data.isInterruption
                chatInfo.isShowMemberNick=data.isShowMemberNick
                chatInfo.isBanned=data.isBanned
                chatInfo.isFriend=data.isFriend
                chatInfo.isForbidChat=data.isForbidChat
                if(!chatInfo.headImg){
                    if(data.avatar){
                        chatInfo.headImg= data.avatar
                    }
                }else{
                    chatInfo.headImg=chatInfo.headImg;
                }
                
                return resolve(chatInfo);
            })
        }
    })
  },

/**
 * 移除指定群所有成员
 * @param {*} sessionId 
 */
  removeGroupMembers(sessionId){
    groupDB.removeGroupMembers(sessionId);
  },

  /**
   * 移除指定群，指定成员
   * @param {*} sessionId 
   * @param {*} memberId 
   */
  removeGroupMember(sessionId,memberId){
    groupDB.removeGroupMember(sessionId,memberId);
  },
  /**
   * 移除指定群
   * @param {*} sessionId 
   */
  removeGroup(sessionId){
    groupDB.removeGroup(sessionId);
  },
  /**
   * 退出群
   * @param {*} groupId 
   */
  quit(groupId){
    groupId=Number(groupId);
    //清除消息
    this.removeMsgAll(groupId);
    //清除群
    this.removeGroup(groupId);
    //清除群成员
    this.removeGroupMembers(groupId);
  },
  /**
   * 填充消息断层
   * @param {*} groupId 
   * @param {json} data 
   */
  fillFaultMsg(groupId,data){
    groupId=Number(groupId);
    let objActive={
        activeIndex:0,
        activeLength:Object.keys(data).length
    };
    return new Promise(resolve => {
        for(var key in data){
            let c=data[key];
            if(groupId==c.bodyFrom){
                this.fillFaultUserInfo(resolve,data,groupId,objActive)
            }else{
                if(!c.chatInfo&&!c.noChatInfo){
                    this.getMemberInfo(groupId,c.bodyFrom).then(member=>{
                        c.chatInfo={
                            nickName:member.nickName,
                            userId:c.bodyFrom,
                            isAdmin:member.isAdmin,
                            headImg:member.avatar
                        }
                        this.fillFaultUserInfo(resolve,data,groupId,objActive)
                    })
                }else{
                    this.fillFaultUserInfo(resolve,data,groupId,objActive)
                }
            }
        }
    })
  },
  fillFaultUserInfo(resolve,data,groupId,objActive){
    objActive.activeIndex=objActive.activeIndex+1;
    if(objActive.activeIndex>=objActive.activeLength){
        //更新数据库
        groupDB.updateGroupMsgBatch(groupId,data);
        return resolve(data);
    }
  },
//禁言处理--不涉及消息展示
  groupMuted(body){
    var content = JSON.parse(body.bodyContent);
    var sessionObj = store.state.session.record[body.bodyFrom+'-1'];
    if (content.type == 1) {
      //全员
      if(content.state==1){
        //禁言
        if(content.operatorId!=store.getters.userId){
            //判断是否是管理员
          this.getMemberInfo(body.bodyFrom,store.getters.userId).then(member=>{
              if(member.isAdmin<1){
                  this.setBanned(body.bodyFrom,1);
              }
          })
        }
      }else{
        //解禁
        this.setBanned(body.bodyFrom,0);
      }
    } else if (content.type == 2) {
      //个人
      let bannedPersonIds = content.bannedPersonId.split(",");
      if (content.state == 1) {
        for (let i = 0; i < bannedPersonIds.length; i++) {              
            if(Number(bannedPersonIds[i])==store.getters.userId){
                this.setBanned(body.bodyFrom,2);
              break;
            }
          }
      }else{
        //解禁
        this.setBanned(body.bodyFrom,0);
      }
      this.getGroupMember(body.bodyFrom).then(groupMember =>{
        for (let i = 0; i < bannedPersonIds.length; i++) {
          groupMember[bannedPersonIds[i]].isBanned = content.state;
        }
        store.commit("SET_GROUP_MEMBER", groupMember);
        this.updateGroupMember(groupMember);
      })
    }
  },
  /**
   * 
   * @param {*} groupId 群ID
   * @param {*} state 0-解禁 1-全体禁言 2-管理员禁言
   */
setBanned(groupId,state){
    let groupInfo=store.state.groupList[groupId];
    if(groupInfo&&(state==1||state==0)){
        groupInfo.isBanned=state;
    }
    var sessionObj = store.state.session.record[groupId+'-1'];
    sessionObj.isBanned = state;
    store.commit("UPDATE_SESSION", sessionObj);
    if (groupId == store.state.currentSession.paramId) {
      sessionObj = store.state.currentSession;
      sessionObj.isBanned = state;
      store.commit("UPDATE_CURRENT_SESSION", sessionObj);
    }
},
    /**
     * 获取本地消息
     * @param {*} sessionId 
     * @param {*} mId 
     */
    getLocalMsg(sessionId,mId){
        return new Promise(resolve => {
            groupDB.getLocalMsg(resolve,sessionId,mId);
        })
    },

    /**
     * 获取本地消息
     * @param {*} sessionId 
     * @param {*} mId 
     */
    getLocalImgAndVideo(sessionId){
        return new Promise(resolve => {
            groupDB.getLocalImgAndVideo(resolve,sessionId);
        })
    },
    setReadNumBySessionId(sessionId,mId,num){
        groupDB.setReadNumBySessionId(sessionId,mId,num);
    },
    vagueFind(keyWord){
        return new Promise(resolve => {
            groupDB.vagueFind(resolve,keyWord);
        })
    },
}