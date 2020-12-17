<template>
  <div
    class="video-wrapper"
    id="wrapper"
    @mousedown="mousedown"
    @click.stop="volume.show = false"
    v-show="videoBox.show"
    :style="{ top: videoBox.top + 'px', left: videoBox.left + 'px' }"
  >
    <div
      class="video-grid-before"
      v-if="videoBox.step == 1 && video.initiateOrAccept == 2"
    >
      <div class="before-friend display-flex">
        <img class="before-friend-avatar" :src="global.fileDownUrl + 'compress/'+ friendInfo.headImg" />
        <div class="display-flex-item">
          <p class="before-friend-name">
            {{ friendInfo.nickName || friendInfo.userName }}
          </p>
          <p>
            {{ $t("msg.call.inviteYou")
            }}{{
              video.type == 0 ? $t("msg.common.voice") : $t("msg.common.video")
            }}{{ $t("msg.chatPanel.calling") }}
          </p>
        </div>
      </div>
      <div class="before-switch">
        <img
          v-if="video.type == 1"
          class="before-switch-icon"
          src="../assets/images/chat/video-icon.png"
          @click="switchType"
        />
        <img
          v-else
          class="before-switch-icon"
          src="../assets/images/chat/audio-icon.png"
        />
        <p v-if="video.type == 1">{{ $t("msg.call.switchVoiceCall") }}</p>
      </div>
      <div class="video-btn display-flex">
        <div class="video-btn-item">
          <i class="btn receiver" @click="receiver"></i>
          <p>{{ $t("msg.call.answer") }}</p>
        </div>
        <div class="video-btn-item">
          <i class="btn hangup" @click="reject"></i>
          <p>{{ $t("msg.call.refuse") }}</p>
        </div>
      </div>
    </div>
    <div
      class="video-grid"
      id="video"
      @mouseenter="showOperation"
      @mouseleave="setBtnTimer"
      v-else
    >
      <!-- 自己的视频窗口 -->
      <img
        class="video-view small"
        :src="global.fileDownUrl + 'compress/'+ userInfo.headImg"
        v-show="video.type == 1 && andioVideoList.length > 0 && !error.camera"
      />
      <div
        class="video-view"
        :class="['video-view', bigItem == 1 ? 'small' : '']"
        @click="switchView(2)"
        v-show="video.type == 1 && error.camera"
      >
        <div id="local_stream" class="video-placeholder"></div>
        <div id="local_video_info" class="video-profile hide"></div>
        <div id="video_autoplay_local" class="autoplay-fallback hide"></div>
      </div>
      <!-- 好友的视频窗口 -->
      <div
        class="friend-view"
        @click="switchView(1)"
        v-show="video.type == 1 && andioVideoList.length > 0"
      >
        <div
          v-for="item in andioVideoList"
          :key="item"
          :id="'remote_video_panel_' + item"
          :class="['video-view', bigItem == 2 ? 'small' : '']"
        >
          <div :id="'remote_video_' + item" class="video-placeholder"></div>
          <div
            :id="'remote_video_info_' + item"
            class="video-profile hide"
          ></div>
          <div
            :id="'video_autoplay_' + item"
            class="autoplay-fallback hide"
          ></div>
        </div>
      </div>
      <img
        class="friend-view-bg"
        :src="global.fileDownUrl + 'compress/'+ userInfo.headImg"
        v-show="video.type == 1 && andioVideoList.length > 0"
      />
      <!-- 通话好友信息 -->
      <div class="friend" v-if="video.type == 0 || videoBox.step == 1">
        <img class="friend-avatar" :src="global.fileDownUrl + 'compress/'+ friendInfo.headImg" />
        <p class="friend-name">
          {{ friendInfo.nickName || friendInfo.userName }}
        </p>
        <p v-if="videoBox.step == 1">{{ $t("msg.call.waitOtherAnswer") }}</p>
      </div>
      <div
        class="timer"
        v-if="
          (andioVideoList.length > 0 && showBtn) ||
            (video.type == 0 && videoBox.step == 2)
        "
      >
        {{ timerText }}
      </div>
      <!-- 通话操作按钮 -->
      <div
        class="video-btn"
        v-show="videoBox.step == 1 || showBtn || video.type == 0"
      >
        <div class="video-btn-list">
          <div class="video-btn-item" v-if="video.type == 1">
            <i class="btn switch" @click="switchType"></i>
            <p style="overflow: hidden;white-space:nowrap;text-overflow:ellipsis" >{{ $t("msg.call.switchVoiceCall") }}</p>
          </div>
          <div class="video-btn-item">
            <i class="btn" :class="{ mute: mute }" @click="muteAudio"></i>
            <p style="overflow: hidden;white-space:nowrap;text-overflow:ellipsis">{{ $t("msg.call.mute") }}</p>
          </div>
          <div class="video-btn-item">
            <i class="btn volume" @click.stop="changeVolume"></i>
            <p style="overflow: hidden;white-space:nowrap;text-overflow:ellipsis">{{ $t("msg.call.volume") }}</p>
            <div
              class="change-volume"
              id="volume"
              v-if="volume.show"
              @click.stop=";"
            >
              <div class="progress-box" @click="volumeClick($event)">
                <span
                  class="progress-btn"
                  @mousedown="volumeMousedown($event)"
                  :style="{ top: volume.top + 'px' }"
                ></span>
                <span
                  class="progress"
                  :style="{ height: 94 - volume.top + 'px' }"
                ></span>
              </div>
            </div>
          </div>
        </div>
        <div class="video-btn-list">
          <div
            class="video-btn-item"
            v-if="videoBox.step == 1 && video.initiateOrAccept == 1"
          >
            <i class="btn hangup" @click="cancel"></i>
            <p>{{ $t("msg.common.cancel") }}</p>
          </div>
          <div class="video-btn-item" v-else>
            <i class="btn hangup" @click="hangup"></i>
            <p>{{ $t("msg.call.hangUp") }}</p>
          </div>
        </div>
      </div>
    </div>
    <div class="error-msg" v-if="error.show">
      <div class="error-msg-text">
        <p v-if="!error.network">{{ $t("msg.call.noNetwork") }}</p>
        <p v-if="error.later">{{ $t("msg.call.otherBusy") }}</p>
        <div v-if="error.network && !error.later">
          <p v-if="!error.camera || !error.microphone || !error.speaker">
            {{ $t("msg.call.undetected")
            }}<span v-if="!error.camera">{{ $t("msg.call.camera") }}</span
            ><span v-if="!error.microphone">{{
              $t("msg.call.microphone")
            }}</span
            ><span v-if="!error.speaker">{{ $t("msg.call.loudspeaker") }}</span>
            {{ $t("msg.call.pleaseCheck") }}
          </p>
        </div>
        <span class="error-msg-close" @click="error.show = false"></span>
      </div>
    </div>
    <div class="close-video" style="cursor: pointer;" @click="showclose()"></div>
      
    <!-- <div class="my-popup logout close" v-show="showClose">
      <div class="my-popup-content">
        <span class="my-popup-close" @click="showClose = false"></span>
        <h3 class="my-popup-title">{{ $t("msg.tip.tip") }}</h3>
        <div class="logout-detail">
          {{ $t("msg.call.closeWin")
          }}{{
            video.type == 1
              ? $t("msg.common.videoCall")
              : $t("msg.common.audioCall")
          }}，{{ $t("msg.call.confirmClose") }}
        </div>
        <button class="cannel" @click="showClose = false">
          {{ $t("msg.common.cancel") }}
        </button>
        <button class="comfirm" @click="closeVideo">
          {{ $t("msg.common.confirm") }}
        </button>
      </div>
    </div> -->
  </div>
