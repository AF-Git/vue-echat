<template>
  <transition name="scale-x">
    <Popup :title="$t('msg.user.personal')">
      <div class="user" slot="body" @click.stop="hideSelect()">
        <div class="user-head">
          <img
            class="head-img"
            :src="global.fileDownUrl + 'compress/'+userInfo.headImg"
            @click.stop="showAvatar = true"
            v-headError
            v-headViewer
          />
          <button class="upload-btn" type="button" @click="avatarType = 'user'">
            {{ $t("msg.user.upload") }}
          </button>
        </div>
        <ul class="user-info">
          <li class="info-item display-flex" @click="showNickname = true">
            <span class="icon"></span>
            <div class="display-flex-item">
              <p>{{ userInfo.nickName }}</p>
              <p class="sub-text">{{ $t("msg.user.clickNickName") }}</p>
            </div>
            <span class="edit"></span>
          </li>
          <li class="info-item display-flex">
            <span class="icon phone"></span>
            <div class="display-flex-item">
              <p>{{ userInfo.mobile || $t("msg.user.unBounded") }}</p>
              <p class="sub-text">{{ $t("msg.user.phone") }}</p>
            </div>
          </li>
          <li class="info-item display-flex">
            <span class="icon email"></span>
            <div class="display-flex-item">
              <p>{{ userInfo.email || $t("msg.user.unBounded") }}</p>
              <p class="sub-text">{{ $t("msg.user.email") }}</p>
            </div>
          </li>
          <li class="info-item display-flex">
            <span class="icon userName"></span>
            <div class="display-flex-item" :class="{alias:userInfo.alias}" @click="showAlias">
              <p>
                <span v-if="userInfo.alias">@</span>{{ userInfo.alias || $t("msg.user.unBounded") }}
              </p>
              <p class="sub-text">{{ $t("msg.user.userName") }}</p>
            </div>
          </li>
        </ul>
        <ul class="user-content">
          <li class="info-item display-flex">
            <span class="label">{{ $t("msg.user.gender") }}</span>
            <echat-select
              ref="genderSelect"
              v-model="gender"
              width="126"
              :list="sexList"
              @hideOther="hideSelect"
              @change="setgender"
            ></echat-select>
          </li>
          <li class="info-item area display-flex">
            <span class="label">{{ $t("msg.user.region") }}</span>
            <div>
              <region-select
                ref="countrySelect"
                v-model="countryCode"
                width="126"
                :list="countryList"
                @hideOther="hideSelect"
                @change="changeCountry"
              ></region-select>
              <region-select
                class="mt10"
                ref="stateSelect"
                v-model="stateCode"
                width="126"
                :list="areaList"
                @hideOther="hideSelect"
                @change="changeArea"
              ></region-select>
            </div>
          </li>
        </ul>
        <div class="signatrue">
          <p>{{ $t("msg.user.signature") }}</p>
          <div class="input-box">
            <input
              class="input"
              type="text"
              ref="signature"
              maxlength="20"
              @blur="setsignature()"
              v-model="signature"
              :placeholder="$t('msg.user.info')"
            />
            <span class="textLength">{{ textLength + "/20" }}</span>
          </div>
        </div>
        <EditPopup 
          v-model="showNickname"
          :title="$t('msg.user.editNickName')"
          :placeholderText="$t('msg.user.info1')" 
          @change="setNickname" 
          v-if="showNickname"
        ></EditPopup>
        <avatar-handler
          v-model="avatarType"
          @changeAvatar="changeAvatarHandler"
          v-if="avatarType"
        ></avatar-handler>
      </div>
    </Popup>
  </transition>
</template>

<script>
import { Countries } from "@/common/Countries";
import { Areas } from "@/common/areas";
import AvatarHandler from "../AvatarHandler";

