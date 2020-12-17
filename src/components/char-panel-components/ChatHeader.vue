<template>
  <div class="header-menu display-flex" @click.stop=";" v-if="currentSession.fromType != '2'">
    <draggable 
      class="menu-show"
      element="ul"
      :list="menuBox"
      :options="{group:'title',animation:150}"
      @start="boxStart"
      @end="end"
        >
      <li 
        v-for="(item , idx) in menuBox" 
        @click="clickMenu(item)"
        :class="{stick:currentSession.isTop,disturbing:currentSession.isInterruption,showUserName:currentSession.isShowMemberNick,inBlack:inBlack}"
        :key="idx"
      >  <span class="icon" :title="title[item.title]" :class="item.type"></span>
      </li>
    </draggable>
    <div class="menu setting" :class="{ active: layout.module == 'cp' && layout.child == 'ch' }" @click="openMenu">
      <section class="menu-select" v-show="layout.module == 'cp' && layout.child == 'ch'">
        <draggable 
          element="ul"
          :list="menuSelect"
          :disabled="menuDisabled"
          :options="{group:'title',animation:150}"
          @start="start"
          @end="end"
        >
          <li 
            v-if="currentSession.fromType>=item.fromType" 
            v-for="(item , idx) in menuSelect" 
            @click.stop="clickMenu(item)"
            :class="{hasline:idx==2,stick:currentSession.isTop,disturbing:currentSession.isInterruption,showUserName:currentSession.isShowMemberNick,inBlack:inBlack}"
            :key="idx"
          >
            <i class="icon" :class="item.type"></i>
            <span class="text" :title="title[item.title]"> {{ title[item.title] }}</span>
            <div class="line" v-if="idx==2"></div>
          </li>
        </draggable>
        <!-- <div class="line"></div> -->
        <ul>
          <li :class="{disturbing:currentSession.isInterruption}" v-if="currentSession.temp" @click.stop="modifyFriend('isInterruption')">
            <i class="icon disturbing"></i>
            <span
              class="text"
              :title="$t('msg.chatSetting.disturbing')"
              >{{ $t("msg.chatSetting.disturbing") }}</span>
          </li>
          <li :class="{stick:currentSession.isTop}" v-if="currentSession.temp" @click.stop="modifyFriend('isTop')">
            <i class="icon stick"></i>
            <span
              class="text"
              :title="$t('msg.chatSetting.stick')"
              >{{ $t("msg.chatSetting.stick") }}</span>
          </li>
          <li v-if="currentSession.temp&&currentSession.isFriend!=1" @click.stop="showRemark = true">
            <i class="icon addFriend"></i>
            <span
              class="text"
              :title="$t('msg.menu.addFriend')"
              >{{ $t("msg.menu.addFriend") }}</span>
          </li>
          <li :class="{inBlack:inBlack}" v-if="currentSession.temp" @click.stop="doShield">
            <i class="icon doShield"></i>
            <span
              class="text"
              :title="$t('msg.menu.doShield')"
              >{{ $t("msg.menu.doShield") }}</span>
          </li>
          <li @click.stop="showCleanHistory = true">
            <i class="icon clean"></i>
            <span
              class="text"
              :title="$t('msg.chatSetting.clearChatHistory')"
              >{{ $t("msg.chatSetting.clearChatHistory") }}</span>
          </li>
          <li @click.stop="modifyClear">
            <i class="icon autoClean"></i>
            <span
              class="text"
              :title="$t('msg.chatSetting.autoClean')"
              >{{ $t("msg.chatSetting.autoClean") }}</span>
            <span class="triangle" :class="{ active: showClear }" ></span>
            <div class="clear-menu" v-if="showClear" @click.stop=";">
              <ul class="menu-list">
                <li class="menu-item display-flex" @click="setCycle(0)">
                  <span
                    class="menu-icon"
                    :class="{ active: clearType == 0 }"
                  ></span>
                  <span
                    class="flex-item-nowrap"
                    :title="$t('msg.chatSetting.never')"
                    >{{ $t("msg.chatSetting.never") }}</span
                  >
                </li>
                <li class="menu-item display-flex" @click="setCycle(1)">
                  <span
                    class="menu-icon"
                    :class="{ active: clearType == 1 }"
                  ></span>
                  <span
                    class="flex-item-nowrap"
                    :title="$t('msg.chatSetting.one')"
                    >{{ $t("msg.chatSetting.one") }}</span
                  >
                </li>
                <li class="menu-item display-flex" @click="setCycle(2)">
                  <span
                    class="menu-icon"
                    :class="{ active: clearType == 2 }"
                  ></span>
                  <span
                    class="flex-item-nowrap"
                    :title="$t('msg.chatSetting.three')"
                    >{{ $t("msg.chatSetting.three") }}</span
                  >
                </li>
                <li class="menu-item display-flex" @click="setCycle(3)">
                  <span
                    class="menu-icon"
                    :class="{ active: clearType == 3 }"
                  ></span>
                  <span
                    class="flex-item-nowrap"
                    :title="$t('msg.chatSetting.seven')"
                    >{{ $t("msg.chatSetting.seven") }}</span
                  >
                </li>
                <li class="menu-item display-flex" @click="setCycle(4)">
                  <span
                    class="menu-icon"
                    :class="{ active: clearType == 4 }"
                  ></span>
                  <span
                    class="flex-item-nowrap"
                    :title="$t('msg.chatSetting.thirty')"
                    >{{ $t("msg.chatSetting.thirty") }}</span
                  >
                </li>
              </ul>
            </div>
          </li>
          <li v-if="currentSession.fromType == 1 && isAdmin >= 1" @click.stop="openMore">
            <i class="icon more"></i>
            <span
              class="text"
              :title="$t('msg.chatSetting.moreSetting')"
              >{{ $t("msg.chatSetting.moreSetting") }}</span>
          </li>
          <li v-if="currentSession.fromType == 1 && isAdmin != 1" @click.stop="showConfirm = true">
            <span
              class="text color"
              :title="$t('msg.chatSetting.deleteExit')"
              >{{ $t("msg.chatSetting.deleteExit") }}</span>
          </li>
          <li v-if="currentSession.fromType == 1 && isAdmin == 1" @click.stop="showConfirm = true">
            <span
              class="text color"
              :title="$t('msg.chatSetting.dissolveChat')"
              >{{ $t("msg.chatSetting.dissolveChat") }}</span>
          </li>
        </ul>
      </section>
    </div>
    <!-- 打开详情 -->
    <div
      class="menu more"
      :class="{ active: layout.module == 'gp-inf' || layout.module == 'fd-inf' }"
      @click.stop="showInformation"
      v-if="!currentSession.temp"
    ></div>
    <!-- 清理聊天记录弹窗 -->
    <transition name="pop">
      <Popup :title="$t('msg.common.warn')"
        @click.native="showCleanHistory=false;" 
        :hideClose="true"
        v-if="showCleanHistory"
      >
        <div class="logout" @click.stop="" slot="body">
          <div class="logout-detail">{{ $t("msg.chatSetting.clearChatHistoryAsk") }}</div>
          <button class="cannel" @click="showCleanHistory=false">
            {{ $t("msg.common.cancel") }}
          </button>
          <button class="comfirm" @click="clearChatHistory">
            {{ $t("msg.chatSetting.clearChatHistoryOkButton") }}
          </button>
        </div>
      </Popup>
    </transition>
    <!-- 退群二次弹层 -->
    <div class="my-popup quit-confirm"
      v-show="showConfirm"
      @click.stop="showConfirm = false"
    >
      <div class="quit-content">
        <div class="quit-head">!</div>
        <p>{{ $t("msg.chatSetting.title") }}</p>
        <button class="comfirm" v-show="isAdmin != 1" @click="doUserQuit()">
          {{ $t("msg.chatSetting.exit") }}
        </button>
        <button class="comfirm" v-show="isAdmin == 1" @click="doQuitDelete()">
          {{ $t("msg.chatSetting.dissolve") }}
        </button>
        <button class="cannel" @click="showConfirm = false">
          {{ $t("msg.common.cancel") }}
        </button>
      </div>
    </div>
    <!-- 添加好友 -->
    <EditPopup 
      v-model="showRemark"
      :title="$t('msg.menu.addFriend')"
      :placeholderText="$t('msg.tip.verifyInfo1')" 
      @change="doAddFriend" 
      v-if="showRemark"
    ></EditPopup>
    <!-- 截图插件 -->
    <screenshot v-if="layout.child == 'ss'"></screenshot>
    <group-more-setting ref="forbidden"></group-more-setting>
  </div>
