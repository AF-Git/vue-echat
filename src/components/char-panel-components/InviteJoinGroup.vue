<template>
  <transition name="scale-x">
    <div class="my-popup" @click.stop="">
      <div class="my-popup-content invite-friend">
        <h3 class="my-popup-title">{{ $t("msg.inviteFriend.title") }}</h3>
        <span class="my-popup-close" @click.stop="hide"></span>
        <div class="invite-wrap" @click="showBigCard = false">
          <transition name="pop">
            <div class="invite-box" v-show="!showBigCard">
              <div class="display-flex content">
                <div class="card" @click.stop="transfer">
                  <div class="display-flex">
                    <div class="user-avatar" v-if="currentSession.img">
                      <img class="img" :src="global.fileDownUrl + 'compress/'+currentSession.img" />
                    </div>
                    <span
                      class="default"
                      v-defaultHead
                      v-if="!currentSession.img"
                      v-text="currentSession.name">
                      </span>
                    <div class="display-flex-item user-name">
                      {{ currentSession.name }}
                    </div>
                  </div>
                  <div class="card-code">
                    <canvas id="invite"></canvas>
                  </div>
                  <p class="user-detail">{{ $t("msg.inviteFriend.clickView") }}</p>
                </div>
                <div class="card right">
                  <div class="display-flex">
                    <div class="display-flex-item">
                      <p class="text">{{ currentSession.name }}</p>
                      <p class="text">
                        {{ $t("msg.inviteFriend.inviteGroup") }}
                      </p>
                    </div>
                    <div class="user-avatar" v-if="currentSession.img">
                      <img class="img" :src="global.fileDownUrl + 'compress/'+currentSession.img" />
                    </div>
                    <span
                      class="default"
                      v-defaultHead
                      v-if="!currentSession.img"
                      v-text="currentSession.name">
                      </span>
                  </div>
                </div>
              </div>
              <div class="display-flex content">
                <button
                  type="button"
                  class="invite-btn"
                  @click.stop="downloadCard"
                >
                  {{ $t("msg.inviteFriend.download") }}
                </button>
                <button type="button" class="invite-btn" @click="copyLink">
                  {{ $t("msg.inviteFriend.copyLink") }}
                </button>
              </div>
            </div>
          </transition>
          <transition name="pop">
            <div class="big-card" id="codeCard" v-show="showBigCard">
              <div class="display-flex header">
                <div class="user-avatar">
                  <img class="img" :src="global.fileDownUrl + 'compress/'+currentSession.img" />
                  <span
                    class="default"
                    v-defaultHead
                    v-if="!currentSession.img"
                    v-text="currentSession.name">
                    </span>
                </div>
                <div class="display-flex-item">
                  <p class="user-name">{{ currentSession.name }}</p>
                  <p>EchatAPP ID: {{ currentSession.paramId }}</p>
                </div>
              </div>
              <div class="card-code">
                <canvas id="inviteCard"></canvas>
              </div>
              <p class="intro">{{ $t("msg.inviteFriend.info2") }}</p>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { mapGetters } from "vuex";
import QRCode from "qrcode";
import { Util } from "@/tools/utils";
import canvasExt from "@/tools/screenshot";

