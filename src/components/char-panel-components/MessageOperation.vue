<template>
  <div class="message-operation" v-if="edit.show || replied.show">
    <div class="msg-box display-flex" v-if="edit.show" v-scrollBar>
      <span class="edit-icon" @click="clean"></span>
      <div class="msg-box display-flex">
        <div  class="reply-text">{{ $t("msg.menu.edit")}}：</div> 
        <div class="display-flex-item" v-html="edit.content.split(' : ')[edit.content.split(' : ').length-1]"></div>
      </div>
      <span class="close-icon" @click="clean"></span>
    </div>
    <div class="reply display-flex" v-if="replied.show">
      <span class="reply-icon" @click="clean"></span>
      <div class="msg-box display-flex" v-scrollBar>
        <div class="reply-text">{{ $t("msg.menu.reply")}}：</div>
        <!-- <div class="name">"{{ replied.history.chatInfo.nickName }}</div> -->
        <div
          class="display-flex-item"
          v-if="replied.history.bodyType == 1 || replied.history.bodyType == 13"
          v-html="this.replied.history.preview.split(' : ')[this.replied.history.preview.split(' : ').length-1]"
        ></div>
        <div class="display-flex-item" v-if="replied.history.bodyType == 2">
          [{{ $t("msg.common.emoji") }}]
        </div>
        <div class="display-flex-item" v-if="replied.history.bodyType == 3">
          [{{ $t("msg.common.image") }}]
        </div>
        <div  class="display-flex-item" v-if="replied.history.bodyType == 4">
          [{{ $t("msg.common.voice") }}]
        </div>
        <div class="display-flex-item" v-if="replied.history.bodyType == 5">
          [{{ $t("msg.common.video") }}]
        </div>
        <div class="display-flex-item" v-if="replied.history.bodyType == 18">
          [{{ $t("msg.common.file") }}]{{ replied.history.msgContent.name }}
        </div>
        <div
          class="display-flex-item"
          v-if="replied.history.bodyType == 24"
          v-html="replied.history.msgContent"
        ></div>
        <div
          class="display-flex-item"
          v-if="replied.history.bodyType == 28"
          v-html="replied.history.preview"
        ></div>
        <div
          class="display-flex-item"
          v-if="replied.history.bodyType == 30"
          v-html="replied.history.preview"
        ></div>
        <div  class="display-flex-item" v-if="replied.history.bodyType == 47">
          [{{ $t("msg.common.affiche") }}]
        </div>
      </div>
      <span class="close-icon" @click="clean"></span>
    </div>
  </div>
</template>

<script>
import Msg from "@/tools/msg";
import { MessageHandler } from "@/tools/messageHandler";
import { face } from "@/tools/emoji.js";
import { Util } from "@/tools/utils";
import { mapGetters } from "vuex";
import { EchatDB } from "@/tools/indexedDB";
import { msgManager } from "@/session/msgManager";

