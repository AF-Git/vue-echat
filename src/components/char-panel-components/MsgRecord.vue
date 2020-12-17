<template>
  <transition name="scale-x">
    <div class="my-popup msg-record" v-if="showBox">
      <div class="my-popup-content">
        <h3 class="my-popup-title">
          {{ title + ($i18n.locale == "zh_CN" ? "的 " : "'s ")
          }}{{ $t("msg.common.chatRecord") }}
        </h3>
        <span class="my-popup-close" @click="hide" v-if="idx < 2"></span>
        <span class="pre-record" @click="preRecord" v-else>{{
          $t("msg.common.back")
        }}</span>
        <div class="message-box" ref="rocord">
          <ul class="message-list" v-scrollBar>
            <li
              class="history-item"
              v-for="(item, index) in msgList"
              :key="index"
            >
              <div class="history-content">
                <div class="msg-content display-flex">
                  <img
                    class="avatar"
                    :src="global.fileDownUrl + 'compress/' + item.avatar"
                    v-headError
                  />
                  <div class="display-flex-item">
                    <div class="msg-info display-flex">
                      <span class="flex-item-nowrap">{{ item.nickName }}</span>
                      <span class="time">{{ item.bodyTime | timeFilter }}</span>
                    </div>
                    <!-- 文字信息 @信息 链接信息 -->
                    <div
                      class="msg-detail"
                      v-if="
                        item.bodyType == '1' ||
                          item.bodyType == '13' ||
                          item.bodyType == '24'
                      "
                    >
                      <span
                        v-html="item.bodyContent"
                        @click="$parent.interceptor(item)"
                      ></span>
                    </div>
                    <!-- 自定义表情 -->
                    <div class="msg-detail msg-img" v-if="item.bodyType == '2'">
                      <img
                        height="130"
                        width="130"
                        :src="global.fileDownUrl + 'compress/' + item.bodyContent.bqUrl"
                        v-imageError
                      />
                    </div>
                    <!-- 图片 -->
                    <div
                      class="msg-detail msg-img"
                      :style="{
                        width:
                          item.bodyContent.imgWidth > 254 ||
                          item.bodyContent.imgHeigh > 142
                            ? item.bodyContent.imgWidth /
                                item.bodyContent.imgHeigh >
                              254 / 142
                              ? 254 + 'px'
                              : (item.bodyContent.imgWidth /
                                  item.bodyContent.imgHeigh) *
                                  142 +
                                'px'
                            : item.bodyContent.imgWidth + 'px',
                        height:
                          item.bodyContent.imgWidth > 254 ||
                          item.bodyContent.imgHeigh > 142
                            ? item.bodyContent.imgWidth /
                                item.bodyContent.imgHeigh <
                              254 / 142
                              ? 142 + 'px'
                              : (item.bodyContent.imgHeigh /
                                  item.bodyContent.imgWidth) *
                                  254 +
                                'px'
                            : item.bodyContent.imgHeigh + 'px'
                      }"
                      v-imagePreview
                      v-if="item.bodyType == '3'"
                    >
                      <img
                        class="img"
                        :src="global.fileDownUrl + 'compress/' + item.bodyContent.imgUrl"
                        :data-idx="index"
                        v-viewer="msgList"
                      />
                    </div>
                    <!-- 语音 -->
                    <div class="msg-detail" v-if="item.bodyType == '4'">
                      <div
                        class="voice-box display-flex"
                        :class="{ active: item.bodyContent.isPlaying }"
                      >
                        <i class="icon-voice"></i>
                        <span
                          class="text"
                          :class="{ active: item.bodyContent.isPlaying }"
                          >{{ item.bodyContent.duration }}''</span
                        >
                        <span>转发语音不可播放</span>
                      </div>
                    </div>
                    <!-- 视频 -->
                    <div
                      class="msg-detail msg-video"
                      :style="{
                        width:
                          item.bodyContent.imgWidth > 254 ||
                          item.bodyContent.imgHeigh > 142
                            ? item.bodyContent.imgWidth /
                                item.bodyContent.imgHeigh >
                              254 / 142
                              ? 254 + 'px'
                              : (item.bodyContent.imgWidth /
                                  item.bodyContent.imgHeigh) *
                                  142 +
                                'px'
                            : item.bodyContent.imgWidth + 'px',
                        height:
                          item.bodyContent.imgWidth > 254 ||
                          item.bodyContent.imgHeigh > 142
                            ? item.bodyContent.imgWidth /
                                item.bodyContent.imgHeigh <
                              254 / 142
                              ? 142 + 'px'
                              : (item.bodyContent.imgHeigh /
                                  item.bodyContent.imgWidth) *
                                  254 +
                                'px'
                            : item.bodyContent.imgHeigh + 'px'
                      }"
                      v-videoError
                      v-if="item.bodyType == '5'"
                    >
                      <img
                        class="img"
                        :src="global.fileDownUrl + 'compress/' + item.bodyContent.imgUrl"
                        :data-idx="index"
                        v-viewer="msgList"
                      />
                    </div>
                    <!-- 文件 -->
                    <div
                      class="msg-file  display-flex"
                      v-if="item.bodyType == '18'"
                    >
                      <div
                        class="file-icon"
                        :class="item.bodyContent.name | fileFitler"
                      >
                        <circle-bar
                          v-model="item.bodyContent.progress"
                          v-if="item.bodyContent.progress < 100"
                        ></circle-bar>
                      </div>
                      <div class="file-info display-flex-item">
                        <p class="title">{{ item.bodyContent.name }}</p>
                        <div class="size">
                          <span>{{ item.bodyContent.size | fileSize }}</span>
                        </div>
                        <div class="msg-status display-flex">
                          <a
                            class="download display-flex-item"
                            :href="global.fileDownUrl + 'compress/' + item.bodyContent.url"
                            target="_blank"
                            :alt="item.bodyContent.name"
                            :download="item.bodyContent.name"
                            >点击下载</a
                          >
                        </div>
                      </div>
                    </div>
                    <!-- 编辑 -->
                    <div
                      class="msg-detail"
                      v-if="
                        item.bodyType == '28' && item.bodyContent.editType != 30
                      "
                    >
                      <div v-html="item.bodyContent.content"></div>
                    </div>
                    <div
                      class="msg-detail"
                      v-if="
                        item.bodyType == '28' && item.bodyContent.editType == 30
                      "
                    >
                      <div>"{{ item.bodyContent.content.repliedName }}</div>
                      <div
                        v-if="
                          item.bodyContent.content.msgType != 2 &&
                            item.bodyContent.content.msgType != 3 &&
                            item.bodyContent.content.msgType != 5
                        "
                        v-html="item.bodyContent.content.repliedContent"
                      ></div>
                      <div
                        class="position"
                        v-if="
                          item.bodyContent.content.msgType == 2 ||
                            item.bodyContent.content.msgType == 3
                        "
                      >
                        <img
                          class="img"
                          :src="
                            global.fileDownUrl + 'compress/'+
                              item.bodyContent.content.repliedContent
                          "
                          v-imageError
                        />
                      </div>
                      <div
                        v-if="item.bodyContent.content.msgType == 5"
                        class="reply-video position"
                      >
                        <img
                          class="img"
                          :src="
                            global.fileDownUrl + 'compress/'+
                              item.bodyContent.content.repliedContent
                          "
                          v-imageError
                        />
                      </div>
                      <div
                        class="reply-content"
                        v-html="item.bodyContent.content.content"
                      ></div>
                    </div>
                    <!-- 30人以上群聊 -->
                    <div
                      class="msg-detail group-invite display-flex"
                      @click="$parent.groupInvite(item)"
                      :data-index="`{%type%:%message%,%mid%:${item.mId}}`"
                      v-if="item.bodyType == '29'"
                    >
                      <div class="display-flex-item">
                        <p class="title">邀请你加入群聊</p>
                        <p class="text">{{ item.preview }}</p>
                        <p class="text display-flex-item">点击查看详情</p>
                      </div>
                      <div>
                        <img
                          class="img"
                          :src="global.fileDownUrl + 'compress/' + item.bodyContent.gAvatar"
                          v-headError
                        />
                      </div>
                    </div>
                    <!-- 回复 -->
                    <div class="msg-detail" v-if="item.bodyType == '30'">
                      <a class="position" href="javascript: ;">
                        <div>"{{ item.bodyContent.repliedName }}：</div>
                        <div
                          v-if="
                            item.bodyContent.msgType != 2 &&
                              item.bodyContent.msgType != 3 &&
                              item.bodyContent.msgType != 5
                          "
                          v-html="item.bodyContent.repliedContent"
                        ></div>
                        <div
                          class="replied-img"
                          v-if="
                            item.bodyContent.msgType == 2 ||
                              item.bodyContent.msgType == 3
                          "
                        >
                          <img
                            class="img"
                            :src="
                              global.fileDownUrl + 'compress/' +
                                item.bodyContent.repliedContent
                            "
                            v-imageError
                          />
                        </div>
                        <div
                          v-if="item.bodyContent.msgType == 5"
                          class="reply-video"
                        >
                          <img
                            class="img"
                            :src="
                              global.fileDownUrl + 'compress/'+
                                item.bodyContent.repliedContent
                            "
                            v-imageError
                          />
                        </div>
                        <div
                          class="reply-content"
                          v-html="item.bodyContent.content"
                        ></div>
                      </a>
                    </div>
                    <!-- 名片 -->
                    <div class="msg-detail" v-if="item.bodyType == '32'">
                      <span>[个人名片]</span>
                    </div>
                    <!-- 聊天记录 -->
                    <div
                      class="msg-detail chat-preview"
                      @click="$parent.$refs.msgRecord.show(item.bodyContent)"
                      v-if="item.bodyType == 44"
                    >
                      <label class="title"
                        >{{ item.bodyContent.title }}的聊天记录</label
                      >
                      <div class="text">
                        <p class="text-line">{{ item.bodyContent.list[0] }}</p>
                        <p class="text-line">{{ item.bodyContent.list[1] }}</p>
                      </div>
                    </div>
                    <div class="icon-edit" v-if="item.bodyType == '28'"></div>
                  </div>
                </div>
              </div>
            </li>
          </ul>
          <loading v-if="loading"></loading>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { mapGetters } from "vuex";
