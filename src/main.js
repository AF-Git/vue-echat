import Vue from "vue";
import App from "./App";
import router from "./router";
import store from "./store";
import i18n from "./common/i18n";
import Message from "./components/message-box";
import filters from "./common/filters";
import components from "./components/common";
import directives from "./directives";
import "./mock";
import { api } from "@/api";
import { Config } from "@/common/config"
import "babel-polyfill";
import VueDND from 'awe-dnd'
Vue.use(VueDND)
import 'element-ui/lib/theme-chalk/index.css';
import {Button,Dialog,Tabs,TabPane} from 'element-ui';
Vue.use(Button)
Vue.use(Dialog)
Vue.use(Tabs)
Vue.use(TabPane)


Vue.$message = Vue.prototype.$message = Message;

Vue.prototype.global = {
  fileDownUrl: Config.fileDownUrl,
  baseUrl: Config.baseUrl ,
}
Vue.prototype.$http = api;

//导入自定义用于过滤的函数
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key]);
});

//通过components下的index.js文件导入组件
Object.keys(components).forEach(key => {
  Vue.component(key, components[key]);
});

//通过directive下的index.js文件导入指令
Object.keys(directives).forEach(key => {
  Vue.directive(key, directives[key]);
});

new Vue({
  el: "#app",
  router,
  store,
  i18n,
  template: "<App/>",
  components: {
    App
  }
});
