<template>
  <div class="input-menu " unselectable="on">
    <div>
      <!-- <a
        href="javascript: ;"
        class="icon icon-emoji"
        :class="{ active: layout.module == 'emoji' }"
        :title="$t('msg.common.emoji')"
        @click.stop="emoji"
        @mouseover="mouseOver"
      ></a> -->
      <!-- <emoji></emoji> -->
      <a class="icon icon-image" :title="$t('msg.common.image')">
        <label class="lable" for="uploadImg"></label>
      </a>
      <!-- <a
        href="javascript: ;"
        class="icon icon-links"
        :title="$t('msg.common.file')"
        v-if="!(currentSession.fromType==0&&currentSession.temp)"
      >
        <label class="lable" for="file"></label>
      </a> -->
      <!-- <a
        href="javascript: ;"
        class="icon icon-screenshot"
        :class="{ active: layout.child == 'ss' }"
        :title="$t('msg.chatPanel.screen')"
        @click.stop="screen"
      ></a> -->
    </div>
    <!-- <div class="audio-video" v-if="!(currentSession.fromType==0&&currentSession.temp)">
      <a
        href="javascript: ;"
        class="icon icon-video"
        :class="{
          active:
            andioVideoInfo.vType == 0 || andioVideoInfo.vType == 1 || layout.child == 'av'
        }"
        :title="$t('msg.chatPanel.videoVoice')"
        @click.stop="showAVselect"
      ></a>
      <transition name="drop-bottom">
        <ul
          class="menu-drop"
          v-if="
            layout.child == 'av' && andioVideoInfo.vType != 0 && andioVideoInfo.vType != 1
          "
        >
          <li class="menu-item" @click.stop="showVideo(0)">
            {{ $t("msg.common.audioCall") }}
          </li>
          <li class="menu-item" @click.stop="showVideo(1)">
            {{ $t("msg.common.videoCall") }}
          </li>
        </ul>
        <ul
          class="menu-drop warking"
          v-if="
            layout.child == 'av' && (andioVideoInfo.vType == 0 || andioVideoInfo.vType == 1)
          "
        >
          <li class="menu-item" @click.stop="showVideo(1)">
            {{
              andioVideoInfo.vType == 0
                ? $t("msg.common.voice")
                : $t("msg.common.video")
            }}{{ $t("msg.chatPanel.calling") }}
          </li>
        </ul>
      </transition>
    </div> -->
    <ul class="temp-session display-flex" v-if="currentSession.fromType==0&&currentSession.temp">
      <li class="display-flex" @click.stop="showRemark = true" v-if="friend.isFriend!=1">
        <span class="temp-icon"></span>
        <span>{{ $t("msg.menu.addFriend") }}</span>
      </li>
      <li class="display-flex shield" @click.stop="doShield" v-if="!inBlack">
        <span class="temp-icon"></span>
        <span>{{ $t("msg.menu.doShield") }}</span>
      </li>
      <li class="display-flex unshield" @click.stop="unShield" v-else>
        <span class="temp-icon"></span>
        <span>{{ $t("msg.menu.unShield") }}</span>
      </li>
    </ul>
    <EditPopup 
      v-model="showRemark"
      :title="$t('msg.menu.addFriend')"
      :placeholderText="$t('msg.tip.verifyInfo1')" 
      @change="doAddFriend" 
      v-if="showRemark"
    ></EditPopup>
    <screenshot v-if="layout.child == 'ss'"></screenshot>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import Screenshot from "./Screenshot";
