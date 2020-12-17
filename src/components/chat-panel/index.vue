<template>
  <div class="chat-panel">
    <header class="pannel-header">
      <!-- 单聊、系统推送 -->
      <div class="chat-info display-flex" @click.stop="showInformation"
        v-if="currentSession.fromType == '0' || currentSession.fromType == '2'">
        <div class="user-avatar">
          <img class="img" ondragstart="return false" :src="global.fileDownUrl + 'compress/'+currentSession.img" v-headError />
          <span class="default" v-defaultHead v-if="currentSession.fromType == 0 && !currentSession.img"
            v-html="currentSession.name"></span>
        </div>
        <div v-if="currentSession.fromType == '0'">
          <p>{{ currentSession.name }}</p>
          <p class="member-number" v-if="(currentSession.describe || friendInfo.sourceDescribe) && currentSession.temp">
            <span class="sub-text" v-if="!otherIsTyping">(
              {{ $t("msg.detail.from") }}：
              {{ currentSession.describe || friendInfo.sourceDescribe | sourceFitler }}
              )</span>
            <!-- 对方正在输入 -->
            <span class="typing-text" v-if="otherIsTyping">
              {{(isTyping.type == 0 ? $t("msg.chatPanel.isTyping"):$t("msg.chatPanel.isTalking"))}}
              <span class="typing-loading">
                <span></span><span></span><span></span>
              </span>
            </span>
          </p>
          <p class="member-number" v-else>
            <span class="online" v-if="friendInfo.imOfflineState == 0 && !otherIsTyping">{{
              $t("msg.chatPanel.online")
            }}</span>
            <span class="sub-text" v-if="friendInfo.imOfflineState == 1 && !otherIsTyping">{{ $t("msg.chatPanel.last")
              }}{{ friendInfo.imLogoutTime | timeFilter }}</span>
            <!-- 对方正在输入 -->
            <span class="typing-text" v-if="otherIsTyping">
              {{(isTyping.type == 0 ? $t("msg.chatPanel.isTyping"):$t("msg.chatPanel.isTalking"))}}
              <span class="typing-loading">
                <span></span><span></span><span></span>
              </span>
            </span>
          </p>
        </div>
        <div v-else>
          <p>{{ currentSession.name }}</p>
        </div>
      </div>
      <!-- 群聊 -->
      <div class="chat-info" v-else>
        <p @click.stop="showInformation">{{ currentSession.name }}</p>
        <p class="sub-text" v-if="$i18n.locale == 'en_US'">
          {{goupMemberNum + " " + $t("msg.groupInfo.groupUser")}}
        </p>
        <p class="sub-text" v-else>
          {{ "(" + $t("msg.groupInfo.groupUser") + "：" +goupMemberNum + ")" }}
        </p>
      </div>
      <!-- 菜单栏 -->
      <chat-header></chat-header>
    </header>
    <div id="draguplod">
      <div class="draguplod" v-show="draguplod" @drop="dropArea($event)">
        <div>{{ $t("msg.chatPanel.drag") }}</div>
      </div>
      <section class="message-box" id="message-box" :class="{system: currentSession.fromType == '2'}"
        @mousedown="scorllBox()">
        <div v-if="backurl.url!=''&&currentSession.fromType != '2'"
          :class="backurl.isdim=='2'?'back-box isdim':'back-box'">
          <img :src="global.fileDownUrl+'original/'+backurl.url">
        </div>
        <!-- 有人@我  -->
        <div class="message-goto at" v-if="at && at.length">
          <div class="goto-box" @click="readAt">
            <span class="goto-icon" :class="{ top: goto == 'top' }"></span>
            <span class="goto-text">{{
                $t("msg.chatPanel.hadAt") + " " + at.length
              }}</span>
            <span class="goto-close" @click="readAt('all')"></span>
          </div>
        </div>
        <!-- 浏览记录时新接收消息提示 -->
        <div class="message-goto" :class="{ top: goto == 'top' }" v-if="currentUnread.num>0">
          <div class="goto-box" @click="gotoUnread()">
            <span class="goto-icon"></span>
            <span class="goto-text">{{ currentUnread.num }}{{ $t("msg.chatPanel.news") }}</span>
            <span class="goto-close" @click="currentUnread = {num:0,lastReadId:0}"></span>
          </div>
        </div>
        <!-- 群公告置顶 -->
        <div class="affiche" v-if="groupAffiche">
          <i></i>
          <span class="close"  @click="deleteAffiche"></span>
          <p class="name">{{groupAffiche.nickName}}</p>
          <p>
            <span v-text="groupAffiche.bodyContent.affiche"></span>
            <span class="all" @click="getAfficheDetail">{{$t("msg.chatPanel.viewAll")}} >></span>
          </p>
        </div>
        <!-- 群聊邀请审核提示 -->
        <div class="verify" v-if="inviter && inviter.length">
          <span>{{
            inviter[0].operatorName +
              $t("msg.chatPanel.invite") +
              inviter[0].inviterNum +
              $t("msg.chatPanel.userJoin")
          }}</span>
          <span class="goto-verify" @click="$refs.inviter.show(inviter[0])">{{ $t("msg.chatPanel.goToView") }}>>
          </span>
        </div>
        <!-- 群聊和单聊 -->
        <ul class="message-list" ref="list" v-if="currentSession.fromType == '0' || currentSession.fromType == '1'"
          @ps-y-reach-start="loadMore" @ps-y-reach-end="scrollY" v-scrollBar>
          <div class="no-more">
            <span class="text" v-if="scrollFlag == 2">{{ $t("msg.chatPanel.none") }}</span>
          </div>
          <loading v-if="scrollFlag == 1"></loading>
          <li class="history-item clearfix" :id="item.mId" :class="{
              'more-select': showMore,
              active: atId == item.mId || (item.checked && showMore),
              hide:
                (currentSession.fromType == '0' &&
                  item.mId < friendInfo.firstMsgId) ||
                (currentSession.fromType == '1' &&
                  item.mId < lastGroupMsg.firstMsgId)
            }" v-for="(item, index) in chatHistory" :key="item.mId">
            <div class="no-more" v-if="item.mId == (mewMsgId+1) && goto == 'top'">
              <span class="text">{{ $t("msg.chatPanel.latestMessage") }}</span>
            </div>
            <div class="tips-bg" v-if="item.noChatInfo">
              <!-- 红包提示、转账提示、音视频提示 -->
              <span class="text"
                v-if="item.bodyType == '6' || item.bodyType == '8' || item.bodyType == '38'">{{ item.msgContent }}</span>
              <!-- 群通知提示、好友请求、消息被拒收、撤回 -->
              <span class="text" v-else v-html="item.preview"></span>
            </div>
            <!-- 消息 -->
            <div class="history-content" :class="{ self: userId == item.bodyFrom }" v-else>
              <span class="select" :class="{ active: item.checked }"></span>
              <span class="selectArea" v-show="showMore" @click="historySelect(item)"></span>
              <!-- 日期 -->
              <div class="tips-bg" v-if="item.showTime">
                <span class="text">{{ item.bodyTime | timeFilter2 }}</span>
              </div>
              <div class="msg-content clearfix">
                <!-- 群聊头像 -->
                <div class="avatar" v-if="currentSession.fromType == '1' && userId != item.bodyFrom"
                  @click.stop="showmemberProfile(item.bodyFrom)" :data-index="
                    `{%type%:%avatar%,%uId%:${item.bodyFrom},%gId%:${currentSession.paramId}}`
                  "
                >
                  <img class="img" ondragstart="return false"  :src="global.fileDownUrl + 'compress/' +item.chatInfo.headImg" v-headError />
                  <span :class="{manager: item.chatInfo.isAdmin == 2, owner: item.chatInfo.isAdmin == 1}"></span>
                </div>
                <!-- 文字信息 @信息 链接信息 -->
                <div class="msg-detail"
                  :data-index="`{%type%:%message%,%mid%:${item.mId},%msgType%:${item.bodyType}}`"
                  v-if="item.bodyType == '1' || item.bodyType == '13' ||
                    item.bodyType == '24' || item.bodyType == '49'"
                    :style="{'background':userId == item.bodyFrom?bubbles.mybackground:bubbles.adversebackground}"
                >
                  <div
                    class="name"
                    :style="{'color':(myself&&userId == item.bodyFrom)||(!myself&&userId != item.bodyFrom)?'#fff':'#999'}"
                    v-if="userId != item.bodyFrom && currentSession.isShowMemberNick == '1'"
                  >
                    {{ item.chatInfo.nickName }}
                  </div>
                  <span
                    v-html="item.msgContent"
                    @click="interceptor($event, item)"
                  ></span>
                  <div class="msg-status display-flex">
                    <span class="time" :style="{'color':(myself&&userId == item.bodyFrom)||(!myself&&userId != item.bodyFrom)?'#fff':'#999'}">{{ item.bodyTime | timeFilter1 }}</span>
                    <span
                      class="send"
                      :class="{
                        loading: item.loading == 0,
                        read: item.readNum>0,
                        fail: item.loading == 2
                      }"
                      @click="reSend(item)"
                    ></span>
                  </div>
                </div>
                <!-- 自定义表情 -->
                <div
                  class="msg-detail msg-img"
                  ondragstart="return false;"
                  :data-index="
                    `{%type%:%message%,%mid%:${item.mId},%msgType%:${item.bodyType}}`
                  "
                  v-if="item.bodyType == '2'"
                >
                  <img
                    height="130"
                    width="130"
                    :src="global.fileDownUrl + 'compress/' + item.msgContent.bqUrl"
                    v-imageError
                  />
                  <div
                    class="msg-status display-flex"
                    :class="{
                      hide:!item.readNum ||
                        userId != item.bodyFrom
                    }"
                  >
                    <span class="time">{{ item.bodyTime | timeFilter1 }}</span>
                    <span
                      class="send"
                      :class="{
                        loading: item.loading == 0,
                        read:item.readNum>0,
                        fail: item.loading == 2
                      }"
                      @click="reSend(item)"
                    ></span>
                  </div>
                </div>
                <!-- 图片 -->
                <div
                  class="msg-detail msg-img"
                  ondragstart="return false;"
                  :data-index="
                    `{%type%:%message%,%mid%:${item.mId},%msgType%:${item.bodyType}}`
                  "
                  :style="{
                    width:
                      item.msgContent.imgWidth > 254 ||
                      item.msgContent.imgHeigh > 142
                        ? item.msgContent.imgWidth / item.msgContent.imgHeigh >
                          254 / 142
                          ? 254 + 'px'
                          : (item.msgContent.imgWidth /
                              item.msgContent.imgHeigh) *
                              142 +
                            'px'
                        : item.msgContent.imgWidth + 'px',
                    height:
                      item.msgContent.imgWidth > 254 ||
                      item.msgContent.imgHeigh > 142
                        ? item.msgContent.imgWidth / item.msgContent.imgHeigh <
                          254 / 142
                          ? 142 + 'px'
                          : (item.msgContent.imgHeigh /
                              item.msgContent.imgWidth) *
                              254 +
                            'px'
                        : item.msgContent.imgHeigh + 'px'
                  }"
                  v-imagePreview
                  v-if="item.bodyType == '3'"
                >
                  <img
                    class="img"
                    ondragstart="return false" 
                    :data-idx="index"
                    :src="item.msgContent.imgUrl.indexOf('data:')<0?global.fileDownUrl + 'compress/' + item.msgContent.imgUrl:item.msgContent.imgUrl"
                    v-viewer="item.mId"
                  />
                  <div
                    class="msg-status display-flex"
                    :class="{
                      hide:!item.readNum>0 ||
                        userId != item.bodyFrom
                    }"
                  >
                    <span class="time">{{ item.bodyTime | timeFilter1 }}</span>
                    <span
                      class="send"
                      :class="{
                        loading: item.loading == 0,
                        read:item.readNum>0,
                        fail: item.loading == 2
                      }"
                      @click="reSend(item)"
                    ></span>
                  </div>
                </div>
                <!-- 语音 -->
                <div
                  class="msg-detail voice"
                  :data-index="
                    `{%type%:%message%,%mid%:${item.mId},%msgType%:${item.bodyType}}`"
                  v-if="item.bodyType == '4'"
                >
                  <div class="voice-pannel">
                    <div class="voice-left">
                      <i class="icon-play" @click.stop="voicePlay(item, index)" :class="{ active: item.msgContent.isPlaying }"></i>
                    </div>
                    <div class="voice-right">
                      <div class="voice-progress" @click="setCurrentTime($event,item, index)">
                        <span class="open-progress" :style="{
                            width:pxNum(item.msgContent.proNum,item.msgContent.duration)}"
                        ></span>
                        <span class="unread-progress"
                          v-if="!item.msgContent.isPlay && userId != item.bodyFrom"
                        ></span>
                      </div>
                      <div class="voice-detail">
                        <span v-if="item.msgContent.proNum!=0">00:<span v-text="timeNum(item.msgContent.proNum)"></span>/</span><span>00:{{item.msgContent.duration>9?item.msgContent.duration:'0'+item.msgContent.duration}}</span>
                        <span class="time">{{ item.bodyTime | timeFilter1 }}</span>
                      </div>
                    </div>
                    <span
                      class="voice-unread"
                      v-if="!item.msgContent.isPlay && userId != item.bodyFrom"
                    ></span>
                  </div>
                </div>
                <!-- 视频 -->
                <div
                  class="msg-detail msg-video"
                  :data-index="
                    `{%type%:%message%,%mid%:${item.mId},%msgType%:${item.bodyType}}`
                  "
                  :style="{
                    width:
                      item.msgContent.imgWidth > 254 ||
                      item.msgContent.imgHeigh > 142
                        ? item.msgContent.imgWidth / item.msgContent.imgHeigh >
                          254 / 142
                          ? 254 + 'px'
                          : (item.msgContent.imgWidth /
                              item.msgContent.imgHeigh) *
                              142 +
                            'px'
                        : item.msgContent.imgWidth + 'px',
                    height:
                      item.msgContent.imgWidth > 254 ||
                      item.msgContent.imgHeigh > 142
                        ? item.msgContent.imgWidth / item.msgContent.imgHeigh <
                          254 / 142
                          ? 142 + 'px'
                          : (item.msgContent.imgHeigh /
                              item.msgContent.imgWidth) *
                              254 +
                            'px'
                        : item.msgContent.imgHeigh + 'px'
                  }"
                  v-videoError
                  v-if="item.bodyType == '5'"
                >
                  <img
                    class="img"
                    ondragstart="return false" 
                    :src="global.fileDownUrl + 'compress/' + item.msgContent.imgUrl"
                    :data-idx="index"
                    v-viewer="item.mId"
                  />
                  <div
                    class="msg-status display-flex"
                    :class="{ hide: userId != item.bodyFrom }"
                  >
                    <span class="time">{{ item.bodyTime | timeFilter1 }}</span>
                    <span
                      class="send"
                      :class="{
                        loading: item.loading == 0,
                        read:item.readNum>0,
                        fail: item.loading == 2
                      }"
                      @click="reSend(item)"
                    ></span>
                  </div>
                </div>
                <!-- 文件 -->
                <div
                  class="msg-file display-flex"
                  @mouseenter="mouseEnter($event, item.msgContent)"
                  @mouseleave="qrCode.show = false"
                  :data-index="`{%type%:%message%,%mid%:${item.mId},%msgType%:${item.bodyType}}`"
                  v-if="item.bodyType == '18'"
                >
                  <div
                    class="file-icon"
                    :class="item.msgContent.name | fileFitler"
                  ></div>
                  <div class="file-info display-flex-item">
                    <p class="title">{{ item.msgContent.name | fileName(14) }}</p>
                    <div class="size display-flex">
                      <span v-if="item.msgContent.progress == 100 || (item.loading == 2 && item.msgContent.progress == 500)">{{
                        item.msgContent.size | fileSize
                      }}</span>
                      <div
                        class="progress-bar"
                        v-if="item.msgContent.progress < 100"
                      >
                        <span
                          class="bar"
                          :style="{ width: item.msgContent.progress + '%' }"
                        ></span>
                      </div>
                      <span v-if="item.msgContent.progress < 100"
                        >{{
                          item.msgContent.progress > 0
                            ? item.msgContent.progress
                            : 0
                        }}%</span
                      >
                    </div>
                    <div class="msg-status display-flex">
                      <span
                        class="uploading flex-item-nowrap"
                        v-if="item.msgContent.progress == -1"
                        >{{ $t("msg.chatPanel.wait") }}</span
                      >
                      <span
                        class="uploading display-flex-item"
                        v-if="item.loading == 2 && item.msgContent.progress == 500"
                        >{{ $t("msg.chatPanel.network") }}</span
                      >
                      <span
                        class="cannel display-flex-item"
                        v-if="
                          item.msgContent.progress >= 0 &&
                            item.msgContent.progress < 100
                        "
                        @click="cancelUpload(item)"
                        href="javascript:;"
                        >{{ $t("msg.common.cancel") }}</span
                      >
                      <a
                        class="download display-flex-item"
                        v-if="item.msgContent.progress == 100"
                        :href="global.fileDownUrl + 'html/download1.html#'+item.msgContent.dl64"
                        target="_blank"
                        :alt="item.msgContent.name"
                        >{{ $t("msg.common.download") }}</a
                      >
                      <span class="time">{{ item.bodyTime | timeFilter1 }}</span>
                      <span
                        class="send"
                        :class="{
                          loading: item.loading == 0 || item.msgContent.progress < 100,
                          read:item.readNum>0,
                          fail: item.loading == 2
                        }"
                        @click="reSend(item)"
                      ></span>
                    </div>
                  </div>
                </div>
                <!-- 编辑 -->
                <div
                  class="msg-detail"
                  :data-index="
                    `{%type%:%message%,%mid%:${item.mId},%msgType%:${item.bodyType}}`
                  "
                  v-if="
                    item.bodyType == '28' &&
                      item.mId == item.msgContent.mId &&
                      item.msgContent.editType != 30
                  "
                  :style="{'background':userId == item.bodyFrom?bubbles.mybackground:bubbles.adversebackground}"
                >
                  <div v-html="item.msgContent.content"></div>
                  <div class="msg-status display-flex">
                    <span class="time" :style="{'color':(myself&&userId == item.bodyFrom)||(!myself&&userId != item.bodyFrom)?'#fff':'#999'}">{{ item.bodyTime | timeFilter1 }}</span>
                    <span
                      class="send"
                      :class="{
                        loading: item.loading == 0,
                        read:item.readNum>0,
                        fail: item.loading == 2
                      }"
                      @click="reSend(item)"
                    ></span>
                  </div>
                </div>
                <div
                  class="msg-detail"
                  :data-index="
                    `{%type%:%message%,%mid%:${item.mId},%msgType%:${item.bodyType}}`
                  "
                  v-if="
                    item.bodyType == '28' &&
                      item.mId == item.msgContent.mId &&
                      item.msgContent.editType == 30
                  "
                >
                  <div>"{{ item.msgContent.content.repliedName }}</div>
                  <div
                    v-if="
                      item.msgContent.content.msgType != 2 &&
                        item.msgContent.content.msgType != 3 &&
                        item.msgContent.content.msgType != 5
                    "
                    v-html="item.msgContent.content.repliedContent"
                  ></div>
                  <div
                    class="position"
                    v-if="
                      item.msgContent.content.msgType == 2 ||
                        item.msgContent.content.msgType == 3
                    "
                  >
                    <img
                      class="img"
                      :src="
                        global.fileDownUrl +
                          'compress/' +
                          item.msgContent.content.repliedContent
                      "
                      v-imageError
                      ondragstart="return false" 
                    />
                  </div>
                  <div
                    v-if="item.msgContent.content.msgType == 5"
                    class="reply-video position"
                  >
                    <img
                      class="img"
                      :src="
                        global.fileDownUrl +
                          'compress/' +
                          item.msgContent.content.repliedContent
                      "
                      v-imageError
                      ondragstart="return false" 
                    />
                  </div>
                  <div
                    class="reply-content"
                    v-html="item.msgContent.content.content"
                  ></div>
                  <div class="msg-status display-flex">
                    <span class="time">{{ item.bodyTime | timeFilter1 }}</span>
                    <span
                      class="send"
                      :class="{
                        loading: item.loading == 0,
                        read:item.readNum>0,
                        fail: item.loading == 2
                      }"
                      @click="reSend(item)"
                    ></span>
                  </div>
                </div>
                <!-- 30人以上群聊 -->
                <div
                  class="msg-detail group-invite display-flex"
                  @click="groupInvite(item)"
                  :data-index="`{%type%:%message%,%mid%:${item.mId}}`"
                  v-if="item.bodyType == '29'"
                >
                  <div class="display-flex-item">
                    <p class="title">{{ $t("msg.chatPanel.inviteJoin") }}</p>
                    <p class="text">{{ item.preview }}</p>
                    <p class="text display-flex-item">
                      {{ $t("msg.chatPanel.detail") }}
                    </p>
                  </div>
                  <div>
                    <img
                      class="img"
                      ondragstart="return false" 
                      :src="global.fileDownUrl + 'compress/' + item.msgContent.gAvatar"
                      v-headError
                    />
                    <div class="msg-status display-flex">
                      <span class="time">{{ item.bodyTime | timeFilter1 }}</span>
                      <span
                        class="send"
                        :class="{
                          loading: item.loading == 0,
                          read:item.readNum>0,
                          fail: item.loading == 2
                        }"
                        @click="reSend(item)"
                      ></span>
                    </div>
                  </div>
                </div>
                <!-- 回复 -->
                <div
                  ondragstart="return false;"
                  class="msg-detail replied"
                  :data-index="
                    `{%type%:%message%,%mid%:${item.mId},%msgType%:${item.bodyType}}`
                  "
                  v-if="item.bodyType == '30'"
                  @click="goFocus(item.msgContent.repliedId)"
                  :style="{'background':userId == item.bodyFrom?bubbles.mybackground:bubbles.adversebackground}"
                >
                  <div class="position">
                    <div>"{{ item.msgContent.repliedName }}：</div>
                    <div
                      v-if="
                        item.msgContent.msgType != 2 &&
                          item.msgContent.msgType != 3 &&
                          item.msgContent.msgType != 5
                      "
                      v-html="item.msgContent.repliedContent"
                    ></div>
                    <div
                      class="replied-img"
                      v-if="
                        item.msgContent.msgType == 2 ||
                          item.msgContent.msgType == 3
                      "
                    >
                      <img
                        class="img"
                        ondragstart="return false" 
                        :src="global.fileDownUrl + 'compress/' + item.msgContent.repliedContent"
                        v-imageError
                      />
                    </div>
                    <div v-if="item.msgContent.msgType == 5" class="reply-video">
                      <img
                        class="img"
                        ondragstart="return false" 
                        :src="global.fileDownUrl + 'compress/' + item.msgContent.repliedContent"
                        v-imageError
                      />
                    </div>
                    <div
                      class="reply-content"
                      v-html="item.msgContent.content"
                    ></div>
                  </div>
                  <div class="msg-status display-flex">
                    <span class="time" :style="{'color':(myself&&userId == item.bodyFrom)||(!myself&&userId != item.bodyFrom)?'#fff':'#999'}">{{ item.bodyTime | timeFilter1 }}</span>
                    <span
                      class="send"
                      :class="{
                        loading: item.loading == 0,
                        read:item.readNum>0,
                        fail: item.loading == 2
                      }"
                      @click="reSend(item)"
                    ></span>
                  </div>
                </div>
                <!-- 名片 -->
                <div
                  class="msg-card"
                  :data-index="
                    `{%type%:%message%,%mid%:${item.mId},%msgType%:${item.bodyType}}`
                  "
                  @click="clickCard($event, item)"
                  v-if="item.bodyType == '32'"
                >
                  <div class="person-title">{{ $t("msg.common.card") }}</div>
                  <div class="person-content">
                    <img
                      class="person-avatar"
                      :src="global.fileDownUrl + 'compress/' + item.msgContent.avatar"
                      v-headError
                    />
                    <span class="default" v-defaultHead v-if="!item.msgContent.avatar">{{
                      item.msgContent.nickName
                    }}</span>
                    <div
                      class="person-name"
                      v-text="item.msgContent.nickName"
                    ></div>
                    <div class="person-id">
                      EchatAPP ID：{{ item.msgContent.userId }}
                    </div>
                  </div>
                  <div
                    class="person-remark"
                    v-if="item.msgContent.remark && item.msgContent.remark.length"
                    v-text="item.msgContent.remark"
                  ></div>
                  <div class="msg-status display-flex">
                    <span class="time">{{ item.bodyTime | timeFilter1 }}</span>
                    <span
                      class="send"
                      :class="{
                        loading: item.loading == 0,
                        read:item.readNum>0,
                        fail: item.loading == 2
                      }"
                      @click="reSend(item)"
                    ></span>
                  </div>
                </div>
                <!-- 公告 -->
                <div class="msg-affiche" 
                  :data-index="`{%type%:%message%,%mid%:${item.mId},%msgType%:${item.bodyType}}`"
                    v-if="item.bodyType == '47'"
                    :style="{'background':userId == item.bodyFrom?bubbles.mybackground:bubbles.adversebackground}"
                  >
                  <div class="affiche-title"><i></i>{{ $t("msg.groupInfo.affiche") }}</div>
                  <div class="affiche-content">
                    <p v-html="item.msgContent.affiche"></p>
                  </div>
                  
                  <div class="msg-status display-flex">
                    <span class="time" :style="{'color':(myself&&userId == item.bodyFrom)||(!myself&&userId != item.bodyFrom)?'#fff':'#999'}">{{ item.bodyTime | timeFilter1 }}</span>
                    <span
                      class="send"
                      :class="{
                        loading: item.loading == 0,
                        read: item.readNum>0,
                        fail: item.loading == 2
                      }"
                      @click="reSend(item)"
                    ></span>
                  </div>
                </div>
                <!-- 聊天记录 -->
                <div
                  class="msg-detail chat-preview"
                  :data-index="
                    `{%type%:%message%,%mid%:${item.mId},%msgType%:${item.bodyType}}`
                  "
                  @click="$refs.msgRecord.show(item.msgContent)"
                  v-if="item.bodyType == '44'"
                >
                  <label class="title"
                    >{{
                      item.msgContent.title +
                        ($i18n.locale == "zh_CN" ? "的 " : "'s ")
                    }}{{ $t("msg.common.chatRecord") }}</label
                  >
                  <div class="text">
                    <p class="text-line">{{ item.msgContent.list[0] }}</p>
                    <p class="text-line">{{ item.msgContent.list[1] }}</p>
                  </div>
                  <div class="msg-status display-flex">
                    <span class="record display-flex-item">{{
                      $t("msg.common.chatRecord")
                    }}</span>
                    <span class="time">{{ item.bodyTime | timeFilter1 }}</span>
                    <span
                      class="send"
                      :class="{
                        loading: item.loading == 0,
                        read:item.readNum>0,
                        fail: item.loading == 2
                      }"
                      @click="reSend(item)"
                    ></span>
                  </div>
                </div>
                <div class="icon-edit" v-if="item.bodyType == '28'"></div>
              </div>
              <group-readed
                v-if="
                  currentSession.fromType == '1' &&
                    lastGroupMsg.msgId == item.mId &&
                    lastGroupMsg.readNum > 0
                "
              ></group-readed>
            </div>
          </li>
          <li v-show="showMore" style="height:66px;"></li>
        </ul>
        <!-- 系统推送信息 -->
        <ul
          class="message-list"
          ref="list"
          v-if="currentSession.fromType == '2'"
          @ps-y-reach-start="loadMore"
          v-scrollBar
        >
          <li class="history-item" v-for="item in chatHistory" :key="item.mId" :id="item.mId">
            <div class="push" v-if="item.bodyType == 45">
              <div class="push-header display-flex">
                <span class="title">{{item.bodyContent.title}}</span><span class="time">{{ item.bodyTime | timeFilter }}</span>
              </div>
              <div>{{item.bodyContent.content}}</div>
            </div>
            <div class="push"
              v-else
            >
              <span v-html="item.msgContent" ></span>
              <div class="msg-status display-flex">
                <span class="time">{{ item.bodyTime | timeFilter }}</span>
              </div>
            </div>
          </li>
        </ul>
        <!-- 下载二维码 -->
        <div
          class="qr-code"
          v-show="qrCode.show"
          :style="{ top: qrCode.top - 160 + 'px', left: qrCode.left - 75 + 'px' }"
          id="qrcode"
        >
          <canvas id="qrcodeCanvas"></canvas>
        </div>
      </section>
      <!-- 发送信息编辑框 -->
      
      <div
        class="message-input"
        v-if="forbiddenWord == 0 && currentSession.fromType != '2'"
      >
      <message-operation ref="operation"></message-operation>
      <at-box v-model="atList" @change="selectAtItem"></at-box>
        <!-- <input-menu :friend="friendInfo"></input-menu> -->
        <a class="icon icon-image">
          <label class="lable" for="upAll"></label>
          <input
            type="file"
            hidden="true"
            id="upAll"
            multiple
            @change="selectAll($event)"
            accept="*"
          />
        </a>
        <div class="input-area" v-scrollBar>
          <div class="input-placeholder" v-if="editFocus">
            {{ $t("msg.chatPanel.say") }}
          </div>
          <pre
            class="input-msg"
            contenteditable="true"
            ref="editMsg"
            @focus="editFocus = false"
            @blur="saveDraft()"
            @paste="pasteMessage($event)"
            @keyup="msgChange($event)"
            @keydown="preKeydown($event)"
          ></pre>
        </div>
        <div class="more-then" v-if="moreThan">
          {{ $t("msg.chatPanel.moreThan") }}
        </div>
        <emoji></emoji>
        <!-- 发送按钮 -->
        <send-button  @send="sendMsg"></send-button>
        <!-- @列表 -->
      </div>
    
    <!-- 多选 -->
    <div class="message-more display-flex" v-if="showMore">
      <i @click="showMore = false"></i>
      <div class="forward-more" @click="showForward">
        <div class="img-forward" :class="{ disable: forwardStatus }"></div>
        <p>{{ $t("msg.menu.forward") }}</p>
      </div>
      <div class="delete-more" @click="showDelete">
        <div class="img-delete"></div>
        <p>{{ $t("msg.menu.delete") }}</p>
      </div>
    </div>
    <!-- 禁言状态 -->
    <div
      class="message-input"
      :class="{ forbidden: forbiddenWord > 0 }"
      v-if="forbiddenWord > 0"
    >
      <span v-if="forbiddenWord == 1">{{ $t("msg.chatPanel.allMute") }}</span>
      <span v-else-if="forbiddenWord == 2">{{$t("msg.chatPanel.managerMute")}}</span>
      <span v-else-if="forbiddenWord == 3">{{$t("msg.chatPanel.privateMute")}}</span>
    </div>
  </div>
    <friend-information v-if="layout.module == 'fd-inf' && layout.child == 'fi'"></friend-information>
    <group-information ref="groupInformation" v-if="layout.module == 'gp-inf' && (layout.child == 'gi' || layout.child == 'mr')"></group-information>
    <!-- <message-operation ref="operation"></message-operation> -->
    <file-popup ref="sendFile" :fileInfo="dropFileInfo"></file-popup>
    <picture-popup ref="sendPicture"  :imgInfo="pasteImage"></picture-popup>
    <card ref="card"></card>
    <delete-message ref="deleteInfo"></delete-message>
    <group-invite ref="groupInvite"></group-invite>
    <verify-inviter ref="inviter" v-model="inviter"></verify-inviter>
    <msg-record ref="msgRecord"></msg-record>
    <announcement 
        v-model="operationIndex" 
        :announcement="affiche" 
        :afficheType="afficheType" 
        :isAdmin="isAdmin"
        @update="updateAffiche"
        v-if="operationIndex == 1"
      ></announcement>
    <success v-model="showSuccess" :title="$t('msg.tip.operateSuccess')"></success>
  
  </div>
