<template>
  <div class="session-box">
    <div class="search-box">
      <div class="search-input">
        <i class="icon-search"></i>
        <input type="text" :placeholder="$t('msg.menu.search')" @focus="showSearch = true" v-model="searchKey" />
        <i class="icon-delete" @click="searchKey = '';showSearch=false" v-if="searchKey || showSearch"></i>
      </div>
    </div>
    <div class="session-list" :id="showSearch?'':'session-list-dialog'" ref="sessionList" v-scrollBar>
      <ul v-if="!searchKey && !showSearch">
        <li class="session-list-item display-flex is-top" :class="item.isActivity?'active':''" @click="clickChat(item)"
          v-for="item in topList" :key="item.paramId+'-'+item.fromType" :data-index="`{%type%:%session%,%session%:${item.paramId},%sessionType%:${item.fromType}}`"
          @mouseenter="enter($event)" @mouseleave="callshow=false"
        >
          <div class="item-left">
            <img
              ondragstart="return false"
              :src="global.fileDownUrl + 'compress/' + item.img"
              class="avatar"
              v-headError
              v-if="(item.fromType == 0 || item.fromType == 2 ||item.fromType == 1) && item.img"
            />
            <span
              class="default"
              v-defaultHead
              v-if="(item.fromType == 0 || item.fromType == 1) && !item.img" v-html="item.name"
              ></span>
            <div
              :class="[
                'audio-video',
                andioVideoInfo.vType == 1 ? 'video' : 'audio'
              ]"
              v-if="
                andioVideoInfo.fromId == item.paramId ||
                  andioVideoInfo.receiverId == item.paramId
              "
            ></div>
            <span
              :class="!item.isInterruption?'icon-badge':'icon-badge-none'"
              v-if="isBageNum(item.unreadNum,item.isActivity)" >
              {{!item.isInterruption?numFitler(item.unreadNum):''}}</span >
          </div>
          <div class="item-right">
            <div class="call display-flex" v-if="callshow&& (andioVideoInfo.fromId == item.paramId || andioVideoInfo.receiverId == item.paramId)">
                <p class="callname" :class="{verify: item.fromType==2}" v-html="item.name"></p>
                <img src="../assets/images/icon/Delete.png" @click="closecall">
            </div>
            <div v-else>
                <div class="time">{{ item.userTime | timeFilter }}</div>
            <p class="name" v-html="item.name"></p>
            <p class="lastmsg">
              <span
                v-if="
                  atList[item.paramId] &&
                    atList[item.paramId].length &&
                    !item.isActivity
                "
                style="color: #FF4E4E"
                >[{{ $t("msg.chatPanel.hadAt") }}]</span
              >
              <span
                v-if="
                  groupInvite[item.paramId] &&
                    groupInvite[item.paramId].length &&
                    !item.isActivity &&
                    !(atList[item.paramId] && atList[item.paramId].length)
                "
                style="color: #FF4E4E"
                >{{
                  "[" +
                    groupInvite[item.paramId].length +
                    $t("msg.common.application") +
                    "]"
                }}</span
              >
              <span
                v-if="
                  item.draft &&
                    !item.isActivity &&
                    !(atList[item.paramId] && atList[item.paramId].length) &&
                    !(
                      groupInvite[item.paramId] &&
                      groupInvite[item.paramId].length
                    )
                "
              >
                <span style="color: #FF4E4E"
                  >[{{ $t("msg.common.draft") }}]</span
                >
                <span>{{ item.draft | filterAt }}</span>
              </span>
              <span
                v-if="
                  !(
                    item.draft &&
                    !item.isActivity &&
                    !(atList[item.paramId] && atList[item.paramId].length)
                  )
                "
                >{{ item.preview }}</span
              >
            </p>
            <div class="setting">
              <i class="notice-icon" v-if="item.isInterruption"></i>
              <i class="top-icon"></i>
            </div>
            </div>
            
          </div>
        </li>
      </ul>
      <ul v-if="!searchKey && !showSearch">
        <li
          class="session-list-item display-flex"
          :class="item.isActivity?'active':''"
          @click="clickChat(item)"
          v-for="item in normalList"
          :key="item.paramId+'-'+item.fromType"
          :data-index="`{%type%:%session%,%session%:${item.paramId},%sessionType%:${item.fromType}}`"
          @mouseenter="enter($event)" @mouseleave="callshow=false"
        >
          <div class="item-left">
            <img
            ondragstart="return false"
              :src="global.fileDownUrl + 'compress/' + item.img"
              class="avatar"
              v-headError
              v-if="(item.fromType == 0 || item.fromType == 2 || item.fromType == 1) && item.img"
            />
            <span
              class="default"
              v-defaultHead
              v-if="(item.fromType == 0 || item.fromType == 1) && !item.img" v-html="item.name"
              ></span>
            <div
              :class="[
                'audio-video',
                andioVideoInfo.vType == 1 ? 'video' : 'audio'
              ]"
              v-if="
                andioVideoInfo.fromId == item.paramId ||
                  andioVideoInfo.receiverId == item.paramId
              "
            ></div>
            <span
              :class="!item.isInterruption?'icon-badge':'icon-badge-none'"
              v-if="isBageNum(item.unreadNum,item.isActivity)"
              >{{!item.isInterruption?numFitler(item.unreadNum):''}}</span>
            <img
              src="../assets/images/verify.png"
              class="verify"
              v-if="item.fromType == 2"
            />
          </div>
          <div class="item-right">
            <div class="call display-flex" v-if="callshow&& (andioVideoInfo.fromId == item.paramId || andioVideoInfo.receiverId == item.paramId)">
                <p class="callname" :class="{verify: item.fromType==2}" v-html="item.name"></p>
                <img src="../assets/images/icon/Delete.png" @click="closecall">
            </div>
            <div  v-else>
                  <div class="time">{{ item.userTime | timeFilter }}</div>
                  <p class="name" :class="{verify: item.fromType==2}" v-html="item.name"></p>
                  <p class="lastmsg">
                    <span
                      v-if="
                        atList[item.paramId] &&
                          atList[item.paramId].length &&
                          !item.isActivity
                      "
                      style="color: #FF4E4E"
                      >[{{ $t("msg.chatPanel.hadAt") }}]</span
                    >
                    <span
                      v-if="
                        groupInvite[item.paramId] &&
                          groupInvite[item.paramId].length &&
                          !item.isActivity &&
                          !(atList[item.paramId] && atList[item.paramId].length)
                      "
                      style="color: #FF4E4E"
                      >{{
                        "[" +
                          groupInvite[item.paramId].length +
                          $t("msg.common.application") +
                          "]"
                      }}</span
                    >
                    <span
                      v-if="
                        item.draft &&
                          !item.isActivity &&
                          !(atList[item.paramId] && atList[item.paramId].length) &&
                          !(
                            groupInvite[item.paramId] &&
                            groupInvite[item.paramId].length
                          )
                      "
                    >
                      <span style="color: #FF4E4E"
                        >[{{ $t("msg.common.draft") }}]</span
                      >
                      <span>{{ item.draft | filterAt }}</span>
                    </span>
                    <span
                      v-if="
                        !(
                          item.draft &&
                          !item.isActivity &&
                          !(atList[item.paramId] && atList[item.paramId].length)
                        )
                      "
                      >{{ item.preview }}</span
                    >
                  </p>
                  <div class="setting">
                    <i class="notice-icon" v-if="item.isInterruption"></i>
                  </div>
            </div>
          </div>
        </li>
      </ul>
      <!-- 搜索结果 -->
      <ul class="session-list friend result" v-if="searchKey || showSearch">
        <section v-if="!searchKey">
          <div class="search-record" @click.stop="showSearchRecord">
            <i></i>{{ $t("msg.search.title") }}
          </div>
        </section>
        <section v-if="searchKey">
          <div
            class="search-title"
            v-show="friendsResult && friendsResult.length"
          >
            {{ $t("msg.menu.contact") }}
          </div>
          <li
            class="session-list-item display-flex"
            :class="{ search: item.paramId == currentSession.paramId }"
            @click="clickChat(item)"
            v-for="item in friendsResult"
            :key="item.paramId+'-'+item.fromType + 999"
          >
            <div class="item-left">
              <img class="avatar" :src="global.fileDownUrl + 'compress/' + item.img" ondragstart="return false" v-headError />
              <span
                class="default"
                v-defaultHead
                v-if="!item.img"
                v-html="item.name"
              ></span>
            </div>
            <div class="item-right">
              <p class="name-top" v-keyWord="searchKey" v-html="item.name"></p>
              <p class="name-bottom" v-if="!(item.isAlias && aliasKey)">
                EchatAPP ID：<span v-keyWord="searchKey" v-html="item.paramId"></span>
              </p>
              <p class="name-bottom" v-if="item.isAlias && aliasKey">
                @<span v-html="item.tempAlias"></span>
              </p>
            </div>
          </li>
          <div class="search-title" v-show="groupResult && groupResult.length">
            {{ $t("msg.menu.group") }}
          </div>
          <li
            class="session-list-item display-flex"
            :class="{ search: item.paramId == currentSession.paramId }"
            @click="clickChat(item)"
            v-for="(item, index) in groupResult"
            :key="index"
          >
            <div class="item-left">
              <img class="avatar" ondragstart="return false" :src="global.fileDownUrl + 'compress/' + item.img" v-headError />
              <span
                class="default"
                v-defaultHead
                v-if="!item.img"
                v-html="item.name"
              ></span>
            </div>
            <div class="item-right">
              <p class="name-top" v-keyWord="searchKey" v-html="item.name"></p>
              <p class="name-bottom">
                {{ $t("msg.friendList.group") }}ID：<span v-keyWord="searchKey"
                  v-html="item.paramId"
                ></span>
              </p>
            </div>
          </li>
          <div
            class="search-all"
            v-show="!showAll && chatList.length > 5"
            @click="showAll = true"
          >
            {{ $t("msg.friendList.showAll") }}({{ chatList.length }})
          </div>
          <div
            class="search-all"
            v-show="showAll && chatList.length > 5"
            @click="showAll = false"
          >
            {{ $t("msg.friendList.pickUp") }}
          </div>
          <!-- 搜索的用户 -->
          <div class="search-title" v-show="showAlias && aliasList && aliasList.length">
            {{ $t("msg.menu.searchUser") }}
          </div>
          <li 
            class="session-list-item display-flex"
            :class="tempParamId==item.userId?'active':''"
            v-show="showAlias"
            v-for="(item, index) in aliasList"
            @click="clickAlias(item)"
            :key="index"
          >
            <div class="item-left">
              <img class="avatar"  ondragstart="return false" :src="global.fileDownUrl + 'compress/'+item.avatar" v-headError />
            </div>
            <div class="item-right">
              <p class="name-top" v-html="item.nickName"></p>
              <p class="name-bottom">
                @<span v-keyWord="aliasKey" v-html="item.alias"></span>
              </p>
            </div>
          </li>
          <!-- 无匹配搜索记录 -->
          <div
            class="search-none"
            v-show="
              !(
                (groupResult && groupResult.length) ||
                (friendsResult && friendsResult.length) ||
                (aliasList && aliasList.length)
              )
            "
          >
            <img class="img" ondragstart="return false" src="../assets/images/chat/search-none.png" />
            <p class="text">{{ $t("msg.friendList.searchKey") }}</p>
          </div>
          <!-- 加载中 -->
          <loading v-if="showLoading"></loading>
          
        </section>
      </ul>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import Msg from "@/tools/msg";
