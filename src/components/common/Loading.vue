<template>
<div class="loading-box">
  <div class="container animation-6">
    <div class="shape shape1"></div>
    <div class="shape shape2"></div>
    <div class="shape shape3"></div>
    <div class="shape shape4"></div>
  </div>
</div>
</template>

<script>
	export default {
    name: 'loading',
    data (){
			return {
			}
		}
	}
</script>

<style lang="scss" scoped>
@import '../../assets/css/var';

.loading-box {
  position: absolute;
	top: 0;
  left: 0;
  z-index: 99;
	width: 100%;
	height: 100%;	
  background-color: inherit;
}

.container {
  position: relative;
  top: 30px;
  left: 50%;
  margin-left: -15px;
  width: 30px;
  height: 30px;
  opacity: 0.8;
  animation: rotation 1s infinite;
  .shape {
    position: absolute;
    width: 12px;
    height: 12px;
    border-radius: 2px;
  }
  .shape1 {
    left: 0;
    background-color: #afd1ee;
  }
  .shape2 {
    right: 0;
    background-color: #509ef5;
  }
  .shape3 {
    bottom: 0;
    background-color: #38acff;
  }
  .shape4 {
    bottom: 0;
    right: 0;
    background-color: #48d7d5;
  }
}
.animation-6 .shape1 {
  -webkit-animation: animation6shape1 2s linear 0s infinite normal;
  animation: animation6shape1 2s linear 0s infinite normal;
}

@-webkit-keyframes rotation {
  0% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }

  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}

@keyframes rotation {
  0% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }

  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}

@-webkit-keyframes animation6shape1 {
  0% {
    -webkit-transform: translate(0, 0);
            transform: translate(0, 0);
  }
  25% {
    -webkit-transform: translate(0, 18px);
            transform: translate(0, 18px);
  }
  50% {
    -webkit-transform: translate(18px, 18px);
            transform: translate(18px, 18px);
  }
  75% {
    -webkit-transform: translate(18px, 0);
            transform: translate(18px, 0);
  }
}

@keyframes animation6shape1 {
  0% {
    -webkit-transform: translate(0, 0);
            transform: translate(0, 0);
  }
  25% {
    -webkit-transform: translate(0, 18px);
            transform: translate(0, 18px);
  }
  50% {
    -webkit-transform: translate(18px, 18px);
            transform: translate(18px, 18px);
  }
  75% {
    -webkit-transform: translate(18px, 0);
            transform: translate(18px, 0);
  }
}

.animation-6 .shape2 {
  -webkit-animation: animation6shape2 2s linear 0s infinite normal;
          animation: animation6shape2 2s linear 0s infinite normal;
}

@-webkit-keyframes animation6shape2 {
  0% {
    -webkit-transform: translate(0, 0);
            transform: translate(0, 0);
  }
  25% {
    -webkit-transform: translate(-18px, 0);
            transform: translate(-18px, 0);
  }
  50% {
    -webkit-transform: translate(-18px, 18px);
            transform: translate(-18px, 18px);
  }
  75% {
    -webkit-transform: translate(0, 18px);
            transform: translate(0, 18px);
  }
}

@keyframes animation6shape2 {
  0% {
    -webkit-transform: translate(0, 0);
            transform: translate(0, 0);
  }
  25% {
    -webkit-transform: translate(-18px, 0);
            transform: translate(-18px, 0);
  }
  50% {
    -webkit-transform: translate(-18px, 18px);
            transform: translate(-18px, 18px);
  }
  75% {
    -webkit-transform: translate(0, 18px);
            transform: translate(0, 18px);
  }
}
.animation-6 .shape3 {
  -webkit-animation: animation6shape3 2s linear 0s infinite normal;
          animation: animation6shape3 2s linear 0s infinite normal;
}

@-webkit-keyframes animation6shape3 {
  0% {
    -webkit-transform: translate(0, 0);
            transform: translate(0, 0);
  }
  25% {
    -webkit-transform: translate(18px, 0);
            transform: translate(18px, 0);
  }
  50% {
    -webkit-transform: translate(18px, -18px);
            transform: translate(18px, -18px);
  }
  75% {
    -webkit-transform: translate(0, -18px);
            transform: translate(0, -18px);
  }
}

@keyframes animation6shape3 {
  0% {
    -webkit-transform: translate(0, 0);
            transform: translate(0, 0);
  }
  25% {
    -webkit-transform: translate(18px, 0);
            transform: translate(18px, 0);
  }
  50% {
    -webkit-transform: translate(18px, -18px);
            transform: translate(18px, -18px);
  }
  75% {
    -webkit-transform: translate(0, -18px);
            transform: translate(0, -18px);
  }
}
.animation-6 .shape4 {
  -webkit-animation: animation6shape4 2s linear 0s infinite normal;
          animation: animation6shape4 2s linear 0s infinite normal;
}

@-webkit-keyframes animation6shape4 {
  0% {
    -webkit-transform: translate(0, 0);
            transform: translate(0, 0);
  }
  25% {
    -webkit-transform: translate(0, -18px);
            transform: translate(0, -18px);
  }
  50% {
    -webkit-transform: translate(-18px, -18px);
            transform: translate(-18px, -18px);
  }
  75% {
    -webkit-transform: translate(-18px, 0);
            transform: translate(-18px, 0);
  }
}

@keyframes animation6shape4 {
  0% {
    -webkit-transform: translate(0, 0);
            transform: translate(0, 0);
  }
  25% {
    -webkit-transform: translate(0, -18px);
            transform: translate(0, -18px);
  }
  50% {
    -webkit-transform: translate(-18px, -18px);
            transform: translate(-18px, -18px);
  }
  75% {
    -webkit-transform: translate(-18px, 0);
            transform: translate(-18px, 0);
  }
}
</style>