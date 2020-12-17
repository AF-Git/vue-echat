<template>
  <div
    class="input-send display-flex"
    :title="
      `${$t('msg.chatPanel.enter')}${value == 1 ? 'Enter' : 'Ctrl+Enter'}${$t(
        'msg.chatPanel.toSend'
      )}, ${$t('msg.chatPanel.enter')}${
        value == 2 ? 'Enter' : 'Ctrl+Enter'
      }${$t('msg.chatPanel.toLine')}`
    "
  >
    <button class="send-btn" @click="sendMsg"></button>
    <!-- <div
      class="enter-setting"
      :class="{ active: layout.child == 'sb' }"
      @click.stop="sendType"
    >
      <i class="icon-arrow"></i>
      <transition name="drop-left">
        <ul class="enter-setting-box" 
          v-show="layout.module == 'cp' && layout.child == 'sb'"
        >
          <li
            class="enter-setting-item"
            :class="{ active: value == 1 }"
            :title="
              $t('msg.chatPanel.enter') + 'Enter' + $t('msg.chatPanel.toSend')
            "
            @click="enterSetting(1)"
          >
            {{ $t("msg.chatPanel.enter") }}Enter{{ $t("msg.chatPanel.toSend") }}
          </li>
          <li
            class="enter-setting-item"
            :class="{ active: value == 2 }"
            :title="
              $t('msg.chatPanel.enter') +
                'Ctrl+Enter' +
                $t('msg.chatPanel.toSend')
            "
            @click="enterSetting(2)"
          >
            {{ $t("msg.chatPanel.enter") }}Ctrl+Enter{{
              $t("msg.chatPanel.toSend")
            }}
          </li>
        </ul>
      </transition>
    </div> -->
  </div>
</template>

<script>
import { localStore } from "@/tools/localStorage";
import { mapGetters } from "vuex";

export default {
  name: "seng-button",
  data() {
    return {
    };
  },
  props: {
    value: {
      type: Number
    }
  },
  computed: {
    ...mapGetters([
      "layout"
    ])
  },
  methods: {
    sendType() {
      if (this.layout.child == "sb") {
        this.$store.dispatch("setLayout", ["", "", false]);
        return;
      }
      this.$store.dispatch("setLayout", ["cp", "sb", false]);
    },
    sendMsg() {
      this.$emit("send", true);
    }
  },
  mounted() {
  }
};
</script>

<style lang="scss" scoped>
@import "../../assets/css/var";

.input-send {
 position: absolute;
 bottom:20px;
 right: 20px;
  cursor: pointer;
  .send-btn {
    position: relative;
    width: 29px;
    height: 19px;
    text-align: center;
    font-size: 14px;
    background: url(../../assets/images/icon/send.png) center no-repeat;
  }
  // .enter-setting {
  //   // float: right;
  //   // position: relative;
  //   width: 24px;
  //   height: 30px;
  //   border-radius: 0 3px 3px 0;
  //   background-color: $color-theme;
  //   .icon-arrow {
  //     display: inline-block;
  //     width: 14px;
  //     height: 14px;
  //     margin: 8px 5px;
  //     background: url(../../assets/images/icon/arrow.png) center
  //       no-repeat;
  //     background-size: 100%;
  //   }
  //   &:hover {
  //     background-color: #19B1FF;
  //   }
  //   &.active {
  //     background: #77C2F7;
  //     .icon-arrow {
  //       transform: rotate(180deg);
  //     }
  //   }
  //   &::before {
  //     content: "";
  //     position: absolute;
  //     top: 5px;
  //     left: 0;
  //     display: block;
  //     width: 1px;
  //     height: 20px;
  //     background-color: #fff;
  //   }
  // }
  .enter-setting-box {
    position: absolute;
    top: 38px;
    left: 0;
    display: block;
    width: 200px;
    padding: 6px 0;
    border-radius: 2px;
    background-color: #fff;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
    .enter-setting-item {
      position: relative;
      padding-left: 35px;
      line-height: 28px;
      color: #333;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      &:hover {
        background-color: #ddd;
      }
      &.active::before {
        content: "";
        position: absolute;
        top: 7px;
        left: 9px;
        display: block;
        width: 18px;
        height: 14px;
        background: url(../../assets/images/chat/read.png) center no-repeat;
        background-size: 100%;
      }
    }
  }
}
</style>
