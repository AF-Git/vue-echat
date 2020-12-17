import { api } from "@/api";
import store from "@/store";
import { friendDB } from "./friendDB"; 
import { Config } from "@/common/config"
export const friend = {
    sessionType:0,
    tempHeadImg: "./static/images/chat/img-username.png",
    activeLength:0,//当前活跃长度

    /**
     * 获取好友信息
     * @param {*} userId 
     */
    getFriend(userId){
        userId=Number(userId);
        return new Promise(resolve => {
            friendDB.readFriend(userId).then(data => {
                if(data==undefined){
                    //网络获取个人信息
                    api.getTempFriendInfo({sessionId: userId}).then(data => {
                        data.checked = false;
                        data.nickName = data.notes || data.nickName || data.userName;
                        if (data.avatar) data.headImg = data.avatar;
                        //else data.headImg = this.tempHeadImg;
                        friendDB.updateFriend(userId,data);
                        return resolve(data);
                    });
                }else{
                    return resolve(data);
                }
            })
        });
    },

    /**
     * 获取好友信息
     * @param {*} isNetwork 是否强制请求网络数据
     */
    getFriendAll(isNetwork){
        return new Promise(resolve => {
            if(isNetwork){
                //获取网络数据
                store.dispatch("getFriendList", {}).then(
                    data => {
                        friendDB.updateFriendBatch(data).then(data=>{
                            store.commit("SET_FRIEND_LIST", data);
                            return resolve(data);
                        });
                    }
                );
            }else{
                friendDB.readFriendAll().then(data =>{
                    if(data!=undefined&&data.length>0){
                        let cache={}
                        for(let key in data){
                            let item=data[key];
                            cache[item.userId]=item;
                        }
                        return resolve(cache);
                    }else{
                        //获取网络数据
                        store.dispatch("getFriendList", {}).then(
                            data => {
                                friendDB.updateFriendBatch(data).then(data=>{
                                    store.commit("SET_FRIEND_LIST", data);
                                    return resolve(data);
                                });
                            }
                        );
                    }
                });
            }
        });
    },
/**
   * 获取单聊消息
   * @param {*} sessionId 用户ID
   * @param {*} maxMsgId 需要获取的最小ID
   * @param {*} firstMsgId 截止ID
   * @param {*} pageSize 页面大小
   */
  getMsg(sessionId,maxMsgId,firstMsgId,pageSize=20){
    sessionId=Number(sessionId);
    maxMsgId=Number(maxMsgId);
    firstMsgId=Number(firstMsgId);
    return new Promise(resolve => {
        if(maxMsgId!=null&&maxMsgId<=firstMsgId){
            return resolve({firstMsgId:firstMsgId,paramId:sessionId,fromType:this.sessionType});
        }
        friendDB.readPrivateMsgPage(sessionId,maxMsgId,pageSize).then(data => {
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
                friendDB.updatePrivateMsgBatch(sessionId,cache);
                record.data=cache;
                return resolve(record);
            }
        }else{
            record.firstMsgId=obj.minId-1;
            record.data=rData;
            return resolve(record);
        }
    })
},
/**
 * 去重
 * @param {*} rData 
 * @param {*} data1 
 */
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

/**
 * 消息更新
 * @param {*} sessionId 
 * @param {*} data 
 */
  updateMsg(sessionId,data){
    //更新数据库
    sessionId=Number(sessionId);
    friendDB.updatePrivateMsg(sessionId,data);
  },
  updateMsgBatch(sessionId,data){
    //更新数据库
    sessionId=Number(sessionId);
    friendDB.updatePrivateMsgBatch(sessionId,data);
  },

    /**
     * 获取网络请求资源
     * @param {*} userId 
     */
    getNetworkSession(userId){
        userId=Number(userId);
        return new Promise(resolve => {
            api.getTempFriendInfo({sessionId: userId}).then(data => {
                data.checked = false;
                data.nickName = data.notes || data.nickName || data.userName;
                if (data.avatar) data.headImg =  data.avatar;
                //else data.headImg = this.tempHeadImg;
                friendDB.updateFriend(userId,data);
                //更新当前session
                let currentSessionCache=store.state.currentSession;
                if(currentSessionCache){
                    if(currentSessionCache.paramId==userId){
                        currentSessionCache=JSON.parse(JSON.stringify(currentSessionCache))
                        currentSessionCache.name=data.nickName;
                        currentSessionCache.img=data.headImg;
                        store.commit('UPDATE_CURRENT_SESSION',currentSessionCache);
                    }
                }
                
                //更新sessionList
                let sessionCache=store.state.session.record[userId+'-0'];
                if(sessionCache){
                    sessionCache=JSON.parse(JSON.stringify(sessionCache))
                    sessionCache.name=data.nickName;
                    sessionCache.img=data.headImg;
                    store.commit("UPDATE_SESSION", sessionCache);
                }                
                return resolve(data);
            })
        })
    },
    /**
     * 获取网络好友请求配置信息
     * @param {*} userId 
     */
    getNetworkFriendInfo(userId){
        userId=Number(userId);
        return new Promise(resolve => {
            api.searchInfo({ids:userId}).then(data =>{
                data=data[0];
                data.checked = false;
                data.nickName = data.notes || data.nickName || data.userName;
                if (data.avatar) {
                    data.headImg =  data.avatar;
                }
                
                //else data.headImg = this.tempHeadImg;
                // friendDB.updateFriend(userId,data);
                store.commit("ADD_FRIEND_INFO", {userId,info:data});
                return resolve(data);
            })
        })
    },
      /**
   * 移除指定会话所有消息
   */
  removeMsgAll(sessionId){
    friendDB.removeMsgAll(sessionId);
  },
  /**
   * 移除指定消息
   */
  removeMsg(sessionId,mId,isAll){
    friendDB.removeMsg(sessionId,mId,isAll);
  },
  /**
   * 清空所有缓存数据
   */
  clearMsg(){
    friendDB.clearMsg();
  },
      /**
   * 定期清理
   * @param {*} sessionId 
   * @param {*} lastTime 
   * @param {*} cycle 
   */
  regularCleaning(sessionId, lastTime, cycle){
    friendDB.regularCleaning(sessionId, lastTime, cycle);
  },
  editMsg(sessionId, mId, content){
    friendDB.editMsg(sessionId,mId,content);
  },
  setReadMsgBySessionId(sessionId,maxReadId){
    friendDB.setReadMsgBySessionId(sessionId,maxReadId);
  },
  
  /**
   * 获取聊天信息
   * @param {*} sessionId 
   */
  getChatInfo(sessionId){
    //好友-非好友的区分？
    let chatInfo={};
    chatInfo.userId=sessionId;
    return new Promise(resolve => {
        this.getFriend(sessionId).then(data=>{
            if(data){
                chatInfo.headImg=data.headImg;
                chatInfo.nickName=data.nickName;
                chatInfo.isTop=data.isTop
                chatInfo.isInterruption=data.isInterruption
                chatInfo.isBanned=data.isBanned
                chatInfo.alias=data.alias || ''
                return resolve(chatInfo);
            }else{
                return resolve();
            }
        });
    })
  },
      /**
     * 获取本地消息
     * @param {*} sessionId 
     * @param {*} mId 
     */
    getLocalMsg(sessionId,mId){
        return new Promise(resolve => {
            friendDB.getLocalMsg(resolve,sessionId,mId);
        })
    },
    /**
     * 获取本地消息
     * @param {*} sessionId 
     * @param {*} mId 
     */
    getLocalImgAndVideo(sessionId){
        return new Promise(resolve => {
            friendDB.getLocalImgAndVideo(resolve,sessionId);
        })
    },
    vagueFind(keyWord){
        return new Promise(resolve => {
            friendDB.vagueFind(resolve,keyWord);
        })
    },
}