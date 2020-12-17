<template>
  <!-- 添加好友 -->
  <div
    class="my-popup forward"
    @click="forwardInfo.show = false"
  >
    <div class="my-popup-content display-flex" @click.stop=";">
      <div class="left-content">
        <div class="search-box">
          <div class="search-input">
            <input
              type="text"
              :placeholder="$t('msg.menu.search')"
              v-model="searchKey"
            />
            <i
              class="icon-delete"
              @click="searchKey = ''"
              v-show="searchKey"
            ></i>
          </div>
        </div>
        <div class="display-flex tip-box">
          <label
            @click="switchType(2)"
            class=""
            :class="{ active: forwardType == 2 }"
            >{{ $t("msg.menu.chatting") }}</label
          >
          <label @click="switchType(0)" :class="{ active: forwardType == 0 }">{{
            $t("msg.menu.contact")
          }}</label>
          <label @click="switchType(1)" :class="{ active: forwardType == 1 }">{{
            $t("msg.menu.group")
          }}</label>
        </div>
        <ul class="forward-list" v-scrollBar v-show="searchKey == ''">
          <!-- 聊天列表 -->
          <li v-if="forwardType==2"
            class="forward-list-item display-flex"
            :class="{ hide: item.temp || item.fromType == 2 }"
            v-for="(item, index) in showList" :key="index"
            @click="clickChecked(item)"
          >
            <div class="item-left">
              <img
                :src="global.fileDownUrl + 'compress/' + item.img" class="avatar" v-headError
                v-if="(item.fromType == 0 || item.fromType == 1) && item.img"
              />
              <span class="default" v-defaultHead
                v-if="(item.fromType == 0 || item.fromType == 1) && !item.img"
                >{{ item.name }}</span>
            </div>
            <div class="item-right display-flex-item">
              <span class="name-line" v-text="item.name"></span>
            </div>
            <span class="select" :class="{ active: item.checked }"></span>
          </li>
          <!-- 联系人/群聊 -->
          <section v-if="forwardType!=2"
            v-for="(data, id) in showList" :key="id"
          >
            <div v-if="data.data && data.data.length" class="sort-letter">
              {{ data.letter }}
            </div>
            <li
              class="forward-list-item display-flex"
              :class="{ hide: item.temp || item.fromType == 2 }"
              v-for="(item, index) in data.data" :key="index"
              @click="clickChecked(item)"
            >
              <div class="item-left">
                <img
                  :src="global.fileDownUrl + 'compress/' + item.img" class="avatar" v-headError
                  v-if="(item.fromType == 0 || item.fromType == 1) && item.img"
                />
                <span class="default" v-defaultHead
                  v-if="(item.fromType == 0 || item.fromType == 1) && !item.img"
                  >{{ item.name }}</span>
              </div>
              <div class="item-right display-flex-item">
                <span class="name-line" v-text="item.name"></span>
              </div>
              <span class="select" :class="{ active: item.checked }"></span>
            </li>
          </section>
        </ul>
        <ul class="forward-list" v-scrollBar v-show="searchKey != ''">
          <li
            class="forward-list-item display-flex"
            :class="{ hide: item.temp }"
            v-for="(item, index) in forwardResult"
            :key="index"
            @click="clickChecked(item)"
          >
            <div class="item-left">
              <img
                :src="global.fileDownUrl + 'compress/' + item.img"
                class="avatar"
                v-headError
                v-if="(item.fromType == 0 || item.fromType == 1) && item.img"
              />
              <span class="default" v-defaultHead
                v-if="(item.fromType == 0 || item.fromType == 1) && !item.img"
                >{{ item.name }}</span>
            </div>
            <div class="item-right display-flex-item">
              <span class="name-line-top" v-html="item.tempName"></span><br />
              <span class="name-line-bottom"
                ><span v-if="item.fromType == 0">EchatAPP</span
                ><span v-if="item.fromType == 1">{{ $t("msg.friendList.group") }}</span> ID:
                <span v-html="item.tempId"></span
              ></span>
            </div>
            <span class="select" :class="{ active: item.checked }"></span>
          </li>
        </ul>
      </div>
      <div class="right-content">
        <div class="title">
          <span>{{ $t("msg.tip.forwardContact") }}</span>
          <span class="sp-right">{{ sumList.length }}/9</span>
        </div>
        <ul class="forward-list" v-scrollBar>
          <li
            class="forward-list-item display-flex"
            v-for="(item, index) in selectList"
            :key="index"
            @click="deleteChecked(item)"
          >
            <div class="item-left">
              <img
                :src="global.fileDownUrl + 'compress/' + item.img"
                class="avatar"
                v-headError
                v-if="item.fromType == 0 || (item.fromType == 1 && item.img)"
              />
              <span
                class="default"
                v-defaultHead
                v-if="item.fromType == 1 && !item.img"
                >{{ item.name }}</span
              >
            </div>
            <div class="item-right display-flex-item">
              <span class="name-line" v-text="item.name"></span>
            </div>
            <span class="unselect"></span>
          </li>
        </ul>
        <button class="two-btn cannel" @click="forwardInfo.show = false">
          {{ $t("msg.common.cancel") }}
        </button>
        <button class="two-btn comfirm" @click="doForward()">
          {{ $t("msg.common.send") }}
        </button>
      </div>
    </div>
  </div>
