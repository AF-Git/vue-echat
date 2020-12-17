<template>
  <div class="my-popup login-fail">
    <div class="my-popup-content">
      <div class="fail-title">{{ $t("msg.tip.loginFail") }}</div>
      <button class="fail-btn" @click="goLogin()">
        {{ $t("msg.tip.info") }}
      </button>
    </div>
  </div>
</template>

<script>
	export default {
    name: 'LoginFail',
    data() {
			return {
			}
    },
    methods: {
      goLogin() {
        this.$store.commit("SET_USER_INFO", {});
        let lang = localStorage.getItem("lang");
        sessionStorage.removeItem("eUcShEaRt");
        if(window.opener) window.opener.postMessage('logout', '/');
        if (lang) {
          window.location = window.location.origin + '/dist/' + lang + '/#/scan-login';
        } else {
          window.location = window.location.origin + '/dist/en_US/#/scan-login';
        }
      }
    }
	}
</script>

<style lang="scss" scoped>
@import '../../assets/css/var';

.login-fail {
  .my-popup-content {
    width: 446px;
    height: 316px;
    z-index: 101;
    .fail-title {
      margin: 116px 0 88px 0;
      font-size: 20px;
      text-align: center;
    }
    .fail-btn {
      width: 164px;
      height: 44px;
      background: $color-theme;
      color: #fff;
    }
  }
}
</style>