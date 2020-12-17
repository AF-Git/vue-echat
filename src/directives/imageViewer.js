import Vue from "vue";
import store from "../store";
import lightGallery from "../components/common/H5videos";
import { Config } from "@/common/config"
import { msgManager } from "@/session/msgManager";


export const viewer = {
  inserted(el, binding) {
    el.onclick = () => {
      handler(el, binding);
    };
  },
  update(el, binding, vnode, oldVnode) {
    el.onclick = () => {
      handler(el, binding);
    };
  }
};

const handler = (el, binding) => {
  msgManager.getLocalImgAndVideo(store.state.currentSession.fromType, store.state.currentSession.paramId).then(data => {
    let indexMsgId = binding.value, index = 0;
    const ViewerConstructor = Vue.extend(lightGallery);
    let instance = new ViewerConstructor();
    let imgs = [], msgContent1;
    let cacheArray = [];

    for (let i = 0; i < data.length; i++) {
      let cache = data[i];
      if (Number(cache.bodyType) == 4) {
        continue;
      }//音频先剔除
      cacheArray.push(cache);
    }
    cacheArray.sort((a, b) => a.bodyTime - b.bodyTime);//排序
    for (let i = 0; i < cacheArray.length; i++) {
      let cache = cacheArray[i];
      if (cache.mId == indexMsgId) {
        index = i;
      }

      // let msgContent = typeof cache.bodyContent == "string" ? JSON.parse(cache.bodyContent) : cache.bodyContent;
      let msgContent = cache.msgContent;
      let fileUrl, subHtml = '', poster;
      fileUrl = msgContent.videoUrl ? msgContent.videoUrl : msgContent.imgUrl;


      let arrayFileName = fileUrl.split('?attname=');
      if (arrayFileName.length > 1) {
        subHtml = arrayFileName[1];
      }
      poster = msgContent.imgUrl;

      if (cache.bodyType == "5") {
        let videoUrl = Config.fileDownUrl + 'original/' + fileUrl;
        msgContent1 = {
          poster: Config.fileDownUrl + 'compress/' + poster,
          v_src: videoUrl,
          thumb: Config.fileDownUrl + 'compress/' + poster,
          info: [msgContent.imgWidth, msgContent.imgHeigh],
          html: '#video1',
          subHtml: subHtml
        };
      } else {
        msgContent1 = {
          src: Config.fileDownUrl + 'original/' + fileUrl,
          thumb: Config.fileDownUrl + 'compress/' + fileUrl,
          info: [msgContent.imgWidth, msgContent.imgHeigh],
          subHtml: subHtml
        };
      }
      imgs.push(msgContent1);
    }
    console.log(imgs);
    instance.images = imgs;
    instance.$mount();
    document.body.appendChild(instance.$el);
    instance.showImage(index);
  });

};
