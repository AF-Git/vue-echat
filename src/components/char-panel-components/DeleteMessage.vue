<template>
  <div class="my-popup alert-more" v-show="deleteInfo.show">
    <div class="more-content">
      <div class="more-header">
        {{ $t("msg.chatPanel.selected") }}{{ deleteInfo.idsArr.length }}
        {{ $t("msg.chatPanel.msg") }}
        <i class="close-icon" @click="deleteInfo.show = false"></i>
      </div>
      <p class="tip-text">{{ $t("msg.chatPanel.allDelete") }}</p>
      <button class="btn-upload cannel" @click="deleteInfo.show = false">
        {{ $t("msg.common.cancel") }}
      </button>
      <button class="btn-upload comfirm" @click="comfirm()">
        {{ $t("msg.common.confirm") }}
      </button>
    </div>
  </div>
</template>
<script>
import { mapGetters } from "vuex";
import { EchatDB } from "@/tools/indexedDB";
import { msgManager } from "@/session/msgManager";

export default {
  name: "delete-message",
  data() {
    return {};
  },
  computed: {
    ...mapGetters(["deleteInfo"])
  },
  methods: {
    comfirm() {
      this.deleteInfo.show = false;

      this.$http.deleteMessage({
          sessionUserId: this.deleteInfo.paramId,
          type: this.deleteInfo.fromType,
          multMsgId: this.deleteInfo.ids
        }).then(
          data => {
            let currentSession=this.$store.state.currentSession;
            if(this.deleteInfo.paramId==currentSession.paramId&&this.deleteInfo.fromType==currentSession.fromType){
                let msgArray=Object.values(this.$store.state.message);
                if(msgArray.length>1){
                  let msgCache= msgArray[msgArray.length-2];
                  currentSession.preview=msgArray[msgArray.length-2].preview
                  currentSession.userTime=msgCache.bodyTime;
                }else{
                  currentSession.preview='';
                }
                let sessionCache=JSON.parse(JSON.stringify(currentSession))
                this.$store.commit("UPDATE_SESSION", sessionCache);
            }

            this.$parent.showMore = false;
            var mIdArr = this.deleteInfo.idsArr;
            if (mIdArr && mIdArr.length) {
              for (var i = 0; i < mIdArr.length; i++) {
                var history = this.$store.state.message[mIdArr[i]];
                if (history) {
                  this.$store.commit("DELETE_MESSAGE", history.mId);
                }

                if (history.loading == 2) {
                  EchatDB.deleteTempMsg(+this.deleteInfo.paramId, mIdArr[i] + '');
                } else {
                  msgManager.removeMsg(this.deleteInfo.fromType,this.deleteInfo.paramId, mIdArr[i]);
                }
              }
            }
          },
          () => {}
        );
    }
  },
  mounted() {}
};
</script>

<style lang="scss" scoped="" type="text/css">
@import "../../assets/css/var";
.alert-more {
  .more-content {
    position: absolute;
    top: 50%;
    left: 50%;
    height: 220px;
    width: 315px;
    text-align: center;
    background: #fff;
    -webkit-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
    text-align: center;
    border-radius: 5px;
    .more-header {
      position: relative;
      height: 38px;
      line-height: 38px;
      width: 100%;
      font-size: 18px;
      text-align: left;
      padding-left: 16px;
      border-bottom: 1px solid $border-color;
      .close-icon {
        position: absolute;
        top: 15px;
        right: 12px;
        width: 8px;
        height: 8px;
        background-image: url(../../assets/images/chat/icon-window-close.png);
        background-size: 100% 100%;
        cursor: pointer;
      }
    }
    .tip-text {
      height: 15px;
      line-height: 15px;
      font-size: 16px;
      margin: 50px auto;
    }
    .btn-upload {
      display: inline-block;
      height: 34px;
      width: 78px;
      border-radius: 5px;
      font-size: 14px;
      text-align: center;
      line-height: 100%;
      &:hover {
        background: #fea405;
        color: #fff;
        border: none;
      }
      &.cannel {
        color: $color-theme;
        background: #fff;
        border: 1px solid $color-theme;
      }
      &.comfirm {
        margin-left: 50px;
        color: #fff;
        background: $color-theme;
      }
    }
  }
}
</style>
