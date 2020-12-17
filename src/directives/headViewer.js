import Vue from "vue";
import lightGallery from "../components/common/H5videos";

export const headViewer = {
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
  
  const ViewerConstructor = Vue.extend(lightGallery);
  let instance = new ViewerConstructor();
  let item = {
    src:el.src,
    thumb:el.src,
    info:'',
    subHtml:''
  };
  let imgs = [];
  imgs.push(item);
  instance.images=imgs;
  instance.$mount();
  document.body.appendChild(instance.$el);
  instance.showImage(0);
};
