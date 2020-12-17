<template>
  <transition name="scale-x">
    <div
      class="my-popup forbidden-box"
      @click="showBox = false"
      v-show="showBox"
    >
      <div
        class="my-popup-content forbidden"
        @click.stop=""
        v-if="!showAddForbidden"
      >
        <span class="my-popup-close" @click="showBox = false"></span>
        <h3 class="my-popup-title">{{ $t("msg.chatSetting.moreSetting") }}</h3>
        <ul class="setting-list">
          <li class="title">{{ $t("msg.forbidden.permission") }}</li>
          <li class="list-item display-flex">
            <span
              class="icon"
              :class="{ selected: isForbiddenAll }"
              @click="forbiddenAll"
            ></span>
            <div class="display-flex-item">
              <p class="label">{{ $t("msg.forbidden.forbiddenAll") }}</p>
              <p class="text">{{ $t("msg.forbidden.info") }}</p>
              <div
                class="display-flex forbidden-more"
                @click.stop="addForbidden"
              >
                <span class="icon more"></span>
                <span class="display-flex-item">{{
                  $t("msg.forbidden.setForbidden")
                }}</span>
                <span class="icon-right"></span>
              </div>
              <div class="forbidden-list" v-scrollBar>
                <ul v-if="!isForbiddenAll">
                  <li
                    class="display-flex list-item"
                    :class="{ hide: item.isAdmin > 0 }"
                    v-for="(item, index) in memberList"
                    :key="index"
                  >
                    <span
                      class="delete-icon"
                      @click="unforbiddenOne(item)"
                    ></span>
                    <div class="display-flex-item display-flex info">
                      <img class="avatar" :src="global.fileDownUrl + 'compress/' + item.headImg" v-headError />
                      <span class="flex-item-nowrap">{{ item.nickName }}</span>
                    </div>
                  </li>
                </ul>
                <div
                  class="no-more"
                  v-if="memberList.length < 1 && !isForbiddenAll"
                >
                  {{ $t("msg.forbidden.noneForbidden") }}
                </div>
                <div class="no-more" v-if="isForbiddenAll">
                  {{ $t("msg.forbidden.openForbidden") }}
                </div>
              </div>
            </div>
          </li>
          <li class="list-item display-flex">
            <span
              class="icon"
              :class="{ selected: isForbidTemp }"
              @click="groupSetting('temp')"
            ></span>
            <div class="display-flex-item">
              <p class="label">{{ $t("msg.forbidden.banedTemp") }}</p>
              <p class="text">{{ $t("msg.forbidden.banedTempInfo") }}</p>
            </div>
          </li>
          <li class="list-item display-flex">
            <span
              class="icon"
              :class="{ selected: isForbidFriend }"
              @click="groupSetting('friend')"
            ></span>
            <div class="display-flex-item">
              <p class="label">{{ $t("msg.forbidden.banedAddFriend") }}</p>
              <p class="text">{{ $t("msg.forbidden.banedAddFriendInfo") }}</p>
            </div>
          </li>
        </ul>
      </div>
      <div class="my-popup-content" @click.stop="" v-else>
        <div class="invite-header display-flex">
          <span class="go-back" @click="showAddForbidden = false" v-if="$i18n.locale == 'my'">&nbsp;</span>
          <span class="go-back" @click="showAddForbidden = false" v-else>{{
            $t("msg.common.back")
          }}</span>
          <span>{{ $t("msg.forbidden.setForbidden") }}</span>
          <span class="finish" @click="addFinish">{{
            $t("msg.common.complete")
          }}</span>
        </div>
        <div class="search-box">
          <div class="search-input">
            <input
              type="text"
              :placeholder="$t('msg.menu.search')"
              maxlength="20"
              v-model="keyword"
            />
            <i class="icon-delete" @click="keyword = ''" v-show="keyword"></i>
          </div>
        </div>
        <div class="selected-list" v-scrollBar>
          <ul class="display-flex">
            <li
              class="forward-list-item"
              v-for="(item, index) in selectList"
              :key="index"
            >
              <div class="item-selected" :class="{ active: item.isClick }">
                <div class="left">
                  <span class="delete-icon" @click="deleteChecked(item)"></span>
                  <img class="avatar" :src="global.fileDownUrl + 'compress/' + item.headImg" v-headError />
                </div>
                <span
                  class="name"
                  v-text="item.nickName"
                  @click="item.isClick = !item.isClick"
                ></span>
              </div>
            </li>
          </ul>
        </div>
        <div class="unselected-list">
          <ul class="friend-list" v-scrollBar>
            <li
              class="friend-list-item display-flex"
              :class="{ active: item.checked, hide: item.temp }"
              v-for="(item, index) in unSelectList"
              :key="index"
              @click="clickChecked(item)"
            >
              <div class="item-left">
                <img
                  class="avatar"
                  :class="{ active: item.checked }"
                  :src="global.fileDownUrl + 'compress/' + item.headImg"
                  v-headError
                />
                <span class="select" v-if="item.checked"></span>
                <span :class="{manager: item.isAdmin == 2, owner: item.isAdmin == 1}"></span>
                <span
                  class="disable"
                  v-if="item.isBanned==1"
                ></span>
              </div>
              <div class="display-flex flex-item-nowrap">
                <span class="nickname">{{ item.notes || item.nickName }}</span>
                <span class="orange" v-if="item.isAdmin == 1">&nbsp;{{ $i18n.locale == "zh_CN" ? "群主" : "GH"}}</span>
                <span class="green" v-if="item.isAdmin == 2">&nbsp;{{ $i18n.locale == "zh_CN" ? "管理员" : "GA"}}</span>
              </div>
            </li>
          </ul>
        </div>
        <success
          v-model="showSuccess"
          title="$t('msg.forbidden.addSuccess')"
        ></success>
      </div>
    </div>
  </transition>
