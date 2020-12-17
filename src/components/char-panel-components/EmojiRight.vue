<template>
  <transition name="scale-x">
    <div class="emoji-right" @click.stop="">
      <div class="right-top">
      </div>
      <div class="right-body">
        <div class="box display-flex">
          <div class="display-flex">
            <div :class="cur!='0'?'my':'my active'" @click="checkout">{{$t('msg.emojishow.MyStickers')}}</div>
            <div :class="cur!='1'?'my':'my active'" @click="checkout1">{{$t('msg.emojishow.Trending')}}</div>
          </div>
          <a class="set-emoji" href="javascript: ;">
            <img src="../../assets/images/set-emoji.png" ondragstart="return false" @click="dialogout()" />
          </a>
        </div>
        <div class="content">
          <div v-show="cur==0">
            <div v-show="this.showList" class="detail-top">
              <div class="showlistname"><span>{{showlistname.name}}</span></div>
              <a href="javascript: ;" class="delete" style="margin-left:10px"
                @click.stop="delEmoji(showlistname.bqbId,showlistname.name)">
                <img src="../../assets/images/del-emoji.png" ondragstart="return false"
                  style="width:18px; height:22px; margin-right:20px;margin-top:15px">
              </a>
            </div>

            <div class="emoji-detail">
              <ul v-if="!showLoading" style="height:578px;position:relative">
                <a href="javascript: ;" v-for="(item, index) in emojiDetailList" :key="index" @click="checkFace(item)">
                  <li class="emoji-detail-item" v-if="!showList">
                    <img width="28" height="28" ondragstart="return false"
                      :src="global.fileDownUrl + 'compress/'+item.imgUrl" :title="item.msg[langIdx]" />
                  </li>
                  <li class="emoji-detail-item large" v-else>
                    <img ondragstart="return false" width="68" height="68"
                      :src="global.fileDownUrl + 'compress/'+ item.bqThumbnailUrl" />
                  </li>
                </a>
              </ul>
            </div>
            <div class="emoji-list display-flex">
              <div class="display-flex">
                <a class="emoji-list-item" :class="{ active: emojiListIndex == index }" ondragstart="return false"  href="javascript: ;"
                  v-for="(item, index) in currentList" :key="index" @click="switchList(item.bqbId, index)">
                  <img class="preview" v-if="index==0&&emojiPageIndex==1" ondragstart="return false"
                    :src="item.bqbCoverUrl" />
                  <img class="preview" v-else :src="global.fileDownUrl + 'compress/'+item.bqbCoverUrl"
                    ondragstart="return false" />
                </a>
              </div>
              <div class="switch-page display-flex">
                <a ondragstart="return false"  class="switch-page-item" href="javascript: ;" @click="switchPage(0)">
                  <span class="arrow left" :class="{ disable: emojiPageIndex < 2 }"></span>
                </a>
                <a ondragstart="return false"  class="switch-page-item" href="javascript: ;" @click="switchPage(1)">
                  <span class="arrow right" :class="{ disable: emojiPageIndex >=myemoji.emojiPage }"></span>
                </a>
              </div>
            </div>
          </div>
          <div v-show="cur==1">
            <ul style="height:593px;position:relative" v-scrollBar>
              <li class="hot-emoji display-flex" v-for="(item,idx) in list" :key="idx">
                <div class="emoji-img" style="margin-left:20px">
                  <img class="img" :src="global.fileDownUrl + 'compress/'+item.bqbCoverUrl" ondragstart="return false"
                    style="width:50px; height:50px ">
                </div>
                <div class="emoji-box display-flex">
                  <div class="hotemoji-text">
                    {{item.bqbName}}
                  </div>
                  <div>
                    <span class="myemoji-icon success" v-if="item.download==1"></span>
                    <span class="myemoji-icon wait" v-else-if="item.download==2"></span>
                    <span class="myemoji-icon" @click.stop="addEmoji(item.bqbId,idx)" v-else></span>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div class="my-popup deldialo-box" v-if="emojidel">
        <div class="deldialo">
          <div class="text">{{$t("msg.emojishow.ifRemove")}}《<span>{{delname}}</span>》？</div>
          <div class="judge">
            <a class="cancel" href="javascript: ;" @click="emojidel=false">{{$t("msg.emojishow.Cancel")}}</a>
            <a class="confirm" href="javascript: ;" @click="delEmojiconfirm()">{{$t("msg.emojishow.Remove")}}</a>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
  import Vue from "vue";
  import {
    face
  } from "@/tools/emoji.js";
  import {
    sessionUtil
  } from "@/session/sessionUtil.js";
  import {
    mapGetters
  } from "vuex";
  export default {
    data() {
      return {
        cur: 0,
        list: [],
        pageNum: 0,
        pageSize: 20,
        emojidel: false,
        showList: false,
        showlistname: {},
        DefaultList: [],
        delname: [],
        langIdx: 0,
        emojiDetailList: [],
        emojiListIndex: 0,
        emojiPageIndex: 1,
        showLoading: false,
      }
    },
    computed: {
      ...mapGetters(["myemoji"]),
      currentList() {
        if (this.myemoji.emojiPage == 1) {
          return this.myemoji.emojiList;
        } else {
          let enough = this.myemoji.emojiList.length - (this.emojiPageIndex - 1) * 5;
          if (enough > 5) {
            return this.myemoji.emojiList.slice(
              (this.emojiPageIndex - 1) * 5,
              this.emojiPageIndex * 5
            );
          } else {
            return this.myemoji.emojiList.slice(
              (this.emojiPageIndex - 1) * 5,
              this.myemoji.emojiList.length
            );
          }
        }
      },
    },
    methods: {
      dialogout() {
        let right = {
          show: false
        }
        this.$store.commit("SET_RIGHT", right);
        this.$store.dispatch("setLayout", ['', '', false]);
        let myemoji = {
          show: true,
          myemojilist: this.myemoji.myemojilist,
          emojiList: this.myemoji.emojiList,
          emojiPage: this.myemoji.emojiPage
        }
        this.$store.commit("SET_MYEMOJI", myemoji);
      },
      checkout() {
        this.cur = 0
        this.switchList(9999)
      },
      checkout1() {
        this.cur = 1
        let obj = {
          pageNum: this.pageNum,
          pageSize: this.pageSize,
          isSystem: 0
        }
        this.$http.loadEmoji(obj).then(
          data => {
            this.changeState(data.list)
          }, () => {}
        )
      },
      delEmoji(id, name) {
        this.delname = name
        this.delid = id
        this.emojidel = true
      },
      delEmojiconfirm() {
        let obj = {
          bqbId: this.delid
        }
        this.$http.deleteEmoji(obj).then(
          data => {
            this.myemoji.myemojilist = this.myemoji.myemojilist.filter(item => item.bqbId !== this.delid)
            this.myemoji.emojiList = this.myemoji.emojiList.filter(item => item.bqbId !== this.delid)
            this.emojidel = false
            this.switchList(9999)
            this.switchPage(0)
            if (this.myemoji.emojiList.length < 6) {
              this.myemoji.emojiPage = 0
            }
            let myemoji = {
              show: false,
              myemojilist: this.myemoji.myemojilist,
              emojiList: this.myemoji.emojiList,
              emojiPage: this.myemoji.emojiPage
            }
            this.$store.commit("SET_MYEMOJI", myemoji);
          }, () => {}
        )
      },
      changeState(list) {
        let last = this.pageNum == 0 ? 0 : this.pageSize - this.pageNum * 20;
        for (let j = last; j < list.length - last; j++) {
          for (let i = 0; i < this.myemoji.emojiList.length; i++) {
            if (list[j].bqbId == this.myemoji.emojiList[i].bqbId) {
              list[j].download = 1;
            } else {
              if (!list[j].download) {
                list[j].download = 0;
              }
            }
          }
        }
        this.list = list;
      },
      addEmoji(id, idx) {
        this.list[idx].download = 2
        let obj = {
          bqbId: id
        }
        this.$http.addEmoji(obj).then(
          data => {
            data.bqbCoverUrl = data.bqbCoverUrl;
            this.myemoji.myemojilist.unshift(data)
            this.myemoji.emojiList.splice(1, 0, data)
            this.changeState(this.list)
            if (this.myemoji.emojiList.length >= 5) {
              this.myemoji.emojiPage = Math.ceil(this.myemoji.emojiList.length / 5);
            }
            let myemoji = {
              show: false,
              myemojilist: this.myemoji.myemojilist,
              emojiList: this.myemoji.emojiList,
              emojiPage: this.myemoji.emojiPage
            }
            this.$store.commit("SET_MYEMOJI", myemoji);
          }, () => {}
        )
      },
      checkFace(item) {
        if (this.emojiListIndex == 0 && this.emojiPageIndex == 1) {
          let name = face.msgToFace(face.faceToMsg(item.index));
          let url = './static/images/face/' + name;
          const content =
            '<img style="margin:auto 0px;float:none;pointer-events: none;" width="28" height="28" ondragstart="return false" src="' +
            url +
            '" title="' +
            item.msg[0] +
            '">';
          this.$parent.insertEmoji(content);
        } else {
          let obj = {
            bqbId: this.currentList[this.emojiListIndex].bqbId,
            chargeType: this.currentList[this.emojiListIndex].chargeType,
            bqUrl: item.bqMainUrl
          };
          this.$parent.insertEmoji(obj);
        }
      },
      switchList(id, idx) {
        this.emojiListIndex = idx;
        if (id == 9999) {
          this.emojiDetailList = this.DefaultList;
          this.showList = false;
          return;
        }
        this.showLoading = true;
        let showlistname = this.myemoji.myemojilist.filter(item => item.bqbId == id)
        this.showlistname.name = showlistname[0].bqbName
        this.showlistname.bqbId = showlistname[0].bqbId
        this.emojiDetailList = sessionUtil.getlocalSessionEmojiDetail(id);
        if (!this.emojiDetailList) {
          this.$http.emojiDatail({
            bqbId: id
          }).then(
            data => {
              this.emojiDetailList = data.listPackageDetails;
              this.showList = true;
              this.showLoading = false;
              sessionUtil.setLocalSessionEmojiDetail(id, this.emojiDetailList);
            },
            () => {}
          );
        } else {
          this.showList = true;
          this.showLoading = false;
        }
      },
      switchPage(add) {
        if (this.myemoji.emojiPage < 2) return;

        if (add) {
          if (this.emojiPageIndex >= this.myemoji.emojiPage) {
            return;
          }
          this.emojiPageIndex++;
        } else {
          if (this.emojiPageIndex < 2) {
            return;
          }
          this.emojiPageIndex--;
        }

        this.showList = true;
        this.emojiListIndex = 0;
        this.switchList(this.currentList[0].bqbId, 0);
      },
    },
    mounted() {
      if (localStorage.lang == "en_US") {
        this.langIdx = 1;
      }
      if (localStorage.lang == "my") {
        this.langIdx = 2
      };
      for (var i = 0; i < 107; i++) {
        let index = i + "";
        while (index.length < 3) {
          index = "0" + index;
        }

        let zh = face.faceToMsg(index),
          url = face.msgToFace(zh);

        let item = {
          index: index,
          msg: face.emojiI18n(zh),
          imgUrl: './static/images/face/' + url
        };
        this.DefaultList.push(item);
      }
      this.emojiDetailList = this.DefaultList;
    }
  }

