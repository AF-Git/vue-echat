<template>
  <div id="app">
		<div class="app-logo" @click="goIndex">
			<span class="version">{{ version }}</span>
		</div>
		<router-view></router-view>
  </div>
</template>

<script>
import { localStore } from "@/tools/localStorage";
import { Config } from "@/common/config"
import store from "@/store";

export default {
	name: 'app',
	data() {
		return {
			version: Config.version
		}
	},
	methods: {
		goIndex() {
			
			/*let lang = localStorage.getItem("lang");
			if (lang) {
				window.location = window.location.origin + '/dist/' + lang + '/#/index';
			} else {
				window.location = window.location.origin + '/dist/en_US/#/index';
			}*/
			//window.open( "./static/version.txt");
		}
	},
	mounted() {
		this.$store.commit("SET_LANG", this.$t("msg"));
		document.cookie = "eUcShEaRt=QcgrEasfGw5PAumgx1GIruJ06VwpUIwLOlJyjqKTsX216gHhUKee5SiVdGOBQRdp0wYfjtPO06WggO5OTjoH0Q=="
		document.body.onbeforeunload = () => {
			//设置已读ID
			let cacheCurrentSession=this.$store.state.currentSession;
			if(cacheCurrentSession){
				if(cacheCurrentSession.paramId>1){
					this.$store.dispatch("setSessionReadId", {
						froms: cacheCurrentSession.paramId + "-" +
								cacheCurrentSession.fromType + "-" +
								cacheCurrentSession.mId
					});
				}
			}
			let lang = store.state.lang;
			//只为兼容旧版本浏览器，新版本浏览器不允许自定义提示
			window.event.returnValue = lang.system.pageExit;
			return lang.system.pageExit;
		}
	}
}
</script>
<style src="./assets/css/base.css"></style>
<style lang="scss" type="text/css">
	@import "./assets/css/style.scss";
</style>
