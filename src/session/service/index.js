import { api } from "@/api";
import store from "@/store";
import { serviceDB } from "./serviceDB"; 
export const service = {
    sessionType:2,
    activeLength:0,//当前活跃长度
/**
   * 获取服务号消息
   * @param {*} sessionId 服务号ID
   * @param {*} maxMsgId 查询的最大消息ID
   * @param {*} firstMsgId 截止ID
   * @param {*} pageSize 页面大小
   * @returns  {firstMsgid:1,data:data} 数据集
   */
  getMsg(sessionId,maxMsgId,firstMsgId,pageSize=20){
    sessionId=Number(sessionId);
    maxMsgId=Number(maxMsgId);
    firstMsgId=Number(firstMsgId);

    return new Promise(resolve => {
        if(maxMsgId!=null&&maxMsgId<=firstMsgId){
            return resolve({firstMsgId:firstMsgId,paramId:sessionId,fromType:this.sessionType});
        }

        serviceDB.readServiceMsgPage(sessionId,maxMsgId,pageSize).then(data => {
            let record={firstMsgId:firstMsgId,
                paramId:sessionId,
                fromType:this.sessionType};
            if(data.length==0){
                //获取接口
                let obj = {
                    sessionUserId: sessionId,
                    type: this.sessionType,
                    minId: maxMsgId,
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
 * 消息更新
 * @param {*} sessionId 
 * @param {*} data 
 */
updateMsg(sessionId,data){
    //更新数据库
    sessionId=Number(sessionId);
    serviceDB.updateServiceMsg(sessionId,data);
  },

  updateMsgBatch(sessionId,data){
    //更新数据库
    sessionId=Number(sessionId);
    serviceDB.updateServiceMsgBatch(sessionId,data);
  },
  /**
   * 移除指定会话所有消息
   */
  removeMsgAll(sessionId){
    serviceDB.removeMsgAll(sessionId);
  },
  /**
   * 移除指定消息
   */
  removeMsg(sessionId,mId,isAll){
    serviceDB.removeMsg(sessionId,mId,isAll);
  },
  /**
   * 清空所有缓存数据
   */
  clearMsg(){
    serviceDB.clearMsg();
  },
    /**
   * 定期清理
   * @param {*} sessionId 
   * @param {*} lastTime 
   * @param {*} cycle 
   */
  regularCleaning(sessionId, lastTime, cycle){
    serviceDB.regularCleaning(sessionId, lastTime, cycle);
  },
  editMsg(sessionId, mId, content){
    serviceDB.editMsg(sessionId,mId,content);
  },
  setReadMsgBySessionId(sessionId,maxReadId){
    serviceDB.setReadMsgBySessionId(sessionId,maxReadId);
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
              serviceDB.updateServiceMsgBatch(sessionId,cache);
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
     * 获取服务号信息
     * @param {*} sessionId 
     */
    getChatInfo(sessionId){
        let chatInfo={};
        chatInfo.userId=sessionId;
        switch(sessionId) {
            case 1000150:
                chatInfo.headImg="./static/images/logo.png";
                chatInfo.nickName="EchatAPP";
            break;
            case 1000100:
                chatInfo.headImg="./static/images/chat/img-pay.png";
                chatInfo.nickName="EchatAPP Pay";
            break;
            default:
            return;
        }
        return chatInfo;
    },
    /**
     * 获取本地消息
     * @param {*} sessionId 
     * @param {*} mId 
     */
    getLocalMsg(sessionId,mId){
        return new Promise(resolve => {
            serviceDB.getLocalMsg(resolve,sessionId,mId);
        })
    },
    /**
     * 获取本地消息
     * @param {*} sessionId 
     * @param {*} mId 
     */
    getLocalImgAndVideo(sessionId){
        return new Promise(resolve => {
            serviceDB.getLocalImgAndVideo(resolve,sessionId);
        })
    },
    vagueFind(keyWord){
        return new Promise(resolve => {
            serviceDB.vagueFind(resolve,keyWord);
        })
    },
}