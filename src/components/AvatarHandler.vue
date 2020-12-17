<template>
  <transition name="pop">
    <div class="my-popup" @click.stop="">
      <div class="my-popup-content avatar-handler">
        <h3 class="my-popup-title">{{ $t("msg.user.setAvatar") }}</h3>
        <span class="my-popup-close" @click="clearFile"></span>
        <div class="upload-avatar" v-if="fileData.img">
          <div class="cropper-container">
            <div class="cropper-wrap-box" id="cropper">
              <div
                class="cropper-canvas"
                :style="{
                  width: backgroupImg.width + 'px',
                  height: backgroupImg.height + 'px',
                  transform:
                    'translateX(' +
                    backgroupImg.left +
                    'px) translateY(' +
                    backgroupImg.top +
                    'px) rotate(' +
                    rotate * 90 +
                    'deg)'
                }"
              >
                <img class="img" :src="fileData.img" alt="" />
              </div>
            </div>
            <div class="cropper-modal"></div>
            <div class="cropper-crop-box" id="mask">
              <div
                class="cropper-view-box"
                :style="{
                  width: canvas.width + 'px',
                  height: canvas.height + 'px',
                  transform:
                    'translateX(' +
                    canvas.left +
                    'px) translateY(' +
                    canvas.top +
                    'px)'
                }"
              >
                <span class="cropper-img-box">
                  <img
                    class="img"
                    :src="fileData.img"
                    :style="{
                      width: backgroupImg.width + 'px',
                      height: backgroupImg.height + 'px',
                      transform:
                        'translateX(' +
                        (backgroupImg.left - canvas.left) +
                        'px) translateY(' +
                        (backgroupImg.top - canvas.top) +
                        'px) rotate(' +
                        rotate * 90 +
                        'deg)'
                    }"
                  />
                </span>
                <span class="cropper-point" id="point"></span>
                <span class="cropper-move" id="move"></span>
              </div>
            </div>
          </div>
        </div>
        <div class="upload-avatar" v-else>
          <label for="avatar" class="upload-btn">{{
            $t("msg.user.upload")
          }}</label>
          <input
            id="avatar"
            type="file"
            @change="selectFile($event)"
            hidden
            accept=".jpg,.png,.jpeg,.bmp"
          />
          <p class="image-type">{{ $t("msg.tip.imagesType") }}</p>
        </div>
        <div class="operation">
          <div class="red" v-if="state == 1">{{ $t("msg.tip.imageBig") }}</div>
          <div class="red" v-if="state == 2">
            {{ $t("msg.tip.imageSmall") }}
          </div>
          <div class="red" v-if="state == 4">
            <span v-if="value=='user'">{{ $t("msg.common.waitUpload") }}</span>
            <span v-else>{{ $t("msg.newGroup.waitUpload") }}</span>
          </div>
          <div class="display-flex" v-if="state == 3 && fileData.img">
            <div class="display-flex">
              <div class="white-btn">
                <label class="pointer" for="avatar1">{{
                  $t("msg.common.uploadAgain")
                }}</label>
              </div>
              <input
                id="avatar1"
                type="file"
                @change="selectFile($event)"
                hidden
                accept=".jpg,.png,.jpeg"
              />
              <div class="white-btn rotate" @click="rotateImg">
                {{ $t("msg.common.rotate") }}
              </div>
            </div>
            <div class="comfirm-btn" @click="comfirm">
              {{ $t("msg.common.confirm") }}
            </div>
          </div>
        </div>
      </div>
      <success
        v-model="showSuccess"
        :title="$t('msg.common.uploadSuccess')"
      ></success>
      <fail v-model="showFail" :title="$t('msg.common.uploadfail')"></fail>
    </div>
  </transition>
</template>

<script>
import { sha1 } from "@/tools/sha1";
import { throttle } from "@/tools/utils";
import canvasExt from "@/tools/screenshot";

