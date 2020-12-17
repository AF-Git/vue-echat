<template>
  <div class="wrapper display-flex">
    <div class="main">
      <div class="main-top">
        <div class="left"></div>
        <div class="right"></div>
      </div>
      <div class="main-body display-flex" @click="showFavorites=false">
        <div class="public-header display-flex">
          <div class="display-flex" @click="showIndex($event, 1)">
            <img class="img user-avatar" :src="global.fileDownUrl + 'compress/'+userInfo.headImg" ondragstart="return false" />
            <div class="nickName">{{userInfo.nickName}}</div>
          </div>
          <div class="more-menu" 
            :class="{active: layout.child == 'mm'}" 
            @click="showIndex($event, 2)"
          ></div>
        </div>
        <user-center
          v-if="layout.module == 'uc' && (layout.child == 'uc' || layout.child == 'logout')"
        ></user-center>
        <more-menu
          v-if="layout.module == 'uc' && layout.child == 'mm'"
        ></more-menu>
        <div class="main-menu display-flex">
          <div
            class="menu chat"
            :class="{ active: routeName == 'chat' }"
            @click="menuClick('chat')"
            @dblclick="switchChat()"
          >
            <span class="icon-badge" v-if="unReadNum > 0">{{
              unReadNum | numFitler
            }}</span>
          </div>
          <div
            class="menu contact"
            :class="{ active: routeName == 'contact' }"
            @click="menuClick('contact')"
          >
            <span class="icon-badge" v-if="newFriendsNum">{{
              newFriendsNum | numFitler
            }}</span>
          </div>
        </div>
        <contact ref="contact" v-if="routeName == 'contact'"></contact>
        <chat ref="chat" v-if="routeName == 'chat'"></chat>
        <loading v-if="showLoading"></loading>
        <favorites v-model="showFavorites" ref="favorites"></favorites>
        <EmojiRight
          v-if="layout.module == 'cp' && layout.child == 'em'"
          ></EmojiRight>
      </div>
    </div>
    <Popup :title="$refs.audiovideo.video.type == 1?$t('msg.common.videoCall'):$t('msg.common.audioCall')" :hide-close="true" v-if="videoclose">
        <div class="logout" @click.stop="" slot="body">
          <div class="logout-detail"> 
            {{ $t("msg.call.closeWin")}}{{$refs.audiovideo.video.type == 1? $t("msg.common.videoCall"): $t("msg.common.audioCall")}}，{{ $t("msg.call.confirmClose") }}
            </div>
          <button class="two-btn cannel" @click="showcloseClose()">
            {{ $t("msg.common.cancel") }}
          </button>
          <button class="two-btn delete"  @click="closeVideo">
            {{ $t("msg.common.confirm") }}
          </button>
        </div>
      </Popup>
    <!-- 组件 --> 
    <audio-video ref="audiovideo"></audio-video>
    <search-record ref="searchRecord"></search-record>
    <alias ref="alias"></alias>
    <user-information
      v-if="layout.module == 'uc' && (layout.child == 'ui' || layout.child == 'nn')"
    ></user-information>  
    
    <group-member-profile 
      v-if="layout.module == 'gmi'"
    ></group-member-profile>
    <add-friend
      v-if="layout.module == 'uc' && layout.child == 'af'"
    ></add-friend>
    <new-group
      v-if="layout.module == 'uc' && layout.child == 'ng'"
    ></new-group>
    <invite-friend 
      v-if="layout.module == 'uc' && layout.child == 'if'"
    ></invite-friend>
    <setting v-if="layout.module == 'uc' && layout.child == 'st'"></setting>
    <mouse-right :mrData="mrInfo" 
      ref="mouseRight" 
      v-if="(layout.module == 'mr' && (layout.child == 'mr' || layout.child == 'ctrl')) || 
        (layout.module == 'gp-inf' && layout.child == 'mr')"
    ></mouse-right>
    <forward-info v-if="forwardInfo.show"></forward-info>
    <myemoji v-if="myemoji.show"></myemoji>
    <login-fail v-if="loginFail"></login-fail>
    <seal-group v-if="layout.module == 'seal'"></seal-group>
    <toast></toast>
    <crowdtoast></crowdtoast>
    <video-player ref="muteVideo"></video-player>
    <div class="mask" v-if="layout.mask"></div>
    <!-- 语音提示 -->
    <audio
      id="audio_msg"
      style="opacity: 0;"
      src="./static/voice/incoming_chat.wav"
    ></audio>
    <audio
      id="audio_send"
      style="opacity: 0;"
      src="./static/voice/send_chat.mp3"
    ></audio>
    <audio
      id="audio_dail"
      style="opacity: 0;"
      src="./static/voice/voice_video_dial.mp3"
      muted="true;"
      loop="loop"
    ></audio>
    <audio
      id="audio_connected"
      style="opacity: 0;"
      src="./static/voice/voice_video_connected.mp3"
    ></audio>
    <audio
      id="audio_end"
      style="opacity: 0;"
      src="./static/voice/voice_video_end.mp3"
    ></audio>
    <audio id="message-voice" hidden></audio>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { Util } from "@/tools/utils";