</template>

<script src="./chat-panel.js"></script>

<style lang="scss" scoped>
@import "../../assets/css/var";

.chat-panel {
  position: relative;
  width: 700px;
  height: 661px;
  border-radius: 0 0 2px 0;
  border-left: 1px solid $border-color;
  background-color: #fff;
  .pannel-header {
    position: relative;
    height: 67px;
    width: 700px;
    padding: 0 16px;
    // box-sizing: border-box;
    // border-left: 1px solid $border-color;
    border-bottom: 1px solid $border-color;
    line-height: 20px;
    .chat-info {
      position: relative;
      float: left;
      font-size: 18px;
      padding: 10px 0;
      line-height: 23px;
      cursor: pointer;
      .user-avatar {
        position:relative;
        width: 46px;
        height: 46px;
        margin-right: 16px;
        .default{
          position:absolute;
          top:0;left:0;
          width: 46px;
          height: 46px;
          background: rgb(169, 169, 169);
          border-radius: 50%;
          text-align: center;
          line-height: 46px;
          font-weight: 550;
          color: #fff;
        }
      }
      .member-number {
        max-width: 300px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .sub-text {
        font-size: 14px;
        color: $color-grey;
      }
      .typing-text{
        font-size: 14px;
        color: #3498DF;
        .typing-loading{
          height: 6px;
          span{
            display: inline-block;
            width: 6px;
            height: 6px;
            margin-right: 5px;
            margin-bottom: 2px;
            border-radius: 50%;
            background: #3498DF;
            -webkit-animation: load 1.3s ease infinite;
          }
          @-webkit-keyframes load{
            0%{
              opacity: 1;
            }
            100%{
              opacity: .4;
            }
          }
          span:nth-child(1){
            -webkit-animation-delay: .3s;
          }
          span:nth-child(2){
            -webkit-animation-delay: .5s;
          }
          span:nth-child(3){
            -webkit-animation-delay: .7s;
          }
        }
      }
      .online {
        font-size: 14px;
        &::before {
          content: "";
          display: inline-block;
          width: 10px;
          height: 10px;
          margin-right: 5px;
          border-radius: 6px;
          background-color: #37e837;
        }
      }
    }
    .header-menu {
      position: absolute;
      top: 18px;
      right: 16px;
      .menu-icon {
        position: relative;
        width: 30px;
        height: 30px;
        background: url(../../assets/images/chat/header-menu.png);
        cursor: pointer;
      }
      .setting {
        background-position: 0 0;
        &.active,
        &:hover {
          background-position: 0 -30px;
        }
      }
      .more {
        margin-left: 12px;
        background-position: -30px 0;
        &.active,
        &:hover {
          background-position: -30px -30px;
        }
      }
    }
  }
  #draguplod{
    width: 100%;
    height:594px;
  }
  .draguplod{
    position: absolute;
    top:67px;
    width: 100%;
    height:594px;
    background:rgba(255,255,255,0.85);
    z-index: 10;
    div{
      width: 100%;
      height:100%;
      text-align: center;
      line-height:571px;
      border:3px dashed #999
    }
  }
  .message-box {
    position: relative;
    width: 100%;
    height: 528px;
    // border-left: 1px solid $border-color;
    .back-box{
      width: 100%;
      height: 528px;
      position: absolute;
      img{
      width: 100%;
      height: 528px;
      }
      &.isdim{
        -webkit-filter: blur(4px);
        -moz-filter: blur(4px);
        -o-filter: blur(4px);
        -ms-filter: blur(4px);
        filter: blur(4px);
        opacity:0.6;
      }
    }
    .message-list {
      position: relative;
      height: 528px;
      width: 100%;
      &.more{
        padding-bottom:66px;
      }
      > .loading {
        padding: 15px;
        text-align: center;
        .img {
          display: inline-block;
          width: 50px;
          height: 50px;
        }
      }
    }
    .message-goto {
      z-index: 20;
      position: absolute;
      top: 430px;
      right: 0px;
      cursor: pointer;
      &.at {
        top: 385px;
      }
      .goto-box {
        position: relative;
        display: block;
        height: 24px;
        line-height: 24px;
        padding: 0 25px;
        box-shadow: 0 0 2px #ccc;
        text-align: center;
        background: #fff;
        .goto {
          text-decoration: none;
          color: $color-theme;
        }
        .goto-icon {
          position: absolute;
          top: 3px;
          left: 7px;
          display: block;
          width: 15px;
          height: 18px;
          background: url(../../assets/images/chat/goto.png) no-repeat;
          background-size: 100%;
        }
        .goto-text {
          padding: 0 6px;
          border-right: 1px solid #ddd;
        }
        .goto-close {
          display: block;
          position: absolute;
          top: 7px;
          right: 7px;
          width: 10px;
          height: 10px;
          background: url(../../assets/images/chat/icon-window-close.png) center
            center no-repeat;
          background-size: cover;
        }
      }
      &.top {
        top: 50px;
        .goto-icon {
          transform: rotate(180deg);
        }
      }
    }
    .affiche{
      position: absolute;
      z-index: 19;
      width: 100%;
      height: 58px;
      padding: 0 15px;
      line-height: 58px;
      background-color: #fff;
      padding-left:64px;
      box-shadow: 0px 5px 6px 0px rgba(0, 0, 0,.15);
      .close{
        display:inline-block;
        position:absolute;
        right:16px;top:24px;
        width: 10px;
        height: 10px;
        background-size: 100% 100%;
        background-image: url(../../assets/images/icon/close.png);
        cursor:pointer;
      }
      i{
        display:inline-block;
        position:absolute;
        left:16px;top:12px;
        height:33px;width:33px;
        margin-right:10px;
        vertical-align: middle;
        background-size: 100% 100%;
        background-image: url(../../assets/images/icon/affiche.png);
      }
      p{
        line-height:21px;
        font-size:14px;
        &.name{
          margin-top:8px;
          font-size:12px;
        }
        span{
          display:inline-block;
          width:auto;
          max-width:360px;
          text-overflow:ellipsis;
          white-space:nowrap;
          overflow:hidden;
          margin-right:25px;
          &.all{
            width:auto;
            color:#3498DF;
            cursor:pointer;
          }
        }
      }
    }
    .verify {
      position: absolute;
      z-index: 19;
      width: 100%;
      height: 58px;
      padding: 0 15px;
      line-height: 58px;
      background-color: #d4eeff;
      .goto-verify {
        margin-left: 10px;
        color: #60bfff;
        cursor: pointer;
      }
    }
    &.system {
      height: 593px;
      background-color: #f2f2f2;
      .message-list {
        height: 593px;
        padding: 20px 15px 0 15px;
      }
      .pay-item {
        width: 270px;
        height: 170px;
        margin: 15px auto;
        background: #fff;
        border-radius: 4px;

        .pay-item-head {
          padding: 5px 10px;
          line-height: 33px;
          font-size: 13px;
          .pay-right {
            float: right;
            font-size: 14px;
            color: #fea405;
          }
          .img {
            height: 33px;
            width: 33px;
            padding-right: 3px;
            border-radius: 50%;
            vertical-align: text-bottom;
          }
          span.head-name {
            display: inline-block;
            width: 150px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
          }
        }
        .pay-item-content {
          text-align: center;
          font-size: 13px;
          color: #bbb;
          h4 {
            font-size: 17px;
            padding: 20px 0;
            span {
              color: #000;
            }
          }
          .pay-detail {
            position: relative;
            height: 40px;
            margin: 0 10px;
            border-top: 1px solid #bbb;
            line-height: 40px;
            font-size: 14px;
            text-align: left;
            .arrow-right {
              position: absolute;
              top: 50%;
              right: -2px;
              display: inline-block;
              width: 16px;
              height: 16px;
              margin-top: -8px;
              background-position: center;
              background-repeat: no-repeat;
              background-image: url(../../assets/images/chat/icon-arrow-right.png);
            }
          }
        }
      }
      .push {
        box-sizing: border-box;
        width: 100%;
        margin-bottom: 15px;
        padding: 15px 20px;
        border-radius: 20px;
        border: 1px solid $border-color;
        font-size: 14px;
        line-height: 24px;
        background-color: #fff;
        .push-header {
          justify-content: space-between;
          .time {
            color: $color-grey;
          }
        }
        .title {
          font-size: 16px;
          padding-bottom: 8px;
        }
      }
    }
  }
  .message-more {
    z-index: 110;
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 135px;
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
    .forward-more,
    .delete-more {
      width: 50%;

      .img-forward {
        height: 54px;
        width: 54px;
        margin: 0 auto;
        border-radius: 50px;
        cursor: pointer;
        background: url(../../assets/images/icon-more.png) -0 -0;
        &.disable {
          cursor: not-allowed;
        }
      }
      .img-delete {
        height: 54px;
        width: 54px;
        margin: 0 auto;
        border-radius: 50px;
        cursor: pointer;
        background: url(../../assets/images/icon-more.png) -0 -54px;
      }
      p {
        height: 14px;
        margin-top: 14px;
        font-size: 14px;
        text-align: center;
      }
    }
    .delete-more {
      left: 415px;
    }
  }
  .message-input {
    position: absolute;
    bottom:0px;
    width: 100%;
    height: auto;
    min-height: 66px;
    max-height: 145px;
    border-top: 1px solid $border-color;
    background: #fff;
    padding: 24px 0 20px 0;
    .icon-image {
    position:absolute;
    bottom:20px;
    left: 22px;
    display: inline-block;
    width: 22px;
    height: 22px;
    cursor: pointer;
    background:url(../../assets/images/chat/up1.png);
    &:hover {
      background:url(../../assets/images/chat/up2.png);
    }
    .lable{
    display: block;
    width: 22px;
    height: 22px;
    }
  }
    .input-area {
      position: relative;
      left:65px;
      height: auto;
      min-height: 16px;
      max-height: 112px;
      width: 514px;
      box-sizing: border-box;
      .input-placeholder {
        position: absolute;
        color: #888;
        font-size: 14px;
        padding-left: 10px;
        pointer-events: none;
        border-left: 1px solid #999;
      }
      .input-msg {
        height: auto;
        width: 100%;
        line-height: 22px;
        font-family: "Microsoft Yahei", Tahoma, Helvetica, Arial, sans-serif !important;
        font-size: 14px;
        color: #2c2c2c;
        outline: 1px solid #fff;
        white-space: normal;
        word-break: break-all;
      }
    }
    &.forbidden {
      font-size: 18px;
      font-weight: bold;
      color: $color-grey;
      text-align: center;
      line-height: 23px;
      background-color: $backgroup-color;
    }
  }
}

.more-select {
  .history-content {
    padding-left: 45px;
    .select {
      display: block;
    }
  }
}

.more-then {
  position: absolute;
  right: 11px;
  bottom: 56px;
  padding: 8px 12px;
  border-radius: 5px;
  box-shadow: 0 2px 10px #ccc;
  background-color: #fff;

  &::before {
    content: "";
    display: block;
    position: absolute;
    bottom: -7px;
    right: 38px;
    width: 12px;
    height: 12px;
    background-color: #fff;
    border-right: 1px solid #e2e2e2;
    border-bottom: 1px solid #e2e2e2;
    -webkit-transform: rotate(45deg);
    transform: rotate(45deg);
  }
}
</style>
