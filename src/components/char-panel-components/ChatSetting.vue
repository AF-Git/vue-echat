<template>
  <transition name="drop">
    <div class="menu-drop chat-menu" @click.stop="">
      <ul class="menu-list" v-if="currentSession.fromType == '0'">
        <li
          class="menu-item display-flex"
          @click="modifyFriend('isInterruption')"
        >
          <span
            class="menu-icon"
            :class="{ active: currentSession.isInterruption }"
          ></span>
          <span
            class="flex-item-nowrap"
            :title="$t('msg.chatSetting.disturbing')"
            >{{ $t("msg.chatSetting.disturbing") }}</span
          >
        </li>
        <li class="menu-item display-flex" @click="modifyFriend('isTop')">
          <span
            class="menu-icon"
            :class="{ active: currentSession.isTop }"
          ></span>
          <span class="flex-item-nowrap" :title="$t('msg.chatSetting.stick')">{{
            $t("msg.chatSetting.stick")
          }}</span>
        </li>
        <li
          class="menu-item display-flex"
          @click="shareCard"
          v-if="!currentSession.temp"
        >
          <span class="menu-icon"></span>
          <span
            class="flex-item-nowrap"
            :title="$t('msg.chatSetting.recommend')"
            >{{ $t("msg.chatSetting.recommend") }}</span
          >
        </li>
        <!-- 清理本地数据 -->
        <li
          class="menu-item display-flex"
          @click="showCleanHistory=true"
        >
          <span class="menu-icon"></span>
          <span
            class="flex-item-nowrap"
            :title="$t('msg.chatSetting.clearChatHistory')"
            >{{ $t("msg.chatSetting.clearChatHistory") }}</span
          >
        </li>
        <li class="menu-item display-flex" @click="modifyClear">
          <span class="menu-icon"></span>
          <span
            class="flex-item-nowrap"
            :title="$t('msg.chatSetting.autoClean')"
            >{{ $t("msg.chatSetting.autoClean") }}</span
          >
          <span class="triangle" :class="{ active: showClear }"></span>
        </li>
      </ul>
      <ul class="menu-list" v-if="currentSession.fromType == '1'">
        <li class="menu-item display-flex" @click="edit(1)" v-if="isAdmin > 0">
          <span class="menu-icon"></span>
          <span
            class="flex-item-nowrap"
            :title="$t('msg.chatSetting.groupName')"
            >{{ $t("msg.chatSetting.groupName") }}</span
          >
        </li>
        <li class="menu-item display-flex" @click="operationIndex = 1" v-if="isAdmin > 0">
          <span class="menu-icon"></span>
          <span
            class="flex-item-nowrap"
            :title="$t('msg.chatSetting.affiche')"
            >{{ $t("msg.chatSetting.affiche") }}</span
          >
        </li>
        <li class="menu-item display-flex" @click="addGroupUser">
          <span class="menu-icon"></span>
          <span
            class="flex-item-nowrap"
            :title="$t('msg.chatSetting.addUser')"
            >{{ $t("msg.chatSetting.addUser") }}</span
          >
        </li>
        <li class="menu-item display-flex" @click="edit(3)">
          <span class="menu-icon"></span>
          <span
            class="flex-item-nowrap"
            :title="$t('msg.chatSetting.myNickName')"
            >{{ $t("msg.chatSetting.myNickName") }}</span
          >
        </li>
        <li
          class="menu-item display-flex"
          @click="$refs.forbidden.show()"
          v-if="showForbidden"
        >
          <span class="menu-icon"></span>
          <span
            class="flex-item-nowrap"
            :title="$t('msg.chatSetting.moreSetting')"
            >{{ $t("msg.chatSetting.moreSetting") }}</span
          >
        </li>
        <li
          class="menu-item display-flex"
          @click="modifyGroup('isShowMemberNick')"
        >
          <span
            class="menu-icon"
            :class="{ active: currentSession.isShowMemberNick }"
          ></span>
          <span
            class="flex-item-nowrap"
            :title="$t('msg.chatSetting.showUserName')"
            >{{ $t("msg.chatSetting.showUserName") }}</span
          >
        </li>
        <li
          class="menu-item display-flex"
          @click="modifyGroup('isInterruption')"
        >
          <span
            class="menu-icon"
            :class="{ active: currentSession.isInterruption }"
          ></span>
          <span
            class="flex-item-nowrap"
            :title="$t('msg.chatSetting.disturbing')"
            >{{ $t("msg.chatSetting.disturbing") }}</span
          >
        </li>
        <li class="menu-item display-flex" @click="modifyGroup('isTop')">
          <span
            class="menu-icon"
            :class="{ active: currentSession.isTop }"
          ></span>
          <span class="flex-item-nowrap" :title="$t('msg.chatSetting.stick')">{{
            $t("msg.chatSetting.stick")
          }}</span>
        </li>
        <li
          class="menu-item display-flex"
          v-if="isAdmin != 1"
          @click="showConfirm = true"
        >
          <span class="menu-icon"></span>
          <span
            class="flex-item-nowrap"
            :title="$t('msg.chatSetting.deleteExit')"
            >{{ $t("msg.chatSetting.deleteExit") }}</span
          >
        </li>
        <!-- 清理本地数据 -->
        <li
          class="menu-item display-flex"
          @click="showCleanHistory=true"
        >
          <span class="menu-icon"></span>
          <span
            class="flex-item-nowrap"
            :title="$t('msg.chatSetting.clearChatHistory')"
            >{{ $t("msg.chatSetting.clearChatHistory") }}</span
          >
        </li>
        <li
          class="menu-item display-flex"
          v-if="isAdmin > 0"
          @click="modifyClear"
        >
          <span class="menu-icon"></span>
          <span
            class="flex-item-nowrap"
            :title="$t('msg.chatSetting.autoClean')"
            >{{ $t("msg.chatSetting.autoClean") }}</span
          >
          <span class="triangle" :class="{ active: showClear }"></span>
        </li>
        <li
          class="menu-item display-flex"
          v-if="isAdmin == 1"
          @click="showConfirm = true"
        >
          <span class="menu-icon"></span>
          <span
            class="flex-item-nowrap"
            :title="$t('msg.chatSetting.dissolveChat')"
            >{{ $t("msg.chatSetting.dissolveChat") }}</span
          >
        </li>
      </ul>
      <transition name="drop-left">
        <div class="clear-menu" v-if="showClear" @click.stop="">
          <ul class="menu-list">
            <li class="menu-item display-flex" @click="setCycle(0)">
              <span
                class="menu-icon"
                :class="{ active: clearType == 0 }"
              ></span>
              <span
                class="flex-item-nowrap"
                :title="$t('msg.chatSetting.never')"
                >{{ $t("msg.chatSetting.never") }}</span
              >
            </li>
            <li class="menu-item display-flex" @click="setCycle(1)">
              <span
                class="menu-icon"
                :class="{ active: clearType == 1 }"
              ></span>
              <span
                class="flex-item-nowrap"
                :title="$t('msg.chatSetting.one')"
                >{{ $t("msg.chatSetting.one") }}</span
              >
            </li>
            <li class="menu-item display-flex" @click="setCycle(2)">
              <span
                class="menu-icon"
                :class="{ active: clearType == 2 }"
              ></span>
              <span
                class="flex-item-nowrap"
                :title="$t('msg.chatSetting.three')"
                >{{ $t("msg.chatSetting.three") }}</span
              >
            </li>
            <li class="menu-item display-flex" @click="setCycle(3)">
              <span
                class="menu-icon"
                :class="{ active: clearType == 3 }"
              ></span>
              <span
                class="flex-item-nowrap"
                :title="$t('msg.chatSetting.seven')"
                >{{ $t("msg.chatSetting.seven") }}</span
              >
            </li>
            <li class="menu-item display-flex" @click="setCycle(4)">
              <span
                class="menu-icon"
                :class="{ active: clearType == 4 }"
              ></span>
              <span
                class="flex-item-nowrap"
                :title="$t('msg.chatSetting.thirty')"
                >{{ $t("msg.chatSetting.thirty") }}</span
              >
            </li>
          </ul>
        </div>
      </transition>
      <transition name="scale-x">
        <div class="my-popup edit-input" v-if="showEdit">
          <!-- 修改群名称 -->
          <div class="my-popup-content" v-if="editType == 1">
            <h3 class="my-popup-title">
              {{ $t("msg.chatSetting.editGroupName") }}
            </h3>
            <span class="my-popup-close" @click="showEdit = false"></span>
            <div class="display-flex">
              <div class="search-box">
                <div class="search-input">
                  <input
                    type="text"
                    :placeholder="$t('msg.newGroup.enterGroupName')"
                    maxlength="20"
                    v-model="text"
                  />
                </div>
              </div>
              <button class="search-btn" @click="comfirm()">
                {{ $t("msg.common.confirm") }}
              </button>
            </div>
          </div>
          <!-- 修改在本群的昵称 -->
          <div class="my-popup-content" v-if="editType == 3">
            <h3 class="my-popup-title">
              {{ $t("msg.chatSetting.yourNickName") }}
            </h3>
            <span class="my-popup-close" @click="showEdit = false"></span>
            <div class="display-flex">
              <div class="search-box">
                <div class="search-input">
                  <input
                    type="text"
                    :placeholder="$t('msg.chatSetting.enterNickName')"
                    maxlength="20"
                    v-model="text"
                  />
                </div>
              </div>
              <button class="search-btn" @click="comfirm()">
                {{ $t("msg.common.confirm") }}
              </button>
            </div>
          </div>
        </div>
      </transition>
      <!-- 清理聊天记录弹窗 -->
      <transition name="pop">
        <Popup :title="$t('msg.common.warn')"
          @click.native="showCleanHistory=false;" 
          :hideClose="true"
          v-if="showCleanHistory"
        >
          <div class="logout" @click.stop="" slot="body">
            <div class="logout-detail">{{ $t("msg.chatSetting.clearChatHistoryAsk") }}</div>
            <button class="cannel" @click="showCleanHistory=false">
              {{ $t("msg.common.cancel") }}
            </button>
            <button class="comfirm" @click="clearChatHistory">
              {{ $t("msg.chatSetting.clearChatHistoryOkButton") }}
            </button>
          </div>
        </Popup>
      </transition>
      <!-- 退群二次弹层 -->
      <div class="my-popup quit-confirm"
        v-show="showConfirm"
        @click.stop="showConfirm = false"
      >
        <div class="quit-content">
          <div class="quit-head">!</div>
          <p>{{ $t("msg.chatSetting.title") }}</p>
          <button class="comfirm" v-show="isAdmin != 1" @click="doUserQuit()">
            {{ $t("msg.chatSetting.exit") }}
          </button>
          <button class="comfirm" v-show="isAdmin == 1" @click="doQuitDelete()">
            {{ $t("msg.chatSetting.dissolve") }}
          </button>
          <button class="cannel" @click="showConfirm = false">
            {{ $t("msg.common.cancel") }}
          </button>
        </div>
      </div>
      <invite-group-member
        ref="invite"
        @inviteHandler="inviteHandler"
      ></invite-group-member>
      <group-more-setting ref="forbidden"></group-more-setting>
      <announcement 
        v-model="operationIndex" 
        :announcement="text" 
        :isAdmin="showForbidden"
        @change="sendGroupAffiche" 
        v-if="operationIndex == 1"
      ></announcement>
    </div>
  </transition>
