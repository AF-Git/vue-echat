/**
 * 消息格式模板工具类
 */
import { Util } from "@/tools/utils";
import { Crypto } from "@/tools/crypto"
import store from "@/store";
import { face, faceCodeMap } from "@/tools/emoji";
import { sessionInfo } from "@/session/sessionInfo";
import { group } from "@/session/group";
import { Config } from "@/common/config"

let lang = null;
let _langIdx = 0;

if (localStorage.lang == "en_US") _langIdx = 1;
if (localStorage.lang == "my") _langIdx = 2;
export const msgFormatTemplate = {
  /**
   * 获取明文消息
   * @param {*} cache 
   * return 解密后消息
   */
  getPlaintextMsg(fromType, paramId, cache) {
    try {
      let body = null, key = null;
      if (typeof cache == "object") {
        body = cache;
      } else {
        body = JSON.parse(cache);
      }
      if (!body.bodyContent || body.bodyType == 17 || body.bodyType == 10) {
        return;
      }
      if (fromType == "0") {
        if (Number(body.bodyFrom) == store.getters.userId || body.isSender) {
          key = store.getters.userId.toString() + paramId;
        } else {
          key = body.bodyFrom + store.getters.userId;
        }
      } else {
        key = paramId + "";
      }
      //判断加密等级 解析消息
      if (body.bodyLevel == "0" && !(typeof body.bodyContent == "object")) {
        if (body.bodyType != 1)
          body.bodyContent = new Function("return " + body.bodyContent)();
      } else if (body.bodyLevel == "1") {
        body.bodyContent = Crypto.decryptByDES(body.bodyContent, key);

      }
      cache = body;
    } catch (error) {
      console.error(error);
      console.error(fromType, paramId, cache);
      return;
    }
    return cache;
  },

  /**
   * 消息集合解析入口
   * @param {array} msgList 消息集合
   * return json
   */
  formatMsgList(fromType, paramId, msgList) {
    return new Promise(resolve => {
      let cacheCount = {
        index: 0,
        length: msgList.length
      }
      let msgJson = {};
      for (let key in msgList) {
        let content = msgList[key];
        this.formatMsgNew(fromType, paramId, content.body).then(data => {
          if (data) {
            data.mId = content.mId;
            msgJson[content.mId] = data;
          }
          this.normalMsgList(resolve, cacheCount, msgJson);
        })
      }
    })
  },
  /**
   * 集合归一
   */
  normalMsgList(resolve, cacheCount, msgJson) {
    cacheCount.index = cacheCount.index + 1
    if (cacheCount.index >= cacheCount.length) {
      resolve(msgJson);
    }
  },
  /**
   * 单个消息解析
   * @param {*} fromType 
   * @param {*} paramId 
   * @param {*} content 
   */
  formatMsgNew(fromType, paramId, content) {
    return new Promise(resolve => {
      content = this.getPlaintextMsg(fromType, paramId, content)
      if (content) {
        try {
          this.formatMsg(content, paramId, fromType).then(data => {
            if (!data) {
              return resolve();
            }
            data.checked = false;
            if (fromType == 1 && paramId != data.bodyFrom && !data.noChatInfo) {
              group.getMemberInfo(paramId, data.bodyFrom).then(member => {
                data.chatInfo = {
                  nickName: member.nickName,
                  userId: data.bodyFrom,
                  isAdmin: member.isAdmin,
                  headImg: member.avatar
                }
                if (data.bodyType == 47) data.preview = data.preview;
                else data.preview = data.chatInfo.nickName + " : " + data.preview;
                resolve(data);
              })
            } else {
              resolve(data);
            }
          });
        } catch (error) {
          console.error(error);
          console.error(content);
          resolve();
        }

      } else {
        resolve();
      }
    })
  },
  formatMsg(content, fromId, fromType) {
    //最近聊天消息格式化
    return new Promise(resolve => {
      try {
        if (!lang) lang = store.state.lang;
        let bodyType = Number(content.bodyType);
        switch (bodyType) {
          case 1:
          case 13://普通文本
            this.textTemp(resolve, content);
            break;
          case 2://表情
            this.emojiTemp(resolve, content);
            break;
          case 3://图片
            this.imgTemp(resolve, content);
            break;
          case 4://离线音频
            this.offlineAudioTemp(resolve, content);
            break;
          case 5://离线视频
            this.offlineVideoTemp(resolve, content);
            break;
          case 6://红包
            this.readPacketTemp(resolve, content);
            break;
          case 8://转账
            this.transferTemp(resolve, content);
            break;
          case 18://文件
            this.fileTemp(resolve, content);
            break;
          case 19://群指令
            this.groupInstructionTemp(resolve, content);
            break;
          case 21://交易通知
            this.tradeNoticeTemp(resolve, content);
            break;
          case 24://群@
            this.groupAtTemp(resolve, fromId, content);
            break;
          case 25://好友通知
            this.friendNoticTemp(resolve, content);
            break;
          case 27://消息撤回
            this.msgWithdrawalTemp(resolve, content);
            break;
          case 28://消息编辑
            this.msgEditTemp(resolve, content);
            break;
          case 29://群邀请
            this.groupInvitationTemp(resolve, content, fromId);
            break;
          case 30: //消息回复  msgReplyTemp
            this.msgReplyTemp(resolve, content);
            break;
          case 31: //消息拒收   msgRejectionTemp
            this.msgRejectionTemp(resolve, content);
            break;
          case 32://名片分享  shareCardTemp
            this.shareCardTemp(resolve, content);
            break;
          case 38://音视频消息体协议-用于会话展示   msgVideoTemp
            this.msgVideoTemp(resolve, content);
            break;
          case 39://禁言  forbiddenTemp
            this.forbiddenTemp(resolve, fromId, content);
            break;
          case 43://消息清理  msgClearTemp
            this.msgClearTemp(resolve, content, fromType, fromId);
            break;
          case 44://消息转发   msgForwardingTemp
            this.msgForwardingTemp(resolve, content);
            break;
          case 45://系统公告协议  systemNoticTemp
            this.systemNoticTemp(resolve, content);
            break;
          case 47://公告  systemNoticTemp
            this.afficheTemp(resolve, content);
            break;
          default:
            throw "Not currently supported";
            break;
        }
        if (!content.bodyContent && !content.msgContent) {
          throw "Parse error";
        }
      } catch (error) {
        console.error(error);
        content.bodyType = 49;
        content.noChatInfo = true;
        content.preview = error == "Not currently supported" ?
          lang.msgPanel.notSupported : lang.msgPanel.parseError;
        content.msgContent = error == "Not currently supported" ?
          lang.msgPanel.notSupported : lang.msgPanel.parseError;
        resolve(content);
      }
    })
  },
  /**
   * 文本模板
   */
  textTemp(resolve, content) {
    if (content.bodyContent == '') {
      content.preview = ' ';
      content.msgContent = ' ';
      return resolve(content);
    }
    content.preview = this.xssHandler(content.bodyContent, true, true);
    content.msgContent = this.xssHandler(content.bodyContent, false, false);
    resolve(content);
  },
  /**
   * 表情模板
   * @param {*} content 
   */
  emojiTemp(resolve, content) {
    content.msgContent = JSON.parse(content.bodyContent);
    if (content.msgContent) {
      if (content.msgContent.bqUrl.indexOf('/') == 0) {
        content.msgContent.bqUrl = content.msgContent.bqUrl.substr(1);
      }
    }
    content.preview = "[" + lang.common.emoji + "]";
    resolve(content);
  },
  /**
   * 图片模板
   * @param {*} content 
   */
  imgTemp(resolve, content) {
    content.msgContent = JSON.parse(content.bodyContent);
    if (content.msgContent) {
      if (content.msgContent.imgUrl.indexOf('/') == 0) {
        content.msgContent.imgUrl = content.msgContent.imgUrl.substr(1);
      }
    }
    content.preview = "[" + lang.common.image + "]";
    resolve(content);
  },
  /**
   * 离线语音模板
   * @param {*} content 
   */
  offlineAudioTemp(resolve, content) {
    content.msgContent = JSON.parse(content.bodyContent);
    //console.log(content.msgContent)
    content.msgContent.isPlaying = false;
    content.msgContent.isPlay = false;
    content.msgContent.proNum = 0;
    content.preview = "[" + lang.common.voice + "]";
    resolve(content);
  },
  /**
   * 离线视频模板
   * @param {*} content 
   */
  offlineVideoTemp(resolve, content) {
    content.msgContent = JSON.parse(content.bodyContent);
    if (content.msgContent) {
      if (content.msgContent.imgUrl) {
        if (content.msgContent.imgUrl.indexOf('/') == 0) {
          content.msgContent.imgUrl = content.msgContent.imgUrl.substr(1);
        }
      } else {
        content.msgContent.imgUrl = content.msgContent.videoUrl + '.png';
        content.bodyContent = JSON.stringify(content.msgContent);
      }

      if (content.msgContent.videoUrl.indexOf('/') == 0) {
        content.msgContent.videoUrl = content.msgContent.videoUrl.substr(1);
      }
    }
    content.preview = "[" + lang.common.video + "]";
    resolve(content);
  },
  /**
   * 红包模板
   * @param {*} content 
   */
  readPacketTemp(resolve, content) {
    content.msgContent = store.getters.userId == content.bodyFrom ? lang.msgPanel.sendRedPacket : lang.msgPanel.receiveRedPacket;
    content.preview = "[" + lang.chatPanel.redPacket + "]";
    content.noChatInfo = true
    resolve(content);
  },
  /**
   * 转账模板
   * @param {*} content 
   */
  transferTemp(resolve, content) {
    content.msgContent = JSON.parse(content.bodyContent);
    if (store.getters.userId == content.msgContent.fromId) {
      content.msgContent = content.msgContent.status == "1" ? lang.msgPanel.otherConfirm : lang.msgPanel.sendTransfer;
    } else {
      content.msgContent = content.msgContent.status == "1" ? lang.msgPanel.confirmTransfer : lang.msgPanel.receiveTransfer;
    }
    content.preview = "[" + lang.chatPanel.transfer + "]";
    content.noChatInfo = true
    resolve(content);
  },
  /**
   * 文件模板
   * @param {*} content 
   */
  fileTemp(resolve, content) {
    content.msgContent = JSON.parse(content.bodyContent);
    content.msgContent.progress = 100;
    content.preview = "[" + lang.common.file + "]";
    let obj = {
      url: Config.fileDownUrl + 'original/' + content.msgContent.url,
      name: content.msgContent.name
    }
    let d = JSON.stringify(obj);
    d=window.encodeURIComponent(d);
    let str = window.btoa(d);
    content.msgContent.dl64 = str
    resolve(content);
  },
  /**
   * 群指令模板
   * @param {*} content 
   */
  groupInstructionTemp(resolve, content) {
    let msgBody = content.bodyContent;
    if (msgBody.type == 2) {
      content.preview = msgBody.operatorName + lang.groupInvite.dissolve;
    } else if (msgBody.type == 3) {
      content.preview = msgBody.operatorName + lang.groupInvite.quit;
    } else if (msgBody.type == 4) {
      content.preview =
        (msgBody.operatorId != store.getters.userId ?
          msgBody.operatorName :
          lang.common.you) +
        lang.groupInvite.removed +
        msgBody.inviter[0].userName;
    } else if (msgBody.type == 5) {
      let inviter = msgBody.inviter,
        str = "";
      for (let i = 0; i < inviter.length; i++) {
        str +=
          (inviter[i].userId != store.getters.userId ?
            inviter[i].userName :
            lang.common.you) + "、";
      }
      str = str.substr(0, str.length - 1);
      content.preview =
        (msgBody.operatorId != store.getters.userId ?
          msgBody.operatorName :
          lang.common.you) +
        lang.groupInvite.invite +
        str +
        lang.groupInvite.toJoin;
    } else if (msgBody.type == 7) {
      content.preview =
        msgBody.inviter[0].userName +
        lang.groupInvite.byScan +
        (msgBody.operatorId != store.getters.userId ?
          msgBody.operatorName :
          lang.common.you) +
        lang.groupInvite.shareCode;
    } else if (msgBody.type == 8) {
      content.preview =
        msgBody.inviter[0].userName +
        lang.groupInvite.through +
        msgBody.operatorName +
        lang.groupInvite.shareLink;
    } else if (msgBody.type == 11) {
      content.preview =
        (msgBody.operatorId != store.getters.userId ?
          msgBody.operatorName :
          lang.common.you) +
        (msgBody.auditResult == 1 ?
          lang.groupInvite.openVerify :
          lang.groupInvite.closeVerify);
    } else if (msgBody.type == 12) {
      content.preview =
        msgBody.operatorName +
        lang.groupInvite.changeGroupName +
        '"' +
        msgBody.groupName +
        '"';
    } else if (msgBody.type == 13) {
      content.preview =
        (msgBody.inviter[0].userId != store.getters.userId ?
          msgBody.inviter[0].userName :
          lang.common.you) +
        (msgBody.auditResult == 1 ?
          lang.groupInvite.added :
          lang.groupInvite.cancelled) +
        lang.groupInvite.groupOwner;
    } else if (msgBody.type == 14) {
      content.preview =
        (msgBody.inviter[0].userId != store.getters.userId ?
          msgBody.inviter[0].userName :
          lang.common.you) + lang.groupInvite.becomeOwner;
    } else if (msgBody.type == 15) {
      content.preview = msgBody.operatorName + lang.groupInvite.linkJoin;
    } else if (msgBody.type == 16) {
      content.preview = `${
        msgBody.operatorId != store.getters.userId ? msgBody.operatorName : lang.common.you
        }${
        msgBody.auditResult == 1 ? lang.msgPanel.forbid : lang.msgPanel.allow
        }${lang.msgPanel.temporaryInGroup}`;
    } else if (msgBody.type == 17) {
      content.preview = `${
        msgBody.operatorId != store.getters.userId ? msgBody.operatorName : lang.common.you
        }${
        msgBody.auditResult == 1 ? lang.msgPanel.forbid : lang.msgPanel.allow
        }${lang.msgPanel.addInGroup}`;
    } else if (msgBody.type == 21) {
      content.preview =
        msgBody.operatorName +
        lang.chatPanel.invite +
        msgBody.inviterNum +
        lang.chatPanel.userJoin;
    } else if (msgBody.type == 22) {
      content.preview =
        (msgBody.operatorId != store.getters.userId ?
          msgBody.operatorName :
          lang.common.you) +
        (msgBody.auditResult == 1 ?
          lang.common.accept :
          lang.common.refuse) +
        (msgBody.inviter[0].userId != store.getters.userId ?
          msgBody.inviter[0].userName :
          lang.common.you) +
        lang.chatPanel.theInvite;
    } else if (msgBody.type == 32) {
      content.preview = (msgBody.operatorId != store.getters.userId ?
          msgBody.operatorName :
          lang.common.you) +lang.chatSetting.deleteAffiche;
    }
    content.noChatInfo = true;
    resolve(content);
  },
  /**
   * 交易通知模板
   * @param {*} content 
   */
  tradeNoticeTemp(resolve, content) {
    if (content.msgContent.avatar) {
      content.msgContent.avatar = content.msgContent.avatar;
    } else {
      //content.msgContent.avatar = "./static/images/chat/img-username.png";
    }
    if (content.msgContent.type == "6") {
      content.msgContent.avatar = "./static/images/chat/img-redbag.png";
    }
    content.preview = lang.msgPanel.payOrder;
    resolve(content);
  },
  /**
   * 群{@模板}
   * @param {*} content 
   */
  groupAtTemp(resolve, fromId, content) {
    content.msgContent = JSON.parse(content.bodyContent);
    let atText = content.msgContent.showText.split("@%1Ss");
    let showText = atText[0];
    let userIds = content.msgContent.userIds;
    if (userIds.length == 1) {
      if (userIds[0] == 'allMember') {
        //@全体成员
        showText = showText + "@" + lang.msgPanel.all + " " + atText[1];
        content.msgContent = this.xssHandler(showText);
        content.preview = this.xssHandler(showText, true, true);
        resolve(content);
      } else {
        //单体
        sessionInfo.getChatInfo(1, fromId, userIds[0]).then(data => {
          showText = showText + "@" +
            (data ? data.nickName || data.userName : id) + " " + atText[1];
          content.msgContent = this.xssHandler(showText);
          content.preview = this.xssHandler(showText, true, true);
          resolve(content);
        });
      }
    } else {
      group.getGroupMember(fromId).then(userInfo => {
        for (let i = 0; i < userIds.length; i++) {
          let id = +userIds[i];
          if (userIds[i] == "allMember") {
            showText = showText + "@" + lang.msgPanel.all + " " + atText[i + 1];
          } else {
            showText = showText + "@" +
              (userInfo[id] ? userInfo[id].nickName || userInfo[id].userName : id) +
              " " + atText[i + 1];
          }
        }
        content.msgContent = this.xssHandler(showText);
        content.preview = this.xssHandler(showText, true, true);
        resolve(content);
      });
    }
  },
  /**
   * 好友通知模板
   * @param {*} content 
   */
  friendNoticTemp(resolve, content) {
    if (content.bodyFrom == store.getters.userId) {
      return resolve();
    }
    if (content.bodyContent == 2) {
      content.preview = content.bodyFrom == store.getters.userId ? lang.msgPanel.isFriend : lang.msgPanel.isPass;
    } else if (content.bodyContent == 5) {
      content.preview = lang.msgPanel.isSuccess;
    }
    content.noChatInfo = true;
    resolve(content);
  },
  /**
   * 消息撤回模板
   * @param {*} content 
   */
  msgWithdrawalTemp(resolve, content) {
    content.msgContent =
      typeof content.bodyContent == "object" ?
        content.bodyContent :
        JSON.parse(content.bodyContent);
    let nickName =
      content.bodyFrom == store.getters.userId ?
        "你" :
        this.getChatInfo(1, fromId, content.bodyFrom).nickName;
    content.preview = nickName + "撤回一条消息";
    content.noChatInfo = true
    resolve(content);
  },
  /**
   * 消息编辑模板
   * @param {*} content 
   */
  msgEditTemp(resolve, content) {
    content.msgContent =
      typeof content.bodyContent == "object" ?
        JSON.parse(JSON.stringify(content.bodyContent)) :
        JSON.parse(content.bodyContent);
    content.preview = this.xssHandler(content.msgContent.content, true, true);

    if (content.msgContent.editType == 30) {
      if (!(typeof content.msgContent.content == "object")) {
        content.msgContent.content = JSON.parse(
          content.msgContent.content
        );
      }
      let editBody = content.msgContent.content;

      content.preview = editBody.content;
      content.msgContent.content.content = this.xssHandler(
        editBody.content
      );

      if (editBody.repliedContent) {
        if (
          !(
            editBody.msgType == 2 ||
            editBody.msgType == 3 ||
            editBody.msgType == 4 ||
            editBody.msgType == 5 ||
            editBody.msgType == 18
          )
        ) {
          content.msgContent.content.repliedContent = this.xssHandler(
            editBody.repliedContent
          );
        }
      }
    } else {
      content.msgContent.content = this.xssHandler(
        content.msgContent.content
      );
    }
    // content.noChatInfo=true;
    resolve(content);
  },
  /**
   * 群邀请指令模板
   * @param {*} content 
   */
  groupInvitationTemp(resolve, content, fromId) {

    content.msgContent = typeof content.bodyContent == "object" ? content.bodyContent : JSON.parse(content.bodyContent);
    sessionInfo.getChatInfo(0, fromId).then(userInfo => {
      content.preview = content.bodyFrom == store.getters.userId ? lang.common.you : userInfo.nickName;
      content.preview += lang.chatPanel.invite;
      content.preview += content.bodyFrom == store.getters.userId ? userInfo.nickName : lang.common.you;
      content.preview += lang.groupInvite.toJoin;
      content.preview += '(' + content.msgContent.gName + ')';
      resolve(content);
    });

    // content.preview = `${
    //   content.bodyFrom == store.getters.userId
    //     ? lang.common.you
    //     : userInfo.nickName
    // }${lang.chatPanel.invite}${
    //   content.bodyFrom == store.getters.userId
    //     ? userInfo.nickName
    //     : lang.common.you
    // }${lang.groupInvite.toJoin}(${content.msgContent.gName})`;
    // console.log(content.preview)
    // resolve(content);
  },
  /**
   * 消息回复模板
   * @param {*} content 
   */
  msgReplyTemp(resolve, content) {
    content.msgContent =
      typeof content.bodyContent == "object" ?
        JSON.parse(JSON.stringify(content.bodyContent)) :
        JSON.parse(content.bodyContent);
    content.preview = this.xssHandler(content.msgContent.content, true, true);
    let msgType = content.msgContent.msgType;

    if (content.msgContent.repliedContent) {
      content.msgContent.content = this.xssHandler(
        content.msgContent.content
      );
      if (
        msgType == 1 ||
        msgType == 13 ||
        msgType == 24 ||
        msgType == 28 ||
        msgType == 30
      ) {
        content.msgContent.repliedContent = this.xssHandler(
          content.msgContent.repliedContent
        );
      }
    }
    resolve(content);
  },
  /**
   * 消息拒收模板
   * @param {*} content 
   */
  msgRejectionTemp(resolve, content) {
    if (content.bodyContent.type == 0) {
      content.preview = lang.msgPanel.notFriend;
    } else if (content.bodyContent.type == 1) {
      content.preview = lang.msgPanel.msgRefuse;
    } else if (content.bodyContent.type == 2) {
      content.preview = lang.msgPanel.inviteRefuse;
    } else if (content.bodyContent.type == 3) {
      content.preview = lang.forbidden.forbiddenTip;
    } else if (content.bodyContent.type == 4) {
      content.preview = lang.forbidden.tempTip;
    }
    content.noChatInfo = true
    resolve(content);
  },
  /**
   * 名片分享模板
   * @param {*} content 
   */
  shareCardTemp(resolve, content) {
    content.msgContent = JSON.parse(content.bodyContent);
    if (content.msgContent) {
      if (content.msgContent.avatar.indexOf('/') == 0) {
        content.msgContent.avatar = content.msgContent.avatar.substr(1);
      }
    }
    content.preview = "[" + lang.common.card + "]";
    resolve(content);
  },
  /**
   * 音视频消息体协议-用于会话展示模板
   * @param {*} content 
   */
  msgVideoTemp(resolve, content) {
    let isMe = store.getters.userId == content.bodyFrom;
    content.preview = `[${
      content.bodyContent.vType == "1"
        ? lang.common.videoCall
        : lang.common.audioCall
      }]`;

    switch (content.bodyContent.state) {
      case "1":
        content.msgContent =
          lang.msgPanel.initiates +
          (content.bodyContent.vType == "1" ?
            lang.msgPanel.video :
            lang.msgPanel.voice);
        break;
      case "2":
        content.msgContent =
          (isMe ? "" : lang.msgPanel.other) + lang.msgPanel.answered;
        break;
      case "3":
        content.msgContent =
          (content.bodyContent.vType == "1" ?
            lang.msgPanel.video :
            lang.msgPanel.voice) +
          lang.msgPanel.over +
          Util.formatTime(content.bodyContent.time);
        break;
      case "4":
        content.msgContent =
          (isMe ? "" : lang.msgPanel.other) +
          lang.msgPanel.refuse +
          (content.bodyContent.vType == "1" ?
            lang.msgPanel.video :
            lang.msgPanel.voice);
        break;
      case "5":
        content.msgContent =
          (isMe ? (lang.common.cancel + " ") : (lang.msgPanel.other + lang.msgPanel.cancel)) +
          (content.bodyContent.vType == "1" ?
            lang.msgPanel.video :
            lang.msgPanel.voice);
        break;
      case "6":
        content.msgContent = isMe ?
          lang.msgPanel.noResponse :
          lang.msgPanel.otherCancel;
        break;
      case "10":
        content.msgContent = isMe ?
          lang.msgPanel.otherBusy :
          lang.msgPanel.notAnswered;
        break;
      default:
        break;
    }
    content.noChatInfo = true
    resolve(content);
  },
  /**
   * 禁言模板
   * @param {*} content 
   */
  forbiddenTemp(resolve, paramId, content) {
    var banedBody = content.bodyContent;
    group.getMemberInfo(paramId, store.getters.userId).then(member => {
      var admin = member.isAdmin;
      if (admin > 0) {
        if (banedBody.type == 1) {
          content.preview = `${
            banedBody.operatorId != store.getters.userId ? banedBody.operatorName : lang.common.you
            }${
            banedBody.state == 1 ? lang.msgPanel.open : lang.msgPanel.cancel
            }${lang.msgPanel.allMute}`;
        } else if (banedBody.type == 2) {
          content.preview = `${banedBody.bannedPersonName}${banedBody.state == 1 ? lang.msgPanel.mute : lang.msgPanel.unmute}`;
        }
      } else {
        if (banedBody.type == 1) {
          content.preview = `${lang.msgPanel.groupManager}${
            banedBody.state == 1 ? lang.msgPanel.open : lang.msgPanel.cancel
            }${lang.msgPanel.allMute}`;
        } else if (banedBody.type == 2) {
          content.preview = `${lang.msgPanel.groupManager}${
            banedBody.state == 1
              ? lang.msgPanel.open
              : lang.msgPanel.cancel
            }${lang.forbidden.forbidden}`;
        }
      }
      content.noChatInfo = true
      resolve(content);
    })

  },
  /**
   * 消息清理模板
   * @param {*} content 
   */
  msgClearTemp(resolve, content, fromType, paramId) {
    var clearBody = content.bodyContent;

    if (fromType == "0") {
      content.preview = `${lang.chatSetting.settingAutoCleanTime +
        this.filterCycle(clearBody.cycle)}`;
      content.noChatInfo = true
      resolve(content);
    } else {
      group.getMemberInfo(paramId, store.getters.userId).then(member => {
        var admin = member.isAdmin;
        if (admin > 0) {
          content.preview =
            (clearBody.operatorId != store.getters.userId ?
              clearBody.operatorName :
              lang.common.you) +
            lang.chatSetting.settingAutoCleanTime +
            this.filterCycle(clearBody.cycle);
        } else {
          content.preview =
            lang.msgPanel.groupManager +
            lang.chatSetting.settingAutoCleanTime +
            this.filterCycle(clearBody.cycle);
        }
        content.noChatInfo = true;
        resolve(content);
      });
    }
  },
  /**
   * 消息转发模板
   * @param {*} content 
   */
  msgForwardingTemp(resolve, content) {
    content.preview = `[${lang.common.chatRecord}]`;
    content.msgContent = JSON.parse(content.bodyContent);
    resolve(content);
  },
  /**
   * 系统公告协议模板
   * @param {*} content 
   */
  systemNoticTemp(resolve, content) {
    content.preview = content.bodyContent[_langIdx].title;
    content.bodyContent = content.bodyContent[_langIdx];
    resolve(content);
  },
  /**
   * 公告模板
   * @param {*} content 
   */
  afficheTemp(resolve, content) {
    console.log(content)
    content.msgContent = JSON.parse(content.bodyContent);
    content.msgContent.affiche = this.xssHandler(content.msgContent.affiche, false, false);
    content.preview = "[" + lang.common.affiche + "]";
    resolve(content);
  },



  // 标签空格替换、预防xss等
  xssHandler(text, br, rFace) {
    if (!br) {
      text = text.replace("<", "&lt;").replace(">", "&gt;");
      text = text.replace(/[\n\r]/g, "<br/>");
    }
    if (!rFace) {
      text = this.resetUrl(text);
      text = face.checkFace(text);
    } else {
      text = face.checkFaceI18n(text, _langIdx);
    }
    return text;
  },
  //链接替换成<a>标签
  resetUrl(str) {
    str = str.replace(/ /g, "||nbsp|");
    let reg = /((https|http|ftp|rtsp|mms)?:\/\/)?(([0-9a-z_!~*'().&=+$%-]+: )?[0-9a-z_!~*'().&=+$%-]+@)?(([0-9]{1,3}\.){3}[0-9]{1,3}|([0-9a-z_!~*'()-]+\.)*([0-9a-z][0-9a-z-]{0,61})?[0-9a-z]\.[a-z]{2,6})(:[0-9]{1,5})?((\/?)(\/[0-9a-z_!~*'().;?:@&=+$,%#-]+)+)?/gi;
    // var Expression="(?:(?:http|https)://)?[\\w./?:@=#-]+\\.([\\w./?:@=#-])*"
    // var reg=new RegExp(Expression);
    // let reg = /(?:([A-Za-z]+):)?(\/{0,3})([0-9.\-A-Za-z]+)(?::(\d+))?(?:\/([^?#]*))?(?:\?([^#]*))?(?:#(.*))?$/
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
  filterCycle(cycle) {
    if (!lang) lang = store.state.lang;
    if (cycle == "0") {
      return lang.chatSetting.never;
    } else if (cycle == "1") {
      return lang.chatSetting.one;
    } else if (cycle == "2") {
      return lang.chatSetting.three;
    } else if (cycle == "3") {
      return lang.chatSetting.seven;
    } else if (cycle == "4") {
      return lang.chatSetting.thirty;
    }
  },
}