export default {
  data() {
    return {
      showPreView: false,
      fileData: {
        file: {},
        name: "",
        img: ""
      },
      backgroupImg: {
        width: 0,
        height: 0,
        top: 0,
        left: 0
      },
      canvas: {
        width: 192,
        height: 192,
        top: 0,
        left: 86
      },
      state: 0, // 0-默认 1-大于10M  2-小于100px  3-裁剪中  4-上传中
      rotate: 0,
      showSuccess: false,
      showFail: false
    };
  },
  props: {
    value: {
      type: String
    }
  },
  methods: {
    selectFile(e) {
      this.state = 0;
      this.rotate = 0;
      this.canvas = {
        width: 192,
        height: 192,
        top: 0,
        left: 86
      };

      let that = this;
      let file = e.target.files[0];

      if (file.size > 10 * 1024 * 1024) {
        this.state = 1;
        return false;
      }

      let reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = function() {
        that.fileData.img = this.result;
        let img = new Image();
        img.src = this.result;
        img.onload = () => {
          if (img.width < 100 || img.height < 100) {
            that.state = 2;
            that.fileData.img = "";
            return false;
          }
          that.state = 3;
          that.initCropper(img.width, img.height);
        };
      };
      this.fileData.name = file.name;
      event.target.value = "";
    },
    initCropper(w, h) {
      this.backgroupImg.width =
        w > 365 || h > 365 ? (w / h > 365 / 365 ? 365 : (w / h) * 365) : w;
      this.backgroupImg.height =
        w > 365 || h > 365 ? (w / h < 365 / 365 ? 365 : (h / w) * 365) : h;

      if (this.backgroupImg.width < 100) {
        this.backgroupImg.width = 100;
      }

      if (this.backgroupImg.height < 100) {
        this.backgroupImg.height = 100;
      }

      this.backgroupImg.top = (365 - this.backgroupImg.height) / 2;
      this.backgroupImg.left = (365 - this.backgroupImg.width) / 2;

      if (this.backgroupImg.width < 192 || this.backgroupImg.height < 192) {
        this.canvas.width = this.canvas.height =
          this.backgroupImg.width > this.backgroupImg.height
            ? this.backgroupImg.height
            : this.backgroupImg.width;
      }

      this.canvas.top = (365 - this.canvas.height) / 2;
      this.canvas.left = (365 - this.canvas.width) / 2;

      let point = document.getElementById("point");
      let move = document.getElementById("move");
      let mask = document.getElementById("mask");
      // 要画的矩形的起点 x y
      let x = 0,
        y = 0;

      point.onmousedown = e => {
        x = e.clientX;
        y = e.clientY;

        //鼠标移动事件，画图 ,防抖
        let clientWidth = this.canvas.width;
        let dropEvent = event => {
          let width = clientWidth - (x - event.clientX);

          if (
            width < 100 ||
            width >
              (this.backgroupImg.width > this.backgroupImg.height
                ? this.backgroupImg.height
                : this.backgroupImg.width) ||
            width + this.canvas.left >
              this.backgroupImg.width + this.backgroupImg.left ||
            width + this.canvas.top >
              this.backgroupImg.height + this.backgroupImg.top
          )
            return;

          this.canvas.width = this.canvas.height = width;
        };
        let throttleMove = throttle(dropEvent, 30);
        document.onmousemove = e => {
          throttleMove(e);
        };
      };

      move.onmousedown = e => {
        x = e.clientX;
        y = e.clientY;
        let offsetX = this.canvas.left;
        let offsetY = this.canvas.top;

        //鼠标移动事件，画图 ,防抖
        let moveEvent = event => {
          let left = offsetX + (event.clientX - x);
          let top = offsetY + (event.clientY - y);

          if (
            left > this.backgroupImg.left &&
            this.backgroupImg.width +
              this.backgroupImg.left -
              this.canvas.width >
              left
          ) {
            this.canvas.left = left;
          }

          if (
            top > this.backgroupImg.top &&
            this.backgroupImg.height +
              this.backgroupImg.top -
              this.canvas.height >
              top
          ) {
            this.canvas.top = top;
          }
        };
        let throttleMove = throttle(moveEvent, 50);
        move.onmousemove = e => {
          throttleMove(e);
        };
      };
      move.onmouseup = e => {
        move.onmousemove = null;
        point.onmousemove = null;
      };
      document.onmouseup = e => {
        document.onmousemove = null;
        move.onmousemove = null;
      };
    },
    rotateImg() {
      this.rotate++;

      if (this.backgroupImg.width > this.backgroupImg.height) {
        if (this.rotate % 2 == 0) {
          let temp = this.canvas.left;
          this.canvas.left =
            this.backgroupImg.width - this.canvas.top - this.canvas.height;
          this.canvas.top = temp;
        } else {
          let temp = this.canvas.top;
          this.canvas.top = this.canvas.left;
          this.canvas.left = temp;
        }
      } else if (this.backgroupImg.width == this.backgroupImg.height) {
        if (this.rotate % 2 != 0) {
          let temp = this.canvas.left;
          this.canvas.left =
            this.backgroupImg.height +
            this.backgroupImg.top * 2 -
            this.canvas.top -
            this.canvas.height;
          this.canvas.top = temp;
        } else {
          let temp = this.canvas.left;
          this.canvas.left =
            this.backgroupImg.height +
            this.backgroupImg.top * 2 -
            this.canvas.top -
            this.canvas.height;
          this.canvas.top = temp;
        }
      } else {
        if (this.rotate % 2 != 0) {
          let temp = this.canvas.left;
          this.canvas.left =
            this.backgroupImg.height - this.canvas.top - this.canvas.height;
          this.canvas.top = temp;
        } else {
          let temp = this.canvas.left;
          this.canvas.left = this.canvas.top;
          this.canvas.top = temp;
        }
      }
    },
    getImgFile(imgData) {
      let file = canvasExt.base64toFile(imgData.src, this.fileData.name);
      this.fileData.file = file;
      if (this.value == "user") {
        this.uploadAvatar();
      } else {
        this.uploadGroupAvatar();
      }
    },
    uploadAvatar() {
      let that = this;
      //上传图片
      let newform = new FormData();
      newform.append("mFile", this.fileData.file);
      newform.append("deviceType", "2");
      newform.append( "cval", sha1(this.$store.getters.token + Date.parse(new Date())));
      newform.append("uid", this.$store.getters.userId);
      newform.append("rtime", Date.parse(new Date()));
      let xml = new XMLHttpRequest();
      xml.open("post", base.imfileUrl + "/upload/user/avatar.htm", true);
      xml.setRequestHeader("token", this.$store.getters.token);
      xml.send(newform);
      xml.onreadystatechange = () => {
        //回调函数
        if (xml.status == 200) {
          setTimeout(() => {
            let b = xml.responseText;
            let data = JSON.parse(b);
            if (data.code == 0) {
              this.$emit("changeAvatar", data);
              this.clearFile();
            } else {
              this.showFail = true;
              setTimeout(() => {
                this.showFail = false;
                this.clearFile();
              }, 1600);
            }
          }, 10);
        } else {
          this.showFail = true;
          setTimeout(() => {
            this.showFail = false;
            this.clearFile();
          }, 1600);
        }
      };
    },
    uploadGroupAvatar(){
			//上传图片
			var newform=new FormData();
			newform.append("mFile", this.fileData.file);
			newform.append("deviceType", '2');
			newform.append("cval", sha1(this.$store.getters.token + Date.parse(new Date())));
      newform.append("uid", this.$store.getters.userId);
      newform.append("privateFile", true);
			newform.append("rtime", Date.parse(new Date()));
			var xml = new XMLHttpRequest();
			xml.open("post", base.imfileUrl+'/upload/picture.htm',true);
    	xml.setRequestHeader("token", this.$store.getters.token);
			xml.send(newform);
			xml.onreadystatechange = () => { //回调函数
			  if (xml.status == 200) {
          setTimeout(() => {
            let b = xml.responseText;
            let data = JSON.parse(b);
            if (data.code == 0) {
              this.showSuccess = true;
              setTimeout(() => {
                this.showSuccess = false;
                this.$emit("changeAvatar", data.data);
                this.clearFile();
              }, 1600);
            } else {
              this.showFail = true;
              setTimeout(() => {
                this.showFail = false;
                this.clearFile();
              }, 1600);
            }
          }, 10);
        } else {
          this.showFail = true;
          setTimeout(() => {
            this.showFail = false;
            this.clearFile();
          }, 1600);
        }
      }
    },
    comfirm() {
      this.state = 4;
      let targetDom = document.getElementById("cropper");
      canvasExt.uploadCropper(
        targetDom,
        this.canvas.width,
        this.canvas.height,
        this.canvas.left,
        this.canvas.top,
        this.getImgFile
      );
    },
    clearFile() {
      this.fileData = {
        file: {},
        name: "",
        img: ""
      };
      this.state = 0;
      this.rotate = 0;
      this.$emit("input", "");
    }
  },
  mounted() {}
};
</script>

