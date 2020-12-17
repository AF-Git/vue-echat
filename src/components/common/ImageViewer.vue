<template>
  <transition name="scale-x">
    <div class="my-popup" @click.stop="">
      <div class="image-viewer">
        <span class="viewer-close" @click="hide"></span>
        <div class="image-box" v-if="imgInfo.type == 3">
          <img 
            class="img"
            :src="imgUrl"
            :style="{
              width: imgInfo.width + 'px',
              height: imgInfo.height + 'px',
              transform:
                'translateX(' +
                currentImg.left +
                'px) translateY(' +
                currentImg.top +
                'px) rotate(' +
                rotate * 90 +
                'deg)'
            }"
            @mousedown="moveImage($event)"
            v-imageError
          />
        </div>
        <div class="video-box" v-if="imgInfo.type == 5">
          <video
            id="myVideo"
            :src="base + '/' + videoUrl"
            :style="{
              width: imgInfo.width + 'px',
              height: imgInfo.height + 'px',
              transform:
                'translateX(' +
                currentImg.left +
                'px) translateY(' +
                currentImg.top +
                'px) rotate(' +
                rotate * 90 +
                'deg)'
            }"
            @mousedown="moveImage($event)"
            controls="controls"
          ></video>
        </div>
        <div class="big-arrow" v-if="imgList.length > 1">
          <div class="display-flex">
            <span class="arrow-icon pre" @click="preImage"></span>
            <span class="arrow-icon next" @click="nextImage"></span>
          </div>
        </div>
        <div class="viewer-menu" ref="menu">
          <div class="display-flex">
            <span class="menu-icon enlarge" :class="{ disable: imgInfo.type == 5 }" @click="enlarge"></span>
            <span class="line"></span>
            <span class="menu-icon shrink" :class="{ disable: imgInfo.type == 5 }" @click="shrink"></span>
            <span class="line"></span>
            <span class="menu-icon rotate" :class="{ disable: imgInfo.type == 5 }" @click="rotateImage"></span>
            <span class="line"></span>
            <span
              class="menu-icon real"
              :class="{ disable: imgInfo.type == 5 }"
              @click="showRealImage"
              v-if="!isReduction"
            ></span>
            <span class="menu-icon reduction" :class="{ disable: imgInfo.type == 5 }" @click="reduction" v-else></span>
            <span class="line"></span>
            <span class="menu-icon download" @click="download"></span>
          </div>
        </div>
      </div>
      <div class="my-toast" v-if="text">
        <div class="my-toast-content">{{ text }}</div>
      </div>
    </div>
  </transition>
</template>

<script>
import { Util, throttle } from "@/tools/utils";