import Rtc from "@/tools/rtc-message";
import Msg from "@/tools/msg";
import { EchatDB } from "@/tools/indexedDB";
import { localStore } from "@/tools/localStorage";
import { Crypto } from "@/tools/crypto" 
import Contact from "./Contact";
import Chat from "./Chat";
import AudioVideo from "@/components/AudioVideo";
import SearchRecord from "@/components/userCenter/SearchRecord";
import Alias from "@/components/userCenter/Alias";
import UserInformation from "@/components/UserCenter/UserInformation";
import GroupMemberProfile from "@/components/char-panel-components/GroupMemberProfile";
import VideoPlayer from "@/components/char-panel-components/VideoPlayer";
import UserCenter from "@/components/UserCenter/UserCenter";
import MoreMenu from "@/components/UserCenter/MoreMenu";
import Favorites from "@/components/UserCenter/Favorites";
import InviteFriend from "@/components/UserCenter/InviteFriend";
import Setting from "@/components/UserCenter/Setting";
import AddFriend from "@/components/UserCenter/AddFriend";
import NewGroup from "@/components/UserCenter/NewGroup.vue";
import ForwardInfo from "@/components/ForwardInfo";
import MouseRight from "@/components/MouseRight";
import LoginFail from "@/components/popup/LoginFail";
import SealGroup from "@/components/popup/SealGroup";
import Toast from "@/components/popup/Toast";
import Crowdtoast from "@/components/popup/Crowdtoast";
import Myemoji from "@/components/char-panel-components/Myemoji";
import EmojiRight from "@/components/char-panel-components/EmojiRight";
import { group } from "@/session/group";
import { service } from "@/session/service";
import { friend } from "@/session/friend";

import { sessionUtil } from "@/session/sessionUtil";

