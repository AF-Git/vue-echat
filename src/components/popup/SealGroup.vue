<template>
  <Popup :title="$t('msg.tip.tip')" :hideClose="true">
    <div class="seal" slot="body">
      <div class="text">{{ tip }}</div>
      <button class="btn" @click="confirm">
        {{ $t("msg.common.confirm") }}
      </button>
    </div>
  </Popup>
</template>

<script>
export default {
  name: 'LoginFail',
  data() {
    return {
    }
  },
  computed: {
    tip() {
      return this.$store.state.layout.child;
    }
  },
  methods: {
    confirm() {
      this.$store.dispatch("setLayout", ["", "", false]);
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../assets/css/var';

.seal {
  width: 315px;
  padding: 15px;
  text-align: center;
  .text{
    padding: 5px 15px 25px;
  }
  .btn {
    display: inline-block;
    width: 74px;
    height: 34px;
    border-radius:5px;
    font-size: 14px;
    text-align: center;
    line-height: 100%;
    color: #fff;
    background-color: $color-theme;
  }
}
</style>