export default {
  name: "ImageViewer",
  data() {
    return {
      base: "",
      imgUrl: "",
      videoUrl: "",
      imgList: [],
      imgIdx: 0,
      imgInfo: {
        type: 3,
        width: 0,
        height: 0
      },
      multiple: 100,
      currentImg: {
        width: 0,
        height: 0,
        top: 0,
        left: 0
      },
      rotate: 0,
      text: "",
      isReduction: false,
      temp: {},
      showMenu: true,
      timer: null,
      menuTimer: null,
      tip: {}
    };
  },
  methods: {
    hide() {
      clearTimeout(this.timer);
      clearTimeout(this.menuTimer);
      this.$destroy(true);
      this.$el.parentNode.removeChild(this.$el);
      window.removeEventListener("keyup", this.keyEvent);
    },
    keyEvent(event) {
      if (event.keyCode == 27) {
        this.hide();
      } else if (event.keyCode == 37) {
        this.preImage();
      } else if (event.keyCode == 39) {
        this.nextImage();
      }
    },
    enlarge() {
      if (
        this.imgInfo.width > this.currentImg.width * 3 ||
        this.imgInfo.height > this.currentImg.height * 3
      ) {
        this.showToast(this.tip.biggest);
        return;
      }
      this.imgInfo.width =
        (this.imgInfo.width / this.multiple) * (this.multiple + 10);
      this.imgInfo.height =
        (this.imgInfo.height / this.multiple) * (this.multiple + 10);
      this.currentImg.left = -this.imgInfo.width / 2;
      this.currentImg.top = -this.imgInfo.height / 2;
      this.multiple = this.multiple + 10;

      this.isReduction = false;
    },
    shrink() {
      if (
        this.imgInfo.width < this.currentImg.width / 9 ||
        this.imgInfo.height < this.currentImg.height / 9
      ) {
        this.showToast(this.tip.smallest);
        return;
      }
      if (this.isReduction) {
        this.multiple = 100;
      }
      this.imgInfo.width =
        (this.imgInfo.width / this.multiple) * (this.multiple - 10);
      this.imgInfo.height =
        (this.imgInfo.height / this.multiple) * (this.multiple - 10);
      this.currentImg.left = -this.imgInfo.width / 2;
      this.currentImg.top = -this.imgInfo.height / 2;
      this.multiple = this.multiple - 10;
      this.isReduction = false;
    },
    preImage() {
      if (this.imgIdx == 0) {
        this.showToast(this.tip.first);
        return;
      }

      if (this.imgList[this.imgIdx].type == 5) {
        document.getElementById("myVideo").pause();
      }
      
      this.rotate = 0;
      this.isReduction = false;
      this.multiple = 100;
      this.imgIdx--;

      if (this.imgList[this.imgIdx].type == 3) {
        this.imgUrl = this.base + '/' + this.imgList[this.imgIdx].msgContent.imgUrl;
      } else {
        this.videoUrl = this.imgList[this.imgIdx].msgContent.videoUrl;
      }

      this.formatData();
    },
    nextImage() {
      if (this.imgIdx == this.imgList.length - 1) {
        this.showToast(this.tip.last);
        return;
      }

      if (this.imgList[this.imgIdx].type == 5) {
        document.getElementById("myVideo").pause();
      }

      this.rotate = 0;
      this.isReduction = false;
      this.multiple = 100;
      this.imgIdx++;

      if (this.imgList[this.imgIdx].type == 3) {
        this.imgUrl = this.base + '/' + this.imgList[this.imgIdx].msgContent.imgUrl;
      } else {
        this.videoUrl = this.imgList[this.imgIdx].msgContent.videoUrl;
      }

      this.formatData();
    },
    moveImage(ev) {
      ev.preventDefault();
      let x = ev.clientX;
      let y = ev.clientY;
      let offsetX = this.currentImg.left;
      let offsetY = this.currentImg.top;

      //鼠标移动事件，画图 ,防抖
      let dropEvent = event => {
        this.currentImg.left = offsetX + (event.clientX - x);
        this.currentImg.top = offsetY + (event.clientY - y);
      };
      let throttleMove = throttle(dropEvent, 30);
      document.onmousemove = e => {
        throttleMove(e);
      };
      document.onmouseup = e => {
        document.onmousemove = null;
      };
    },
    rotateImage() {
      this.isReduction = false;
      this.rotate++;
    },
    showRealImage() {
      this.isReduction = true;
      this.temp = JSON.parse(JSON.stringify(this.imgInfo));

      this.imgInfo.width = this.currentImg.width;
      this.imgInfo.height = this.currentImg.height;
      this.currentImg.left = -this.imgInfo.width / 2;
      this.currentImg.top = -this.imgInfo.height / 2;
    },
    reduction() {
      this.isReduction = false;
      this.imgInfo = this.temp;

      this.currentImg.left = -this.imgInfo.width / 2;
      this.currentImg.top = -this.imgInfo.height / 2;
    },
    download() {
      var a = document.createElement("a");
      var event = new MouseEvent("click");
      var name = Util.getFileName(this.imgUrl);
      a.download = name;

      if (this.imgInfo.type == 3) {
        a.href = this.imgUrl;
      } else {
        a.href = this.base + '/' + this.videoUrl;
      }
      
      a.dispatchEvent(event);
    },
    showToast(str) {
      this.text = str;
      this.timer = setTimeout(() => {
        this.text = "";
      }, 1500);
    },
    formatData() {
      clearTimeout(this.menuTimer);

      if (this.imgList.length < 1) {
        var img = new Image();
        img.src = this.imgUrl;

        img.onload = () => {
          this.imgInfo.width =
            img.width > 800 || img.height > 580
              ? img.width / img.height > 800 / 580
                ? 800
                : (img.width / img.height) * 580
              : img.width;
          this.imgInfo.height =
            img.width > 800 || img.height > 580
              ? img.width / img.height > 800 / 580
                ? (img.height / img.width) * 800
                : 580
              : img.height;

          this.currentImg.width = this.imgInfo.width;
          this.currentImg.height = this.imgInfo.height;
          this.currentImg.left = -this.imgInfo.width / 2;
          this.currentImg.top = -this.imgInfo.height / 2;
        }
      } else {
        this.imgInfo.type = this.imgList[this.imgIdx].type;

        let obj = this.imgList[this.imgIdx].msgContent;
        this.imgInfo.width =
          obj.imgWidth > 800 || obj.imgHeigh > 580
            ? obj.imgWidth / obj.imgHeigh > 800 / 580
              ? 800
              : (obj.imgWidth / obj.imgHeigh) * 580
            : obj.imgWidth;
        this.imgInfo.height =
          obj.imgWidth > 800 || obj.imgHeigh > 580
            ? obj.imgWidth / obj.imgHeigh > 800 / 580
              ? (obj.imgHeigh / obj.imgWidth) * 800
              : 580
            : obj.imgHeigh;

        this.currentImg.width = obj.imgWidth;
        this.currentImg.height = obj.imgHeigh;
        this.currentImg.left = -this.imgInfo.width / 2;
        this.currentImg.top = -this.imgInfo.height / 2;
      }

      if (this.imgList.length > 0 && this.imgList[this.imgIdx].type == 5) {
        setTimeout(() => {
          document.getElementById("myVideo").play();
        }, 200);
      }

      this.menuTimer = setTimeout(() => {
        this.$refs.menu.style = "opacity: 0;";
      }, 1500);
    }
  },
  mounted() {
    this.formatData();
    window.addEventListener("keyup", this.keyEvent);
  }
};
</script>

