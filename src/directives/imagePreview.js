import store from "../store";

let lang = store.state.lang;

export const imagePreview = {
  inserted(el, binding) {
    try {
      let lang = store.state.lang;
      var img = new Image();
      img.src = el.firstChild.src;

      if (!el.firstChild.src) return;

      let loadImg = document.createElement("img");
      loadImg.classList.add("img-loading");
      loadImg.src = require("../assets/images/chat/loading.gif");
      el.appendChild(loadImg);

      el.style.background = "#F0F4F8";
      img.onerror = () => {
        if (el.classList[1] == "msg-img") {
          el.style.width = "100px";
          el.style.background = "#333";
          el.classList.add("display-flex");
          el.innerHTML = `<span>${lang.common.imageOutDate}<br>${lang.common.notView}</span>`;
        }
      };
      img.onload = () => {
        el.removeChild(loadImg);
        el.style.background = "";
      };
    } catch (error) {}
  },
  update(el, binding) {
    let lang = store.state.lang;
    var img = new Image();
    img.src = el.firstChild.src;
    img.onerror = () => {
      if (!el.firstChild.src) {
        el.style.width = "100px";
        el.style.background = "#333";
        el.classList.add("display-flex");
        el.innerHTML = `<span>${lang.common.imageOutDate}<br>${lang.common.notView}</span>`;
      }
    };
  }
};
