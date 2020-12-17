import { face, faceCodeMap } from "./emoji";
import { api } from "../api";
import store from "../store";
import { localStore } from "./localStorage";
import { MessageHandler } from "./messageHandler";

import { msgManager } from "@/session/msgManager";
import { sessionInfo } from "@/session/sessionInfo";

import {msgFormatTemplate} from "@/session/msgFormatTemplate";

let _vioceReady = true;
let lang = null;
let _langIdx = 0;

if (localStorage.lang == "en_US") _langIdx = 1;
if (localStorage.lang == "my") _langIdx = 2;

const messageParse = {

  /**
   * 聊天消息格式化
   * @param {*} list 
   * @param {*} fromType 当前会话类型
   * @param {*} paramId 当前会话ID
   */
  chatHistoryInit(list,fromType,paramId) {

    // let info = JSON.parse(JSON.stringify(store.getters.currentSession)), //不用强拷贝可能导致窗口打不开
    return new Promise(resolve => {
      if(list.length==0){
        return resolve();
      }
      msgFormatTemplate.formatMsgList(fromType,paramId,list).then(msgJson=>{
        resolve(msgJson);
      });
    })
  },

  /**
   * 初始化会话列表
   * @param {array} list 
   */
  chatListInit(list) {
    let session = store.state.session.record;
    for (let i = 0; i < list.length; i++) {
      let item = list[i];
      if (item.fromType == 10) {
        this.orderHandler(item);
        continue;
      }
      if (item.fromType == 2 && item.fromId != 1000150) continue;
      
      //删除聊天记录的数据处理
      if (!item.msg) {
        sessionInfo.getChatInfo(item.fromType, item.fromId).then(chatInfo=>{
          let msgItem=this.msgTemplate(item, { bodyType:1, preview:'' }, chatInfo);
          store.commit("UPDATE_SESSION", msgItem);
        })
        continue;
      }

      let body = JSON.parse(item.msg);

      //跳过17、没有bodyContent的消息
      if (body.bodyType == 17 || !body.bodyContent) continue; 

      msgFormatTemplate.formatMsgNew(item.fromType, item.fromId, body).then(msgItem=>{
        if(!msgItem) return;
        msgItem=JSON.parse(JSON.stringify(msgItem))
        msgItem.mId=item.mId;
        this.updateChatHandler(
          session[item.fromId+'-'+item.fromType],item.fromType,
          item.fromId,
          item.mId,
          body,msgItem.preview,
          true
          ).then(msgItem1=>{
            msgItem1.lastReadId=item.lastReadId;
            let n=msgItem1.mId-msgItem1.lastReadId;
            msgItem1.unreadNum= n>0?n:0;
            store.commit("UPDATE_SESSION", msgItem1);
          })
          //  msgManager.updateMsg(item.fromType,item.fromId,msgItem);
        ///end
      });

    }
  },

  //格式化会话消息模板
  msgTemplate(item, msgItem, chatInfo) {
    let newItem = {
      img: chatInfo.headImg,
      lastReadId: item.lastReadId,
      mId: item.mId,
      alias: item.alias || '',
      fromType: item.fromType,
      msgType: msgItem.bodyType,
      name: chatInfo.nickName,
      paramId: +item.fromId,
      preview: msgItem.preview,
      userTime: item.createTime,
      temp:false,
      menuBox:[],
      menuSelect:[],
      isTop: chatInfo.isTop,
      isInterruption: chatInfo.isInterruption,
      isShowMemberNick: chatInfo.isShowMemberNick,
      isBanned: chatInfo.isBanned,
      isFriend: chatInfo.isFriend,
      isForbidChat: chatInfo.isForbidChat,
      describe: chatInfo.describe,
      unreadNum:item.mId-item.lastReadId, /**未读消息 */
      isActivity:false,
      msgInitialId:item.mId
    };
    newItem.unreadNum=newItem.unreadNum>0?newItem.unreadNum:0 ;
    return newItem;
  },

  updateChat(msgObj) {
    let session = store.state.session.record,
      fromType=msgObj.fromType,
      userId = msgObj.userId,
      body = JSON.parse(msgObj.msgContent), //消息体
      mId = msgObj.msgId;
      
    let cacheSession= session[userId+'-'+fromType];
    //消息ID为时间戳 过滤非序列化消息
    if (mId.length > 12 && body.bodyType != 25 && body.bodyType != 31 && body.bodyType != 19) return;

    if (body.bodyType == 31) { 
      mId = cacheSession.paramId;}

    if (body.bodyType == 19 && cacheSession && mId.length > 12) {
      mId = cacheSession.mId + 1;
    }

    if (userId == "10000") userId = body.bodyFrom;

    if (body.bodyType == 19) {
      if (!(typeof body.bodyContent == "object")) {
        body.bodyContent = JSON.parse(body.bodyContent);
      }
      if (body.bodyContent.type == 30) return;
    }

    //过滤mId小于lastReadId
    if (cacheSession && mId < cacheSession.lastReadId) return;

    msgFormatTemplate.formatMsgNew(fromType, userId, body).then(msgItem=>{
      msgItem.mId=mId;
      
      this.updateHistory(msgObj,msgItem);
      if (Number(msgItem.bodyType) == 31) {
        //拒收消息不更新会话列表
        return;
      }
      this.updateChatHandler(
        session[userId+'-'+fromType],fromType,
        userId,
        mId,
        body,msgItem.preview
        ).then(msgItem=>{
          this.fromatChatListInfo(msgItem,body)
          store.commit("UPDATE_SESSION", msgItem);//更新会话列表
        })
        //  msgManager.updateMsg(fromType,userId,msgItem);
      ///end
    });
  },
  
  /**
   * 更新会话列表
   * @param {*} chat 列表格式
   * @param {*} fromType 会话类型
   * @param {*} userId 会话ID
   * @param {*} mId 消息ID
   * @param {*} body 消息内容
   * @param {*} preview 预览
   * @param {*} isChatListInit 预览
   */
  updateChatHandler(chat, fromType, userId,  mId, body, preview,isChatListInit) {
    mId=Number(mId)
    userId=Number(userId)
    return new Promise(resolve =>{

      if(chat==undefined){
        //获取chatInfo信息
        sessionInfo.getChatInfo(fromType,userId).then(chatInfo=>{
          chat = {
            chatId: userId,
            fromType: fromType,
            img: chatInfo.headImg,
            lastReadId:  mId - 1,
            mId:mId,
            alias:chatInfo.alias || '',
            msgType: body.bodyType,
            name: chatInfo.nickName,
            paramId: userId,
            bodyFrom: body.bodyFrom,
            preview: preview,
            userTime: body.bodyTime,
            isTop: chatInfo.isTop,
            isInterruption: chatInfo.isInterruption,
            isShowMemberNick: chatInfo.isShowMemberNick,
            isBanned: chatInfo.isBanned,
            isFriend: chatInfo.isFriend,
            isForbidChat: chatInfo.isForbidChat,
            isActivity:false,
            unreadNum:0,
            msgInitialId:mId
          };
          resolve(chat);
        });
      }else{
        chat=JSON.parse(JSON.stringify(chat))
        chat.mId=mId;
        if(!isChatListInit){
          chat.msgInitialId=chat.mId;
        }
        chat.preview= preview;
        chat.userTime= body.bodyTime;
        resolve(chat);
      }
    })
  },
  /**
   * 格式化聊天列表
   */
fromatChatListInfo(chat,body){
  if (
    chat.isActivity
    || body.bodyType == 19 //群指令
    || body.bodyType == 39 //禁言指令
    || body.bodyType == 43 //清理记录协议
  ) {
    chat.lastReadId = chat.mId;
  } else {
    chat.bodyFrom = body.bodyFrom;
    if(Number(chat.bodyFrom)!=store.getters.userId){
      let n=chat.mId-chat.lastReadId;
      let cacheUnreadNum=n-chat.unreadNum
      chat.unreadNum=  n>0?n:0;
      if(cacheUnreadNum>0){
        let num=store.state.redPoint.unReadNum+cacheUnreadNum;
        store.commit("SET_UNREAD_NUMBER", {unReadNum: num});
      }
    }else{
      chat.lastReadId = chat.mId;
    }
  }
  this.notice(chat);
  return chat;
},

/**
 * 更新聊天记录？
 * @param {*} msgObj 
 * @param {*} msgItem 
 */
  updateHistory(msgObj,msgItem) {
    //消息ID
    let userId = msgObj.userId,
      fromType=msgObj.fromType,
      body = JSON.parse(msgObj.msgContent), //消息体
      mId = msgObj.msgId;
    //消息ID为时间戳 过滤非序列化消息
    if (mId.length > 12 && body.bodyType != 25 && body.bodyType != 31 && body.bodyType != 19) return;

    if (userId == "10000") userId = body.bodyFrom;
  
    if(msgItem){
      this.updateHistoryStepTwo(userId,fromType,mId,msgItem);
    }else{
      msgFormatTemplate.formatMsgNew(fromType, userId, body).then(msgItem=>{
        this.updateHistoryStepTwo(userId,fromType,mId,msgItem);
      })
    }
  },
/**
 * updateHistory的后续步骤
 */
  updateHistoryStepTwo(userId,fromType,mId,msgItem){
    let time = new Date().getTime();
    if (msgItem.bodyType == 28) {
      mId = Number(msgItem.msgContent.mId);
      msgManager.getLocalMsg(fromType,userId,mId).then(data=>{
        if(data){
          data.bodyContent=msgItem.bodyContent;
          data.msgContent=msgItem.msgContent;
          data.bodyType=msgItem.bodyType;
          if(fromType==1&&data.chatInfo){
            data.preview=data.chatInfo.nickName+' : '+msgItem.preview;
          }else{
            data.preview=msgItem.preview;
          }          
          this.updateHistoryStepThree(data,userId,fromType,mId);
          let sessionCache=store.state.session.record[userId+'-'+fromType];
          if(sessionCache){
            if(sessionCache.mId==mId){
              sessionCache.preview=data.preview;
              store.commit("UPDATE_SESSION", sessionCache);
            }
          }
        }else{
          return;
        }
      })
    }else{
      let history = {
        bodyContent: msgItem.bodyContent,
        msgContent: msgItem.msgContent,
        bodyFrom: msgItem.isSender ? store.getters.userId : msgItem.bodyFrom,
        bodyTime: msgItem.bodyTime,
        bodyType: msgItem.bodyType,
        preview: msgItem.preview,
        mId: +mId,
        createTime: time,
        checked: false,
        chatInfo:msgItem.chatInfo,
        noChatInfo:msgItem.noChatInfo
      };
      this.updateHistoryStepThree(history,userId,fromType,mId);
    }
  },
  updateHistoryStepThree(history,userId,fromType,mId){
      // 缓存新消息到本地
      if (history.bodyType != 31 && history.bodyType != 19 && 
        history.bodyType != 43 && mId < 10000000000) {
          console.log('消息触发保存')
          msgManager.updateMsg(fromType,userId,history);
      }
      //判断消息ID是否 == 已打开聊天窗口ID
      if (userId == store.getters.currentSession.paramId) {
        store.commit("SET_HAS_CURRENT_MSG", true);
        let rxml;
        let time = new Date().getTime();
        if (fromType == "0") {
          rxml = `<message xmlns="jabber:client" type="chat" to="${userId}@bcircle.net" id="${time}" from="${store.getters.userId}@bcircle.net/webIm"><body>{"bodyLevel":0, "bodyContent":"${store.getters.currentSession.mId}", "bodyType":17, "bodyFrom":"${store.getters.userId}"}</body></message>`;
        }
        if (fromType == "1") {
          rxml = `<message xmlns="jabber:client" type="chat" to="${userId}@group.bcircle.net" id="${time}" from="${store.getters.userId}@bcircle.net/webIm"><body>{"bodyLevel":0, "bodyContent":"${store.getters.currentSession.mId}", "bodyType":17, "bodyFrom":"${store.getters.userId}"}</body></message>`;
        }
        setTimeout(() => {
          store.dispatch("sendReply", rxml);
        }, 0);

        if (history.bodyType == 27) {
          history.mId = history.msgContent.mId;
          store.commit("UPDATE_MESSAGE", history);
        } else {
          store.commit("UPDATE_MESSAGE", history);
        }
        if(history.bodyType!=28&&history.mId<100000000000){
          store.getters.currentSession.lastReadId=history.mId;
          store.getters.currentSession.mId=history.mId;
        }
      }
  },

  replayFace(msg) {
    var resultArr = msg.match(/<img[^>]*>/g);
    if (resultArr != null) {
      for (var i = 0; i < resultArr.length; i++) {
        let str = resultArr[i].split("[")[1];
        str = str.split("]")[0];
        msg = msg.replace(resultArr[i], "[" + str + "]");
      }
    }
    return msg;
  },
  //标签替换
  replayLabel(value) {
    value = value
      .replace("<div><br></div>", "<br>")
      .replace(/<br\s*\/?>/gi, "\r\n")
      .replace(/&nbsp;/g, " ")
      .replace(/<div>/g, "\r\n")
      .replace(/<[^>]+>/g, "");
    return value;
  },
  //替换成纯文本
  replayToText(value) {
    let filter = this.replayFace(value);
    filter = filter.replace(/&nbsp;/g, " ")
      .replace(/<br>/g, "\n")
      .replace(/(<\/?a.*?>)|(<\/?span.*?>)/g, "");
    return filter;
  },
  filterRecord(bodyType, msg) {
    let filter = "";
    if (!lang) lang = store.state.lang;

    switch (bodyType + "") {
      case "2":
        filter = `[${lang.common.emoji}]`;
        break;
      case "3":
        filter = `[${lang.common.image}]`;
        break;
      case "4":
        filter = `[${lang.common.voice}]`;
        break;
      case "5":
        filter = `[${lang.common.video}]`;
        break;
      case "18":
        filter = `[${lang.common.file}]`;
        break;
      case "28":
        filter = msg;
        if (typeof msg == "object") {
          filter = msg.content;
          if (typeof msg.content == "object") filter = msg.content.content;
        }
        filter = MessageHandler.htmlToText(filter);
        filter = face.checkFaceI18n(filter, _langIdx);
        filter = filter.replace(/\s/g, " ");
        break;
      case "30":
        filter = msg;
        //if (typeof msg != "object") msg = JSON.parse(msg)
        if (typeof msg == "object") {
          filter = msg.content;
          if (typeof msg.content == "object") filter = msg.content.content;
          filter = MessageHandler.htmlToText(filter);
          filter = face.checkFaceI18n(filter, _langIdx);
          filter = filter.replace(/\s/g, " ");
        }
        break;
      case "32":
        filter = `[${lang.common.card}]`;
        break;
      case "44":
        filter = `[${lang.common.chatRecord}]`;
        break;
      case "47":
        filter = `[${lang.common.affiche}]`;
        break;
      default:
        filter = face.checkFaceI18n(msg, _langIdx);
        filter = filter.replace(/\s/g, " ");
        break;
    }
    return filter;
  },

  //链接替换成<a>标签
  resetUrl(str) {
    str = str.replace(/ /g, "||nbsp|");
    let reg = /((https|http|ftp|rtsp|mms)?:\/\/)?(([0-9a-z_!~*'().&=+$%-]+: )?[0-9a-z_!~*'().&=+$%-]+@)?(([0-9]{1,3}\.){3}[0-9]{1,3}|([0-9a-z_!~*'()-]+\.)*([0-9a-z][0-9a-z-]{0,61})?[0-9a-z]\.[a-z]{2,6})(:[0-9]{1,5})?((\/?)(\/[0-9a-z_!~*'().;?:@&=+$,%#-]+)+)?/gi;
    str = str.replace(reg, function (a, b, c) {
      let url = a;
      if (
        !(
          url.indexOf("ftp") >= 0 ||
          url.indexOf("http") >= 0 ||
          url.indexOf("https") >= 0
        )
      ) {
        url = "https://" + a;
      }
      return '<a href="javascript:void(0);">' + a + "</a>";
    });
    str = str.replace(/\|\|nbsp\|/g, "&nbsp;");
    return str;
  },
  copyTextReplay(str) {
    let newStr = str
      .replace(/[\r\n]/g, "")
      .replace(/ /g, "&nbsp;")
      .replace(/\s/g, "&nbsp;");

    if (newStr.indexOf("[") >= 0) {
      for (let key in faceCodeMap) {
        while (newStr.indexOf(faceCodeMap[key]) >= 0) {
          newStr = newStr.replace(faceCodeMap[key], "");
        }
      }
    }

    return newStr;
  },
  //生成唯一PacketId
  getPacketId() {
    let x = "0123456789qwertyuioplkjhgfdsazxcvbnm";
    let tmp = "";
    let timestamp = new Date().valueOf();
    for (let i = 0; i < 5; i++) {
      tmp += x.charAt(Math.ceil(Math.random() * 100000000) % x.length);
    }
    return timestamp + tmp;
  },
  //消息打勾提示音
  sendNotice(){
    if (_vioceReady) {
      _vioceReady = false;
      var audio_send = document.getElementById("audio_send");
      audio_send.play();

      setTimeout(() => {
        _vioceReady = true;
      }, 1000);
    }
  },
  //消息通知
  notice(param) {
    try {
      var notice = store.state.notice;
      if (notice.newMsgNotice == "1") {
        if (notice.bar_msg_notice_flag == "1") {
          if (document.hidden !== undefined){
            if(!document.hidden){
              let current = store.getters.currentSession;
              if (param.paramId == current.paramId || param.isInterruption) {
                return;
              }
            }
          }else{
            let current = store.getters.currentSession;
              if (param.paramId == current.paramId || param.isInterruption) {
                return;
              }
          }
          this.showNotify(param);
        }
        if (notice.sound == "1" && _vioceReady) {
          _vioceReady = false;
          var audio_msg = document.getElementById("audio_msg");
          audio_msg.play();

          setTimeout(() => {
            _vioceReady = true;
          }, 5000);
        }
      }
    } catch (error) {
      console.error(error);
    }
  },
  showNotify(param) {
    if(this.checkNotificationPromise()){
      this.newNotification(param);
    }else{
      this.oldNotification(param);
    }
  },
  /**
   * 检测是否支持promise版本
   */
  checkNotificationPromise(){
    try {
      Notification.requestPermission().then();
    } catch(e) {
      return false;
    }
    return true;
  },
  newNotification(param){
    if (!("Notification" in window)) {
      return false;
    }else if (Notification.permission === "granted") {
      //模拟一个click事件
      //判断浏览器版本，火狐72之后需要模拟click事件才能触发
      this.notifyInit(param);
    }else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(function (permission) {
        if (permission === "granted") {
          this.notifyInit(param);
        }
      });
    }
  },
  oldNotification(param){
    var Notification = window.Notification || window.mozNotification || window.webkitNotification;
    if (Notification) {
      Notification.requestPermission(result => {
        if (result != "granted") {
          return false;
        } else {
          this.notifyInit(param)
        }
      });
    } else {
      return false;
    }
  },
  notifyInit(param){
    var notify = new Notification(param.name, {
      icon: param.img,
      body: param.preview
        .replace(/&nbsp;/g, " ")
        .replace(/<br\/>/g, "\n"),
      tag: param.paramId + "-" + param.fromType + "-" + param.bodyFrom
    });
    notify.onclick = () => {
      window.focus();

      if (param.paramId == store.state.currentSession.paramId){
        //更新全局未读
        let unreadNumAll=store.state.redPoint.unReadNum-param.unreadNum;
        store.commit("SET_UNREAD_NUMBER", {
          unReadNum: unreadNumAll
        });
        return;
      } 
      store.commit("SET_ROUTE_NAME", "chat");
      store.commit("CLEAR_MESSAGE", {});
      store.commit("UPDATE_CURRENT_SESSION", param);
      //更新全局未读
      let unreadNumAll=store.state.redPoint.unReadNum-param.unreadNum;
      store.commit("SET_UNREAD_NUMBER", {
        unReadNum: unreadNumAll
      });
      notify.close();
      
      setTimeout(() => {
        let sessionCache= store.state.session.record;
        for(let key in sessionCache){
          if(sessionCache[key].isActivity){
            sessionCache[key].isActivity=false;
          }        
        }
        param.isActivity=true;

        store.commit("UPDATE_SESSION", param);
      }, 200);
    };
  },
  // 指令处理
  orderHandler(order) {
    let orderId = localStore.getStore("orderId");

    if (!orderId) {
      localStore.setStore("orderId", order.mId);
      return;
    }

    if (order.mId > orderId) {
      let msgStr = "";
      for (let i = 0; i < order.mId - orderId; i++) {
        msgStr = msgStr + (order.mId - i) + ",";
      }
      let obj = {
        sessionUserId: order.fromId,
        type: order.fromType,
        msgId: msgStr.replace(/,$/, "")
      };
      api.getOrders(obj).then(data => {
        for (let j = 0; j < data.length; j++) {
          let body = JSON.parse(data[j].body);

          if (body.bodyType == 28) {
            msgFormatTemplate.formatMsgNew(body.bodyFromType, body.bodyFrom, body).then(body=>{
              msgManager.editMsg(body.bodyFromType,body.bodyFrom,body.msgContent.mId,body.msgContent);
            })            
          } else if (body.bodyType == 42) {
            body.bodyContent = JSON.parse(body.bodyContent);
            if(body.bodyContent.type!=-1){
              let idArray=body.bodyContent.mId.split(',');
              for(let key in idArray){
                msgManager.removeMsg(body.bodyFromType,body.bodyFrom,idArray[key]);
              }
            }else{
              msgManager.removeMsgAll(body.bodyFromType,body.bodyFrom);
            }            
          }
        }
        localStore.setStore("orderId", order.mId);
      });
    }
  }
};

export default messageParse;