import Msg from "@/tools/msg";
import { MessageHandler } from "@/tools/messageHandler";

export default {
  name: "msg-record",
  data() {
    return {
      showBox: false,
      title: "",
      loading: true,
      msgList: [],
      idList: [],
      idx: 0,
      msgRecord: {}
    };
  },
  methods: {
    show(obj) {
      this.title = obj.title;
      this.idList.push(obj.msgId);
      this.idx++;

      if (this.msgRecord[obj.msgId]) {
        this.msgList = this.msgRecord[obj.msgId];
        return;
      }

      this.showBox = true;
      this.loading = true;
      this.$http.getRecordList({ id: obj.msgId }).then(data => {
        for (let i = 0; i < data.length; i++) {
          data[i] = this.formatMsg(data[i]);
        }
        this.msgList = data;
        this.msgRecord[obj.msgId] = data;
        this.loading = false;
      });
    },
    hide() {
      this.showBox = false;
      this.msgList = [];
      this.idList = [];
      this.msgRecord = {};
      this.idx = 0;
    },
    preRecord() {
      this.idx--;
      this.idList.pop();
      this.msgList = this.msgRecord[this.idList[this.idx - 1]];
    },
    formatMsg(content) {
      switch (content.bodyType + "") {
        case "1":
        case "13":
        case "24":
          content.bodyContent = MessageHandler.textToHtml(content.bodyContent);
          break;
        case "2":
        case "3":
        case "4":
        case "5":
        case "18":
        case "44":
          content.bodyContent = JSON.parse(content.bodyContent);
          break;
        case "28":
          content.bodyContent = JSON.parse(content.bodyContent);
          if (content.bodyContent.editType == 30) {
            let replied = content.bodyContent.content;
            replied.content = MessageHandler.textToHtml(replied.content);
            if (replied.repliedContent) {
              if (
                !(
                  replied.msgType == 2 ||
                  replied.msgType == 3 ||
                  replied.msgType == 4 ||
                  replied.msgType == 5 ||
                  replied.msgType == 18
                )
              ) {
                replied.repliedContent = MessageHandler.textToHtml(replied.repliedContent);
              }
            }
          } else {
            content.bodyContent.content = MessageHandler.textToHtml(
              content.bodyContent.content
            );
          }
          break;
        case "30":
          content.bodyContent = JSON.parse(content.bodyContent);
          let msgType = content.bodyContent.msgType;

          if (content.bodyContent.repliedContent) {
            content.bodyContent.content = MessageHandler.textToHtml(
              content.bodyContent.content
            );
            if (
              msgType == 1 ||
              msgType == 13 ||
              msgType == 28 ||
              msgType == 30
            ) {
              content.bodyContent.repliedContent = MessageHandler.textToHtml(
                content.bodyContent.repliedContent
              );
            }
          }
          break;
        default:
          break;
      }
      return content;
    }
  },
  mounted() {}
};
</script>

