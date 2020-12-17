<template>
  <div :class="right.show?'showRight emoji-icon':'emoji-icon'" @click.stop="showRight(right.show)">
    <div class="emoji-wrap" @click.stop="">
      <div class="my-popup deldialo-box" v-if="emojidel2">
        <div class="deldialo">
          <div class="text">{{$t("msg.emojishow.ifRemove")}}《<span>{{delname}}</span>》？</div>
          <div class="judge">
            <a class="cancel" href="javascript: ;" @click="emojidel2=false">{{$t("msg.emojishow.Cancel")}}</a>
            <a class="confirm" href="javascript: ;" @click="delEmojiconfirm2()">{{$t("msg.emojishow.Remove")}}</a>
          </div>
        </div>
      </div>
      <div class="display-flex top">
        <div class="display-flex">
          <div v-show="this.showList" class="showlistname"><span>{{showlistname.name}}</span></div>
          <a v-show="this.showList" href="javascript: ;" class="delete" style="margin-left:10px"
            @click.stop="delEmoji2(showlistname.bqbId,showlistname.name)">
            <img src="../../assets/images/del-emoji.png" style="width:18px; height:22px; margin-right:15px"
              ondragstart="return false">
          </a>
        </div>
        <a class="set-emoji" href="javascript: ;">
          <img class="set-emoji" src="../../assets/images/set-emoji.png" @click="dialogout()"
            ondragstart="return false" />
        </a>
      </div>
      <div class="emoji-detail" v-scrollBar>
        <ul v-if="!showLoading">
          <a href="javascript: ;" v-for="(item, index) in emojiDetailList" :key="index" @click="checkFace(item)">
            <li class="emoji-detail-item" v-if="!showList">
              <img width="28" height="28" :src="global.fileDownUrl + 'compress/'+item.imgUrl" :title="item.msg[langIdx]"
                ondragstart="return false" />
            </li>
            <li class="emoji-detail-item large" v-else>
              <img width="74" height="74" :src="global.fileDownUrl + 'compress/'+ item.bqThumbnailUrl"
                ondragstart="return false" />
            </li>
          </a>
        </ul>
      </div>
      <loading v-if="showLoading"></loading>
      <div class="emoji-list display-flex">
        <div class="display-flex">
          <a class="emoji-list-item" :class="{ active: emojiListIndex == index }" ondragstart="return false"  href="javascript: ;"
            v-for="(item, index) in currentList" :key="index" @click="switchList(item.bqbId, index)">
            <img class="preview" v-if="index==0&&emojiPageIndex==1" :src="item.bqbCoverUrl"
              style="width:28px; height:28px" ondragstart="return false" />
            <img class="preview" v-else :src="global.fileDownUrl + 'compress/'+item.bqbCoverUrl"
              style="width:28px; height:28px" ondragstart="return false" />
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
  </div>
</template>

