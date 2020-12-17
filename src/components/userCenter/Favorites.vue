<template>
  <div class="display-flex fa" v-show="value" @click.stop="menuData.show = false;">
    <div class="fa-title">
      <label>{{$t('msg.user.favorite')}}</label>
      <input type="text" v-model="send.searchKey" :placeholder="$t('msg.user.searchFavorite')">
      <span class="close" @click="hide"></span>
      <label class="write" @click="openEditor('');"></label>
    </div>
    <div class="fa-tip">
      <label @click="switchType(0)" :title="$t('msg.user.allFavorite')"
        :class="{active:send.type==0}">{{$t('msg.user.allFavorite')}}</label>
      <label @click="switchType(1)" :title="$t('msg.common.messages')"
        :class="{active:send.type==1}">{{$t('msg.common.messages')}}</label>
      <label @click="switchType(2)" :title="$t('msg.common.image')"
        :class="{active:send.type==2}">{{$t('msg.common.image')}}</label>
      <label @click="switchType(3)" :title="$t('msg.common.video')"
        :class="{active:send.type==3}">{{$t('msg.common.video')}}</label>
      <label @click="switchType(4)" :title="$t('msg.common.voice')"
        :class="{active:send.type==4}">{{$t('msg.common.voice')}}</label>
      <label @click="switchType(8)" :title="$t('msg.common.file')"
        :class="{active:send.type==8}">{{$t('msg.common.file')}}</label>
      <label @click="switchType(5)" :title="$t('msg.common.links')"
        :class="{active:send.type==5}">{{$t('msg.common.links')}}</label>
      <label @click="switchType(9)" :title="$t('msg.note.title')"
        :class="{active:send.type==9}">{{$t('msg.note.title')}}</label>
    </div>
    <div class="fa-message">
      <!-- 加载中 -->
      <loading v-if="!readyStatus"></loading>
      <!-- 多选 -->
      <div class="message-more display-flex" v-if="showMore">
        <i @click="showMore = false;"></i>
        <div class="forward-more" @click="showForward">
          <div class="img-forward" :class="{ disable: forwardStatus }"></div>
          <p>{{ $t("msg.menu.forward")}}</p>
        </div>
        <div class="delete-more" @click="showDelete">
          <div class="img-delete"></div>
          <p>{{ $t("msg.menu.delete") }}</p>
        </div>
      </div>
      <ul class="message-list" @ps-y-reach-end="loadMore" v-scrollBar>
        <div class="li-top" v-if="showMore"></div>
        <li class="dataNone" v-if="!(chatHistory && chatHistory.length) && send.searchKey==''">
          <img class="none-img" src="../../assets/images/index/fa-img.png">
          <p>{{$t('msg.user.noFavorite')}}</p>
          <p class="color">{{$t('msg.user.rightFavorite')}}</p>
        </li>
        <li class="dataNone" v-if="!(chatHistory && chatHistory.length) && send.searchKey!=''">
          <img class="none-img" src="../../assets/images/index/fa-img.png">
          <p>{{$t('msg.user.noResult')}}</p>
        </li>
        <li v-for="(item, index) in chatHistory" :key="index"
          :class="{ 'more-select': showMore,'active': (item.checked && showMore) }">
          <span class="select" :class="{ active: item.checked }"></span>
          <span class="selectArea" v-show="showMore" @click="historySelect(item)"></span>
          <!-- 文字消息 -->
          <div class="message-item"
            v-if="item.bodyType=='1' || item.bodyType=='13' || item.bodyType=='24' || item.bodyType=='28' || item.bodyType=='30'">
            <div class="display-flex menu" @click.stop="clickMenu($event,item)">···</div>
            <div class="item-left">
              <img v-headError :src="global.fileDownUrl+'compress/'+item.chatInfo.headImg">
            </div>
            <div class="item-right">
              <div class="name">{{item.chatInfo.nickName}}
                <span>{{item.bodyTime | timeFilter}}</span>
              </div>
              <div class="content text" @click="openDetail(item)" v-html="item.msgContent"></div>
            </div>
          </div>
          <!-- 表情消息 -->
          <div class="message-item" v-if="item.bodyType=='2'">
            <div class="display-flex menu" @click.stop="clickMenu($event,item)">···</div>
            <div class="item-left">
              <img v-headError :src="global.fileDownUrl+'compress/'+item.chatInfo.headImg">
            </div>
            <div class="item-right">
              <div class="name">{{item.chatInfo.nickName}}
                <span>{{item.bodyTime | timeFilter}}</span>
              </div>
              <div class="content">
                <img class="img" :src="global.fileDownUrl+'compress/'+item.msgContent.bqUrl">
              </div>
            </div>
          </div>
          <!-- 图片消息 -->
          <div class="message-item" v-if="item.bodyType=='3'">
            <div class="display-flex menu" @click.stop="clickMenu($event,item)">···</div>
            <div class="item-left">
              <img v-headError :src="global.fileDownUrl+'compress/'+item.chatInfo.headImg">
            </div>
            <div class="item-right">
              <div class="name">{{item.chatInfo.nickName}}
                <span>{{item.bodyTime | timeFilter}}</span>
              </div>
              <div class="content">
                <img v-imageError class="img" :data-idx="index"
                  :src="global.fileDownUrl+'compress/'+item.msgContent.imgUrl" :mId="item.id" v-faViewer="chatHistory">
              </div>
            </div>
          </div>
          <!-- 语音消息 -->
          <div class="message-item" v-if="item.bodyType=='4'">
            <div class="display-flex menu" @click.stop="clickMenu($event,item)">···</div>
            <div class="item-left">
              <img v-headError :src="global.fileDownUrl+'compress/'+item.chatInfo.headImg">
            </div>
            <div class="item-right">
              <div class="name">{{item.chatInfo.nickName}}
                <span>{{item.bodyTime | timeFilter}}</span>
              </div>
              <div class="content">
                <div class="msg-detail">
                  <div class="voice-pannel">
                    <div class="voice-left">
                      <i class="icon-play" @click.stop="voicePlay(item, index)"
                        :class="{ active: item.msgContent.isPlaying }"></i>
                    </div>
                    <div class="voice-right">
                      <div class="voice-progress" @click="setCurrentTime($event,item, index)">
                        <span class="open-progress" :style="{
						                          width:pxNum(item.msgContent.proNum,item.msgContent.duration)}"></span>
                        <span class="unread-progress" v-if="!item.msgContent.isPlay && userId != item.bodyFrom"></span>
                      </div>
                      <div class="voice-detail">
                        <span v-if="item.msgContent.proNum!=0">00:<span
                            v-text="timeNum(item.msgContent.proNum)"></span>/</span><span>00:{{item.msgContent.duration>9?item.msgContent.duration:'0'+item.msgContent.duration}}</span>
                        <span class="time">{{ item.bodyTime | timeFilter }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- 视频消息 -->
          <div class="message-item" v-if="item.bodyType=='5'">
            <div class="display-flex menu" @click.stop="clickMenu($event,item)">···</div>
            <div class="item-left">
              <img v-headError :src="global.fileDownUrl+'compress/'+item.chatInfo.headImg">
            </div>
            <div class="item-right">
              <div class="name">{{item.chatInfo.nickName}}
                <span>{{item.bodyTime | timeFilter}}</span>
              </div>
              <div class="content">
                <div class="video" v-videoError>
                  <img class="img" :src="global.fileDownUrl+'compress/'+item.msgContent.imgUrl" :data-idx="index"
                    :mId="item.id" v-faViewer="chatHistory">
                </div>
              </div>
            </div>
          </div>
          <!-- 文件消息 -->
          <div class="message-item" v-if="item.bodyType=='18'">
            <div class="display-flex menu" @click.stop="clickMenu($event,item)">···</div>
            <div class="item-left">
              <img v-headError :src="global.fileDownUrl+'compress/'+item.chatInfo.headImg">
            </div>
            <div class="item-right">
              <div class="name">{{item.chatInfo.nickName}}
                <span>{{item.bodyTime | timeFilter}}</span>
              </div>
              <div class="content">
                <div class="file">
                  <div class="file-info">
                    <p class="title">{{item.msgContent.name}}</p>
                    <div class="size"><span>{{item.msgContent.size | fileSize}}</span></div>
                    <div class="download">
                      <a target="_blank" :alt="item.msgContent.name"
                        :href="global.fileDownUrl + 'html/download1.html#'+ item.msgContent.dl64"
                        class="download display-flex-item">{{$t('msg.common.download')}}</a>
                    </div>
                  </div>
                  <div class="file-icon" :class="item.msgContent.name | fileFitler"></div>
                </div>
              </div>
            </div>
          </div>
          <!-- 名片消息 -->
          <div class="message-item" v-if="item.bodyType=='32'">
            <div class="display-flex menu" @click.stop="clickMenu($event,item)">···</div>
            <div class="item-left">
              <img v-headError :src="global.fileDownUrl+'compress/'+item.chatInfo.headImg">
            </div>
            <div class="item-right">
              <div class="name">{{item.chatInfo.nickName}}
                <span>{{item.bodyTime | timeFilter}}</span>
              </div>
              <div class="content">
                <div class="card" @click="clickCard($event, item)">
                  <div class="person-title">{{$t('msg.common.card')}}</div>
                  <div class="person-content">
                    <img v-headError :src="global.fileDownUrl + 'compress/' + item.chatInfo.avatar"
                      class="person-avatar">
                    <div class="person-name">{{item.chatInfo.nickName}}</div>
                    <div class="person-id">EchatAPP ID：{{item.chatInfo.userId}}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- 笔记消息 -->
          <div class="message-item" v-if="item.bodyType=='46'">
            <div class="display-flex menu" @click.stop="clickMenu($event,item)">···</div>
            <div class="item-left">
              <img v-headError :src="global.fileDownUrl+'compress/'+item.chatInfo.headImg">
            </div>
            <div class="item-right">
              <div class="name">{{item.chatInfo.nickName}}
                <span>{{item.bodyTime | timeFilter}}</span>
              </div>
              <div class="content text" @click="openEditor(item)" v-html="item.msgContent"></div>
            </div>
          </div>
        </li>
        <div class="no-more" v-show='config.dataNone && (chatHistory && chatHistory.length)'>
          <span class="text">{{ $t("msg.chatPanel.none") }}</span>
        </div>
      </ul>
    </div>
    <transition name="pop">
      <div class="menu-box" :style="{'top': menuData.top+'px' ,'left': menuData.left+'px'}" v-show="menuData.show"
        @click.stop=";">
        <ul class="menu-list">
          <li class="menu-item" :title="$t('msg.menu.copy')" v-if="getCopyStatus(menuData.item)"
            @click="menuData.show = false;doCopy(menuData.item)">
            {{$t('msg.menu.copy')}}
          </li>
          <li class="menu-item" :title="$t('msg.menu.forward')" v-if="getForwardStatus(menuData.item)"
            @click="menuData.show = false;doForward(menuData.item)">
            {{$t('msg.menu.forward')}}
          </li>
          <li class="menu-item" :title="$t('msg.menu.more')" @click="menuData.show = false;showMore=true;">
            {{$t('msg.menu.more')}}
          </li>
          <li class="menu-item" :title="$t('msg.menu.delete')" @click="menuData.show = false;showConfirm=true;">
            {{$t('msg.menu.delete')}}
          </li>
        </ul>
      </div>
    </transition>
    <!-- 确认删除 -->
    <Popup :title="$t('msg.tip.tip')" @click.native="showConfirm=false" :hideClose="true" v-if="showConfirm">
      <div class="logout" @click.stop="" slot="body">
        <div class="my-popup-content">
          <div class="logout-detail">{{ $t("msg.user.deleteFavorite") }}</div>
          <button class="two-btn cannel" @click="showConfirm = false">
            {{ $t("msg.common.cancel") }}
          </button>
          <button class="two-btn delete" @click="deleteFavorites(menuData.item.id)">
            {{ $t("msg.menu.delete") }}
          </button>
        </div>
      </div>
    </Popup>
    <!-- 文本详情 -->
    <transition name="scale-x">
      <div class="my-popup" v-show="showDetail" @click.stop=";">
        <div class="my-popup-content detail">
          <span class="my-popup-close" @click="showDetail = false"></span>
          <h3 class="my-popup-title">{{$t('msg.detail.title')}}</h3>
          <div class="detail-hr"></div>
          <div class="detail-tip">
            <button class="forward" :title="$t('msg.menu.forward')"
              @click="doForward(detail)">{{$t('msg.menu.forward')}}</button>
            <button class="del" :title="$t('msg.menu.delete')"
              @click="menuData.item=detail;showDetail=false;showConfirm=true">{{$t('msg.menu.delete')}}</button>
          </div>
          <div class="detail-centent" @click="interceptor($event,detail);" v-scrollBar v-html="detail.msgContent"></div>
        </div>
      </div>
    </transition>
    <!-- 新建笔记 -->
    <transition name="scale-x">
      <div class="my-popup" v-show="showNotes" @click.stop=";">
        <div class="my-popup-content notes">
          <span class="my-popup-close" @click="closeEditor"></span>
          <h3 class="my-popup-title">{{$t('msg.note.title')}}</h3>
          <!-- 上传文件 -->
          <label for="editUplaod" class="editor-file">
            <input type="file" hidden="true" id="editUplaod" @change="selectUplaod($event)"
              accept=".jpg,.png,.jpeg,.gif,.ico,.bmp,.tif,.svg" />
          </label>
          <!-- 保存按钮 -->
          <span class="editor-save" @click="editSave"></span>
          <!-- 清空按钮 -->
          <span class="editor-clear" @click="clear"></span>
          <tinymce-editor ref="editor" v-model="editorHtml">
          </tinymce-editor>
          <div class="loading-box" v-if="editorLoading">
            <loading></loading>
          </div>
        </div>
      </div>
    </transition>
    <video-play ref="video"></video-play>
    <card ref="card"></card>
  </div>
</template>

<script>
  import Vue from "vue";
  import Qs from 'qs'
  import {
    mapGetters
  } from "vuex";
  import msg from '@/tools/msg'
  import {
    MessageHandler
  } from "@/tools/messageHandler";
  import {
    Util
  } from "@/tools/utils";
  import VideoPlay from "@/components/char-panel-components/VideoPlayer";
  import Card from "@/components/char-panel-components/Card";
  import TinymceEditor from '@/components/tinymce-editor'
  export default {
    data() {
      return {
        isShow: false,
        send: {
          searchKey: '',
          type: 0,
        },
        showMenu: true,
        showConfirm: false,
        showMore: false,
        forwardStatus: false,
        showDetail: false,
        showNotes: false,
        detail: {
          msgContent: '',
        },
        chatHistory: [],
        menuData: {
          show: false,
          left: 0,
          right: 0,
          item: {}
        },
        tempItem: {},
        config: {
          page: 1,
          lastPage: 1,
          dataNone: false,
        },
        readyStatus: false,
        tempIndex: null,
        t_pro: null, //播放语言定时器

        editorHtml: '', //富文本编辑器
        editorId: '',
        editorReady: true,
        editorItem: {},
        editorLoading: false,
      }
    },
    props: {
      value: {
        type: Boolean
      },
    },
    components: {
      VideoPlay,
      Card,
      TinymceEditor,
    },
    watch: {
      value() {
        if (this.value) {
          this.show();
          if (this.t_pro) clearInterval(this.t_pro);
        }
      },
      'send.searchKey': {
        handler() {
          this.config = {
            page: 1,
            lastPage: 1,
            dataNone: false,
          }
          this.search(1);
        },
      }
    },
    methods: {
      //打开笔记
      openEditor(item) {
        this.$refs.editor.clear();
        if (item == '') {
          this.editorId = '';
          this.showNotes = true;
          return false;
        }
        this.editorItem = item;
        this.editorId = item.id;
        this.showNotes = true;
        this.$refs.editor.insert(item.bodyContent);

      },
      closeEditor() {
        if (this.editorId) {
          if (this.editorItem.bodyContent != this.editorHtml) {
            this.quitConfirm();
            return
          }
        } else {
          if (this.editorHtml != '') {
            this.quitConfirm();
            return
          }
        }
        this.$refs.editor.clear();
        this.showNotes = false;
      },
      quitConfirm() {
        this.$message({
          title: this.$t('msg.tip.tip'),
          message: this.$t('msg.note.info'),
          showClose: false,
          confirmButtonText: this.$t('msg.note.quit'),
          cancelButtonText: this.$t('msg.note.continue'),
        }).then(
          data => {
            this.$refs.editor.clear();
            this.showNotes = false;
          }, data => {}
        );
      },
      //清空内容
      clear() {
        this.$refs.editor.clear();
      },
      //保存
      editSave() {
        if (!this.editorHtml) {
          this.$store.commit("SET_TOAST_TEXT", '没有相关内容');
          return false;
        }
        var faObj = {
          bodyContent: this.editorHtml,
          bodyTime: new Date().getTime(),
          bodyType: '46',
          chatInfo: {
            nickName: this.$store.state.userInfo.nickName,
            userId: this.$store.state.userInfo.userId,
            headImg: this.$store.state.userInfo.avatar
          }
        }
        //使用编辑前的bodyTime
        if (this.editorId) faObj.bodyTime = this.editorItem.bodyTime;

        var formData = new FormData();
        formData.append("collectionHead", JSON.stringify(faObj));
        formData.append("collectionBody", JSON.stringify(faObj));
        formData.append("type", 9);
        if (this.editorId) {
          formData.append("id", this.editorId);
        }
        var xml = new XMLHttpRequest();
        xml.open("post", base.imscUrl + '/collection/add.htm', true);
        xml.setRequestHeader("token", this.$store.getters.token);
        xml.setRequestHeader("locale", localStorage.lang || 'en_US');
        xml.send(formData);
        xml.onreadystatechange = () => { //回调函数
          if (xml.status == 200 && this.editorReady) {
            this.editorReady = false;
            setTimeout(() => {
              this.editorReady = true;
              let res = JSON.parse(xml.responseText);
              if (res.code == 0) {
                this.$store.commit("SET_TOAST_TEXT", res.data);
                this.$refs.editor.clear();
                this.showNotes = false;
                this.search(1);
              } else {
                this.$store.commit("SET_TOAST_TEXT", res.data);
              }
            }, 20)
          }
        };
      },
      //选择文件
      selectUplaod() {
        let file = event.target.files[0];
        let nameArr = file.name.split(".");
        let fileName = nameArr[nameArr.length - 1];
        //过滤不支持的图片格式
        if (/(jpg|jpeg|png|gif|ico|bmp|tif|svg)$/i.test(fileName)) {
          this.editorLoading = true;
          Util.getImgUrl(file, 1).then(
            data => {
              let url = this.global.fileDownUrl + 'compress/' + data;
              let img = new Image();
              img.src = url;
              img.onload = () => {
                this.$refs.editor.insert('<img height="' + img.height + '" width="' + img.width + '" src="' + url +
                  '">')
              };
              this.editorLoading = false;

            }, data => {
              this.$store.commit("SET_TOAST_TEXT", data);
              this.editorLoading = false;
            }
          );
        } else {
          return false;
          if (file.size == 0 || file.size > 1024 * 1024 * 100) {
            this.$store.commit("SET_TOAST_TEXT", this.$t("msg.imgPopup.overSize"));
            return false;
          }
          Util.getFileUrl(file).then(
            data => {
              console.log(data)
              // this.$refs.editor.insert('<a href="'+this.global.fileDownUrl+'/'+data.url+'" download="'+data.name+'"><span>'+data.name+'</span><br><span>'+data.size+'m</span></a>')
            }, data => {
              console.log(data)
            }
          );
        }
      },
      show() {
        this.isShow = true;
        this.send = {
          searchKey: '',
          type: 0,
        }
        this.config = {
          page: 1,
          lastPage: 1,
          dataNone: false,
        }
        this.search(1);
        if (this.t_pro) clearInterval(this.t_pro);
      },
      hide() {
        this.$parent.showFavorites = false;
        if (this.t_pro) clearInterval(this.t_pro);
      },
      openDetail(item) {
        this.detail = item;
        this.showDetail = true;
      },
      clickCard(event, value) {
        event.stopPropagation();
        this.$refs.card.show(event, value);
      },
      setCurrentTime(e, item, index) {
        let audio = document.getElementById("message-voice");
        audio.src = this.global.fileDownUrl + 'original/' + item.msgContent.voiceUrl;
        audio.currentTime = e.offsetX * item.msgContent.duration / 160;
        item.msgContent.proNum = audio.currentTime;
        clearInterval(this.t_pro);
        this.voicePlay(item, index)
      },
      startPro(item, status) {
        if (status) {
          this.t_pro = setInterval(() => {
            if (item.msgContent.proNum < item.msgContent.duration) {
              item.msgContent.proNum = item.msgContent.proNum + 0.1;
            } else {
              clearInterval(this.t_pro);
              item.msgContent.proNum = 0;
            }
          }, 100)
        } else {
          clearInterval(this.t_pro);
        }
      },
      timeNum(num) {
        if (!num) num = 0;
        let result = parseInt(num);
        result = result > 9 ? result : '0' + result
        return result
      },
      pxNum(num, sum) {
        let result = num * 160 / sum;
        return parseInt(result) + 'px'
      },
      voicePlay(item, index) {

        //更新本地消息记录
        if (!item.msgContent.isPlay) item.msgContent.isPlay = true;
        if (!item.msgContent.proNum) item.msgContent.proNum = 0;

        let audio = document.getElementById("message-voice");

        if (this.tempIndex>=0 && 
            this.chatHistory[this.tempIndex] && 
            this.chatHistory[this.tempIndex].bodyType==4 && 
            this.tempIndex != index) 
        {
          this.chatHistory[this.tempIndex].msgContent.isPlaying = false;
          this.chatHistory[this.tempIndex].msgContent.proNum = 0;
          clearInterval(this.t_pro);
          audio.pause();
        }
        this.tempIndex = index;

        if (audio.paused) {
          let voiceSrc = this.global.fileDownUrl + 'original/' + item.msgContent.voiceUrl;
          if (voiceSrc.indexOf('?') > 0) {
            voiceSrc = voiceSrc.split('?')[0];
          }
          audio.src = voiceSrc;
          audio.currentTime = item.msgContent.proNum
          audio.play();
          item.msgContent.isPlaying = true;
          this.startPro(item, true);
        } else {
          audio.pause();
          item.msgContent.isPlaying = false;
          this.startPro(item, false);
        }
        //播放结束事件
        audio.onended = () => {
          item.msgContent.isPlaying = false;
        };
        audio.onerror = error => {
          console.error(error);
          item.msgContent.isPlaying = false;
          item.msgContent.proNum = 0;
          clearInterval(this.t_pro);
          this.$store.commit("SET_TOAST_TEXT", this.$t("msg.chatPanel.voiceFail"));
        }
      },
      switchType(type) {
        this.send.type = type;
        this.config = {
          page: 1,
          lastPage: 1,
          dataNone: false,
        }
        this.search(1);
      },
      initList(data) {
        let list = [];
        for (var i = 0; i < data.list.length; i++) {
          let v = data.list[i];
          if (v.collectionHead && v.isRemove == 0) {
            let item = JSON.parse(v.collectionHead);
            item.id = v.id;
            item.checked = false;
            item.bodyTime = v.createDate;
            item.msgContent = JSON.parse(JSON.stringify(item.bodyContent));
            if (!item.chatInfo) {
              item.chatInfo = {
                nickName: "--",
                headImg: "./static/images/chat/img-username.png"
              }
            }
            if (item.bodyType == '1' || item.bodyType == '13' || item.bodyType == '24' || item.bodyType == '28' || item
              .bodyType ==
              '30') {
              item.msgContent = MessageHandler.textToHtml(item.msgContent, true, false);
            }
            if (item.bodyType == '2' || item.bodyType == '3' || item.bodyType == '4' || item.bodyType == '5' || item
              .bodyType ==
              '18' || item.bodyType == '32') {
              if (item.msgContent) {
                if (!(typeof item.msgContent == "object")) {
                  item.msgContent = JSON.parse(item.msgContent);
                  if (item.bodyType == '18') {
                    let obj = {
                      url: this.global.fileDownUrl + 'original/' + item.msgContent.url,
                      name: item.msgContent.name
                    }
                    let d = JSON.stringify(obj);
                    d = window.encodeURIComponent(d);
                    let str = window.btoa(d);
                    item.msgContent.dl64 = str
                  }
                }
              }
              if (item.bodyType == '4') {
                if (!item.msgContent.isPlay) item.msgContent.isPlay = true;
                if (!item.msgContent.isPlaying) item.msgContent.isPlaying = false;
                if (!item.msgContent.proNum) item.msgContent.proNum = 0;
              }
            }
            item.preview = msg.filterRecord(item.bodyType, item.msgContent);
            list.push(item);
          }
        }
        console.log(list)
        return list;
      },
      getList(obj, type) {
        this.readyStatus = false;
        this.$http.getFavorites(obj).then(
          data => {
            let list = this.initList(data);
            this.config.page = data.pageNum;
            this.config.lastPage = data.lastPage;
            if (type == 1) {
              this.chatHistory = [];
              setTimeout(() => {
                this.chatHistory = list;
                this.readyStatus = true;
              }, 0);
            } else {
              this.chatHistory = this.chatHistory.concat(list);
              console.log(this.chatHistory)
              this.readyStatus = true;
            }
          }, () => {
            this.readyStatus = true;
          }
        )
      },
      search(type) {
        let obj = {
          page: this.config.page,
          rows: 20
        };
        if (this.send.type != '') obj['params[type]'] = this.send.type;
        if (this.send.searchKey != '') obj['params[collectionHead]'] = this.send.searchKey;
        this.getList(obj, type);
      },
      loadMore() {
        if (!this.readyStatus) return
        if (this.config.page < this.config.lastPage) {
          this.config.page++;
          this.search(2);
        } else this.config.dataNone = true;
      },
      getCopyStatus(item) {
        let status = false;
        if (item.bodyType == 1 || item.bodyType == 13 || item.bodyType == 24 || item.bodyType == 28 || item.bodyType ==
          30) {
          status = true;
        }
        return status;
      },
      getForwardStatus(item) {
        let status = true;
        if (item.bodyType == 4 || item.bodyType == 29 || item.bodyType == 32 || item.bodyType == 46) {
          status = false;
        }
        return status;
      },
      historySelect(item) {
        item.checked = !item.checked;
        if (item.checked) {
          if (item.bodyType == 4 || item.bodyType == 29 || item.bodyType == 32 || item.bodyType == 46) {
            this.forwardStatus = true;
          }
        } else {
          if (item.bodyType == 4 || item.bodyType == 29 || item.bodyType == 32 || item.bodyType == 46) {
            this.forwardStatus = false;
          }
        }
      },
      showDelete() {
        let ids = this.getIds(this.chatHistory);
        if (!ids) {
          this.$store.commit(
            "SET_TOAST_TEXT",
            this.$t("msg.chatPanel.deleteMsg")
          );
          return false;
        }
        this.deleteFavorites(ids);
        this.reSetMore(this.chatHistory);
      },
      reSetMore(list) {
        for (var i = 0; i < list.length; i++) {
          var item = list[i];
          item.checked == false;
        }
        this.showMore = false;
      },
      showForward() {

        //语音、名片、邀请链接不能转发
        if (this.forwardStatus) return false;

        let ids = this.getIds(this.chatHistory);
        if (!ids) {
          this.$store.commit(
            "SET_TOAST_TEXT",
            this.$t("msg.chatPanel.forwardMsg")
          );
          return false;
        }
        let body = this.getBodyArr(this.chatHistory);
        let forwardInfo = {
          show: true,
          body: body
        };
        console.log(forwardInfo);
        this.$store.commit("SET_FORWARD_INFO", forwardInfo);
        this.reSetMore(this.chatHistory);
      },
      getIds(list) {
        var result = "";
        if (list && list.length) {
          for (var i = 0; i < list.length; i++) {
            var item = list[i];
            if (item.checked == true) result += item.id + ",";
          }
          result = result.substr(0, result.length - 1);
        } else {
          result = "";
        }
        return result;
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
      doCopy(item) {

        let oInput = document.createElement("input");
        oInput.value = item.preview;
        document.body.appendChild(oInput);
        oInput.select(); // 选择对象
        document.execCommand("Copy");
        oInput.style.display = "none";
        document.body.removeChild(oInput);

        this.$store.commit("SET_TOAST_TEXT", this.$t("msg.menu.copySuccess"));
      },
      doForward(item) {
        let msgType = 1;
        if (item.bodyType == 1 || item.bodyType == 2 || item.bodyType == 3 || item.bodyType == 4 || item.bodyType ==
          5 ||
          item.bodyType == 13 || item.bodyType == 18 || item.bodyType == 32) {
          msgType = item.bodyType;
        }
        let filter = msg.filterRecord(msgType, item.bodyContent);
        let forwardInfo = {
          show: true,
          body: [{
            msgType: msgType,
            bodyContent: item.bodyContent,
            msgContent: item.msgContent,
            preview: filter
          }]
        };
        console.log(forwardInfo);
        this.showDetail = false;
        this.$store.commit("SET_FORWARD_INFO", forwardInfo);
      },
      clickMenu(e, item) {
        if (this.tempItem == item) {
          this.menuData.show = !this.menuData.show;
          this.tempItem = {};
          return;
        }
        this.menuData = {
          show: true,
          top: e.clientY + 10,
          left: e.clientX - 129,
          item: item,
        }
        this.tempItem = item;
      },
      deleteItem(id) {
        let list = this.chatHistory
        for (var i = 0; i < list.length; i++) {
          let v = list[i];
          if (v.id == id) this.chatHistory.splice(i, 1);
        }
      },
      deleteFavorites(ids) {
        this.showConfirm = false
        this.$http.deleteFavorites({
          ids: ids
        }).then(
          data => {
            this.$store.commit('SET_TOAST_TEXT', data);
            let tempIds = ids + '';
            if (tempIds.indexOf(',') > -1) {
              let arr = tempIds.split(',');
              for (var i = 0; i < arr.length; i++) {
                this.deleteItem(arr[i]);
              }
            } else this.deleteItem(tempIds);

          }, () => {}
        )
      },
      interceptor(ev, item) {
        console.log(ev.target.tagName)
        let tagName = ev.target.tagName;
        if (tagName != "A") {
          this.copy(item.bodyContent);
          return;
        }
        let url = ev.target.innerHTML;
        if (
          !(
            url.indexOf("ftp") >= 0 ||
            url.indexOf("http") >= 0 ||
            url.indexOf("https") >= 0
          )
        ) {
          url = "https://" + url;
        }

        var a = document.createElement("a");
        var event = new MouseEvent("click");
        a.href = url;
        a.target = "_blank";
        a.dispatchEvent(event);
      },
      copy(content) {
        content = MessageHandler.htmlToText(content);
        let oInput = document.createElement("input");
        oInput.value = content;
        document.body.appendChild(oInput);
        oInput.select(); // 选择对象
        document.execCommand("Copy");
        oInput.style.display = "none";
        document.body.removeChild(oInput);
        this.$store.commit("SET_TOAST_TEXT", this.$t("msg.menu.copySuccess"));
      },
    },
    computed: {
      ...mapGetters(["favorites"]),
    },
    mounted() {}
  }

</script>
<style lang="scss">
  @import '../../assets/css/var';

  .notes {
    position: relative;
    width: 607px;
    height: 534px;

    .loading-box {
      position: absolute;
      bottom: 0;
      left: 0;
      height: 456px;
      width: 100%;
    }

    .my-popup-close {
      right: 27px;
    }

    .my-popup-title {
      height: 39px;
      padding-left: 27px;
      background: #f2f2f2;
    }

    .editor-file {
      z-index: 100;
      position: absolute;
      top: 52px;
      left: 27px;
      cursor: pointer;
      height: 15px;
      width: 18px;
      background-image: url(../../assets/images/search/img.png);
      background-size: 100% 100%;
      cursor: pointer;

      &:hover {
        background-image: url(../../assets/images/search/img-on.png);
      }
    }

    .editor-save {
      z-index: 100;
      position: absolute;
      top: 49px;
      right: 60px;
      cursor: pointer;
      height: 16px;
      width: 14px;
      background-image: url(../../assets/images/search/save.png);
      background-size: 100% 100%;
      cursor: pointer;

      &:hover {
        background-image: url(../../assets/images/search/save-on.png);
      }
    }

    .editor-clear {
      z-index: 100;
      position: absolute;
      top: 48px;
      right: 27px;
      cursor: pointer;
      height: 17px;
      width: 14px;
      background-image: url(../../assets/images/search/clean.png);
      background-size: 100% 100%;
      cursor: pointer;

      &:hover {
        background-image: url(../../assets/images/search/clean-on.png);
      }
    }
  }

  .detail {
    width: 426px;
    height: 386px;

    .detail-hr {
      height: 6px;
      margin-top: 10PX;
      background: #F0F4F8;
      border-top: 1px solid #E2E2E2;
      border-bottom: 1px solid #E2E2E2;
    }

    .detail-tip {
      padding: 9px 16px 10px 16px;
      text-align: left;
      border-bottom: 1px solid #E2E2E2;

      button {
        width: 78px;
        height: 34px;
        line-height: 34px;
        color: #000;
        background: #fff;
        border: 1px solid #B5B5B5;
        margin-right: 16px;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;

        &.del {
          color: #FF4E4E;
          border: 1px solid #FF4E4E;
        }

        &.del:hover {
          color: #fff;
          border: 1px solid #FF4E4E;
          background: #FF4E4E;
        }

        &.forward:hover {
          color: #fff;
          border: 1px solid #3498df;
          background: #3498df;
        }
      }
    }

    .detail-centent {
      position: relative;
      height: 230px;
      margin: 23px 0;
      padding: 0 18px;
      word-break: break-all;
      text-align: left;
      line-height: 23px;
    }
  }

  .fa {
    z-index: 22;
    display: block;
    position: absolute;
    top: 0;
    right: 0;
    width: 700px;
    height: 661px;
    border-radius: 0 0 2px 0;
    background-color: #fff;

    .write {
      display: inline-block;
      vertical-align: middle;
      height: 22px;
      width: 22px;
      background-image: url(../../assets/images/search/notes.png);
      background-size: 100% 100%;
      cursor: pointer;
    }

    .menu-box {
      position: fixed;
      top: 0;
      left: 0;
      height: auto;
      width: 140px;
      background: #fff;
      border: 1px solid #e2e2e2;

      .menu-list {
        height: auto;
        width: 100%;
        overflow: auto;

        .menu-item {
          height: 35px;
          width: 100%;
          line-height: 35px;
          font-size: 14px;
          text-align: center;
          cursor: pointer;
          padding: 0 8px;
          border-top: 1px solid #e2e2e2;
          text-overflow: ellipsis;
          white-space: nowrap;
          overflow: hidden;

          &:first-child {
            border-top: none;
          }

          &:hover {
            background-color: #e7eef3;
          }

        }
      }
    }

    .fa-title {
      position: relative;
      height: 59px;
      width: 100%;
      line-height: 59px;
      border-bottom: 1px solid #E2E2E2;

      .close {
        width: 12px;
        height: 12px;
        display: block;
        position: absolute;
        top: 20px;
        right: 20px;
        background: url(../../assets/images/chat/icon-window-close.png) center center no-repeat;
        cursor: pointer;
      }

      label {
        font-size: 18px;
        margin: 0 12px 0 14px;
      }

      input {
        width: 354px;
        padding: 4px 8px;
        font-size: 12px;
        background-color: #F0F4F8;
      }
    }

    .fa-tip {
      position: relative;
      height: 40px;
      width: 100%;
      border-bottom: 1px solid #E2E2E2;

      label {
        position: relative;
        float: left;
        width: auto;
        max-width: 60px;
        font-size: 14px;
        height: 20px;
        padding: 10px 20px;
        border-left: 1px solid #E2E2E2;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;

        &:first-child {
          border-left: none;
        }

        &.active {
          color: #3498DF;
        }

        &.active:after {
          content: '';
          position: absolute;
          left: 10%;
          bottom: 0;
          height: 2px;
          width: 80%;
          background-color: #3498DF;
        }
      }
    }

    .fa-message {
      position: relative;
      height: 562px;
      background-color: #fff;

      .message-more {
        z-index: 13;
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 81px;
        border-bottom: 1px solid $border-color;
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

        .forward-more,
        .delete-more {
          width: 50%;

          .img-forward {
            height: 39px;
            width: 39px;
            margin: 0 auto;
            border-radius: 50px;
            cursor: pointer;
            background: url(../../assets/images/spr-forward.png) 0 0;

            &:hover {
              background: url(../../assets/images/spr-forward.png) 0 -39px;
            }

            &:active {
              background: url(../../assets/images/spr-forward.png) 0 -78px;
            }

            &.disable {
              cursor: url('../../assets/images/stop.png'), auto;

              &:hover {
                background: url(../../assets/images/spr-forward.png) 0 0;
              }

              &:active {
                background: url(../../assets/images/spr-forward.png) 0 0;
              }
            }
          }

          .img-delete {
            height: 39px;
            width: 39px;
            margin: 0 auto;
            border-radius: 50px;
            cursor: pointer;
            background: url(../../assets/images/spr-forward.png) 0 -117px;

            &:hover {
              background: url(../../assets/images/spr-forward.png) 0 -156px;
            }

            &:active {
              background: url(../../assets/images/spr-forward.png) 0 -195px;
            }
          }

          p {
            height: 14px;
            margin-top: 6px;
            font-size: 14px;
            text-align: center;
            color: #3498DF;
          }
        }
      }

      .message-list {
        position: relative;
        width: 100%;
        height: 562px;

        .li-top {
          height: 81px;
        }

        li {
          position: relative;
          height: auto;
          border-bottom: 1px solid #E2E2E2;
          overflow: auto;

          &.active {
            background-color: #F1F5F9;
          }

          &.more-select {
            padding-left: 45px;

            .select {
              display: block;
            }

            .message-item {
              width: 650px;
            }
          }

          &.dataNone {
            border-bottom: none;
            text-align: center;

            .none-img {
              display: inline-block;
              margin: 114px 0 30px 0;
            }

            p {
              width: 300px;

              margin: auto;

              &.color {
                margin-top: 10px;
                color: #999;
                word-break: break-word;
                line-height: 25px;
              }
            }
          }

          .menu {
            position: absolute;
            right: 20px;
            top: 20px;
            height: auto;
            line-height: 0;
            width: auto;
            font-size: 30px;
            color: #3498DF;
            cursor: pointer;
          }

          .selectArea {
            z-index: 11;
            position: absolute;
            top: 0;
            right: 0;
            height: 100%;
            width: 100%;
          }

          .select {
            display: none;
            z-index: 10;
            position: absolute;
            top: 18px;
            left: 16px;
            height: 18px;
            width: 18px;
            background-image: url(../../assets/images/chat/icon-select.png);
            background-size: 100% 100%;

            &.active {
              background-image: url(../../assets/images/chat/icon-select-blue.png);
            }
          }

          .message-item {
            height: auto;
            padding: 20px;
            overflow: auto;

            .item-left {
              float: left;
              width: 46px;

              img {
                height: 30px;
                width: 30px;
                border-radius: 50%;
              }
            }

            .item-right {
              float: left;
              width: calc(100% - 46px);

              .name {

                font-size: 14px;
                color: #999;

                span {
                  padding-left: 15px;
                }
              }

              .content.text {
                text-overflow: ellipsis;
                white-space: nowrap;
                overflow: hidden;
                max-height: 130px;

                img {
                  max-height: 110px;
                  max-width: 122px;
                  object-fit: cover;
                  vertical-align: text-bottom;
                }
              }

              .content {
                width: 580px;
                margin-top: 10px;
                font-size: 14px;
                word-break: break-all;

                .video {
                  position: relative;
                  min-width: 100px;
                  min-height: 100px;
                  padding: 0;
                  border-radius: 10px;
                  text-align: center;
                  line-height: 20px;
                  font-size: 15px;
                  color: #fff;
                  background: none;
                  overflow: hidden;
                  border: none;
                  float: left;
                  cursor: pointer;

                  .img {
                    min-height: 100px;
                    min-width: 100px;
                    max-height: 100px;
                    max-width: 100px;
                    border-radius: 6px;
                  }

                  >span {
                    font-size: 16px;
                    width: 78px;
                  }

                  &:after {
                    content: '';
                    position: absolute;
                    top: 50%;
                    margin-top: -25px;
                    left: 50%;
                    margin-left: -25px;
                    width: 50px;
                    height: 50px;
                    background: url(../../assets/images/chat/video-play.png);
                    background-size: 100%;
                    pointer-events: none;
                  }

                  &.out-date {
                    padding: 0 12px 15px 12px;
                  }

                  &.out-date:after {
                    display: none;
                  }
                }

                .img {
                  min-height: 100px;
                  min-width: 100px;
                  max-height: 100px;
                  max-width: 100px;
                  border-radius: 6px;
                }

                .msg-detail {
                  position: relative;
                  float: left;
                  max-width: 482px;
                  min-height: 42px;
                  padding: 6px 10px;
                  border-radius: 10px 10px 10px 0;
                  border: 1px solid #e2e2e2;
                  line-height: 30px;
                  word-break: break-all;
                  background: #fff;

                  .voice-pannel {
                    height: 53px;
                    width: 220px;

                    .voice-left {
                      float: left;
                      height: 100%;
                      width: 57px;

                      .icon-play {
                        display: inline-block;
                        position: relative;
                        width: 45px;
                        height: 45px;
                        margin-top: 4px;
                        border-radius: 50%;
                        background: #5AC7FF;
                        cursor: pointer;

                        &::before {
                          content: '';
                          position: absolute;
                          top: 50%;
                          left: 50%;
                          width: 14px;
                          height: 17px;
                          margin-top: -9px;
                          margin-left: -4px;
                          background: url(../../assets/images/chat/voice-open.png);
                          background-size: 100% 100%;
                        }

                        &.active {
                          &::before {
                            width: 15px;
                            margin-left: -7px;
                            background: url(../../assets/images/chat/voice-stop.png);
                          }
                        }
                      }
                    }

                    .voice-right {
                      float: left;
                      height: 100%;
                      width: 160px;
                      font-size: 14px;

                      .voice-progress {
                        position: relative;
                        top: 0;
                        width: 160px;
                        height: 30px;
                        background-image: url(../../assets/images/chat/voice-bg.png);
                        background-repeat: repeat-x;
                        cursor: pointer;

                        .open-progress {
                          display: inline-block;
                          position: absolute;
                          top: 0;
                          left: 0;
                          height: 30px;
                          background-image: url(../../assets/images/chat/voice-progress.png);
                          transition: width .01s linear;
                        }

                        .unread-progress {
                          z-index: 10;
                          display: inline-block;
                          position: absolute;
                          top: 0;
                          left: 0;
                          height: 30px;
                          width: 160px;
                          background-image: url(../../assets/images/chat/voice-unread.png);
                        }
                      }

                      .voice-detail {
                        position: relative;
                        top: 0;
                        width: 160px;
                        height: 20px;
                        vertical-align: text-top;

                        .time {
                          float: right;
                          font-size: 12px;
                          color: #999;
                        }
                      }
                    }

                    .voice-unread {
                      position: absolute;
                      right: -22px;
                      bottom: 0;
                      width: 12px;
                      height: 12px;
                      border-radius: 50%;
                      background-color: #ff3942;
                    }
                  }

                  .voice-box {
                    line-height: 30px;

                    .text.active {
                      color: #fff;
                    }

                    .time {
                      font-size: 12px;
                      line-height: 16px;
                      color: #999999;
                      padding-left: 5px;
                    }

                    .icon-play {
                      position: relative;
                      width: 25px;
                      height: 25px;
                      border-radius: 50%;
                      background: $color-theme-active;

                      &::before {
                        content: '';
                        position: absolute;
                        top: 7px;
                        left: 7px;
                        width: 11px;
                        height: 11px;
                        background: url(../../assets/images/chat/voice-icon.png);
                        background-position: -11px 0;
                      }
                    }

                    .icon-voice {
                      margin: 0 8px;
                      width: 35px;
                      height: 10px;
                      background-size: 100% 100%;
                      background-image: url(../../assets/images/chat/voice-play.png);
                    }

                    &.active {
                      .icon-play::before {
                        background-position: 0 0;
                      }

                      .icon-voice {
                        background-image: url(../../assets/images/chat/voice-play.gif);
                      }
                    }
                  }
                }

                .card {
                  position: relative;
                  float: left;
                  width: 298px;
                  max-height: 165px;
                  padding: 0 10px;
                  border: 1px solid #e2e2e2;
                  border-radius: 10px 10px 10px 0;
                  cursor: pointer;

                  .person-title {
                    border-bottom: 1px solid #e2e2e2;
                    line-height: 40px;
                    font-size: 15px;
                    text-align: left;
                    color: #000;
                  }

                  .person-content {
                    position: relative;
                    height: 68px;
                    text-align: left;
                    padding-left: 54px;
                    overflow: hidden;

                    .person-avatar {
                      position: absolute;
                      top: 12px;
                      left: 0;
                      width: 44px;
                      height: 44px;
                      border-radius: 50%;
                    }

                    .person-name {
                      line-height: 20px;
                      margin-top: 10px;
                      color: #000;
                      font-size: 15px;
                      overflow: hidden;
                      white-space: nowrap;
                      text-overflow: ellipsis;
                    }

                    .person-id {
                      line-height: 20px;
                      margin-top: 8px;
                      font-size: 12px;
                      color: #999;
                    }
                  }
                }

                .file {
                  position: relative;
                  height: auto;
                  width: 298px;
                  min-height: 80px;
                  border-radius: 10px;
                  border: 1px solid #e2e2e2;
                  line-height: normal;

                  .file-info {
                    display: inline-block;
                    padding-left: 20px;
                    width: 220px;

                    .title {
                      color: #000;
                      max-width: 180px;
                      margin-top: 10px;
                      white-space: nowrap;
                      overflow: hidden;
                      text-overflow: ellipsis;
                      line-height: 20px;
                    }

                    .size {
                      position: relative;
                      margin: 3px 0 2px 0;
                      color: #999999;
                      font-size: 12px;
                      white-space: nowrap;
                      overflow: hidden;
                      text-overflow: ellipsis;
                      line-height: 20px;
                    }

                    .download {
                      a {
                        -webkit-box-pack: end;
                        -ms-flex-pack: end;
                        justify-content: flex-end;
                        font-size: 12px;
                        line-height: 16px;
                        color: #596c96;
                        text-decoration: none;
                      }
                    }
                  }

                  .file-icon {
                    display: inline-block;
                    height: 60px;
                    width: 60px;
                    background-image: url(../../assets/images/file-icon/zip.png) center center no-repeat;
                    background-size: 100%;

                    &.word {
                      background-image: url(../../assets/images/file-icon/word.png);
                    }

                    &.xlsx {
                      background-image: url(../../assets/images/file-icon/xlsx.png);
                    }

                    &.pdf {
                      background-image: url(../../assets/images/file-icon/pdf.png);
                    }

                    &.ppt {
                      background-image: url(../../assets/images/file-icon/ppt.png);
                    }

                    &.zip {
                      background-image: url(../../assets/images/file-icon/zip.png);
                    }

                    &.txt {
                      background-image: url(../../assets/images/file-icon/txt.png);
                    }

                    &.mp3 {
                      background-image: url(../../assets/images/file-icon/mp3.png);
                    }

                    &.mp4 {
                      background-image: url(../../assets/images/file-icon/mp4.png);
                    }

                    &.exe {
                      background-image: url(../../assets/images/file-icon/exe.png);
                    }

                    &.apk {
                      background-image: url(../../assets/images/file-icon/apk.png);
                    }

                    &.api {
                      background-image: url(../../assets/images/file-icon/ipa.png);
                    }

                    &.pkg {
                      background-image: url(../../assets/images/file-icon/pkg.png);
                    }

                    &.app {
                      background-image: url(../../assets/images/file-icon/APP.png);
                    }

                    &.dmg {
                      background-image: url(../../assets/images/file-icon/dmg.png);
                    }

                    &.other {
                      background-image: url(../../assets/images/file-icon/other.png);
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