export default {
  name: "userInformation",
  data() {
    return {
      showUser: false,
      showNickname: false,
      gender: 1,
      sexList: [
        { name: this.$t("msg.user.female") },
        { name: this.$t("msg.user.male") }
      ],
      countryCode:'',
      stateCode:'',
      areas: Areas,
      countryList: Countries,
      areaList: [],
      signature: "",
      avatar: "",
      timeReady: true,
      avatarType: ''
    };
  },
  components: {
    AvatarHandler
  },
  computed: {
    userInfo() {
      return this.$store.getters.userInfo;
    },
    textLength() {
      if (this.signature) {
        return this.signature.length;
      } else {
        return 0;
      }
    }
  },
  methods: {
    hideSelect(){
      this.$refs.countrySelect.showBox = false;
      this.$refs.stateSelect.showBox = false;
      this.$refs.genderSelect.showBox = false;
    },
    show() {
      
      this.avatar = this.userInfo.headImg;
      this.nickName = this.userInfo.nickName;
      this.signature = this.userInfo.signature;
      this.gender = this.userInfo.gender || 0;
      this.countryCode = this.userInfo.countryCode || '';
      this.stateCode = this.userInfo.stateCode || '';
      this.initArea();
    },
    hide() {
      this.$store.dispatch("setLayout", ["", "", false]);
    },
    showAlias(){
      this.$parent.$refs.alias.show();
    },
    changeAvatarHandler(data) {
      let info = this.userInfo;
      info.avatar = data.data;
      info.headImg =  data.data;
      this.$store.commit("SET_USER_INFO", info);
      this.$store.commit("SET_TOAST_TEXT", this.$t("msg.user.success"));
    },
    setNickname(text) {
      this.$http.setNickname({ nickName: text }).then(
        data => {
          this.$store.commit("SET_TOAST_TEXT", data);
          let info = this.userInfo;
          info.nickName = text;
          this.$store.commit("SET_USER_INFO", info);
        },
        () => {}
      );
      this.showNickname = false;
    },
    setgender(value) {
      if (value == this.userInfo.gender) {
        return;
      }
      this.$http.setGender({ gender: value }).then(
        data => {
          this.gender = value;
          this.$store.commit("SET_TOAST_TEXT", data);
          let info = this.userInfo;
          info.gender = value;
          this.$store.commit("SET_USER_INFO", info);
        },
        () => {}
      );
    },
    changeCountry(item) {
      this.countryCode = item.name;
      let areaArr = [];
      for (let i = 0; i < this.areas.length; i++) {
        if (this.areas[i].country_id == item.id) {
          areaArr.push(this.areas[i]);
        }
      }
      this.stateCode = areaArr[0].name;
      this.areaList = areaArr;
    },
    getCountryId(){
      return new Promise((resolve, reject) => {
        let country_id = 0;
        for (let i = 0; i < this.countryList.length; i++) {
          if (this.countryList[i].name == this.countryCode) {
            country_id = this.countryList[i].id;
          }
        }
        resolve(country_id);
      })
    },
    initArea(){
      this.getCountryId().then(
        id => {
          let areaArr = [];
          for (let i = 0; i < this.areas.length; i++) {
            if (this.areas[i].country_id == id) {
              areaArr.push(this.areas[i]);
            }
          }
          this.areaList = areaArr;
        }
      );
    },
    changeArea(item) {
      this.stateCode = item.name;
      let obj = {
        countryCode: this.countryCode,
        stateCode: this.stateCode
      };
      this.$http.setArea(obj).then(
        data => {
          this.$store.commit("SET_TOAST_TEXT", data);
          let info = this.userInfo;
          this.$store.commit("SET_USER_INFO", info);
        },
        () => {}
      );
    },
    setsignature() {
      if (!this.showSignature) {
        this.$http.setSignature({ signature: this.signature }).then(
          data => {
            this.$store.commit("SET_TOAST_TEXT", data);
            let info = this.userInfo;
            info.signature = this.signature;
            this.$store.commit("SET_USER_INFO", info);
          },
          () => {}
        );
      } else {
        this.$refs.signature.focus();
      }
      this.showSignature = !this.showSignature;
    }
  },
  mounted() {
    this.show();
  }
};
</script>

<style lang="scss" scoped="" type="text/css">
@import "../../assets/css/var";

.user {
  width: 322px;
  border-radius: 2px;
  background-color: $backgroup-color;

  .user-head {
    position: relative;
    height: 136px;
    border-top: 1px solid $border-color;
    border-bottom: 1px solid $border-color;

    .head-img {
      display: block;
      width: 60px;
      height: 60px;
      margin: 16px auto 12px;
      border-radius: 50%;
    }
  }
  .upload-btn {
    display: block;
    height: 30px;
    margin: 0 auto;
    padding: 0 8px;
    border-radius: 5px;
    background-color: $color-theme;
    line-height: 30px;
    color: #fff;
    cursor: pointer;
  }
  .user-info {
    padding: 8px 0;
    margin-bottom: 8px;
    border-bottom: 1px solid $border-color;
    background-color: #fff;

    .info-item {
      padding: 5px 0;
      text-align: left;
      line-height: 20px;
      cursor: pointer;

      &:hover {
        background-color: $backgroup-color;
      }
      .icon {
        width: 17px;
        height: 18px;
        margin: 0 30px;
        background: url(../../assets/images/user-info.png);
          background-position: 0 -15px;
        &.phone {
          background-position: 0 -33px;
        }
        &.email {
          height: 15px;
          background-position: 0 0;
        }
        &.userName {
          background-position: 0 -51px;
        }
      }
      .alias:hover{
        color:#3498DF;
        p{
          color:#3498DF;
        }
        .sub-text {
          font-size: 12px;
          color:#3498DF;
        }
      }
      .edit {
        width: 10px;
        height: 10px;
        margin: 0 30px;
        background: url(../../assets/images/chat/edit-nickname.png);
        background-position: 0 0;
      }
      .sub-text {
        font-size: 12px;
        color: $color-grey;
      }
    }
  }
  .user-content {
    padding: 8px 0;
    margin-bottom: 8px;
    border-top: 1px solid $border-color;
    border-bottom: 1px solid $border-color;
    background-color: #fff;

    .info-item {
      position: relative;
      padding: 10px 0;
      .label {
        margin: 0 10px 0 30px;
        line-height: 26px;
      }
      .mt10 {
        margin-top: 10px;
      }
      &.area {
        align-items: start;
      }
    }
  }
  .signatrue {
    padding: 30px;
    border-top: 1px solid $border-color;
    text-align: left;
    background-color: #fff;
    .input-box {
      position: relative;
      .input {
        width: 100%;
        height: 38px;
        margin-top: 15px;
        padding-right: 45px;
        line-height: 38px;
        border-bottom: 1px solid $border-color;
        &:focus {
          border-color: $color-theme;
        }
      }
      .textLength {
        position: absolute;
        top: 24px;
        right: 0;
        font-size: 14px;
        color: $color-grey;
      }
    }
  }
}
.edit-input {
  .my-popup-content {
    width: 415px;
    padding-bottom: 10px;
    background-color: #fff;
  }
}
</style>
