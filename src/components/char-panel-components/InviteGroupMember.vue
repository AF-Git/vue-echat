<template>
  <transition name="scale-x">
    <div class="my-popup invite-box" @click.stop="hide" v-show="invite.show">
      <div class="my-popup-content" @click.stop=";">
        <div class="invite-header display-flex">
          <span class="go-back" @click="hide" v-if="$i18n.locale == 'my'">&nbsp;</span>
          <span class="go-back" @click="hide" v-else>{{
            $t("msg.common.back")
          }}</span>
          <span>{{ $t("msg.groupInfo.addUser") }}</span>
          <span class="finish" @click="doInvite()">{{
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
                  <img class="avatar" :src="global.fileDownUrl + 'compress/' + item.img" v-headError />
                  <span class="default" v-defaultHead v-if="!item.img" >{{ item.name }}</span>
                </div>
                <span
                  class="name"
                  v-text="item.name"
                  @click="item.isClick = !item.isClick"
                ></span>
              </div>
            </li>
          </ul>
        </div>
        <div class="unselected-list"> 
          <ul class="friend-list" v-scrollBar>
            <section v-for="(data, id) in sortSelectList">
              <div v-if="data.data && data.data.length" class="sort-letter">
                {{ data.letter }}
              </div>
              <li
                class="friend-list-item display-flex"
                :class="{ active: item.checked, hide: item.temp }"
                v-for="(item, index) in data.data"
                :key="index"
                @click="clickChecked(item)"
              >
                <div class="item-left">
                  <img
                    class="avatar"
                    :class="{ active: item.checked || item.disable }"
                    :src="global.fileDownUrl + 'compress/' + item.img"
                    v-headError
                  />
                  <span class="default" v-defaultHead v-if="!item.img" >{{ item.name }}</span>
                  <span
                    class="select"
                    :class="{ active: item.checked || item.disable }"
                  ></span>
                </div>
                <div class="display-flex-item">
                  <span v-show="keyword == ''">{{ item.name }}</span>
                  <span
                    v-show="keyword != ''"
                    class="name-line-top"
                    v-html="item.tempName"
                  ></span>
                  <span v-show="keyword != ''" class="name-line-bottom"
                    >EchatAPP ID: <span v-html="item.tempId"></span
                  ></span>
                </div>
              </li>
            </section>
          </ul>
        </div>
        <success
          v-model="showSuccess"
          :title="$t('msg.forbidden.addSuccess')"
        ></success>
      </div>
    </div>
  </transition>
</template>

<script>
import { mapGetters } from "vuex";
import { Util } from "@/tools/utils";
import Msg from "@/tools/msg";

export default {
  name: "invite",
  data() {
    return {
      keyword: "",
      friendList: {},
      forwardResult: {},
      selectList: {},
      sortSelectList:[],
      showSuccess: false
    };
  },
  computed: {
    ...mapGetters(["userInfo", "currentSession", "session", "invite"]),
    unSelectList() {
      if (!this.keyword) {
        return this.friendList;
      } else {
        let list = [];
        for (let key in this.friendList) {
          let item = this.friendList[key],
            tempId = item.userId;
          let m = PinyinMatch.match(item.name, this.keyword);
          if (m || (tempId + "").indexOf(this.keyword) >= 0) {
            if (m) item["tempName"] = this.redFont(item.name, m[0], m[1]);
            else item["tempName"] = item.name;
            var findId = (tempId + "").split(this.keyword);
            item["tempId"] = findId.join(
              '<span class="search-key">' + this.keyword + "</span>"
            );
            list.push(item);
          }
        }
        return list;
      }
    }
  },
  watch: {
    invite(ov, nv) {
      if (this.invite.show) {
        this.selectList = {};
        this.init().then(() => {
          this.noChecked();
        });
      }
    },
    keyword(ov, nv) {
      this.sortList();
    }
  },
  methods: {
    redFont(str, start, end) {
      return (
        str.substring(0, start) +
        '<span class="search-key">' +
        str.substring(start, end + 1) +
        "</span>" +
        str.substring(end + 1)
      );
    },
    hide() {
      this.$store.commit("SET_INVITE", {}); 
    },
    sortList(){
      this.sortSelectList = Util.sortByLetter(this.unSelectList);
    },
    noChecked() {
      let userList = this.$store.state.activityGroupMembers;
      for (let key in userList) {
        let item = userList[key];
        if (this.friendList[item.userId])
          this.friendList[item.userId].disable = true;
      }
      this.sortList();
    },
    init() {
      return new Promise(resolve => {
        this.friendList = JSON.parse(
          JSON.stringify(this.$store.state.friendList)
        );
        for (let key in this.friendList) {
          let item = this.friendList[key];
          this.$set(this.friendList[key], "checked", false);
          this.$set(this.friendList[key], "disable", false);
          this.$set(this.friendList[key], "isClick", false);
          this.$set(this.friendList[key], "fromType", 0);
          this.$set(this.friendList[key], "img", item.headImg);
          this.$set(
            this.friendList[key],
            "name",
            item.notes || item.nickName || item.userName
          );
          this.$set(this.friendList[key], "paramId", item.userId);
        }
        resolve();
      });
    },
    clickChecked(item) {
      if (item.disable) return;

      if (!item.checked) {
        this.$set(this.selectList, item.paramId, item);
        item.checked = true;
      } else {
        this.deleteChecked(item);
        item.checked = false;
      }
    },
    deleteChecked(item) {
      this.$delete(this.selectList, item.paramId);
      if (this.friendList[item.paramId])
        this.friendList[item.paramId].checked = false;
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
    doInvite() {
      let id = this.getCheckedArr(this.selectList);
      if (!id) {
        this.$store.commit("SET_TOAST_TEXT", this.$t("msg.newGroup.info"));
        return false;
      }
      this.$http
        .inviteGroupUser({
          groupId: this.invite.groupId,
          inviter: id
        })
        .then(
          data => {
            if (data.code == 0) {
              this.showSuccess = true;
              setTimeout(() => {
                this.showSuccess = false;
                this.$store.commit("SET_INVITE", { show: false });
                this.$emit("inviteHandler", data);
              }, 1500);
            } else if (data.code == 101012) {
              this.$message({
                title: this.$t("msg.tip.tip"),
                message: data.data
              }).then(
                data => {
                  this.doInvitationAgreeJoin(id);
                },
                data => {}
              );
            } else {
              this.$store.commit("SET_TOAST_TEXT", data.data);
            }
          },
          data => {}
        );
    },
    doInvitationAgreeJoin(id) {
      this.$http
        .invitationAgreeJoin({
          groupId: this.invite.groupId,
          inviter: id
        })
        .then(
          data => {
            this.$store.commit("SET_TOAST_TEXT", this.$t("msg.tip.success"));
            this.$store.commit("SET_INVITE", { show: false });
          },
          data => {}
        );
    }
  },
  mounted() {}
};
</script>
<style lang="scss" scoped>
.sort-letter{
  position: relative;
  margin-top: 10px;
  padding-left: 33px;
  line-height: 22px;
  font-size: 16px;
  color: #999;
  text-align:left;
}
</style>