<script>
  import {
    Util
  } from "@/tools/utils";
  import {
    face
  } from "@/tools/emoji.js";
  import {
    sessionUtil
  } from "@/session/sessionUtil.js";
  import Vue from "vue";
  import {
    mapGetters
  } from "vuex";
  export default {
    data() {
      return {
        emojiList: [{
          bqbCoverUrl: './static/images/emoji.png',
          bqbId: 9999
        }],
        activeName: "first",
        emojidel: false,
        emojidel2: false,
        DefaultList: [],
        emojiDetailList: [],
        emojiListIndex: 0,
        emojiPageIndex: 1,
        showList: false,
        showlistname: {},
        showLoading: false,
        langIdx: 0,
        delname: [],
        delid: [],
        list: [],
        myemojilist: [],
        pageNum: 0,
        pageSize: 20,
        timer: null,
        isDragging: false,
      };
    },
    computed: {
      ...mapGetters(["myemoji", "right"]),
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
      showRight(obj) {
        if (!obj) {
          let right = {
            show: true
          }
          this.$store.commit("SET_RIGHT", right);
          this.$store.dispatch("setLayout", ["cp", "em", false]);
        }
        if (obj) {
          let right = {
            show: false
          }
          this.$store.commit("SET_RIGHT", right);
          this.$store.dispatch("setLayout", ['', '', false]);
        }
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
      delEmoji2(id, name) {
        this.delname = name
        this.delid = id
        this.emojidel2 = true
      },
      delEmojiconfirm2() {
        let obj = {
          bqbId: this.delid
        }
        this.$http.deleteEmoji(obj).then(
          data => {
            this.myemoji.myemojilist = this.myemoji.myemojilist.filter(item => item.bqbId !== this.delid)
            this.myemoji.emojiList = this.myemoji.emojiList.filter(item => item.bqbId !== this.delid)
            this.emojidel2 = false
            this.switchList(9999)
            this.switchPage(0)
            if (this.myemoji.emojiList.length < 6) {
              this.myemoji.emojiPage = 0;
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
      dialogout() {
        let myemoji = {
          show: true,
          myemojilist: this.myemoji.myemojilist,
          emojiList: this.myemoji.emojiList,
          emojiPage: this.myemoji.emojiPage
        }
        this.$store.commit("SET_MYEMOJI", myemoji);
      },
      checkFace(item) {
        if (this.emojiListIndex == 0 && this.emojiPageIndex == 1) {
          let name = face.msgToFace(face.faceToMsg(item.index));
          let url = './static/images/face/' + name;
          const content =
            '<img style="margin:auto 0px;float:none;pointer-events: none;" width="28" height="28" ondragstart="return false" src="' +
            this.global
            .fileDownUrl + 'compress/' +
            url +
            '" title="' +
            item.msg[0] +
            '">';
          //this.$emit("change", content);
          this.$parent.insertEmoji(content);
        } else {
          let obj = {
            bqbId: this.currentList[this.emojiListIndex].bqbId,
            chargeType: this.currentList[this.emojiListIndex].chargeType,
            bqUrl: item.bqMainUrl
          };
          this.$parent.insertEmoji(obj);
          //this.$emit("change", obj);
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
      gainemojiList() {
        this.$http.emojiList({}).then(
          data => {
            data.forEach(v => {
              v.bqbCoverUrl = v.bqbCoverUrl;
              this.emojiList.push(v);
              this.myemojilist.push(v);
            });
            this.myemoji.emojiList = this.emojiList
            this.myemoji.emojiPage = Math.ceil(this.emojiList.length / 5);
          },
          () => {}
        );
      }
    },
    mounted() {
      if (localStorage.lang == "en_US") {
        this.langIdx = 1;
      }
      if (localStorage.lang == "my") {
        this.langIdx = 2
      };
      // let cache=sessionUtil.getEmojiListSessionStorage();
      // if(!cache){
      this.gainemojiList()
      let myemoji = {
        show: false,
        myemojilist: this.myemojilist,
        emojiList: this.myemoji.emojiList,
        emojiPage: 0
      }
      this.$store.commit("SET_MYEMOJI", myemoji);
      //   }else{
      //   if(cache.length>0){
      //     this.emojiList=this.emojiList.concat(cache);
      //   }
      //   this.emojiPage = Math.ceil(this.emojiList.length / 6);
      // }
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
      //火狐拖拽打开新标签的
      document.body.ondrop = function (event) {
        event.preventDefault();
        event.stopPropagation();
      }
    },

  };

</script>

<style lang="scss">
  .emoji-icon {
    position: absolute;
    bottom: 14px;
    right: 72px;
    display: inline-block;
    width: 30px;
    height: 30px;
    background: url(../../assets/images/chat/icon-emoji.png) no-repeat center;
    user-select: none;

    &:hover {
      .emoji-wrap {
        display: block;
      }
    }
  }

  .showRight {
    background: url(../../assets/images/chat/show-emoji.png) no-repeat center;

    &:hover {
      .emoji-wrap {
        display: none;
      }
    }
  }

  .emoji-wrap {
    display: none;
    position: absolute;
    bottom: 30px;
    right: -12px;
    z-index: 102;
    width: 440px;
    padding-top: 10px;
    border-radius: 5px;
    background-color: #fff;
    border: 1px solid #e2e2e2;
    box-shadow: 0 0 8px #999;

    .top {
      justify-content: space-between;

      .showlistname {
        margin-left: 10px;
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

    .emoji-detail {
      position: relative;
      width: 100%;
      height: 219px;
      padding: 0 10px;

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
      justify-content: space-between;
      height: 43px;
      background-color: #f2f2f2;

      &-item {
        display: block;
        width: 66px;
        cursor: pointer;

        &.active {
          height: 43px;
          background-color: #fff;
        }

        .preview {
          display: block;
          width: 35px;
          height: 35px;
          margin: 9px 18px;
        }
      }

      .switch-page {
        border-left: 1px solid #ddd;

        .arrow {
          display: block;
          width: 30px;
          height: 30px;

          &.left {
            margin: 6px 12px 6px 11px;
            background: url(../../assets/images/emoji-arrow-left.png) no-repeat center center;
            background-size: 12px 16px;

            &:hover {
              background: url(../../assets/images/emoji-hove-left.png) no-repeat center center;
              background-size: 12px 16px;
            }

            &.disable {
              background: url(../../assets/images/emoji-disable-left.png) no-repeat center center;
              background-size: 12px 16px;
            }
          }

          &.right {
            margin: 6px 11px 6px 12px;
            background: url(../../assets/images/emoji-arrow-right.png) no-repeat center center;
            background-size: 12px 16px;

            &:hover {
              background: url(../../assets/images/emoji-hove-right.png) no-repeat center center;
              background-size: 12px 16px;
            }

            &.disable {
              background: url(../../assets/images/emoji-disable-right.png) no-repeat center center;
              background-size: 12px 16px;
            }
          }
        }
      }
    }
  }

  .set-emoji {
    width: 20px;
    height: 20px;
    margin-right: 10px;
  }

  .wrapper {
    .dialog {
      .is-top {
        width: 232px;

        #tab-first {
          width: 116px;
          text-align: center;
          padding: 0;
        }

        #tab-second {
          width: 116px;
          text-align: center;
          padding: 0;
        }
      }

      .el-dialog {
        .color-box {
          transition: transform 0.1s;
        }

        .color-box.dragging {
          transform: scale(1.1);
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

        .el-dialog__body {
          padding: 0;
        }
      }
    }
  }

  .control {
    margin-left: 20px;
    margin-right: 23px;
  }

  .color-box {
    transition: transform .5s;
  }

  .color-box.dragging {
    transform: scale(1.1);
  }

  .hot-emoji {
    height: 84px;

    .control {
      margin-left: 20px;
      margin-right: 23px;
    }

    .img {
      margin-right: 20px;
    }

    .name {
      font-size: 12px;
      font-weight: 600;
    }

    .emoji-box {
      width: 100%;
      height: 84px;
      justify-content: space-between;
      margin-right: 10px;
      border-bottom: 1px solid #e2e2e2;
    }

    .myemoji-icon {
      display: block;
      width: 20px;
      height: 20px;
      margin: 8px 10px;
      background: url(../../assets/images/emoji-add.png) no-repeat;
      background-size: 100%;

      &.success {
        background: url(../../assets/images/emoji-success.png) no-repeat;
        background-size: 100%;
      }

      &.wait {
        background: url(../../assets/images/emoji-wait.png) no-repeat;
        background-size: 100%;
      }
    }
  }

  .emoji-right {
    width: 345px;
    height: 679px;
    left: 686px;
    top: -551px;
    position: relative;

    .right-top {
      height: 18px;
      width: 100%;
      background: #F0F4F8;
    }

    .right-body {
      width: 100%;
      height: 661px;
      background: #fff;
    }
  }

</style>
