<template>
  <div class="detail-box">
    <div class="defaul-backgroup" v-if="!showDetail"></div>
    <!-- 好友详情 -->
    <div class="friend-detail" v-if="detail.fromType == 0">
      <h3 class="friend-title">{{ $t("msg.detail.title") }}</h3>
      <div class="friend-info clearfix">
        <div class="friend-info-left">
          <div class="friend-avatar">
            <img class="avatar" :src="global.fileDownUrl + 'compress/'+detail.headImg" v-headError v-headViewer />
            <span class="default" v-defaultHead v-if="!detail.headImg">{{ detail.nickName || detail.userName }}</span>
            <span class="gender" :class="{ male: detail.gender == 1 }"></span>
          </div>
          <p class="name">{{ detail.nickName || detail.userName }}</p>
        </div>
        <div class="friend-info-right">
          <div class="friend-info-item">
            <span class="lable">{{ $t("msg.user.note") }}</span>
            <input
              type="text"
              ref="notes"
              maxlength="20"
              :placeholder="$t('msg.user.clickNote')"
              :value="detail.notes"
              @blur="setNotes"
            />
          </div>
          <div class="friend-info-item">
            <span class="lable">EchatAPP ID:</span>
            <span>{{ detail.userId }}</span>
          </div>
          <div class="friend-info-item">
            <span class="lable">{{ $t("msg.user.region") }}</span>
            <span>{{
              (detail.countryCode || "") + (detail.stateCode || "") ||
                $t("msg.common.nothing")
            }}</span>
          </div>
          <div class="friend-info-item signature">
            <span class="lable">{{ $t("msg.user.signature") }}</span>
            <span>{{ detail.signature || $t("msg.common.nothing") }}</span>
          </div>
        </div>
      </div>
      <button class="btn delete-friend" :title="$t('msg.detail.delete')" @click="showConfirm = true">
        {{ $t("msg.detail.delete") }}
      </button>
      <button class="btn send-msg" :title="$t('msg.detail.sendMsg')" @click="gotoChat()">
        {{ $t("msg.detail.sendMsg") }}
      </button>
      <Popup :title="$t('msg.detail.delete')" :hide-close="true"
        v-if="showConfirm"
      >
        <div class="logout" @click.stop="" slot="body">
          <div class="logout-detail">{{ $t("msg.detail.confirmDelete") }}</div>
          <button class="two-btn cannel" @click="showConfirm = false">
            {{ $t("msg.common.cancel") }}
          </button>
          <button class="two-btn delete" @click="doDeleteFriend">
            {{ $t("msg.detail.del") }}
          </button>
        </div>
      </Popup>
    </div>
    <!-- 群详情 -->
    <div class="friend-detail" v-if="detail.fromType == 1">
      <div class="group-header">
        <p class="title">{{ detail.groupName }}</p>
        <p class="sub-text" v-if="$i18n.locale == 'en_US'">
          {{groupMember.length + " " + $t("msg.groupInfo.groupUser")}}
        </p>
        <p v-else>({{ $t("msg.groupInfo.groupUser") }}：{{ groupMember.length }})</p>
      </div>
      <div class="group-detail" v-scrollBar>
        <ul class="group-members display-flex">
          <li
            class="group-members-item"
            v-for="(item, index) in groupMember"
            :key="index"
          >
            <img
              class="avatar"
              :src="global.fileDownUrl + 'compress/'+item.headImg"
              @click.stop="showProfile(item.userId, item.groupId)"
              :data-index="
                `{%type%:%avatar%,%uId%:${item.userId},%gId%:${item.groupId},%banAt%:true}`
              "
              v-headError
            />
            <span
              class="default"
              v-defaultHead
              v-if="!item.headImg"
              >{{ item.nickName || item.userName }}</span>
            <p class="name" v-text="item.nickName || item.userName"></p>
          </li>
        </ul>
      </div>
      <button class="btn group-msg" @click="gotoChat()">
        {{ $t("msg.detail.sendMsg") }}
      </button>
    </div>
    <!-- 好友审批 -->
    <div class="friend-detail" v-if="detail.fromType == 2">
      <h3 class="friend-title">{{ $t("msg.detail.title") }}</h3>
      <div class="friend-info clearfix">
        <div class="friend-info-left">
          <div class="friend-avatar">
            <img class="avatar" :src="global.fileDownUrl + 'compress/'+detail.headImg" v-headError v-viewer />
            <span class="gender" :class="{ male: detail.gender == 1 }"></span>
          </div>
          <p class="name">{{ detail.nickName || detail.userName }}</p>
        </div>
        <div class="friend-info-right">
          <div class="friend-info-item">
            <span class="lable">EchatAPP ID:</span>
            <span>{{ detail.userId }}</span>
          </div>
          <div class="friend-info-item">
            <span class="lable">{{ $t("msg.user.region") }}</span>
            <span>{{ detail.area || $t("msg.common.nothing") }}</span>
          </div>
          <div class="friend-info-item">
            <span class="lable">{{ $t("msg.user.signature") }}</span>
            <span>{{ detail.signature || $t("msg.common.nothing") }}</span>
          </div>
        </div>
      </div>
      <div class="friend-subtitle">
        {{ $t("msg.detail.otherInfo")
        }}<span>{{ detail.subtitle || $t("msg.common.nothing") }}</span>
      </div>
      <button
        v-show="detail.state == 2"
        class="btn refuse"
        @click="verifyFirend(0)"
      >
        {{ $t("msg.detail.refuse") }}
      </button>
      <button
        v-show="detail.state == 2"
        class="btn accept"
        @click="verifyFirend(1)"
      >
        {{ $t("msg.detail.accept") }}
      </button>
      <button v-show="detail.state == 1" class="btn refused" @click=";">
        {{ $t("msg.detail.accepted") }}
      </button>
      <button v-show="detail.state == 0" class="btn refused" @click=";">
        {{ $t("msg.detail.refused") }}
      </button>
    </div>
  </div>
