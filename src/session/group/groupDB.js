import { EchatDB } from "@/tools/indexedDB";
import { baseSession } from "../base"; 
export const groupDB = {
//群消息 -----------start ---------------------------
  /**
   * 批量群消息更新
   * @param {*} userId 群ID
   * @param {*} record 消息集合
   */
  updateGroupMsgBatch(userId, record) {
    userId=Number(userId);
    baseSession.updateMsgBatch(userId,record,EchatDB.msgGroupTN);
  },
  /**
   * 群消息更新
   * @param {*} userId 群ID
   * @param {*} record 消息体
   */
  updateGroupMsg(userId, record) {
      record.userId=Number(userId);
      baseSession.updateMsg(userId,record,EchatDB.msgGroupTN);
  },
  /**
   * 分页查询
   * @param {*} userId 
   * @param {*} maxMsgId 查询的最大消息ID
   * @param {*} pageSize 
   */
  readGroupMsgPage(userId,maxMsgId,pageSize){
    return new Promise((resolve, reject) => {
        baseSession.openCursorMsgPage(resolve,EchatDB.msgGroupTN,userId,maxMsgId,pageSize);
    })
  },
//群消息 -----------end ---------------------------
//群信息DB  ---start -------------
  /**
   * 批量插入群数据
   * @param { data } 群json对象
   * @returns 
   */
  updateGroupBatch(data) {
    return new Promise((resolve, reject) => {
      let transaction = EchatDB.db.transaction(EchatDB.groupTableName, 'readwrite');
      let store=transaction.objectStore(EchatDB.groupTableName);

      for(var key in data){
        if(key != 'undefined'){
          store.put(data[key]);
        }
      }
      resolve();
    })
  },
  /**
   * 读取本地群数据
   * @returns { promise } 所需的数据
   */
  readGroupAll() {
    return new Promise((resolve, reject) => {
      let stores = EchatDB.db.transaction(EchatDB.groupTableName, 'readonly')
        .objectStore(EchatDB.groupTableName);

        let request=stores.openCursor();
        let objList=new Array;
        request.onsuccess = event => {
          let cursor = event.target.result;
          if(cursor){
            objList.push(cursor.value);
            cursor.continue();
          }else{
            resolve(objList);
          }
        }
        request.onerror = event =>{
          console.error(event);
        }
    })
  },
  /**
   * 获取指定群信息
   * @param {*} groupId 
   */
  readGroup(groupId){
    return new Promise((resolve, reject) => {
      let request = EchatDB.db.transaction(EchatDB.groupTableName, 'readonly')
        .objectStore(EchatDB.groupTableName)
        .get(groupId);

      request.onsuccess = event => {
        let objList = event.target.result;
        resolve(objList);
      }
      request.onerror = event =>{
        console.error(event);
      }
    })
  },
  /** 
   * 更新群数据
   * @param { groupId } 群聊ID
   * @param { record } 群信息
   * @returns 
   */
  updateGroup(record) {
    try {
      let stores = EchatDB.db.transaction(EchatDB.groupTableName, 'readwrite')
      .objectStore(EchatDB.groupTableName).put(record);
    } catch (error) {
      console.error(error,record)
    }
    
  },
  /**
   * 清空所有群
   */
  clearGroup(){
      let stores = EchatDB.db.transaction(EchatDB.groupTableName, 'readwrite')
      .objectStore(EchatDB.groupTableName);
      stores.clear();
  },
//群信息DB  ---end ---------------

  //群成员DB ---start-------------
  /**
   * 读取本地群成员数据
   * @returns { promise } 所需的数据
   */
  readGroupMember(groupId) {
    return new Promise((resolve, reject) => {
      let stores = EchatDB.db.transaction("group_member", 'readonly')
        .objectStore("group_member")
        .index("groupId");
      let request=stores.openCursor(IDBKeyRange.only(groupId));
      let members={};
      request.onsuccess = event => {
        let cursor = event.target.result;
        if(cursor){
          let cache=cursor.value;
          members[cache.userId]=cache;
          cursor.continue();
        }else{
          resolve(members);
        }
      }
      request.onerror = event =>{
        console.error(event);
      }
    })
  },
  /** 
   * 更新群成员数据
   * @param { record } 群成员集合信息对象
   * @returns 
   */
  updateGroupMember(record) {
    let store = EchatDB.db.transaction('group_member', 'readwrite')
      .objectStore('group_member');
    for(var key in record){
      let c=record[key];
      try {
        let stores=store.index('goupIdAndUserId')
        let dbKeyRange=IDBKeyRange.only([c.groupId,c.userId]);
        this.updateGroupMemberNormal(store,stores,c,dbKeyRange);
      } catch (error) {
        let stores=store.index('groupId')
        let dbKeyRange=IDBKeyRange.only(c.groupId);
        this.updateGroupMemberIE(store,stores,c,dbKeyRange);
      }
    }
  },
  updateGroupMemberNormal(store,stores,c,dbKeyRange){
    let request=stores.openCursor(dbKeyRange);
    request.onsuccess = event => {
      let cursor = event.target.result;
      if(cursor){
        return cursor.update(c);
      }else{
        store.put(c);
        return;
      }
    }
    request.onerror = event =>{
      console.error(event);
    }
  },
  updateGroupMemberIE(store,stores,c,dbKeyRange){
    let request=stores.openCursor(dbKeyRange);
    request.onsuccess = event => {
      let cursor = event.target.result;
      if(cursor){
        let value=cursor.value;
        if(value.userId==c.userId){
          return cursor.update(c);
        }
        cursor.continue();
      }else{
        store.put(c);
        return;
      }
    }
    request.onerror = event =>{
      console.error(event);
    }
  },
  /** 
   * 更新单个群成员信息
   * @param { record } 群成员信息
   * @returns 
   */
  updateMemberInfo(record) {
    try {
      let dbKeyRange=IDBKeyRange.only([record.groupId,record.userId])
      this.updateMemberInfoNormal(record,dbKeyRange);
    } catch (error) {
      let dbKeyRange=IDBKeyRange.only(record.groupId)
      this.updateMemberInfoIE(record,dbKeyRange);
    }
  },
  updateMemberInfoNormal(record,dbKeyRange){
    let store = EchatDB.db.transaction('group_member', 'readwrite')
      .objectStore('group_member');
    let stores=store.index('goupIdAndUserId')
    let request=stores.openCursor(dbKeyRange);

    request.onsuccess = event => {
      let cursor = event.target.result;
      if(cursor){
        return cursor.update(record);
      }else{
        store.put(record);
        return;
      }
    }
    request.onerror = event =>{
      console.error(event);
    }
  },
  updateMemberInfoIE(record,dbKeyRange){
    let store = EchatDB.db.transaction('group_member', 'readwrite')
      .objectStore('group_member');
    let stores=store.index('groupId')
    let request=stores.openCursor(dbKeyRange);

    request.onsuccess = event => {
      let cursor = event.target.result;
      if(cursor){
        let value=cursor.value;
        if(value.groupId==record.userId){
          return cursor.update(record);
        }
        cursor.continue();
      }else{
        store.put(record);
        return;
      }
    }
    request.onerror = event =>{
      console.error(event);
    }
  },
/**
 * 读取指定群中指定成员信息
 * @param {int} groupId 群ID
 * @param {int} userId 成员ID
 */
readGroupMemberInfo(groupId,userId) {
  return new Promise((resolve, reject) => {
    try {
      let dbKeyRange=IDBKeyRange.only([groupId,userId])
      this.readGroupMemberInfoNormal(resolve,dbKeyRange);
    } catch (error) {
      let dbKeyRange=IDBKeyRange.only(groupId);
      this.readGroupMemberInfoIE(resolve,userId,dbKeyRange);
    }
  })
},
readGroupMemberInfoNormal(resolve,dbKeyRange){
  let store = EchatDB.db.transaction("group_member", 'readonly')
  .objectStore("group_member").index('goupIdAndUserId');
  let request=store.openCursor(dbKeyRange);

  request.onsuccess = event => {
    let cursor = event.target.result;
    if(cursor){
      return resolve(cursor.value);
    }else{
      resolve();
    }
  }
  request.onerror = event =>{
    console.error(event);
  }
},
readGroupMemberInfoIE(resolve,userId,dbKeyRange){
  let store = EchatDB.db.transaction("group_member", 'readonly')
  .objectStore("group_member").index('groupId');
  let request=store.openCursor(dbKeyRange);

  request.onsuccess = event => {
    let cursor = event.target.result;
    if(cursor){
      let value=cursor.value;
      if(value.userId==userId){
        return resolve(value);
      }
      cursor.continue();
    }else{
      resolve();
    }
  }
  request.onerror = event =>{
    console.error(event);
  }
},
//群成员DB ---end ----------------
  /**
   * 移除指定会话所有消息
   */
  removeMsgAll(sessionId){
    baseSession.removeMsgAll(EchatDB.msgGroupTN,sessionId);
  },
  /**
   * 移除指定消息
   */
  removeMsg(sessionId,mId,isAll){
    baseSession.removeMsg(EchatDB.msgGroupTN,sessionId,mId,isAll);
  },
  /**
   * 清空所有缓存数据
   */
  clearMsg(){
    baseSession.clearMsg(EchatDB.msgGroupTN);
  },
    /**
   * 定期清理
   * @param {*} sessionId 
   * @param {*} lastTime 
   * @param {*} cycle 
   */
  regularCleaning(sessionId, lastTime, cycle){
    baseSession.regularCleaning(sessionId, lastTime, cycle, EchatDB.msgGroupTN);
  },
  editMsg(sessionId, mId, content){
    baseSession.editMsg(sessionId,mId,content,EchatDB.msgGroupTN);
  },
  setReadMsgBySessionId(sessionId,maxReadId){
    baseSession.setReadMsgBySessionId(sessionId,EchatDB.msgGroupTN,maxReadId);
  },
  /**
   * 设置已读数量
   * @param {*} sessionId 
   */
  setReadNumBySessionId(sessionId,mId,num){
    let stores = EchatDB.db.transaction(EchatDB.msgGroupTN, 'readwrite')
    .objectStore(tabelName);
      stores=stores.index("sessionIdAndMid");
      let dbKeyRange=IDBKeyRange.only([sessionId,mId])
      let request=stores.openCursor(dbKeyRange);
      request.onsuccess = event => {
        let cursor = event.target.result;
        if (cursor) {
          let data=cursor.value;
          data.readNum=num;
          cursor.update(data);
          return ;
        } else {
          return ;
        }
      }
      request.onerror = event =>{
        console.error(event);
      }
    
  },
  /**
 * 移除指定群所有成员
 * @param {*} groupId 
 */
removeGroupMembers(groupId){
  return new Promise((resolve, reject) => {
    let stores = EchatDB.db.transaction("group_member", 'readwrite')
    .objectStore("group_member")
    .index("groupId");
      let request=stores.openCursor(IDBKeyRange.only(groupId));
      request.onsuccess = event => {
        let cursor = event.target.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          return resolve();
        }
      }
      request.onerror = event =>{
        console.error(event);
      }
  })
  
},

