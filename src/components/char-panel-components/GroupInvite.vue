<template>
  <div class="my-popup" v-if="showInvite">
    <div class="my-popup-content invite">
      <span class="my-popup-close" @click="showInvite = false"></span>
      <div class="display-flex group-info">
        <img
          class="img"
          :src="global.fileDownUrl + 'compress/' + inviteInfo.bodyContent.gAvatar"
          v-headError
        />
        <div class="display-flex-item">
          <p class="title">{{ inviteInfo.bodyContent.gName }}</p>
          <p class="text">
            {{
              userId == inviteInfo.bodyFrom
                ? $t("msg.common.you")
                : currentSession.name
            }}{{ $t("msg.groupInvite.invite")
            }}{{
              userId != inviteInfo.bodyFrom
                ? $t("msg.common.you")
                : currentSession.name
            }}{{ $t("msg.groupInvite.toJoin") }}({{
              inviteInfo.bodyContent.gName
            }})
          </p>
        </div>
      </div>
      <p class="text">{{ $t("msg.groupInvite.info1") }}</p>
      <p class="text">{{ $t("msg.groupInvite.info2") }}</p>
      <button
        type="button"
        class="btn"
        v-if="hasJoin || userId == inviteInfo.bodyFrom"
      >
        {{
          userId == inviteInfo.bodyFrom
            ? $t("msg.groupInvite.invited")
            : $t("msg.groupInvite.accepted")
        }}
      </button>
      <button type="button" class="btn join" @click="join" v-else>
        {{ $t("msg.groupInvite.joinGroup") }}
      </button>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import {group} from "@/session/group";

export default {
  data() {
    return {
      inviteInfo: {},
      showInvite: false,
      hasJoin: false
    };
  },
  computed: {
    ...mapGetters(["userId", "currentSession"])
  },
  methods: {
    show(value) {
      this.hasJoin = false;
      this.showInvite = true;
      this.inviteInfo = value;
      console.log(this.$store.state.groupList)
      if (this.$store.state.groupList[this.inviteInfo.bodyContent.gId]) {
        this.hasJoin = true;
      }
    },
    doAddFriend() {
      var postData = {
        recipient: this.detail.userId,
        subtitle: this.note,
        source: "1"
      };
      this.showNote = false;
      this.cardBox.show = false;
      this.note = "";
      this.$http.addFriend(postData);
    },
    join() {
      this.$http
        .joinGroup({ applyId: this.inviteInfo.bodyContent.applyId })
        .then(() => {
          this.showInvite = false;
          var newChat = {
            img: "",
            lastReadId: 1,
            mId: 1,
            name: this.inviteInfo.bodyContent.gName,
            paramId: this.inviteInfo.bodyContent.gId,
            fromType: 1,
            msgType: 1,
            preview: "",
            userTime: new Date().getTime()
          };
          group.getGroupAll(true).then(() => {
            this.$store.commit("CLEAR_MESSAGE", {});
            this.$store.commit("UPDATE_SESSION", newChat);

              let sessionCache= this.$store.state.session.record;
              for(let key in sessionCache){
                if(sessionCache[key].isActivity){
                  sessionCache[key].isActivity=false;
                }        
              }
              newChat.isActivity=true;

            this.$store.commit("UPDATE_CURRENT_SESSION", newChat);
          });
        });
    }
  },
  mounted() {}
};
</script>

<style lang="scss" scoped>
@import "../../assets/css/var";
.invite {
  width: 310px;
  padding: 15px;
  text-align: left;
  .group-info {
    margin-bottom: 10px;
    padding-bottom: 10px;
    border-bottom: 1px solid #ddd;
    .img {
      width: 75px;
      height: 75px;
      margin-right: 12px;
      border-radius: 50%;
    }
  }
  .title {
    font-size: 16px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .text {
    margin-top: 5px;
    font-size: 14px;
    color: #999;
  }
  .btn {
    width: 100%;
    height: 32px;
    margin: 35px 0 10px 0;
    color: #fff;
    background-color: #ccc;
    &.join {
      background-color: $color-theme;
    }
  }
}
</style>