export default {
  name: "InviteJoinGroup",
  data() {
    return {
      showBigCard: false,
      urlData: ""
    };
  },
  props: {
    groupInfo: {
      type: Object
    }
  },
  computed: {
    ...mapGetters(["userId", "currentSession"])
  },
  components: {
    QRCode
  },
  methods: {
    show() {
      this.showBigCard = false;

      let obj = {
        groupId: this.currentSession.paramId,
        identifying: "g"
      }
      this.$http.getShareUrl(obj).then(data => {
        this.urlData = data.shortUrl;
        this.useqrcode(data.shortUrl, "invite");
      });
    },
    hide() {
      this.$emit("input", false);
    },
    useqrcode(path, id) {
      let canvas = document.getElementById(id);
      QRCode.toCanvas(canvas, path, error => {
        if (error) console.error(error);
      });
    },
    transfer() {
      this.showBigCard = true;
      this.useqrcode(this.urlData, "inviteCard");
    },
    downloadCard() {
      this.transfer();
      setTimeout(() => {
        let targetDom = document.getElementById("codeCard");
        canvasExt.cropper(targetDom, 320, 405, 0, 0, this.download);
      }, 400);
    },
    download(imgData) {
      var a = document.createElement("a");
      var event = new MouseEvent("click");
      var timestamp = new Date().getTime();
      var name = imgData.src.substring(22, 30) + timestamp + ".png";
      a.download = name;
      a.href = imgData.src;
      a.dispatchEvent(event);
    },
    copyLink() {
      let oInput = document.createElement("input");
      oInput.value = this.urlData;
      document.body.appendChild(oInput);
      oInput.select(); // 选择对象
      document.execCommand("Copy"); // 执行浏览器复制命令
      oInput.className = "oInput";
      oInput.style.display = "none";
      document.body.removeChild(oInput);
      this.$store.commit("SET_TOAST_TEXT", this.$t("msg.menu.copySuccess"));
    }
  },
  mounted() {
    this.show();
    try {
        new MouseEvent('test');
        return false; // No need to polyfill
    } catch (e) {
        // Need to polyfill - fall through
    }
    var MouseEvent = function (eventType, params) {
        params = params || { bubbles: false, cancelable: false };
        var mouseEvent = document.createEvent('MouseEvent');
        mouseEvent.initMouseEvent(eventType, params.bubbles, params.cancelable, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        return mouseEvent;
    }
    MouseEvent.prototype = Event.prototype;
    window.MouseEvent = MouseEvent;
  }
};
</script>

<style lang="scss" scoped>
@import "../../assets/css/var";
.default{
  margin-right:10px ;
  height:32px;width:32px;
  border-radius: 50%;
  text-align: center;
  line-height: 32px;
  font-weight: 550;
  color: #fff;
}
// 视频播放弹窗
.invite-friend {
  z-index: 198;
  width: 512px;
  height: 495px;
  .invite-wrap {
    width: 100%;
    height: 465px;
    display: inline-block;
    background: #000;
    .invite-box {
      width: 492px;
      height: 400px;
      margin: 25px 10px;
      padding: 0 30px;
      border-radius: 10px;
      background: #fff;
    }
    .content {
      justify-content: space-between;
    }
    .card {
      width: 192px;
      margin-top: 30px;
      padding: 12px;
      border-radius: 10px;
      box-shadow: 0 0 8px #ccc;
      font-size: 14px;
      line-height: 30px;
      cursor: pointer;

      .user-avatar {
        position:relative;
        width: 32px;
        height: 32px;
        margin-right: 10px;
      }
      .user-name {
        text-align: left;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
      .card-code {
        width: 168px;
        height: 168px;
        #invite {
          width: 168px !important;
          height: 168px !important;
        }
      }
      .user-detail{
        text-align:center;
        font-size:12px;
        word-break: break-word;
      }
      &.right {
        text-align: left;
        font-size:12px;
        word-break: break-word;
        .user-avatar {
          margin-right: 0;
          margin-left: 10px;
        }
      }
    }
    .invite-btn {
      width: 192px;
      height: 34px;
      margin-top: 30px;
      border-radius: 5px;
      color: #fff;
      background: $color-theme;
    }
    .big-card {
      position: relative;
      width: 320px;
      margin: 30px auto 0;
      padding: 55px 0 30px 0;
      border-radius: 10px;
      font-size: 12px;
      line-height: 24px;
      background-color: #fff;

      .header {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        padding: 20px;
        text-align: left;

        .user-avatar {
          position: relative;
          width: 50px;
          height: 50px;
          margin-right: 10px;
          .default{
            display:inline-block;
            position:absolute;
            left:0;
            height:50px;width:50px;
            border-radius: 50%;
            font-size:16px;
            text-align: center;
            line-height: 50px;
            font-weight: 550;
            color: #fff;
          }
        }
        .user-name {
          font-size: 16px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
      }
      .card-code {
        width: 320px;
        height: 320px;
        #inviteCard {
          width: 320px !important;
          height: 320px !important;
        }
      }
      .intro {
        position: absolute;
        left: 0;
        bottom: 0;
        width: 100%;
        text-align:center;
        padding: 15px;
      }
    }
  }
}
</style>
