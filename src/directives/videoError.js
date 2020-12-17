import store from "../store";

export const videoError = {
  inserted(el, binding) {
    let lang = store.state.lang;

    try {
      setTimeout(() => {
        var img = new Image();
        img.src = el.firstChild.src;

        let loadImg = document.createElement("img");
        loadImg.classList.add("img-loading");
        loadImg.src = require("../assets/images/chat/loading.gif");
        el.appendChild(loadImg);

        el.style.background = "#F0F4F8";
        img.onerror = () => {
          el.style.width = "100px";
          el.style.minHeight = "100px";
          el.style.background = "#333";
          el.classList.add("out-date");
          el.classList.add("display-flex");
          el.innerHTML = `<span>${lang.common.videoOutDate}<br>${lang.common.notView}</span>`;
        }; 
        img.onload = () => {
          el.removeChild(loadImg);
          el.style.background = "none";
        };
      }, 200);
    } catch (error) {}
  },
  update(el, binding) {
    let lang = store.state.lang;
    var img = new Image();
    img.src = el.firstChild.src;
    img.onerror = () => {
      el.style.width = "100px";
      el.style.minHeight = "100px";
      el.style.background = "#333";
      el.classList.add("out-date");
      el.classList.add("display-flex");
      el.innerHTML = `<span>${lang.common.videoOutDate}<br>${lang.common.notView}</span>`;
    };
  }
};
