<template>
  <div id="videoplay">
    <div style="display:none;" id="video1">
      <video class="lg-video-object lg-html5" controls preload="none">
        <source  :src="v_src" type="video/mp4" />Your browser does not support HTML5 video.
      </video>
    </div>
    <div :id="id" class="list-unstyled justified-gallery"></div>
  </div>
</template>
<script>
import "lightgallery.js";
import "lightgallery.js/dist/css/lightgallery.min.css";
import "lightgallery.js/dist/css/lg-transitions.min.css";
import "lg-fullscreen.js";
// import "lg-thumbnail.js";
import "lg-autoplay.js";
import "lg-video.js";
import "lg-pager.js";
// import "lg-hash.js";
import lgroom from '../../common/lg-zoom';
import thumbnai from '../../common/lg-thumbnail'
export default {
  name: "lightGallery",
  props: {
    id: {
      type: String,
      default: "lightgallery"
    }
  },
  data() {
    return {
      v_src: "",
      images: []
    };
  },
  methods: {
    showImage(index) {
      let that = this;
      var lg = document.getElementById(this.id);
      lg.addEventListener("onAfterOpen", this.onAfterOpen, { once: true });
      lg.addEventListener("onBeforeSlide", this.onBeforeSlide);
      lg.addEventListener("onCloseAfter", this.onCloseAfter, { once: true });
      
      if (lg.getAttribute("lg-uid")) {
        window.lgData[lg.getAttribute("lg-uid")].s.index = index;
      }
      window.lightGallery(lg, {
        dynamic: true,
        dynamicEl: this.images,
        index: index,
        preload: 1,
        mode: "lg-lollipop-rev", //转场动画
        // cssEasing : 'cubic-bezier(0.25, 0, 0.25, 0.5)',
        showAfterLoad: false,
        loop:false,
        hideControlOnEnd:true,
        // download:false
        // iframeMaxWidth: "100%"
        // currentPagerPosition:'middle'
      });
    },
    onAfterOpen(event) {
      let obj = document.querySelector("iframe.lg-object");
      obj && obj.setAttribute("scrolling", "no");
    },
    onBeforeSlide(event) {
      if (this.images) this.v_src = this.images[event.detail.index].v_src;
    },
    onCloseAfter(event) {
      var lg = document.getElementById(this.id);
      window.lgData[lg.getAttribute("lg-uid")].destroy(true);
      this.$destroy();
      lg.removeEventListener("onAfterOpen", this.onAfterOpen, false);
      lg.removeEventListener("onBeforeSlide", this.onBeforeSlide, false);
      lg.removeEventListener("onCloseAfter", this.onCloseAfter, false);
    },
    removeAllChild()  { 

    var div = document.getElementById("videoplay"); 
    div.parentNode.removeChild(div)

}
  },
  destroyed() {
    console.log(this.$options.name + " 被销毁");
    this.removeAllChild()
  },
  mounted() {
    console.log(this.$options.name + " 被加载");
    },
};
</script>