<template>
  <transition name="scale-x">
    <div class="my-popup search-record" @click="hide" v-if="isShow">
      <div class="my-popup-content" @click.stop="hideRight">
        <h3 class="my-popup-title">{{ $t("msg.search.title") }}</h3>
        <span class="my-popup-close" @click="hide"></span>
        <div class="header">
          <input type="text" :placeholder="$t('msg.search.holder')" v-model="searchKey" />
          <span v-show="searchKey!=''" class="clean" @click="searchKey=''"></span>
        </div>
        <div class="content" v-show="searchKey=='' || !(resultList && resultList.length)">
          <span class="dataNone"></span>
        </div>
        <div class="content" v-show="searchKey!='' && (resultList && resultList.length)">
          <div class="content-left">
            <ul v-scrollBar>
              <li :class="{active: item.paramId == paramId}" @click="openRecord(item)" v-for="item in resultList">
                <div class="item-left">
                  <img v-if=" item.img" v-headError :src="global.fileDownUrl + 'compress/' +item.img" class="avatar">
                  <span class="default" v-defaultHead v-if="!item.img" >{{ item.name }}</span>
                </div>
                <div class="item-right">
                  <p class="name" v-html="item.name"></p>
                  <p>{{item.record.length}}{{ $t("msg.search.recordNum") }}</p>
                </div>
              </li>
            </ul>
          </div>
          <div class="content-right" v-show="recordList && recordList.length">
            <div class="title">
              <span>{{recordList.length}} {{ $t("msg.search.and") }}“{{searchKey}}”{{ $t("msg.search.andRecordNum") }}</span>
              <span class="goto-chat" @click="gotoChat(record)"><i></i>{{ $t("msg.search.goChat") }}</span>
            </div>
            <!-- 多选 -->
            <div class="message-more display-flex" v-if="showMore">
              <i @click="showMore = false;"></i>
              <div class="forward-more" @click="showForward">
                <div class="img-forward" :class="{ disable: forwardStatus }"></div>
                <p>{{ $t("msg.menu.forward")}}</p>
              </div>
            </div>
            <ul v-scrollBar>
              <li v-for="(item, index) in recordList"
                :key="index"
                 :class="{ 'more-select': showMore,'active': (item.checked && showMore) }"
              >
                <span class="select" :class="{ active: item.checked }"></span>
                <span
                  class="selectArea"
                  v-show="showMore"
                  @click="historySelect(item)"
                ></span>
                <section :data-index="`{%type%:%record%,%mId%:${item.mId},%banAt%:true}`">
                  <div class="item-left">
                    <img v-if="record.fromType==1" v-headError :src="global.fileDownUrl + 'compress/' + item.chatInfo.headImg" class="avatar">
                    <span class="default" v-if="record.fromType==1 && !item.chatInfo.headImg" v-defaultHead >{{ item.chatInfo.name }}</span>
                    <img v-if="record.fromType==0" v-headError :src="global.fileDownUrl + 'compress/' + record.img" class="avatar">
                    <span class="default" v-if="record.fromType==0 && !record.img" v-defaultHead >{{ record.name }}</span>
                  </div>
                  <div class="item-right">
                    <div class="info">
                      <span v-if="record.fromType==1" v-keyWord="searchKey" v-html="item.chatInfo.nickName"></span>
                      <span v-if="record.fromType==0" v-keyWord="searchKey" v-html="record.name"></span>
                      <span class="time">{{ item.bodyTime | timeFilter }}</span>
                    </div>
                    <div class="content">
                      <!-- 文本 -->
                      <div v-if="item.bodyType==1 || item.bodyType==13 || item.bodyType==24" v-keyWord="searchKey" v-html="item.msgContent"></div>
                      <!-- 群通知 -->
                      <div v-if="item.bodyType==19" v-keyWord="searchKey" v-html="item.preview"></div>
                      <!-- 编辑 -->
                      <div class="edit" v-if="item.bodyType==28 && item.msgContent.editType != 30">
                        <div v-keyWord="searchKey" v-html="item.msgContent.content"></div>
                        <div class="icon-edit"></div>
                      </div>
                      <div class="replied" v-if="item.bodyType==28 && item.msgContent.editType == 30">
                        <div class="replied-title">"{{ item.msgContent.content.repliedName }}：</div>
                        <div class="replied-top" v-if="item.msgContent.content.msgType != 2 && item.msgContent.content.msgType != 3 &&
                        item.msgContent.content.msgType != 5 " v-html="item.msgContent.content.repliedContent"></div>
                        <div class="replied-img" v-if="item.msgContent.content.msgType == 2 ||
                        item.msgContent.content.msgType == 3">
                          <img class="img" :src="global.fileDownUrl + 'compress/' + item.msgContent.content.repliedContent"
                            v-imageError />
                        </div>
                        <div class="replied-img video" v-if="item.msgContent.content.msgType == 5">
                          <img class="img" :src="global.fileDownUrl + 'compress/' + item.msgContent.content.repliedContent"
                            v-imageError />
                        </div>
                        <div class="replied-content" v-keyWord="searchKey" v-html="item.msgContent.content.content"></div>
                        <div class="icon-edit"></div>
                      </div>
                      <!-- 回复 -->
                      <div class="replied" v-if="item.bodyType==30">
                        <div class="replied-title">"{{ item.msgContent.repliedName }}：</div>
                        <div class="replied-top" v-if="item.msgContent.msgType != 2 && item.msgContent.msgType != 3 &&
                        item.msgContent.msgType != 5 " v-html="item.msgContent.repliedContent"></div>
                        <div class="replied-img" v-if="item.msgContent.msgType == 2 ||
                        item.msgContent.msgType == 3">
                          <img class="img" :src="global.fileDownUrl + 'compress/' + item.msgContent.repliedContent"
                            v-imageError />
                        </div>
                        <div class="replied-img video" v-if="item.msgContent.msgType == 5">
                          <img class="img" :src="global.fileDownUrl + 'compress/' + item.msgContent.repliedContent"
                            v-imageError />
                        </div>
                        <div class="replied-content" v-keyWord="searchKey" v-html="item.msgContent.content"></div>
                      </div>
                    </div>
                  </div>
                </section>
              </li>
              <div class="li-bottom" v-if="showMore"></div>
            </ul>
          </div>
        </div>
      </div>
      <success
        v-model="showSuccess"
        :title="$t('msg.tip.operateSuccess')"
      ></success>
    </div>
  </transition>
