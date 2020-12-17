/**
 * 消息管理器
 * 
 */
import { group } from "@/session/group";
import { service } from "@/session/service";
import { friend } from "@/session/friend";
import { api } from "../api";
import Msg from '@/tools/msg'
import store from "@/store";
import { sessionUtil } from "@/session/sessionUtil";

export const msgManager = {
  activeId:0,//当前活跃ID
/**
 * 获取消息
 * @param {*} fromType 
 * @param {*} sessionId 
 * @param {*} maxMsgId 
 * @param {*} firstMsgId 
 * @param {boolean} isMore 是否上拉加载
 * @param {*} pageSize 
 */
    getMsg(fromType,sessionId,maxMsgId,firstMsgId,isMore,pageSize=20){
        fromType=Number(fromType);
        sessionId=Number(sessionId);
        // if(this.activeId==sessionId){
        if(isMore){
          maxMsgId--;
        }else{
            this.activeId=sessionId;
        }
        return new Promise(resolve => {
            if(fromType==0){
              //单聊消息
              friend.getMsg(sessionId,maxMsgId,firstMsgId,pageSize).then(data => {
                resolve(data);
              });
            }else if(fromType==1){
              //群聊消息
              group.getMsg(sessionId,maxMsgId,firstMsgId,pageSize).then(data => {
                resolve(data);
              });
            }else if(fromType==2){
              //服务号消息
              service.getMsg(sessionId,maxMsgId,firstMsgId,pageSize).then(data => {
                resolve(data);
              });
            }else{              
              resolve();
            }
        })
    },

    /**
     * 更新指定消息
     * @param {*} fromType 会话类型
     * @param {*} sessionId 会话ID
     * @param {*} data 消息
     */
    updateMsg(fromType,sessionId,data){
        fromType=Number(fromType);
        sessionId=Number(sessionId);
        if(fromType==0){
        //单聊消息
            friend.updateMsg(sessionId,data);
        }else if(fromType==1){
        //群聊消息
            group.updateMsg(sessionId,data);
        }else if(fromType==2){
        //服务号消息
            service.updateMsg(sessionId,data);
        }else{
            
        }
    },
    updateMsgBatch(fromType,sessionId,data){
      fromType=Number(fromType);
      sessionId=Number(sessionId);
      if(fromType==0){
      //单聊消息
          friend.updateMsgBatch(sessionId,data);
      }else if(fromType==1){
      //群聊消息
          group.updateMsgBatch(sessionId,data);
      }else if(fromType==2){
      //服务号消息
          service.updateMsgBatch(sessionId,data);
      }else{
          
      }
  },
   /**
   * 移除指定会话所有消息
   */
  removeMsgAll(fromType,sessionId){
    fromType=Number(fromType);
    sessionId=Number(sessionId);
    if(fromType==0){
    //单聊消息
        friend.removeMsgAll(sessionId);
    }else if(fromType==1){
    //群聊消息
        group.removeMsgAll(sessionId);
    }else if(fromType==2){
    //服务号消息
        service.removeMsgAll(sessionId);
    }else{
        
    }
  },
  /**
   * 移除指定消息
   */
  removeMsg(fromType,sessionId,mId,isAll){
    fromType=Number(fromType);
    sessionId=Number(sessionId);
    mId=Number(mId);
    if(fromType==0){
    //单聊消息
        friend.removeMsg(sessionId,mId,isAll);
    }else if(fromType==1){
    //群聊消息
        group.removeMsg(sessionId,mId,isAll);
    }else if(fromType==2){
    //服务号消息
        service.removeMsg(sessionId,mId,isAll);
    }else{
        
    }
  },
  /**
   * 清空所有缓存数据
   */
  clearMsg(fromType){
    fromType=Number(fromType);
    if(fromType==0){
    //单聊消息
        friend.clearMsg();
    }else if(fromType==1){
    //群聊消息
        group.clearMsg();
    }else if(fromType==2){
    //服务号消息
        service.clearMsg();
    }else{
        
    }
  },
    /**
   * 定期清理
   * @param {*} sessionId 
   * @param {*} lastTime 
   * @param {*} cycle 
   */
  regularCleaning(fromType,sessionId, lastTime, cycle){
    fromType=Number(fromType);
    sessionId=Number(sessionId);
    if(fromType==0){
    //单聊消息
        friend.regularCleaning(sessionId, lastTime, cycle);
    }else if(fromType==1){
    //群聊消息
        group.regularCleaning(sessionId, lastTime, cycle);
    }else if(fromType==2){
    //服务号消息
        service.regularCleaning(sessionId, lastTime, cycle);
    }else{
        
    }
  },
  /**
   * 消息编辑
   * @param {*} fromType 
   * @param {*} sessionId 
   * @param {*} mId 
   * @param {*} content 
   */
  editMsg(fromType,sessionId, mId, content){
    fromType=Number(fromType);
    sessionId=Number(sessionId);
    mId=Number(mId);
    if(fromType==0){
    //单聊消息
        friend.editMsg(sessionId,mId,content);
    }else if(fromType==1){
    //群聊消息
        group.editMsg(sessionId,mId,content);
    }else if(fromType==2){
    //服务号消息
        service.editMsg(sessionId,mId,content);
    }else{
        
    }
  },
  setReadMsgBySessionId(fromType,sessionId,maxReadId){
    fromType=Number(fromType);
    sessionId=Number(sessionId);
    if(fromType==0){
        //单聊消息
        friend.setReadMsgBySessionId(sessionId,maxReadId);
    }else if(fromType==1){
        //群聊消息
        group.setReadMsgBySessionId(sessionId,maxReadId);
    }else if(fromType==2){
        //服务号消息
        service.setReadMsgBySessionId(sessionId,maxReadId);
    }else{
        
    }
  },
  
  /**
   * 获取除指令外的断层消息
   * @param {*} differNum 断层数量
   * @param {*} msgInitialId 起始ID
   */
  getFaultMsg(differNum,msgInitialId,fromId,fromType){
    let msgStr = "";
    msgInitialId=Number(msgInitialId);
    for (let i = 1; i < differNum; i++) {
      msgStr = msgStr + (msgInitialId+i) + ",";
    }
    let obj = {
      sessionUserId: fromId,
      type: fromType,
      msgId: msgStr.replace(/,$/, "")
    };
    this.getFaultMsgHttp(obj);
  },
  getFaultMsgHttp(obj){
    let fromType=obj.type;
    let fromId=obj.sessionUserId;
    let cacheStr=JSON.stringify(obj);//用于缓存失败信息
    //假如接口失败怎么办？
    api.getOrders(obj).then(data => {
      if(data!=undefined&&data.length>0){
        Msg.chatHistoryInit(data,fromType,fromId).then(list=>{
          let maxId=-1;
          let currentSession=store.state.currentSession;
          switch (fromType) {
            case 0:
              friend.updateMsgBatch(fromId,list);
              if(fromType==currentSession.fromType&&fromId==currentSession.paramId){
                this.showPage(list);
              }
              break;
            case 1:
              group.fillFaultMsg(fromId,list).then(data=>{
                if(fromType==currentSession.fromType&&fromId==currentSession.paramId){
                  this.showPage(data);
                }
              });
              break;
            case 2:
              service.updateMsgBatch(fromId,list);
              if(fromType==currentSession.fromType&&fromId==currentSession.paramId){
                this.showPage(list);
              }
              break;
            default:
              break;
          }
          for(let key in list){
            let msgItem=list[key];
            if(msgItem.mId>maxId){
              maxId=msgItem.mId;
            }
          }
          if(maxId>-1){
            let sessionCache=store.state.session.record[fromId+'-'+fromType];
            if(sessionCache){
              sessionCache.msgInitialId=maxId+1;
            }
          }
        });
      }
    },()=>{
      //接口调用失败
      //存储到Locastore中
      sessionUtil.setMsgFindFailLocalSession(cacheStr);
    }
    );
  },

  showPage(list){
   let userId = store.state.userInfo.userId
   let messages = store.state.message;
   let cacheMessages={};
   for(let key in messages){
     if(key>1000000000){
       cacheMessages[key]=messages[key];
     }
   }
    for(let key in list){
      let msgItem=list[key];
      if(msgItem.bodyFrom==userId){
        for(let key1 in cacheMessages){
          let cache=cacheMessages[key1];
          if(msgItem.bodyContent==cache.bodyContent){
            store.commit("DELETE_MESSAGE", key1);
            delete cacheMessages[key1];
            break;
          }
        }
      }
      let history = {
        bodyContent: msgItem.bodyContent,
        msgContent: msgItem.msgContent,
        bodyFrom:  msgItem.bodyFrom,
        bodyTime: msgItem.bodyTime,
        bodyType: msgItem.bodyType,
        preview: msgItem.preview,
        mId: msgItem.mId,
        createTime: msgItem.bodyTime,
        checked: false,
        chatInfo:msgItem.chatInfo,
        noChatInfo:msgItem.noChatInfo
      };
      store.commit("UPDATE_MESSAGE", history);
    }
  },
  /**
   * 获取本地消息
   * @param {*} fromType 
   * @param {*} sessionId 
   * @param {*} mId 
   */
  getLocalMsg(fromType,sessionId,mId){
    fromType=Number(fromType);
    sessionId=Number(sessionId);
    mId=Number(mId);
    return new Promise(resolve => {
      if(fromType==0){
        //单聊消息
        friend.getLocalMsg(sessionId,mId).then(data=>{
          resolve(data);
        });
      }else if(fromType==1){
          //群聊消息
          group.getLocalMsg(sessionId,mId).then(data=>{
            resolve(data);
          });
      }else if(fromType==2){
          //服务号消息
          service.getLocalMsg(sessionId,mId).then(data=>{
            resolve(data);
          });
      }else{
        resolve();
      }
    })

  },
  /**
 * 获取本地消息
 * @param {*} sessionId 
 * @param {*} mId 
 */
  getLocalImgAndVideo(fromType,sessionId){
    fromType=Number(fromType);
    sessionId=Number(sessionId);
    return new Promise(resolve => {
      if(fromType==0){
        //单聊消息
        friend.getLocalImgAndVideo(sessionId).then(data=>{
          resolve(data);
        });
      }else if(fromType==1){
          //群聊消息
          group.getLocalImgAndVideo(sessionId).then(data=>{
            resolve(data);
          });
      }else if(fromType==2){
          //服务号消息
          service.getLocalImgAndVideo(sessionId).then(data=>{
            resolve(data);
          });
      }else{
        resolve();
      }
    })
  },
/**
 * 模糊搜索
 * @param {*} keyWord 关键字
 * @param {function } callback 回调函数
 */
  vagueFind(keyWord,callback){
    
    //单聊消息
    friend.vagueFind(keyWord).then(data=>{
      callback(data,0);
    });
    //群聊消息
    group.vagueFind(keyWord).then(data=>{
      callback(data,1);
    });
    //服务号消息
    service.vagueFind(keyWord).then(data=>{
      callback(data,2);
    });
  },


/**
 * 跳转到指定消息ID
 * @param {*} fromType 
 * @param {*} sessionId 
 * @param {*} maxMsgId 
 * @param {*} firstMsgId 
 * @param {*} specifyMsgId 
 * @param {*} callback 
 */
skipSpecifyMsg(fromType,sessionId,maxMsgId,firstMsgId,specifyMsgId,callback){
    fromType=Number(fromType);
    sessionId=Number(sessionId);
    if(this.activeId==sessionId){
      maxMsgId--;
    }else{
        this.activeId=sessionId;
    }
    let pageSize=30;
    if(fromType==0){
      //单聊消息
      friend.getMsg(sessionId,maxMsgId,firstMsgId,pageSize).then(data => {
        this.skipSpecifyMsgTwo(fromType,sessionId,firstMsgId,specifyMsgId,data,callback)
      });
    }else if(fromType==1){
      //群聊消息
      group.getMsg(sessionId,maxMsgId,firstMsgId,pageSize).then(data => {
        this.skipSpecifyMsgTwo(fromType,sessionId,firstMsgId,specifyMsgId,data,callback)
      });
    }else if(fromType==2){
      //服务号消息
      service.getMsg(sessionId,maxMsgId,firstMsgId,pageSize).then(data => {
        this.skipSpecifyMsgTwo(fromType,sessionId,firstMsgId,specifyMsgId,data,callback)
      });
    }
},

skipSpecifyMsgTwo(fromType,sessionId,firstMsgId,specifyMsgId,record,callback){
  if(specifyMsgId<=record.firstMsgId&&record.firstMsgId>1){
    specifyMsgId=record.firstMsgId;
    //不在循环
    callback(record);
    return;
  }
  let data=record.data;
  let miniMsgId;
  if(data!=undefined){
    if(data.constructor==Array&&data.length>0){
      miniMsgId=data[data.length-1].mId;
    }else{
      let cData=Object.values(data);
      cData.sort((a, b) => b.bodyTime - a.bodyTime);//倒叙
      let b=cData[cData.length-1];
      if(b!=undefined){
        miniMsgId=b.mId;
      }
    }
    if(miniMsgId!=undefined){
      callback(record);
      if(specifyMsgId<miniMsgId){
        this.skipSpecifyMsg(fromType,sessionId,miniMsgId,firstMsgId,specifyMsgId,callback);
      }
    }
  }
},



}