/**
 * 移除指定群，指定成员
 * @param {*} sessionId 
 * @param {*} memberId 
 */
removeGroupMember(groupId,userId){
  try {
    let dbKeyRange=IDBKeyRange.only([groupId,userId]);
    this.removeGroupMemberNormal(dbKeyRange);
  } catch (error) {
    let dbKeyRange=IDBKeyRange.only(groupId);
    this.removeGroupMemberIE(userId,dbKeyRange);
  }
},
removeGroupMemberNormal(dbKeyRange){
  let store = EchatDB.db.transaction("group_member", 'readonly')
  .objectStore("group_member").index('goupIdAndUserId');
    let request=store.openCursor(dbKeyRange);
    request.onsuccess = event => {
      let cursor = event.target.result;
      if (cursor) {
        return cursor.delete();
      } else {
        return ;
      }
    }
    request.onerror = event =>{
      console.error(event);
    }
},
removeGroupMemberIE(userId,dbKeyRange){
  let store = EchatDB.db.transaction("group_member", 'readonly')
  .objectStore("group_member").index('groupId');
    let request=store.openCursor(dbKeyRange);
    request.onsuccess = event => {
      let cursor = event.target.result;
      if (cursor) {
        let value=cursor.value;
        if(value.userId==userId){
          return cursor.delete();
        }
        cursor.continue();
      } else {
        return ;
      }
    }
    request.onerror = event =>{
      console.error(event);
    }
},
/**
 * 移除指定群
 * @param {*} sessionId 
 */
removeGroup(sessionId){
  let transaction = EchatDB.db.transaction(EchatDB.groupTableName, 'readwrite');
  let store=transaction.objectStore(EchatDB.groupTableName);
  store.delete(sessionId);
},
/**
 * 获取本地消息
 * @param {*} sessionId 
 * @param {*} mId 
 */
getLocalMsg(resolve,sessionId,mId){
    baseSession.getLocalMsg(resolve,sessionId,mId,EchatDB.msgGroupTN);
},
  /**
   * 获取本地音视频文件
   * @param {*} resolve 
   * @param {*} sessionId 
   */
getLocalImgAndVideo(resolve,sessionId){
  baseSession.getLocalMsgByType(resolve,sessionId,[3,5],EchatDB.msgGroupTN); 
},
vagueFind(resolve,keyWord){
  baseSession.vagueFind(resolve,keyWord,EchatDB.msgGroupTN); 
}
}