</template>
<script>
import { MessageHandler } from "@/tools/messageHandler";
import { msgManager } from "@/session/msgManager";
export default {
  name: "search-record",
  data() {
    return {
      base:base,
      isShow: false,
      forwardStatus: false,
      showMore: true,
      searchKey: '',
      paramId:0,
      record:{},
      resultObj:[],
      resultList:[],
      recordList:[],
      searchReady:true,
      time:null,
      showSuccess: false,
    };
  },
  watch: {
    searchKey(ov, nv) {
      this.resultFilter();
    },
  },
  methods: {
    show(){
      this.isShow = true;
    },
    hide() {
      this.isShow = false;
      this.searchKey = '';
      this.resultObj = [];
      this.resultList = [];
      this.recordList = [];
    },
    hideRight(){
      this.$store.dispatch("setLayout", ["", "", false]);
    },
    historySelect(item) {
      item.checked = !item.checked;
      if (item.checked) {
        if (item.bodyType == 4 || item.bodyType == 29 || item.bodyType == 32 ) { 
          this.forwardStatus = true;
        }
      } else {
        if (item.bodyType == 4 || item.bodyType == 29 || item.bodyType == 32) {
          this.forwardStatus = false;
        } 
      }
      console.log(this.forwardStatus)
    },
    showForward(){

      //语音、名片、邀请链接不能转发
      if (this.forwardStatus) return false;

      let ids = this.getIds(this.recordList);
      if (!ids) {
        this.$store.commit(
          "SET_TOAST_TEXT",
          this.$t("msg.chatPanel.forwardMsg")
        );
        return false;
      }
      let body = this.getBodyArr(this.recordList);
      let forwardInfo = {
        show: true,
        body: body
      };
      console.log(forwardInfo);
      this.$store.commit("SET_FORWARD_INFO", forwardInfo);
      this.reSetMore(this.recordList,'');
    },
    getBodyArr(list) {
      var result = [];
      if (list && list.length) {
        for (var i = 0; i < list.length; i++) {
          var item = list[i];
          if (item.checked == true) {
            let body = {
              msgType: item.bodyType,
              bodyContent: item.bodyContent,
              msgContent: item.msgContent,
              preview: item.preview
            };
            result.push(body);
          }
        }
      } else {
        result = [];
      }
      return result;
    },
    getIds(list) {
      var result = "";
      if (list && list.length) {
        for (var i = 0; i < list.length; i++) {
          var item = list[i];
          if (item.checked == true) result += item.mId + ",";
        }
        result = result.substr(0, result.length - 1);
      } else {
        result = "";
      }
      return result;
    },
    resultFilter(){

      if(this.timer){clearTimeout(this.timer);}
      this.timer = setTimeout(()=> {
        this.paramId = 0;
        this.resultObj = [];
        this.resultList = [];
        this.recordList = [];
        if(this.searchKey!=''){
          msgManager.vagueFind(this.searchKey,(data,formType)=>{
            this.recordInit(data,formType)
          })
        }
      }, 200);
    },
    recordInit(data,formType){

      let session = JSON.parse(JSON.stringify(this.$store.state.session.record));
      data.map(record => {
        record.checked = false;
        if(formType!=2){
          if(!this.resultObj[record.userId+'-'+formType]){
            this.resultObj[record.userId+'-'+formType] = session[record.userId+'-'+formType];
            this.resultObj[record.userId+'-'+formType].record = [];
            this.resultObj[record.userId+'-'+formType].record.push(record)
          }
          else this.resultObj[record.userId+'-'+formType].record.push(record)
        }
      })
      this.resultList = Object.values(this.resultObj); 
      console.log(this.resultList);
    },
    reSetMore(list,mId){
      for (var i = 0; i < list.length; i++) {
        var item = list[i];
        item.checked == false
        if (item.mId == mId) this.historySelect(item);
      }
      this.showMore = false;
    },
    moreSelect(mId){
      this.reSetMore(this.recordList,mId);
      this.showMore=true;
    },
    openRecord(item){
      this.record = item;
      this.paramId = item.paramId;
      this.recordList = item.record;
      this.reSetMore(this.recordList,'');
      this.$store.commit("SET_RECORD", item);
    },
    gotoChat(item){
      this.$store.commit("UPDATE_CURRENT_SESSION", item);
      this.hide();
    },
    goMsg(mId) {

      this.$store.commit("UPDATE_CURRENT_SESSION", this.record);
      this.hide();
      setTimeout(()=> {
        this.$parent.$refs.chat.$refs.chatHistory.goFocus(mId);
      }, 1000);
    },
    doForward(mId){
      var history = this.getRecordItem(mId,this.$store.state.record.record);
      let forwardInfo = {
        show: true,
        body: [
          {
            msgType: history.bodyType,
            bodyContent: history.bodyContent,
            msgContent: history.msgContent,
            preview: history.preview
          }
        ]
      };
      this.$store.commit("SET_FORWARD_INFO", forwardInfo);
    },
    addFavorites(mId) {
      let message = this.getRecordItem(mId,this.$store.state.record.record);
      let currentSession = this.$store.state.record;
      let type = this.getType(message.bodyType);
      let sourceType = "1";
      let sourceId = currentSession.paramId;
      if (currentSession.fromType == 0) {
        if (message.bodyFrom == this.$store.state.userInfo.userId) {
          message.chatInfo = {
            nickName: this.$store.state.userInfo.nickName,
            headImg: this.$store.state.userInfo.headImg
          };
        } else {
          message.chatInfo = {
            nickName: currentSession.name,
            headImg: currentSession.img
          };
        }
      }
      message.bodyContent = this.getContent(message);
      var faObj = {
        bodyContent: message.bodyContent,
        bodyTime: message.bodyTime,
        bodyType: message.bodyType,
        chatInfo: message.chatInfo,
      }
      let collectionHead = JSON.stringify(faObj);
      let collectionBody = JSON.stringify(faObj);

      if (currentSession.fromType == 1) sourceType = "2";
      let obj = {
        collectionHead, //消息简体
        collectionBody, //消息体
        type, //收藏内容类型（1：文本、2：图片、3：视频、4：语言、5：连接、6：聊天纪录）
        sourceId, //源id(好友id、群id...)
        sourceType //源类型（1：好友、2：群、3：朋友圈）
      };
      this.$http.addFavorites(obj).then(
        () => {
          this.showSuccess = true;
          setTimeout(() => {
            this.showSuccess = false;
          }, 1500);
        },
        () => {}
      );
    },
    getRecordItem(mId,list){
      let result = {};
      for (var i = 0; i < list.length; i++) {
        let item = list[i];
        if(mId == item.mId) result = item;
      }
      return result;
    },
    getType(type) {
      let result = "1";
      //文本
      if (type == 1 || type == 24 || type == 28 || type == 30) result = "1";
      //表情、图片
      if (type == 2 || type == 3) result = "2";
      //视频
      if (type == 5) result = "3";
      //语音
      if (type == 4) result = "4";
      //链接
      if (type == 13) result = "5";
      //文件
      if (type == 18) result = "8";
      return result;
    },
    getContent(history) {
      var content = history.bodyContent;
      if (history.bodyType == 1 || history.bodyType == 13) {
        content = MessageHandler.htmlToText(content);
      }
      if (history.bodyType == 24) {
        content = MessageHandler.htmlToText(history.msgContent);
      }
      if (history.bodyType == 28) {
        if(!(typeof history.bodyContent == "object")) history.bodyContent = JSON.parse(history.bodyContent);
        content = history.bodyContent.content;
        if (history.bodyContent.editType == 30) {
          if(!(typeof content == "object")) content = JSON.parse(content);
          content = content.content;
        }
        content = MessageHandler.htmlToText(content);
      }
      if (history.bodyType == 30) {
        if(!(typeof history.bodyContent == "object")) history.bodyContent = JSON.parse(history.bodyContent);
        content = history.bodyContent.content;
        if (history.bodyContent.editType == 30) {
          if(!(typeof content == "object")) content = JSON.parse(content);
          content = content.content;
        }
        content = MessageHandler.htmlToText(content);
      }
      return content;
    },
  },
  mounted(){}
};
</script>

