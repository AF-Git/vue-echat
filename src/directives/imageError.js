import store from '../store'

let imageUrl = require('../assets/images/image-error.png');

export const imageError = {
  inserted(el, binding) {
    let lang = store.state.lang;
    var img = new Image();
    img.src = el.src;
    img.onerror = () => {
      el.src = imageUrl;
      el.title = lang.common.imageOutDate;
    }
  },
  update(el, binding) {
    let lang = store.state.lang;
    var img = new Image();
    img.src = el.src;
    img.onerror = () => {
      el.src = imageUrl;
      el.title = lang.common.imageOutDate;
    }
  }
}