export default {
  name: "index",
  data() {
    return {
      vioceReady: true,
      showLoading: true,
      showFavorites: false,
      topNum: 0,
      bandNum: 0,
      mrInfo: null
    };
  },
  components: {
    Chat,
    Contact,
    AudioVideo,
    UserInformation,
    GroupMemberProfile,
    VideoPlayer,
    UserCenter,
    MoreMenu,
    Setting,
    SearchRecord,
    Alias,
    InviteFriend,
    Favorites,
    ForwardInfo,
    AddFriend,
    NewGroup,
    MouseRight,
    LoginFail,
    SealGroup,
    Toast,
    Crowdtoast,
    Myemoji,
    EmojiRight
  },
  computed: {
    ...mapGetters(["userId", "userInfo", "session", "currentSession", "forwardInfo", "loginFail", "layout","myemoji","right","favorites","videoclose"]),
    routeName() {
      return this.$store.state.routeName;
    },
    unReadNum() {
      return this.$store.state.redPoint.unReadNum;
    },
    newFriendsNum() {
      return this.$store.state.redPoint.newFriendsNum;
    },
    chatList() {
      let arr = Object.values(this.session.record);
      return arr;
    },
    topList() {
      let arr1 = [];
      this.chatList.forEach(v => {
        if (v.isTop) {
          arr1.push(v);
        }
      });
      arr1.sort((a, b) => b.userTime - a.userTime);
      return arr1;
    },
    normalList() {
      let arr1 = [];
      this.chatList.forEach(item => {
        if (!item.isTop) {
          arr1.push(item);
        }
      });
      arr1.sort((a, b) => b.userTime - a.userTime);
      return arr1;
    },
  },
  methods: {
    closeVideo(){
      this.$refs.audiovideo.closeVideo()
    },
   showcloseClose(){
      this.$store.commit("SET_VIDEOCLOSE", false);
    },
    doShowFavorites(){
      this.showFavorites = true;
    },
    initCLient(userId) {
      EchatDB.openDB(userId).then(() => {
        friend.getFriendAll().then(data =>{
          this.$store.commit("SET_FRIEND_LIST", data);
          group.getGroupAll().then(data =>{
              this.$store.commit("SET_GROUP_LIST", data);
              this.$store.dispatch("getSessionList", {}).then(data => {
                this.showLoading = false;
              });
          })
        })

        let sessionList = sessionUtil.getLocalStoreSessionList();
        if (sessionList) {
          this.$store.commit('setSession', sessionList);
          this.showLoading = false;
        }
      });
    },
    menuClick(type) {
      this.$store.commit("SET_ROUTE_NAME", type);
      if(this.routeName!='chat'){        
        this.$store.commit("UPDATE_CURRENT_SESSION", {});
        this.$store.commit("CLEAR_MESSAGE", {});
      }
    },
    getSwitchList() {
      let result = [];
      this.topList.forEach(v => {
        if (v.mId > v.lastReadId) {
          let sort = 1;
          if(v.isTop && v.isTop==1) sort = 2;
          if(v.isInterruption && v.isInterruption==1) sort = 0;
          v.sort = sort;
          if(sort!=0) result.push(v);
        }
      });
      this.normalList.forEach(v => {
        if (v.mId > v.lastReadId) {
          let sort = 1;
          if(v.isTop && v.isTop==1) sort = 2;
          if(v.isInterruption && v.isInterruption==1) sort = 0;
          v.sort = sort;
          if(sort!=0) result.push(v);
        }
      });
      result = result.sort((a, b) => +b.sort - +a.sort);
      return result;
    },
    getBandList(){
      let result = [];
      this.topList.forEach(v => {
        if (v.mId > v.lastReadId) {
          if(v.isInterruption && v.isInterruption==1)  result.push(v);
        }
      });
      this.normalList.forEach(v => {
        if (v.mId > v.lastReadId) {
          if(v.isInterruption && v.isInterruption==1)  result.push(v);
        }
      });
      return result;
    },
    getScrollNum(chat) {
      let num = 0;
      for (var i = this.topList.length - 1; i >= 0; i--) {
        let item = this.topList[i];
        if(item.paramId == chat.paramId) num = i;
      }
      for (var i = this.normalList.length - 1; i >= 0; i--) {
        let item = this.normalList[i];
        if(item.paramId == chat.paramId) num = this.topList.length + i;
      }
      return num;
    },
    insertEmoji(obj){
    this.$refs.chat.$refs.chatHistory.insertEmoji(obj);
    },
    switchChat() {

      let switchChatList = this.getSwitchList();
      let bandChatList = this.getBandList();
      
      if(switchChatList && switchChatList.length){
        console.log(switchChatList)
        let num = 0;
        if (this.topNum < switchChatList.length) {
          let chat = switchChatList[this.topNum];
          num = this.getScrollNum(chat);
          this.$refs.chat.$refs.chatList.scrollChat(num);
          this.topNum++;
        } else {
          let chat = switchChatList[0];
          num = this.getScrollNum(chat);
          this.$refs.chat.$refs.chatList.scrollChat(num);
          this.topNum = 1;
        }
      }else{
        if(bandChatList && bandChatList.length){
          console.log(bandChatList)
          let num = 0;
          if (this.bandNum < bandChatList.length) {
            let chat = bandChatList[this.bandNum];
            num = this.getScrollNum(chat);
            this.$refs.chat.$refs.chatList.scrollChat(num);
            this.bandNum++;
          } else {
            let chat = bandChatList[0];
            num = this.getScrollNum(chat);
            this.$refs.chat.$refs.chatList.scrollChat(num);
            this.bandNum = 1;
          }
        }
      }
    },
    setLoginInfo(userInfo) {
      let user = JSON.parse(Crypto.decryptByDES(userInfo, "echat000"));
      this.initCLient(user.userId);
      this.$store.commit("SET_USER_TOKEN", user.token);
      this.$store.commit("SET_USER_INFO", user); //预防下面搜索个人信息请求接口出错

      this.$http.searchInfo({ ids: user.userId }).then(
        data => {
          data[0].headImg =  data[0].avatar;
          this.$store.commit("SET_USER_INFO", data[0]);
          Util.clearCookie("eUcShEaRt");
          sessionStorage.setItem("eUcShEaRt", userInfo);
        },
        () => {}
      );
      setTimeout(() => {
        //延时启动
        Rtc.sendRtc(null);
      }, 500)
      
    },

    showIndex(event, idx) {
      event.stopPropagation();
      
      if (this.layout.module == "uc" && !idx) {
        this.$store.dispatch("setLayout", ["", "", false]);
      } else {
        if (idx == 1) {
          this.$store.dispatch("setLayout", ["uc", "uc", false]);
        } else if (idx == 2)  {
          this.$store.dispatch("setLayout", ["uc", "mm", false]);
        } 
      }
    }
  },
  created() {
    Util.checkCookie("eUcShEaRt").then(
      res => {
        this.setLoginInfo(res);
      },
      () => {
        let info = sessionStorage.getItem("eUcShEaRt");
        if (info) {
          this.setLoginInfo(info);
        } else {
          this.$store.dispatch("setLoginFail", true);
        }
      }
    );
  },
  mounted() {
    setTimeout(() => {
      //获取 消息通知配置
      this.$store.dispatch("getUserSetting", { modularCode: "1" });

      // this.$store.dispatch("getNewFriends").then(() => {
      //   //?作用
      // });
    }, 500);
    window.addEventListener("click", event => {
      if (this.layout.module) {
        this.$store.dispatch("setLayout", ["", "", false]);
        let right ={show:false}
        this.$store.commit("SET_RIGHT", right);
      }
    });

    window.addEventListener("keyup", event => {
      if (event.keyCode == 27) {
        if (this.layout.module) {
          this.$store.dispatch("setLayout", ["", "", false]);
        }
      }

      if (event.ctrlKey && event.keyCode === 67) {
        this.$store.dispatch("setLayout", ["mr", "ctrl", false]);
        setTimeout(() => {
          this.$store.dispatch("setLayout", ["", "", false]);
        }, 50);
      }
    });

    //鼠标右键菜单
    document.oncontextmenu = ev => {
      let mEvent = ev.target || event.target,
        data = {};
        
      //截图右键取消
      if (this.layout.module == "cp" || this.layout.module == "ss") {
        this.$store.dispatch("setLayout", ["", "", false]);
        return false;
      }

      for (let i = 0; i < 10; i++) {
        if (mEvent.parentNode) {
          let idx = mEvent.dataset.index;

          if (idx) {
            idx = idx.replace(/%/g, '"');
            data = JSON.parse(idx);
            //if(data.type!="record") 
            this.$store.dispatch("setLayout", ["mr", "mr", false]);
            data.top = ev.clientY;
            data.left = ev.clientX;
          }

          if (data.type) {
            break;
          } else {
            mEvent = mEvent.parentNode;
          }
        } else {
          break;
        }
      }

      if (data.type) {
        this.mrInfo = data;
        return false;
      }
    };
  }
};
</script>