<style lang="scss" scoped>
@import "../../assets/css/var";
//添加好友弹窗
.search-record {
  .my-popup-content {
    width: 687px;
    height: 541px;
    overflow: hidden;
    .header{
      position:relative;
      height:71px;
      padding:24px 120px;
      border-top:1px solid #e2e2e2;
      border-bottom:1px solid #e2e2e2;
      input{
        display:inline-block;
        height:23px;
        width:100%;
        padding-left:10px;
        background:#F0F4F8;
      }
      .clean{
        position:absolute;
        top:50%;right:125px;
        height:18px;
        width:18px;
        margin-top:-9px;
        cursor:pointer;
        background-image: url(../../assets/images/search/close.png);
        background-size: 100% 100%;
        &:hover{
          background-image: url(../../assets/images/search/close-red.png);
        }
      }
    }
    .content{
      height:431px;
      width:100%;
      overflow:hidden;
      .dataNone{
        display:inline-block;
        height:106px;
        width:108px;
        margin:107px 290px 0 290px;
        background-image: url(../../assets/images/search/logo-none.png);
        background-size: 100% 100%;
      }
      .content-left{
        float:left;
        height:431px;
        width:219px;
        border-right:1px solid #e2e2e2;
        ul{
          position:relative;
          height:431px;
          li{
            height:68px;
            border-bottom:1px solid #e2e2e2;
            cursor:pointer;
            &.active{
              background:#F0F4F8;
            }
            &:hover{
              background:#F0F4F8;
            }
            .item-left{
              float:left;
              position: relative;
              margin: 10px;
              .avatar {
                display: block;
                width: 47px;
                height: 47px;
                border-radius: 50%;
                -o-object-fit: cover;
                object-fit: cover;
              }
              .default {
                display: block;
                width: 47px;
                height: 47px;
                border-radius: 50%;
                text-align: center;
                line-height: 47px;
                font-weight: 550;
                color: #fff;
              }
            }
            .item-right{
              float:right;
              position: relative;
              width: 150px;
              height: 100%;
              line-height: 22px;
              p{
                max-width: 130px;
                margin-top: 4px;
                font-size: 12px;
                color: #999;
                text-align:left;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                &.name{
                  margin-top: 10px;
                  font-size: 14px;
                  color:#000;
                }
              }
            }
          }
        }
      }
      .content-right{
        position:relative;
        float:left;
        height:431px;
        width:467px;
        .title{
          height:34px;
          line-height:34px;
          text-align:left;
          padding:0 10px 0 21px;
          border-bottom:1px solid #e2e2e2;
          span{
            color:#999;
          }
          .goto-chat{
            float:right;
            color:#3498DF;
            height: 34px;
            line-height: 34px;
            cursor:pointer;
            i{
              display:inline-block;
              height:20px;
              width:21px;
              background-image: url(../../assets/images/search/send.png);
              background-size: 100% 100%;
              vertical-align: middle;
              margin-right:8px;
            }
          }
        }
        .message-more {
          z-index: 13;
          position: absolute;
          left: 0;
          bottom: 0;
          width: 100%;
          height: 100px;
          border-top: 1px solid $border-color;
          background: #fff;
          i {
            display: inline-block;
            position: absolute;
            top: 15px;
            right: 12px;
            height: 8px;
            width: 8px;
            background-image: url(../../assets/images/chat/icon-window-close.png);
            background-size: 100% 100%;
            cursor: pointer;
          }
          .forward-more{
            margin-left:35%;
            width: 30%;
            font-size: 14px;
            .img-forward {
              height: 39px;
              width: 39px;
              margin: 0 auto;
              border-radius: 50px;
              cursor: pointer;
              background: url(../../assets/images/spr-forward.png) 0 0;
              &:hover{
                background: url(../../assets/images/spr-forward.png) 0 -39px;
              }
              &:active{
                background: url(../../assets/images/spr-forward.png) 0 -78px;
              }
              &.disable {
                cursor: not-allowed;
                &:hover{
                  background: url(../../assets/images/spr-forward.png) 0 0;
                }
                &:active{
                  background: url(../../assets/images/spr-forward.png) 0 0;
                }
              }
            }
            p {
              height: 14px;
              margin-top: 6px;
              font-size: 14px;
              text-align: center;
            }
          }
        }
        ul{
          position:relative;
          height:397px;
          .li-bottom{
            height: 100px;
          }
          li{
            position:relative;
            height:auto;
            overflow:auto;
            &.active{
              background-color: #ddd;
              &:hover{
                background:#ddd;
              }
            }
            &:hover{
              background:#F0F4F8;
            }
            &.more-select {
              padding-left: 45px;
              .select {
                display: block;
              }
              .item-right{
                width: 370px;
              }
            }
            .selectArea{
              z-index: 11;
              position: absolute;
              top: 0;right: 0;
              height: 100%;
              width: 100%;
            }
            .select{
              display: none;
              z-index: 10;
              position: absolute;
              top: 18px;left: 16px;
              height: 18px;
              width: 18px;
              background-image: url(../../assets/images/chat/icon-select.png);
              background-size: 100% 100%;
              &.active{
                background-image: url(../../assets/images/chat/icon-select-blue.png);
              }
            }
            .item-left{
              float:left;
              position: relative;
              width:51px;
              .avatar {
                display: block;
                width: 30px;
                height: 30px;
                margin:25px 10px 10px 10px;
                border-radius: 50%;
                -o-object-fit: cover;
                object-fit: cover;
              }
              .default {
                position:absolute;
                top:25px;left:10px;
                display: block;
                width: 30px;
                height: 30px;
                border-radius: 50%;
                text-align: center;
                line-height: 30px;
                font-weight: 550;
                color: #fff;
              }
            }
            .item-right{
              float:right;
              position: relative;
              width: 415px;
              height: auto;
              line-height: 22px;
              padding-bottom:15px;
              border-bottom:1px solid #e2e2e2;
              .info{
                height: 25px;
                line-height: 25px;
                font-size: 14px;
                margin:15px 0 5px 0;
                color: #999;
                text-align:left;
                padding-right:15px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                .time{
                  float:right;
                }
              }
              .content{
                height:auto;
                width:100%;
                word-break: break-all;
                text-align: left;
                padding-right: 15px;
                .edit{
                  height:auto;
                  overflow:auto;
                  div{
                    float: left;
                  }
                  .icon-edit{
                    float: left;
                    margin: 3px 0 0 15px;
                    width: 20px;
                    height: 20px;
                    background-size: 100% 100%;
                    background-image: url(../../assets/images/chat/edit.png);
                  }
                }
                .replied{
                  position:relative;
                  width:200px;
                  padding:10px;
                  border:1px solid #e2e2e2;
                  .icon-edit{
                    position: absolute;
                    top:0;right:-40px;
                    width: 20px;
                    height: 20px;
                    background-size: 100% 100%;
                    background-image: url(../../assets/images/chat/edit.png);
                  }
                  .replied-title{
                    height:auto;
                    padding:5px 0;
                  }
                  .replied-top{
                    height:auto;
                    padding:8px 0;
                  }
                  .replied-img{
                    position:relative;
                    height:120px;
                    padding:10px 0;
                    img{
                      height:100px;
                      width:100px;
                    }
                    &.video:after {
                        content: "";
                        position: absolute;
                        top: 50%;
                        margin-top: -25px;
                        left: 25px;
                        width: 50px;
                        height: 50px;
                        background: url(../../assets/images/chat/video-play.png);
                        background-size: 100%;
                    }
                  }
                  .replied-content{
                    height:auto;
                    padding:8px 0;
                    border-top:1px solid #999;
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>
