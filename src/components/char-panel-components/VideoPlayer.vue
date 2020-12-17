<template>
  <transition name="scale-x">
    <div class="my-popup video-box" @click="hide()" v-if="showVideo">
      <div class="my-popup-content" @click.stop="">
        <span class="my-popup-close" @click="showVideo = false"></span>
        <div
          class="video"
          :style="{
            width:
              videoInfo.imgWidth > 440 || videoInfo.imgHeigh > 498
                ? videoInfo.imgWidth / videoInfo.imgHeigh > 440 / 498
                  ? 440 + 'px'
                  : (videoInfo.imgWidth / videoInfo.imgHeigh) * 498 + 'px'
                : videoInfo.imgWidth + 'px',
            height:
              videoInfo.imgWidth > 440 || videoInfo.imgHeigh > 498
                ? videoInfo.imgWidth / videoInfo.imgHeigh < 440 / 498
                  ? 498 + 'px'
                  : (videoInfo.imgHeigh / videoInfo.imgWidth) * 440 + 'px'
                : videoInfo.imgHeigh + 'px'
          }"
        >
          <video
            id="myVideo"
            :src="videoInfo.videoUrl"
            controls="controls"
          ></video>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: "Video",
  data() {
    return {
      showVideo: false,
      videoDown: false,
      videoInfo: ""
    };
  },
  methods: {
    hide() {
      this.showVideo = false;
      document.getElementById("myVideo").pause();
    },
    show(item, mute) {
      this.showVideo = true;
      this.videoInfo = item.msgContent;
      setTimeout(() => {
        document.getElementById("myVideo").play();
        if (mute) {
          document.getElementById("myVideo").muted = true;
        }
      }, 10);
    }
  },
  mounted() {}
};
</script>

<style lang="scss" scoped>
// 视频播放弹窗
.video-box {
  .my-popup-content {
    z-index: 198;
    width: 440px;
    height: 528px;
    background: #fff;
    .my-popup-close {
      top: 10px;
    }
    .video {
      position: absolute;
      left: 50%;
      z-index: 199;
      margin-top: 30px;
      min-width: 440px;
      min-height: 498px;
      background: #000;
      -webkit-transform: translate(-50%, 0);
      transform: translate(-50%, 0);
      #myVideo {
        width: 100%;
        height: 100%;
      }
    }
  }
}
</style>