</template>

<script>
import draggable from "vuedraggable"
import Screenshot from "./Screenshot";
import { localStore } from "@/tools/localStorage";
import GroupMoreSetting from "./GroupMoreSetting";
import { msgManager } from "@/session/msgManager";
import { friend } from "@/session/friend";
import { group } from "@/session/group";
import { mapGetters } from "vuex";
export default {
  name: "chat-header",
  data() {
    return {
      isAdmin: 0,
      title:{
        audioCall:this.$t('msg.common.audioCall'),
        videoCall:this.$t('msg.common.videoCall'),
        screen:this.$t('msg.chatPanel.screen'),
        showUserName:this.$t('msg.chatSetting.showUserName'),
        addFriend:this.$t('msg.menu.addFriend'),
        doShield:this.$t('msg.menu.doShield'),
        unShield:this.$t('msg.menu.unShield'),
        disturbing:this.$t('msg.chatSetting.disturbing'),
        stick:this.$t('msg.chatSetting.stick'),
        clearChatHistory:this.$t('msg.chatSetting.clearChatHistory'),
        autoClean:this.$t('msg.chatSetting.autoClean'),
        moreSetting:this.$t('msg.chatSetting.moreSetting'),
      },
      menuBox:[],
      menuSelect:[],
      menuTemp:[
        /*{
          title: 'disturbing',
          type: 'disturbing',
          fromType: 0,
        },
        {
          title: 'stick',
          type: 'stick',
          fromType: 0,
        },
        {
          title: 'addFriend',
          type: 'addFriend',
          fromType: 0,
        },
        {
          title: 'doShield',
          type: 'doShield',
          fromType: 0,
        },*/
      ],
      menuList:[
        {
          title: 'screen',
          type: 'screen',
          fromType: 0,
        },
        {
          title: 'videoCall',
          type: 'video',
          fromType: 0,
        },
        {
          title: 'audioCall',
          type: 'voice',
          fromType: 0,
        },
        {
          title: 'showUserName',
          type: 'showUserName',
          fromType: 1,
        },
        {
          title: 'disturbing',
          type: 'disturbing',
          fromType: 0,
        },
        {
          title: 'stick',
          type: 'stick',
          fromType: 0,
        },
        /*{
          title: 'clearChatHistory',
          type: 'clean',
          fromType: 0,
        },
        {
          title: 'autoClean',
          type: 'autoClean',
          fromType: 0,
        },*/
      ],
      menuDisabled:false,
      inBlack:false,
      show:false,
      showMenu:false,
      showClear:false,
      text:'',
      showRemark: false,
      showConfirm: false,
      showCleanHistory:false,
    };
  },
  components: {
    draggable,
    Screenshot,
    GroupMoreSetting,
  },
  computed: {
    ...mapGetters(["userInfo", "currentSession", "andioVideoInfo", "session", "layout"])
    ,
    chatList() {
      let arr = Object.values(this.session.record);
      arr = arr.sort((a, b) => b.userTime - a.userTime);
      return arr;
    }
  },
  watch: {
    "currentSession.paramId"(newValue, oldValue) {

      this.menuSelect = JSON.parse(JSON.stringify(this.menuList));
      this.menuBox = [];
      this.showMenu = false;
      this.showClear = false;
      this.menuDisabled = false;

      //临时会话禁用拖拽
      if(this.currentSession.temp==true){
        this.menuSelect = this.menuTemp;
      }
      if(this.currentSession.menuBox && this.currentSession.menuBox.length){
        this.menuBox = this.currentSession.menuBox
        this.menuSelect = this.currentSession.menuSelect
      }
      //退群参数
      if (this.currentSession.fromType == "1") {

        let self=this.$store.state.activityGroupMembers[this.userInfo.userId];
        if(!self){
          self={};
        }
        let admin = self.isAdmin;
        this.isAdmin = admin;
      }
    },
    "currentSession.temp"(newValue, oldValue) {

      this.menuSelect = JSON.parse(JSON.stringify(this.menuList));
      //临时会话禁用拖拽
      if(this.currentSession.temp==true){
        this.menuSelect = this.menuTemp;
      }
      if(this.currentSession.menuBox && this.currentSession.menuBox.length){
        this.menuBox = this.currentSession.menuBox
        this.menuSelect = this.currentSession.menuSelect
      }
      
    },
    "$parent.friendInfo"(newValue, oldValue) {

      this.friend = this.$parent.friendInfo;
      if (this.$parent.friendInfo.isBlacklist) {
        this.inBlack = true;
      } else {
        this.inBlack = false;
      }
    },
    menuBox(){
      //达到3个菜单禁用拖拽
      if(this.menuBox.length==3) this.menuDisabled = true;
      else this.menuDisabled = false;
      //拖拽后保存菜单
      let sessionCache=this.$store.state.session.record[this.currentSession.paramId+'-'+this.currentSession.fromType];
      sessionCache.menuBox = this.menuBox;
      sessionCache.menuSelect = this.menuSelect;
      this.$store.commit("UPDATE_SESSION", sessionCache);
    }
  },
  methods: {

    change(evt) {
      console.log(evt , 'change...')
    },
    boxStart(evt) {
      this.menuDisabled = false;
      this.drag = true
      console.log(evt , 'start...')
    },
    start(evt) {
      if(this.menuBox.length==3) this.menuDisabled = true;
      else this.menuDisabled = false;
      this.drag = true
      console.log(evt , 'start...')
    },
    end(evt) {
      console.log(evt , 'end....')
      this.drag = true
    },
    move(evt, originalEvent) {
      return false;
      console.log(evt , 'move')
    },
    openMenu() {

      if (this.layout.module == "cp" || this.layout.module == "ch") {
        this.showMenu = false;
        this.$store.dispatch("setLayout", ["", "", false]);
        return;
      }
      this.showMenu = true;
      this.$store.dispatch("setLayout", ["cp", "ch", false]);
    },
    //打开详情
    showInformation() {
      //临时会话禁止打开详情
      if(this.currentSession.temp) return;
      if (this.layout.module == "gp-inf" || this.layout.module == "fd-inf") {
        this.$store.dispatch("setLayout", ["", "", false]);
        return;
      }
      if (this.currentSession.fromType == 1) {
        this.$store.dispatch("setLayout", ["gp-inf", "gi", false]);
      } else {
        this.$store.dispatch("setLayout", ["fd-inf", "fi", false]);
      }
    },
    clickMenu(item){
      
      switch (item.type) {
        case "voice":
          this.showVideo(0);
          break;
        case "video":
          this.showVideo(1);
          break;
        case "screen":
          setTimeout(()=> {
            this.$store.dispatch("setLayout", ["cp", "ss", false]);
          }, 10);
          break;
        case "showUserName":
          this.modifyGroup('isShowMemberNick');
          break;
        case "disturbing":
          if(this.currentSession.fromType == 0) this.modifyFriend('isInterruption');
          if(this.currentSession.fromType == 1) this.modifyGroup('isInterruption');
          break;
        case "stick":
          if(this.currentSession.fromType == 0) this.modifyFriend('isTop');
          if(this.currentSession.fromType == 1) this.modifyGroup('isTop');
          break;
        case "addFriend":
          this.showRemark = true
          break;
        case "doShield":
          if(!this.inBlack) this.doShield()
          else this.unShield()
          break;
        default:
          return;
      }
    },
    doShield(){
      if(this.inBlack){
        this.unShield();
        return
      }
      let obj = {
        treatedIds: this.currentSession.paramId,
        state: this.friend.state
      };
      this.$http.addBlackList(obj).then(() => {
        this.$store.commit("SET_TOAST_TEXT", this.$t("msg.tip.forbiddenUser"));
        this.inBlack = true;
      });
    },
    unShield() {
      let obj = {
        treatedIds: this.currentSession.paramId
      };
      this.$http.removeBlackList(obj).then(() => {
        this.$store.commit(
          "SET_TOAST_TEXT",
          this.$t("msg.tip.unForbiddenUser")
        );
        this.inBlack = false;
      });
    },
    doAddFriend(text) {
      var postData = {
        recipient: this.currentSession.paramId,
        subtitle: text,
        source: this.friend.state,
        sourceDescribe: this.friend.sourceDescribe
      };
      this.$http.addFriend(postData);
      this.showRemark = false;
    },
    openMore(){
      this.$refs.forbidden.show()
    },
    modifyClear() {
      this.showClear = !this.showClear;
      this.clearType =
        localStore.readRegularCleaning(this.currentSession.paramId)
          .cleanMsgCycle || 0;
    },
    setCycle(type) {
      let confString = JSON.stringify({ cleanMsgCycle: type + "" });

      if (this.currentSession.fromType == "1") {
        let obj = {
          groupId: this.currentSession.paramId,
          confString: confString
        };
        this.$http.setGroupSetting(obj).then(
          () => {
            this.clearType = type;
            this.showClear = false;
            this.$store.dispatch("getReadNum", {
              groupId: this.currentSession.paramId
            });
          },
          () => {}
        );
      } else {
        let obj = {
          recipient: this.currentSession.paramId,
          confString: confString
        };
        this.$http.setFriendSetting(obj).then(() => {
          this.clearType = type;
          this.showClear = false;
          friend.getNetworkSession(this.currentSession.paramId);
        });
      }
    },
    modifyFriend(type) {
      let confString = "";
      if (type == "isTop") {
        if (this.currentSession.isTop == 0) {
          confString = JSON.stringify({ isTop: 1 });
        } else {
          confString = JSON.stringify({ isTop: 0 });
        }
      } else {
        if (this.currentSession.isInterruption == 0) {
          confString = JSON.stringify({ isInterruption: 1 });
        } else {
          confString = JSON.stringify({ isInterruption: 0 });
        }
      }
      let obj = {
        recipient: this.currentSession.paramId,
        confString: confString
      };

      if (this.currentSession.temp) {
        obj.type = 1;
      }

      this.$http.setFriendSetting(obj).then(() => {
        this.settingHandler(type);
      });
    },
    modifyGroup(type) {
      let confString = "";
      if (type == "isTop") {
        if (this.currentSession.isTop == 0) {
          confString = JSON.stringify({ isTop: 1 });
        } else {
          confString = JSON.stringify({ isTop: 0 });
        }
      } else if (type == "isInterruption") {
        if (this.currentSession.isInterruption == 0) {
          confString = JSON.stringify({ isInterruption: 1 });
        } else {
          confString = JSON.stringify({ isInterruption: 0 });
        }
      } else {
        if (this.currentSession.isShowMemberNick == 0) {
          confString = JSON.stringify({ isShowMemberNick: 1 });
        } else {
          confString = JSON.stringify({ isShowMemberNick: 0 });
        }
      }
      let obj = {
        groupId: this.currentSession.paramId,
        confString: confString
      };
      this.$http.setGroupSetting(obj).then(
        () => {
          this.settingHandler(type);
        },
        () => {}
      );
    },
    showVideo(i) {
      let vType = this.andioVideoInfo.vType;
      this.$store.dispatch("setLayout", ["", "", false]);
      if (this.currentSession.fromType != "0") {
        this.$store.commit("SET_TOAST_TEXT", this.$t("msg.tip.stay"));
        return;
      }
      let obj = {
        receiverId: this.currentSession.paramId, //被邀请者id
        groupId: null, //群id 群聊则传
        vType: i + ""
      };
      this.$store.commit("UPDATE_VIDEO_INFO", obj);
      var chat = this.$store.state.session.record[this.currentSession.paramId+'-'+this.currentSession.fromType];
      chat.userMessage = `[${
        i == 1
          ? this.$t("msg.common.videoCall")
          : this.$t("msg.common.audioCall")
      }]`;
      this.$store.commit("UPDATE_SESSION", chat);
    },
    //清理本地缓存数据
    clearChatHistory(){
      this.showCleanHistory=false;
      let sessionUserId=this.currentSession.paramId;
      let type=this.currentSession.fromType;
      this.$http.deleteMessage({
        sessionUserId: sessionUserId,
        type: type,
        folkMsgId: '-1'
      }).then(
        data => {
          // 清空本地数据
          msgManager.removeMsgAll(type,sessionUserId);
          if(sessionUserId==this.currentSession.paramId&&type==this.currentSession.fromType){
            this.$store.commit("CLEAR_MESSAGE", {});
          }                  
          //成功弹窗
          this.$store.commit('SET_TOAST_TEXT', this.$t("msg.tip.operateSuccess"))
      })
    },
    settingHandler(type) {
      switch (type) {
        case "isTop":
          if (this.currentSession.isTop == 0) {
            this.currentSession.isTop = 1;
          } else {
            this.currentSession.isTop = 0;
          }
          this.$store.commit("UPDATE_SESSION", this.currentSession);
          break;
        case "isInterruption":
          if (this.currentSession.isInterruption == 0) {
            this.currentSession.isInterruption = 1;
          } else {
            this.currentSession.isInterruption = 0;
          }
          this.$store.commit("UPDATE_SESSION", this.currentSession);
          break;
        case "isShowMemberNick":
          if (this.currentSession.isShowMemberNick == 0) {
            this.currentSession.isShowMemberNick = 1;
          } else {
            this.currentSession.isShowMemberNick = 0;
          }
          if (
            this.$parent.$refs.list.scrollTop + 500 >
            this.$parent.$refs.list.scrollHeight
          ) {
            setTimeout(() => {
              console.log(0)
              this.$parent.$refs.list.scrollTop = this.$parent.$refs.list.scrollHeight;
            }, 200);
          }
          this.$store.commit("UPDATE_SESSION", this.currentSession);
          break;
        default:
          return;
      }
    },
    doUserQuit() {

      this.$http
        .userQuit({
          groupId: this.currentSession.paramId
        })
        .then(data => {
          this.showConfirm = false;
          this.$store.dispatch("setLayout", ["", "", false]);
          this.updateSession();
          msgManager.removeMsgAll(this.currentSession.fromType,this.currentSession.paramId);
        });
    },
    doQuitDelete() {
      this.$emit("input", false);
      this.$http.deleteGroup({
          groupId: this.currentSession.paramId
        })
        .then(data => {
          this.showConfirm = false;
          this.$store.dispatch("setLayout", ["", "", false]);
          this.updateSession();
        });
      msgManager.removeMsgAll(this.currentSession.fromType,this.currentSession.paramId);
    },
    updateSession() {
      this.$store.commit("DELETE_SESSION", this.currentSession.paramId+'-'+this.currentSession.fromType);
      //删除群列表
      this.$store.commit("DEL_GROUP_LIST",this.currentSession.paramId);
      let sessionCache= this.$store.state.session.record;
      for(let key in sessionCache){
        if(sessionCache[key].isActivity){
          sessionCache[key].isActivity=false;
        }        
      }
      this.chatList[0].isActivity=true;

      this.$store.commit("UPDATE_CURRENT_SESSION", this.chatList[0]);
      group.getGroupAll(true);
    },
  },
  mounted() {
  }
};
</script>

