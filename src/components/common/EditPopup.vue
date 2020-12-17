<template>
  <transition name="scale-x">
    <div class="my-popup edit-input" @click.stop="">
      <div class="my-popup-content">
        <h3 class="my-popup-title">
          {{ title }}
        </h3>
        <span class="my-popup-close" @click="$emit('input', false)"></span>
        <div class="display-flex">
          <div class="search-box">
            <div class="search-input">
              <input
                type="text"
                :placeholder="placeholderText"
                maxlength="20"
                v-model="text"
              />
              <i class="icon-delete" @click="text = ''" v-show="text"></i>
            </div>
          </div> 
          <button class="search-btn" @click="comfirm()">
            {{ $t("msg.common.confirm") }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
  export default {
    name: "EditPopue",
    data() {
      return {
        text: "",
      };
    },
    props: {
      value: {
        type: Boolean
      },
      title: {
        type: String
      },
      defaultText: {
        type: String
      },
      placeholderText: {
        type: String
      }
    },
    methods: {
      comfirm() {
        this.$emit("change", this.text);
      }
    },
    mounted() {
      this.text = this.defaultText;
    }
  };
</script>

<style lang="scss" scoped>
@import "../../assets/css/var";

.edit-input {
  .my-popup-content {
    width: 415px;
    padding-bottom: 10px;
  }
}
</style>