</template>

<script>
import Rtc from "@/tools/rtc-message";
import rtc from "@/tools/rtc-client";
import { resolutions, getDevices } from "@/tools/rtc-common";
import { Util, throttle } from "@/tools/utils";
import { mapGetters } from "vuex";

import { sessionInfo } from '@/session/sessionInfo';

export default {
  name: "AudioVideo",
  data() {
    return {
      videoBox: {
        show: false,
        top: 155,
        left: 85,
        step: 1 //窗口状态 1-等待 2-通话
      },
      video: {
        type: "1", //通讯类型：0-语音、1-视频
        sType: 0, //0-单人 1-多人 2-群直播
        receiverId: "", //被邀请者id
        initiateOrAccept: 1, //发起类型： 1-发起 2-被邀请
        groupId: null //群id 暂未开放
      },
      vData: {
        appID: "23a8440b9c15476e9082ef26d427901e",
        cameraId: "",
        cameraResolution: resolutions[2].value,
        channel: "",
        codec: "h264",
        microphoneId: "default",
        mode: "rtc",
        token: "",
        uid: ""
      },
      friendInfo: {},
      timerText: "00:00",
      showBtn: true, //操作按钮显示隐藏
      timer: null, //通话时间计时器
      dailTimer: null, //拨打倒计时计时器
      btnTimer: null, //操作按钮隐藏计时器
      keepTimer: null, //保持通话计时器
      bigItem: 1, //大小窗口切换
      volume: {
        show: false,
        top: -6
      },
      mute: false, //静音状态
      error: {
        show: false,
        disable: true,
        later: false,
        network: false,
        camera: false,
        microphone: false,
        speaker: false
      },
      // showClose: false
    };
  },
  computed: {
    ...mapGetters(["userInfo", "andioVideoInfo", "andioVideoList", "muteVideo"])
  },
  watch: {
    andioVideoList() {
      if (this.andioVideoList.length < 1) {
        clearInterval(this.timer);
        clearInterval(this.keepTimer);
        // this.$store.commit('UPDATE_VIDEO_INFO', {status: 7});
        this.videoBox.show = false;
        this.error.show = false;
        this.video.initiateOrAccept = 1;
        this.timerText = "00:00";
        this.mute = false;
      } else {
        clearInterval(this.dailTimer);
        this.endAudio("audio_dail");
        this.playAudio("audio_connected");
        if (this.video.initiateOrAccept == 1) {
          this.$store.commit(
            "SET_TOAST_TEXT",
            this.$t("msg.msgPanel.otherAnswer")
          );
          this.timer = setInterval(() => {
            num++;
            this.timerText = Util.formatTime(num);
          }, 1000);
        }
        if (
          this.error.later &&
          this.error.speaker &&
          this.error.camera &&
          this.error.speaker
        ) {
          this.error.show = false;
        } else {
          this.error.later = false;
        }
        let num = 0;
        this.btnTimer = setTimeout(() => {
          this.showBtn = false;
        }, 10 * 1000);
        this.videoBox.step = 2;
      }
    },
    andioVideoInfo() {
      if (this.andioVideoInfo.status == 0) {
        this.otherLeave();
      } else if (this.andioVideoInfo.status == 1) {
        this.$store.commit(
          "SET_TOAST_TEXT",
          this.$t("msg.msgPanel.noResponse")
        );
      } else if (this.andioVideoInfo.status == 2) {
        this.error.show = false;
        this.$store.commit(
          "SET_TOAST_TEXT",
          `${this.$t("msg.common.cancel")} ${
            this.video.type == 1
              ? this.$t("msg.common.videoCall")
              : this.$t("msg.common.audioCall")
          }`
        );
      } else if (this.andioVideoInfo.status == 3 ) {
        if (this.andioVideoInfo.resource == 1) {
          //app接听
          this.endAudio("audio_dail");
          this.playAudio("audio_end");
          this.videoBox.show = false;
          this.error.show = false;
          this.$store.commit("UPDATE_VIDEO_INFO", { status: 7 });
          this.$message({
            title: this.$t("msg.tip.tip"),
            message: this.$t("msg.msgPanel.answered"),
            showCancelButton: false,
            confirmButtonText: this.$t("msg.common.confirm")
          });
        }
      } else if (this.andioVideoInfo.status == 4) {
        this.$store.commit(
          "SET_TOAST_TEXT",
          this.$t("msg.msgPanel.hangUp") + this.$t("msg.call.call")
        );
      } else if (this.andioVideoInfo.status == 5) {
        this.$store.commit("UPDATE_VIDEO_INFO", { status: 7 });
        this.$store.commit(
          "SET_TOAST_TEXT",
          this.$t("msg.msgPanel.refuse") + this.$t("msg.call.call")
        );
      } else if (this.andioVideoInfo.status == 6) {
        this.friendInfo = this.$store.state.friendList[
          this.andioVideoInfo.fromId
        ];
        this.$message({
          title: this.$t("msg.tip.tip"),
          message: `${this.friendInfo.nickName ||
            this.friendInfo.userName}${this.$t("msg.call.privateInvite")}`,
          showCancelButton: false,
          confirmButtonText: this.$t("msg.app.info")
        });
      } else if (this.andioVideoInfo.status == 7) {
        //
      } else if (this.andioVideoInfo.status == 8) {
        this.getSocket("3");
        this.$store.commit("UPDATE_VIDEO_INFO", { status: 7 });
        this.resetData();
        rtc.leave();
      } else {
        this.videoBox.show = true;
        this.show(this.andioVideoInfo);
      }
    },
    muteVideo() {
      this.showBtn = true;
      if (this.muteVideo && this.video.type == 1) {
        this.$store.commit(
          "SET_TOAST_TEXT",
          this.$t("msg.call.otherPart") + this.$t("msg.call.switchVoiceCall")
        );
        this.video.type = 0;
      }
    }
  },
  methods: {
    show(obj) {
      this.video = {
        type: obj.vType,
        sType: obj.type || 0,
        receiverId: obj.fromId || obj.receiverId,
        initiateOrAccept: 1,
        groupId: obj.groupId || null
      };
      sessionInfo.getChatInfo(0,this.video.receiverId).then(data=>{
        this.friendInfo =data;
      });
      // this.friendInfo = this.$store.state.friendList[this.video.receiverId];
      //声音提示
      this.playAudio("audio_dail");
      //被邀请类型 显示接听等
      if (obj.state == 1) {
        this.video.initiateOrAccept = 2;
        this.videoBox.top = document.body.clientHeight - 390;
        this.videoBox.left = document.body.clientWidth - 370;
        return;
      }
      //检查通话条件
      this.checkDevices().then(
        () => {
          this.error.disable = false;
        },
        () => {
          this.error.show = true;
        }
      );
      if (!this.error.network) {
        return;
      }
      //倒计时60s
      let i = 0;
      this.dailTimer = setInterval(() => {
        i++;
        if (i >= 20) {
          this.error.show = true;
          this.error.later = true;
        }
        if (i >= 60) {
          rtc.leave();
          this.getSocket("6");
          this.$store.commit("UPDATE_VIDEO_INFO", { status: 1 });
          this.endAudio("audio_dail");
          this.error.show = false;
          this.error.later = false;
          clearInterval(this.dailTimer);
        }
      }, 1000);
      this.join();
    },
    switchType() {
      //切换通话类型
      this.video.type = 0;
      if (this.videoBox.step == 2 || this.video.initiateOrAccept == 1) {
        this.cutVideo();
        rtc.muteVideo();
      } else {
        this.videoBox.step = 2;
        this.checkDevices().then(
          () => {
            this.error.disable = false;
          },
          () => {
            this.error.show = true;
          }
        );
        this.join();
      }
    },
    join() {
      //调用通话SDK
      this.vData.uid = this.userInfo.userId;
      new Promise(resolve => {
        this.getArg(resolve);
      }).then(
        () => {
          this.videoBox.top = (document.body.clientHeight - 660) / 2;
          this.videoBox.left = document.body.clientWidth - 430;

          this.$http.checkCommunication({});
          this.keepTimer = setInterval(() => {
            this.$http.checkCommunication({});
          }, 30 * 1000);

          if (this.video.initiateOrAccept == 2) {
            let num = 0;
            this.timer = setInterval(() => {
              num++;
              this.timerText = Util.formatTime(num);
            }, 1000);
          }
          rtc.join(this.vData).then(() => {
            rtc.publish();
            if (this.video.type == 0) {
              this.cutVideo();
              rtc.muteVideo();
            }
          });
        },
        () => {}
      );
    },
    receiver() {
      let time = new Date().getTime();
      let rxml = `<message xmlns="jabber:client" type="chat" to="moreonly.bcircle.net" id="${time}" from="${this.userInfo.userId}@bcircle.net/webIm"><body>{"bodyLevel":0,"bodyContent":"36","bodyType":37,"bodyFrom":"${this.userInfo.userId}"}</body></message>`;
      Rtc.sendMessage(rxml);

      this.videoBox.step = 2;
      this.checkDevices().then(
        () => {
          this.error.disable = false;
        },
        () => {
          this.error.show = true;
        }
      );
      this.join();
    },
    hangup() {
      this.getSocket("3");
      this.$store.commit("UPDATE_VIDEO_INFO", { status: 4 });
      this.$store.commit("DELETE_VIDEO_VIEW", this.video.receiverId);
      this.resetData();
      rtc.leave();
    },
    reject() {
      let time = new Date().getTime();
      let rxml = `<message xmlns="jabber:client" type="chat" to="moreonly.bcircle.net" id="${time}" from="${this.userInfo.userId}@bcircle.net/webIm"><body>{"bodyLevel":0,"bodyContent":"36","bodyType":37,"bodyFrom":"${this.userInfo.userId}"}</body></message>`;
      Rtc.sendMessage(rxml);
            
      this.getSocket("4");
      this.error.show = false;
      this.$store.commit("UPDATE_VIDEO_INFO", { status: 5 });
      this.endAudio("audio_dail");
      this.playAudio("audio_end");
    },
    cancel() {
      if (!this.error.network) {
        this.videoBox.show = false;
        return;
      }
      rtc.leave();
      this.getSocket("5");
      this.resetData();
      this.$store.commit("UPDATE_VIDEO_INFO", { status: 2 });
    },
    otherLeave() {
      // 对方挂断、取消、拒绝通话处理
      if (this.andioVideoInfo.type == "3") {
        this.$store.commit(
          "SET_TOAST_TEXT",
          this.$t("msg.call.cancelPrivateCall")
        );
        return;
      }
      clearInterval(this.dailTimer);
      if (this.video.initiateOrAccept == 2) {
        this.$store.commit(
          "SET_TOAST_TEXT",
          `${this.$t("msg.call.otherPart")}${
            this.videoBox.step == 1
              ? this.$t("msg.call.otherPart")
              : this.$t("msg.call.hangUp")
          }${this.$t("msg.call.call")}`
        );
      } else {
        this.$store.commit(
          "SET_TOAST_TEXT",
          `${this.$t("msg.call.otherPart")}${
            this.videoBox.step == 1
              ? this.$t("msg.call.refuse")
              : this.$t("msg.call.hangUp")
          }${this.$t("msg.call.call")}`
        );
      }
      this.$store.commit("UPDATE_VIDEO_INFO", { status: 7 });
      this.resetData();
      this.endAudio("audio_dail");
      this.playAudio("audio_end");
      rtc.leave();
    },
    getArg(resolve) {
      //获取token、房间名参数
      let obj = {
        type: this.video.type,
        sType: this.video.sType,
        receiverId: this.video.receiverId,
        initiateOrAccept: this.video.initiateOrAccept,
        groupId: this.video.groupId
      };
      this.$http.startCommunication(obj).then(
        data => {
          this.vData.token = data.communicationToken;
          this.vData.channel = data.channelName;
          resolve();
        },
        () => {
          this.$store.commit("UPDATE_VIDEO_INFO", { status: 7 });
          this.resetData();
        }
      );
    },
    getSocket(s) {
      //让socket推送消息
      let obj = {
        type: this.video.type,
        sType: this.video.sType,
        state: s
      };
      this.$http.changeCommunication(obj).then(
        () => {
          this.videoBox.show = false;
        },
        () => {}
      );
    },
    cutVideo() {
      //切换到语音
      let obj = {
        channelName: this.vData.channel,
        type: 0
      };
      this.$http.changeToAudio(obj);
    },
    switchView(i) {
      //切换视频窗口
      this.bigItem = i;
    },
    muteAudio() {
      //开启、关闭静音
      if (this.error.disable) return;
      this.mute = !this.mute;
      rtc.muteAudio(this.mute);
    },
    changeVolume() {
      if (this.videoBox.step == 1) return;
      this.volume.show = true;
    },
    mousedown(event) {
      //鼠标拖动组件
      const selectElement = document.getElementById("wrapper");
      selectElement.style.cursor = "move";
      let distanceX = event.clientX - selectElement.offsetLeft;
      let distanceY = event.clientY - selectElement.offsetTop;

      let move = e => {
        var oevent = e || event;
        this.videoBox.left = oevent.clientX - distanceX;
        this.videoBox.top = oevent.clientY - distanceY;
      };
      let throttleMove = throttle(move, 150);

      document.onmousemove = ev => {
        throttleMove(ev);
      };
      document.onmouseup = () => {
        document.onmousemove = null;
        document.onmouseup = null;
        selectElement.style.cursor = "default";
      };
    },
    volumeMousedown(event) {
      event.preventDefault();
      event.stopPropagation();
      const selectElement = document.getElementById("volume");
      selectElement.style.cursor = "move";
      let move = e => {
        var oevent = e || event;
        let progress = oevent.clientY - this.videoBox.top - 359;
        if (-6 > progress || progress > 94) return;
        this.volume.top = progress;
        rtc.changeAudio(progress + 6);
      };
      let throttleMove = throttle(move, 150);
      document.onmousemove = ev => {
        throttleMove(ev);
      };
      document.onmouseup = () => {
        document.onmousemove = null;
        document.onmouseup = null;
        selectElement.style.cursor = "default";
      };
    },
    volumeClick($event) {
      event.preventDefault();
      event.stopPropagation();
      const selectElement = document.getElementById("volume")[0];
      const medio = document.getElementById("video" + this.video.receiverId);
      let progress = event.clientY - this.videoBox.top - 359;
      this.volume.top = progress;
      if (progress < 0) {
        medio.volume = 0;
      } else if (0 < progress < 100) {
        medio.volume = (progress + 6) / 100;
      } else {
        medio.volume = 1;
      }
    },
    showOperation(e) {
      clearTimeout(this.btnTimer);
      this.showBtn = true;
    },
    setBtnTimer() {
      if (this.videoBox.step == 2) {
        this.btnTimer = setTimeout(() => {
          this.showBtn = false;
        }, 10 * 1000);
      }
    },
    resetData() {
      this.video = {
        type: 1,
        sType: 0,
        receiverId: "",
        initiateOrAccept: 1,
        groupId: null
      };
      this.videoBox.show = false;
      this.videoBox.step = 1;
      this.error.show = false;
      this.error.later = false;
      this.mute = false;
      this.bigItem = 1;
      this.timerText = "00:00";
      this.endAudio("audio_dail");
      this.playAudio("audio_end");
      clearTimeout(this.btnTimer);
      clearInterval(this.keepTimer);
      clearInterval(this.timer);
      clearInterval(this.dailTimer);
    },
    checkDevices() {
      //通话检查网络和设备
      return new Promise((resolve, reject) => {
        if (!window.navigator.onLine) {
          reject();
        } else {
          this.error.network = true;
        }
        getDevices(devices => {
          if (devices.videos.length > 0) {
            this.error.camera = true;
            this.vData.cameraId = devices.videos[0].value;
          }
          if (devices.audios.length > 0) {
            for (let i = 0; i < devices.audios.length; i++) {
              if (devices.audios[i].kind === "audioinput")
                this.error.microphone = true;
              else if (devices.audios[i].kind === "audiooutput")
                this.error.speaker = true;
            }
          }
          if (!this.error.speaker) reject();
          if (!this.error.camera || !this.error.microphone) reject();
          resolve();
        });
      });
    },
    playAudio(id) {
      var audio = document.getElementById(id);
      audio.play();
    },
    endAudio(id) {
      var audio = document.getElementById(id);
      audio.load();
    },
    closeVideo() {
      this.$store.commit("SET_VIDEOCLOSE", false);
      if (this.videoBox.step == 1) {
        if (this.video.initiateOrAccept == 2) this.reject();
        else this.cancel();
      } else {
        this.hangup();
      }
    },
    showclose(){
      this.$store.commit("SET_VIDEOCLOSE", true);
    },
  },
  mounted() {
    this.videoBox.top = (document.body.clientHeight - 660) / 2;
    this.videoBox.left = document.body.clientWidth - 430;
  }
};
</script>
