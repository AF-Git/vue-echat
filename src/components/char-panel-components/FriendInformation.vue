<template>
  <transition name="scale-x">
    <div class="friend-profile" @click.stop="">
      <div class="border"></div>
      <div class="profile-content" @click.stop="" v-if="!showLoading">
        <div class="user-head display-flex">
          <div class="user-avatar">
            <img class="img" :src="global.fileDownUrl + 'compress/'+userInfo.headImg" v-headError v-headViewer  ondragstart="return false"/>
            <span class="default" v-defaultHead v-if="!userInfo.headImg">{{
                  userInfo.nickName
                }}</span>
          </div>
          <div class="display-flex-item">
            <div class="display-flex">
              <span class="user-name display-flex-item">{{
                userInfo.nickName
              }}</span>
              <span class="sex" :class="{ male: userInfo.gender == 1 }"></span>
            </div>
            <div v-if="!currentSession.temp">EchatAPP ID: <span v-text="userInfo.userId"></span></div>
            <div class="user-note display-flex">
              <span>{{ $t("msg.user.note") }}</span>
              <input
                class="display-flex-item"
                id="userNote"
                type="text"
                maxlength="20"
                v-model="tempNote"
                :placeholder="$t('msg.detail.addNote')"
                @blur="setnickname()"
                :disabled="!showNote"
              />
              <label
                class="edit"
                for="userNote"
                @click="showNote = !showNote"
                v-show="!showNote"
              ></label>
            </div>
          </div>
        </div>
        <ul class="menu-list">
          <li class="menu-item">
            <span class="lable">{{ $t("msg.user.region") }}</span>
            <span>{{ address  }}</span>
          </li>
          <li class="menu-item signature">
            <span class="label">{{ $t("msg.user.signature") }}</span>
            <span>{{ userInfo.signature  }}</span>
          </li>
        </ul>
        <ul class="menu-list">
          <li class="menu-item">
            <span class="lable">{{ $t("msg.detail.from") }}: </span>
            <span>{{
              source
            }}</span>
          </li>
        </ul>
        <ul class="menu-list setting">
          <li
            class="menu-item display-flex"
            @click="modifyFriend('isInterruption')"
          >
            <span
              class="lable flex-item-nowrap"
              :title="$t('msg.chatSetting.disturbing')"
              >{{ $t("msg.chatSetting.disturbing") }}</span
            >
            <echat-switch
              v-model="currentSession.isInterruption"
            ></echat-switch>
          </li>
          <li class="menu-item display-flex" @click="modifyFriend('isTop')">
            <span
              class="lable flex-item-nowrap"
              :title="$t('msg.chatSetting.stick')"
              >{{ $t("msg.chatSetting.stick") }}</span
            >
            <echat-switch v-model="currentSession.isTop"></echat-switch>
          </li>
          <li class="menu-item display-flex" @click="shareCard()">
            <span
              class="lable flex-item-nowrap"
              :title="$t('msg.chatSetting.recommend')"
              >{{ $t("msg.chatSetting.recommend") }}</span
            >
            <span class="icon-right"></span>
          </li>
        </ul>
        <div class="delete" @click="doDeleteFriend">
          {{ $t("msg.detail.delete") }}
        </div>
        </div>
      <loading v-if="showLoading"></loading>
    </div>
  </transition>
</template>
<script>
import { Config } from "@/common/config"
import { api } from "@/api";
import QRCode from "qrcode";
import { mapGetters } from "vuex";
import { Util } from "@/tools/utils";
import { EchatDB } from "@/tools/indexedDB";
import { msgManager } from "@/session/msgManager";
import {friendDB} from "@/session/friend/friendDB";
import { friend } from "@/session/friend";

