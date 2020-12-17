<template>
  <transition name="drop-bottom">
    <!-- <div class="at-box"
      v-show="value.show"
      :style="{
        top:
          value.top -
          (value.list.length > 5 ? 6 : value.list.length) * 36 - 82 -
          (value.showAll && value.list.length < 6 ? 36 : 0) +
          (value.hasMyself && value.list.length < 6 ? 36 : 0) +
          'px',
        left: value.left + 'px'
      }"
    > -->
    <div class="at-box" v-show="value.show">
      <div class="title">{{ $t('msg.chatPanel.selectAt') }}</div>
      <ul class="at-box-list" v-scrollBar>
        <a
          class="list-wrap"
          href="javascript: ;"
          @click="selectAtItem({ nickName: $t('msg.msgPanel.allMembers') })"
        >
          <li class="at-box-item all" v-show="value.showAll">
            <img
              class="at-box-item-head"
              src="../../assets/images/chat/img-qun.png"
              alt=""
            />
            <span>@{{ $t("msg.msgPanel.allMembers") }}</span>
          </li>
        </a>
        <a
          class="list-wrap"
          href="javascript: ;"
          v-for="(item, index) in value.list"
          :key="index"
          @click="selectAtItem(item)"
        >
          <li class="at-box-item" v-if="userId != item.userId">
            <img class="at-box-item-head" :src="global.fileDownUrl + 'compress/' +item.headImg" v-headError />
            <span>{{ item.nickName ? item.nickName : item.userName }}</span>
          </li>
        </a>
      </ul>
    </div>
  </transition>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "at-box",
  data() {
    return {
      showEnter: false
    };
  },
  props: {
    value: {
      type: Object
    }
  },
  computed: {
    ...mapGetters(["userId"])
  },
  methods: {
    selectAtItem(item) {
      this.$emit("change", item);
    }
  },
  mounted() {
    window.addEventListener("click", event => {
      this.showEnter = false;
    });
  }
};
</script>

<style lang="scss" scoped>
@import "../../assets/css/var";

.at-box {
  position: absolute;
  bottom: 100%;
  left: 60px;
  margin-bottom: 2px;
  z-index: 100;
  width: 250px;
  max-height: 257px;
  padding-bottom: 5px;
  background-color: #fff;
  border-radius: 5px;
  box-shadow: 0 0 5px 0 rgba(0, 0, 0, 0.2);
  font-size: 14px;
  line-height: 36px;
  overflow: hidden;
  .title {
    padding-left: 15px;
    font-size: 16px;
    border-bottom: 1px solid $border-color;
  }
  .at-box-list {
    position: relative;
    max-height: 216px;
  }
  .list-wrap {
    color: #2c2c2c;
    cursor: pointer;
    text-decoration: none;
  }
  .at-box-item {
    height: 36px;
    vertical-align: middle;
    word-break: keep-all;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    &:hover {
      background-color: $backgroup-color;
    }
    .at-box-item-head {
      width: 28px;
      height: 28px;
      margin: -1px 8px 0 15px;
      border-radius: 50%;
      object-fit: cover;
    }
    &.all {
      color: $color-theme;
      .at-box-item-head {
        border-radius: 0;
        object-fit: contain;
      }
    }
  }
}
</style>
