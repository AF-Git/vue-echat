<template>
  <div class="my-toast" v-if="text">
    <div class="my-toast-content">{{ text }}</div>
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
      return this.$store.state.toastText;
    }
  },
  watch: {
    text() {
      if (this.text) {
        if (this.timer) {
          clearTimeout(this.timer);
        }
        this.timer = setTimeout(() => {
          this.$store.commit("SET_TOAST_TEXT", "");
        }, 2500);
      }
    }
  },
  mounted() {
    this.timer = setTimeout(() => {
      this.$store.commit("SET_TOAST_TEXT", "");
    }, 2500);
  }
};
</script>