import { MessageHandler } from "@/tools/messageHandler";
import { localStore } from "@/tools/localStorage";
import { face } from "@/tools/emoji";
import "@/common/pinyin";
import { group } from "@/session/group";
import { sessionUtil } from "@/session/sessionUtil";
import { msgManager } from "@/session/msgManager";

export default {
  name: "chatList",
  data() {
    return {
      showSearch:false,
      showAlias:false,
      showLoading:false,
      aliasList: [],
      aliasKey: "",
      searchKey: "",
      friendsResult: [],
      groupResult: [],
      allGroupUsers: {},
      showAll: false,
      groupInvite: {},
      unreadNumAll:0,/**所有未读数量 */
      initUnreadNumAll:false, /**是否已经初始化未读 */
      tempParamId:0,
      callshow:false
    };
  },
  computed: {
    ...mapGetters([
      "userId",
      "andioVideoInfo",
      "session",
      "currentSession",
      "atList",
      "verifyGroup",
      "hasCurrentMsg",
      "videoclose"
    ]),
    chatList() {

      //每次消息发送与接收都会触发一次全遍历
      let arr = Object.values(this.session.record);
      this.setUnReadNum(arr);

      if (!this.searchKey) {
        return arr;
      } else {
        let list = [];
        for (var i = 0; i < arr.length; i++) {
          let item = arr[i];
          if(!item.name) continue
          item.isAlias = false;
          let m = PinyinMatch.match(item.name, this.searchKey);
          if (m || (item.paramId + "").indexOf(this.searchKey) >= 0) {
            list.push(item);
          }
          if(this.searchKey.substr(0,1)=='@' && this.searchKey.length>1){
            this.aliasKey = this.searchKey.substr(1,this.searchKey.length - 1);
            if(item.alias && item.alias.indexOf(this.aliasKey) >= 0){
              item.isAlias = true;
              let alias = (item.alias + "").split(this.aliasKey);
              let tempAlias = alias.join(
                '<span class="search-key">' + this.aliasKey + "</span>"
              );
              item["tempAlias"] = tempAlias;
              list.push(item);
            }
          }
        }
        return list;
      }
      this.resultFilter();
    },
    /**置顶会话 */
    topList() {
      let arr1 = [];
      this.chatList.forEach(v => {
        if (v.isTop) {
          arr1.push(v);
        }
      });
      arr1.sort((a, b) => b.userTime - a.userTime);
      return arr1;
    },
    /**
     * 一般会话
     */
    normalList() {
      let arr1 = [];
      this.chatList.forEach(item => {
        if (!item.isTop) {
          arr1.push(item);
        }
      });
      arr1.sort((a, b) => b.userTime - a.userTime);
      return arr1;
    },
    /**临时会话 */
    tempFriend() {  
      let arr1 = [];
      this.chatList.forEach(v => {
        if (v.fromType == 0) {
          arr1.push(v);
        }
      });
      arr1.sort((a, b) => b.userTime - a.userTime);
      return arr1;
    },
    /**临时群 */
    tempGroup() {
      let arr1 = [];
      this.chatList.forEach(v => {
        if (v.fromType == 1) {
          arr1.push(v);
        }
      });
      arr1.sort((a, b) => b.userTime - a.userTime);
      return arr1;
    }
  },
  watch: {
    searchKey(ov, nv) {
      this.resultFilter();
    },
    showAll() {
      this.resultFilter();
    },
    verifyGroup() {
      setTimeout(() => {
        this.inviteHandler();
      }, 200);
    }
  },
  methods: {
    enter(e){
    if(e.currentTarget.firstChild.children.length==1){
      return
    }else{
      this.callshow=true
    }
  },
  closecall(){
      this.$store.commit("SET_VIDEOCLOSE", true);
  },
    showSearchRecord(){
      this.searchKey = '';
      this.showSearch=false;
      this.$parent.$parent.$refs.searchRecord.show();
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
    setUnReadNum(list) {
      var allReadNum = 0;
      for (var i = 0; i < list.length; i++) {
        var item = list[i];
        if (!item.isInterruption) {
          if(!item.unreadNum) item.unreadNum=0
          allReadNum += item.unreadNum;
        }
      }
      this.unreadNumAll=allReadNum;
      this.$store.commit("SET_UNREAD_NUMBER", {
        unReadNum: allReadNum,
        newFriendsNum: this.$store.state.redPoint.newFriendsNum
      });
    },
    resultFilter(){
      let friendLength = this.tempFriend.length;
      let groupLength = this.tempGroup.length;
      this.friendsResult = [];
      this.groupResult = [];
      setTimeout(()=> {
        if (!this.showAll) {
          if (friendLength > 5) {
            this.friendsResult = this.tempFriend.slice(0, 5);
            this.groupResult = [];
          } else {
            this.friendsResult = this.tempFriend;
            this.groupResult = this.tempGroup.slice(0, 5 - friendLength);
          }
        } else {
          this.friendsResult = this.tempFriend;
          this.groupResult = this.tempGroup;
        }
        this.searchAlias();
      }, 10);
        
    },
    searchAlias(){

      if(!(this.searchKey.substr(0,1)=='@' && this.searchKey.length>5)){
        this.showAlias=false;
        this.aliasList=[];
        this.aliasKey='';
        return false;
      }
      //显示搜索的用户
      this.showAlias=true;
      this.aliasList=[];
      this.friendsResult = [];
      this.groupResult = [];
      this.aliasKey = this.searchKey.substr(1,this.searchKey.length - 1);
      this.showLoading=true;
      this.$http.getAliasList({
        'page':1,
        'rows':100,
        'params[alias]':this.aliasKey
      }).then(data=>{
        this.showLoading=false;
        if(data && data.list && data.list.length) this.aliasList = this.removeMyself(data.list);
      },() => {
        this.showLoading=false;
      })
    },
    removeMyself(list){
      let result = [];
      for (var i = 0; i < list.length; i++) {
        let item = list[i];
        if(item.userId!=this.userId) result.push(item)
      }
      return result;
    },
    clickAlias(item){

      let id = item.userId;
      this.tempParamId = item.userId;
      if (
        this.$store.state.friendList[id] &&
        !this.$store.state.friendList[id].temp
      ) {
        this.startSession(item);
      }else{
        let obj = {
          sessionId: item.userId,
          state: 8,
          describe: item.userId+','+this.$t("msg.user.usernameSearch")
        };
        this.$http.startTempSession(obj).then(() => {
          item.temp = true;
          this.$store.commit("ADD_FRIEND_INFO", {
            userId: item.userId,
            info: item
          });
          this.startSession(item);
        });
      }
    },
    startSession(item){

      var chat = this.$store.state.session.record[item.userId+'-0'];
      if(!chat){
        chat = {
          img: item.avatar,
          lastReadId: 0,
          mId: 0,
          fromType: 0,
          msgType: 1,
          preview: "",
          userTime: new Date().getTime(),
          name: item.nickName,
          paramId: item.userId,
          isTop: 0,
          isInterruption: 0,
          temp: true,
          describe:item.userId+','+this.$t("msg.user.usernameSearch"),
          isActivity: true,
        };
        this.$store.commit("UPDATE_SESSION", chat);
      }
      this.$store.commit("CLEAR_MESSAGE", {});
      setTimeout(() => {
        let sessionCache= this.$store.state.session.record;
        for(let key in sessionCache){
          if(sessionCache[key].isActivity){
            sessionCache[key].isActivity=false;
          }        
        }
        chat.isActivity=true;
        this.$store.commit("UPDATE_CURRENT_SESSION", chat);
      }, 500);
    },
    scrollChat(n){
      this.$refs.sessionList.scrollTop = n*62;
    },
    clickChat(item){
      
      if (item.isActivity && (this.tempParamId && this.tempParamId == item.paramId)) return;
      this.tempParamId = item.paramId;

      //查找是否有消息找回失败集合
      let msgFindArray=sessionUtil.getMsgFindFailLocalSession();
      if(msgFindArray){
        for(let i=0;i<msgFindArray.length;i++){
          let obj=JSON.parse(msgFindArray[i]);
          msgManager.getFaultMsgHttp(obj);
        }
      }

      //更新全局未读
      this.unreadNumAll=this.unreadNumAll-item.unreadNum;
      this.$store.commit("SET_UNREAD_NUMBER", {
        unReadNum: this.unreadNumAll
      });

      let fromTypeCache;
      let fromIdCache;
      let mIdCache;
      let sessionCache= this.$store.state.session.record;
      for(let key in sessionCache){
        let sCache=sessionCache[key];
        if(sCache.isActivity){
          sCache.isActivity=false;
          fromTypeCache=sCache.fromType;
          fromIdCache=sCache.paramId;
          mIdCache=sCache.mId;
        }        
      }

      this.$set(item, "isActivity", true);
      // item.lastReadId=item.mId;
      item.isActivity=true;
      item.unreadNum=0;
      this.refreshChatList(item);
      if(item.fromType==1){
        //点击是群的时候，读取群成员
        group.getGroupMember(item.paramId).then(data =>{
          this.$store.commit("SET_GROUP_MEMBER", data);
          this.resetPreItem(item,fromTypeCache,fromIdCache,mIdCache);
        })
      }else{
          this.resetPreItem(item,fromTypeCache,fromIdCache,mIdCache);
      }

      let audio = document.getElementById("message-voice");
      audio.pause();
    },

    /**
     * 重置上一节点引用
     */
    resetPreItem(item,fromTypeCache,fromIdCache,mIdCache){
      this.$store.commit("UPDATE_CURRENT_SESSION", item);
      if(this.hasCurrentMsg){
        this.$store.dispatch("getSessionList", {
          time: sessionUtil.getlocalSessionTime(),
          froms: fromIdCache+ "-" + fromTypeCache + "-" + mIdCache
        }).then(data => {
          sessionUtil.setLocalSessionTime(data.time);
        });
        this.$store.commit("SET_HAS_CURRENT_MSG", false);
      }
    },

    refreshChatList(param) {
      let session = JSON.parse(JSON.stringify(param));
      this.$store.commit("UPDATE_SESSION", session);
    },
    inviteHandler() {
      //群邀请提示
      if (!localStore.getStore("inviterCode_" + this.userId)) return;

      let inviteObj = JSON.parse(
        localStore.getStore("inviterCode_" + this.userId)
      );

      for (let key in inviteObj) {
        let list = [];
        for (let i = 0; i < inviteObj[key].length; i++) {
          if (inviteObj[key][i].show) {
            list.push(inviteObj[key][i]);
          }
        }

        inviteObj[key] = list;
      }

      this.groupInvite = inviteObj;
    },
    isBageNum(unreadNum,isActivity){
      if(unreadNum > 0 && !isActivity){
          return true;
      }else{
          return false;
      }
    },
    numFitler(n) {
      if (n) {
        if (n > 99) return "99+";
        else return n;
      }
    },
    getScrollNum(){
      let num = 0;
      for (var i = this.topList.length - 1; i >= 0; i--) {
        let item = this.topList[i];
        if(item.isActivity){
          return num;
        }
      }
      for (var i = this.normalList.length - 1; i >= 0; i--) {
        let item = this.normalList[i];
        if(item.isActivity){
          return num = this.topList.length + i;;
        }
      }
    },
  },
  mounted() {
    if(this.currentSession.paramId){
      //代表当前选中事件
      let num=this.getScrollNum();
      console.log(num);
      this.scrollChat(num);
    }
    console.log(this.$options.name+" 被创建");
    setTimeout(() => {
      this.inviteHandler();
    }, 300);
  },
  destroyed(){
    console.log(this.$options.name+" 被销毁");
    let record=this.session.record;
    for(let key in record){
      record[key].isActivity=false;
    }
  },
  filters: {
    filterAt(draft) {
      const atInputReg = new RegExp(
        `<input.+?class="chat-panel-at-input".+?>`,
        "g"
      );
      let langIdx = 0;
      if (localStorage.lang == "en_US") langIdx = 1;
      if (localStorage.lang == "my") langIdx = 2;

      draft = Msg.replayFace(draft);
      draft = face.checkFaceI18n(draft, langIdx);
      if (draft.match(atInputReg)) {
        let arr = draft.match(atInputReg);
        for (let item of arr) {
          let str1 = item.split('nickname="')[1];
          let nickName = str1.split(" ")[0];
          draft = draft.replace(item, " @" + nickName + " ");
        }
      }
      draft = draft.replace(/&nbsp;/g, " ");
      draft = draft.replace(/<br>/g, " ");
      draft = draft.replace(/<\/?div>/gi, "");
      return draft;
    }
  }
};
</script>

<style lang="scss" scoped>
@import "../assets/css/var";
.call{
  justify-content: space-between;
  margin-top: 22px;
  .callname{
    font-size: 14px;
  }
}

.default{
  position:absolute;
  top:0;left:0;
}
.search-box {
  // height: 64px;
  .search-input {
    // position: relative;
    // top:40px;
    padding: 0 32px;
    z-index: 11;
    width: 254px;
    height: 29px;
    margin-left: 7px;
    input{
      font-size: 14px;
    }
  }
}
.search-record{
  position: relative;
  top: 30px;
  display: flex;
  justify-content: center;
  height:64px;
  line-height:64px;
  cursor:pointer;
  padding-right:5px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  i{
    display:inline-block;
    height:46px;
    width:46px;
    background-image: url(../assets/images/search/search.png);
    background-size: 100% 100%;
    vertical-align: middle;
    margin:8px 12px 8px 8px;
  }
  &:hover{
    background:#e7eef3;
  }
}
</style>
