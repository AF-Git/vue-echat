<template>
  <div
    class="select-box"
    :style="{ width: width + 'px' }"
    @click.stop="hideOther"
  >
    <p class="title">{{ value }}</p>
    <span
      class="triangle"
      :class="{ active: showBox }"
      :style="{ top: (height - 10) / 2 + 'px' }"
    ></span>
    <transition name="drop">
      <ul
        class="select-list"
        :style="{ top: height + 'px', 'line-height': height - 4 + 'px' }"
        @click.stop=";"
        v-if="showBox"
        v-scrollBar
      >
        <li
          class="list-item"
          :class="{ active: value == item.name }"
          v-for="(item, index) in selectList"
          :key="index"
          @click="selected(item)"
        >
          {{ item.name }}
        </li>
      </ul>
    </transition>
  </div>
</template>

<script>
export default {
  name: "echat-select",
  data() {
    return {
      showBox: false
    };
  },
  props: {
    value: {
      type: String | Number
    },
    title: {
      type: String
    },
    width: {
      type: String
    },
    height: {
      default: "26",
      type: String
    },
    list: {
      type: Array
    }
  },
  computed: {
    selectList() {
      return this.list;
    }
  },
  methods: {
    hideOther(){
      if(this.showBox){
        this.$emit("hideOther", '');
      }
      else{
        this.$emit("hideOther", '');
        this.showBox = !this.showBox
      } 
    },
    selected(item) {
      this.showBox = false;
      this.$emit("change", item);
    }
  },
  mounted() {
    window.addEventListener("click", event => {
      this.showBox = false;
    });
  },
  beforeDestroy() {
    window.removeEventListener("click", event => {
      this.showBox = false;
    });
  }
};
</script>

<style lang="scss" scoped>
@import "../../assets/css/var";

.select-box {
  position: relative;
  height: 26px;
  padding: 0 8px;
  line-height: 24px;
  border-radius: 3px;
  border: 1px solid $border-color;
  text-align: left;
  cursor: pointer;

  .title {
    padding-right: 15px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .select-list {
    position: absolute;
    left: 0;
    z-index: 9;
    width: 100%;
    max-height: 120px;
    padding: 5px 0;
    border-radius: 3px;
    box-shadow: 0 2px 8px #ccc;
    background-color: #fff;
    .list-item {
      padding: 0 8px;
      cursor: pointer;
      &:hover,
      &.active {
        background-color: $backgroup-color;
      }
    }
  }
  .triangle {
    position: absolute;
    right: 8px;
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-bottom: 8px solid #bbb;
    &.active {
      border-bottom: none;
      border-top: 8px solid #bbb;
    }
  }
}
</style>
