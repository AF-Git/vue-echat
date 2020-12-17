import {
  face
} from "@/tools/emoji.js";
import {
  Util
} from "@/tools/utils";
import {
  EchatDB
} from "@/tools/indexedDB";
import {
  localStore
} from "@/tools/localStorage";
import {
  MessageHandler
} from "@/tools/messageHandler";
import {
  Crypto
} from "@/tools/crypto"
import Rtc from "@/tools/rtc-message";
import Msg from "@/tools/msg";
import QRCode from "qrcode";
import ChatSetting from "@/components/char-panel-components/ChatSetting";
import ChatHeader from "@/components/char-panel-components/ChatHeader";
import FilePopup from "@/components/char-panel-components/FilePopup";
import PicturePopup from "@/components/char-panel-components/PicturePopup";
import MessageOperation from "@/components/char-panel-components/MessageOperation";
import Card from "@/components/char-panel-components/Card";
import FriendInformation from "@/components/char-panel-components/FriendInformation";
import GroupInformation from "@/components/char-panel-components/GroupInformation";
import Announcement from "@/components/group/Announcement";
import DeleteMessage from "@/components/char-panel-components/DeleteMessage";
import GroupInvite from "@/components/char-panel-components/GroupInvite";
import AtBox from "@/components/char-panel-components/AtBox";
import SendButton from "@/components/char-panel-components/SendButton";
import GroupReaded from "@/components/char-panel-components/GroupReaded";
import VerifyInviter from "@/components/char-panel-components/VerifyInviter";
import MsgRecord from "@/components/char-panel-components/MsgRecord";
import {
  Config
} from "@/common/config"
import {
  mapGetters
} from "vuex";
import {
  friend
} from "@/session/friend";
import {
  group
} from "@/session/group";
import {
  msgManager
} from "@/session/msgManager";
import {
  sessionUtil
} from "@/session/sessionUtil";
import Emoji from "@/components/char-panel-components/Emoji";

