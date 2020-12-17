<template>
  <transition name="scale-x">
    <div class="my-popup verify-invite" @click="showBox = false" v-if="showBox">
      <div class="my-popup-content" @click.stop="">
        <h3 class="my-popup-title">{{ $t("msg.chatPanel.review") }}</h3>
        <span class="my-popup-close" @click="showBox = false"></span>
        <div class="inviter-info">
          <img class="avatar" :src="inviterInfo.headImg" />
          <p>{{ inviterInfo.nickName }}</p>
          <p class="sub-text">
            {{ $t("msg.chatPanel.invite") }}{{ value[0].inviterNum
            }}{{ $t("msg.chatPanel.userJoin") }}
          </p>
        </div>
        <div class="inviter-list" v-scrollBar>
          <ul class="display-flex">
            <li
              class="inviter-list-item"
              v-for="(item, index) in applyList"
              :key="index"
            >
              <img class="avatar" :src="global.fileDownUrl + 'compress/' + item.avatar" />
              <p class="user-name">{{ item.userName }}</p>
            </li>
          </ul>
        </div>
        <div class="btn-wrap">
          <button type="button" class="reject" @click="audit(0)">
            {{ $t("msg.common.refuse") }}
          </button>
          <button type="button" class="agree" @click="audit(1)">
            {{ $t("msg.common.accept") }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { mapGetters } from "vuex";
import { localStore } from "@/tools/localStorage";

export default {
  name: "verify-invite",
  data() {
    return {
      showBox: false,
      inviterInfo: {},
      applyList: [],
      applyId: ""
    };
  },
  props: {
    value: {
      type: Array
    }
  },
  computed: {
    ...mapGetters(["currentSession","activityGroupMembers"])
  },
  methods: {
    show(info) {
      this.applyId = info.inviterCode;
      this.inviterInfo = this.activityGroupMembers[info.operatorId];
      this.$http.getMemberApply({ applyId: this.applyId }).then(data => {
        this.applyList = data.inviter;
        this.showBox = true;
      });
    },
    audit(type) {
      var postData = {
        applyId: this.applyId,
        status: type
      };

      this.$http.auditMemberApply(postData).then(
        () => {
          this.$store.commit(
            "SET_TOAST_TEXT",
            this.$t("msg.tip.operateSuccess")
          );
          localStore.updateInviterCode(this.currentSession.paramId, {});
          this.$store
            .dispatch("getGroupMember", {
              groupId: this.currentSession.paramId
            })
            .then(() => {});
        },
        res => {
          if (res.code == 101604) {
            localStore.updateInviterCode(this.currentSession.paramId, {});
          }
        }
      );
      let arr = this.value;
      arr.shift();
      if (arr.length > 0) {
        this.show(arr[0]);
      } else {
        this.showBox = false;
      }
      this.$emit("input", arr);
    }
  },
  mounted() {}
};
</script>

<style lang="scss" scoped>
@import "../../assets/css/var";
//添加好友弹窗
.verify-invite {
  z-index: 299;
  .my-popup-content {
    width: 474px;
    height: 540px;
    overflow: hidden;

    .inviter-info {
      padding: 12px 0;
      border-top: 1px solid $border-color;
      border-bottom: 1px solid $border-color;
      line-height: 28px;
      .avatar {
        width: 75px;
        height: 75px;
        margin-bottom: 5px;
        border-radius: 50%;
      }
    }
    .inviter-list {
      position: relative;
      height: 200px;
      padding: 0 37px;
      .display-flex {
        flex-wrap: wrap;
      }
      .inviter-list-item {
        margin-top: 20px;
        padding: 0 12px;
        .avatar {
          width: 56px;
          height: 56px;
          border-radius: 50%;
        }
        .user-name {
          width: 76px;
          margin-top: 8px;
          font-size: 12px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
      }
    }
    .btn-wrap {
      margin-top: 70px;
      .reject {
        height: 32px;
        margin: 0 35px;
        padding: 0 50px;
        line-height: 32px;
        background: $color-red;
        color: #fff;
        border-radius: 4px;
      }
      .agree {
        height: 32px;
        margin: 0 35px;
        padding: 0 50px;
        line-height: 32px;
        background: $color-theme;
        color: #fff;
        border-radius: 4px;
      }
    }
    .sub-text {
      font-size: 14px;
      color: $color-grey;
    }
  }
}
</style>
