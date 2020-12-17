import Vue from "vue";
import lightGallery from "../components/common/H5videos";
import { Config } from "@/common/config"
export const faViewer = {
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

  let data=binding.value;
  console.log(el.getAttribute('mId'));
  let arr = [],index = 0;
  let list = [],msgContent1;
  for(let i=0;i<data.length;i++){
    let cache=data[i];
    if(Number(cache.bodyType)==3 || Number(cache.bodyType)==5) arr.push(cache);
  }
  arr.sort((a, b) => b.bodyTime - a.bodyTime);//排序

  if (Array.isArray(arr)) {
    for (let i = 0; i < arr.length; i++) {
      let item = arr[i];
      if(item.id == el.getAttribute('mId')) index=i;
      let msgContent = typeof item.bodyContent == "string" ? JSON.parse(item.bodyContent) : item.bodyContent;
      let fileUrl,thumb,subHtml='',poster;
      fileUrl=msgContent.videoUrl?msgContent.videoUrl:msgContent.imgUrl;

      
      let arrayFileName=fileUrl.split('?attname=');
      if(arrayFileName.length>1){
        subHtml=arrayFileName[1];
      }
      poster=msgContent.imgUrl;

      if (item.bodyType == "3") {
        msgContent1 = {
          src:Config.fileDownUrl + 'original/'+fileUrl,
          thumb:Config.fileDownUrl + 'compress/'+fileUrl,
          info:[msgContent.imgWidth,msgContent.imgHeigh],
          subHtml:subHtml
        };      
      }else if (item.bodyType == "5") {
        let videoUrl=Config.fileDownUrl + 'original/'+fileUrl;
        msgContent1 = {
          poster:Config.fileDownUrl + 'compress/'+poster,
          v_src:videoUrl,
          thumb:Config.fileDownUrl + 'compress/'+poster,
          info:[msgContent.imgWidth,msgContent.imgHeigh],
          html:'#video1',
          subHtml:subHtml
          };
      }
      list.push(msgContent1);
    }
  }
  console.log(list);
  const ViewerConstructor = Vue.extend(lightGallery);
  let instance = new ViewerConstructor();
  instance.images=list;
  instance.$mount();
  document.body.appendChild(instance.$el);
  instance.showImage(index);
};