<style lang="scss" scoped>
@import "../assets/css/var";

.avatar-handler {
  width: 415px;
  background-color: #fff;
  .upload-avatar {
    position: relative;
    width: 365px;
    height: 365px;
    margin: 10px auto;
    border: 1px solid #d0d0d0;
    background: #ececec;
    .image-type {
      padding: 0 10px;
    }
    .backgroup {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .upload-btn {
      display: inline-block;
      height: 34px;
      margin: 137px auto 28px;
      padding: 0 7px 0 30px;
      border-radius: 5px;
      text-align: left;
      line-height: 34px;
      background: #fff url(../assets/images/add.png) no-repeat;
      background-position: 7px 11px;
      cursor: pointer;
    }
  }
  .operation {
    height: 64px;
    padding: 7px 25px 25px 25px;
    .display-flex {
      justify-content: space-between;
    }
    .red {
      color: $color-red;
      line-height: 24px;
    }
    .white-btn {
      height: 34px;
      margin-right: 10px;
      padding: 0 7px;
      border-radius: 5px;
      border: 1px solid #d0d0d0;
      line-height: 34px;
      cursor: pointer;
    }
    .comfirm-btn {
      width: 78px;
      height: 34px;
      border-radius: 5px;
      background-color: $color-theme;
      line-height: 34px;
      color: #fff;
      cursor: pointer;
    }
    .rotate {
      padding-left: 26px;
      text-align: left;
      background: url(../assets/images/reflesh.png) no-repeat;
      background-position: 6px 8px;
    }
  }
}

.cropper-container {
  position: relative;
  direction: ltr;
  width: 365px;
  height: 365px;
  background-color: #000;
  -ms-touch-action: none;
  touch-action: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;

  .cropper-wrap-box {
    overflow: hidden;
    .cropper-canvas {
      overflow: hidden;
      .img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }
  .cropper-modal {
    background-color: #000;
    opacity: 0.5;
    cursor: crosshair;
  }
  .cropper-crop-box {
    .cropper-view-box {
      position: relative;
    }
    .cropper-img-box {
      display: block;
      height: 100%;
      width: 100%;
      border-radius: 50%;
      overflow: hidden;
      .img {
        object-fit: cover;
      }
    }
    .cropper-point {
      position: absolute;
      right: 20px;
      bottom: 10px;
      display: block;
      width: 18px;
      height: 18px;
      border-radius: 12px;
      border: 2px solid #fff;
      background-color: #3498df;
      z-index: 999;
      cursor: nw-resize;
    }
    .cropper-move {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      cursor: move;
    }
  }
  .cropper-wrap-box,
  .cropper-canvas,
  .cropper-modal,
  .cropper-crop-box {
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    left: 0;
  }
}
</style>
