import store from "../store";
import Msg from "./msg";
import { api } from "../api";
import { localStore } from "./localStorage";
import { Crypto } from "@/tools/crypto" 
import { group } from "@/session/group";
import {friendDB} from "@/session/friend/friendDB";
import { msgManager } from "@/session/msgManager";
import {msgFormatTemplate} from "@/session/msgFormatTemplate";
import { sessionUtil } from "@/session/sessionUtil";
import x2js from 'x2js';
let x2js1= new x2js();

export default {
  time: 0,
  title: window.document.title,
  timer: null,
  _lastId: null,
  _privateChat: `<message type = "chat" id = "$id" from = "$from@bcircle.net/webIm" to="$to#bcircle.net@receipt.bcircle.net"><body>$body</body></message>`,
  _privateChatBody: `{"bodyType": $bodyType, "bodyLevel": "1", "bodyContent": "$bodyContent", "bodyFrom": "$bodyFrom"}`,
  _groupChat: `<message type = "groupchat" id = "$id" from = "$from@bcircle.net/webIm" to="$to#group.bcircle.net@receipt-1.bcircle.net"><body>$body</body></message>`,
  _groupChatBody: `{"bodyType": $bodyType, "bodyLevel": "1", "bodyContent": "$bodyContent", "bodyFrom": "$myUserId"}`,

  onMessage(msg) {
    console.log(msg);
    //先获取消息发送者的基础信息.
    try {
      let fromType = "0";
      let msgObj = JSON.parse(msg);
      // 过滤没有body的消息
      if (!msgObj.msgContent || JSON.stringify(msgObj.msgContent) == "{}")
        return;

      let jid=msgObj.from.split("@");
      let domain=null;
      try {
        let domainFull=jid[1].split("/");
        domain=domainFull[0];
        //let resource=domainFull[1];//消息来源
      } catch (error) {
        console.error(error)
        return ;
      }
 
      if (domain == "bcircle.net") {
        fromType = 0;
      } else if (domain == "group.bcircle.net") {
        fromType = 1;
      } else if (domain == "service.bcircle.net") {
        fromType = 2;
      } else if (domain == "instruct.bcircle.net") {
        fromType = 10;//指令类型
      } else if (domain == "secret.bcircle.net") {
        //3
        return false;
      }else if(domain == 'receipt.bcircle.net'){
        fromType = 9;
      }

      let userInfo = store.getters.userInfo;
      let userId = +jid[0];
      let body = JSON.parse(msgObj.msgContent); //消息体
      let mId = Number(msgObj.msgId);
      msgObj.userId=userId;
      msgObj.fromType=fromType;
      //判断消息是否丢失，丢失触发找回
      if(fromType!=10&&fromType!=9){
        //不是指令会话
        if(mId<1000000000){
          this.retrieveMsg(userId,fromType,mId);
        }
      }

      switch (body.bodyType + "") {
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
        case "8":
        case "13":
        case "18":
        case "21":
        case "27":
        case "29":
        case "30":
        case "32":
        case "45":
          Msg.updateChat( msgObj);
          // Msg.updateHistory(msgObj);
          this.newMsgHint();
          break;
        case "16":
          console.log(msg)
          console.log(msgObj)
          if(userId == store.state.currentSession.paramId&&fromType==store.state.currentSession.fromType){
            
            let body = JSON.parse(msgObj.msgContent);
            let content= msgFormatTemplate.getPlaintextMsg(msgObj.fromType,msgObj.userId,body);
            content.msgContent = typeof content.bodyContent == "object" ? content.bodyContent:JSON.parse(content.bodyContent);
            console.log(content);
            store.commit("SET_IS_TYPING", {status:true,type:content.msgContent.type});
          }
          break;
        case "17": //保存已读ID到本地  处理双勾消息
          if (body.bodyFrom != store.getters.userId) {
            msgManager.setReadMsgBySessionId(fromType,userId);
            if(userId == store.state.currentSession.paramId&&fromType==store.state.currentSession.fromType){
              let msg=store.state.message;
              for(let key in msg){
                let m=msg[key];
                //if(!m.readNum){
                if(m.loading == 1){
                  m.readNum=1;
                  store.commit("UPDATE_MESSAGE_READ", m);
                }
              }
              if(fromType==1){
                store.dispatch("getReadNum", {
                  groupId: userId
                });
              }
            }
          } else {
            let session = store.state.session.record[userId+'-'+fromType];

            if (session && session.mId) {
              session.lastReadId = session.mId;
              session.unreadNum=0;
              store.commit("UPDATE_SESSION", session);//更新会话列表
              // store.commit("UPDATE_SESSION", JSON.parse(JSON.stringify(session)));
            }
          }
          break;
        case "19": //接收群指令  刷新群成员信息
          
          let bodyContent = JSON.parse(body.bodyContent);
          group.getGroupAll(true).then(data=>{
            store.commit("SET_GROUP_LIST", data);
            if (bodyContent.type != 2 && bodyContent.type != 3) {
              Msg.updateChat( msgObj);
              // Msg.updateHistory(msgObj);
            }
          })
          if (
            bodyContent.type == 2 ||
            (bodyContent.type == 4 &&
              bodyContent.inviter[0].userId == store.getters.userId)
          ) {
            store.commit("DELETE_SESSION", body.bodyFrom+'-1');

            if (body.bodyFrom == store.getters.currentSession.paramId) {
              store.commit("UPDATE_CURRENT_SESSION", {});
            }
            group.quit(userId);
            // msgManager.removeMsgAll(fromType,userId);
          }
          if(bodyContent.type == 12 ) {
            let sCache=store.state.session.record[body.bodyFrom+'-1'];
            if(sCache){
              sCache.name=bodyContent.groupName;
              store.commit("UPDATE_SESSION",JSON.parse(JSON.stringify(sCache)))
            }
            if(store.getters.currentSession.fromType==1&& body.bodyFrom == store.getters.currentSession.paramId){
              let cs = store.getters.currentSession;
              cs.name = bodyContent.groupName;
              store.commit("UPDATE_CURRENT_SESSION", JSON.parse(JSON.stringify(cs)));
            }
          }

          if (
            bodyContent.type != 2 &&
            bodyContent.type != 11 &&
            bodyContent.type != 12 &&
            bodyContent.type != 13 &&
            bodyContent.type != 4
          ) {
            store.dispatch("getGroupMember", {
              groupId: userId
            });
          }

          if (bodyContent.type == 13 || bodyContent.type == 14) {
            group.getGroupMember(body.bodyFrom).then(groupMember =>{
              let inviter=bodyContent.inviter[0];
              let memberInfo=groupMember[inviter.userId];
              if (bodyContent.type == 13) {
                if (bodyContent.auditResult == 1) {
                  //设置管理员
                  if(Number(inviter.userId)==store.getters.userId){
                    var sessionObj = store.state.session.record[body.bodyFrom+'-1'];
                    if (body.bodyFrom == store.state.currentSession.paramId) {
                      sessionObj = store.state.currentSession;
                      sessionObj.isBanned = 0;
                      store.commit("UPDATE_CURRENT_SESSION", sessionObj);
                    }
                    sessionObj.isBanned = 0;
                    store.commit("UPDATE_SESSION", sessionObj);
                  }
                  memberInfo.isBanned = 0;
                  memberInfo.isAdmin = 2;
                } else {
                  //取消管理员
                  if(Number(inviter.userId)==store.getters.userId){
                    let groupInfo= store.state.groupList[body.bodyFrom];
                    if(groupInfo.isBanned){
                      var sessionObj = store.state.session.record[body.bodyFrom+'-1'];
                      if (body.bodyFrom == store.state.currentSession.paramId) {
                        sessionObj = store.state.currentSession;
                        sessionObj.isBanned = 1;
                        store.commit("UPDATE_CURRENT_SESSION", sessionObj);
                      }
                      sessionObj.isBanned = 1;
                      store.commit("UPDATE_SESSION", sessionObj);
                    }
                  }
                  memberInfo.isAdmin = 0;
                }
              }else{
                if(Number(inviter.userId)==store.getters.userId){
                  var sessionObj = store.state.session.record[body.bodyFrom+'-1'];
                  if (body.bodyFrom == store.state.currentSession.paramId) {
                    sessionObj = store.state.currentSession;
                    sessionObj.isBanned = 0;
                    store.commit("UPDATE_CURRENT_SESSION", sessionObj);
                  }
                  sessionObj.isBanned = 0;
                  store.commit("UPDATE_SESSION", sessionObj);
                }
                memberInfo.isBanned = 0;
                memberInfo.isAdmin = 1;
                groupMember[bodyContent.operatorId].isAdmin = 0;
              }
  
              let obj = {
                groupId: body.bodyFrom,
                data: groupMember
              };
  
              store.commit("SET_GROUP_MEMBER", groupMember);
              //更新群成员
              group.updateGroupMember(groupMember);
            })
          }

          if (bodyContent.type == 21) {
            localStore.updateInviterCode(body.bodyFrom, bodyContent, "add");
            store.commit("SET_GROUP_INVITE", bodyContent);
          }
          //删除群公告
          if(bodyContent.type == 32 ) {
            store.commit("DELETE_AFFICHE",userId);
          }
          break;
        case "20": //消息发送 成功回执
          let bodyCache = JSON.parse(body.bodyContent)
          let nId = Number(bodyCache.nId);
          let type = Number(bodyCache.type);
          let cacheSession=store.state.session.record[userId+'-'+type];
          if(cacheSession){
            cacheSession.mId=nId;
            cacheSession.lastReadId=nId;
          }
          if(store.state.currentSession.paramId==userId&&store.state.currentSession.fromType==type){
            let history = store.getters.message[mId];
            if (history) {
              store.commit("DELETE_MESSAGE", history.mId);
              history.mId = nId;
              history.lastReadId = nId;
              history.loading = 1;
              history.readNum = 0;
              history.bodyTime = body.bodyTime;
              //文件类型更新
              if(history.bodyType==18) history.msgContent.progress=100;
              //发送成功提示音
              Msg.sendNotice();
              store.commit("UPDATE_MESSAGE", history);
              // 缓存新消息到本地
              msgManager.updateMsg(type,userId,history);
            }
          }
          this.retrieveMsg(userId,type,nId);
          break;
        case "24": //处理@消息
          let msgAt = JSON.parse(
            Crypto.decryptByDES(body.bodyContent, userId + "")
          ).userIds;
          //判断是否有人@我
          if (
            msgAt.includes(userInfo.userId + "") ||
            msgAt.includes("allMember")
          ) {
            store.commit("SET_AT", {
              groupId: userId,
              mId: mId+''
            });
          }
          console.log(msgObj)
          Msg.updateChat(msgObj);
          // Msg.updateHistory(msgObj);
          this.newMsgHint();
          break;
        case "47": //处理公告消息
          body.bodyContent = JSON.parse(
            Crypto.decryptByDES(body.bodyContent, userId + "")
          );
          if(body.bodyContent && body.bodyContent.type ==1){

            group.getMemberInfo(userId, body.bodyFrom).then(member => {
              body['nickName'] = member.nickName;
              store.commit("SET_AFFICHE", {
                groupId: userId,
                body: body
              });
              console.log(body)
            })
          }
          Msg.updateChat(msgObj);
          // Msg.updateHistory(msgObj);
          break;
        case "25": //添加好友申请
          if (body.bodyContent == "1") {
            store.dispatch("getNewFriends", {}).then(()=>{
              let friendList=store.state.activityComponents['friend'];
              if(friendList){
                console.log('触发添加刷新');
                friendList.initNewFriendsList();
              }
            });
          } else if (body.bodyContent == "2" || body.bodyContent == "5") {
            if(body.bodyFrom==store.getters.userId){
              return;
            }
            //移除小红点 start
            let firendNewArry=sessionUtil.getNewFirendListSessionStorage();
            for(let i=0;i<firendNewArry.length;i++){
              let fa=firendNewArry[i];
              if(fa.userId==body.bodyFrom){
                firendNewArry.splice(i, 1);
                break;
              }
            }
            sessionUtil.setNewFirendListSessionStorage(firendNewArry);
            store.commit("SET_UNREAD_NUMBER", {
              unReadNum: store.state.redPoint.unReadNum,
              newFriendsNum: firendNewArry.length
            });
            //移除小红点 end
            Msg.updateChat(msgObj);
            // Msg.updateHistory(msgObj);
            let cacheSession=store.state.session.record[userId+'-'+fromType];
            if (cacheSession) {
              cacheSession.temp = false;
              cacheSession.menuBox = [];
              cacheSession.menuSelect = [];
              cacheSession.describe = "";
            }
            //已打开临时会话 更新会话状态
            if (body.bodyFrom == store.getters.currentSession.paramId) {
              store.commit("UPDATE_CURRENT_SESSION", JSON.parse(JSON.stringify(cacheSession)));
            }
          } else if (body.bodyContent == "4") {
            friendDB.deleteFriend(body.bodyFrom);
            store.commit("DEL_FRIEND_INFO",+body.bodyFrom);
            let friendList=store.state.activityComponents['friend'];
            if(friendList){
              console.log('触发删除刷新');
              friendList.initFriendsList();
            }
            store.commit("DELETE_SESSION", body.bodyFrom+'-0');
            if (body.bodyFrom == store.getters.currentSession.paramId) {
              store.commit("UPDATE_CURRENT_SESSION", {});
            }

            msgManager.removeMsgAll(fromType,userId);
          }else if(body.bodyContent == "3"){
            //移除小红点 start
            let firendNewArry=sessionUtil.getNewFirendListSessionStorage();
            for(let i=0;i<firendNewArry.length;i++){
              let fa=firendNewArry[i];
              if(fa.userId==userId){
                firendNewArry.splice(i, 1);
                break;
              }
            }
            sessionUtil.setNewFirendListSessionStorage(firendNewArry);
            store.commit("SET_UNREAD_NUMBER", {
              unReadNum: store.state.redPoint.unReadNum,
              newFriendsNum: firendNewArry.length
            });
            //移除小红点 end
          }
          break;
        case "28": //编辑消息指令
          msgObj.fromType=body.bodyFromType;
          Msg.updateHistory( msgObj);
          let oId = localStore.readLastOrder("edit");
          if (mId > oId) {
            localStore.setStore("orderId_" + store.getters.userId, mId);
            localStore.updateLastOrder("edit", mId);
          }
          break;
        case "31": //消息被拒收
          if (body.bodyFrom != store.getters.userId) {
                if(userId==store.state.currentSession.paramId&&store.state.currentSession.fromType==fromType){
                  let msg=JSON.parse(body.bodyContent);
                  if(msg.type==3){
                    store.state.currentSession.isBanned=2;                    
                    store.commit("UPDATE_CURRENT_SESSION", JSON.parse(JSON.stringify(store.state.currentSession)));
                  }

                  let msgId = msg.mid;
                  let history = store.getters.message[msgId];
                  if (history) {
                    history.loading = 2;
                    store.commit("UPDATE_MESSAGE", history);
                  }

                }
            Msg.updateChat(msgObj);
            // Msg.updateHistory(msgObj);
          }
          break;
        case "34": //置顶消息指令
          var content = JSON.parse(body.bodyContent);
          let session = store.state.session.record[body.bodyFrom+'-'+body.bodyFromType];
          if (content.type == 0) {
            session.isTop = content.state;
          } else if (content.type == 1) {
            session.isInterruption = content.state;
          }
          store.commit("UPDATE_SESSION", session);

          var oId = localStore.readLastOrder("isTop");
          if (mId > oId) {
            localStore.updateLastOrder("isTop", mId);
          }
          break;
        case "36": //音视频操作
          var content = JSON.parse(body.bodyContent);
          if (content.state == "1") {
            if (content.type == "3") {
              if (store.getters.videoInfo.fromId != content.fromId) {
                lastId = content.fromId;
                content.status = 6;
                store.commit("UPDATE_VIDEO_INFO", content);
              }
            } else {
              store.commit("UPDATE_VIDEO_INFO", content);
            }
          } else {
            content.status = 0;
            store.commit("UPDATE_VIDEO_INFO", content);
            // 发送回执
            let time = new Date().getTime();
            let rxml = `<message xmlns="jabber:client" type="chat" to="moreonly.bcircle.net" id="${time}" from="${userInfo.userId}@bcircle.net/webIm"><body>{"bodyLevel":0,"bodyContent":"${body.bodyType}","bodyType":37,"bodyFrom":"${userInfo.userId}"}</body></message>`;
            this.sendMessage(rxml);
          }


          Msg.updateChat(msgObj);
          // Msg.updateHistory(msgObj);
          this.newMsgHint();
          break;
        case "38": //音视频消息
          var content = JSON.parse(body.bodyContent);
          if (content.resource) {
            store.commit("UPDATE_VIDEO_INFO", {
              status: 3,
              resource: content.resource
            });
          }
          if (content.state == "2") {
            return;
          }
          Msg.updateChat(msgObj);
          // Msg.updateHistory(msgObj);
          break;
        case "39": //群聊禁言
          group.groupMuted(body);
          Msg.updateChat(msgObj);
          // Msg.updateHistory(msgObj);

          break;
        case "42": //删除消息指令

          var content = JSON.parse(body.bodyContent);

          if(content.type!=-1){
            let arr = content.mId.split(",");
            if (body.bodyFrom == store.getters.currentSession.paramId) {
              for (let i = 0; i < arr.length; i++) {
                store.commit("DELETE_MESSAGE", +arr[i]);
              }
            }  
            var oId = localStore.readLastOrder("delete");  
            for (let i = 0; i < arr.length; i++) {
              msgManager.removeMsg(body.bodyFromType,body.bodyFrom,arr[i]);
              if (arr[i] > oId) {
                localStore.setStore("orderId_" + store.getters.userId, +arr[i]);
                localStore.updateLastOrder("delete", +arr[i]);
              }
            }
          }else{
            if (body.bodyFrom == store.getters.currentSession.paramId) {
              store.commit("CLEAR_MESSAGE", {});
            }            
            msgManager.removeMsgAll(body.bodyFromType,body.bodyFrom);
            //清空列表
            let sessionCache=store.state.session.record[body.bodyFrom+'-'+body.bodyFromType];
            sessionCache.preview='';
            store.commit("UPDATE_SESSION", sessionCache);
          }
          break;
        case "43": //自动清理消息
          Msg.updateChat(msgObj);
          // Msg.updateHistory(msgObj);
          break;
        case "44": //消息记录
          Msg.updateChat(msgObj);
          // Msg.updateHistory(msgObj);
          break;
        default:
          
          break;
      }      
    } catch (error) {
      console.error(error);
    }
  },
  messageToXml(data, cb) {
    data.msg = Msg.replayLabel(data.msg);
    let bodyTpl = "",
      xmlTpl = "";

    if (data.chatType == "0") {
      //私聊
      if(Number(data.userId)==Number(data.toId)){
        //不允许自己给自己发送消息
        return;
      }
      let key = data.userId + "" + data.toId + "",
        result = Crypto.encryptByDES(data.msg, key);
      bodyTpl = this._privateChatBody
        .replace("$bodyType", data.msgType)
        .replace("$bodyContent", result)
        .replace("$bodyFrom", data.userId);
      xmlTpl = this._privateChat
        .replace("$body", bodyTpl)
        .replace("$id", data.time)
        .replace("$from", data.userId)
        .replace("$to", data.toId);
        
    } else if (data.chatType == "1") {
      //群聊
      let key = data.toId,
        result = Crypto.encryptByDES(data.msg, key);
      bodyTpl = this._groupChatBody
        .replace("$bodyType", data.msgType)
        .replace("$bodyContent", result)
        .replace("$myUserId", data.userId);
      xmlTpl = this._groupChat
        .replace("$body", bodyTpl)
        .replace("$id", data.time)
        .replace("$from", data.userId)
        .replace("$to", data.toId);
    }

    this.sendMessage(xmlTpl, cb);
  },
  sendMessage(xml, cb) {
    api.sendMessage({
        msg: xml,
        index: this._lastId
      })
      .then(
        data => {
          if (data != null) {
            this._lastId = data.index;
            data.list.forEach(item => {
              this.onMessage(item);
            });            
          }
          if (typeof cb == "function") {
            cb();
          }
        },
        res => {
          let json=x2js1.xml2js(res.msg);          
          let cacheMsg=store.getters.message[json.message._id];
          if(cacheMsg){
            cacheMsg.loading=2
          }
        }
      );
  },
  sendReply(xml) {
    api.rtcMessage({
        msg: xml,
        index: this._lastId
      })
      .then(data => {
        if (data.index) {
          this._lastId = data.index;
        }
        if (data.list) {
          for (let i = 0; i < data.list.length; i++) {
            this.onMessage(data.list[i]);
          }
        }
        this.sendRtc(null);
      })
      .catch(error => {
        console.error(error);
        this.sendRtc(null);
      });
  },
  sendRtc(xml) {
    api.rtcMessage({
        msg: xml,
        index: this._lastId
      })
      .then(data => {
        if (data.index) {
          this._lastId = data.index;
        }
        if (data.list) {
          for (let i = 0; i < data.list.length; i++) {
            this.onMessage(data.list[i]);
          }
        } 
        this.sendRtc(null);
      })
      .catch(error => {
        console.error(error);
        this.sendRtc(null);
      });
  },
  // 信息标签页闪烁提示
  newMsgHint() {
    let notice = store.state.notice;

    if (
      notice.newMsgNotice != "1" ||
      notice.bar_msg_notice_flag != "1" ||
      !document.hidden
    )
      return;

    if (this.timer != null) {
      clearInterval(this.timer);
    }
    this.timer = setInterval(() => {
      this.time++;

      if (this.time % 2 != 0) {
        window.document.title = `你有${
          store.getters.unReadNum > 99
            ? "99+"
            : store.getters.unReadNum > 0
            ? store.getters.unReadNum
            : 1
        }条新消息，${this.title}`;
      } else {
        window.document.title = this.title;
      }

      if (this.time > 5) {
        clearInterval(this.timer);
        window.document.title = this.title;
        this.time = 0;
      }
    }, 1000);
  },
  /**
   * 消息找回
   * @param {*} userId 会话ID 
   * @param {*} type 会话类型
   * @param {*} type 会话类型
   */
  retrieveMsg(userId,type,msgId){
    let cacheSession=store.getters.session.record[userId+'-'+type];
    if(cacheSession){
      let differNum=msgId-cacheSession.msgInitialId;
      if(differNum<=1){
        cacheSession.msgInitialId=msgId;
        return ;
      }else{
        //消息丢失
        // 计算断层
        if(differNum>200){
          differNum=200;
        }
        msgManager.getFaultMsg(differNum,cacheSession.msgInitialId,userId,type);
      }
    }
  }
};
