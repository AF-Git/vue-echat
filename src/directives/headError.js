let headUrl = require('../assets/images/error-head.png');

export const headError = {
  inserted(el, binding) {
    var img = new Image();
    img.src = el.src;
    img.onerror = () => {
      el.src = headUrl;
    }
  },
  update(el, binding) {
    var img = new Image();
    img.src = el.src;
    img.onerror = () => {
      el.src = headUrl;
    }
  }
}