</template>

<script>
import { EchatDB } from "@/tools/indexedDB";
import { localStore } from "@/tools/localStorage";
import { msgManager } from "@/session/msgManager";
import {friendDB} from "@/session/friend/friendDB";
import {sessionUtil} from "@/session/sessionUtil";

export default {
  data() {
    return {
      detail: {},
      showDetail: false,
      showConfirm: false,
      menberDetail: {
        show: false,
        left: 0,
        top: 0,
        data: {}
      }
    };
  },
  computed: {
    groupMember() {
      //群详情
      if (this.$store.state.activityGroupMembers) {
        return Object.values(
          this.$store.state.activityGroupMembers
        );
      }
      return [];
    }
  },
  methods: {
    show(item, type) {
      this.detail = item;
      this.detail.fromType = type;
      this.showDetail = true;
      if (type == 1) {
        this.$store
          .dispatch("getGroupMember", { groupId: item.groupId })
          .then(() => {});
      }
    },
    showProfile(id, gid) {
      this.$store.dispatch("setLayout", ["gmi", [id, gid], true]);
    },
    gotoChat() {
      this.$emit("detailHandler", this.detail);
    },
    setNotes() {
      let obj = {
        recipient: this.detail.userId,
        confString: {
          notes: this.$refs.notes.value || ""
        }
      };
      obj.confString = JSON.stringify(obj.confString);

      this.$http.setRemark(obj).then(
        data => {
          let detail = this.$store.state.friendList[this.detail.userId];
          if (detail) {
            this.detail = detail;
            this.detail.fromType = 0;
          }
        },
        () => {}
      );
    },
    doDeleteFriend() {
      this.$http.deleteFriend({ recipient: this.detail.userId }).then(() => {
        this.showConfirm = false;
        this.showDetail = false;
        //删除好友
        friendDB.deleteFriend(+this.detail.userId);
        this.$store.commit("DEL_FRIEND_INFO",this.detail.userId);
        this.$parent.$refs.friendList.initFriendsList();

        this.$store.commit("DELETE_SESSION", this.detail.userId+'-0');
        if (this.detail.userId == this.$store.getters.currentSession.paramId) {
          this.$store.commit("UPDATE_CURRENT_SESSION", {});
        }
        msgManager.removeMsgAll(0,this.detail.userId);

      });
    },
    //处理好友请求
    verifyFirend(state) {
      //0-拒绝 1-同意
      let obj = {
        recipient: this.detail.userId,
        state
      };
      this.$http.friendVerify(obj).then(() => {
        this.$store.dispatch("getFriendList", {}).then(data=>{
            friendDB.updateFriendBatch(data).then(data=>{
                this.$store.commit("SET_FRIEND_LIST", data);
                this.$parent.$refs.friendList.initFriendsList();
            });
        });
        this.showDetail = false;
        //本地存储好友审批
        this.$store.dispatch("getNewFriends").then(() => {
          this.$parent.$refs.friendList.initNewFriendsList();
        });
      });
    }
  },
  mounted() {}
};
</script>

