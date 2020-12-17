import VueI18n from 'vue-i18n';
import Vue from 'vue';

Vue.use(VueI18n);

try {
  Vue.config.lang = localStorage.lang || 'en_US';
} catch (e) {
  alert('Your web browser does not support storing settings locally.');
}

const i18n = new VueI18n({
  locale: Vue.config.lang,
  messages: {
    'zh_CN': require('./zh-cn'),   
    'en_US': require('./en-us'),
    'my': require('./my')
  }
});

export default i18n;