</template>
<script>
import Vue from "vue";
import { mapGetters } from "vuex";
import Msg from "@/tools/msg";
import { EchatDB } from "@/tools/indexedDB";
import { group } from "@/session/group";
import { api } from "@/api";

export default {
  name: "forward",
  data() {
    return {
      showBox: false,
      showAddForbidden: false,
      isForbiddenAll: false,
      isForbidFriend: false,
      isForbidTemp: false,
      groupMember: {},
      keyword: "",
      forwardResult: {},
      selectList: {},
      tempHeadImg: "./static/images/chat/img-username.png",
      showSuccess: false
    };
  },
  computed: {
    ...mapGetters(["userId","currentSession"]),
    memberList() {
      let list = [];
      for (let key in this.groupMember) {
        if (this.groupMember[key].isBanned) {
          list.push(this.groupMember[key]);
        }
      }
      return list;
    },
    unSelectList() {
      if (!this.keyword) {
        let list = Object.values(this.groupMember);
        for (var i = 0; i < list.length; i++) {
          if (list[i].isAdmin == 1) {
            list[i].sort = 2;
          } else if (list[i].isAdmin == 2) {
            list[i].sort = 1;
          } else {
            list[i].sort = 0;
          }
        }
        let sortlist = list.sort((a, b) => b.sort - a.sort);

        return sortlist;
      } else {
        let list = [];
        for (let key in this.groupMember) {
          if (this.groupMember[key].nickName.indexOf(this.keyword) >= 0) {
            list.push(this.groupMember[key]);
          }
        }
        return list;
      }
    }
  },
  methods: {
    show() {

      api.getGroupSetting({groupId:this.currentSession.paramId}).then(data=>{
        if(data){
          if (data.isBanned == 1) {
            this.isForbiddenAll = true;
          }
          if (data.isFriend == "1") {
            this.isForbidFriend = true;
          }
          if (data.isForbidChat == "1") {
            this.isForbidTemp = true;
          }
          //更新群信息
          group.updateGroupInfo(data);
          this.$store.state.groupList[data.groupId]=JSON.parse(JSON.stringify(data));
          let sessionCache=this.$store.state.session.record[this.currentSession.paramId+'-'+this.currentSession.fromType];
          sessionCache.isTop=data.isTop;
          sessionCache.isInterruption=data.isInterruption;
          sessionCache.isShowMemberNick=data.isShowMemberNick;
          if(data.isBanned){
              sessionCache.isBanned=1
          }else{
            if(data.userIsBanned){
              sessionCache.isBanned=2
            }else{
              sessionCache.isBanned=0
            }
          }
          //判断自己在本群的角色
          let self=this.$store.state.activityGroupMembers[this.userId];
          if(!self){
            self={};
          }
          if(self.isAdmin>0){
            sessionCache.isBanned=0;
          }
          sessionCache.isFriend=data.isFriend;
          sessionCache.isForbidChat=data.isForbidChat;
          this.$store.commit("UPDATE_CURRENT_SESSION", JSON.parse(JSON.stringify(sessionCache)));
        }
      })
      this.showAddForbidden = false;
      this.selectList = {};
      this.showBox = true;

      let list = JSON.parse(
        JSON.stringify(
          this.$store.state.activityGroupMembers
        )
      );
      for (let key in list) {
        list[key].checked = false;
        list[key].isClick = false;
      }
      this.groupMember = list;
    },
    forbiddenAll() {
      this.$message({
        title: this.$t("msg.forbidden.forbiddenAll"),
        message:
          this.$t("msg.forbidden.confirm") +
          `${
            this.isForbiddenAll
              ? this.$t("msg.msgPanel.cancel")
              : this.$t("msg.msgPanel.open")
          }` +
          this.$t("msg.forbidden.forbiddenAll") +
          "?",
        confirmButtonText: this.$t("msg.common.confirm"),
        cancelButtonText: this.$t("msg.common.cancel")
      }).then(
        data => {
          this.$http.forbiddenWord({
              Type: this.isForbiddenAll ? 2 : 1,
              groupId: this.currentSession.paramId,
              userIds: ""
            }).then(() => {
              this.isForbiddenAll = !this.isForbiddenAll;
            });
        },
        data => {}
      );
    },
    addForbidden() {
      if (this.isForbiddenAll) {
        this.$store.commit(
          "SET_TOAST_TEXT",
          this.$t("msg.forbidden.cancelForbidden")
        );
        return;
      }
      this.showAddForbidden = true;
    },
    clickChecked(item) {
      if (item.isAdmin > 0 || item.isBanned) return;

      if (!item.checked) {
        this.$set(this.selectList, item.userId, item);
        item.checked = true;
      } else {
        this.deleteChecked(item);
        item.checked = false;
      }
    },
    deleteChecked(item) {
      this.$delete(this.selectList, item.userId);
      if (this.groupMember[item.userId]) {
        this.groupMember[item.userId].checked = false;
      }
    },
    getCheckedArr(list) {
      var result = "";
      if (list) {
        for (var key in list) {
          result += list[key].paramId + ",";
        }
        result = result.substr(0, result.length - 1);
      } else {
        result = "";
      }
      return result;
    },
    unforbiddenOne(item) {
      item.isBanned = 0;
      let idStr = "";

      for (let key in this.groupMember) {
        if (this.groupMember[key].isBanned) {
          idStr = idStr + this.groupMember[key].userId + ",";
        }
      }

      this.forbiddenOne(idStr.replace(/,$/, ""));
    },
    addFinish(item) {
      item.isBanned = 0;
      let idStr = "";

      for (let key in this.groupMember) {
        if (this.groupMember[key].isBanned || this.groupMember[key].checked) {
          idStr = idStr + this.groupMember[key].userId + ",";
        }
      }

      this.forbiddenOne(idStr.replace(/,$/, ""));
    },
    forbiddenOne(str) {
      this.$http.forbiddenWord({
          Type: 3,
          groupId: this.currentSession.paramId,
          userIds: str
        })
        .then(data => {
          this.$store.commit("SET_TOAST_TEXT", data);

          for (let key in this.groupMember) {
            if (this.groupMember[key].checked) {
              this.groupMember[key].isBanned = 1;
              this.groupMember[key].checked = false;
            }
          }


          this.$store.commit("SET_GROUP_MEMBER", this.groupMember);
          group.updateGroupMember(this.groupMember);

          this.showAddForbidden = false;
        });
    },
    groupSetting(type) {
      let confString = "";
      if (type == "temp") {
        console.log(this.currentSession)
        confString = {
          isForbidChat: this.currentSession.isForbidChat == 1 ? 0 : 1
        };
        let obj = {
          groupId: this.currentSession.paramId,
          confString: JSON.stringify(confString)
        };

        this.$message({
          title: this.$t("msg.forbidden.banedTemp"),
          message:
            this.$t("msg.forbidden.confirm") +
            (this.currentSession.isForbidChat == 1
              ? this.$t("msg.msgPanel.cancel")
              : this.$t("msg.msgPanel.open")) +
            this.$t("msg.forbidden.banedTemp") +
            "？",
          confirmButtonText: this.$t("msg.common.confirm"),
          cancelButtonText: this.$t("msg.common.cancel")
        }).then(
          () => {
            this.$http.setGroupSetting(obj).then(
              () => {
                this.settingHandler(type);
              },
              () => {}
            );
          },
          () => {}
        );
      } else if (type == "friend") {
        confString = { isFriend: this.currentSession.isFriend == 1 ? 0 : 1 };
        let obj = {
          groupId: this.currentSession.paramId,
          confString: JSON.stringify(confString)
        };

        this.$message({
          title: this.$t("msg.forbidden.banedAddFriend"),
          message:
            this.$t("msg.forbidden.confirm") +
            (this.currentSession.isFriend == 1
              ? this.$t("msg.msgPanel.cancel")
              : this.$t("msg.msgPanel.open")) +
            this.$t("msg.forbidden.banedAddFriend") +
            "？",
          confirmButtonText: this.$t("msg.common.confirm"),
          cancelButtonText: this.$t("msg.common.cancel")
        }).then(
          () => {
            this.$http.setGroupSetting(obj).then(
              () => {
                this.settingHandler(type);
              },
              () => {}
            );
          },
          () => {}
        );
      }
    },
    settingHandler(type) {
      switch (type) {
        case "temp":
          if (this.currentSession.isForbidChat == 0) {
            this.currentSession.isForbidChat = 1;
          } else {
            this.currentSession.isForbidChat = 0;
          }

          this.isForbidTemp = !this.isForbidTemp;
          this.$store.commit("UPDATE_SESSION", this.currentSession);
          break;
        case "friend":
          if (this.currentSession.isFriend == 0) {
            this.currentSession.isFriend = 1;
          } else {
            this.currentSession.isFriend = 0;
          }

          this.isForbidFriend = !this.isForbidFriend;
          this.$store.commit("UPDATE_SESSION", this.currentSession);
          break;
        default:
          return;
      }
    }
  },
  mounted() {}
};
</script>

