<template>
  <div class="my-popup send-picture" v-show="pasteImage.show">
    <div :class="pasteImage.info.length>1?'my-popup-content small':'my-popup-content'">
      <span class="my-popup-close" @click="close"></span>
      <div class="text" v-if="pasteImage.info.length>1&&lang=='zh_CN'"> {{ $t("msg.chatPanel.imgselected") }}{{pasteImage.info.length}}张图片</div>
      <div class="text" v-else-if="pasteImage.info.length>1&&lang!='zh_CN'"> {{pasteImage.info.length}}{{ $t("msg.chatPanel.imgselected") }}</div>
      <div v-else class="paste-img-container" >
        <img :src="pasteImage.imgUrl" />
      </div>
      <div :class="pasteImage.info.length>1?'explain small':'explain'">
        <div>{{ $t("msg.chatPanel.comment") }}</div>
        <input type="text" v-model="explain" :class="pasteImage.info.length>'1'?'':'big'">
      </div>
      <p class="popup-btn">
        <button
          :class="pasteImage.info.length>'1'?'btn btn-white':'btn btn-white big'"
          type="button"
          @click="dropImgAction(false)"
        >
          {{ $t("msg.common.cancel") }}
        </button>
        <button
          class="btn btn-active"
          type="button"
          @click="dropImgAction(true,explain)"
        >
          {{ $t("msg.common.send") }}
        </button>
      </p>
    </div>
    <input
      type="file"
      hidden="true"
      id="uploadImg"
      @change="selectImg($event)"
      accept=".jpg,.png,.git,.jpeg,.gif,.ico,.bmp"
    />
  </div>
</template>

<script>
import { Util } from "@/tools/utils";
import { mapGetters } from "vuex";
import Vue from "vue";

export default {
  name: "image-popup",
  data() {
    return {
      sendInfo: {},
      time: "",
      explain:"",
      lang:Vue.config.lang
    };
  },
  computed: {
    ...mapGetters(["userInfo", "currentSession"]),
    pasteImage() {
      if (this.imgInfo.show) {
        window.addEventListener("keyup", this.sendEvent);
      } else {
        window.removeEventListener("keyup", this.sendEvent);
      }
      return this.imgInfo;
    }
  },
  props: {
    imgInfo: {
      type: Object,
      default: {}
    }
  },
  methods: {
    close(){
        this.pasteImage.show = false
        this.$parent.draguplod = false;
      },
    selectImg(event) {
      if (!event.target.files[0]) {
        return;
      }
      var file = event.target.files;
      if(file.length > 9){
        this.$store.commit(
            "SET_TOAST_TEXT",
            this.$t("msg.chatPanel.fileNum") +
            file.length +
            this.$t("msg.chatPanel.num")
          );
          return;
      }else{
        for (let i = 0; i < file.length; i++) {
          this.initSendInfo(file[i], JSON.parse(JSON.stringify(this.currentSession)));
        }
      }
      event.target.value = "";
    },
    selectImg2(event) {
      var file = event
      for (let i = 0; i < file.length; i++) {
          this.initSendInfo(file[i], JSON.parse(JSON.stringify(this.currentSession)));
        }
    },
    dropImgAction(type,msg) {
      this.$parent.draguplod = false;
      this.pasteImage.show = false;
      if (type) {
        if(this.pasteImage.info.length>1){
            this.selectImg2(this.pasteImage.info)
        }else{
          this.initSendInfo(this.pasteImage.info, JSON.parse(JSON.stringify(this.currentSession)));
        }
        if(msg!=""){
            let time = new Date().getTime();
            this.$parent.updataChatHistory(msg, "1", time);
            let obj = {
              msg,
              msgType: "1",
              chatType: this.currentSession.fromType,
              toId: this.currentSession.paramId,
              time,
              userId: this.userInfo.userId
            };
            this.$store.dispatch("sendMsg", obj).then(() => { });
            this.explain=''
          }
      } 
    },
    initSendInfo(file, sessionInfo) {
      let nameArr = file.name.split(".");
      let fileName = nameArr[nameArr.length - 1];
      //过滤不支持的图片格式
      if (!/(jpg|jpeg|png|gif|ico|bmp|tif|svg)$/i.test(fileName)) {
        this.$store.commit("SET_TOAST_TEXT", this.$t("msg.chatPanel.notAllow"));
        return;
      }

      let that = this;
      let time = new Date().getTime();
      let reader = new FileReader();
      that.sendInfo.size = file.size;
      reader.readAsDataURL(file);
      reader.onload = function() {
        let img = new Image();
        img.src = this.result;
        img.onload = () => {
          that.sendInfo.imgWidth = img.width;
          that.sendInfo.imgHeigh = img.height;
          that.$parent.updataChatHistory(
            {
              imgUrl: this.result,
              imgWidth: img.width,
              imgHeigh: img.height
            },
            3,
            time
          );
        };
      };

      Util.getImgUrl(file, 1).then(
        data => {
          that.sendInfo.imgUrl = data;
          
          if (sessionInfo.paramId == this.currentSession.paramId) {
            that.$parent.updataChatHistory(
              {
                imgUrl: data,
                imgWidth: that.sendInfo.imgWidth,
                imgHeigh: that.sendInfo.imgHeigh
              },
              3,
              time
            );
          }
          this.sendImg(JSON.parse(JSON.stringify(this.sendInfo)), time, sessionInfo);
        },
        data => {
          let cacheMsg=this.$store.getters.message[time];
          if(cacheMsg){
            cacheMsg.loading=2
          }
          this.$store.commit("SET_TOAST_TEXT", data);
        }
      );
    },
    sendImg(msg, time, sessionInfo) {
      let obj = {
        msg: JSON.stringify(msg),
        msgType: 3,
        chatType: sessionInfo.fromType,
        toId: sessionInfo.paramId,
        time,
        userId: this.userInfo.userId
      };
      this.$store.dispatch("sendMsg", obj);
    },
    sendEvent(event,mag) {
      if (event.keyCode === 13) {
        this.dropImgAction(true,this.explain);
      }
    }
  },
  mounted() {
  }
};
</script>