</template>
<script>
import Vue from "vue";
import { mapGetters } from "vuex";
import Msg from "@/tools/msg";
import { Util } from "@/tools/utils";
import "@/common/pinyin.js";
import { MessageHandler } from "@/tools/messageHandler";
import { sessionInfo } from "@/session/sessionInfo";

export default {
  name: "forward",
  data() {
    return {
      forwardType: "2",
      searchKey: "",
      chatList: {},
      friendList: {},
      groupList: {},
      forwardList: {},
      forwardResult: {},
      selectList: {}
    };
  },
  computed: {
    ...mapGetters([
      "userId",
      "userInfo",
      "currentSession",
      "session",
      "forwardInfo"
    ]),
    sumList() {
      return Object.values(this.selectList);
    },
    showList() {
      let arr = Object.values(this.forwardList);
      arr.sort((a, b) => b.userTime - a.userTime);
      return arr;
    },
  },
  watch: {
    searchKey(ov, nv) {
      let list = [];
      if (this.forwardType == 0) list = Object.values(this.friendList);
      if (this.forwardType == 1) list = Object.values(this.groupList);
      if (this.forwardType == 2) list = Object.values(this.chatList);
      this.forwardResult = this.friendQuery(list, ov);
    }
  },
  methods: {
    init(){
      this.chatList = JSON.parse(JSON.stringify(this.session.record));
      for (let key in this.chatList) {
        this.$set(this.chatList[key], "checked", false);
      }
      this.friendList = JSON.parse(
        JSON.stringify(this.$store.state.friendList)
      );
      for (let key in this.friendList) {
        let item = this.friendList[key];
        this.$set(this.friendList[key], "checked", false);
        this.$set(this.friendList[key], "fromType", 0);
        this.$set(this.friendList[key], "img", item.headImg);
        this.$set(this.friendList[key], "name", item.nickName);
        this.$set(this.friendList[key], "paramId", item.userId);
      }
      this.groupList = JSON.parse(JSON.stringify(this.$store.state.groupList));
      for (let key in this.groupList) {
        let item = this.groupList[key];
        this.$set(this.groupList[key], "checked", false);
        this.$set(this.groupList[key], "fromType", 1);
        this.$set(this.groupList[key], "img", item.headImg);
        this.$set(this.groupList[key], "name", item.groupName);
        this.$set(this.groupList[key], "paramId", item.groupId);
      }
      this.switchType(2);
    },

    //联系人模糊搜索
    friendQuery(list, keyWord) {
      var arr = {};
      for (let key in list) {
        var item = list[key],
          tempId = item.paramId;
        let m = PinyinMatch.match(item.name, keyWord);
        if (m || ("" + tempId).indexOf(keyWord) >= 0) {
          if (m) item["tempName"] = this.redFont(item.name, m[0], m[1]);
          else item["tempName"] = item.name;
          var findId = (tempId + "").split(keyWord);
          item["tempId"] = findId.join(
            '<span class="search-key">' + keyWord + "</span>"
          );
          if(item.fromType==0 || item.fromType==1) arr[key] = item;
        }
      }
      if (keyWord == "") arr = list;
      return arr;
    },
    redFont(str, start, end) {
      return (
        str.substring(0, start) +
        '<span class="search-key">' +
        str.substring(start, end + 1) +
        "</span>" +
        str.substring(end + 1)
      );
    },
    clickChecked(item) {
      if (item.fromType == "1") {
        sessionInfo.getChatInfo(1,item.paramId,this.userId).then(memberInfo=>{
          let forbiddenWord = false;

          if (memberInfo.isBanned) {
            forbiddenWord = true;
          }

          if (
            this.currentSession.isBanned &&
            (!memberInfo.isAdmin || memberInfo.isAdmin < 1)
          ) {
            forbiddenWord = true;
          }
          if (forbiddenWord) {
            this.$store.commit("SET_TOAST_TEXT", this.$t("msg.forbidden.mute"));
            return;
          }

          this.checkedHandler(item);
        });
      } else {
        this.checkedHandler(item);
      }
    },
    checkedHandler(item) {
      if (this.sumList.length < 9) {
        if (!item.checked) {
          this.$set(this.selectList, item.paramId, item);
          this.addChecked(item);
          item.checked = true;
        } else {
          this.deleteChecked(item);
          item.checked = false;
        }
      } else if (this.sumList.length == 9) {
        if (item.checked) {
          this.deleteChecked(item);
          item.checked = false;
        }
      } else {
        if (item.checked) item.checked = !item.checked;
      }
    },
    getIndex(item) {
      let index = -1;
      for (var i = 0; i < this.selectList.length; i++) {
        if (this.selectList[i].paramId == item.paramId) {
          index = i;
        }
      }
      return index;
    },
    addChecked(item) {
      if (this.friendList[item.paramId])
        this.friendList[item.paramId].checked = true;
      if (this.groupList[item.paramId])
        this.groupList[item.paramId].checked = true;
      if (this.chatList[item.paramId+'-'+item.fromType])
        this.chatList[item.paramId+'-'+item.fromType].checked = true;
    },
    deleteChecked(item) {
      this.$delete(this.selectList, item.paramId);
      if (this.friendList[item.paramId])
        this.friendList[item.paramId].checked = false;
      if (this.groupList[item.paramId])
        this.groupList[item.paramId].checked = false;
      if (this.chatList[item.paramId+'-'+item.fromType])
        this.chatList[item.paramId+'-'+item.fromType].checked = false;
    },
    switchType(type) {
      this.forwardType = type;
      //联系人
      if (type == 0) this.forwardList = Util.sortByLetter(this.friendList);
      if (type == 1) this.forwardList = Util.sortByLetter(this.groupList, "group");
      if (type == 2) this.forwardList = this.chatList;

    },
    doForward() {
      let list = this.getCheckedArr(this.selectList);

      if (!(list && list.length)) {
        this.$store.commit("SET_TOAST_TEXT", this.$t("msg.tip.forwardContact"));
        return false;
      }

      for (var j = 0; j < this.forwardInfo.body.length; j++) {
        let item = JSON.parse(JSON.stringify(this.forwardInfo.body[j]));

        if (!item.msgContent) {
          item.msgContent = JSON.parse(JSON.stringify(item.bodyContent));
          if (item.msgType == 3) {
            item.msgContent.imgUrl = item.msgContent.imgUrl;
          }
        }

        if (item.msgType == 1 || item.msgType == 13) {
          item.bodyContent = MessageHandler.htmlToText(item.bodyContent);
        }

        // if (!item.preview) {
          item.preview = Msg.filterRecord(item.msgType, item.bodyContent)
        // } 

        if (item.msgType == 24) {
          item.msgContent = MessageHandler.htmlToText(item.msgContent);
          item.bodyContent = MessageHandler.htmlToText(item.msgContent);
          item.preview = Msg.replayLabel(item.msgContent);
          item.msgType = 1;
        }

        if (item.msgType == 28) {
          if ( item.msgContent.editType == 28 || item.msgContent.editType == 30 ) {
            if (typeof item.msgContent.content == "object") {
              item.msgContent = item.msgContent.content.content;
            } else {
              item.msgContent = item.msgContent.content;
            }
          }

          item.bodyContent = MessageHandler.htmlToText(item.msgContent);
          item.msgType = 1;
        }

        if (item.msgType == 30) {
          if(!(typeof item.msgContent == "object")) item.msgContent = JSON.parse(item.msgContent);
          item.bodyContent =  MessageHandler.htmlToText(item.msgContent.content);
          item.msgContent =  MessageHandler.htmlToText(item.msgContent.content);
          item.preview = Msg.replayLabel(item.msgContent);
          item.msgType = 1;
        }
        this.sendOne(item, list);
      }
      this.$store.commit("SET_FORWARD_INFO", {
        show: false,
        body: []
      });
    },
    sendOne(msg, list) {
      console.log(msg);
      return new Promise((resolve, reject) => {
        for (var i = 0; i < list.length; i++) {
          let item=list[i];
          let paramId = item.paramId;
          let time = new Date().getTime();

          let obj = {
            msg: (typeof msg.bodyContent == "object") ? JSON.stringify(msg.bodyContent) : msg.bodyContent,
            msgType: msg.msgType,
            chatType: item.fromType,
            toId: item.paramId,
            time,
            userId: this.userInfo.userId
          };

          this.$store.dispatch("sendMsg", obj);

          let chat = this.session.record[item.paramId+'-'+item.fromType];
          if (chat) {
            chat.lastReadId = chat.lastReadId + 1;
            chat.mId = chat.mId + 1;
            chat.msgType = msg.msgType;
            chat.preview = msg.preview;
            chat.userTime = time;
            // chat=JSON.parse(JSON.stringify(chat));
            this.$store.commit("UPDATE_SESSION", chat);
          } else {
            sessionInfo.getChatInfo(item.fromType,item.paramId).then(chatInfo=>{
              var newChat = {
                name: chatInfo.nickName,
                img: chatInfo.headImg,
                lastReadId: 0,
                paramId: item.paramId,
                mId: 1,
                fromType: item.fromType,
                msgType: msg.msgType,
                preview: msg.preview,
                userTime: new Date().getTime()
              };
              this.$store.commit("UPDATE_SESSION", newChat);
            });

          }
          
          if (item.paramId == this.currentSession.paramId) {
            //刷新聊天记录
            var history = {
              bodyContent: msg.bodyContent,
              msgContent: msg.msgContent,
              bodyFrom: this.userInfo.userId,
              bodyLevel: 1,
              bodyTime: time,
              bodyType: msg.msgType,
              mId: time,
              loading: 0,
              createTime: time,
              preview: msg.preview,
              checked: false,
              chatInfo: {
                nickName: this.userInfo.nickName,
                headImg: this.userInfo.headImg
              }
            };
            this.$store.commit("UPDATE_MESSAGE", history);
          }
        }
      });
    },
    replayFace(msg) {
      msg = msg + "";
      var resultArr = msg.match(/<img[^>]*>/g);
      if (resultArr != null) {
        for (var i = 0; i < resultArr.length; i++) {
          let str = resultArr[i].split("[")[1];
          let str2 = str.split("]")[0];
          msg = msg.replace(resultArr[i], "[" + str2 + "]");
        }
      }
      return msg;
    },
    getCheckedArr(list) {
      var result = [];
      if (list) {
        for (var key in list) {
          var item = list[key];
          if (item.checked == true) {
            result.push({
              fromType: item.fromType,
              paramId: item.paramId
            });
          }
        }
      } else {
        result = [];
      }
      return result;
    }
  },
  mounted() {
    this.init();
  }
};
</script>

