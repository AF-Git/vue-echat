import axios from 'axios';
import store from '../store'
import Qs from 'qs'

let pending = []; // 存储每个请求的取消函数和标识
let cancelToken = axios.CancelToken;

let removePending = (ever) => {
  for (let p in pending) {
    if (pending[p].u === ever.url + '&' + ever.method) { // 当前请求在数组中存在时执行函数体 
      pending[p].f(); // 执行取消操作
      pending.splice(p, 1);
    }
  }
}

axios.interceptors.request.use(
  config => {
    // 转换请求数据
    config.transformRequest = [function(data) {
      data = Qs.stringify(data);
      return data;
    }]
    // 请求头配置
    config.headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      token: store.getters.token,
      locale: localStorage.lang || 'en_US',
      deviceType: '2'
    }
    removePending(config); // 在请求发送前执行一下取消操作
    config.cancelToken = new cancelToken((c) => {
      pending.push({ u: config.url + '&' + config.method, f: c });
    });
    config.timeout = 25 * 1000;
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
    res => {
      removePending(res.config); // 把已经完成的请求从pending中移除
      if (res.data.code != 0 && res.data.code != -2 && res.data.code != 101012) {
        if(res.request.responseURL.lastIndexOf('/group/getGroupUser.htm')>-1){
          return Promise.reject(res.data)
        }
        if (res.data.code == 100108 || res.data.code == 100107 || res.data.code == 100106) {
          store.dispatch("setLoginFail", true)
        } else {
          if(res.data.code == 101017||res.config.url.indexOf("getReadNumWeb.htm") >= 0){
            return Promise.reject(res.data)
          }          
          store.commit('SET_TOAST_TEXT', res.data.data);
        }
        return Promise.reject(res.data)
      }
      return Promise.resolve(res.data)
    },
    error => {
      return Promise.reject(error)
    }
)