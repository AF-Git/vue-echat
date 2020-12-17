<template>
  <transition name="scale-x">
    <Popup :title="$t('msg.menu.addFriend')">
      <div class="add-friend" slot="body">
        <div class="display-flex">
          <div class="search-box">
            <div class="search-input">
              <input
                type="text"
                :placeholder="$t('msg.tip.echatId')"
                v-model="echatId"
                @keyup.enter="doSearch()"
              />
              <i
                class="icon-delete"
                @click="echatId = ''"
                v-show="echatId"
              ></i>
            </div>
          </div>
          <button class="search-btn" @click="doSearch()">
            {{ $t("msg.menu.search") }}
          </button>
        </div>
        <ul class="session-list" v-scrollBar>
          <li
            class="session-list-item display-flex"
            v-for="(item, index) in searchList"
            :key="index"
          >
            <div class="item-left">
              <img class="avatar" :src="global.fileDownUrl + 'compress/' + item.avatar" v-headError />
            </div>
            <div class="item-right display-flex-item">
              <p class="name" v-text="item.nickName"></p>
              <p class="display-flex">{{ $t("msg.user.note") }}</p>
              <input
                type="text"
                ref="notes"
                maxlength="20"
                :placeholder="$t('msg.user.clickNote')"
                @change="setNotes($event, item)"
              />
              <p v-text="'EchatAPP ID：' + item.userId"></p>
            </div>
            <button type="button" class="add-btn" @click="addFriend(item)">
              {{ $t("msg.menu.addFriend") }}
            </button>
          </li>
        </ul>
        <EditPopup 
          v-model="showRemark"
          :title="$t('msg.menu.addFriend')"
          :placeholderText="$t('msg.tip.verifyInfo1')" 
          @change="doAddFriend" 
          v-if="showRemark"
        ></EditPopup>
      </div>
    </Popup>
  </transition>
</template>
<script>
export default {
  name: "add-friend",
  data() {
    return {
      isShow: false,
      showRemark: false,
      searchList: [],
      tempHeadImg: "./static/images/chat/img-username.png",
      echatId: "",
      tempItem: null
    };
  },
  methods: {
    show() {
      this.searchList = [];
      this.send = {
        userName: "",
        subtitle: ""
      };
    },
    hide() {
      this.$emit("input", 0);
    },
    isFriend(id) {
      if (
        this.$store.state.friendList[id] &&
        !this.$store.state.friendList[id].temp
      ) {
        return this.$store.state.friendList[id];
      } else {
        return false;
      }
    },
    doSearch() {
      if (this.echatId == "") {
        this.searchList = [];
        this.$store.commit("SET_TOAST_TEXT", this.$t("msg.tip.echatId"));
        return false;
      }
      //判断查询账号
      if (this.echatId == this.$store.state.userInfo.userId) {
        this.$store.commit("SET_TOAST_TEXT", this.$t("msg.tip.notAdd"));
        return false;
      }
      if (this.isFriend(this.echatId)) {
        this.$store.commit(
          "SET_TOAST_TEXT",
          this.echatId + this.$t("msg.tip.isFriend")
        );
        return false;
      }
      //查找好友
      this.$http.searchInfo({ ids: this.echatId }).then(
        data => {
          data.forEach(item => {
            if (item.avatar) {
              item.avatar =  item.avatar;
            } else {
              item.avatar = this.tempHeadImg;
            }
            if (!item.nickName) item.nickName = item.userId;
            item.notes = "";
          });
          this.searchList = data;
        },
        data => {
          if (data) {
            this.$store.commit("SET_TOAST_TEXT", data);
          }
          this.searchList = [];
        }
      );
    },
    setNotes(ev, item) {
      if (
        ev.target.value &&
        ev.target.value.replace(/(&nbsp;*)|(\s*)/g, "").length == 0
      ) {
        ev.target.value = "";
        return;
      }
      item.notes = ev.target.value;
    },
    //添加到通讯录
    addFriend(item) {
      this.tempItem = item;
      this.showRemark = true;
    },
    doAddFriend(text) {
      var postData = {
        recipient: this.tempItem.userId,
        subtitle: text,
        notes: this.tempItem.notes,
        source: "1"
      };

      this.showRemark = false;
      this.$http.addFriend(postData);
    }
  },
  mounted() {
    this.show();
  }
};
</script>

<style lang="scss" scoped>
@import "../../assets/css/var";
//添加好友弹窗
.add-friend {
  width: 425px;
  height: 255px;
  overflow: hidden;

  .session-list {
    height: calc(100% - 105px);
    border-top: 20px solid $border-color;
    .session-list-item {
      height: 102px;
      border-bottom: 1px solid $border-color;
      .item-right {
        text-align: left;
        margin-left: 10px;
        .name {
          max-width: 250px;
        }
      }
      .item-left {
        margin: 0 3px 0 18px;
      }
      .add-btn {
        height: 34px;
        margin: 0 15px;
        padding: 0 8px;
        line-height: 34px;
        background: $color-theme;
        color: #fff;
        border-radius: 4px;
        font-size: 13px;
        &:hover {
          background: $color-theme-active;
        }
      }
    }
  }
}
</style>