<style lang="scss" scoped>
//发起新群聊弹窗
.forward {
  z-index: 999;
  .my-popup-content {
    height: 527px;
    width: 749px;
    border-radius: 5px;
    text-align: left;
    overflow: hidden;
    .left-content {
      height: 100%;
      width: 50%;
      border-right: 1px solid #e2e2e2;
      .search-box {
        width: 100%;
        padding: 34px 33px 0 33px;
        border: 0;
        .search-input {
          width: 100%;
        }
        .input {
          width: 100%;
          height: 23px;
          padding: 0 15px;
          line-height: 24px;
          border-radius: 12px;
          font-size: 12px;
          background-color: #f2f2f2;
        }
      }
      .tip-box {
        justify-content: space-between;
        padding: 18px 33px;
        text-align: center;
        font-size: 18px;
        label.active {
          color: #fea405;
        }
      }
    }
    .forward-list {
      position: relative;
      height: calc(100% - 117px);
      .sort-letter{
        position: relative;
        margin-top: 10px;
        padding-left: 33px;
        line-height: 22px;
        font-size: 16px;
        color: #999;
      }
      .forward-list-item {
        padding: 0 33px;
        box-sizing: border-box;
        border-bottom: 1px solid #e0e0e0;
        &.hide {
          display: none;
        }
        .item-left {
          position: relative;
          height: 59px;
          line-height: 59px;
          margin: 0 8px 0 0;
          .avatar {
            width: 36px;
            height: 36px;
            border-radius: 50%;
          }
          .default {
            display: block;
            width: 36px;
            height: 36px;
            margin-top: 12px;
            border-radius: 50%;
            text-align: center;
            line-height: 36px;
            font-weight: 550;
            color: #fff;
          }
        }
        .item-right {
          text-align: left;
        }

        .select {
          height: 18px;
          width: 18px;
          margin: 0 10px 0 5px;
          background-image: url(../assets/images/chat/icon-select.png);
          background-size: 100% 100%;
          &.active {
            background-image: url(../assets/images/chat/icon-select-on.png);
          }
        }
      }
    }
    .right-content {
      height: 100%;
      width: 50%;
      border-right: 1px solid #e2e2e2;
      text-align: center;
      .title {
        width: 100%;
        padding: 33px 33px 0 33px;
        text-align: left;
        font-size: 18px;
        border: 0;
        span {
          display: inline-block;
          height: 17px;
          line-height: 17px;
        }
        .sp-right {
          float: right;
        }
      }
      .unselect {
        height: 18px;
        width: 18px;
        margin: 0 10px 0 5px;
        background-image: url(../assets/images/chat/icon-select-delete.png);
        background-size: 100% 100%;
      }
      .session-list {
        height: calc(100% - 150px);
        margin-bottom: 15px;
        .item-right {
          text-align: left;
        }
      }
      .cannel {
        margin-right: 30px;
      }
    }
    .two-btn {
      margin-top: 10px;
    }
  }
}
</style>
