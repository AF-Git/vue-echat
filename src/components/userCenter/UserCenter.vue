<template>
  <transition name="drop-left">
    <div class="menu-drop user-center" @click.stop="">
      <div class="center-header">
        <div class="display-flex">
          <div class="user-avatar">
            <img class="img" :src="global.fileDownUrl + 'compress/'+userInfo.headImg" v-headViewer v-headError ondragstart="return false"/>
          </div>
          <div class="user-detail display-flex-item">
            <p class="user-name">
              {{ userInfo.nickName || userInfo.userName }}
            </p>
            <p>ID: {{ userInfo.userId }}</p>
          </div>
        </div>
        <div class="share-banner" @click="inviteFriend">
          <p class="top" :title="$t('msg.user.inviteFriend')">
            {{ $t("msg.user.inviteFriend") }}
          </p>
          <p class="bottom" :title="$t('msg.user.discoverWorld')">
            {{ $t("msg.user.discoverWorld") }}
          </p>
          <label class="btn" :title="$t('msg.user.inviteNow')">{{
            $t("msg.user.inviteNow")
          }}</label>
        </div>
      </div>
      <ul class="menu-list">
        <li
          class="menu-item display-flex"
          @click="clickMenu(1)"
        >
          <span class="menu-icon"></span>
          <span class="flex-item-nowrap" :title="$t('msg.user.personal')">{{
            $t("msg.user.personal")
          }}</span>
        </li>
        <li
          class="menu-item display-flex"
          @click="clickMenu(2)"
        >
          <span class="menu-icon favorites"></span>
          <span class="flex-item-nowrap" :title="$t('msg.user.favorite')">{{
            $t("msg.user.favorite")
          }}</span>
        </li>

        <!-- <li class="menu-item display-flex">
          <span class="menu-icon uploadface"></span>
          <label class="flex-item-nowrap" for="uploadface" :title="$t('msg.user.uploadface')">{{
            $t("msg.user.uploadface")
          }}</label>
           <input
            id="uploadface"
            type="file"
            hidden
            accept=".zip"
            multiple="multiple"
            @change="selectFile($event)"
          />
        </li> -->

        <li
          class="menu-item display-flex"
          @click="clickMenu(3)"
        >
          <span class="menu-icon setting"></span>
          <span class="flex-item-nowrap" :title="$t('msg.menu.setting')">{{
            $t("msg.menu.setting")
          }}</span>
        </li>
      </ul>
      <ul class="menu-list exit">
        <li
          class="menu-item display-flex"
          @click.stop="logOut"
        >
          <span class="menu-icon"></span>
          <span class="flex-item-nowrap" :title="$t('msg.user.exit')">{{
            $t("msg.user.exit")
          }}</span>
        </li>
      </ul>
      <!-- 退出登录弹窗 -->
      <transition name="pop">
        <Popup :title="$t('msg.tip.tip')"
          @click.native="logOut" 
          :hideClose="true" 
          v-if="layout.module == 'uc' && layout.child == 'logout'"
        >
          <div class="logout" @click.stop="" slot="body">
            <div class="logout-detail">{{ $t("msg.user.confirmExit") }}</div>
            <button class="cannel" @click="logOut()">
              {{ $t("msg.common.cancel") }}
            </button>
            <button class="comfirm" @click="exit()">
              {{ $t("msg.common.confirm") }}
            </button>
          </div>
        </Popup>
      </transition>
      <div class="mask" v-if="layout.child == 'logout'"></div>
    </div>
  </transition>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "user-center",
  data() {
    return {
      files:null
    };
  },
  computed: {
    ...mapGetters(["userInfo", "layout"])
  },
  methods: {
    selectFile(e){
      this.files = e.target.files
      let formData = new FormData();
      formData.append("file",this.files[0]);
      let xml = new XMLHttpRequest();
      xml.open("post", base.codeUrl+"/emojiweb/emoji/addPersonsFileOfZip.htm", true);
      xml.setRequestHeader("token", this.$store.state.token);
      xml.send(formData);
      xml.onreadystatechange = () => {
        //回调函数
        if (xml.status == 200) {
         console.log(xml.responseText);
         alert("上传成功")
        }
        else{
        }
      };
    },
    logOut() {
      if (this.layout.child == "logout") {
        this.$store.dispatch("setLayout", ["uc", "uc", false]);
      } else {
        this.$store.dispatch("setLayout", ["uc", "logout", false]);
      }
    },
    exit() {
      /*let lang = localStorage.getItem("lang");
      if (lang) {
				window.location = window.location.origin + '/dist/' + lang + '/#/index';
			} else {
				window.location = window.location.origin + '/dist/en_US/#/index';
			}*/
      this.$http.logout({}).then(
        data => {
          Util.clearCookie("eUcShEaRt");
          window.sessionStorage.removeItem("eUcShEaRt");
          let lang = localStorage.getItem("lang");
          if (lang) window.location = window.location.origin + '/dist/' + lang + '/#/scan-login';
          else window.location = window.location.origin + '/dist/en_US/#/scan-login';
        },() => {}
      )
    },
    inviteFriend() {
      this.$store.dispatch("setLayout", ["uc", "if", true]);
    },
    clickMenu(i) {
      switch (i) {
        case 1:
          this.$store.dispatch("setLayout", ["uc", "ui", true]);
          break;
        case 2:
          this.$parent.doShowFavorites();
          this.$store.dispatch("setLayout", ["", "", false]);
          break;
        case 3:
          this.$parent.showFavorites=false;
          this.$store.dispatch("setLayout", ["uc", "st", true]);
          break;
      }
    }
  },
  mounted() {
  }
};
</script>

