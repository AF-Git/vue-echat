<template>
  <transition name="scale-x">
    <Popup :hideHeader="true">
      <div class="friend-profile" v-if="showProfile" slot="body">
        <div class="border"></div>
        <div class="profile-content">
          <span class="popup-close" @click="hide"></span>
          <div class="user-head display-flex" @click.stop=";">
            <div class="user-avatar">
              <img
                class="img"
                :src="global.fileDownUrl + 'compress/' + friendInfo.avatar"
                v-headError
                v-headViewer
                ondragstart="return false"
              />
              <span class="default" v-defaultHead v-if="!friendInfo.avatar" v-text="friendInfo.nickName"></span>
            </div>
            <div class="display-flex-item">
              <div class="display-flex">
                <span class="user-name display-flex-item">{{
                  friendInfo.nickName
                }}</span>
                <span
                  class="sex"
                  :class="{ male: friendInfo.gender == 1 }"
                ></span>
              </div>
              <div v-if="!isForbidFriend">
                EchatAPP ID：<span v-text="userId"></span>
              </div>
            </div>
            <!-- <div class="code" @click="showCode"></div> -->
          </div>
          <ul class="menu-list intro" @click.stop=";">
            <li class="menu-item">
              <span class="lable">{{ $t("msg.groupInfo.groupNickName") }}</span>
              <!-- <span>{{
                friendInfo.groupNickName || $t("msg.common.nothing")
              }}</span> -->
              <input
                class="groupNickName display-flex-item"
                type="text"
                id="groupNickName"
                maxlength="20"
                v-model="text"
                placeholder=""
                @blur="edit"
                @keyup.enter="edit"
                :disabled="!showEdit"
              />
              <label class="edit" for="groupNickName" v-show="userInfo.userId==userId && !showEdit" @click="showEdit=!showEdit"></label>
            </li>
          </ul>
          <ul class="menu-list intro" @click.stop=";">
            <li class="menu-item">
              <span class="lable">{{ $t("msg.user.region") }}</span>
              <span>{{ address || $t("msg.common.nothing") }}</span>
            </li>
            <li class="menu-item signature">
              <span class="label">{{ $t("msg.user.signature") }}</span>
              <span>{{
                friendInfo.signature || $t("msg.common.nothing")
              }}</span>
            </li>
          </ul>
          <div class="shield" :class="{ unshield: inBlack }" v-if="!isFriend&&isShow">
            <span class="btn" @click.stop="unShield" v-if="inBlack">{{
              $t("msg.menu.unShield")
            }}</span>
            <span class="btn" @click.stop="doShield" v-else>{{
              $t("msg.menu.doShield")
            }}</span>
          </div>
          <div class="btn-wrap display-flex" v-if="!isFriend">
            <span
              class="btn left"
              :title="$t('msg.menu.addFriend')"
              @click.stop="showNote = true"
              v-if="!isForbidFriend && userId!=userInfo.userId"
              >{{ $t("msg.menu.addFriend") }}</span
            >
            <span
              class="btn right"
              :title="$t('msg.menu.tempSession')"
              @click="tempSession"
              v-if="!isForbidTemp"
              >{{ $t("msg.menu.tempSession") }}</span
            >
          </div>
          <div class="btn-wrap" v-else>
            <span class="btn left send" @click="gotoChat(false)">{{
              $t("msg.common.messages")
            }}</span>
          </div>
          <div class="user-code" v-show="showQrCode">
            <canvas id="qrcodeCard"></canvas>
            <img
              class="avatar"
              :src="global.fileDownUrl + 'compress/' + friendInfo.avatar"
              v-headError
            />
          </div>
          <EditPopup 
            v-model="showNote"
            :title="$t('msg.menu.addFriend')"
            :placeholderText="$t('msg.tip.verifyInfo1')" 
            @change="doAddFriend" 
            v-if="showNote"
          ></EditPopup>
        </div>
      </div>
    </Popup>
  </transition>
</template>
<script>
import QRCode from "qrcode";
import { mapGetters } from "vuex";
import { EchatDB } from "@/tools/indexedDB";
import { Util } from "@/tools/utils";
import { group } from "@/session/group";

