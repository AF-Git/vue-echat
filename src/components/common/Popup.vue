<template>
  <transition name="scale-x">
    <div class="e-popup">
      <div class="e-popup-box" :style="{'border-radius': radius + 'px'}" @click.stop="">
        <div class="popup-header" :style="{'text-align': titleAlign}" v-if="!hideHeader">
          <label class="title">{{ title }}</label>
          <span class="close" @click="close" v-if="!hideClose"></span>
        </div>
        <slot name="body"></slot>
      </div>
    </div>
  </transition>
</template>

<script>
	export default {
    name: 'Popue',
    data (){
			return {
			}
    },
    props: {
      title: {
        type: String,
        default: ""
      },
      hideHeader: {
        type: Boolean,
        default: false
      },
      hideClose: {
        type: Boolean,
        default: false
      },
      titleAlign: {
        type: String,
        default: "left"
      },
      radius: {
        type: String,
        default: "2"
      }
    },
    methods: {
      close() {
        this.$store.dispatch("setLayout", ["", "", false]);
      }
    },
    mounted(){
    }
	}
</script>

<style lang="scss">
@import '../../assets/css/var';

.e-popup {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 299;
  width: 100%;
  height: 100%;

  &-box {
    position: absolute;
    top: 50%;
    left: 50%;
    background: #fff;
    -webkit-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
    box-shadow: 0 0 8px #999;
  }
  .popup-header {
    position: relative;
    height: 40px;
    padding: 0 15px;
    line-height: 40px;

    .title {
      font-size: 16px;
    }
    .close {
      width: 12px;
      height: 12px;
      display: block;
      position: absolute;
      top: 15px;
      right: 15px;
      background: url(../../assets/images/chat/icon-window-close.png) center center no-repeat;
      cursor: pointer;
      &:hover{
        background: url(../../assets/images/chat/icon-window-close-red.png) center center no-repeat;
      }
    }
  }
  .search-box {
    width: 327px;
    height: 64px;
    border: 0;
    padding: 15px 10px;
    .search-input {
      width: 100%;
      height: 34px;
      margin-left: 0;
      border: 1px solid #B5B5B5;
      input {
        height: 34px;
        line-height: 32px;
      }
    }
  }
  .search-btn {
    display: inline-block;
    width: 78px;
    height: 34px;
    line-height: 34px;
    border-radius: 3px;
    background: $color-theme;
    color: #fff;
  }
}
</style>