<style lang="scss" scoped>
@import "../../assets/css/var";
.user-center {
  width: 214px;
  top: 61px;
  left: 4px;
  background-color: $backgroup-color;

  
  .center-header {
    padding: 12px 0 10px 0;
    margin-bottom: 5px;
    border-bottom: 1px solid $border-color;
    background-color: #fff;
&::after {
    content: '';
    position: absolute;
    top: -12px;
    left: 30px;
    width: 0;
    height: 0;
    margin-left: -11px;
    border-left: 11px solid transparent;
    border-right: 11px solid transparent;
    border-bottom: 12px solid #fff;
  }
    .user-avatar {
      width: 52px;
      height: 52px;
      margin: 0 8px;
      border: 2px solid $color-theme;
      cursor: pointer;
    }
    .user-name {
      font-size: 18px;
      margin-bottom: 3px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    .menu-icon {
      margin: 0 3px;
      cursor: pointer;
    }
    .share-banner {
      position: relative;
      width: 208px;
      height: 50px;
      margin: 10px 0 0 3px;
      padding: 6px 8px;
      line-height: 18px;
      color: #fff;
      background: url(../../assets/images/invite-bg.png);
      background-size: 100% 100%;
      cursor: pointer;
      .top {
        display: inline-block;
        width: 138px;
        font-size: 14px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
      .bottom {
        display: inline-block;
        width: 138px;
        font-size: 12px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
      .btn {
        position: absolute;
        top: 13px;
        right: 0;
        width: 65px;
        height: 23px;
        line-height: 23px;
        font-size: 12px;
        text-align: center;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }
  }
  .menu-list {
    margin-bottom: 5px;
    border-bottom: 1px solid $border-color;
    .menu-item {
      padding: 8px 0;
      border-top: 1px solid $border-color;
      font-size: 14px;
      line-height: 30px;
      background-color: #fff;
      color: #333;
    }
    &.exit {
      margin-bottom: 0;
      .menu-icon {
        background-position: -150px 0;
      }
    }
  }
  .menu-icon {
    width: 30px;
    height: 30px;
    margin: 0 15px 0 20px;
    background: url(../../assets/images/index/user-center.png);
    &.setting {
      background-position: -120px 0;
    }
    &.favorites {
      background-position: -180px 0;
    }
    &.uploadface{
      background-position: -30px 0;
    }
  }
}

.logout {
  height: 170px;
  width: 315px;
  text-align: center;
  .logout-detail {
    padding: 30px 0 50px;
    text-align: center;
    font-size: 14px;
    color: #999;
  }
  .comfirm {
    width: 78px;
    height: 34px;
    line-height: 34px;
    color: #fff;
    background: $color-theme;
  }
  .delete {
    width: 78px;
    height: 34px;
    line-height: 34px;
    color: #fff;
    background: $color-red;
  }
  .cannel {
    width: 78px;
    height: 34px;
    margin-right: 50px;
    line-height: 34px;
    color: $color-theme;
    background: #fff;
    border: 1px solid $color-theme;
  }
  .failBg {
    z-index: 1;
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    background: rgba(0, 0, 0, .3);
  }
}

.mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, .3);
}
</style>
