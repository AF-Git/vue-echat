<template>
  <div class="read-num display-flex">
    <img
      class="read-avatar"
      :src="global.fileDownUrl + 'compress/' + lastGroupMsg.avatar"
      @click.stop="showReaded"
      v-headError
      ondragstart="return false"
    />
    <div>{{ lastGroupMsg.readNum > 99 ? "99+" : lastGroupMsg.readNum }}</div>
    <transition name="drop-bottom">
      <div class="readed-box" v-if="showReadedBox" @click.stop="">
        <div class="readed-header">
          {{ $t("msg.groupInfo.memberRead") + lastGroupMsg.readNum }}
        </div>
        <div class="readed-content">
          <ul
            class="readed-list"
            ref="readed"
            @ps-y-reach-start="loadMore"
            v-scrollBar
            v-if="!showLoading"
          >
            <div
              class="no-more"
              v-if="loadFlag == 3 && readedMembers.length > 8"
            >
              <span class="text">{{ $t("msg.groupInfo.loadAll") }}</span>
            </div>
            <li
              class="readed-list-item display-flex"
              v-for="(item, index) in readedMembers"
              :key="index"
            >
              <div class="display-flex-item display-flex">
                <img class="avatar" :src="global.fileDownUrl + 'compress/' + item.avatar" />
                <span class="display-flex-item">{{ item.nickName }}</span>
              </div>
              <div class="time">{{ item.createTime | timeFilter4 }}</div>
            </li>
          </ul>
          <loading v-if="showLoading"></loading>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "group-read",
  data() {
    return {
      showReadedBox: false,
      showLoading: true,
      loadFlag: 1, // 1 加载更多 2 加载中  3 没有更多了
      readedPageNum: 1,
      readedMembers: [],
      readedScrollTop: 0
    };
  },
  computed: {
    ...mapGetters(["currentSession", "lastGroupMsg"])
  },
  methods: {
    showReaded() {
      if (this.showReadedBox) {
        this.showReadedBox = false;
        return false;
      }
      this.showReadedBox = true;
      this.readedMembers = [];
      this.readedPageNum = 1;
      this.loadFlag = 2;
      this.getReadedList();
    },
    loadMore() {
      if (this.loadFlag == 2 || this.loadFlag == 3) return;
      this.readedScrollTop = this.$refs.readed.scrollHeight;
      this.getReadedList();
    },
    getReadedList() {
      this.showLoading = true;
      this.loadFlag = 2;

      let obj = {
        groupId: this.currentSession.paramId,
        msgId: this.lastGroupMsg.msgId,
        pageNum: this.readedPageNum,
        pageSize: 30
      };
      this.$http.getReadedList(obj).then(data => {
        let arr = this.readedMembers;
        arr = arr.concat(data.list);
        this.readedMembers = arr;
        this.showLoading = false;
        this.readedPageNum++;

        if (data.isLastPage) {
          this.loadFlag = 3;
        } else {
          this.loadFlag = 1;
        }

        if (this.readedPageNum == 1) {
          let lastObj = lastGroupMsg;
          lastObj.readNum = data.total;
          this.$store.commit("SET_UNREAD_NUMBER", lastObj);
        }

        setTimeout(() => {
          this.$refs.readed.scrollTop =
            this.$refs.readed.scrollHeight - this.readedScrollTop;
        }, 100);
      });
    }
  },
  mounted() {
    window.addEventListener("click", () => {
      this.showReadedBox = false;
    });
  },
  beforeDestroy () {
    window.removeEventListener("click", () => {
      this.showReadedBox = false;
    });
  }
};
</script>

<style lang="scss" scoped>
@import "../../assets/css/var";
.read-num {
  position: relative;
  float: right;
  margin-top: 5px;
  font-size: 12px;
  color: #3d4975;
  cursor: pointer;
  .read-avatar {
    width: 20px;
    height: 20px;
    margin-right: 5px;
    border-radius: 50%;
    object-fit: cover;
  }
}
.readed-box {
  position: absolute;
  bottom: 32px;
  right: 0;
  width: 260px;
  height: 318px;
  border-radius: 5px;
  background-color: #3a3a3a;
  color: #fff;

  &::after {
    content: "";
    position: absolute;
    bottom: -12px;
    right: 12px;
    width: 0;
    height: 0;
    margin-left: -11px;
    border-left: 11px solid transparent;
    border-right: 11px solid transparent;
    border-top: 12px solid #3a3a3a;
  }
  .readed-header {
    height: 38px;
    padding: 0 15px;
    line-height: 38px;
    font-size: 16px;
    border-bottom: 1px solid $border-color;
  }
  .readed-content {
    position: relative;
  }
  .readed-list {
    position: relative;
    height: 278px;
    padding: 0 15px;
    .readed-list-item {
      margin-top: 8px;
      .avatar {
        width: 28px;
        height: 28px;
        margin: 0 12px 0 0;
        border-radius: 50%;
        object-fit: cover;
      }
    }
    .display-flex-item {
      white-space: nowrap;
    }
    .time {
      margin-left: 12px;
    }
  }
}
</style>