<style lang="scss" scoped>
@import "../assets/css/var";

.wrapper {
  height: 100%;
  width: 100%;
  .main {
    position: relative;
    width: 983px;
    height: 679px;
    margin: 0 auto;
    background: #eee;
    font-size: 16px;
    border-radius: 2px;
    box-shadow: 0 0 14px rgba(0, 0, 0, 0.4);

    .main-top {
      display: flex;
      // position: relative;
      // width: 100%;
      // height: 18px;
      // border-radius: 2px 2px 0 0;
      // border-bottom: 1px solid $border-color;
      // background-color: #f2f2f2;
      .left{
        width: 283px;
        height: 18px;
        background-color: #F0F4F8;
        // border-radius: 2px 0 0 0;
        // border-right:1px solid $border-color; 
        border-bottom: 1px solid $border-color;
      }
      .right{
        width: 700px;
        height: 18px;
        background: #F0F4F8;
        // border-radius: 0 2px 0 0;
        // border-left:1px solid $border-color;
        border-bottom: 1px solid $border-color;
      }
    }
    .main-body {
      position: relative;
      width: 100%;
      height: 661px;
      overflow: visible;
      background-color: #F0F4F8;

      .public-header {
        position: absolute;
        top: 19px;
        left: 0;
        z-index: 1;
        justify-content: space-between;
        width: 283px;
        padding: 0 8px;

        .user-avatar {
          width: 34px;
          height: 34px;
          border: 2px solid $color-theme;
          cursor: pointer;
          margin-left: 10px;
        }
         .nickName{
          max-width: 112px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
           margin-left:14px ;
         }
        .more-menu {
          width: 18px;
          height: 18px;
          background: url(../assets/images/index/more-menu.png);
          cursor: pointer;
          margin-right: 5px;
          &:hover,
          &.active {
            background-position: -18px 0;
          }
        }
      }

      .main-menu {
        position: absolute;
        left: 0;
        top: 107px;
        width: 283px;
        height: 43px;
        border-top: 1px solid $border-color; 
        border-bottom: 1px solid $border-color;
        // border-right: 1px solid $border-color;
        user-select: none;
        background: #F0F4F8;
        z-index: 1;
        .menu {
          position: relative;
          width: 50%;
          height: 100%;
          background: #F0F4F8;
          background-repeat: no-repeat;
          background-position: center;
          cursor: pointer;
        }
        .chat {
          border-right:solid 1px #E2E2E2;
          background-image: url(../assets/images/index/icon-chat.png);
          &.active {
            background-image: url(../assets/images/index/icon-chat-active.png);
          }
        }
        .contact {
          background-image: url(../assets/images/index/icon-contact.png);
          &.active {
            background-image: url(../assets/images/index/icon-contact-active.png);
          }
        }
        .icon-badge {
          top: 8px;
          right: 40px;
        }
      }
    }
  }
}

.mask {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 99;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, .3);
}
</style>