<style lang="scss" scoped>
@import "../../assets/css/var";
.header-menu {
  position: absolute;
  top: 18px;
  right: 16px;
  .menu-show{
    position: relative;
    width: auto;
    min-width: 35px;
    height: 30px;
    margin-right:3px;
    li{
      float:left;
      height: 30px;
      line-height: 30px;
      width: 30px;
      margin-right:6px;
      text-align:center;
      cursor:pointer;
      overflow:hidden;
      user-select: none;
      &:hover{
        background:#f0f4f8;
      }
      &.showUserName{
        .icon.showUserName{
          background-position: -0 -119px;
        }
      }
      &.stick{
        .icon.stick{
          background-position: -0 -177px;
        }
      }
      &.disturbing{
        .icon.disturbing{
          background-position: -0 -137px;
        }
      }
      &.inBlack{
        .icon.doShield{
          background-position: -0 -21px;
        }
      }
      .icon{
        display:inline-block;
        position: relative;
        width: 30px;
        height: 30px;
        background: url(../../assets/images/chat/chat-menu-icon.png);
        vertical-align: middle;
        width: 20px; height: 18px;
        background-position: -0 -29px;
        &.addFriend{
          width: 20px; height: 23px;
          background: url(../../assets/images/chat/chat-menu-temp-icon.png);
          background-position: -0 -42px;
          margin:0 4px 0 5px;
        }
        &.doShield{
          width: 21px; height: 21px;
          background: url(../../assets/images/chat/chat-menu-temp-icon.png);
          background-position: -0 -0;
          margin:0 4px 0 5px;
        }
        &.voice{
          width: 30px; height: 30px;
          background: url(../../assets/images/chat/chat-menu-icon2.png);
          background-position: -0 -60px;
        }
        &.video{
          width: 30px; height: 30px;
          background: url(../../assets/images/chat/chat-menu-icon2.png);
          background-position: -0 -30px;
        }
        &.screen{
          width: 30px; height: 30px;
          background: url(../../assets/images/chat/chat-menu-icon2.png);
          background-position: -0 -0px;
          margin-bottom:5px;
        }
        &.showUserName{
          width: 18px; height: 18px;
          background-position: -0 -47px;
          margin:0 6px;
          &.active{
            background-position: -0 -119px;
          }
        }
        &.disturbing{
          width: 20px; height: 18px;
          background-position: -0 -65px;
          &.active{
            background-position: -0 -137px;
          }
        }
        &.stick{
          width: 20px; height: 22px;
          background-position: -0 -155px;
          &.active{
            background-position: -0 -177px;
          }
        }
        &.clean{
          width: 26px; height: 25px;
          background-position: -0 -199px;
          margin:0 2px;
        }
        &.autoClean{
          width: 17px; height: 18px;
          background-position: -0 -83px;
          margin:0 6px 0 7px;
        }
        &.more{
          width: 18px; height: 18px;
          background-position: -0 -101px;
          margin:0 6px;
        }
      }
    }
  }
  .menu-select{
    z-index:110;
    position:absolute;
    top:45px;left:-45px;
    height:auto;
    width:auto;
    white-space: nowrap;
    padding:14px 0;
    background:#fff;
    border-radius:10px;
    box-shadow: 0 0 10px #bbb;
    .line{
      position:relative;
      top:1px;left:52px;
      height:1px;width:72%;
      background:#e2e2e2;
      margin:5px 0;
    }
    &::after{
      content: "";
      position: absolute;
      top: -12px;
      left: 61px;
      width: 0;
      height: 0;
      margin-left: -11px;
      border-left: 11px solid transparent;
      border-right: 11px solid transparent;
      border-bottom: 12px solid #fff;
    }
    li{
      position:relative;
      height: 35px;
      line-height: 35px;
      width: auto;
      text-align:left;
      cursor:pointer;
      user-select: none;
      &.hasline{
        height: auto;
        .line{
          display:block;
          position:relative;
          top:1px;left:52px;
          height:1px;width:72%;
          background:#e2e2e2;
          margin:-5px 0 5px 0;
        }
      }
        
      &:hover{
        background:#f0f4f8;
      }
      &.showUserName{
        .icon.showUserName{
          background-position: -0 -119px;
        }
      }
      &.stick{
        .icon.stick{
          background-position: -0 -177px;
        }
      }
      &.disturbing{
        .icon.disturbing{
          background-position: -0 -137px;
        }
      }
      &.inBlack{
        .icon.doShield{
          background-position: -0 -21px;
        }
      }
      .text{
        display: inline-block;
        width: 155px;
        padding-left:48px;
        padding-right:35px;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        &.color{
          color:#FF6866;
        }
      }
      .triangle{
        position:absolute;
        top:15px;right:18px;
        display: inline-block;
        width: 0;
        height: 0;
        margin: 0 0 0 5px;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-bottom: 8px solid #bbb;
        &.active{
          -webkit-transform: rotate(90deg);
          transform: rotate(90deg);
        }
      }
      .icon{
        display:inline-block;
        position: absolute;
        top:0;left:0;
        background: url(../../assets/images/chat/chat-menu-icon.png);
        &.addFriend{
          width: 20px; height: 23px;
          background: url(../../assets/images/chat/chat-menu-temp-icon.png);
          background-position: -0 -42px;
          margin:6px 13px 7px 14px;
        }
        &.doShield{
          width: 21px; height: 21px;
          background: url(../../assets/images/chat/chat-menu-temp-icon.png);
          background-position: -0 -0;
          margin:6px 13px 7px 14px;
        }
        &.voice{
          width: 20px; height: 18px;
          background-position: -0 -29px;
          margin:8px 14px;
        }
        &.video{
          width: 21px; height: 13px;
          background-position: -0 -0;
          margin:10px 13px 9px 14px;
        }
        &.screen{
          width: 16px; height: 16px;
          background-position: -0 -13px;
          margin:9px 16px;
        }
        &.showUserName{
          width: 18px; height: 18px;
          background-position: -0 -47px;
          margin:8px 15px;
          &.active{
            background-position: -0 -119px;
          }
        }
        &.disturbing{
          width: 20px; height: 18px;
          background-position: -0 -65px;
          margin:8px 14px;
          &.active{
            background-position: -0 -137px;
          }
        }
        &.stick{
          width: 20px; height: 22px;
          background-position: -0 -155px;
          margin:6px 14px;
          &.active{
            background-position: -0 -177px;
          }
        }
        &.clean{
          width: 26px; height: 25px;
          background-position: -0 -199px;
          margin:5px 11px;
        }
        &.autoClean{
          width: 17px; height: 18px;
          background-position: -0 -83px;
          margin:8px 15px 8px 16px;
        }
        &.more{
          width: 18px; height: 18px;
          background-position: -0 -101px;
          margin:8px 15px;
        }
      }
      .clear-menu{
        position: absolute;
        left: 105%;
        top: -14px;
        width: auto;
        padding: 14px 0;
        border-radius: 10px;
        box-shadow: 0 0 10px #bbb;
        background-color: #fff;
        .menu-item{
          padding-right:25px;
          .menu-icon {
            width: 15px;
            height: 11px;
            margin: 0 12px;
            &.active {
              background: url(../../assets/images/chat/selected.png);
            }
          }
        }
      }
    }
  }
  .menu {
    position: relative;
    width: 30px;
    height: 30px;
    background: url(../../assets/images/chat/header-menu.png);
    cursor: pointer;
  }
  .setting {
    width: 23px;
    height: 17px;
    margin:6px 12px 7px 4px;
    background-position: -0 -0px;
    &.active,
    &:hover {
      background-position: -0 -17px;
    }
  }
  .more {
    width: 30px;
    height: 26px;
    margin:2px 0;
    background-position: -0 -34px;
    &.active,
    &:hover {
      background-position: -0 -60px;
    }
  }
}

.quit-confirm {
  .quit-content {
    position: absolute;
    top: 50%;
    left: 50%;
    height: 170px;
    width: 274px;
    text-align: center;
    background: #fff;
    -webkit-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
    text-align: center;
    border-top: 9px solid $color-theme;
    border-radius: 10px;
    box-sizing: border-box;
    .quit-head {
      position: absolute;
      left: 50%;
      top: -29px;
      height: 58px;
      line-height: 58px;
      width: 58px;
      font-size: 48px;
      color: #fff;
      margin-left: -29px;
      text-align: center;
      border-radius: 50px;
      background: $color-theme;
    }
    p {
      padding: 0 25px;
      height: 14px;
      line-height: 14px;
      font-size: 14px;
      margin-top: 60px;
    }
    button {
      height: 34px;
      width: 78px;
      margin-top: 32px;
      display: inline-block;
      border-radius: 5px;
      font-size: 14px;
      text-align: center;
      line-height: 100%;
    }
    .comfirm {
      color: #fff;
      background: $color-theme;
      margin-right: 50px;
    }
    .cannel {
      color: $color-theme;
      background: #fff;
      border: 1px solid $color-theme;
    }
  }
}

</style>
