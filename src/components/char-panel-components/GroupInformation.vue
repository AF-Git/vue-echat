<template>
  <transition name="scale-x">
    <div class="friend-profile" @click.stop="hideRight">
      <div class="border"></div>
      <div class="profile-content">
        <div v-if="!showLoading">
          <div class="user-head display-flex">
            <div class="user-avatar">
              <img class="img" :src="global.fileDownUrl + 'compress/'+group.avatar" v-headViewer v-headError
                v-if="group.avatar"  ondragstart="return false"/>
              <span class="upload" @click="selectAvatar" v-if="isAdmin"></span>
              <span class="default" v-defaultHead v-if="!group.avatar" v-html="group.groupName"></span>
            </div>
            <div class="display-flex-item">
              <div class="user-name" :class="{active:isAdmin}">
                <input class="groupName" type="text" id="groupName" ref="groupName" maxlength="20" v-model="groupName"
                  placeholder="" autocomplete="off" @blur="editGroupName" @keyup.enter="editGroupName"
                  v-show="showGroupName" :disabled="!showGroupName" />
                <label class="groupName" :class="{bb:isAdmin}" for="groupName" @click="showGroupName=true"
                  v-show="!showGroupName" v-text="groupName"></label>
                <label class="edit" v-show="!showGroupName" for="groupName"
                  @click="showGroupName=!showGroupName"></label>
              </div>
              <div class="grey">
                {{ $t("msg.groupInfo.userNum")
                }}<span>{{ groupUserList.length }}</span>
              </div>
            </div>
          </div>
          <ul class="menu-list affiche" :class="{edit:isAdmin}" @click="editAffiche">
            <li class="menu-item affiche">
              <div>{{ $t("msg.groupInfo.affiche") }}：</div>
              <span class="grey">{{affiche || $t("msg.groupInfo.noneAffiche")}}</span>
              <span class="edit"></span>
            </li>
          </ul>
          <ul class="menu-list invite">
            <li class="menu-item display-flex" @click="inviteGroupUser">
              <span class="lable">{{
                $t("msg.groupInfo.inviteMoreFriend")
              }}</span>
              <span class="icon-right"></span>
            </li>
          </ul>
          <div class="group-member" :class="{ active: showModal }">
            <div class="member-operation display-flex" v-if="!showModal">
              <span @click="showModal = !showModal">{{ $t("msg.groupInfo.groupUser")
                }}{{ "(" + groupUserList.length + ")" }}</span>
              <span @click="addGroupUser">{{
                $t("msg.groupInfo.addUser")
              }}</span>
            </div>
            <div class="list-title display-flex" v-else>
              <span class="left-arrow" @click="showModal = !showModal"></span>
              <span>{{ $t("msg.groupInfo.groupUser")
                }}{{ "(" + groupUserList.length + ")" }}</span>
            </div>
            <div class="search-box">
              <div class="search-input">
                <input type="text" :placeholder="$t('msg.groupInfo.enterUser')" maxlength="20" v-model="keyword" />
                <i class="icon-delete" @click="keyword = ''" v-show="keyword"></i>
              </div>
            </div>
            <ul class="member-list" v-scrollBar>
              <li class="list-item" v-for="(item, index) in memberList" :key="index">
                <div class="display-flex" :data-index="
                    `{%type%:%avatar%,%uId%:${item.userId},%gId%:${item.groupId}}`
                  "
                >
                  <img class="avatar"  @click.stop="showmemberProfile(item.userId)" :src="global.fileDownUrl + 'compress/' +item.headImg" v-headError ondragstart="return false"/>
                  <span class="default"  @click.stop="showmemberProfile(item.userId)" v-defaultHead v-if="!item.headImg" >{{ item.notes || item.nickName }}</span>
                  <span :class="{manager: item.isAdmin == 2, owner: item.isAdmin == 1}"></span>
                  <span class="display-flex flex-item-nowrap">
                    <span class="nickname"  @click="openNickNameEdit(item)" :class="{bb:item.userId == userId}">{{ item.notes || item.nickName }}</span>
                    <span class="orange" v-if="item.isAdmin == 1">&nbsp;{{ $i18n.locale == "zh_CN" ? "群主" : "GH"}}</span>
                    <span class="green" v-if="item.isAdmin == 2">&nbsp;{{ $i18n.locale == "zh_CN" ? "管理员" : "GA"}}</span>
                    <span
                      class="disable"
                      v-if="item.isBanned==1"
                    ></span>
                  </span>
                  <span class="edit" v-show="item.userId == userId" @click="text=item.notes || item.nickName;showEdit=true"></span>
                  <span
                    class="delete-icon"
                    v-show="isAdmin && item.userId != userId && item.isAdmin < 1"
                    @click.stop="Confirm(item.userId)"
                  >
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>
        <loading v-if="showLoading"></loading>
      </div>
      <!-- 群头像 -->
      <avatar-handler
        v-model="avatarType"
        @changeAvatar="uploadHandler"
        v-if="avatarType"
      ></avatar-handler>
      <!-- 邀请群成员 -->
      <invite-group-member 
        @inviteHandler="inviteHandler" 
      ></invite-group-member>
      <!-- 邀请进群 -->
      <invite-join-group
        v-model="showInvite"
        :groupInfo="group" 
        v-if="showInvite"
      ></invite-join-group>
      <!-- 修改在本群的昵称 -->
      <transition name="scale-x">
        <div class="my-popup edit-input" @click="showEdit = false" v-if="showEdit">
          <!-- 修改在本群的昵称 -->
          <div class="my-popup-content" @click.stop=";">
            <h3 class="my-popup-title">
              {{ $t("msg.chatSetting.yourNickName") }}
            </h3>
            <span class="my-popup-close" @click="showEdit = false"></span>
            <div class="display-flex">
              <div class="search-box">
                <div class="search-input">
                  <input
                    type="text"
                    :placeholder="$t('msg.chatSetting.enterNickName')"
                    maxlength="20"
                    v-model="text"
                  />
                </div>
              </div>
              <button class="search-btn" @click="comfirm()">
                {{ $t("msg.common.confirm") }}
              </button>
            </div>
          </div>
        </div>
      </transition>
      <Popup :title="$t('msg.group.ConfirmDelete')" :hide-close="false"
      :radius="10"
        v-if="showConfirm"
      >
        <div class="logout" @click.stop="" slot="body">
          <div class="logout-detail">{{ $t("msg.group.content") }}</div>
          <button class="two-btn cannel" @click="showConfirm = false">
            {{ $t("msg.common.cancel") }}
          </button>
          <button class="two-btn delete" @click="deleteGroupUser(delid)">
            {{ $t("msg.common.ensure") }}
          </button>
        </div>
      </Popup>
    </div>
  </transition>
