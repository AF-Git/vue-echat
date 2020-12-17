<template>
  <transition name="scale-x">
    <Popup :title="$t('msg.inviteFriend.title')">
      <div class="invite-friend" slot="body">
        <div class="invite-wrap" @click="showBigCard = false">
          <transition name="pop">
            <div class="invite-box" v-show="!showBigCard">
              <div class="display-flex content">
                <div class="card" @click.stop="transfer">
                  <div class="display-flex">
                    <div class="user-avatar">
                      <img class="img" :src="global.fileDownUrl + 'compress/'+userInfo.headImg" />
                    </div>
                    <div class="display-flex-item user-name">
                      {{ userInfo.nickName || userInfo.userName }}
                    </div>
                  </div>
                  <div class="user-code">
                    <canvas id="invite"></canvas>
                  </div>
                  <p class="user-detail">{{ $t("msg.inviteFriend.clickView") }}</p>
                </div>
                <div class="card right">
                  <div class="display-flex">
                    <div class="display-flex-item">
                      <p class="text">
                        {{ userInfo.nickName || userInfo.userName }}
                      </p>
                      <p class="text">{{ $t("msg.inviteFriend.inviteYou") }}</p>
                    </div>
                    <div class="user-avatar">
                      <img class="img" :src="global.fileDownUrl + 'compress/'+userInfo.headImg" />
                    </div>
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
                  <img class="img" :src="global.fileDownUrl + 'compress/'+userInfo.headImg" />
                </div>
                <div class="display-flex-item">
                  <p class="user-name">
                    {{ userInfo.nickName || userInfo.userName }}
                  </p>
                  <p>EchatAPP ID: {{ userInfo.userId }}</p>
                </div>
              </div>
              <div class="user-code">
                <canvas id="inviteCard"></canvas>
              </div>
              <p class="intro">{{ $t("msg.inviteFriend.info") }}</p>
            </div>
          </transition>
        </div>
      </div>
    </Popup>
  </transition>
</template>

<script>
import { mapGetters } from "vuex";
import QRCode from "qrcode";
import { Util } from "@/tools/utils";
import { Crypto } from "@/tools/crypto" 
import canvasExt from "@/tools/screenshot";

export default {
  name: "Video",
  data() {
    return {
      showBigCard: false,
      urlData: ""
    };
  },
  computed: {
    ...mapGetters(["userInfo"])
  },
  components: {
    QRCode
  },
  methods: {
    show() {
      this.showBox = true;
      let obj = {
        identifying: "f"
      }
      this.$http.getShareUrl(obj).then(data => {
        this.urlData = data.shortUrl;
        setTimeout(() => {
          this.useqrcode(data.shortUrl, "invite");
        }, 100);
      });
    },
    hide() {
      this.$store.dispatch("setLayout", ["", "", false]);
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
      // var event = new MouseEvent("click");
      // var timestamp = new Date().getTime();
      // var name = imgData.src.substring(22, 30) + timestamp + ".png";
      var name = "invite friends QR.png";
      a.download = name;
      a.href = imgData.src;
      a.click();
      // a.dispatchEvent(event);
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
  }
};
</script>

<style lang="scss" scoped>
@import "../../assets/css/var";

.invite-friend  {
  z-index: 198;
  width: 512px;
  height: 455px;
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
      .user-code {
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
          width: 50px;
          height: 50px;
          margin-right: 10px;
        }
        .user-name {
          font-size: 16px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
      }
      .user-code {
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
        text-align: center;
        padding: 15px;
      }
    }
  }
}
</style>
