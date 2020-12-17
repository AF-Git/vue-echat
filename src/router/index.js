import Vue from 'vue'
import Router from 'vue-router'
import Index from '@/views/Index';

Vue.use(Router);

var router = new Router({
  routes: [
    {
      path: '/',
      redirect: {
        name: 'index'
      }
    },
    { // 好友
      path: '/',
      name: 'index',
      component: Index
    },
    { // 以上路由都匹配不到的时候重定向到首页
      path: '/*',
      redirect: {
        name: 'index'
      }
    },
  ]
});

router.beforeEach(function(to, from, next ) {
  window.scrollTo(0, 0);
  next();
});

export default router;