</script>


<style lang="scss" scoped>
  .emoji-right {
    position: absolute;
    top: -18px;
    left: 983px;
    width: 346px;
    height: 679px;

    .right-top {
      height: 18px;
      width: 100%;
      border-bottom: 1px solid #E2E2E2;
      background: #F0F4F8;
    }

    .right-body {
      width: 100%;
      height: 661px;
      border-left: 1px solid #E2E2E2;
      background: #fff;

      .box {
        justify-content: space-between;
        height: 67px;
        width: 100%;
        border-bottom: 1px solid #E2E2E2;

        .set-emoji {
          width: 20px;
          height: 20px;
          margin-right: 20px;
        }

        .my {
          width: 116px;
          height: 67px;
          line-height: 67px;
          font-size: 14px;
          text-align: center;
          cursor: pointer;

          &.active {
            color: #3498DF;
            border-bottom: 2px solid #3498DF;
          }
        }
      }

      .content {
        height: 595px;
      }
    }

    .deldialo {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      background: #fff;
      width: 330px;
      height: 128px;
      border-radius: 5px;

      .text {
        margin-left: 26px;
        margin-top: 36px;
        font-size: 16px;

        span {
          color: #3592D8
        }
      }

      .judge {
        margin-top: 32px;
        display: flex;
        justify-content: flex-end;

        .cancel {
          margin-right: 20px;
        }

        .confirm {
          margin-right: 20px;
        }
      }

      .cancel {
        text-decoration: none;
        color: #3592D8
      }

      .cancel:hover {
        color: #3592D8
      }

      .confirm {
        text-decoration: none;
        color: #E65858
      }

      .confirm:hover {
        color: #E65858
      }
    }

    .detail-top {
      height: 52px;
      display: flex;
      justify-content: space-between;

      .showlistname {
        height: 52px;
        line-height: 52px;
        margin-left: 10px;
      }
    }

    .emoji-detail {
      position: relative;
      width: 100%;
      ;
      padding: 0 8px;

      &-item {
        float: left;
        width: 32px;
        margin: 5px 0;
        text-align: center;
        cursor: pointer;

        &.large {
          width: 82px;
        }
      }
    }

    .emoji-list {
      position: absolute;
      bottom: 0;
      width: 345px;
      justify-content: space-between;
      height: 66px;
      background-color: #fff;

      &-item {
        display: block;
        width: 58px;
        cursor: pointer;

        &.active {
          height: 66px;
          background-color: #f2f2f2;
          border-bottom: 2px solid #38ACFF;

          .preview {
            margin-top: 20px;
          }
        }

        .preview {
          display: block;
          width: 28px;
          height: 28px;
          margin: 4px 15px;
        }
      }

      .switch-page {
        height: 48px;
        border-left: 1px solid #ddd;

        .arrow {
          display: block;
          width: 10px;
          height: 16px;

          &.left {
            margin: 6px 8px 6px 10px;
            background: url(../../assets/images/emoji-arrow-left.png) no-repeat center center;
            background-size: 10px 16px;

            &:hover {
              background: url(../../assets/images/emoji-hove-left.png) no-repeat center center;
              background-size: 10px 16px;
            }

            &.disable {
              background: url(../../assets/images/emoji-disable-left.png) no-repeat center center;
              background-size: 10px 16px;
            }
          }

          &.right {
            margin: 6px 10px 6px 8px;
            background: url(../../assets/images/emoji-arrow-right.png) no-repeat center center;
            background-size: 10px 16px;

            &:hover {
              background: url(../../assets/images/emoji-hove-right.png) no-repeat center center;
              background-size: 10px 16px;
            }

            &.disable {
              background: url(../../assets/images/emoji-disable-right.png) no-repeat center center;
              background-size: 10px 16px;
            }
          }
        }
      }
    }
  }

</style>