</template>

<script>
import { mapGetters } from "vuex";
import { EchatDB } from "@/tools/indexedDB";
import { localStore } from "@/tools/localStorage";
import InviteGroupMember from "./InviteGroupMember";
import GroupMoreSetting from "./GroupMoreSetting";
import Announcement from "../group/Announcement";
import { msgManager } from "@/session/msgManager";
import { friend } from "@/session/friend";
import {group} from "@/session/group";

export default {
  name: "user-center",
  data() {
    return {
      showEdit: false,
      editType: 1,
      text: "",
      isAdmin: 0,
      showForbidden: false,
      showConfirm: false,
      showForbiddenWord: false,
      operationIndex: 0, // 1-群公告 2-分享群 
      showClear: false,
      clearType: 0,
      showCleanHistory:false
    };
  },
  props: {
    value: {
      type: Boolean
    }
  },
  components: {
    InviteGroupMember,
    GroupMoreSetting,
    Announcement
  },
  computed: {
    ...mapGetters(["userInfo", "currentSession", "session", "layout"]),
    friendList() {
      return this.$store.state.friendList;
    },
    chatList() {
      let arr = Object.values(this.session.record);
      arr = arr.sort((a, b) => b.userTime - a.userTime);
      return arr;
    }
  },
  methods: {
    modifyFriend(type) {
      let confString = "";
      if (type == "isTop") {
        if (this.currentSession.isTop == 0) {
          confString = JSON.stringify({ isTop: 1 });
        } else {
          confString = JSON.stringify({ isTop: 0 });
        }
      } else {
        if (this.currentSession.isInterruption == 0) {
          confString = JSON.stringify({ isInterruption: 1 });
        } else {
          confString = JSON.stringify({ isInterruption: 0 });
        }
      }
      let obj = {
        recipient: this.currentSession.paramId,
        confString: confString
      };

      if (this.currentSession.temp) {
        obj.type = 1;
      }

      this.$http.setFriendSetting(obj).then(() => {
        this.settingHandler(type);
      });
    },
    modifyGroup(type) {
      let confString = "";
      if (type == "isTop") {
        if (this.currentSession.isTop == 0) {
          confString = JSON.stringify({ isTop: 1 });
        } else {
          confString = JSON.stringify({ isTop: 0 });
        }
      } else if (type == "isInterruption") {
        if (this.currentSession.isInterruption == 0) {
          confString = JSON.stringify({ isInterruption: 1 });
        } else {
          confString = JSON.stringify({ isInterruption: 0 });
        }
      } else {
        if (this.currentSession.isShowMemberNick == 0) {
          confString = JSON.stringify({ isShowMemberNick: 1 });
        } else {
          confString = JSON.stringify({ isShowMemberNick: 0 });
        }
      }
      let obj = {
        groupId: this.currentSession.paramId,
        confString: confString
      };
      this.$http.setGroupSetting(obj).then(
        () => {
          this.settingHandler(type);
        },
        () => {}
      );
    },
    settingHandler(type) {
      switch (type) {
        case "isTop":
          if (this.currentSession.isTop == 0) {
            this.currentSession.isTop = 1;
          } else {
            this.currentSession.isTop = 0;
          }
          this.$store.commit("UPDATE_SESSION", this.currentSession);
          break;
        case "isInterruption":
          if (this.currentSession.isInterruption == 0) {
            this.currentSession.isInterruption = 1;
          } else {
            this.currentSession.isInterruption = 0;
          }
          this.$store.commit("UPDATE_SESSION", this.currentSession);
          break;
        case "isShowMemberNick":
          if (this.currentSession.isShowMemberNick == 0) {
            this.currentSession.isShowMemberNick = 1;
          } else {
            this.currentSession.isShowMemberNick = 0;
          }
          if (
            this.$parent.$refs.list.scrollTop + 500 >
            this.$parent.$refs.list.scrollHeight
          ) {
            setTimeout(() => {
              console.log(0)
              this.$parent.$refs.list.scrollTop = this.$parent.$refs.list.scrollHeight;
            }, 200);
          }
          this.$store.commit("UPDATE_SESSION", this.currentSession);
          break;
        default:
          return;
      }
    },
    shareCard() {
      this.$emit("input", false);
      let forwardInfo = {},
        user = this.friendList[this.currentSession.paramId];
      if (user){
        forwardInfo = {
          show: true,
          body: [
            {
              msgType: 32,
              bodyContent: {
                avatar: user.avatar,
                nickName: user.nickName || user.userName,
                remark: null,
                userId: this.currentSession.paramId
              }
            }
          ]
        };
      } else {
        let avatar = this.currentSession.img;
        forwardInfo = {
          show: true,
          body: [
            {
              msgType: 32,
              bodyContent: {
                avatar: avatar,
                nickName: this.currentSession.name,
                remark: null,
                userId: this.currentSession.paramId
              }
            }
          ]
        };
      }

      this.$store.commit("SET_FORWARD_INFO", forwardInfo);
    },
    addGroupUser() {
      this.$store.commit("SET_INVITE", {
        show: true,
        groupId: this.currentSession.paramId
      });
    },
    inviteHandler(data) {
      this.$store.dispatch("getGroupMember", {
        groupId: this.currentSession.paramId
      });
    },
    edit(type) {
      this.text = '';
      this.showEdit = true;
      this.editType = type;
    },
    comfirm() {
      let confString = {};
      if (this.editType == 1) {
        if (!this.text) {
          this.$store.commit(
            "SET_TOAST_TEXT",
            this.$t("msg.newGroup.enterGroupName")
          );
          return false;
        }
        confString.groupName = this.text;
        this.setGroupSetting(confString, this.editType);
      }
      if (this.editType == 3) {
        if (!this.text) {
          this.$store.commit(
            "SET_TOAST_TEXT",
            this.$t("msg.chatSetting.enterNickName")
          );
          return false;
        }
        confString.nickName = this.text;
        this.setGroupSetting(confString, this.editType);
      }
      this.showEdit = false;
    },
    setGroupSetting(confString) {
      confString = JSON.stringify(confString);
      this.$http
        .setGroupSetting({
          groupId: this.currentSession.paramId,
          confString: confString
        })
        .then(
          () => {
            this.text = "";
          },
          () => {}
        );
    },
    sendGroupAffiche(text) {
      let time = new Date().getTime();
      let msg = {
        type: 0,
        showText: "@%1Ss" + text,
        userIds: ["allMember"]
      };
      let obj = {
        msg: JSON.stringify(msg),
        msgType: 24,
        chatType: this.currentSession.fromType,
        toId: this.currentSession.paramId,
        time: time,
        userId: this.$parent.userId
      };
      let inviter = "@所有人" + " " + text;
      this.$store.dispatch("sendMsg", obj);
      this.$parent.updataChatHistory(inviter, 24, time);
      this.operationIndex = 0;
      this.text = "";
    },
    doUserQuit() {

      this.$http
        .userQuit({
          groupId: this.currentSession.paramId
        })
        .then(data => {
          this.showConfirm = false;
          this.$store.dispatch("setLayout", ["", "", false]);
          this.updateSession();
          msgManager.removeMsgAll(this.currentSession.fromType,this.currentSession.paramId);
        });
    },
    doQuitDelete() {
      this.$emit("input", false);
      this.$http
        .deleteGroup({
          groupId: this.currentSession.paramId
        })
        .then(data => {
          this.showConfirm = false;
          this.$store.dispatch("setLayout", ["", "", false]);
          this.updateSession();
        });
      msgManager.removeMsgAll(this.currentSession.fromType,this.currentSession.paramId);
    },
    updateSession() {
      this.$store.commit("DELETE_SESSION", this.currentSession.paramId+'-'+this.currentSession.fromType);

              let sessionCache= this.$store.state.session.record;
              for(let key in sessionCache){
                if(sessionCache[key].isActivity){
                  sessionCache[key].isActivity=false;
                }        
              }
              this.chatList[0].isActivity=true;

      this.$store.commit("UPDATE_CURRENT_SESSION", this.chatList[0]);
      group.getGroupAll(true);
    },
    modifyClear() {
      this.showClear = !this.showClear;
      this.clearType =
        localStore.readRegularCleaning(this.currentSession.paramId)
          .cleanMsgCycle || 0;
    },
    setCycle(type) {
      let confString = JSON.stringify({ cleanMsgCycle: type + "" });

      if (this.currentSession.fromType == "1") {
        let obj = {
          groupId: this.currentSession.paramId,
          confString: confString
        };
        this.$http.setGroupSetting(obj).then(
          () => {
            this.clearType = type;
            this.showClear = false;
            this.$store.dispatch("getReadNum", {
              groupId: this.currentSession.paramId
            });
          },
          () => {}
        );
      } else {
        let obj = {
          recipient: this.currentSession.paramId,
          confString: confString
        };
        this.$http.setFriendSetting(obj).then(() => {
          this.clearType = type;
          this.showClear = false;
          friend.getNetworkSession(this.currentSession.paramId);
        });
      }
    },
    /**
     * 清理本地缓存数据
     */
    clearChatHistory(){
      this.showCleanHistory=false;
      let sessionUserId=this.currentSession.paramId;
      let type=this.currentSession.fromType;
      this.$http.deleteMessage({
        sessionUserId: sessionUserId,
        type: type,
        folkMsgId: '-1'
      }).then(
        data => {
          // 清空本地数据
          msgManager.removeMsgAll(type,sessionUserId);
          if(sessionUserId==this.currentSession.paramId&&type==this.currentSession.fromType){
            this.$store.commit("CLEAR_MESSAGE", {});
          }                  
          //成功弹窗
          this.$store.commit('SET_TOAST_TEXT', this.$t("msg.tip.operateSuccess"))
      })
    },
  },
  mounted() {
    if (this.currentSession.fromType == "1") {
      this.showForbidden = false;
      let self=this.$store.state.activityGroupMembers[this.userInfo.userId];
      if(!self){
        self={};
      }
      let admin = self.isAdmin;
      this.isAdmin = admin;

      if (admin > 0) {
        this.showForbidden = true;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@import "../../assets/css/var";
.chat-menu {
  width:auto;
  max-width: 320px;
  top: 41px;
  left: -35px;
  padding: 14px 0 14px 0;
  border-radius: 10px;
  .menu-item {
    position: relative;
    padding-right:30px;
    .flex-item-nowrap{
      -webkit-box-flex: none;
      -ms-flex: none;
      flex: none;
      display:inline-block;
      width:auto;
      max-width:235px;
      text-overflow:ellipsis;
      white-space: nowrap;
      overflow:hidden;
    }
    .triangle {
      display: block;
      width: 0;
      height: 0;
      margin: 0 0 0 5px;
      border-left: 6px solid transparent;
      border-right: 6px solid transparent;
      border-bottom: 8px solid #bbb;
      &.active {
        transform: rotate(90deg);
      }
    }
  }
  .menu-icon {
    width: 15px;
    height: 11px;
    margin: 0 12px;
    &.active {
      background: url(../../assets/images/chat/selected.png);
    }
  }
  .edit-input {
    .my-popup-content {
      width: 415px;
      padding-bottom: 10px;
    }
  }
}
.quit-confirm {
  .quit-content {
    position: absolute;
    top: 50%;
    left: 50%;
    height: 170px;
    width: 274px;
    text-align: center;
    background: #fff;
    -webkit-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
    text-align: center;
    border-top: 9px solid $color-theme;
    border-radius: 10px;
    box-sizing: border-box;
    .quit-head {
      position: absolute;
      left: 50%;
      top: -29px;
      height: 58px;
      line-height: 58px;
      width: 58px;
      font-size: 48px;
      color: #fff;
      margin-left: -29px;
      text-align: center;
      border-radius: 50px;
      background: $color-theme;
    }
    p {
      padding: 0 25px;
      height: 14px;
      line-height: 14px;
      font-size: 14px;
      margin-top: 60px;
    }
    button {
      height: 34px;
      width: 78px;
      margin-top: 32px;
      display: inline-block;
      border-radius: 5px;
      font-size: 14px;
      text-align: center;
      line-height: 100%;
    }
    .comfirm {
      color: #fff;
      background: $color-theme;
      margin-right: 50px;
    }
    .cannel {
      color: $color-theme;
      background: #fff;
      border: 1px solid $color-theme;
    }
  }
}

.clear-menu {
  position: absolute;
  left: 103%;
  bottom: -145px;
  width: auto;
  padding: 14px 0;
  border-radius: 10px;
  box-shadow: 0 0 10px #bbb;
  background-color: #fff;
  .menu-item{
    padding-right:25px;
  }
}
</style>