<style lang="scss" scoped>
.image-viewer {
  z-index: 998;
  width: 100%;
  height: 100%;
  min-width: 940px;
  min-height: 679px;

  .viewer-close {
    position: absolute;
    top: -36px;
    right: -36px;
    z-index: 199;
    width: 78px;
    height: 78px;
    border-radius: 40px;
    background: #31373d url(../../assets/images/clear-icon.png) no-repeat;
    background-position: 20px 46px;
    cursor: pointer;
  }
  .image-box, .video-box {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .image-box .img , .video-box #myVideo  {
    position: absolute;
    left: 50%;
    top: 50%;
    cursor: move;
  }

  .big-arrow {
    position: absolute;
    top: 50%;
    width: 100%;
    height: 55px;
    padding: 0 120px;
    transform: translate(0, -50%);

    .display-flex {
      justify-content: space-between;
    }
    .arrow-icon {
      display: block;
      width: 55px;
      height: 55px;
      background: url(../../assets/images/preview/arrow-big.png);
      cursor: pointer;
      &.pre {
        &:active {
          background-position: 0 -55px;
        }
      }
      &.next {
        background-position: -55px 0;
        &:active {
          background-position: -55px -55px;
        }
      }
    }
  }
  .viewer-menu {
    position: absolute;
    left: 50%;
    bottom: 66px;
    width: 404px;
    height: 72px;
    padding: 18px 30px;
    border-radius: 38px;
    transform: translate(-50%, 0);
    background-color: #31373d;

    &:hover {
      opacity: 1 !important;
    }
    &.hide {
      opacity: 0;
    }
    .menu-icon {
      display: block;
      width: 36px;
      height: 36px;
      background: url(../../assets/images/preview/menu.png);
      cursor: pointer;
      
      &.enlarge {
        background-position: 0 0;
        &:hover,
        &:active {
          background-position: 0 -36px;
        }
      }
      &.shrink {
        background-position: -36px 0;
        &:hover,
        &:active {
          background-position: -36px -36px;
        }
      }
      &.rotate {
        background-position: -72px 0;
        &:hover,
        &:active {
          background-position: -72px -36px;
        }
      }
      &.real {
        background-position: -108px 0;
        &:hover,
        &:active {
          background-position: -108px -36px;
        }
      }
      &.reduction {
        background-position: -216px 0;
        &:hover,
        &:active {
          background-position: -216px -36px;
        }
      }
      &.download {
        background-position: -144px 0;
        &:hover,
        &:active {
          background-position: -144px -36px;
        }
      }
      &.disable {
        pointer-events: none;
        cursor: not-allowed;
        opacity: 0.3;
      }
    }
    .line {
      width: 1px;
      height: 36px;
      margin: 0 20px;
      background-color: #919191;
    }
  }
}
</style>
