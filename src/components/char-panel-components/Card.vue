<template>
  <transition name="drop-left">
    <div
      class="menber-detail"
      v-show="cardBox.show"
      :style="{ top: cardBox.top + 'px', left: cardBox.left + 'px' }"
      @click.stop=";"
    >
      <div class="detail-header display-flex">
        <img class="avatar" :src="global.fileDownUrl + 'compress/'+ detail.avatar"  v-headError />
        <span
          class="default"
          v-defaultHead
          v-if="!detail.avatar"
          v-text="detail.userName || detail.nickName"
          ></span>
        <div>
          <p>
            <span class="name">{{ detail.userName || detail.nickName }}</span
            ><span class="gender" :class="{ male: detail.gender }"></span>
          </p>
          <p class="echat-id">EchatAPP ID: {{ detail.userId }}</p>
        </div>
      </div>
      <div class="detail-body display-flex">
        <div>
          <span class="detail-region" :title="detail.addr" v-if="friendShip !== 2"
            ><span>{{ $t("msg.user.region") }}</span
            >{{
              detail.addr||$t("msg.common.nothing")
            }}</span
          >
          <span v-else>{{ $t("msg.common.card") }}</span>
        </div>
        <div class="operation" v-if="friendShip !== 2">
          <span
            class="detail-icon transfer"
            @click="transfer"
            v-if="friendShip === 1"
          ></span>
          <span
            class="detail-icon message"
            @click="gotoChat"
            v-if="friendShip === 1"
          ></span>
          <span
            class="detail-icon add"
            @click="showNote = true"
            v-if="friendShip === 0"
          ></span>
        </div>
      </div>
      <transition name="pop">
        <div class="my-popup remark" v-show="showNote">
          <div class="my-popup-content" @click.stop=";">
            <h3 class="my-popup-title">{{ $t("msg.tip.verifyInfo") }}</h3>
            <span class="my-popup-close" @click="showNote = false"></span>
            <div class="display-flex">
              <div class="search-box">
                <div class="search-input">
                  <input
                    type="text"
                    :placeholder="$t('msg.tip.verifyInfo1')"
                    maxlength="20"
                    v-model="note"
                  />
                  <i class="icon-delete" @click="note = ''" v-show="note"></i>
                </div>
              </div>
              <button class="search-btn" @click="doAddFriend">
                {{ $t("msg.common.confirm") }}
              </button>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  data() {
    return {
      cardBox: {
        show: false,
        top: 0,
        left: 0
      },
      detail: {},
      messageItem: {},
      tempHeadImg: "./static/images/chat/img-username.png",
      friendShip: 0, //好友关系 0-非好友 1-好友 2-自己
      showNote: false,
      note: ""
    };
  },
  computed: {
    ...mapGetters(["userInfo", "currentSession"])
  },
  methods: {
    show(event, value) {
      this.cardBox.show = true;
      this.cardBox.top = event.clientY;
      this.cardBox.left = event.clientX;
      this.messageItem = value;

      if (value.bodyContent.userId === this.userInfo.userId) {
        this.friendShip = 2;
        this.detail = this.userInfo;
        this.detail.avatar = this.userInfo.headImg;
        return;
      }

      let info = {};

      if (this.$store.state.friendList[value.msgContent.userId]) {
        info = this.$store.state.friendList[value.msgContent.userId];
      }

      if (info.userId) {
        this.friendShip = 1;
        info.avatar = info.headImg;
        this.detail = info;
        // return;
      }else{
        this.friendShip = 0;
      }

      this.$http.searchInfo({ ids: value.msgContent.userId }).then(
        data => {
          this.detail = data[0];
          this.detail.gender=Number(this.detail.gender);
          if(this.detail.stateCode&&this.detail.countryCode){
            this.detail.addr=this.detail.stateCode+ "  " + this.detail.countryCode;
          }else{
            this.detail.addr="";
          }          
        },
        () => {}
      );
    },
    transfer() {
      let forwardInfo = {
        show: true,
        body: [
          {
            msgType: this.messageItem.bodyType,
            bodyContent: this.messageItem.bodyContent
          }
        ]
      };
      this.$store.commit("SET_FORWARD_INFO", forwardInfo);
      this.cardBox.show = false;
    },
    gotoChat() {
      //确定类型
      var chat = this.$store.state.session.record[this.detail.userId];

      if (!chat) {
        chat = {
          img: this.detail.headImg,
          lastReadId: 0,
          mId: 0,
          fromType: 0,
          msgType: 1,
          preview: "",
          userTime: new Date().getTime(),
          name:
            this.detail.notes || this.detail.nickName || this.detail.userName,
          paramId: this.detail.userId
        };
        this.$store.commit("UPDATE_SESSION", chat);
      }

      this.$store.commit("CLEAR_MESSAGE", {});

              let sessionCache= this.$store.state.session.record;
              for(let key in sessionCache){
                if(sessionCache[key].isActivity){
                  sessionCache[key].isActivity=false;
                }        
              }
              chat.isActivity=true;

      this.$store.commit("UPDATE_CURRENT_SESSION", chat);
      this.cardBox.show = false;
    },
    doAddFriend() {
      var postData = {
        recipient: this.detail.userId,
        subtitle: this.note,
        source: 3
      };
      this.showNote = false;
      this.cardBox.show = false;
      this.note = "";
      this.$http.addFriend(postData);
    }
  },
  mounted() {
    window.addEventListener("click", event => {
      this.cardBox.show = false;
    });
  }
};
</script>

<style lang="scss" scoped>
// 好友名片
.menber-detail {
  position: fixed;
  z-index: 99;
  width: 295px;
  height: 150px;
  border-radius: 10px;
  box-shadow: 0 0 8px 0 rgba(0, 0, 0, 0.3);
  overflow: hidden;
  text-align: left;
  background-color: #fff;
  .detail-header {
    padding: 20px 25px;
    border-bottom: 1px solid #e2e2e2;
    .avatar {
      width: 55px;
      height: 55px;
      margin-right: 15px;
      border-radius: 50%;
    }
    .default{
      position:absolute;
      top:20px;left:25px;
      height:55px;width:55px;
      background: rgb(169, 169, 169);
      border-radius: 50%;
      text-align: center;
      line-height: 55px;
      font-weight: 550;
      color: #fff;
    }
    .gender {
      display: inline-block;
      width: 16px;
      height: 16px;
      background: url(../../assets/images/female.png) center no-repeat;
      background-size: 100%;
      &.male {
        background: url(../../assets/images/male.png) center no-repeat;
        background-size: 100%;
      }
    }
    .echat-id {
      margin-top: 15px;
      font-size: 14px;
      color: #999;
    }
    .name {
      display: inline-block;
      width: 154px;
      padding-right: 5px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }
  .detail-body {
    justify-content: space-between;
    margin: 8px 15px 0 25px;
    font-size: 14px;
    line-height: 30px;
    color: #999;
    .operation {
      height: 30px;
    }
    .detail-region{
      display:inline-block;
      width:180px;
      text-overflow:ellipsis;
      white-space:nowrap;
      overflow:hidden;
    }
    .detail-icon {
      display: inline-block;
      width: 30px;
      height: 30px;
      background: url(../../assets/images/chat/chat-menu.png);
      cursor: pointer;
      &.transfer {
        background-position: -180px -30px;
        &:hover {
          background-position: -180px -60px;
        }
      }
      &.message {
        background-position: -210px -30px;
        &:hover {
          background-position: -210px -60px;
        }
      }
      &.add {
        background-position: -240px -30px;
        &:hover {
          background-position: -240px -60px;
        }
      }
    }
  }
}
</style>