</template>
<script>
import { mapGetters } from "vuex";
import InviteJoinGroup from "./InviteJoinGroup";
import InviteGroupMember from "./InviteGroupMember";
import { EchatDB } from "@/tools/indexedDB";
import AvatarHandler from "../AvatarHandler";
import { group } from "@/session/group";

export default {
  name: "feedback",
  data() {
    return {
      group: {
        avatar: "",
        groupName: "",
        groupDesc: "",
        nickName: "",
        isShowMemberNick: 1,
        isInterruption: 1,
        isTop: 1,
        isInvite: 1
      },
      keyword: "", 
      showConfirm:false,
      showDeleteBtn: false,
      showModal: false,
      confString: {},
      isAdmin: false,
      affiche: "",
      afficheType: 0,
      operationIndex: 0, // 1-群公告 2-分享群 
      showInvite: false,
      showLoading: true,
      avatarType: "",
      groupName:"",
      showGroupName: false,
      groupNameReady: true,
      showEdit: false,
      editType: 1,
      text: "",
      delid:null
    };
  },
  computed: {
    ...mapGetters(["userId", "currentSession", "session", "invite"]),
    groupUserList() {
      if (this.$store.state.activityGroupMembers) {
        return Object.values(this.$store.state.activityGroupMembers);
      }
      return [];
    },
    memberList() {
      if (!this.keyword) {
        for (var i = 0; i < this.groupUserList.length; i++) {
          if (this.groupUserList[i].isAdmin == 1) {
            this.groupUserList[i].sort = 2;
          } else if (this.groupUserList[i].isAdmin == 2) {
            this.groupUserList[i].sort = 1;
          } else {
            this.groupUserList[i].sort = 0;
          }
        }
        let sortlist = this.groupUserList.sort((a, b) => b.sort - a.sort);
        return sortlist;
      } else {
        let list = [];
        let arr = this.groupUserList;
        for (var i = 0; i < arr.length; i++) {
          if (arr[i].nickName.indexOf(this.keyword) >= 0) {
            list.push(arr[i]);
          }
        }
        return list;
      }
    }
  },
  components: {
    InviteGroupMember,
    InviteJoinGroup,
    AvatarHandler
  },
  methods: {
    hideRight(){
      this.$store.dispatch("setLayout", ["gp-inf", "gi", false]);
    },
    show() {
      this.isAdmin = false;
      this.showLoading = true;
      this.group = {};

      this.getGroupSetting();
      this.getGroupAffiche();
      this.updateGroupMember();
      
    },
    updateGroupMember(){
      let groupId=this.currentSession.paramId;
      group.getGroupMember(groupId,true).then(data=>{
        if(this.currentSession.paramId==groupId&&this.currentSession.fromType==1){
          let chatPanel=this.$store.state.activityComponents['chat-panel'];
          if(chatPanel){
            let array= Object.values(data)
            chatPanel.changeGroupMemberNum(array.length);
          }
          this.$store.commit("SET_GROUP_MEMBER", data);

          let self=this.$store.state.activityGroupMembers[this.userId];
          if(!self){
            self={};
          }
          if(self.isAdmin>0){
            this.isAdmin = true;
            let sessionCache=this.$store.state.session.record[this.currentSession.paramId+'-'+this.currentSession.fromType];
            sessionCache.isBanned=0
            let clone=JSON.parse(JSON.stringify(sessionCache));
            this.$store.commit("UPDATE_CURRENT_SESSION", clone);
          }
        }
      });
    },
    showmemberProfile(id) {
      this.$store.dispatch("setLayout", ["gmi", [id], true]);
    },
    editGroupName() {
      
      if(!this.groupNameReady) return 
      this.groupNameReady=false;

      if (!this.groupName) {
        this.$store.commit(
          "SET_TOAST_TEXT",
          this.$t("msg.newGroup.enterGroupName")
        );
        return false;
      }
      if(this.groupName==this.group.groupName){
        this.showGroupName = false;
        return false
      }
      let confString = {
        groupName:this.groupName
      };
      // let chat = this.session.record[this.currentSession.paramId+'-'+this.currentSession.fromType];
      // chat.name = this.groupName
      // this.$store.commit("UPDATE_SESSION", chat);
      confString = JSON.stringify(confString);
      this.$http.setGroupSetting({
        groupId: this.currentSession.paramId,
        confString: confString
      }).then(
        () => {
          this.getGroupSetting();
        },() => {}
      );
      this.showGroupName = false;
      setTimeout(()=> {
        this.groupNameReady=true;
      }, 1000);
    },
    openNickNameEdit(item){
      if(this.userId==item.userId){
        this.text = item.notes || item.nickName;
        this.showEdit = true;
      }
    },
    comfirm() {
      let confString = {};
      if (!this.text) {
        this.$store.commit(
          "SET_TOAST_TEXT",
          this.$t("msg.newGroup.enterNickName")
        );
        return false;
      }
      confString.nickName = this.text;
      confString = JSON.stringify(confString);

      this.$http.setGroupSetting({
        groupId: this.currentSession.paramId,
        confString: confString
      }).then(
        () => {
          this.text = "";
          this.updateGroupMember();
        },() => {}
      );
      this.showEdit = false;
    },
    getGroupSetting() {
      this.$http.getGroupSetting({ groupId: this.currentSession.paramId }).then(data => {
        this.group = JSON.parse(JSON.stringify(data));
        this.groupName = this.group.groupName;
        this.showLoading = false;
        if (this.group.avatar) {
          this.group.avatar = this.group.avatar;
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
            data.isBanned=2;
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
          data.isBanned=0;
        }
        sessionCache.isFriend=data.isFriend;
        sessionCache.isForbidChat=data.isForbidChat;
        sessionCache.img=this.group.avatar;
        sessionCache.name=this.group.groupName;

        //更新群信息
        group.updateGroupInfo(data);

        let clone=JSON.parse(JSON.stringify(sessionCache));
        this.$store.commit("UPDATE_CURRENT_SESSION", clone);
      });
    },
    getGroupAffiche() {
      this.$http.getGroupAffiche({ groupId: this.currentSession.paramId }).then(data => {
        this.affiche = data && data.affiche ? data.affiche : "";
        this.afficheType = data && data.type ? data.type : 0;
      });
    },
    uploadHandler(avatar) {
      let confString = {
        avatar: avatar
      };
      confString = JSON.stringify(confString);
      this.$http.setGroupSetting({
          groupId: this.currentSession.paramId,
          confString: confString
        })
        .then(
          data => {
            this.getGroupSetting();
            let chat = this.session.record[this.currentSession.paramId+'-'+this.currentSession.fromType];
            chat.img = avatar;
            chat=JSON.parse(JSON.stringify(chat));
            this.$store.commit("UPDATE_SESSION", chat);
          },
          data => {
            this.getGroupSetting();
          }
        );
    },
    inviteGroupUser() {
      if (this.group.isInvite == 1) {
        this.$store.commit("SET_TOAST_TEXT", this.$t("msg.groupInfo.info"));
        return;
      }
      this.showInvite = true;
    },
    addGroupUser() {
      this.$store.commit("SET_INVITE", {
        show: true,
        groupId: this.currentSession.paramId
      });
    },
    Confirm(id){
      this.showConfirm=true
      this.delid=id
    },
    deleteGroupUser(id) {
      this.$http
        .deleteGroupUser({
          groupId: this.currentSession.paramId,
          inviter: id
        })
        .then(
          () => {
            this.$store.dispatch("getGroupMember", { groupId: this.currentSession.paramId });
          },
          () => {}
        );
      this.showConfirm = false;
    },
    inviteHandler(data) {
      this.$store.dispatch("getGroupMember", { groupId: this.currentSession.paramId });
    },
    editAffiche() {
      this.$parent.showAffiche(this.affiche,this.afficheType,this.isAdmin);
    },
    updateAffiche(){
      this.getGroupAffiche()
    },
    selectAvatar() {
      let self=this.$store.state.activityGroupMembers[this.userId];
      if(!self){
        self={};
      }
      let admin = self.isAdmin;
      if (admin == 0) {
        this.$store.commit(
          "SET_TOAST_TEXT",
          this.$t("msg.tip.notAdministrator")
        );
        return;
      }
      this.avatarType = 'group'
    }
  },
  mounted() {
    this.show();
  }
};
</script>

