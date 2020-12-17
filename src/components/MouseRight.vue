<template>
  <transition name="drop-left">
    <div
      class="mouse-right"
      :style="{ top: mouseMenu.top + 'px', left: mouseMenu.left + 'px' }"
       v-if="layout.child == 'mr'"
    >
      <ul @click.stop="" unselectable="on">
        <!-- 消息右键 -->
        <li
          class="mouse-right-item"
          @click="doMessage('copy')"
          v-if="mouseMenu.copy"
        >
          <span :title="$t('msg.menu.copy')">{{ $t("msg.menu.copy") }}</span>
        </li>
        <!-- <li class="mouse-right-item" @click="doMessage('withdraw')" v-if="mouseMenu.withdraw">
					<span>撤回</span>
				</li> -->
        <li
          class="mouse-right-item"
          @click="doMessage('forward')"
          v-if="mouseMenu.forward"
        >
          <span :title="$t('msg.menu.forward')">{{
            $t("msg.menu.forward")
          }}</span>
        </li>
        <li
          class="mouse-right-item"
          @click="doMessage('favorites')"
          v-if="mouseMenu.favorites"
        >
          <span :title="$t('msg.menu.favorite')">{{
            $t("msg.menu.favorite")
          }}</span>
        </li>
        <li
          class="mouse-right-item"
          @click="doMessage('delete')"
          v-if="mouseMenu.delete"
        >
          <span :title="$t('msg.menu.delete')">{{
            $t("msg.menu.delete")
          }}</span>
        </li>
        <li
          class="mouse-right-item"
          @click="doMessage('reply')"
          v-if="mouseMenu.reply"
        >
          <span :title="$t('msg.menu.reply')">{{ $t("msg.menu.reply") }}</span>
        </li>
        <li
          class="mouse-right-item"
          @click="doMessage('edit')"
          v-if="mouseMenu.edit"
        >
          <span :title="$t('msg.menu.edit')">{{ $t("msg.menu.edit") }}</span>
        </li>
        <li class="mouse-right-item" @click="videoPlay" v-if="mouseMenu.isMute">
          <span :title="$t('msg.menu.isMute')">{{
            $t("msg.menu.isMute")
          }}</span>
        </li>
        <li class="mouse-right-item" @click="saveAs" v-if="mouseMenu.saveAs">
          <span :title="$t('msg.common.download')">{{
            $t("msg.common.download")
          }}</span>
        </li>
        <li
          class="mouse-right-item"
          @click="selectCopy"
          v-if="mouseMenu.selectCopy"
        >
          <span :title="$t('msg.menu.copy')">{{ $t("msg.menu.copy") }}</span>
        </li>
        <li
          class="mouse-right-item"
          @click="doMessage('more')"
          v-if="mouseMenu.more"
        >
          <span :title="$t('msg.menu.more')">{{ $t("msg.menu.more") }}</span>
        </li>
        <!-- 会话右键 -->
        <li
          class="mouse-right-item"
          @click="doSession('isTop')"
          v-if="mouseMenu.isTop"
        >
          <span
            :title="
              session.isTop ? $t('msg.menu.cancelStick') : $t('msg.menu.stick')
            "
          >
            {{
              session.isTop ? $t("msg.menu.cancelStick") : $t("msg.menu.stick")
            }}</span
          >
        </li>
        <li
          class="mouse-right-item"
          @click="doSession('isInterruption')"
          v-if="mouseMenu.isInterruption"
        >
          <span
            :title="
              session.isInterruption
                ? $t('msg.menu.cancelDisturbing')
                : $t('msg.menu.disturbing')
            "
          >
            {{
              session.isInterruption
                ? $t("msg.menu.cancelDisturbing")
                : $t("msg.menu.disturbing")
            }}</span
          >
        </li>
        <li
          class="mouse-right-item"
          @click="doSession('isDelete')"
          v-if="mouseMenu.isDelete"
        >
          <span :title="$t('msg.menu.deleteChat')">{{
            $t("msg.menu.deleteChat")
          }}</span>
        </li>
        <!-- 搜索消息右键 -->
        <li
          class="mouse-right-item"
          @click="doRecord('forward')"
          v-if="mouseMenu.recordForward"
        >
          <span :title="$t('msg.menu.forward')">{{
            $t("msg.menu.forward")
          }}</span>
        </li>
        <li
          class="mouse-right-item"
          @click="doRecord('copy')"
          v-if="mouseMenu.recordCopy"
        >
          <span :title="$t('msg.menu.copy')">{{ $t("msg.menu.copy") }}</span>
        </li>
        <li
          class="mouse-right-item"
          @click="doRecord('more')"
          v-if="mouseMenu.recordMore"
        >
          <span :title="$t('msg.menu.more')">{{ $t("msg.menu.more") }}</span>
        </li>
        <li
          class="mouse-right-item"
          @click="doRecord('favorites')"
          v-if="mouseMenu.recordFavorites"
        >
          <span :title="$t('msg.menu.favorite')">{{ $t("msg.menu.favorite") }}</span>
        </li>
        <li
          class="mouse-right-item"
          @click="doRecord('goMsg')"
          v-if="mouseMenu.recordGoMsg"
        >
          <span :title="$t('msg.menu.jumpMessage')">{{ $t("msg.menu.jumpMessage") }}</span>
        </li>
        <!-- 头像右键 -->
        <li
          class="mouse-right-item"
          @click="gotoChat(false)"
          v-if="mouseMenu.gotoChat"
        >
          <span :title="$t('msg.detail.sendMsg')">{{
            $t("msg.detail.sendMsg")
          }}</span>
        </li>
        <li
          class="mouse-right-item"
          @click="tempSession"
          v-if="mouseMenu.tempSession"
        >
          <span :title="$t('msg.menu.tempSession')">{{
            $t("msg.menu.tempSession")
          }}</span>
        </li>
        <li
          class="mouse-right-item"
          @click="sendAtMsg"
          v-if="mouseMenu.atMember"
        >
          <span :title="'@' + memberInfo.nickName"
            >@{{ memberInfo.nickName }}</span
          >
        </li>
        <li
          class="mouse-right-item"
          @click="forbiddenOne"
          v-if="mouseMenu.isBanned"
        >
          <span
            :title="
              isBanned ? $t('msg.menu.cancelBanned') : $t('msg.menu.banned')
            "
          >
            {{
              isBanned ? $t("msg.menu.cancelBanned") : $t("msg.menu.banned")
            }}</span
          >
        </li>
        <li
          class="mouse-right-item"
          @click="shareCard"
          v-if="mouseMenu.shareCard"
        >
          <span :title="$t('msg.menu.sendCard')">{{
            $t("msg.menu.sendCard")
          }}</span>
        </li>
        <li class="mouse-right-item" @click="doShield" v-if="mouseMenu.shield">
          <span
            :title="
              isShield ? $t('msg.menu.unShield') : $t('msg.menu.doShield')
            "
          >
            {{
              isShield ? $t("msg.menu.unShield") : $t("msg.menu.doShield")
            }}</span
          >
        </li>
        <li
          class="mouse-right-item"
          @click="showNote = true"
          v-if="mouseMenu.addFriend"
        >
          <span :title="$t('msg.menu.addFriend')">{{
            $t("msg.menu.addFriend")
          }}</span>
        </li>
        <li
          class="mouse-right-item"
          @click="setGroupAdmin"
          v-if="mouseMenu.setAdmin"
        >
          <span
            :title="
              memberInfo.isAdmin == 2
                ? $t('msg.menu.cancelManager')
                : $t('msg.menu.manager')
            "
          >
            {{
              memberInfo.isAdmin == 2
                ? $t("msg.menu.cancelManager")
                : $t("msg.menu.manager")
            }}</span
          >
        </li>
        <li
          class="mouse-right-item"
          @click="transferGroup"
          v-if="mouseMenu.transferGroup"
        >
          <span :title="$t('msg.menu.transferGroup')">{{
            $t("msg.menu.transferGroup")
          }}</span>
        </li>
        <li
          class="mouse-right-item"
          @click="deleteGroupMember"
          v-if="mouseMenu.deleteMember && memberInfo.isAdmin == 0"
        >
          <span :title="$t('msg.menu.removeGroup')">{{
            $t("msg.menu.removeGroup")
          }}</span>
        </li>
      </ul>
      <transition name="pop">
        <div class="my-popup remark" v-if="showNote">
          <div class="my-popup-content" @click.stop=";">
            <h3 class="my-popup-title">{{ $t("msg.tip.verifyInfo") }}</h3>
            <span class="my-popup-close" @click="showNote = false"></span>
            <div class="display-flex">
              <div class="search-box">
                <div class="search-input">
                  <input
                    type="text"
                    :placeholder="$t('msg.tip.verifyInfo1')"
                    maxlength="20"
                    v-model="remark"
                  />
                  <i
                    class="icon-delete"
                    @click="remark = ''"
                    v-show="remark"
                  ></i>
                </div>
              </div>
              <button class="search-btn" @click="doAddFriend()">
                {{ $t("msg.common.confirm") }}
              </button>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </transition>
