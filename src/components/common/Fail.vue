<template>
  <transition name="pop">
    <div class="my-popup" v-if="value">
      <div class="my-popup-content fail">
        <img class="img" src="../../assets/images/chat/fail.png">
        <p>{{title}}</p>
      </div>
    </div>
  </transition>
</template>

<script>
	export default {
    name: 'loading',
    data (){
			return {
			}
    },
    props: {
      value: {
        type: Boolean
      },
      title: {
        type: String
      }
    },
    mounted(){
      setTimeout(() => {
        this.$emit('input', false)
      }, 1500)
    }
	}
</script>

<style lang="scss" scoped>
@import '../../assets/css/var';

.fail{
  width: 220px;
  height: 220px;
  .img{
    width: 92px;
    height: 92px;
    margin: 40px 0 20px;
  }
}
</style>