<style lang="scss" scoped>
@import "../../assets/css/var";
//发起新群聊弹窗
.forbidden-box {
  z-index: 999;
  .my-popup-content {
    width: 415px;
    border-radius: 10px;
    overflow: hidden;
    cursor: default;
    .invite-header {
      justify-content: space-between;
      height: 60px;
      .go-back {
        max-width: 63px;
        padding-left: 32px;
				background: url(../../assets/images/go-back.png) no-repeat;
        background-position: 15px 2px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
				cursor: pointer;
      }
      .finish {
        width: 78px;
        height: 34px;
        margin-right: 15px;
        border-radius: 20px;
        text-align: center;
        line-height: 34px;
        color: #fff;
        background-color: $color-theme;
        cursor: pointer;
      }
    }
    .search-box {
      width: 100%;
      height: 50px;
      padding: 0 15px;
      border-bottom: 1px solid $border-color;
      .search-input {
        background-color: $backgroup-color;
        border: 0;
      }
    }
    .selected-list {
      position: relative;
      width: 415px;
      height: 71px;
      padding: 18px 0;
      border-bottom: 1px solid $border-color;
      .item-selected {
        position: relative;
        width: 98px;
        height: 34px;
        margin-left: 15px;
        padding-left: 40px;
        border-radius: 17px;
        font-size: 14px;
        line-height: 34px;
        text-align: left;
        background-color: $backgroup-color;
        overflow: hidden;
        cursor: pointer;
        &:hover {
          .delete-icon {
            display: block;
          }
          .avatar {
            display: none;
          }
        }
        &.active {
          color: #fff;
          background-color: $color-theme;
        }
        .avatar {
          position: absolute;
          top: 0;
          left: 0;
          width: 34px;
          height: 34px;
          border-radius: 50%;
        }
        .name {
          display: inline-block;
          width: 58px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .delete-icon {
          position: absolute;
          top: 0;
          left: 0;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: $color-theme url(../../assets/images/clear-icon.png)
            center no-repeat;
        }
      }
    }
    .unselected-list {
      border-top: 15px solid $backgroup-color;
    }
    .friend-list {
      position: relative;
      height: 482px;
      border-top: 1px solid $border-color;

      .friend-list-item {
        padding: 0 30px;
        text-align: left;
        cursor: pointer;

        &:hover {
          background-color: $backgroup-color;
        }
        &.hide {
          display: none;
        }
        .item-left {
          position: relative;
          margin: 10px 0;

          .avatar {
            box-sizing: border-box;
            width: 52px;
            height: 52px;
            margin-right: 10px;
            border-radius: 50%;
            &.active {
              border: 2px solid $color-theme;
            }
          }
          .manager,
          .owner {
            position: absolute;
            top: -2px;
            right: 10px;
            width: 20px;
            height: 20px;
            background-image: url(../../assets/images/group.png);
          }
          .manager {
            background-position: -20px 0;
          }
          .select,
          .disable {
            position: absolute;
            right: 10px;
            bottom: 0;
            height: 20px;
            width: 20px;
          }
          .select {
            background-image: url(../../assets/images/seleted-fill.png);
            background-size: 100%;
          }
          .disable {
            background-image: url(../../assets/images/unselectable.png);
            background-size: 100%;
          }
        }
        .nickname {
          display: inline-block;
          max-width: 175px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }
  }
  .forbidden {
    text-align: left;
    background-color: $backgroup-color;
    .my-popup-close {
      top: 23px;
    }
    .my-popup-title {
      height: 60px;
      border-bottom: 1px solid $border-color;
      line-height: 60px;
      background-color: #fff;
    }
    .setting-list {
      margin-top: 8px;
      padding: 15px;
      border-top: 1px solid $border-color;
      background-color: #fff;
      .title {
        margin-bottom: 10px;
      }
      .label {
        margin-top: 5px;
      }
      .text {
        margin-top: 8px;
        font-size: 14px;
        color: $color-grey;
      }
      > .list-item {
        padding-bottom: 15px;
      }
      > .display-flex {
        align-items: flex-start;
        > .display-flex-item {
          overflow: visible;
        }
      }
    }
    .icon {
      width: 30px;
      height: 30px;
      margin-right: 15px;
      background: url(../../assets/images/forbid-icon.png);
      cursor: pointer;

      &.selected {
        background-position: 0 -30px;
      }
      &.more {
        background-position: -30px 0;
      }
    }
    .forbidden-more {
      padding-right: 15px;
      color: $color-theme;
      cursor: pointer;

      .icon-right {
        width: 7px;
        height: 12px;
        background: #fff url(../../assets/images/chat/icon-arrow-right.png);
        background-size: cover;
      }
    }
    .forbidden-list {
      position: relative;
      max-height: 288px;
      margin: 10px 15px 0 0;
      padding: 10px;
      border-radius: 6px;
      box-shadow: 2px 2px 8px #bbb;
      background-color: #fff;
      .hide {
        display: none;
      }
      .info {
        padding: 8px 8px 8px 0;
        border-bottom: 1px solid $border-color;

        .avatar {
          width: 52px;
          height: 52px;
          margin-right: 10px;
          border-radius: 50%;
        }
      }
      .delete-icon {
        width: 20px;
        height: 20px;
        margin-right: 10px;
        background: url(../../assets/images/delete.png);
        background-size: 100%;
        cursor: pointer;
      }
      .no-more {
        font-size: 14px;
        color: $color-grey;
      }
    }
  }
}
</style>