export default {
  name: "profile",
  data() {
    return {
      showNote: false,
      tempNote: "",
      showSuccess: false,
      userInfo: {},
      address: "",
      source: "",
      showQrCode: false,
      showLoading: true,
      filterList:[
        "",
        this.$t("msg.menu.search"),
        this.$t("msg.detail.scanQRcode"),
        this.$t("msg.detail.shareCard"),
        this.$t("msg.detail.peopleNearby"),
        this.$t("msg.detail.shareInvite"),
        this.$t("msg.detail.groupUserAdd"),
        "",
        this.$t("msg.user.usernameSearch")
      ]
    };
  },
  components: {
    QRCode
  },
  computed: {
    ...mapGetters(["currentSession"])
  },
  methods: {
    filterSource(val) {
      if (+val > 0 && +val < 9) return this.filterList[val];
      else return "";
    },
    show() {
      let userId=this.currentSession.paramId;
      this.showNote = false;
      this.userInfo = this.$store.state.friendList[userId];
      if(this.userInfo){
        this.address=this.userInfo.stateCode+' '+this.userInfo.countryCode;
        this.source = this.filterSource(this.userInfo.source)
      }else{
        this.address='';
      }
      
      if (this.userInfo) this.tempNote = this.userInfo.notes;
      this.showLoading = false;

      //获取好友配置
      api.getFriendInfo({recipient:this.currentSession.paramId}).then(data =>{

          data.checked = false;
          data.nickName = data.notes || data.nickName || data.userName;
          if (data.avatar) {
            data.headImg = data.avatar;
          }
          this.$store.commit("ADD_FRIEND_INFO", {userId,info:data});

          this.userInfo=data;
          this.tempNote=this.userInfo.notes;
          this.address=this.userInfo.stateCode+' '+this.userInfo.countryCode;
          console.log(this.userInfo.source)
          this.source = this.filterSource(this.userInfo.source)
          console.log(this.source)
      })
    },
    useqrcode(path) {
      var canvas = document.getElementById("qrcodeCard");
      QRCode.toCanvas(canvas, path, error => {
        if (error) console.error(error);
      });
    },
    hideCode() {
      this.showQrCode = false;
    },
    setnickname() {
      if (
        this.tempNote &&
        this.tempNote.replace(/(&nbsp;*)|(\s*)/g, "").length == 0
      ) {
        this.tempNote = this.userInfo.notes;
        return;
      }
      this.showNote = false;
      let obj = {
        recipient: this.currentSession.paramId,
        confString: {
          notes: this.tempNote || ""
        }
      };
      obj.confString = JSON.stringify(obj.confString);

      this.$http.setRemark(obj).then(
        data => {
          this.userInfo = this.$store.state.friendList[this.userId];
          if (this.userInfo) {
            this.tempNote = this.userInfo.notes;
          }
        },
        () => {}
      );
    },
    shareCard() {
      let forwardInfo = {
        show: true,
        body: [
          {
            msgType: 32,
            bodyContent: {
              avatar: this.userInfo.avatar,
              nickName: this.userInfo.nickName,
              remark: null,
              userId: this.userInfo.userId
            }
          }
        ]
      };
      this.$store.commit("SET_FORWARD_INFO", forwardInfo);
      this.$emit("value", 0);
    },
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
      this.$http.setFriendSetting(obj).then(() => {
        this.settingHandler(type);
      });
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
        default:
          return;
      }
    },
    doDeleteFriend() {
      this.$http.deleteFriend({ recipient: this.userInfo.userId }).then(() => {
        this.$store.dispatch("setLayout", ["", "", false]);
        //删除好友
        friendDB.deleteFriend(+this.userInfo.userId);
        this.$store.commit('DEL_FRIEND_INFO',Number(this.userInfo.userId));
        this.$store.commit("DELETE_SESSION", this.userInfo.userId+'-0');
        if (
          this.userInfo.userId == this.$store.getters.currentSession.paramId
        ) {
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
        msgManager.removeMsgAll(0,this.userInfo.userId);
      });
    }
  },
  mounted() {
    this.show();
  },
  beforeDestroy() {
    window.removeEventListener("click", this.hideCode);
  }
};
</script>
<style lang="scss" scoped>
.default{
  position:absolute;
  top:0;left:0;
}
</style>style>