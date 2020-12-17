<template>
  <transition name="scale-x">
    <div
      class="my-popup"
      :class="{ 'group-info': step == 1, 'invite-box': step == 2 }"
      @click.stop="hide"
    >
      <div class="my-popup-content" @click.stop="" v-if="step == 1">
        <h3 class="my-popup-title">{{ $t("msg.newGroup.startChat") }}</h3>
        <span class="my-popup-close" @click="hide"></span>
        <div class="display-flex">
          <div class="upload-head">
            <label class="lable" for="uploadGroupHead"></label>
            <img class="head" :src="groupHead" v-if="groupHead" />
          </div>
          <div class="search-box">
            <div class="search-input">
              <input
                type="text"
                :placeholder="$t('msg.newGroup.enterGroupName')"
                maxlength="20"
                v-model="groupName"
              />
              <i
                class="icon-delete"
                @click="groupName = ''"
                v-show="groupName"
              ></i>
            </div>
          </div>
          <button class="search-btn" @click="next">
            {{ $t("msg.common.confirm") }}
          </button>
          <input
            type="file"
            hidden="true"
            id="uploadGroupHead"
            @change="uploadHead($event)"
            accept=".jpg,.png,.jpeg,.ico,.bmp"
          />
        </div>
      </div>
      <div class="my-popup-content" @click.stop="" v-if="step == 2">
        <div class="invite-header display-flex">
          <span class="go-back" @click="step = 1">{{
            $t("msg.common.back")
          }}</span>
          <span>{{ $t("msg.newGroup.createChat") }}</span>
          <span class="finish" @click="doCreateGroup">{{
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
          :title="$t('msg.tip.operateSuccess')"
        ></success>
      </div>
    </div>
  </transition>
</template>
<script>
import "@/common/pinyin";
import { mapGetters } from "vuex";
import { Util } from "@/tools/utils";
import { sha1 } from "@/tools/sha1.js";
import { group } from "@/session/group";

export default {
  name: "new-group",
  data() {
    return {
      step: 0,
      groupName: "",
      groupHead: "",
      groupHeadFile: {},
      keyword: "",
      friendList: {},
      forwardResult: {},
      selectList: {},
      sortSelectList:[],
      showSuccess: false,
      isClick: false
    };
  },
  computed: {
    ...mapGetters([
      "userId",
      "userInfo",
      "currentSession",
      "session",
      "invite"
    ]),
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
    keyword(ov, nv) {
      this.sortList();
    }
  },
  methods: {
    show() {
      this.step = 1;
      this.groupName = "";
      this.groupHead = "";
      this.isClick = false;
    },
    hide() {
      this.$store.dispatch("setLayout", ["", "", false]);
    },
    sortList(){
      this.sortSelectList = Util.sortByLetter(this.unSelectList);
    },
    uploadHead(event) {
      let that = this;
      var file = event.target.files[0];

      if (file.size > 10 * 1024 * 1024) {
        this.$store.commit("SET_TOAST_TEXT", this.$t("msg.tip.imageBig"));
        return false;
      }

      that.groupHeadFile = file;

      let reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = function() {
        let img = new Image();
        img.src = this.result;
        img.onload = () => {
          that.groupHead = this.result;
        };
      };
      event.target.value = "";
    },
    next() {
      if (
        this.groupName == "" ||
        this.groupName.replace(/(&nbsp;*)|(\s*)/g, "").length == 0
      ) {
        this.$store.commit(
          "SET_TOAST_TEXT",
          this.$t("msg.newGroup.enterGroupName")
        );
        return false;
      }

      this.step = 2;
      this.selectList = {};
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

      this.noChecked();
    },
    setGroupHead() {
      return new Promise((resolve, reject) => {
        var newform = new FormData();
        newform.append("mFile", this.groupHeadFile);
        newform.append("deviceType", "2");
        newform.append("cval",sha1(this.$store.getters.token + Date.parse(new Date())));
        newform.append("uid", this.userId);
        newform.append("privateFile", true);
        newform.append("rtime", Date.parse(new Date()));
        var xml = new XMLHttpRequest();
        xml.open("post", base.imfileUrl + "/upload/picture.htm", true);
        xml.setRequestHeader("token", this.$store.getters.token);
        xml.send(newform);
        xml.onreadystatechange = () => {
          //回调函数
          if (xml.status == 200) {
            setTimeout(() => {
              var b = xml.responseText;
              var data = JSON.parse(b);
              if (data.code == 0) {
                resolve(data.data);
              } else {
                reject();
              }
            }, 10);
          }
        };
      });
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
    noChecked() {
      if(this.invite.groupId!=""){
        group.getGroupMember(this.invite.groupId).then(userList =>{
            for (let key in userList) {
              let item = userList[key];
              if (this.friendList[item.userId])
                this.friendList[item.userId].disable = true;
            }
        });
      }
      this.sortList();
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
    doCreateGroup() {
      let ids = this.getCheckedArr(this.selectList);

      if (!ids) {
        this.$store.commit("SET_TOAST_TEXT", this.$t("msg.newGroup.info"));
        return false;
      }

      if (this.isClick) return;

      this.isClick = true;

      if (this.groupHead) {
        this.$store.commit(
          "SET_TOAST_TEXT",
          this.$t("msg.newGroup.waitUpload")
        );
        this.setGroupHead().then(
          data => {
            this.create(data, ids);
          },
          () => {
            this.$store.commit(
              "SET_TOAST_TEXT",
              this.$t("msg.newGroup.uploadFail")
            );
            this.create("", ids);
          }
        );
      } else {
        this.create("", ids);
      }
    },
    create(avatar, ids) {
      var postData = {
        groupName: this.groupName,
        groupDesc: this.groupName,
        groupAvatar: avatar,
        ids: ids
      };

      this.$http.createGroup(postData).then(
        data => {
          var newChat = {
            img: avatar,
            lastReadId: 1,
            mId: 1,
            name: this.groupName,
            paramId: data.groupId,
            fromType: 1,
            msgType: 1,
            preview: "",
            userTime: new Date().getTime()
          };
          this.$store.commit("UPDATE_SESSION", newChat);
          this.$store.commit("SET_ROUTE_NAME", "chat");
          setTimeout(() => {

            let sessionCache= this.$store.state.session.record;
            for(let key in sessionCache){
              if(sessionCache[key].isActivity){
                sessionCache[key].isActivity=false;
              }        
            }
            newChat.isActivity=true;

            this.$store.commit("UPDATE_CURRENT_SESSION", newChat);
          }, 500);
          this.step = 0;
          this.$store.dispatch("setLayout", ["", "", false]);
          group.getGroupAll(true).then(data=>{
            this.$store.commit("SET_GROUP_LIST", data);
          })
        },
        data => {}
      );
    }
  },
  mounted() {
    this.show();
  }
};
</script>

<style lang="scss" scoped>
@import "../../assets/css/var";
.sort-letter{
  position: relative;
  margin-top: 10px;
  padding-left: 33px;
  line-height: 22px;
  font-size: 16px;
  color: #999;
  text-align:left;
}
.group-info {
  .my-popup-content {
    width: 415px;
    padding-bottom: 10px;
    .upload-head {
      position: relative;
      width: 50px;
      height: 50px;
      margin-left: 15px;
      border-radius: 50%;
      background-color: $color-theme;

      .lable {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: url(../../assets/images/upload.png) center no-repeat;
        background-size: 24px;
        cursor: pointer;
      }
      .head {
        width: 50px;
        height: 50px;
        border-radius: 50%;
      }
    }
    .search-box {
      width: 257px;
    }
  }
}
</style>
