<template>
  <div class="gmsg" v-if="value" @click.stop=";">
    <transition name="pop">
      <div class="gmsg-msgbox" :class="{'gmsg-msgbox-center':center}">
        <div class="gmsg-msgbox-title" v-if="title !== ''"> 
          <i class="gmsg-msgbox-icon" :class="iconClass" v-if="iconClass !== ''"></i>
          <span>{{ title }}</span>
        </div>
        <i class="gmsg-msgbox-close" @click="value = false" v-if="showClose"></i>
        <div class="gmsg-msgbox-content" v-if="message !== ''">
          <div class="gmsg-msgbox-message" v-html="message"></div>
          <div class="gmsg-msgbox-input" v-show="showInput">
            <input v-model="inputValue" :type="inputType" :placeholder="inputPlaceholder" ref="input">
            <div class="gmsg-msgbox-errormsg" :style="{ visibility: !!editorErrorMessage ? 'visible' : 'hidden' }">{{ editorErrorMessage }}</div>
          </div>
        </div>
        <div class="gmsg-msgbox-btns">
          <button class="btn cancel" v-show="showCancelButton" @click="handleAction('cancel')">{{ cancelButtonText }}</button>
          <button class="btn confirm" v-show="showConfirmButton" @click="handleAction('confirm')">{{ confirmButtonText }}</button>
        </div>
      </div>
    </transition>
    <div class="gmsg-modal" @click="close"></div>
  </div>
</template>

<script>
  export default {
    props: {
      value: {
        default: true
      },
      showClose: {
        type: Boolean,
        default: true
      },
      closeOnClickModel: {
        default: true
      },
      inputType: {
        type: String,
        default: "text"
      },
      inputPlaceholder: {
        type: String,
        default: ""
      }
    },
    data() {
      return {
        title: '',
        message: '',
        showInput: false,
        inputValue:"",
        inputPattern: null,
        inputValidator: null,
        inputErrorMessage: '',
        iconClass:'',
        center:false,
        showConfirmButton: true,
        showCancelButton: true,
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        editorErrorMessage: '',
        callback: null
      };
    },
    methods: {
      close(){
        if(this.closeOnClickModel) this.value = false;
      },
      handleAction(action) {
        if (this.showInput && !this.validate()) return;
        var callback = this.callback;
        this.value = false;
        callback(action);
      },
      validate() {
        var inputPattern = this.inputPattern;
        if (inputPattern && !inputPattern.test(this.inputValue || '')) {
          this.editorErrorMessage = this.inputErrorMessage || '输入的数据不合法!';
          this.$refs.input.classList.add('invalid');
          this.$refs.input.focus();
          return false;
        }
        var inputValidator = this.inputValidator;
        if (typeof inputValidator === 'function') {
          var validateResult = inputValidator(this.inputValue);
          if (typeof validateResult === 'string') {
            this.editorErrorMessage = validateResult;
            return false;
          }
          if (validateResult === false) {
            this.editorErrorMessage = this.inputErrorMessage || '输入的数据不合法!';
            this.$refs.input.classList.add('invalid');
            this.$refs.input.focus();
            return false;
          }
        }
        this.editorErrorMessage = '';
        this.$refs.input.classList.remove('invalid');
        return true;
      }
    },
    mounted () {
      if(this.iconClass){
				switch(this.iconClass){
          case "info":
						this.iconClass = "iconfont icon-icon";
						break;
					case "success":
						this.iconClass = "iconfont icon-all_selectm";
						break;
					case "warn":
						this.iconClass = "iconfont icon-warn";
						break;
					case "error":
						this.iconClass = "iconfont icon-Shapex";
						break;
					default:
						break;
        }
			}
    }
  };
</script>

<style lang="scss" scoped>
  @import '../../../assets/css/var';

  .gmsg {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 99995;
    width: 100%;
    height: 100%;

    &-msgbox {
      position: absolute;
      top: 50%;
      left: 50%;
      z-index: 99995;
      width: 350px;
      padding: 15px 15px 10px 15px;
      border-radius: 5px;
      border: 1px solid #ebeef5;
      box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
      font-size: 18px;
      text-align: left;
      background-color: #fff;
      transform: translate(-50%, -50%);
      animation: zoomIn .5s ease-out;
      transition: opacity .5s linear;
      overflow: hidden;

      &-content {
        min-height: 36px;
        line-height: 1.5;
      }
      &-close {
        position: absolute;
        top: 15px;
        right: 15px;
        display: block;
        width: 15px;
        height: 15px;
        background: url(../../../assets/images/chat/icon-window-close.png) no-repeat;
        background-size: contain;
      }
      &-input {
        & input {
          width: 100%;
          margin: 3px 0;
          padding: 5px 7px;
          box-sizing: border-box;
          border: 1px solid #dedede;
          border-radius: 5px;
          color: #333; 
          appearance: none;
          outline: none;
        }
        & input.invalid {
          border-color: #ff4949;
          &:focus {
            border-color: #ff4949;
          }
        }
      }
      &-errormsg {
        color: red;
        font-size: 12px;
        min-height: 18px;
        margin-top: 2px;
      }
      &-title {
        font-size: 18px;
        line-height: 1;
        color: #333;
      }
      &-icon{
        font-size: 20px;
        padding-right: 8px;
        &.icon-success{
          color: #3ca853;
        }
        &.icon-warn{
          color: #ef9116;
        }
        &.icon-error{
          color: #e22424;
        }
      }
      &-message {
        margin-top: 10px;
        font-size: 14px;
        line-height: 28px;
        color: #999; 
      }

      &-btns {
        margin-top: 10px;
        text-align: right;
        .btn {
          display: inline-block;
          margin: 0;
          padding: 9px 15px;
          font-size: 12px;
          border-radius: 3px;
          box-sizing: border-box;
          border: 1px solid #dcdfe6;
          line-height: 1;
          text-align: right;
          white-space: nowrap;
          background: #fff;
          color: #606266;
          cursor: pointer;
          -webkit-appearance: none;
          outline: none;
          &:active {
            background-color: #fff;
          }
        }
        .cancel {
          border-right: 1px solid #ddd;
          &:hover {
            border-color: $color-theme-active;
            color: $color-theme;
          }
        }
        .confirm {
          margin-left: 15px;
          border-color: $color-theme;
          background-color: $color-theme;
          color: #fff;
          &:hover {
            border-color: $color-theme-active;
            background-color: $color-theme-active;
          }
        }
      }
    }
    &-msgbox-center {
      text-align: center;
      .gmsg-msgbox-title{
        padding: 10px 0;
      }
      .gmsg-msgbox-btns{
        padding-bottom: 15px;
        text-align: center;
      }
    }
    &-modal {
      position: fixed;
      left: 0;
      top: 0;
      z-index: 9999;
      width: 100%;
      height: 100%;
      opacity: .3;
      background: #000;
    }
  }
  input::-webkit-input-placeholder{
    color:#ccc;
  }
  input::-moz-placeholder{   /* Mozilla Firefox 19+ */
    color:#ccc;
  }
  input:-moz-placeholder{    /* Mozilla Firefox 4 to 18 */
    color:#ccc;
  }
  input:-ms-input-placeholder{  /* Internet Explorer 10-11 */ 
    color:#ccc;
  }
</style>