<template>
  <div class="circle-bar">
    <div class="left" :style="{transform: 'rotate('+ (progress >= 180 ? progress - 180 : 0) +'deg)'}"></div>
    <div class="right" :class="{active: progress > 180}" :style="{transform: 'rotate('+ (180 >= progress ? progress : 0) +'deg)'}"></div>
  </div>
</template>
<script>
  export default {
    data() {
      return {
      }
    },
    props: {
      value: {
        type: String | Number
      }
    },
    computed:{
      progress(){
        if(this.value < 0){
          return 0;
        } 
        return this.value * 3.6;
      }
    }
  }
</script>
<style lang="scss" scoped>
@import '../../assets/css/var';

.circle-bar {
  position: relative;
	width: 60px;
  height: 60px; 
  border-radius: 50%;  
  background-color: $color-theme;
  .left, .right{
    width: 60px; 
    height: 60px; 
    border-radius: 50%;
    background-color: $backgroup-color;
  }
  .left { 
    clip:rect(0, 30px, auto, 0);
  }
  .right { 
    clip:rect(0, auto, auto, 30px); 
    &.active{
      background-color: $color-theme;
    }
  }
}

.circle-bar * {  
  position: absolute; 
  top:0; 
  right:0; 
  bottom:0; 
  left:0; 
  margin:auto; 
}

</style>
