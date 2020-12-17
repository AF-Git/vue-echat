<template>
  <div style=
  "position: fixed;
    z-index: 99;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.3);"
    v-if="text">
  <div class="toast" >
    <div class="toast-content">
      <div class="warn">{{$t('msg.common.warn')}}</div>
      <div class="text">{{text}}</div>
    </div>
    <div class="btn" @click="affirm()">{{$t('msg.common.ensure')}}</div>
  </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      timer: null
    };
  },
  computed: {
    text() {
      return this.$store.state.crowdtoastText;
    }
  },
  methods:{
    affirm(){
     this.$store.commit("SET_CROWDTOAST_TEXT", "");
    }
  },
  watch: {
    text() {
      if (this.text) {
        if (this.timer) {
          clearTimeout(this.timer);
        }
      }
    }
  },
  mounted() {
    this.timer = setTimeout(() => {
      this.$store.commit("SET_CROWDTOAST_TEXT", "");
    }, 2500);
  }
};
</script>