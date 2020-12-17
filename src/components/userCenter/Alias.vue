<template>
  <transition name="scale-x">
    <div class="my-popup alias" @click.stop=";" v-if="isShow">
      <div class="my-popup-content" @click.stop=";">
        <h3 class="my-popup-title">{{ $t("msg.user.userName") }}</h3>
        <span class="my-popup-close" @click="hide"></span>
        <div class="title">@username</div>
        <div class="alias-box">
          <input
              type="text"
              :placeholder="$t('msg.user.aliasHolder')"
              maxlength="20"
              v-model="keyword"
            />
          <span>{{keyword.length}}/20</span>
        </div>
        <div class="alias-info" v-text="info"></div>
        <div class="alias-detail">
          <!-- <p class="title">设定用户名</p> -->
          <p class="mb">{{ $t("msg.user.aliasInfo1") }}</p>
          <p class="mb">{{ $t("msg.user.aliasInfo2") }}</p>
          <p class="mb">{{ $t("msg.user.aliasInfo3") }}</p>
          <p class="link" @click="copy" v-text='aliasLink'></p>
        </div>
        <div class="alias-button">
          <button class="cannel" @click="hide">
            {{ $t("msg.common.cancel") }}
          </button>
          <button class="comfirm" :class="{active:keyword!=userInfo.alias}" @click="setAlias">
            {{ $t("msg.common.confirm") }}
          </button>
        </div>
      </div>
      <success
        v-model="showSuccess"
        :title="$t('msg.tip.operateSuccess')"
      ></success>
    </div>
  </transition>
</template>
<script>

export default {
  name: "alias",
  data() {
    return {
      isShow: false,
      showSuccess: false,
      keyword:'',
      info:'',
      link: window.location.origin+'/u/@',
      aliasLink: window.location.origin+'/u/@'
    };
  },
  computed: {
    userInfo() {
      return this.$store.getters.userInfo;
    },
  },
  watch: {
    keyword() {
      this.aliasLink = this.link+this.keyword;
      if(this.keyword=='') {
        this.info = '';
        return;
      }
      if(!/^[a-zA-Z]/.test(this.keyword)) {
        this.info = this.$t('msg.user.aliasStartLetter');
        return;
      }
      if(this.keyword && this.keyword.length<5) {
        this.info = this.$t('msg.user.aliasTooShort');
        return;
      }
      if(!/^[a-zA-Z]\w{4,19}$/.test(this.keyword)) {
        this.info = this.$t('msg.user.aliasInvalid');
        return;
      }
      this.info = '';
    },
  },
  methods: {

    show(){
      this.isShow = true;
      this.keyword = this.userInfo.alias || '';
    },
    hide() {
      this.isShow = false;
      this.searchKey = '';
    },
    copy(){
      let oInput = document.createElement("input");
      oInput.value = this.aliasLink;
      document.body.appendChild(oInput);
      oInput.select(); // 选择对象
      document.execCommand("Copy");
      oInput.style.display = "none";
      document.body.removeChild(oInput);

      this.$store.commit("SET_TOAST_TEXT", this.$t("msg.menu.copySuccess"));
    },
    setAlias(){
      
      if(this.info!='' || this.keyword == this.userInfo.alias)  return;
      this.$http.setAlias({
        alias:this.keyword
      }).then(data=>{
        this.$store.commit("SET_TOAST_TEXT", data);
        let info = this.userInfo;
        info.alias = this.keyword;
        this.$store.commit("SET_USER_INFO", info);
      },() => {})
    }
  },
  mounted(){}
};
</script>

<style lang="scss" scoped>
@import "../../assets/css/var";
//新增用户名
.alias {
  .my-popup-content {
    width: 419px;
    height: 469px;
    text-align:left;
    padding:0 20px;
    overflow: hidden;
    .my-popup-title{
      padding-left:0;
    }
    .title{
      height:13px;
      line-height:13px;
      margin:28px 0 20px 0;
      font-size:14px;
      color:#3498DF;
      
    }
    .alias-box{
      position:relative;
      padding:8px 0;
      border-bottom:2px solid #3498DF;
      input{
        height:19px;
        line-height:19px;
        width:100%;
        font-size:14px;
      }
      span{
        position:absolute;
        top: 8px;right:0;
        color:#999;
      }
    }
    .alias-info{
      height:15px;
      line-height:15px;
      margin:11px 0 15px 0;
      color:#FF4E4E;
    }
    .alias-detail{
      p{
        height:auto;
        line-height:16px;
        margin-bottom:10px;
        color:#000;
        &.title{
          font-size:16px;
          color:#999;
          margin:0 0 19px 0;
        }
        &.mb{
          margin-bottom:19px;
        }
        &.link{
          color:#3498DF;
          cursor:pointer;
        }
      }
    }
    .alias-button{
      position:absolute;
      left:0;
      bottom:20px;
      width:100%;
      text-align:center;
      .comfirm {
        width: 78px;
        height: 34px;
        line-height: 34px;
        color: #fff;
        background: #999;
        &.active{
          background: $color-theme;
        }
      }
      .cannel {
        width: 78px;
        height: 34px;
        margin-right: 105px;
        line-height: 34px;
        color: $color-theme;
        background: #fff;
        border: 1px solid $color-theme;
      }
    }
  }
}
</style>
