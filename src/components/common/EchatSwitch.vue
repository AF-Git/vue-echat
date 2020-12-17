<template>
  <label class="display-flex echat-switch">
    <span :class="['echat-switch-core', value == '1' ? 'active' : '']"></span>
  </label>
</template>
<script>
  export default {
    data() {
      return {

      }
    },
    methods: {

    },
    props: {
      value: {
        type: String | Boolean
      }
    },
  }
</script>
<style lang="scss" scoped>
@import '../../assets/css/var';

.echat-switch-core {
  display: block;
  position: relative;
  width: 46px;
  height: 23px;
  border: 1px solid #d9d9d9;
  border-radius: 12px;
  background: #f0f0f0;
  cursor: pointer;
  &.active{
    border-color: $color-theme;
    background-color: $color-theme;
    &::before{
      -webkit-transform: translate(100%, 0);
      transform: translate(100%, 0);border: 0;
    }
  }
  &::before{
    content: '';
    display: block;
    width: 23px;
    height: 23px;
    border-radius: 12px;
    background-color: #fff;
    border: 1px solid #d9d9d9;
    box-sizing: border-box;
  }
}
</style>