<style lang="scss" scoped>
@import "../assets/css/var";

.detail-box {
  position: relative;
  width: 690px;
  height: 660px;
}
//好友详情
.friend-detail {
  position: relative;
  width: 700px;
  height: 100%;
  background: #fff;
  text-align: center;
  border-radius: 0 0 2px 0;
  .friend-title {
    position: relative;
    height: 70px;
    border-bottom: 1px solid $border-color;
    line-height: 62px;
    color: #384b5e;
    font-size: 22px;
    padding: 0 20px;
    text-align: center;
    line-height: 70px;
  }
  .friend-subtitle {
    padding: 0 100px;
    text-align: left;
    color: $color-grey;
    margin-bottom: 85px;

    span {
      color: #000;
    }
  }
  .friend-info {
    padding: 120px 80px 80px 80px;
    .friend-info-left {
      float: left;
      width: 260px;
      padding-right: 60px;
      .friend-avatar {
        position: relative;
        display: inline-block;
        height: 120px;
        width: 120px;
        .avatar {
          height: 120px;
          width: 120px;
          border-radius: 50%;
        }
        .default{
          position:absolute;
          top:0;left:0;
          height:120px;width:120px;
          background: rgb(169, 169, 169);
          border-radius: 50%;
          text-align: center;
          line-height: 120px;
          font-size:46px;
          font-weight: 550;
          color: #fff;
        }
        .gender {
          position: absolute;
          right: 0;
          bottom: 0;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: #fff url(../assets/images/female.png) center no-repeat;
          background-size: 70%;
          &.male {
            background: #fff url(../assets/images/male.png) center no-repeat;
            background-size: 70%;
          }
        }
      }
      .name {
        margin: 15px 0;
        font-size: 24px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
    .friend-info-right {
      float: right;
      width: 265px;
      line-height: 30px;
      text-align: left;
      .friend-info-item {
        width: 100%;
        padding: 5px 0;
        .lable {
          width: 100%;
          display: block;
          color: $color-grey;
        }
        input {
          width: 165px;
          padding: 2px 5px;
          border: 1px solid transparent;
          font-size: 16px;
          color: #000;
          &:hover {
            border-color: #808080;
            border-radius: 3px;
          }
        }
      }
    }
  }
  .btn {
    display: inline-block;
    width: 120px;
    height: 34px;
    border-radius: 5px;
    font-size: 14px;
    line-height: 34px;
    padding:0 10px;
    color: #fff;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    &.send-msg {
      position: absolute;
      right: 100px;
      bottom: 70px;
      background-color: $color-theme;
    }
    &.group-msg {
      position: absolute;
      left: 50%;
      bottom: 70px;
      margin-left: -70px;
      background-color: $color-theme;
    }
    &.delete-friend {
      position: absolute;
      left: 100px;
      bottom: 70px;
      background-color: $color-red;
    }
    &.refuse {
      position: absolute;
      left: 100px;
      bottom: 70px;
      background-color: $color-red;
    }
    &.accept {
      position: absolute;
      right: 100px;
      bottom: 70px;
      background-color: $color-theme;
    }
  }
  .friend-list {
    height: calc(100% - 62px);
    background: #eee;
    overflow: auto;
    .friend-list-item {
      position: relative;
      height: 80px;
      padding-left: 85px;
      background: #fff;
      border-bottom: 1px solid #e7e7e7;
      .avatar {
        position: absolute;
        top: 15px;
        left: 20px;
        height: 50px;
        width: 50px;
        border-radius: 50%;
      }
      .userName {
        max-width: 450px;
        padding-top: 15px;
        text-align: left;
      }
      .userMsg {
        max-width: 450px;
        margin-top: 5px;
        color: $color-grey;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        text-align: left;
      }
      .btn {
        position: absolute;
        right: 15px;
        width: 80px;
        height: 25px;
        border-radius: 4px;
        border: 1px solid $color-theme;
        font-size: 12px;
        line-height: 25px;
        text-align: center;
        background: #fff;
        color: #000;
        margin-top: 0;
      }
      .accept {
        top: 15px;
        &:hover {
          background: $color-theme;
          color: #fff;
        }
      }
      .refuse {
        top: 45px;
        &:hover {
          background: #f40;
          color: #fff;
          border: none;
        }
      }
    }
  }
  .nodata {
    line-height: 80px;
    text-align: center;
    color: $color-grey;
  }
}
</style>
