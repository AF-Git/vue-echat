<template>
  <div @click.stop="">
    <canvas id="bg_canvas" width="100%" height="100%" />
    <div class="preview" v-show="showPreview">
      <div
        class="preview-img"
        :style="{
          top: shotImg.top - 2 + 'px',
          left: shotImg.left - 2 + 'px',
          width: shotImg.width + 4 + 'px',
          height: shotImg.height + 4 + 'px'
        }"
      >
        <img class="img" :src="shotImg.src" :title="$t('msg.tip.rightCopy')" />
      </div>
      <div class="operation" 
          id="screenshot" 
          :style="{
            top: shotImg.top + shotImg.height + 10 + 'px',
            right: shotImg.right + 'px',
          }"
        >
          <span
            class="shot-icon transfer"
            :title="$t('msg.menu.forward')"
            @click="transfer"
          ></span>
          <span class="line"></span>
          <span
            class="shot-icon cancel"
            :title="$t('msg.common.cancel')"
            @click="cancel"
          ></span>
          <span
            class="shot-icon download"
            :title="$t('msg.common.complete')"
            @click="download"
          ></span>
          <span class="finish" @click="download">{{
            $t("msg.common.complete")
          }}</span>
        </div>
    </div>
  </div>
</template>

<script>
import canvasExt from "@/tools/screenshot";
import { Util } from "@/tools/utils";

export default {
  name: "screenshot",
  data() {
    return {
      shotImg: {},
      defaultStrokeWidth: 1,
      showPreview: false
    };
  },
  methods: {
    show() {
      let clientWidth =
        document.documentElement.clientWidth || document.body.clientWidth;
      let clientHeight =
        document.documentElement.clientHeight || document.body.clientHeight;
      document.getElementById("bg_canvas").width = clientWidth;
      document.getElementById("bg_canvas").height = clientHeight;
      canvasExt.drawRect("bg_canvas", "#60BFFF", this.getImg);
    },
    getImg(imgData) {
      this.shotImg = imgData;
      this.showPreview = true;
      var clientWidth = document.documentElement.clientWidth || document.body.clientWidth;
      var clientHeight = document.documentElement.clientHeight || document.body.clientHeight;
      this.shotImg.right = clientWidth - imgData.left - imgData.width;

      if (imgData.top + imgData.height >= clientHeight - 52) {
        document.getElementById("screenshot").style.bottom = "10px";
        document.getElementById("screenshot").style.right = "10px";
      }
    },
    transfer() {
      this.shotImg.src = this.shotImg.src.replace(/\+/g, "%2B");
      let obj = {};
      Util.getImgUrl(this.shotImg.src, 2).then(
        data => {
          obj = {
            imgUrl: data,
            size: Util.getImgSize(this.shotImg.src),
            imgWidth: this.shotImg.width,
            imgHeigh: this.shotImg.height
          };
          let msg = {
            msgType: 3,
            bodyContent: obj
          };
          let forwardInfo = {
            show: true,
            body: [msg]
          };
          this.$store.commit("SET_FORWARD_INFO", forwardInfo);
        },
        data => {
          this.$store.commit("SET_TOAST_TEXT", data);
        }
      );
    },
    cancel() {
      this.shotImg = {};
      this.showPreview = false;
      this.$store.dispatch("setLayout", ["", "", false]);
    },
    download() {
      var a = document.createElement("a");
      var event = new MouseEvent("click");
      var timestamp = new Date().getTime();
      var name = this.shotImg.src.substring(22, 30) + timestamp + ".png";
      a.download = name;
      a.href = this.shotImg.src;
      a.dispatchEvent(event);
      this.cancel();
    }
  },
  mounted() {
    this.show();
  }
};
</script>
<style lang="scss" scoped>
#bg_canvas {
  position: fixed;
  z-index: 666;
  left: 0;
  top: 0;
  cursor: crosshair;
}
.preview {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 667;
  background-color: rgba(0, 0, 0, 0.5);
  &-img {
    position: fixed;
    z-index: 9998;
    border: 2px solid #60bfff;
    .img {
      display: block;
      width: 100%;
      height: auto;
      cursor: crosshair;
    }
  }
}
.operation {
  position: absolute;
  right: 0;
  height: 43px;
  padding: 9px 15px;
  border-radius: 5px;
  text-align: right;
  background-color: #fff;
  cursor: pointer;
  .shot-icon {
    display: inline-block;
    width: 25px;
    height: 25px;
    background: url(../../assets/images/screen_shot.png) no-repeat;
    &.transfer {
      margin-right: 7px;
      background-position: 0 0;
      &:hover {
        background-position: 0 -25px;
      }
    }
    &.cancel {
      margin: 0 3px;
      background-position: -25px 0;
      &:hover {
        background-position: -25px -25px;
      }
    }
    &.download {
      margin: 0 3px;
      background-position: -50px 0;
      &:hover {
        background-position: -50px -25px;
      }
    }
  }
  .line {
    display: inline-block;
    width: 1px;
    height: 25px;
    background-color: #ddd;
  }
  .finish {
    float: right;
    display: block;
    height: 25px;
    line-height: 25px;
  }
}
.mask {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 99;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}
</style>