export default {
  name: "MessageOperation",
  data() {
    return {
      edit: {
        show: false,
        content: ""
      },
      replied: {
        show: false,
        history: {
          bodyContent: ""
        }
      },
      mouseClick: {
        mId: 0
      }
    };
  },
  computed: {
    ...mapGetters(["userInfo", "currentSession", "mouseRightInfo"])
  },
  watch: {
    mouseRightInfo() {
      this.show();
    }
  },
  methods: {
    show() {
      this.clean();
      this.mouseClick.mId = this.mouseRightInfo.mId;
      //撤回
      if (this.mouseRightInfo.type == "withdraw") {
        this.withdrawMessage();
      }
      //编辑
      if (this.mouseRightInfo.type == "edit") {
        this.editMessage();
      }
      //回复
      if (this.mouseRightInfo.type == "reply") {
        this.repliedMessage();
      }
      //多选
      if (this.mouseRightInfo.type == "more") {
        this.$parent.showMore = true;
      }
      //删除
      if (this.mouseRightInfo.type == "delete") {

        //删除指定会话指定消息
        this.$store.commit("SET_DELETE_INFO", {
          show: true,
          paramId: this.currentSession.paramId,
          fromType: this.currentSession.fromType,
          ids: this.mouseClick.mId,
          idsArr: [this.mouseClick.mId]
        });
      }
      //转发
      if (this.mouseRightInfo.type == "forward") {
        var history = this.$store.state.message[this.mouseClick.mId];
        let forwardInfo = {
          show: true,
          body: [
            {
              msgType: history.bodyType,
              bodyContent: history.bodyContent,
              msgContent: history.msgContent,
              preview: history.preview
            }
          ]
        };
        this.$store.commit("SET_FORWARD_INFO", forwardInfo);
      }
      //收藏
      if (this.mouseRightInfo.type == "favorites") {
        this.addFavorites();
      }
      //复制
      if (this.mouseRightInfo.type == "copy") {
        var history = this.$store.state.message[this.mouseClick.mId];
        console.log(history);
        var content = history.bodyContent;
        if (history.bodyType == 28) {
          content = history.bodyContent.content;
        }
        if (history.bodyType == 30) {
          content = history.bodyContent.content;
        }
        if (history.bodyContent.editType == 30) {
          content = content.content;
        }
        if (history.bodyType == 47) {
          content = history.msgContent.affiche;
        }
        content = MessageHandler.htmlToText(content);

        let oInput = document.createElement("input");
        oInput.value = content;
        document.body.appendChild(oInput);
        oInput.select(); // 选择对象
        document.execCommand("Copy");
        oInput.style.display = "none";
        document.body.removeChild(oInput);

        this.$store.commit("SET_TOAST_TEXT", this.$t("msg.menu.copySuccess"));
        return;
      }
      var data = this.$store.state.message[this.mouseClick.mId];
    },
    clean() {
      this.showBox = false;
      this.edit = {
        show: false,
        content: ""
      };
      this.replied = {
        show: false,
        history: {
          bodyContent: ""
        }
      };
    },
    addFavorites() {
      let message = JSON.parse(
        JSON.stringify(this.$store.state.message[this.mouseClick.mId])
      );
      let currentSession = this.$store.state.currentSession;
      let type = this.getType(message.bodyType);
      let sourceType = "1";
      let sourceId = currentSession.paramId;
      if (currentSession.fromType == 0) {
        if (message.bodyFrom == this.$store.state.userInfo.userId) {
          message.chatInfo = {
            nickName: this.$store.state.userInfo.nickName,
            headImg: this.$store.state.userInfo.headImg
          };
        } else {
          message.chatInfo = {
            nickName: currentSession.name,
            headImg: currentSession.img
          };
        }
      }
      message.bodyContent = this.getContent(message);
      if(typeof message.bodyContent == 'string' && type=='1'){
        if(this.isUrl(message.bodyContent)) type=5
      }
      var faObj = {
        bodyContent: message.bodyContent,
        bodyTime: message.bodyTime,
        bodyType: message.bodyType,
        chatInfo: message.chatInfo,
      }
      let collectionHead = JSON.stringify(faObj);
      let collectionBody = JSON.stringify(faObj);

      if (currentSession.fromType == 1) sourceType = "2";
      let obj = {
        collectionHead, //消息简体
        collectionBody, //消息体
        type, //收藏内容类型（1：文本、2：图片、3：视频、4：语言、5：连接、6：聊天纪录）
        sourceId, //源id(好友id、群id...)
        sourceType //源类型（1：好友、2：群、3：朋友圈）
      };
      //console.log(obj);
      this.$http.addFavorites(obj).then(
        () => {
          this.$parent.doShowSuccess();
        },
        () => {}
      );
    },
    getType(type) {
      let result = "1";
      //文本
      if (type == 1 || type == 24 || type == 28 || type == 30) result = "1";
      //表情、图片
      if (type == 2 || type == 3) result = "2";
      //视频
      if (type == 5) result = "3";
      //语音
      if (type == 4) result = "4";
      //链接
      if (type == 13) result = "5";
      //文件
      if (type == 18) result = "8";
      return result;
    },
    getContent(history) {
      var content = history.bodyContent;
      if (history.bodyType == 1 || history.bodyType == 13) {
        content = MessageHandler.htmlToText(content);
      }
      if (history.bodyType == 24) {
        content =MessageHandler.htmlToText(history.msgContent);
      }
      if (history.bodyType == 28) {
        if(!(typeof history.bodyContent == "object")) history.bodyContent = JSON.parse(history.bodyContent);
        content = history.bodyContent.content;
        if (history.bodyContent.editType == 30) {
          if(!(typeof content == "object")) content = JSON.parse(content);
          content = content.content;
        }
        content = MessageHandler.htmlToText(content);
      }
      if (history.bodyType == 30) {
        if(!(typeof history.bodyContent == "object")) history.bodyContent = JSON.parse(history.bodyContent);
        content = history.bodyContent.content;
        if (history.bodyContent.editType == 30) {
          if(!(typeof content == "object")) content = JSON.parse(content);
          content = content.content;
        }
        content =MessageHandler.htmlToText(content);
      }
      return content;
    },
    isUrl(str) {
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
      let result = false;
      if(str.indexOf('</a>')>-1) result = true;
      return result;
    },
    withdrawMessage() {
      //隐藏文件消息的二维码
      this.$parent.qrCode.show = false;
      var history = this.$store.state.message[this.mouseClick.mId];
      //调用撤回接口
      let obj = {
        sessionUserId: this.currentSession.paramId,
        type: this.currentSession.fromType,
        msgId: this.mouseClick.mId
      };
      this.$http.withdrawMessage(obj).then(() => {
        var history = this.$store.state.message[this.mouseClick.mId];
        history.msgContent = {
          content: this.userInfo.nickName + "撤回一条消息"
        };
        history.bodyFrom = this.userInfo.userId;
        history.bodyType = 27;
        history.preview = this.userInfo.nickName + "撤回一条消息";
        this.$store.commit("UPDATE_MESSAGE", history);
      });
    },
    //编辑
    editMessage() {
      let history = this.$store.state.message[this.mouseClick.mId];
      let content = history.msgContent;

      if (history.bodyType == 28 || history.bodyType == 30) {
        content = history.msgContent.content;
      }

      if (history.msgContent.editType == 30) {
        content = content.content;
      }
      
      this.edit.show = true;
      this.edit.content = history.preview;
      this.$parent.$refs.editMsg.innerHTML = "";
Util.insertAtCursor(this.$parent.$refs.editMsg, content.replace("<\/?a.*?>", ""), false);
    },
    sendEdit(text) {
      this.edit.show = false;
      
      let preview = MessageHandler.htmlToText(text);
      let history = this.$store.state.message[this.mouseClick.mId];
      let msgContent = JSON.parse(JSON.stringify(history.msgContent));

      let newMsg = {
        bodyContent: {
          content: preview,
          editType: 28,
          mId: this.mouseClick.mId
        },
        bodyFrom: this.userInfo.userId,
        bodyLevel: 0,
        bodyTime: new Date().getTime(),
        bodyType: 28
      };

      if (history.bodyType == 28) {
        let editContent = {
          content: preview,
          editType: 28,
          mId: this.mouseClick.mId
        };
        if (msgContent.editType == 30) {
          editContent.content = msgContent.content;
          editContent.editType = 30;
          editContent.content.content = preview;
          editContent.content.repliedContent = MessageHandler.htmlToText(editContent.content.repliedContent);
          editContent.content = JSON.stringify(editContent.content);
        }
        newMsg.bodyContent = JSON.stringify(editContent);
      }

      if (history.bodyType == 30) {
        let replyContent = {
          content: msgContent,
          editType: 30,
          mId: this.mouseClick.mId
        };

        replyContent.content.content = preview;
        replyContent.content.repliedContent = MessageHandler.htmlToText(replyContent.content.repliedContent);
        replyContent.content = JSON.stringify(replyContent.content);
        newMsg.bodyContent = JSON.stringify(replyContent);
      }

      //调用编辑接口
      let obj = {
        sessionUserId: this.currentSession.paramId,
        type: this.currentSession.fromType,
        msgId: this.mouseClick.mId,
        newMsg: JSON.stringify(newMsg)
      };
      this.$http.editMessage(obj).then(
        () => {
          if (history.bodyType == 1) {
            history.msgContent = {
              content: text,
              editType: 28,
              mId: this.mouseClick.mId
            };
          }
          if (history.bodyType == 28) {
            if (history.msgContent.editType == 28) {
              history.msgContent.content = text;
            }
            if (history.msgContent.editType == 30) {
              history.msgContent.content.content = text;
            }
          }

          if (history.bodyType == 30) {
            let msgContent = {
              content: history.msgContent,
              editType: 30,
              mId: this.mouseClick.mId,
            }
            msgContent.content.content = text;
            history.msgContent = msgContent;
          }

          history.bodyContent = newMsg.bodyContent;
          history.bodyType = 28;
          history.preview = text;
          this.$store.commit("UPDATE_MESSAGE", history);

          let indexObj = {};
          indexObj[history.mId] = history;
          msgManager.updateMsgBatch(this.currentSession.fromType,this.currentSession.paramId, indexObj)

          if(this.currentSession.mId==this.mouseClick.mId){
            this.currentSession.preview=history.preview;
            let sessionCache=JSON.parse(JSON.stringify(this.currentSession))
            this.$store.commit("UPDATE_SESSION", sessionCache);
          }
        },
        data => {}
      );
    },
    //回复
    repliedMessage() {
      var history = JSON.parse(JSON.stringify(this.$store.state.message[this.mouseClick.mId]));
      console.log(history)

      if (this.currentSession.fromType == "0") {
        if (history.bodyFrom != this.$store.state.userInfo.userId) {
          history.chatInfo = {
            nickName: this.currentSession.name
          };
        } else {
          history.chatInfo = {
            nickName: this.$store.state.userInfo.nickName
          };
        }
      }
      this.replied.show = true;
      this.replied.history = history;
      this.$parent.$refs.editMsg.focus();
    },
    sendReplied(text) {
      let preview = MessageHandler.htmlToText(text);
      var history = this.replied.history;
      let bodyContent = {
        content: preview,
        msgType: history.bodyType,
        repliedContent: history.bodyContent,
        repliedId: history.mId,
        repliedName: history.chatInfo.nickName
      };

      if (history.bodyType == 1 || history.bodyType == 13) {
        bodyContent.repliedContent = MessageHandler.htmlToText(history.bodyContent);
      }

      if (history.bodyType == 2) {
        bodyContent.repliedContent = history.msgContent.bqUrl;
      }

      if (history.bodyType == 3) {
        bodyContent.repliedContent = history.msgContent.imgUrl;
      }

      if (history.bodyType == 4) {
        bodyContent.repliedContent = "[" + this.$t("msg.common.voice") + "]";
      }

      if (history.bodyType == 5) {
        bodyContent.repliedContent = history.msgContent.imgUrl;
      }

      if (history.bodyType == 18) {
        bodyContent.repliedContent = "[" + this.$t("msg.common.file") + "]" + history.msgContent.name;
      }

      if (history.bodyType == 24) {
        bodyContent.repliedContent = MessageHandler.htmlToText(history.msgContent);
      }

      if (history.bodyType == 28) {
        if (history.msgContent.editType == 30) {
          if(typeof history.bodyContent.content == 'string'){
            history.bodyContent.content = JSON.parse(history.bodyContent.content)
          }
          bodyContent.repliedContent = history.bodyContent.content.content;
        } else {
          if(typeof history.bodyContent == 'string'){
            history.bodyContent = JSON.parse(history.bodyContent)
          }
          bodyContent.repliedContent = history.bodyContent.content;
        }
      }

      if (history.bodyType == 30) {
        if(typeof history.bodyContent == 'string'){
          history.bodyContent = JSON.parse(history.bodyContent)
        } 
        bodyContent.repliedContent = history.bodyContent.content;
      }

      if (history.bodyType == 47) {
        bodyContent.repliedContent = "[" + this.$t("msg.common.affiche") + "]";
      }

      let time = new Date().getTime();
      let obj = {
        msg: JSON.stringify(bodyContent),
        msgType: 30,
        chatType: this.currentSession.fromType,
        toId: this.currentSession.paramId,
        time,
        userId: this.userInfo.userId
      };
      console.log(obj)
      this.$store.dispatch("sendMsg", obj);
      
      if (history.bodyType == 24) {
        bodyContent.repliedContent = history.msgContent;
      }
      this.$parent.updataChatHistory(bodyContent, 30, time);
      this.replied = {
        show: false,
        history: {
          bodyContent: ""
        }
      };
    },
  },
  updated() {
  }
};
</script>

<style lang="scss" scoped>
@import "../../assets/css/var";

.message-operation {
  position: absolute;
  bottom: 100%;
  z-index: 100;
  width: 100%;
  padding: 14px 33px 14px 20px;
  background: $backgroup-color;
  border-top: 1px solid $border-color;
  border-bottom: 1px solid $border-color;
  line-height: 24px;
  overflow: hidden;
  .msg-box {
    position: relative;
    width: 100%;
    height: auto;
    max-height: 90px;
  }
  .reply-text{
    color: #999;
  }
  .reply-icon {
    width: 21px;
    height: 15px;
    margin-right: 15px;
    background-image: url(../../assets/images/icon/reply.png);
    background-size: 100%;
    cursor: pointer;
  }
  .close-icon {
    width: 12px;
    height: 11px;
    background: url(../../assets/images/icon/close2.png) no-repeat;
    cursor: pointer;
  }
  .edit-icon{
    width: 18px;
    height: 18px;
    margin-right: 15px;
    background: url(../../assets/images/icon/edit.png) no-repeat;
    cursor: pointer;
  }
}
</style>