<style lang="scss" scoped="" type="text/css">
@import "../../assets/css/var";

.msg-record {
  .my-popup-content {
    width: 476px;
    height: 602px;
    border-radius: 2px;
    .my-popup-title {
      border-bottom: 1px solid $border-color;
    }
    .pre-record {
      position: absolute;
      top: 7px;
      right: 12px;
      height: 24px;
      padding: 0 10px;
      border-radius: 12px;
      border: 1px solid $color-theme;
      font-size: 14px;
      line-height: 24px;
      color: $color-theme;
      cursor: pointer;
    }
    .message-box {
      position: relative;
      height: 562px;
    }
    .message-list {
      position: relative;
      height: 562px;
      padding: 0 30px;
      text-align: left;
    }
    .history-item {
      padding: 15px 0;
      border-bottom: 1px solid $border-color;
      font-size: 14px;
      &:last-child {
        border: 0;
      }
      .history-content {
        padding: 0;
      }
    }
    .msg-content {
      align-items: flex-start;
      .avatar {
        float: none;
        border-radius: 50%;
      }
      .msg-info {
        justify-content: space-between;
        padding-bottom: 10px;
        font-size: 14px;
        color: $color-grey;
        .time {
          font-size: 12px;
        }
      }
      .msg-detail {
        min-height: 32px;
        border-radius: 0 10px 10px 10px;
        text-align: left;
        &.none {
          padding: 0;
          border: 0;
        }
      }
      .icon-edit {
        margin: 13px 0 0 12px;
      }
      .msg-file {
        border-radius: 0 10px 10px 10px;
      }
      .chat-preview {
        background-color: $backgroup-color;
      }
    }
  }
}
</style>