</template>
<script>
import { Util } from "@/tools/utils";
import { api } from "@/api";
import { EchatDB } from "@/tools/indexedDB";
import { mapGetters } from "vuex";
import { localStore } from "@/tools/localStorage";
import Msg from "@/tools/msg";
import { MessageHandler } from "@/tools/messageHandler";
import { sessionUtil } from "@/session/sessionUtil";
import { group } from "@/session/group";
import { msgManager } from "@/session/msgManager";
import { friend } from "@/session/friend";

export default {
  data() {
    return {
      mouseMenu: {
        left: 0,
        top: 0,
        copy: false, //消息右键
        withdraw: false,
        edit: false,
        reply: false,
        delete: false,
        forward: false,
        favorites: false,
        isMute: false,
        saveAs: false,
        selectCopy: false,
        more: false,
        isTop: false, //会话右键
        isInterruption: false,
        isDelete: false,
        recordForward: false, //搜索记录右键
        recordCopy: false, 
        recordMore: false,
        recordFavorites: false,
        recordGoMsg: false,
        gotoChat: false, //头像右键
        tempSession: false,
        atMember: false,
        isBanned: false,
        shareCard: false,
        shield: false,
        addFriend: false,
        setAdmin: false,
        transferGroup: false,
        deleteMember: false
      },
      message: {},
      record: {},
      session: {},
      memberInfo: {},
      isShield: false,
      showNote: false,
      isBanned: false,
      remark: "",
      selectedIds: [],
      selectedText: ""
    };
  },
  computed: {
    ...mapGetters(["userId", "userInfo", "currentSession","activityGroupMembers", "layout"]),
    messageList() {
      return this.$store.state.message;
    }
  },
    props: {
    mrData: {
      default: {}
    }
  },
  watch: {
    mrData() {
      this.onMouseRight();
    }
  },
  methods: {
    menuFilters(data) {
      this.initMemu();
      switch (data.type) {
        case "message":
          this.message = this.$store.state.message[data.mid];
          this.mouseMenu.delete = true;
          this.mouseMenu.copy = true; 
          this.mouseMenu.edit = true;
          this.mouseMenu.reply = true;
          this.mouseMenu.forward = true;
          this.mouseMenu.favorites = true;
          this.mouseMenu.more = true;
          //非本人发的消息
          if (this.message.bodyFrom != this.$store.state.userInfo.userId) {
            this.mouseMenu.edit = false;
          }
          //图片、视频、文件 
          if (
            this.message.bodyType == 3 ||
            this.message.bodyType == 5 ||
            this.message.bodyType == 18
          ) {
            this.mouseMenu.saveAs = true;
          }
          //语音
          if (this.message.bodyType == 4) {
            this.mouseMenu.forward = false;
          }
          //视频
          if (this.message.bodyType == 5) {
            this.mouseMenu.isMute = true;
          }
          //表情 图片、语音、视频、文件
          if (
            this.message.bodyType == 2 ||
            this.message.bodyType == 3 ||
            this.message.bodyType == 4 ||
            this.message.bodyType == 5 ||
            this.message.bodyType == 18 ||
            this.message.bodyType == 24
          ) {
            this.mouseMenu.edit = false;
            this.mouseMenu.copy = false;
          }
          //30人群聊
          if (this.message.bodyType == 29 ||
           this.message.bodyType == 32 || 
           this.message.bodyType == 44
          ) {
            this.mouseMenu.edit = false;
            this.mouseMenu.reply = false;
            this.mouseMenu.copy = false;
            this.mouseMenu.favorites = false;
          }
          //名片
          if (this.message.bodyType == 32) {
            this.mouseMenu.forward = false;
          }
          if (this.message.loading == 2) {
            this.mouseMenu.edit = false;
            this.mouseMenu.reply = false;
          }
          //群公告
          if (this.message.bodyType == 47) {
            this.mouseMenu.delete = true;
            this.mouseMenu.copy = true; 
            this.mouseMenu.edit = false;
            this.mouseMenu.reply = true;
            this.mouseMenu.forward = false;
            this.mouseMenu.favorites = false;
            this.mouseMenu.more = false;
          }
          break;
        case "session":          
          this.mouseMenu.isInterruption = true;          
          this.mouseMenu.isTop = true;
          this.mouseMenu.isDelete = true;
          this.session = this.$store.state.session.record[data.session+'-'+data.sessionType];
          break;
        case "record":
          this.mouseMenu.recordForward = true;
          this.mouseMenu.recordCopy = true;
          this.mouseMenu.recordMore = true;
          this.mouseMenu.recordFavorites = true;
          this.mouseMenu.recordGoMsg = true;
          this.record = data.mId;
          break;
        case "avatar":
          this.memberInfo = JSON.parse(JSON.stringify(this.activityGroupMembers[data.uId]));

          let self = this.activityGroupMembers[this.userId];
          if(!self){
            self={};
          }

          if (
            this.$store.state.friendList[data.uId] &&
            !this.$store.state.friendList[data.uId].temp
          ) {
            this.mouseMenu.gotoChat = true;
            this.mouseMenu.shareCard = true;
          } else {

            api.getGroupSetting({groupId:data.gId}).then(info=>{

              if(info){
                let group = info;
                if (
                  group.isFriend == "0" ||
                  (group.isFriend == "1" && self.isAdmin > 0)
                ) {
                  this.mouseMenu.addFriend = true;
                }
                if (
                  group.isForbidChat == "0" ||
                  (group.isForbidChat == "1" && self.isAdmin > 0)
                ) {
                  this.mouseMenu.tempSession = true;
                }

                this.mouseMenu.shield = true;
                friend.getNetworkSession(data.uId).then(res=>{
                  if (res.isBlacklist) {
                    this.isShield = true;
                  }
                })
              }
            })
                
          }

          if (self.isAdmin == 1) {
            this.mouseMenu.setAdmin = true;
            this.mouseMenu.transferGroup = true;
          }

          if (self.isAdmin > 0) {
            this.mouseMenu.deleteMember = true;
            if (this.memberInfo.isAdmin == 0) {
              this.mouseMenu.isBanned = true;
            }
          }

          if (this.memberInfo.isBanned == 1) {
            this.isBanned = true;
          }

          if (!data.banAt) {
            this.mouseMenu.atMember = true;
          }
          break;
        default:
          return;
      }
    },
    doMessage(type) {
      if (this.currentSession.fromType == "1") {
        let memberInfo = this.activityGroupMembers[this.userId];
        if(!memberInfo){
          memberInfo={};
        }
        let forbiddenWord = false;

        if (memberInfo.isBanned) {
          forbiddenWord = true;
        }

        if (
          this.currentSession.isBanned &&
          (!memberInfo.isAdmin || memberInfo.isAdmin < 1)
        ) {
          forbiddenWord = true;
        }

        if (
          forbiddenWord &&
          (type == "reply" || type == "edit" || type == "forward")
        ) {
          this.$message({
            title: this.$t("msg.forbidden.muting"),
            message: this.$t("msg.forbidden.mute"),
            showCancelButton: false
          }).then(data => {
            this.$store.dispatch("setLayout", ["", "", false]);
          });
        }
      }

      let mouseRightInfo = {
        type: type,
        mId: this.message.mId
      };
      this.$store.commit("SET_MOUSE_RIGHT_MSG", mouseRightInfo);
      this.$store.dispatch("setLayout", ["", "", false]);
    },
    saveAs() {
      let message = this.$store.state.message[this.message.mId];
      let href = "";

      if (message.bodyType == 3) {
        href = this.global.fileDownUrl + "original/" + message.msgContent.imgUrl;
      } else if (message.bodyType == 5) {
        href = this.global.fileDownUrl + "original/" + message.msgContent.videoUrl;
      } else if (message.bodyType == 18) {
        href = this.global.fileDownUrl + "original/" + message.msgContent.url;
      }

      var a = document.createElement("a");
      var event = new MouseEvent("click");
      var name = Util.getFileName(href);
      a.download = name;
      a.href = href;
      a.dispatchEvent(event);
      this.$store.dispatch("setLayout", ["", "", false]);
    },
    videoPlay() {
      let videoInfo = JSON.parse(
        JSON.stringify(this.$store.state.message[this.message.mId])
      );
      videoInfo.msgContent.videoUrl =videoInfo.msgContent.videoUrl;
      this.$parent.$refs.muteVideo.show(videoInfo, true);
      this.$store.dispatch("setLayout", ["", "", false]);
    },
    getRecordItem(mId,list){
      let result = {};
      for (var i = 0; i < list.length; i++) {
        let item = list[i];
        if(mId == item.mId) result = item;
      }
      return result;
    },
    doRecord(type){
      
      if (type == "forward") {
        this.$parent.$refs.searchRecord.doForward(this.record);
      }
      if(type == "more") {
        this.$parent.$refs.searchRecord.moreSelect(this.record);
      }
      if(type == "favorites") {
        this.$parent.$refs.searchRecord.addFavorites(this.record);
      }
      if(type == "goMsg") {
        this.$parent.$refs.searchRecord.goMsg(this.record);
      }
      if (type == "copy") {
        var history = this.getRecordItem(this.record,this.$store.state.record.record);
        let oInput = document.createElement("input");
        oInput.value = history.preview;
        document.body.appendChild(oInput);
        oInput.select(); // 选择对象
        document.execCommand("Copy");
        oInput.style.display = "none";
        document.body.removeChild(oInput);

        this.$store.commit("SET_TOAST_TEXT", this.$t("msg.menu.copySuccess"));
      }
      this.$store.dispatch("setLayout", ["", "", false]);
    },
    doSession(type) {
      let sessionType = this.session.fromType + "-" + type;
      let confString = "";
      switch (sessionType) {
        case "0-isTop":
          if (this.session.isTop == 0) {
            confString = JSON.stringify({ isTop: 1 });
          } else {
            confString = JSON.stringify({ isTop: 0 });
          }
          this.setFriendSetting(confString, type);
          break;
        case "0-isInterruption":
          if (this.session.isInterruption == 0) {
            confString = JSON.stringify({ isInterruption: 1 });
          } else {
            confString = JSON.stringify({ isInterruption: 0 });
          }
          this.setFriendSetting(confString, type);
          break;
        case "1-isTop":
          if (this.session.isTop == 0) {
            confString = JSON.stringify({ isTop: 1 });
          } else {
            confString = JSON.stringify({ isTop: 0 });
          }
          this.setGroupSetting(confString, type);
          break;
        case "1-isInterruption":
          if (this.session.isInterruption == 0) {
            confString = JSON.stringify({ isInterruption: 1 });
          } else {
            confString = JSON.stringify({ isInterruption: 0 });
          }
          this.setGroupSetting(confString, type);
          break;
        case "2-isTop":
          let isTop;
          if (this.session.isTop == 0) {
            isTop=1;
          } else {
            isTop=0;
          }
          this.setServiceSetting(1,isTop, type);
          break;
        case "2-isInterruption":
          let newMsgNotice;
          if (this.session.isInterruption == 0) {
            newMsgNotice=1;
          } else {
            newMsgNotice=0;
          }
          this.setServiceSetting(2,newMsgNotice, type);
          break;
        case "0-isDelete":
        case "1-isDelete":
        case "2-isDelete":
          this.deleteSession();
          break;
        default:
          return;
      }
      this.$store.dispatch("setLayout", ["", "", false]);
    },
    
    setGroupSetting(str, type) {
      let obj = {
        groupId: this.session.paramId,
        confString: str
      };
      this.$http.setGroupSetting(obj).then(
        () => {
          this.settingHandler(type);
          group.getGroupAll(true);
        },
        () => {}
      );
    },
    setFriendSetting(str, type) {
      let obj = {
        recipient: this.session.paramId,
        confString: str
      };

      if (this.currentSession.temp) {
        obj.type = 1;
      }

      this.$http.setFriendSetting(obj).then(() => {
        this.settingHandler(type);
        this.$store.dispatch("getFriendList", {});
      });
    },

    setServiceSetting(confType,state, type) {
      let obj = {
        serviceAccount: this.session.paramId
      };
      if(confType==1){
        obj.isTop=state;
      }else{
        obj.newMsgNotice=state;
      }
      this.$http.setServiceSetting(obj).then(() => {
        this.settingHandler(type);
      });
    },

    deleteSession() {
      let obj = {
        sessionId: this.session.paramId,
        type: this.session.fromType
      };
      this.$http.removeSession(obj).then(
        () => {
          this.$store.commit("DELETE_SESSION", this.session.paramId+'-'+this.session.fromType);
          if (this.session.paramId == this.currentSession.paramId) {
            this.$store.commit("UPDATE_CURRENT_SESSION", {});
            setTimeout(() => {
              let list = Object.values(this.$store.state.session.record);
              list.sort((a, b) => b.userTime - a.userTime);

              let sessionCache= this.$store.state.session.record;
              for(let key in sessionCache){
                if(sessionCache[key].isActivity){
                  sessionCache[key].isActivity=false;
                }        
              }
              list[0].isActivity=true;

              this.$store.commit("UPDATE_CURRENT_SESSION", list[0]);
            }, 100);
          }
          msgManager.removeMsgAll(this.session.fromType,this.session.paramId);
        },
        () => {}
      );
    },
    settingHandler(type) {
      switch (type) {
        case "isTop":
          if (this.session.isTop == 0) {
            this.session.isTop = 1;
          } else {
            this.session.isTop = 0;
          }
          this.$store.commit("UPDATE_SESSION", this.session);
          break;
        case "isInterruption":
          if (this.session.isInterruption == 0) {
            this.session.isInterruption = 1;
          } else {
            this.session.isInterruption = 0;
          }
          this.$store.commit("UPDATE_SESSION", this.session);
          break;
        default:
          return;
      }
    },
    gotoChat(temp) {
      this.$store.commit("SET_ROUTE_NAME", "chat");
      var chat = this.$store.state.session.record[this.memberInfo.userId+'-0'];

      if (!chat) {
        chat = {
          img: this.memberInfo.avatar,
          lastReadId: 0,
          mId: 0,
          fromType: 0,
          msgType: 1,
          preview: "",
          userTime: new Date().getTime(),
          name: this.memberInfo.nickName,
          paramId: this.memberInfo.userId,
          isTop: 0,
          isInterruption: 0
        };
        if (temp) {
          chat.temp = temp;
          let groupInfo = this.$store.state.groupList[this.memberInfo.groupId];
          chat.describe = `${groupInfo.groupId},${groupInfo.groupName}`;
        }
        this.$store.commit("UPDATE_SESSION", chat);
      }

      this.$store.commit("CLEAR_MESSAGE", {});
      setTimeout(() => {

              let sessionCache= this.$store.state.session.record;
              for(let key in sessionCache){
                if(sessionCache[key].isActivity){
                  sessionCache[key].isActivity=false;
                }        
              }
              chat.isActivity=true;

        this.$store.commit("UPDATE_CURRENT_SESSION", chat);
      }, 500);
      this.$store.dispatch("setLayout", ["", "", false]);
    },
    tempSession() {
      let groupInfo = this.$store.state.groupList[this.memberInfo.groupId];
      let obj = {
        sessionId: this.memberInfo.userId,
        state: 6,
        describe: `${groupInfo.groupId},${groupInfo.groupName}`
      };
      this.$http.startTempSession(obj).then(() => {
        this.gotoChat(true);
        this.memberInfo.temp = true;
        this.$store.commit("ADD_FRIEND_INFO", {
          userId: this.memberInfo.userId,
          info: this.memberInfo
        });
      });
    },
    sendAtMsg() {
      this.$store.commit("SET_AT_OBJ", this.memberInfo);
      this.$store.dispatch("setLayout", ["", "", false]);
    },
    forbiddenOne() {
      let groupMember = this.activityGroupMembers,
        idStr = "";

      if (this.isBanned) {
        groupMember[this.memberInfo.userId].isBanned = 0;
      } else {
        groupMember[this.memberInfo.userId].isBanned = 1;
      }

      for (let key in groupMember) {
        if (groupMember[key].isBanned) {
          idStr = idStr + groupMember[key].userId + ",";
        }
      }

      this.$http.forbiddenWord({
          Type: 3,
          groupId: this.currentSession.paramId,
          userIds: idStr.replace(/,$/, "")
        })
        .then(data => {
          this.$store.commit("SET_TOAST_TEXT", data);
          this.isBanned = !this.isBanned;

          this.$store.commit("SET_GROUP_MEMBER", groupMember);
          group.updateGroupMember(this.groupMember);
        });
    },
    shareCard() {
      let forwardInfo = {
        show: true,
        body: [
          {
            msgType: 32,
            bodyContent: {
              avatar: this.memberInfo.avatar,
              nickName: this.memberInfo.nickName,
              remark: null,
              userId: this.memberInfo.userId
            }
          }
        ]
      };

      this.$store.commit("SET_FORWARD_INFO", forwardInfo);
      this.$store.dispatch("setLayout", ["", "", false]);
    },
    doShield() {
      if (this.isShield) {
        this.$http
          .removeBlackList({ treatedIds: this.memberInfo.userId })
          .then(() => {
            this.$store.commit(
              "SET_TOAST_TEXT",
              this.$t("msg.tip.unForbiddenUser")
            );
            this.isShield = false;
          });
      } else {
        let obj = {
          treatedIds: this.memberInfo.userId,
          state: 6
        };
        this.$http.addBlackList(obj).then(() => {
          this.$store.commit(
            "SET_TOAST_TEXT",
            this.$t("msg.tip.forbiddenUser")
          );
          this.isShield = true;
        });
      }
      this.$store.dispatch("setLayout", ["", "", false]);
    },
    doAddFriend() {
      var groupInfo = this.$store.state.groupList[this.memberInfo.groupId];
      var postData = {
        recipient: this.memberInfo.userId,
        subtitle: this.remark,
        source: 6,
        sourceDescribe: `${groupInfo.groupId},${groupInfo.groupName}`
      };
      this.$http.addFriend(postData);
      this.showNote = false;
      setTimeout(() => {
        this.$store.dispatch("setLayout", ["", "", false]);
      }, 500);
    },
    setGroupAdmin() {
      let obj = {
        groupId: this.memberInfo.groupId,
        inviter: this.memberInfo.userId
      };
      this.$http.setGroupAdmin(obj).then(() => {
        this.$store.commit("SET_TOAST_TEXT", this.$t("msg.tip.operateSuccess"));

        if (this.memberInfo.isAdmin == 2) {
          this.memberInfo.isAdmin = 0;
        }else if (this.memberInfo.isAdmin == 0) {
          this.memberInfo.isAdmin = 2;
          this.memberInfo.isBanned = 0;
        }

        let info = {
          groupId: this.memberInfo.groupId,
          id: this.memberInfo.userId,
          info: this.memberInfo
        };
        this.$store.commit("UPDATA_MEMBER_INFO", info);
        group.updateMemberInfo(this.memberInfo);
        this.$store.dispatch("setLayout", ["", "", false]);


        //替换消息发送者的名称
        let messageJson=this.$store.state.message;
        for (let key in messageJson) {
          if (messageJson[key].bodyFrom == this.memberInfo.userId) {
            let msg = messageJson[key];
            msg.chatInfo = this.memberInfo;
            this.$store.commit("UPDATE_MESSAGE", msg);
          }
        }

      });
    },
    //转让群
    transferGroup() {
      let obj = {
        groupId: this.memberInfo.groupId,
        inviter: this.memberInfo.userId
      };
      this.$http.transferGroup(obj).then(() => {
        this.$store.commit("SET_TOAST_TEXT", this.$t("msg.tip.operateSuccess"));

        this.memberInfo.isAdmin = 1;
        let info = {
          groupId: this.memberInfo.groupId,
          id: this.memberInfo.userId,
          info: this.memberInfo
        };
        this.$store.commit("UPDATA_MEMBER_INFO", info);
        group.updateGroupMember(this.memberInfo);

        let userGroupInfo = this.activityGroupMembers[this.userId];
        if(!userGroupInfo){
          userGroupInfo={}; 
        }

        userGroupInfo.isAdmin = 0;
        let info1 = {
          groupId: userGroupInfo.groupId,
          id: userGroupInfo.userId,
          info: userGroupInfo
        };
        this.$store.commit("UPDATA_MEMBER_INFO", info1);
        group.updateGroupMember(userGroupInfo);

        this.$store.dispatch("setLayout", ["", "", false]);
      });
    },
    deleteGroupMember() {
      let obj = {
        groupId: this.memberInfo.groupId,
        inviter: this.memberInfo.userId
      };
      this.$http.deleteGroupUser(obj).then(() => {
        this.$store.commit("SET_TOAST_TEXT", this.$t("msg.tip.removeSuccess"));
        this.$store
          .dispatch("getGroupMember", { groupId: this.memberInfo.groupId })
          .then(() => {});
        this.$store.dispatch("setLayout", ["", "", false]);
      });
    },
    hasSelection() {
      var selectedText = "";

      if (window.getSelection) {
        var selectionObj = window.getSelection();
        selectedText = selectionObj.toString();
      } else if (document.selection) {
        //兼容ie
        var selectionObj = document.selection;
        var rangeObj = selectionObj.createRange();
        selectedText = rangeObj.text;
      }

      return selectedText ? true : false;
    },
    selectedMsg() {
      var selectionObj = null,
        rangeObj = null,
        selectedHtml = "",
        text = "";

      if (window.getSelection) {
        selectionObj = window.getSelection();
        text = selectionObj.toString();
        rangeObj = selectionObj.getRangeAt(0);
        var docFragment = rangeObj.cloneContents();
        var tempDiv = document.createElement("div");
        tempDiv.appendChild(docFragment);
        selectedHtml = tempDiv.innerHTML;
      } else if (document.selection) {
        //兼容ie
        selectionObj = document.selection;
        rangeObj = selectionObj.createRange();
        selectedHtml = rangeObj.htmlText;
        text = rangeObj.text;
      }

      const reg = new RegExp(`data-index="{%type%:%message%.+?}"`, "g");

      if (selectedHtml.match(reg)) {
        let arr = selectedHtml.match(reg);

        for (let item of arr) {
          let str = item.split("%mid%:")[1];
          let msgId = str.split(",")[0];
          this.selectedIds.push(+msgId);
        }
      }

      this.selectedText = MessageHandler.copyTextReplay(text);

      localStore.setStore("selectedIds", this.selectedIds);
      this.mouseMenu.selectCopy = true;
      this.mouseMenu.more = true;
    },
    selectCopy() {
      let oInput = document.createElement("input");

      oInput.value = this.selectedText;
      document.body.appendChild(oInput);
      oInput.select(); // 选择对象
      document.execCommand("Copy");
      oInput.style.display = "none";
      document.body.removeChild(oInput);

      this.setCopyMsg();
      this.$store.dispatch("setLayout", ["", "", false]);
    },
    setCopyMsg() {
      if (this.selectedIds.length < 2) return;

      let msgList = [];

      for (let i = 0; i < this.selectedIds.length; i++) {
        let msg = this.messageList[this.selectedIds[i]];
        if (this.currentSession.fromType == "0") {
          let info = {};
          if (msg.bodyFrom == this.userId) {
            info = this.userInfo;
          } else {
            info = this.$store.state.friendList[msg.bodyFrom];
          }
          msg.chatInfo = info;
        }

        msgList.push(msg);
      }

      let title = "";

      if (this.currentSession.fromType == "0") {
        title =
          this.userInfo.nickName +
          this.$t("msg.common.and") +
          this.currentSession.name;
      } else {
        title = this.$t("msg.common.group");
      }

      localStore.setCopyMsg(title, this.selectedText, msgList);
    },
    onMouseRight() {
      if (this.mrData.type == "message") {
        let message = this.$store.state.message[this.mrData.mid];
        if (message.loading == 0 || this.mrData.msgType == 49) {
          this.$store.dispatch("setLayout", ["", "", false]);
           }
        localStore.setStore("selectedIds", [this.mrData.mid]);
      }

      if (this.mrData.uId == this.userId) {
        this.$store.dispatch("setLayout", ["", "", false]);
      }
      let hasSelection = this.hasSelection();

      if (hasSelection) {
        this.selectedMsg();
      } else {
        this.menuFilters(this.mrData);
      }

      // console.log(document.body.clientWidth,document.body.clientHeight)
      // console.log(this.mrData.left,this.mrData.top);
      // 计算高度
      //每个功能块 36px
      let height=0;
      for(let key in this.mouseMenu){
        if(this.mouseMenu[key])
          height=height+36;
      }
      let cacheHeight=this.mrData.top+height;
      
      if(cacheHeight>document.body.clientHeight){
        this.mouseMenu.top = this.mrData.top-height;
      }else{
        this.mouseMenu.top = this.mrData.top;
      }
      this.mouseMenu.left = this.mrData.left;      
    },
    initMemu(){
      this.mouseMenu= {
        left: 0,
        top: 0,
        copy: false, //消息右键
        withdraw: false,
        edit: false,
        reply: false,
        delete: false,
        forward: false,
        favorites: false,
        isMute: false,
        saveAs: false,
        selectCopy: false,
        more: false,
        isTop: false, //会话右键
        isInterruption: false,
        isDelete: false,
        recordForward: false, //搜索记录右键
        recordCopy: false, 
        recordMore: false,
        recordFavorites: false,
        recordGoMsg: false,
        gotoChat: false, //头像右键
        tempSession: false,
        atMember: false,
        isBanned: false,
        shareCard: false,
        shield: false,
        addFriend: false,
        setAdmin: false,
        transferGroup: false,
        deleteMember: false
      };
      this.isBanned = false;
    }
  },
  mounted() {
    // ctrl + c 复制文本时
    if (this.layout.child == "ctrl") {
      this.selectedMsg();
      this.setCopyMsg();
    } else {
      this.onMouseRight();
    }
  }
};
</script>

<style lang="scss" scoped="" type="text/css">
.mouse-right {
  position: fixed;
  z-index: 599;
  width: 120px;
  background-color: #fff;
  border-radius: 2px;
  border: 1px solid #ddd;
  box-shadow: 0 0 3px 0 rgba(0, 0, 0, 0.2);
  font-size: 12px;
  line-height: 36px;
  .mouse-right-item {
    height: 36px;
    padding: 0 5px;
    border-bottom: 1px solid #eee;
    text-align: center;
    color: #2c2c2c;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    cursor: pointer;

    &:last-child {
      border: 0;
    }
    &:hover {
      background-color: #F0F4F8;
    }
  }
}
</style>