export default {
  name: "member-profile",
  data() {
    return {
      userId: 0,
      groupId: 0,
      showProfile: false,
      showNote: false,
      friendInfo: {},
      address: "",
      showQrCode: false,
      isFriend: false,
      isForbidFriend: false,
      isForbidTemp: false,
      inBlack: false,
      twoType: false,
      isShow:true,
      showEdit: false,
      text: "",
    };
  },
  components: {
    QRCode
  },
  computed: {
    ...mapGetters(["userInfo", "currentSession", "message", "layout"])
  },
  methods: {
    show() {
      let id = this.layout.child[0];
      let gId = this.layout.child[1];
      this.userId = id;

      if (!gId) {
        this.groupId = this.currentSession.paramId;
      } else {
        this.groupId = gId;
        this.twoType = true;
      }

      if (
        this.$store.state.friendList[id] &&
        !this.$store.state.friendList[id].temp
      ) {
        this.isFriend = true;
      }

      this.$http.getMemberInfo({
          groupId: this.groupId,
          memberId: id
        }).then(data => {
          if (!data) {
            this.$store.commit(
              "SET_TOAST_TEXT",
              this.$t("msg.groupInfo.userLeave")
            );
          } else {
            this.friendInfo = data;
            let info = this.$store.state.activityGroupMembers[id];

            if(data.avatar){
              info.headImg =  data.avatar;
            } 
            info.nickName = data.groupNickName || data.nickName;
            let groupId = this.groupId;
            this.$store.commit("UPDATA_MEMBER_INFO", {  id, info });
            group.updateMemberInfo(info);

            //替换消息发送者的名称
            for (let key in this.message) {
              if (this.message[key].bodyFrom == id) {
                let msg = this.message[key];
                msg.chatInfo = info;
                this.$store.commit("UPDATE_MESSAGE", msg);
              }
            }

            // this.address = Util.getArea(
            //   this.friendInfo.countryCode,
            //   this.friendInfo.stateCode
            // );
            if(this.friendInfo){
              this.address=this.friendInfo.stateCode+' '+this.friendInfo.countryCode;
            }else{
              this.address='';
            }

            if (data.isBlacklist) {
              this.inBlack = true;
            }

            let groupInfo = this.$store.state.groupList[this.groupId];

            let groupMember = this.$store.state.activityGroupMembers[this.userInfo.userId];
            if(!groupMember){
              groupMember={};
            }

            if (groupInfo.isFriend == "1" && groupMember.isAdmin < 1) {
              this.isForbidFriend = true;
            }
            if (groupInfo.isForbidChat == "1" && groupMember.isAdmin < 1) {
              this.isForbidTemp = true;
            }
            if (this.userInfo.userId == id) {
              this.isShow = false;
              this.isForbidFriend = false;
              this.isForbidTemp = true;
            }

          }
          this.text = this.friendInfo.groupNickName;
          this.showProfile=true;
        });
    },
    hide() {
      this.$store.dispatch("setLayout", ["", "", false]);
    },
    useqrcode(path) {
      var canvas = document.getElementById("qrcodeCard");
      QRCode.toCanvas(canvas, path, error => {
        if (error) console.error(error);
      });
    },
    showCode() {
      this.$http.getShareUrl({}).then(data => {
        this.showQrCode = true;
        let url = data + `?XA${this.userId}`;
        this.useqrcode(url);
      });
    },
    doAddFriend(text) {
      var groupInfo = this.$store.state.groupList[this.groupId];
      var postData = {
        recipient: this.userId,
        subtitle: text,
        source: 6,
        sourceDescribe: `${groupInfo.groupId},${groupInfo.groupName}`
      };
      this.$http.addFriend(postData);
      this.showNote = false;
    },
    doShield() {
      let obj = {
        treatedIds: this.userId,
        state: 6
      };
      this.$http.addBlackList(obj).then(() => {
        this.$store.commit("SET_TOAST_TEXT", this.$t("msg.tip.forbiddenUser"));
        this.inBlack = true;
      });
    },
    unShield() {
      let obj = {
        treatedIds: this.userId
      };
      this.$http.removeBlackList(obj).then(() => {
        this.$store.commit(
          "SET_TOAST_TEXT",
          this.$t("msg.tip.unForbiddenUser")
        );
        this.inBlack = false;
      });
    },
    gotoChat(temp) {
      //跳转到个人聊天？
      let session = "";
      if (this.twoType) {
        let groupInfo = this.$store.state.groupList[this.groupId];
        session = {
          paramId: groupInfo.groupId,
          name: groupInfo.groupName
        };
      } else {
        session = this.currentSession;
      }

      this.$store.commit("SET_ROUTE_NAME", "chat");

      var chat = this.$store.state.session.record[this.userId+'-0'];

      if (!chat) {
        chat = {
          img: this.friendInfo.avatar,
          lastReadId: 0,
          mId: 0,
          fromType: 0,
          msgType: 1,
          preview: "",
          userTime: new Date().getTime(),
          name: this.friendInfo.nickName,
          paramId: this.userId,
          isTop: 0,
          isInterruption: 0
        };
        if (temp) {
          chat.temp = temp;
          chat.describe = `${session.paramId},${session.name}`;
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
      let session = "";
      if (this.twoType) {
        let groupInfo = this.$store.state.groupList[this.groupId];
        session = {
          paramId: groupInfo.groupId,
          name: groupInfo.groupName
        };
      } else {
        session = this.currentSession;
      }
      let obj = {
        sessionId: this.userId,
        state: 6,
        describe: `${session.paramId},${session.name}`
      };
      this.$http.startTempSession(obj).then(() => {
        this.gotoChat(true);
        this.friendInfo.temp = true;
        this.$store.commit("ADD_FRIEND_INFO", {
          userId: this.userId,
          info: this.friendInfo
        });
      });
    },
    edit() {
      if(this.text==this.friendInfo.groupNickName){
        this.showEdit = false;
        return false
      } 
      let confString = {
        nickName:this.text
      };
      confString = JSON.stringify(confString);
      this.$http.setGroupSetting({
        groupId: this.currentSession.paramId,
        confString: confString
      }).then(
        () => {
        },() => {}
      );
      this.showEdit = false;
    },
  },
  mounted() {
    this.show();
  }
};
</script>

<style lang="scss" scoped>
@import "../../assets/css/var";
.default{
  position:absolute;
  top:0;left:0;
  height:70px;width:70px;
  border-radius: 50%;
  text-align: center;
  line-height: 70px;
  font-weight: 550;
  color: #fff;
}
.friend-profile {
  position: relative;
  top: 0;
  left: 0;
  height: 464px;
  text-align: left;
  box-shadow: none;
  .profile-content {
    height: 446px;
    border-left: 0;
    .user-head {
      line-height: 28px;
    }
    .signature {
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid $border-color;
      line-height: 28px;
      .label {
        display: block;
      }
    }
    .shield {
      position: absolute;
      left: 0;
      bottom: 51px;
      width: 100%;
      text-align: center;
      .btn {
        line-height: 38px;
        color: $color-red;
        cursor: pointer;
      }
    }
    .unshield .btn {
      color: $color-theme;
    }
    .btn-wrap {
      position: absolute;
      left: 0;
      bottom: 0;
      width: 100%;
      background-color: #fff;
      border-top: 1px solid $border-color;
      text-align: center;
      .btn {
        flex: 1;
        height: 50px;
        font-size: 16px;
        line-height: 50px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        cursor: pointer;
        &.left {
          color: $color-theme;
          &:hover {
            color: #fff;
            background-color: $color-theme;
          }
        }
        &.right {
          border-left: 1px solid $border-color;
          color: #fea405;
          &:hover {
            color: #fff;
            background-color: #fea405;
          }
        }
        &.send {
          display: block;
          width: 100%;
        }
      }
    }
  }
  .popup-close {
    display: block;
    position: absolute;
    top: -14px;
    right: 10px;
    width: 10px;
    height: 10px;
    background: url(../../assets/images/chat/icon-window-close.png) center center no-repeat;
    cursor: pointer;
  }
}
.menu-item{
  position:relative;
  .groupNickName{
    background:transparent;
  }
  .edit{
    display:inline-block;
    position:absolute;
    right:0;bottom:5px;
    width: 15px;
    height: 16px;
    background: #f0f4f8;
    background-image: url(../../assets/images/chat/btn-edit.png);
    background-size:100% 100%;
    cursor:pointer;
  }
}
</style>
