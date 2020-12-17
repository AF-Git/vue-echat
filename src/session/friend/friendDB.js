import { EchatDB } from "@/tools/indexedDB";
import { baseSession } from "../base"; 
import { Config } from "@/common/config"
export const friendDB = {
//好友信息
/**
   * 批量插入好友数据
   * @param { data } 好友json对象
   * @returns 
   */
  updateFriendBatch(data) {
    return new Promise((resolve, reject) => {
      let transaction = EchatDB.db.transaction(EchatDB.friendTN, 'readwrite');
      let store=transaction.objectStore(EchatDB.friendTN);
      store.clear();
      for(let key in data){
        if(key != 'undefined'){
          let item=data[key];
          item.checked = false;
          item.nickName = item.notes || item.nickName || item.userName;
          if (item.avatar) item.headImg =  item.avatar;
          //else item.headImg = this.tempHeadImg;
          //delete item['avatar'];
          delete item['isSecretChat'];
          delete item['publicKey'];
          store.put(item);
        }
      }
      resolve(data);
    })
  },
  /**
   * 读取本地好友数据..不算临时会话
   * @returns { promise } 所需的数据
   */
  readFriendAll() {
    return new Promise((resolve, reject) => {

      let stores = EchatDB.db.transaction(EchatDB.friendTN, 'readonly')
        .objectStore(EchatDB.friendTN)
        .index('state');

        let request=stores.openCursor(IDBKeyRange.only(1));
        let objList = [];
        request.onsuccess = event => {
          let cursor = event.target.result;
          if (cursor) {
            objList.push(cursor.value);
            cursor.continue();
          } else {
            return resolve(objList);;
          }
        }
        request.onerror = event =>{
          console.error(event);
        }
    })
  },
  readFriend(userId){
    return new Promise((resolve, reject) => {
      let request = EchatDB.db.transaction(EchatDB.friendTN, 'readonly')
        .objectStore(EchatDB.friendTN)
        .get(userId);

      request.onsuccess = event => {
        let objList = event.target.result;
        resolve(objList);
      }
    })
  },
  /**
   * 删除好友
   * @param {*} userId 
   */
  deleteFriend(userId) {
    userId=Number(userId);
    let stores = EchatDB.db.transaction(EchatDB.friendTN, 'readwrite')
      .objectStore(EchatDB.friendTN);
      stores.delete(userId);
  },
  /** 
   * 更新好友数据
   * @param { userId } 好友ID
   * @param { record } 好友信息
   * @returns 
   */
  updateFriend(userId, record) {
    userId=Number(userId);
    record.userId=userId
    let stores = EchatDB.db.transaction(EchatDB.friendTN, 'readwrite')
      .objectStore(EchatDB.friendTN);
      if(record.state!=1){
        //delete record['avatar'];
        delete record['imOfflineState'];
        delete record['imLogoutTime'];
        delete record['publicKey'];
        stores.put(record)
      }else{
        let request=stores.get(userId);
        request.onsuccess = event => {
          let userInfo = event.target.result;
          if(!userInfo){
            stores.put(record);
            return;
          }
          if(userInfo.headImg==record.headImg&&userInfo.nickName==record.nickName&&userInfo.state==record.state){
            return;
          }else{
            userInfo.state=record.state
            userInfo.headImg=record.headImg
            userInfo.nickName=record.nickName
            stores.put(userInfo)
          }
        }
      }


  },
  //好友信息end
  //单聊消息-------------- start---------------
  /**
   * 批量单聊消息更新
   * @param {*} userId 群ID
   * @param {*} record 消息集合
   */
  updatePrivateMsgBatch(userId, record) {
    userId=Number(userId);
    baseSession.updateMsgBatch(userId,record,EchatDB.msgPrivateTN);
  },

  /**
   * 单聊消息更新
   * @param {*} userId 群ID
   * @param {*} record 消息体
   */
  updatePrivateMsg(userId, record) {
      record.userId=Number(userId);
      baseSession.updateMsg(userId,record,EchatDB.msgPrivateTN);
  },
  /**
   * 
   * @param {*} userId 
   * @param {*} maxMsgId 查询的最大消息ID
   * @param {*} pageSize 
   */
  readPrivateMsgPage(userId,maxMsgId,pageSize){
    return new Promise((resolve, reject) => {
        baseSession.openCursorMsgPage(resolve,EchatDB.msgPrivateTN,userId,maxMsgId,pageSize);
    })
  },
  /**
   * 移除指定会话所有消息
   */
  removeMsgAll(sessionId){
    baseSession.removeMsgAll(EchatDB.msgPrivateTN,sessionId);
  },
  /**
   * 移除指定消息
   */
  removeMsg(sessionId,mId,isAll){
    baseSession.removeMsg(EchatDB.msgPrivateTN,sessionId,mId,isAll);
  },
  /**
   * 清空所有缓存数据
   */
  clearMsg(){
    baseSession.clearMsg(EchatDB.msgPrivateTN);
  },
    /**
   * 定期清理
   * @param {*} sessionId 
   * @param {*} lastTime 
   * @param {*} cycle 
   */
  regularCleaning(sessionId, lastTime, cycle){
    baseSession.regularCleaning(sessionId, lastTime, cycle, EchatDB.msgPrivateTN);
  },
  editMsg(sessionId, mId, content){
    baseSession.editMsg(sessionId,mId,content,EchatDB.msgPrivateTN);
  },
  setReadMsgBySessionId(sessionId,maxReadId){
    baseSession.setReadMsgBySessionId(sessionId,EchatDB.msgPrivateTN,maxReadId);
  },
  //单聊消息---------------- end ------------
        /**
     * 获取本地消息
     * @param {*} sessionId 
     * @param {*} mId 
     */
    getLocalMsg(resolve,sessionId,mId){
        baseSession.getLocalMsg(resolve,sessionId,mId,EchatDB.msgPrivateTN);
    },
      /**
   * 获取本地音视频文件
   * @param {*} resolve 
   * @param {*} sessionId 
   */
getLocalImgAndVideo(resolve,sessionId){
    baseSession.getLocalMsgByType(resolve,sessionId,[3,5],EchatDB.msgPrivateTN); 
},
vagueFind(resolve,keyWord){
  baseSession.vagueFind(resolve,keyWord,EchatDB.msgPrivateTN); 
}
}