// import Emoji from "@/components/char-panel-components/Emoji";
export default {
  name: "input-muenu",
  data() {
    return {
      inBlack: false,
      showRemark: false,
      isAdmin: false
    };
  },
  props: {
    friend: {
      type: Object
    }
  },
  components: {
    Screenshot,
  },
  computed: {
    ...mapGetters([
      "userId",
      "currentSession",
      "andioVideoInfo",
      "activityGroupMembers",
      "layout"
    ]),
    layout(){
      let aaa = this.$store.state.layout;
      console.log(aaa)
      return aaa;
    }
  },
  watch: {
    friend() {
      if (this.friend.isBlacklist) {
        this.inBlack = true;
      } else {
        this.inBlack = false;
      }
      console.log(this.friend);
      this.isAdmin = false;

      if (this.friend.sourceDescribe) {
        let groupId = this.friend.sourceDescribe.slice(0, 5);
        if (this.activityGroupMembers) {
          let selfInfo = this.activityGroupMembers[this.userId];
          if(!selfInfo){
            selfInfo={}
          }
          if (this.friend.isFriend == 1 && selfInfo.isAdmin > 0) {
            this.isAdmin = true;
          }
        }
      }

      if (this.currentSession.temp && this.friend.state == 1) {
        this.currentSession.temp = false;
        this.currentSession.describe = "";
      }
    },
  },
  methods: {
    // emoji() {
    //   if (this.layout.child == "emoji") {
    //     this.$store.dispatch("setLayout", ["", "", false]);
    //     return;
    //   }
    //   this.$store.dispatch("setLayout", ["cp", "emoji", false]);
    // },
    screen() {
      this.$store.dispatch("setLayout", ["cp", "ss", false]);
    },
    showAVselect() {
      if (this.layout.child == "av") {
        this.$store.dispatch("setLayout", ["", "", false]);
        return;
      }

      this.$store.dispatch("setLayout", ["cp", "av", false]);
    },
    showVideo(i) {
      let vType = this.andioVideoInfo.vType;
      this.$store.dispatch("setLayout", ["", "", false]);
      if (this.currentSession.fromType != "0") {
        this.$store.commit("SET_TOAST_TEXT", this.$t("msg.tip.stay"));
        return;
      }
      let obj = {
        receiverId: this.currentSession.paramId, //被邀请者id
        groupId: null, //群id 群聊则传
        vType: i + ""
      };
      this.$store.commit("UPDATE_VIDEO_INFO", obj);
      var chat = this.$store.state.session.record[this.currentSession.paramId+'-'+this.currentSession.fromType];
      chat.userMessage = `[${
        i == 1
          ? this.$t("msg.common.videoCall")
          : this.$t("msg.common.audioCall")
      }]`;
      this.$store.commit("UPDATE_SESSION", chat);
    },
    doShield() {
      let obj = {
        treatedIds: this.currentSession.paramId,
        state: this.friend.state
      };
      this.$http.addBlackList(obj).then(() => {
        this.$store.commit("SET_TOAST_TEXT", this.$t("msg.tip.forbiddenUser"));
        this.inBlack = true;
      });
    },
    unShield() {
      let obj = {
        treatedIds: this.currentSession.paramId
      };
      this.$http.removeBlackList(obj).then(() => {
        this.$store.commit(
          "SET_TOAST_TEXT",
          this.$t("msg.tip.unForbiddenUser")
        );
        this.inBlack = false;
      });
    },
    doAddFriend(text) {
      var postData = {
        recipient: this.currentSession.paramId,
        subtitle: text,
        source: this.friend.state,
        sourceDescribe: this.friend.sourceDescribe
      };
      this.$http.addFriend(postData);
      this.inBlack = false;
      this.showRemark = false;
    }
  },
  mounted() {
  }
};
</script>

<style lang="scss" scoped>
@import "../../assets/css/var";

.input-menu {
  
  // .icon {
  //   position: relative;
  //   display: inline-block;
  //   width: 30px;
  //   height: 30px;
  //   background: url(../../assets/images/chat/chat-icon.png);
  //   cursor: pointer;
  // }
  .icon-image {
    position:absolute;
    bottom:20px;
    left: 22px;
    display: inline-block;
    width: 22px;
    height: 22px;
    cursor: pointer;
    background:url(../../assets/images/chat/up1.png);
    &:hover {
      background:url(../../assets/images/chat/up2.png);
    }
  }
  .icon-links {
    margin-right: 3px;
    background-position: -60px 0;
    &:hover {
      background-position: -60px -30px;
    }
  }
  .icon-screenshot {
    margin-right: 3px;
    background-position: -90px 0;
    &:hover,
    &.active {
      background-position: -90px -30px;
    }
  }
  .audio-video {
    position: relative;
    .icon-video {
      background-position: -120px 0;
      &:hover,
      &.active {
        background-position: -120px -30px;
      }
    }
    .menu-drop {
      position: absolute;
      top: -105px;
      left: -40px;
      width: 115px;
      padding: 14px 0;
      border-radius: 10px;
      z-index: 101;

      &::after {
        display: none;
      }
      &::before {
        content: "";
        display: block;
        position: absolute;
        bottom: -8px;
        left: 48px;
        width: 14px;
        height: 14px;
        background-color: #fff;
        border-right: 1px solid $border-color;
        border-bottom: 1px solid $border-color;
        transform: rotate(45deg);
      }
      .menu-item {
        height: 34px;
        text-align: center;
      }
      &.warking {
        top: -71px;
      }
    }
  }
  .lable {
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    cursor: pointer;
  }
}
.temp-session {
  position: absolute;
  top: 5px;
  right: 20px;
  cursor: pointer;

  .temp-icon {
    width: 30px;
    height: 30px;
    margin-right: 8px;
    background: url(../../assets/images/chat/temp-session.png);
  }
  .shield {
    margin-left: 15px;
    color: $color-red;
    .temp-icon {
      background-position: -60px 0;
    }
  }
  .unshield {
    margin-left: 15px;
    color: $color-theme;
    .temp-icon {
      background-position: -30px 0;
    }
  }
}
</style>