<style lang="scss" scoped>
@import "../../assets/css/var";

.group-member {
  width: 100%;
  max-height: 396px;
  font-size: 16px;
  line-height: 28px;
  background-color: #fff;

  .member-operation {
    justify-content: space-between;
    padding: 5px 15px 0 15px;
    color: $color-theme;
    cursor: pointer;
  }
  .search-box {
    height: 43px;
    padding: 10px 15px 8px 15px;
    .search-input {
      width: 100%;
      margin: 0;
      background-color: $backgroup-color;
    }
  }
  .member-list {
    position: relative;
    width: 100%;
    max-height: 317px;
    .list-item {
      position: relative;
      padding: 8px 15px;

      &:hover {
        background-color: $backgroup-color;
      }
      .avatar {
        width: 45px;
        height: 45px;
        margin-right: 10px;
        border-radius: 50%;
        cursor:pointer;
      }
      .default{
        position:absolute;
        top:8px;left:15px;
        height:45px;width:45px;
        background: rgb(169, 169, 169);
        border-radius: 50%;
        text-align: center;
        line-height: 45px;
        font-weight: 550;
        color: #fff;
        cursor:pointer;
      }
      .manager,
      .owner {
        position: absolute;
        top: 2px;
        left: 45px;
        width: 20px;
        height: 20px;
        background-image: url(../../assets/images/group.png);
      }
      .disable{
        position: absolute;
        left: 45px;
        bottom: 8px;
        height: 20px;
        width: 20px;
        background-image: url(../../assets/images/unselectable.png);
        background-size: 100%;
      }
      .manager {
        background-position: -20px 0;
      }
      .nickname {
        display: inline-block;
        height:28px;
        max-width: 140px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        box-sizing: border-box;
        &.bb{
          cursor:pointer;
        }
        &.bb:hover{
          border-bottom:2px solid #999;
        }
      }
      .delete-icon {
        width: 16px;
        height: 16px;
        background: url(../../assets/images/chat/icon-select-delete.png);
        background-size: 100% 100%;
        cursor: pointer;
      }
      .edit{
        display:inline-block;
        position:absolute;
        right:15px;bottom:23px;
        width: 14px;
        height: 15px;
        background: #f0f4f8;
        background-image: url(../../assets/images/chat/btn-edit.png);
        background-size:100% 100%;
      }
    }
  }
  &.active {
    position: absolute;
    top: 0;
    right: 0;
    max-height: 661px;
    .member-list {
      max-height: 568px;
    }
    .list-title {
      height: 50px;
      line-height: 50px;
      border-bottom: 1px solid $border-color;
      .left-arrow {
        width: 25px;
        height: 18px;
        margin: 0 15px;
        background: url(../../assets/images/chat/left-arrow.png);
        background-size: 100% 100%;
        cursor: pointer;
      }
    }
  }
}
.affiche {
  position: relative;
  height: 70px;
  cursor: pointer;
}
.edit-input {
  .my-popup-content {
    width: 415px;
    padding-bottom: 0;
  }
}

.menu-list {
  border-top: 1px solid $border-color;
  .menu-item{
    position:relative;
    line-height:25px;
    .grey{
    display: -webkit-box;
     /* ! autoprefixer: off */
    -webkit-box-orient: vertical;
     /* autoprefixer: on */
    -webkit-line-clamp: 2;
    overflow: hidden;
    word-wrap: break-word;
    }
    span.edit{
      display:none;
      position:absolute;
      right:0;bottom:0;
      width: 14px;
      height: 15px;
      background: #f0f4f8;
      background-image: url(../../assets/images/chat/btn-edit.png);
      background-size:100% 100%;
    }
  }
  &.affiche{
    height:92px;
    overflow:hidden;
  }
  &:hover {
    background-color: $backgroup-color !important;
  }
  &.edit{
    &:hover {
      .menu-item{
        span.edit{
          display:block;
        }
      }
    }
  }
}

</style>