export default {
  name: "chat-panel",
  data() {
    return {
      back: "",
      chatScrollTop: 0, // 滚动高度
      scrollFlag: 0, // 0-加载更多 1-加载中  2-没有更多了
      showMore: false,
      forwardStatus: false,
      LastMsgTime: 0,
      editFocus: false,
      playVoiceId: 0,
      friendInfo: {},
      atDeleteNum: 1,
      atList: {
        show: false,
        list: [],
        left: 400,
        top: 480,
        showAll: false,
        hasMyself: true
      },
      dropFileInfo: {
        show: false,
        info: {}
      },
      pasteImage: {
        show: false,
        info: {}
      },
      qrCode: {
        show: false,
        left: 0,
        top: 0
      },
      msgPageNum: 1,
      msgPageSize: 30,
      readNum: 0,
      currentUnread: {
        num: 0,
        lastReadId: 0
      },
      goto: "top",
      atId: "",
      mewMsgId: 0,
      forbiddenWord: 0,
      inviter: [],
      msgRecord: {},
      moreThan: false,
      timer: null,
      comeInTime: '',
      firstMsgId: 0, //会话起始ID
      miniMsgId: null, //当前页最小ID
      goupMemberNum: 0, //群成员数量
      t_pro: null, //播放语言定时器
      showSuccess: false,
      otherIsTyping: false, //对方正在输入
      t_typing: null,
      sendTypingReady: true,
      draguplod: false,
      operationIndex: 0,
      isAdmin: false,
      affiche: "",
      afficheType: 0,
    };
  },
  components: {
    ChatSetting,
    ChatHeader,
    Emoji,
    FilePopup,
    PicturePopup,
    MessageOperation,
    QRCode,
    Card,
    FriendInformation,
    GroupInformation,
    Announcement,
    DeleteMessage,
    GroupInvite,
    // InputMenu,
    AtBox,
    SendButton,
    GroupReaded,
    VerifyInviter,
    MsgRecord
  },
  computed: {
    ...mapGetters([
      "userId",
      "userInfo",
      "currentSession",
      "session",
      "message",
      "progress",
      "lastGroupMsg",
      "hasCurrentMsg",
      "atObj",
      "verifyGroup",
      "activityGroupMembers",
      "layout",
      "bubbles",
      "backurl",
    ]),
    myself() {
      if (this.bubbles.mybackground != "#FFFFFF") {
        return true
      } else {
        return false
      }
    },
    uploadInfo() {
      let list = this.$store.state.uploadInfo;
      let arr = list.map(v => {
        v.toId == this.currentSession.paramId;
      });
      return arr;
    },
    chatHistory() {
      //会被多次初始化？
      let arr = Object.values(this.message);
      let lastTime = 0;
      arr.map(v => {
        v.showTime = false;
        if (Util.isShowTime(+lastTime, +v.bodyTime)) {
          v.showTime = true;
          lastTime = v.bodyTime;
        }
      });
      arr = arr.sort((a, b) => +a.bodyTime - +b.bodyTime);
      return arr;
    },
    // groupUserList() {

    //   if (this.currentSession.fromType == "1" &&this.activityGroupMembers) {
    //     return Object.values(this.activityGroupMembers);
    //   }
    //   return [];
    // },
    at() {
      return this.$store.state.atList[this.currentSession.paramId];
    },
    groupAffiche() {
      return this.$store.state.affiche[this.currentSession.paramId];
    },
    isTyping() {
      return this.$store.state.isTyping;
    }
  },
  watch: {
    "currentSession.paramId"(newValue, oldValue) {

      if (this.currentSession.fromType != "2" && this.$refs.operation) {
        this.$refs.operation.edit.show = false;
        this.$refs.operation.replied.show = false;
      }

      this.scrollFlag = 1;
      this.msgPageNum = 1;
      this.chatScrollTop = 0;
      this.showMore = false;
      this.currentUnread = {
        num: 0,
        lastReadId: 0
      };
      this.goto = "top";
      this.mewMsgId = 0;
      this.forbiddenWord = 0;
      this.inviter = [];
      this.msgRecord = {};
      this.atList.show = false;
      if (this.t_pro) clearInterval(this.t_pro); //关闭语音播放

      if (this.currentSession.fromType == "0") {
        friend.getNetworkSession(this.currentSession.paramId).then(data => {
          this.friendInfo = data;
          if (this.friendInfo.state != 1) {
            this.currentSession.temp = true;
            this.currentSession.isForbidChat = this.friendInfo.isForbidChat;
            this.currentSession.isFriend = this.friendInfo.isFriend;
            if (this.friendInfo.isForbidChat == 1) {
              this.currentSession.isBanned = 3;
            } else {
              this.currentSession.isBanned = 0;
            }
            this.$store.commit("UPDATE_CURRENT_SESSION", JSON.parse(JSON.stringify(this.currentSession)));
          }
          if (data.readMsgId) {
            let msg = this.message;
            for (let key in msg) {
              let m = msg[key];
              if (m.mId <= data.readMsgId) {
                if (!m.readNum) {
                  m.readNum = 1;
                  this.$store.commit("UPDATE_MESSAGE_READ", m);
                }
              }
            }
            msgManager.setReadMsgBySessionId(this.currentSession.fromType, this.currentSession.paramId, data.readMsgId);
          }
        });
        this.init();
      } else if (this.currentSession.fromType == "1") {
        let groupInfo = this.$store.state.groupList[this.currentSession.paramId];
        if (groupInfo) {
          this.goupMemberNum = groupInfo.memberNum;
          if (groupInfo.memberNum < 1) {
            this.$store.dispatch("getGroupMember", {
              groupId: this.currentSession.paramId
            })
              .then(() => {
                this.init();
              });
          } else {
            this.init();
          }
        } else {
          this.$store.dispatch("getGroupMember", {
            groupId: this.currentSession.paramId
          })
            .then(() => {
              this.init();
            });
        }


        this.$store.dispatch("getReadNum", {
          groupId: this.currentSession.paramId
        });
      } else {
        this.init();
      }

      this.$store.commit("SET_AT", {
        groupId: oldValue,
        mId: []
      });

      this.$store.commit("SET_LAST_GROUP_MSG", {
        msgId: 0,
        readNum: 0
      });

    },
    "currentSession.isBanned"(newValue, oldValue) {
      this.forbiddenWord = this.currentSession.isBanned ? this.currentSession.isBanned : 0;
    },
    "isTyping.status"(newValue, oldValue) {
      if (this.isTyping.status) {
        this.$store.commit("SET_IS_TYPING", {
          status: false
        });
        this.showTyping();
      }
    },
    progress: {
      handler() {
        this.chatHistory.forEach(item => {
          if (item.bodyTime == this.progress.id) {
            item.loading = 0;
            item.msgContent.progress = this.progress.num;
          }
        });
      },
      deep: true
    },
    chatHistory(newValue, oldValue) {
      if (this.chatScrollTop > 0 && this.$refs.list.scrollTop > 0) {
        if (this.$refs.list.scrollTop > this.chatScrollTop - 500) {
          this.$nextTick(() => {
            this.$refs.list.scrollTop = this.$refs.list.scrollHeight;
          });
        } else {
          if (
            newValue.length > oldValue.length &&
            newValue[newValue.length - 1].bodyFrom != this.userId
          ) {
            this.currentUnread.num = +this.currentUnread.num + 1;
            this.currentUnread.lastReadId = this.chatHistory[this.chatHistory.length - 1].mId;
          }
          this.goto = "bottom";
        }
      }

    },
    atObj() {
      if (this.atObj.nickName) {
        if (this.forbiddenWord > 0) {
          this.$store.commit("SET_TOAST_TEXT", this.$t("msg.forbidden.mute"));
        } else {
          Util.focusLast(this.$refs.editMsg);
          Util.insertAtCursor(this.$refs.editMsg, "@", false);
          this.selectAtItem(this.atObj);
          this.$store.commit("SET_AT_OBJ", {});
        }
      }
    },
    verifyGroup() {
      this.inviter = localStore.readInviterCode(this.currentSession.paramId);
    },
    showMore() {
      if (this.showMore) {
        let ids = localStore.getStore("selectedIds");
        if (ids) {
          ids = JSON.parse(ids);
          for (let i = this.chatHistory.length; i--;) {
            if (ids.includes(this.chatHistory[i].mId)) {
              this.chatHistory[i].checked = true;
            }
          }
          localStore.removeStore("selectedIds");
        }
      } else {
        for (let i = this.chatHistory.length; i--;) {
          this.chatHistory[i].checked = false;
        }
      }
    }
  },
  methods: {
    // //下载重命名
    // clickdownload(e) {
    //   let url = e.target.getAttribute('href')
    //   let name = e.target.getAttribute('download')
    //   this.download(url, name)
    // },
    // /**
    //  * 获取 blob
    //  * @param  {String} url 目标文件地址
    //  * @return {cb} 
    //  */
    // getBlob(url, cb) {
    //   var xhr = new XMLHttpRequest();
    //   xhr.open('GET', url, true);
    //   xhr.setRequestHeader("token", this.$store.state.token);
    //   xhr.responseType = 'blob';
    //   xhr.onload = function () {
    //     if (xhr.status === 200) {
    //       cb(xhr.response);
    //     }
    //   };
    //   xhr.send();
    // },
    // /**
    //  * 保存
    //  * @param  {Blob} blob     
    //  * @param  {String} filename 想要保存的文件名称
    //  */
    // saveAs(blob, filename) {
    //   if (window.navigator.msSaveOrOpenBlob) {
    //     navigator.msSaveBlob(blob, filename);
    //   } else {
    //     var link = document.createElement('a');
    //     var body = document.querySelector('body');

    //     link.href = window.URL.createObjectURL(blob);
    //     link.download = filename;

    //     // fix Firefox
    //     link.style.display = 'none';
    //     body.appendChild(link);

    //     link.click();
    //     body.removeChild(link);

    //     window.URL.revokeObjectURL(link.href);
    //   };
    // },
    // /**
    //  * 下载
    //  * @param  {String} url 目标文件地址
    //  * @param  {String} filename 想要保存的文件名称
    //  */
    // download(url, filename) {
    //   let that = this
    //   that.getBlob(url, function (blob) {
    //     that.saveAs(blob, filename);
    //   });
    // },
    showAffiche(title, type, status) {
      this.operationIndex = 1;
      this.affiche = title;
      this.afficheType = type;
      this.isAdmin = status;
    },
    updateAffiche() {
      if (this.$refs.groupInformation) this.$refs.groupInformation.updateAffiche();
    },
    getAfficheDetail() {
      this.$http.getGroupAffiche({ groupId: this.currentSession.paramId }).then(data => {
        let self = this.activityGroupMembers[this.userId];
        this.isAdmin = (self.isAdmin > 0) ? true : false;
        this.affiche = data && data.affiche ? data.affiche : "";
        this.afficheType = data && data.type ? data.type : 0;

        this.showAffiche(this.affiche, this.afficheType, this.isAdmin);
        this.deleteAffiche();
      });
    },
    deleteAffiche() {
      this.$store.commit("DELETE_AFFICHE", this.currentSession.paramId);
    },
    showTyping() {
      if (this.t_typing) clearInterval(this.t_typing);
      this.otherIsTyping = true;
      this.t_typing = setTimeout(() => {
        this.otherIsTyping = false;
      }, 2000);
    },
    selectAll(event) {
      let file = event.target.files;
      let type = []
      for (let i = 0; i < file.length; i++) {
        type.push(file[i].type.substring(0, 5))
      }
      let ifImg = type.every(function (item) {
        return item == "image"
      });
      if (ifImg) {
        this.$refs.sendPicture.selectImg(event)
      } else {
        this.$refs.sendFile.selectFile(event)
      }
    },
    doShowSuccess() {
      this.showSuccess = true;
      setTimeout(() => {
        this.showSuccess = false;
      }, 1500);
    },
    init() {
      this.$store.commit("CLEAR_MESSAGE", {});

      this.miniMsgId = this.currentSession.mId;
      this.firstMsgId = this.currentSession.firstMsgId == undefined ? 0 : this.currentSession.firstMsgId;

      let count = this.currentSession.mId - this.currentSession.lastReadId;
      let size = this.msgPageSize;

      if (count > this.msgPageSize && count < 100) {
        size = +count;
      }

      if (this.currentSession.fromType == "1") {
        this.inviter = localStore.readInviterCode(this.currentSession.paramId);
        localStore.updateInviterState(this.currentSession.paramId);
        this.$store.commit("SET_GROUP_INVITE", {});
        setTimeout(() => {
          this.$refs.list.scrollTop = this.$refs.list.scrollHeight + 50;
        }, 500);
      }
      //读取本地缓存
      msgManager.getMsg(this.currentSession.fromType, this.currentSession.paramId, this.miniMsgId, this.firstMsgId, false, this.msgPageSize).then(data => {
        if (this.currentSession.fromType == data.fromType && this.currentSession.paramId == data.paramId) {
          this.$store.commit("CLEAR_MESSAGE", {});
          this.showMsg(data)
        }
      })
    },
    /**
     * 展示消息
     * @param {*} record 
     */
    showMsg(record) {
      let data;
      let dataLength = 0;
      if (record != undefined) {
        this.firstMsgId = record.firstMsgId;
        this.currentSession.firstMsgId = this.firstMsgId;
        data = record.data;
        if (data != undefined) {
          if (data.constructor == Array && data.length > 0) {
            dataLength = data.length;
            this.miniMsgId = data[data.length - 1].mId;
          } else {
            let cData = Object.values(data);
            cData.sort((a, b) => b.bodyTime - a.bodyTime); //倒叙
            dataLength = cData.length;
            let b = cData[cData.length - 1];
            if (b != undefined) {
              this.miniMsgId = b.mId;
            }
          }
        } else {
          data = {};
        }

        this.$store.commit("ADD_MESSAGE", data);
        this.ready();
      }

      setTimeout(() => {
        this.$refs.list.scrollTop =
          this.$refs.list.scrollHeight - this.chatScrollTop + 35;
        this.chatScrollTop = this.$refs.list.scrollHeight;
        this.scrollFlag = 0;
        if (dataLength < 30) {
          this.scrollFlag = 2;
        }
      }, 50);
    },

    ready() {
      // 清除角标
      let cs = this.currentSession;
      let count = cs.mId - cs.lastReadId;

      if (count > 7) {
        this.currentUnread.num = count;
        this.currentUnread.lastReadId = cs.lastReadId
      }
      if (count > 0) {
        // 更改服务器lastReadId 清除角标
        this.$store.dispatch("getSessionList", {
          time: sessionUtil.getlocalSessionTime(),
          froms: this.currentSession.paramId + "-" +
            this.currentSession.fromType + "-" +
            this.currentSession.mId
        }).then(data => {
          sessionUtil.setLocalSessionTime(data.time);
        });
        // 发送已读指令
        var rxml = "";


        let id = new Date().getTime() + '' + parseInt(Math.random * 1000);

        if (this.currentSession.fromType == "0") {
          rxml = `<message xmlns="jabber:client" type="chat" to="${this.currentSession.paramId}@bcircle.net" id="${id}" from="${this.userId}@bcircle.net/webIm"><body>{"bodyLevel":0, "bodyContent":"${this.currentSession.mId}", "bodyType":17, "bodyFrom":"${this.userId}"}</body></message>`;
        } else if (this.currentSession.fromType == "1") {
          rxml = `<message xmlns="jabber:client" type="chat" to="${this.currentSession.paramId}@group.bcircle.net" id="${id}" from="${this.userId}@bcircle.net/webIm"><body>{"bodyLevel":0, "bodyContent":"${this.currentSession.mId}", "bodyType":17, "bodyFrom":"${this.userId}"}</body></message>`;
        }

        this.$store.dispatch("sendReply", rxml);
      }

      cs.lastReadId = cs.mId;
      this.$store.commit("UPDATE_CURRENT_SESSION", cs);
      this.$store.commit("UPDATE_SESSION", cs);

      // 插入缓存上传中文件消息
      var list = this.$store.state.uploadInfo;
      list.forEach(item => {
        if (this.currentSession.paramId == item.toId) {
          this.$store.commit("UPDATE_MESSAGE", item);
        }
      });

      if (this.forbiddenWord == 0 && this.currentSession.fromType != 2) {
        this.$refs.editMsg.innerHTML = this.currentSession.draft || "";
        Util.focusLast(this.$refs.editMsg);
      }
    },
    loadMore() {
      // 上拉加载更多
      if (this.scrollFlag) return;

      this.msgPageNum++;

      this.scrollFlag = 1;
      this.chatScrollTop = this.$refs.list.scrollHeight;
      //读取本地缓存
      msgManager.getMsg(this.currentSession.fromType, this.currentSession.paramId, this.miniMsgId, this.firstMsgId, true, this.msgPageSize).then(data => {
        if (this.currentSession.fromType == data.fromType && this.currentSession.paramId == data.paramId) {
          this.showMsg(data)
        }
      })

    },
    startChat(data) {
      if (data.friend) {
        this.startSession(data);
      } else {
        let obj = {
          sessionId: data.userView.userId,
          state: 8,
          describe: ''
        };
        this.$http.startTempSession(obj).then(() => {
          data.userView.temp = true;
          this.$store.commit("ADD_FRIEND_INFO", {
            userId: data.userView.userId,
            info: data.userView
          });
          this.startSession(data);
        });
      }
    },
    startSession(data) {
      let userView = data.userView;
      var chat = this.$store.state.session.record[userView.userId + '-0'];
      if (!chat) {
        chat = {
          img: userView.avatar,
          lastReadId: 0,
          mId: 0,
          fromType: 0,
          msgType: 1,
          preview: "",
          userTime: new Date().getTime(),
          name: data.nickName,
          paramId: userView.userId,
          isTop: 0,
          isInterruption: 0,
          temp: true,
          describe: '',
          isActivity: true,
        };
        this.$store.commit("UPDATE_SESSION", chat);
      }
      this.$store.commit("CLEAR_MESSAGE", {});
      setTimeout(() => {
        let sessionCache = this.$store.state.session.record;
        for (let key in sessionCache) {
          if (sessionCache[key].isActivity) {
            sessionCache[key].isActivity = false;
          }
        }
        chat.isActivity = true;
        this.$store.commit("UPDATE_CURRENT_SESSION", chat);
      }, 500);
    },
    interceptor(ev, item) {
      let tagName = ev.target.tagName;
      if (tagName != "A") return;

      let url = ev.target.innerHTML;

      if (url.indexOf("/t/f") > 0 || url.indexOf("/t/q") > 0 || url.indexOf("/t/g") > 0) {
        this.$http.postShareUrl(url).then(data => {
          if (data.identifying == 'g') {
            //群ID
            let sCache = this.$store.state.session.record[data.groupId + '-1']
            if (sCache) {
              let sessionCache = this.$store.state.session.record;
              for (let key in sessionCache) {
                if (sessionCache[key].isActivity) {
                  sessionCache[key].isActivity = false;
                }
              }
              sCache.isActivity = true;
              this.$store.commit("UPDATE_CURRENT_SESSION", sCache);
            }
          } else if (data.identifying == 'f') {
            let sCache = this.$store.state.session.record[data.userId + '-0']
            if (sCache) {
              let sessionCache = this.$store.state.session.record;
              for (let key in sessionCache) {
                if (sessionCache[key].isActivity) {
                  sessionCache[key].isActivity = false;
                }
              }
              sCache.isActivity = true;
              this.$store.commit("UPDATE_CURRENT_SESSION", sCache);
            } else {
              //用户ID
              this.$store.dispatch("getFriendList", {}).then(() => { });
            }

          } else {
            //q  个人详情页          
          }

        });
        return false;
      }
      //别名新开会话
      if (url.indexOf("/u/@") > 0) {
        let alias = url.split('/u/@')[1];
        this.$http.getUserByAlias({
          alias: alias
        }).then(data => {
          this.startChat(data);
        });
        return false;
      }

      let arr = url.split("?");

      if (arr[1] && arr[1].indexOf("encryStr=") == 0) {
        let encryStr = arr[1].replace("encryStr=", "");
        encryStr = Crypto.decryptByDES(encryStr);
        let arr1 = encryStr.split("/");

        let obj = {
          groupId: arr1[1],
          joinType: 4,
          shareId: arr1[2]
        };

        this.$http.userJoinGroup(obj).then(() => {
          group.getGroupAll(true);
        });
      } else if (arr[1] && arr[1].indexOf("/0") > 0) {
        let encryStr = arr[2].replace(/^XG/, "");
        encryStr = Crypto.decryptByDES(encryStr);

        let obj = {
          recipient: encryStr,
          source: 5
        };

        this.$http.addFriendShare(obj).then(() => {
          this.$store.dispatch("getFriendList", {}).then(() => { });
        });
      } else {
        if (
          !(
            url.indexOf("ftp") >= 0 ||
            url.indexOf("http") >= 0 ||
            url.indexOf("https") >= 0
          )
        ) {
          url = "https://" + url;
        }

        var a = document.createElement("a");
        var event = new MouseEvent("click");
        a.href = url;
        a.target = "_blank";
        a.dispatchEvent(event);
      }
    },
    openSetting() {
      if (this.layout.module == "cs") {
        this.$store.dispatch("setLayout", ["", "", false]);
        return;
      }
      this.$store.dispatch("setLayout", ["cs", "cs", false]);
    },
    showInformation() {

      //临时会话禁止打开详情
      if (this.currentSession.temp) return;

      if (this.layout.module == "gp-inf" || this.layout.module == "fd-inf") {
        this.$store.dispatch("setLayout", ["", "", false]);
        return;
      }

      if (this.currentSession.fromType == 1) {
        this.$store.dispatch("setLayout", ["gp-inf", "gi", false]);
      } else {
        this.$store.dispatch("setLayout", ["fd-inf", "fi", false]);
      }
    },
    showmemberProfile(id) {
      this.$store.dispatch("setLayout", ["gmi", [id], true]);
    },
    historySelect(item) {
      item.checked = !item.checked;
      if (item.checked) {
        if (item.bodyType == 4 || item.bodyType == 29 || item.bodyType == 32 || item.bodyType == 47) {
          this.forwardStatus = true;
        }
      } else {
        if (item.bodyType == 4 || item.bodyType == 29 || item.bodyType == 32 || item.bodyType == 47) {
          this.forwardStatus = false;
        }
      }
    },
    showForward() {
      if (this.forbiddenWord > 0) {
        this.$store.commit("SET_TOAST_TEXT", this.$t("msg.forwardInfo.mute"));
        return false;
      }
      //语音、名片、邀请链接不能转发
      if (this.forwardStatus) return false;

      let ids = this.getIds(this.chatHistory);
      if (!ids) {
        this.$store.commit(
          "SET_TOAST_TEXT",
          this.$t("msg.chatPanel.forwardMsg")
        );
        return false;
      }
      let body = this.getBodyArr(this.chatHistory);
      let forwardInfo = {
        show: true,
        body: body
      };
      this.$store.commit("SET_FORWARD_INFO", forwardInfo);
      this.showMore = false;
      this.forwardStatus = false;
    },
    showDelete() {
      let ids = this.getIds(this.chatHistory);
      if (!ids) {
        this.$store.commit(
          "SET_TOAST_TEXT",
          this.$t("msg.chatPanel.deleteMsg")
        );
        return false;
      }
      this.$store.commit("SET_DELETE_INFO", {
        show: true,
        paramId: this.currentSession.paramId,
        fromType: this.currentSession.fromType,
        ids: ids,
        idsArr: ids.split(",")
      });
      this.forwardStatus = false;
    },
    getBodyArr(list) {
      var result = [];
      if (list && list.length) {
        for (var i = 0; i < list.length; i++) {
          var item = list[i];
          if (item.checked == true) {
            let body = {
              msgType: item.bodyType,
              bodyContent: item.bodyContent,
              msgContent: item.msgContent,
              preview: item.preview
            };
            result.push(body);
          }
        }
      } else {
        result = [];
      }
      return result;
    },
    getIds(list) {
      var result = "";
      if (list && list.length) {
        for (var i = 0; i < list.length; i++) {
          var item = list[i];
          if (item.checked == true) result += item.mId + ",";
        }
        result = result.substr(0, result.length - 1);
      } else {
        result = "";
      }
      return result;
    },
    goFocus(id) {
      var replied = document.getElementById(id);
      if (!replied) {
        let arrayCache = Object.keys(this.message);
        let fistMsgId = arrayCache[0],
          lastMsgId = arrayCache[arrayCache.length - 1];
        if (id < fistMsgId) {
          //获取数据
          msgManager.skipSpecifyMsg(this.currentSession.fromType, this.currentSession.paramId, this.miniMsgId, this.firstMsgId, id, data => {
            // debugger;
            if (this.currentSession.fromType == data.fromType && this.currentSession.paramId == data.paramId) {
              this.showMsg(data);
              setTimeout(() => {
                let list = data.data;
                if (list && list.length) {
                  let minId = list[list.length - 1].mId;
                  let maxId = list[0].mId;
                  let hasId = false;
                  if (id >= minId && id <= maxId) {
                    for (let i = 0; i < list.length; i++) {
                      if (id == list[i].mId) hasId = true;
                    }
                    if (hasId) {
                      this.$refs.list.scrollTop = document.getElementById(id).offsetTop;
                      this.atId = id;
                      setTimeout(() => {
                        this.atId = "";
                      }, 1000);
                    } else {
                      this.$store.commit("SET_TOAST_TEXT", this.$t("msg.chatPanel.msgNotFound"));
                      return false;
                    }
                  }
                }
              }, 500);

            }
          })
          return false;
        } else {
          //此消息ID已经被删除，获取一个最近ID
          id = id - 1;
          for (let i = 0; i < arrayCache.length; i++) {
            if (this.message.hasOwnProperty(id - i)) {
              id = id - i;
              break;
            }
          }
          this.$store.commit("SET_TOAST_TEXT", this.$t("msg.chatPanel.msgNotFound"));
          return false;
        }
      }
      this.$refs.list.scrollTop = document.getElementById(id).offsetTop;
      this.atId = id;
      setTimeout(() => {
        this.atId = "";
      }, 1000);
    },
    readAt(type) {
      if (type == "all") {
        this.$store.commit("SET_AT", {
          groupId: this.currentSession.paramId,
          mId: []
        });
      }
      this.goFocus(this.at[0]);
      this.at.shift();
    },
    gotoUnread() {
      
      this.mewMsgId = this.currentUnread.lastReadId;
      let gotoId = this.mewMsgId
      if(this.goto == 'top') gotoId = this.mewMsgId+1;
      this.goFocus(gotoId);
      this.currentUnread = {
        num: 0,
        lastReadId: 0
      };
      this.$store.dispatch("getSessionList", {
        time: sessionUtil.getlocalSessionTime(),
        froms: this.currentSession.paramId +
          "-" +
          this.currentSession.fromType +
          "-" +
          this.currentSession.mId
      });
      this.$store.commit("SET_AT", {
        groupId: this.currentSession.paramId,
        mId: []
      });
    },
    scrollY() {

      if (this.currentUnread.num < 1 || (30 >= this.chatHistory.length && !this.mewMsgId))
        return;
      this.currentUnread = {
        num: 0,
        lastReadId: 0
      };
      this.mewMsgId = 0;
      this.$store.dispatch("getSessionList", {
        time: sessionUtil.getlocalSessionTime(),
        froms: this.currentSession.paramId +
          "-" +
          this.currentSession.fromType +
          "-" +
          this.currentSession.mId
      });
    },
    setCurrentTime(e, item, index) {
      let audio = document.getElementById("message-voice");
      audio.src = this.global.fileDownUrl + 'original/' + item.msgContent.voiceUrl;
      audio.currentTime = e.offsetX * item.msgContent.duration / 160;
      item.msgContent.proNum = audio.currentTime;
      clearInterval(this.t_pro);
      this.voicePlay(item, index)
    },
    startPro(item, status) {
      if (status) {
        this.t_pro = setInterval(() => {
          if (item.msgContent.proNum < item.msgContent.duration) {
            item.msgContent.proNum = item.msgContent.proNum + 0.1;
          } else {
            clearInterval(this.t_pro);
            item.msgContent.proNum = 0;
          }
        }, 100)
      } else {
        clearInterval(this.t_pro);
      }
    },
    timeNum(num) {
      if (!num) num = 0;
      let result = parseInt(num);
      result = result > 9 ? result : '0' + result
      return result
    },
    pxNum(num, sum) {
      let result = num * 160 / sum;
      return parseInt(result) + 'px'
    },
    voicePlay(item, index) {
      //更新本地消息记录
      if (!item.msgContent.isPlay) {
        item.msgContent.isPlay = true;
        let obj = {};
        obj[item.mId] = JSON.parse(JSON.stringify(item));
        msgManager.updateMsgBatch(this.currentSession.fromType, this.currentSession.paramId, obj)
      }
      if (!item.msgContent.proNum) item.msgContent.proNum = 0;

      let audio = document.getElementById("message-voice");
      if (this.playVoiceId>=0 && 
        this.chatHistory[this.playVoiceId] && 
        this.chatHistory[this.playVoiceId].bodyType==4 && 
        this.playVoiceId != index) 
      {
        this.chatHistory[this.playVoiceId].msgContent.isPlaying = false;
        this.chatHistory[this.playVoiceId].msgContent.proNum = 0;
        clearInterval(this.t_pro);
        audio.pause();
      }
      this.playVoiceId = index;

      if (audio.paused) {
        let voiceSrc = this.global.fileDownUrl + 'original/' + item.msgContent.voiceUrl;
        if (voiceSrc.indexOf('?') > 0) {
          voiceSrc = voiceSrc.split('?')[0];
        }
        audio.src = voiceSrc;
        audio.currentTime = item.msgContent.proNum
        audio.play();
        item.msgContent.isPlaying = true;
        this.startPro(item, true);
      } else {
        audio.pause();
        item.msgContent.isPlaying = false;
        this.startPro(item, false);
      }
      //播放结束事件
      audio.onended = () => {
        item.msgContent.isPlaying = false;
        for (let i = index + 1; i < this.chatHistory.length; i++) {
          let msg = this.chatHistory[i];
          if (msg.bodyType == 4 && !msg.msgContent.isPlay) {
            this.voicePlay(msg, i)
            break;
          }
        }
      };
      audio.onerror = error => {
        console.error(error);
        item.msgContent.isPlaying = false;
        item.msgContent.proNum = 0;
        clearInterval(this.t_pro);
        this.$store.commit("SET_TOAST_TEXT", this.$t("msg.chatPanel.voiceFail"));
      }
    },

    scorllBox() {
      let top = (document.body.clientHeight - 679) / 2 + 86;
      let timer = null;

      document.onmousemove = (ev) => {
        if (top + 20 > ev.clientY && ev.clientY > top) {
          clearInterval(timer);
          timer = setInterval(() => {
            this.$refs.list.scrollTop = this.$refs.list.scrollTop - 5;
          }, 60)
        } else {
          clearInterval(timer);
        }
      }

      document.onmouseup = (e) => {
        document.onmousemove = null;
        clearInterval(timer);
        timer = null;
      };

      // document.ondragstart = () =>{
      //   return false
      // }
    },
    mouseEnter(event, data) {
      if (data.progress < 100) return;
      this.qrCode.top = event.clientY;
      this.qrCode.left = event.clientX;
      this.qrCode.show = true;
      let canvas = document.getElementById("qrcodeCanvas");
      QRCode.toCanvas(canvas, this.global.fileDownUrl + 'compress/' + data.url, error => {
        if (error) console.error(error);
      });
    },
    clickCard(event, value) {
      event.stopPropagation();
      this.$refs.card.show(event, value);
    },
    groupInvite(item) {
      this.$refs.groupInvite.show(item);
    },
    msgChange(event) {

      //发送指令正在输入
      if (this.currentSession.fromType == 0) this.sendTyping();

      //@功能过滤单聊
      if (this.currentSession.fromType == 0) return
      //@功能过滤编辑
      if (this.$refs.operation.edit.show) return
      //@功能过滤回复
      if (this.$refs.operation.replied.show) return

      this.editFocus = false;
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      if (event.code === "Digit2" && event.shiftKey) {
        let list = Object.values(this.activityGroupMembers);
        this.showAtList(range, list);
      } else {
        const text = range.endContainer.nodeValue;
        const index = range.endOffset;
        let letter = "";
        let at = "";
        setTimeout(() => {
          if (text) {
            let list = Object.values(this.activityGroupMembers);
            letter = text.substring(index - 1, index).toUpperCase();
            if (letter !== "@") {
              at = text.substring(index - 2, index - 1);
              let hasAt = text.substring(0, index).lastIndexOf("@");
              if (at === "@") {
                let newList = Util.filterNewList(letter, list);
                this.atDeleteNum = 2;
                if (newList.length > 0) {
                  this.showAtList(range, newList);
                } else {
                  this.atList.show = false;
                }
              } else if (hasAt !== -1) {
                this.atDeleteNum = index - hasAt;
                letter = text
                  .substr(hasAt + 1, this.atDeleteNum - 1)
                  .toUpperCase();
                let newList = Util.filterNewList(letter, list);
                if (newList.length > 0) {
                  this.showAtList(range, newList);
                } else {
                  this.atList.show = false;
                }
              } else {
                this.atList.show = false;
              }
            } else {
              this.atDeleteNum = 1;
              this.showAtList(range, list);
            }
          } else {
            if (event.keyCode !== 16) {
              this.atList.show = false;
            }
          }
        }, 10);
      }
      setTimeout(() => {
        let txt = this.countTextLength(this.$refs.editMsg.innerHTML);
        if (txt > 2000) {
          this.moreThan = true;
        } else {
          this.moreThan = false;
        }
        if (txt == 0) this.$refs.editMsg.innerHTML = '';
      }, 20);
    },
    countTextLength(txt) {
      const atInputReg = new RegExp(
        `<input.+?class="chat-panel-at-input".+?>`,
        "g"
      ),
        recordReg = /<div.+?class="chat-preview"(.*?)<\/div><\/div>/g;

      if (txt.match(atInputReg)) {
        txt = txt.replace(atInputReg, "@%1Ss");
      }

      if (txt.match(recordReg)) {
        txt = txt.replace(recordReg, "&rc@;");
      }

      txt = MessageHandler.checkEmoji(txt).replace(/&nbsp;/g, " ");
      return txt.length;
    },
    preKeydown(event) {
      if (localStore.getStore("enterType") == 1 || !localStore.getStore("enterType")) {
        if (event.keyCode === 13 && event.ctrlKey) {
          let insertHtml = "<br/><br/>";
          if (this.$refs.editMsg.innerHTML.indexOf('<br><br>') > -1) {
            insertHtml = "<br/>";
          }
          //safari自身可以换行，不用处理
          if (!Util.isSafari()) {
            Util.insertAtCursor(this.$refs.editMsg, insertHtml, false);
          }
        } else if (event.keyCode === 13) {
          this.sendMsg();
          event.preventDefault();
        }
      } else {
        if (event.keyCode == 13 && event.ctrlKey) {
          this.sendMsg();
          event.preventDefault();
        } else if (event.keyCode === 13) {
          let insertHtml = "<br/>";
          if (this.$refs.editMsg.innerHTML.indexOf('<br><br>') > -1) {
            insertHtml = "<br/>";
          }
          // safari自身可以换行，不用处理
          if (!Util.isSafari()) {
            Util.insertAtCursor(this.$refs.editMsg, insertHtml, false);
          }
        }
      }
      setTimeout(() => {
        let txt = this.countTextLength(this.$refs.editMsg.innerHTML);
        if (txt > 2000) {
          this.moreThan = true;
        } else {
          this.moreThan = false;
        }
        if (txt == 0) this.$refs.editMsg.innerHTML = '';
        // Util.focusLast(this.$refs.editMsg);
      }, 10);
    },
    showAtList(range, list) {
      let hasMyself = false;
      for (let item of list) {
        if (item.userId == this.userId) {
          hasMyself = true;
          break;
        }
      }

      let self = this.activityGroupMembers[this.userId];
      let showAll = (self.isAdmin > 0) ? true : false;

      const position = Util.getOffset(this.$refs.editMsg);
      this.atList = {
        show: true,
        left: position.left,
        top: position.top,
        list,
        showAll,
        hasMyself
      };

    },
    selectAtItem(item) {
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      // 计算@xxx的宽度
      const span = document.createElement("span");
      span.innerHTML = `@${item.nickName || item.username}&nbsp;`;
      span.style.fontSize = "14px";
      document.body.appendChild(span);
      const inputWidth = span.offsetWidth;
      document.body.removeChild(span);
      // 删除原来的@ 或者 @xxx
      const textNode = range.startContainer;
      range.setStart(textNode, range.endOffset - this.atDeleteNum);
      range.setEnd(textNode, range.endOffset);
      range.deleteContents();
      // 输入框中插入@xxx
      const content = `<input style="width: ${inputWidth +
        "px"};border:0;" type="text" class="chat-panel-at-input" value="@${
        item.nickName
        } " nickname="${item.nickName} " userid="${item.userId} "/>`;
      Util.insertAtCursor(this.$refs.editMsg, content, false);
      this.atList.show = false;
      setTimeout(() => {
        this.inputAtEvent();
      }, 300);
    },
    inputAtEvent() {
      // 给@xxx绑定事件
      const inputArray = document.getElementsByClassName("chat-panel-at-input");
      for (let input of inputArray) {
        input.onclick = null;
        input.addEventListener(
          "click",
          event => {
            event.stopPropagation();
            const selection = window.getSelection();
            const range = selection.getRangeAt(0);
            const textNode = range.startContainer;
            range.setStart(textNode, range.endOffset);
            range.setEnd(textNode, range.endOffset);
            this.$refs.editMsg.focus();
          },
          false
        );
      }
    },
    insertEmoji(value) {
      if (typeof value == "string") {
        Util.insertAtCursor(this.$refs.editMsg, value, false);
        //发送指令正在输入
        if (this.currentSession.fromType == 0) this.sendTyping();
      } else {
        this.sendEmoji(value);
      }
    },
    replayAt(draft) {
      const atInputReg = new RegExp(
        `<input.+?class="chat-panel-at-input".+?>`, "g"
      );
      let type = 1;
      let userIdArr = [];
      if (draft.match(atInputReg)) {
        let arr = draft.match(atInputReg);
        for (let item of arr) {
          let str1 = item.split('nickname="')[1];
          let nickName = str1.split(" ")[0];
          let str2 = item.split('userid="')[1];
          let userId = str2.split(" ")[0];
          draft = draft.replace(item, "@%1Ss");

          if (nickName == this.$t("msg.msgPanel.allMembers")) {
            userIdArr.push("allMember");
            type = 0;
          } else {
            userIdArr.push(userId);
          }
        }
        draft = MessageHandler.htmlToText(draft);
        return {
          type,
          showText: draft,
          userIds: userIdArr
        };
      } else {
        return draft;
      }
    },
    dropArea(event) {
      event.preventDefault();
      const fileList = event.dataTransfer.files;
      if (fileList.length === 0) {
        return false;
      }
      // 检测文件是不是图片
      // console.log(fileList[0].type.substring(0,5));
      let type = []
      for (let i = 0; i < fileList.length; i++) {
        type.push(fileList[i].type.substring(0, 5))
      }
      let ifImg = type.every(function (item) {
        return item == "image"
      });

      if (ifImg) {
        if (fileList.length === 1) {
          this.pasteImage.info = fileList[0];
          this.pasteImage.imgUrl = window.URL.createObjectURL(fileList[0]);
          this.pasteImage.show = true;
        } else if (fileList.length > 9) {
          this.$store.commit(
            "SET_TOAST_TEXT",
            this.$t("msg.chatPanel.fileNum") +
            fileList.length +
            this.$t("msg.chatPanel.num")
          );
          this.draguplod = false
          return false;
        } else {
          this.pasteImage.info = fileList;
          this.pasteImage.show = true;
        }
      } else {
        if (fileList.length === 1) {
          this.dropFileInfo.info = fileList[0];
          this.dropFileInfo.show = true;
        } else if (fileList.length > 9) {
          this.$store.commit(
            "SET_TOAST_TEXT",
            this.$t("msg.chatPanel.fileNum") +
            fileList.length +
            this.$t("msg.chatPanel.num")
          );
          this.draguplod = false
          return false;
        } else {
          this.dropFileInfo.info = fileList;
          this.dropFileInfo.show = true;
        }
      }
      this.$refs.editMsg.blur();
    },
    saveDraft() {
      //失去焦点 保存草稿
      if (
        this.$refs.operation.edit.show ||
        this.$refs.operation.replied.show
      ) {
        return;
      }

      this.editFocus = false;

      let draft = this.$refs.editMsg.innerHTML;

      if (!draft || draft.replace(/(&nbsp;*)|(<br>*)|(\s*)/g, "").length == 0) {
        this.editFocus = true;
        if (this.currentSession['draft']) {
          delete this.currentSession['draft'];
          let cacheS = JSON.parse(JSON.stringify(this.currentSession));
          this.$store.commit("UPDATE_SESSION", cacheS);
        }
        return;
      } else {
        this.currentSession['draft'] = draft;
        let cacheS = JSON.parse(JSON.stringify(this.currentSession));
        this.$store.commit("UPDATE_SESSION", cacheS);
        return;
      }
    },
    pasteMessage(event) {
      event.preventDefault();
      console.log(event)
      const clipboardData = event.clipboardData || window.clipboardData;
      const items = clipboardData.items;
      const files = clipboardData.files;
      let item = null;
      // 粘贴图片不兼容safari
      if (!Util.isSafari()) {
        if (files && files.length) {
          //发送图片
          this.pasteImage.info = files[0];
          this.pasteImage.imgUrl = window.URL.createObjectURL(files[0]);
          this.pasteImage.show = true;
          this.$refs.editMsg.blur();
          return false;
        } else if (items) {
          for (let i = 0; i < items.length; i++) {
            if (items[i].kind === "file" && items[i].type.match(/^image\//i)) {
              item = items[i];
              break;
            }
          }
        }
        if (item) {
          //发送图片
          this.pasteImage.info = item.getAsFile();
          this.pasteImage.imgUrl = window.URL.createObjectURL(item.getAsFile());
          this.pasteImage.show = true;
          this.$refs.editMsg.blur();
          return false;
        }
      }

      let pastedData = clipboardData.getData("Text");

      if (!pastedData) return;

      if (pastedData.length > 2000) {
        this.moreThan = true;
      }
      //解决Firefox浏览器复制图片title时多了一层[]问题
      if (Util.browserType() === "FF") {
        pastedData = pastedData.replace(/\[\[/g, "[").replace(/\]\]/g, "]");
      }

      let htmlStr = this.stringToDom(pastedData);

      if (pastedData == htmlStr) {
        pastedData = pastedData.replace(/</g, "&lt;");
        pastedData = pastedData.replace(/>/g, "&gt;");
        pastedData = pastedData.replace(/ /g, "&nbsp;");
        pastedData = pastedData.replace(/\n/g, "<br/>");
        pastedData = face.checkFace(pastedData);
      } else {
        pastedData = htmlStr;
      }

      Util.insertAtCursor(this.$refs.editMsg, pastedData, false);
    },
    stringToDom(txt) {
      let copyMsg = localStore.getStore("copyMsg") || "{}",
        copyObj = JSON.parse(copyMsg);

      let newStr = MessageHandler.copyTextReplay(txt);

      if (!copyObj || (copyObj && copyObj.msgText != newStr)) return txt;

      let shortList = [];
      shortList[0] =
        copyObj.msgList[0].chatInfo.nickName +
        "：" +
        copyObj.msgList[0].preview.replace(/[\r\n]/g, " ");
      shortList[1] =
        copyObj.msgList[1].chatInfo.nickName +
        "：" +
        copyObj.msgList[1].preview.replace(/[\r\n]/g, " ");

      let shortMsg = {
        title: copyObj.title,
        msgId: "",
        list: shortList
      };

      let msgList = [];

      for (let i = 0; i < copyObj.msgList.length; i++) {
        msgList[i] = {
          sequence: i,
          bodyContent: copyObj.msgList[i].bodyContent,
          bodyTime: copyObj.msgList[i].bodyTime,
          bodyType: copyObj.msgList[i].bodyType,
          nickName: copyObj.msgList[i].chatInfo.nickName,
          avatar: copyObj.msgList[i].chatInfo.avatar,
          messageName: copyObj.title
        };
      }

      this.msgRecord[copyObj.time] = {
        short: shortMsg,
        list: msgList
      };

      let htmlStr = `<div class="chat-preview" id="${
        copyObj.time
        } " contenteditable="false"><label class="title">${copyObj.title +
        (this.$i18n.locale == "zh_CN" ? "的 " : "'s ")}${this.$t(
          "msg.common.chatRecord"
        )}</label><div class="text"><p class="text-line">${
        shortMsg.list[0]
        }</p><p class="text-line">${shortMsg.list[1]}</p></div></div>`;
      return htmlStr;
    },
    replayBody(bodyType, msg) {
      if (bodyType == 1) {
        return MessageHandler.htmlToText(msg);
      }
      if (bodyType == 28) {
        if (typeof msg.content == "string") {
          msg.content = MessageHandler.htmlToText(msg.content);
        } else {
          msg.content.repliedContent = MessageHandler.htmlToText(
            msg.content.repliedContent
          );
          msg.content.content = MessageHandler.htmlToText(msg.content.content);
        }
      }
      if (bodyType == 30) {
        msg.repliedContent = MessageHandler.htmlToText(msg.repliedContent);
        msg.content = MessageHandler.htmlToText(msg.content);
      }
      return msg;
    },
    replayRecord(draft) {
      const recordReg = /<div.+?class="chat-preview"(.*?)<\/div><\/div>/g;
      let recordIds = [],
        textArr = [];

      if (draft.match(recordReg)) {
        let arr = draft.match(recordReg);
        for (let item of arr) {
          let str = item.split('chat-preview" id="')[1];
          str = str.split(" ")[0];
          recordIds.push(str);
        }

        draft = draft.replace(recordReg, "&rc@;");
        textArr = draft.split("&rc@;");

        for (let i = 0; i < recordIds.length; i++) {
          let listStr = JSON.stringify(this.msgRecord[recordIds[i]].list);
          this.$http.addCopyRecord({
            list: listStr
          })
            .then(
              data => {
                let msgObj = this.msgRecord[recordIds[i]].short;
                msgObj.msgId = data;

                if (
                  textArr[i] &&
                  textArr[i].replace(/(&nbsp;*)|(<br>*)/g, "").length != 0
                ) {
                  this.sendEvent(textArr[i], true);
                }

                this.sendRecord(msgObj);

                if (
                  textArr[recordIds.length] &&
                  textArr[recordIds.length].replace(
                    /(&nbsp;*)|(<br>*)|( )/g,
                    ""
                  ).length != 0 &&
                  recordIds.length < textArr.length &&
                  i == recordIds.length - 1
                ) {
                  this.sendEvent(textArr[recordIds.length], true);
                }
              },
              () => { }
            );
        }
      } else {
        this.sendEvent(draft);
      }
    },
    sendRecord(msg) {
      var time = new Date().getTime();
      let obj = {
        msg: JSON.stringify(msg),
        msgType: 44,
        chatType: this.currentSession.fromType,
        toId: this.currentSession.paramId,
        time,
        userId: this.userId
      };
      this.$store.dispatch("sendMsg", obj);
      this.updataChatHistory(msg, 44, time);
    },
    sendEmoji(msg) {
      var time = new Date().getTime();
      let obj = {
        msg: JSON.stringify(msg),
        msgType: 2,
        chatType: this.currentSession.fromType,
        toId: this.currentSession.paramId,
        time,
        userId: this.userId
      };
      this.$store.dispatch("sendMsg", obj);
      this.updataChatHistory(msg, 2, time);
    },
    sendAtMsg(msg) {
      //格式化@消息
      var time = new Date().getTime();
      var bodyContent = JSON.parse(JSON.stringify(msg));
      var showText = bodyContent.showText.split("@%1Ss");
      var inviter = showText[0];
      for (var i = 0; i < bodyContent.userIds.length; i++) {
        if (bodyContent.userIds[i] == "allMember") {
          inviter =
            inviter + "@" + this.$t("msg.msgPanel.all") + " " + showText[i + 1];
        } else {
          var userInfo = this.activityGroupMembers[bodyContent.userIds[i]];
          inviter = inviter + "@" + userInfo.nickName + " " + showText[i + 1];
        }
      }
      msg.showText = Msg.replayLabel(msg.showText);
      let obj = {
        msg: JSON.stringify(msg),
        msgType: 24,
        chatType: this.currentSession.fromType,
        toId: this.currentSession.paramId,
        time,
        userId: this.userId
      };
      this.$store.dispatch("sendMsg", obj);
      this.updataChatHistory(inviter, 24, time);
    },
    sendMsg() {

      if (this.moreThan) return false;

      if (this.currentSession.temp && this.currentSession.state == 6) {
        let groupId = this.friendInfo.sourceDescribe.slice(0, 5);
        group.getGroupMember(groupId).then(data => {
          let memberInfo = data[this.currentSession.paramId];
          let selfInfo = data[this.userId];

          if (
            this.friendInfo.isForbidChat == 1 &&
            memberInfo &&
            memberInfo.isAdmin == "0" &&
            selfInfo.isAdmin == "0"
          ) {
            this.$store.commit("SET_TOAST_TEXT", this.$t("msg.forbidden.banedTemp"));
            return false;
          } else {
            let draft = this.$refs.editMsg.innerHTML;

            if (!draft || draft.replace(/(&nbsp;*)|(<br>*)|( )/g, "").length == 0) {
              this.$store.commit("SET_TOAST_TEXT", this.$t("msg.chatPanel.msgNotEmpty"));
              this.$refs.editMsg.focus();
              return false;
            }

            this.replayRecord(draft.replace(/&amp;/g, "&"));
            this.cleanPre();
          }
        });
      } else {
        let draft = this.$refs.editMsg.innerHTML;

        if (!draft || draft.replace(/(&nbsp;*)|(<br>*)|( )/g, "").length == 0) {
          this.$store.commit("SET_TOAST_TEXT", this.$t("msg.chatPanel.msgNotEmpty"));
          this.$refs.editMsg.focus();
          return false;
        }

        this.replayRecord(draft.replace(/&amp;/g, "&"));
        this.cleanPre();
      }
    },
    cleanPre() {
      setTimeout(() => {
        this.$refs.editMsg.innerHTML = "";
        this.$refs.editMsg.focus();
      }, 0);
    },
    sendEvent(content, checkTime) {
      //判断编辑状态
      if (this.$refs.operation.edit.show) {
        this.$refs.operation.sendEdit(content);
        this.cleanPre();
        return false;
      }
      //判断回复状态
      if (this.$refs.operation.replied.show) {
        this.$refs.operation.sendReplied(content);
        return false;
      }

      let draft = this.replayAt(content);

      //替换非@消息标签
      if (typeof draft == "string") {
        draft = MessageHandler.htmlToText(draft);
      } else {
        this.sendAtMsg(draft);
        this.$refs.operation.clean();
        return false;
      }

      var bodyType = "1",
        msg = draft,
        time = new Date().getTime();

      if (!checkTime && time - this.LastMsgTime < 300) {
        this.$store.commit("SET_TOAST_TEXT", this.$t("msg.chatPanel.msgToFast"));
        return false;
      }

      this.LastMsgTime = time;

      this.updataChatHistory(msg, bodyType, time);
      let obj = {
        msg,
        msgType: bodyType,
        chatType: this.currentSession.fromType,
        toId: this.currentSession.paramId,
        time,
        userId: this.userId
      };
      this.$store.dispatch("sendMsg", obj).then(() => { });
    },
    /**发送消息 */
    updataChatHistory(msg, bodyType, time) {
      //刷新会话列表
      this.$store.commit("SET_HAS_CURRENT_MSG", true);
      let filter = Msg.filterRecord(bodyType, msg);

      var chat = this.currentSession;
      chat.lastReadId = this.currentSession.mId + 1;
      chat.mId = this.currentSession.mId + 1;
      chat.msgType = bodyType;
      chat.preview = filter;
      chat.userTime = time;

      this.$store.commit("UPDATE_SESSION", chat);

      let userInfo = this.userInfo;
      // let bodyTime = this.chatHistory.length ? this.chatHistory[this.chatHistory.length-1].bodyTime : time;
      let history = {
        msgContent: typeof msg == "string" ? MessageHandler.textToHtml(msg) : msg,
        bodyContent: JSON.parse(JSON.stringify(msg)),
        bodyFrom: this.userId,
        bodyTime: time,
        bodyType: bodyType,
        mId: time,
        loading: 0,
        createTime: time,
        preview: filter,
        checked: false,
        readNum: 0
      };

      if (
        bodyType == 30 &&
        history.msgContent.msgType
      ) {
        if (
          !(history.msgContent.msgType == 2 ||
            history.msgContent.msgType == 3 ||
            history.msgContent.msgType == 4 ||
            history.msgContent.msgType == 5 ||
            history.msgContent.msgType == 18 ||
            history.msgContent.msgType == 24)
        ) {
          history.msgContent.repliedContent = MessageHandler.textToHtml(history.msgContent.repliedContent);
        }
        history.msgContent.content = MessageHandler.textToHtml(history.msgContent.content);
      }

      if (bodyType == 3) {
        history.msgContent.imgUrl = history.msgContent.imgUrl;
      }
      if (this.currentSession.fromType == "1") {
        history.chatInfo = {
          headImg: userInfo.headImg || userInfo.avatar,
          nickName: userInfo.nickName,
          avatar: userInfo.avatar
        };
        setTimeout(() => {
          this.$refs.list.scrollTop = this.$refs.list.scrollHeight;
        }, 1000);
      }
      console.log(history)
      this.$store.commit("UPDATE_MESSAGE", history);

      if (bodyType != 3 || (bodyType == 3)) {
        EchatDB.insertTempMsg(this.currentSession.paramId, history, chat.mId);
      }

      setTimeout(() => {
        this.$refs.list.scrollTop = this.$refs.list.scrollHeight;
      }, 200);
    },
    cancelUpload(item) {
      item.msgContent.progress = 200;
      this.$refs.sendFile.uploadCancel(item);
      EchatDB.deleteTempMsg(this.currentSession.paramId, item.createTime + '');
    },
    reSend(item) {
      if (item.loading != 2) return;

      if (item.bodyType == 18) {
        EchatDB.deleteTempMsg(this.currentSession.paramId, item.createTime + '');
        this.$store.commit("DELETE_MESSAGE", item.createTime);
        this.$store.commit("SET_TOAST_TEXT", this.$t("msg.chatPanel.msgNotFound"));
        return;
      }

      item.loading = 0;

      let obj = {
        msg: item.bodyContent,
        msgType: item.bodyType,
        chatType: this.currentSession.fromType,
        toId: this.currentSession.paramId,
        time: item.createTime,
        userId: this.userId
      };
      this.$store.dispatch("sendMsg", obj).then(() => { });

      var chat = this.currentSession;
      chat.lastReadId = chat.mId + 1;
      chat.mId = chat.mId + 1;
      chat.preview = item.preview;
      this.$store.commit("UPDATE_SESSION", chat);
    },
    /**
     * 更改群成员数量
     * @param {*} num 
     */
    changeGroupMemberNum(num) {
      this.goupMemberNum = num;
    },
    sendTyping() {
      if (!this.sendTypingReady) return;
      this.sendTypingReady = false;
      let time = new Date().getTime();
      let bodyContent = '{"type":0}';
      let key = this.userId + "" + this.currentSession.paramId + ""
      bodyContent = Crypto.encryptByDES(bodyContent, key);
      console.log(bodyContent)
      let rxml = `<message xmlns="jabber:client" type="chat" to="${this.currentSession.paramId}@bcircle.net" id="${time}" from="${this.userId}@bcircle.net/webIm"><body>{"bodyLevel":1,"bodyExpire":0,"bodyContent":"${bodyContent}","bodyType":16,"bodyFrom":"${this.userId}"}</body></message>`;
      Rtc.sendMessage(rxml);
      setTimeout(() => {
        this.sendTypingReady = true;
      }, 1000);
    },
  },
  mounted() {
    //阻止默认拖拽事件 
    document.addEventListener("dragleave", function (e) {
      e.stopPropagation();
      e.preventDefault();
    })
    document.addEventListener("dragenter", function (e) {
      e.stopPropagation();
      e.preventDefault();
      that.draguplod = false
    })
    document.addEventListener("dragover", function (e) {
      e.stopPropagation();
      e.preventDefault();
    })
    let that = this
    var dropbox = document.getElementById('draguplod');
    dropbox.addEventListener("dragenter", function (e) {
      e.stopPropagation();
      e.preventDefault();
      // e.dataTransfer.effectAllowed == "uninitialized"兼容火狐浏览器
      if (e.dataTransfer.effectAllowed == "all" || e.dataTransfer.effectAllowed == "uninitialized") {
        that.draguplod = true
      };
    })

    console.log(this.$options.name + " 被创建");
    this.$store.state.activityComponents[this.$options.name] = this; //注册
    if (!window.localStorage.getItem("aspect-mybackground" + this.userInfo.userId) || window.localStorage.getItem("aspect-mybackground" + this.userInfo.userId) == "null") {
      window.localStorage.setItem("aspect-mybackground" + this.userInfo.userId, "#8BCDFF")
      window.localStorage.setItem("aspect-adversebackground" + this.userInfo.userId, "#FFFFFF")
    }
    let bubbles = {
      mybackground: window.localStorage.getItem("aspect-mybackground" + this.userInfo.userId),
      adversebackground: window.localStorage.getItem("aspect-adversebackground" + this.userInfo.userId)
    }
    this.$store.commit("SET_BUBBLES", bubbles);
    if (!window.localStorage.getItem("aspect-url" + this.userInfo.userId) || window.localStorage.getItem("aspect-url" + this.userInfo.userId) == "null") {
      let urlinfo = {
        url: '',
        isdim: ''
      }
      this.$store.commit("SET_BACKURL", urlinfo);
    } else {
      let urlinfo = {
        url: window.localStorage.getItem("aspect-url" + this.userInfo.userId),
        isdim: window.localStorage.getItem("aspect-isdim" + this.userInfo.userId)
      }
      this.$store.commit("SET_BACKURL", urlinfo);
    }
  },
  beforeDestroy() {
    document.removeEventListener("dragenter", function pdde(e) {
      e.preventDefault();
    });
    document.removeEventListener("dragover", function pddo(e) {
      if (e.dataTransfer === null) return;
      e.dataTransfer.dropEffect = "copy";
      e.preventDefault();
    });
    document.removeEventListener("dragleave", function pddo(e) {
      e.preventDefault();
    });
    document.removeEventListener("drop", function pdde(e) {
      e.preventDefault();
    });
  },
  destroyed() {
    console.log(this.$options.name + " 被销毁");
    delete this.$store.state.activityComponents[this.$options.name]; //销毁
  },
};
