<template>
  <div class="my-popup send-file" v-show="dropFileInfo.show">
    <div :class="dropFileInfo.info.length>1?'my-popup-content small':'my-popup-content'">
      <span class="my-popup-close" @click="close"></span>
      <div class="text" v-if="dropFileInfo.info.length>1&&lang=='zh_CN'">
        {{ $t("msg.chatPanel.filesselected") }}{{dropFileInfo.info.length}}个文件</div>
      <div class="text" v-else-if="dropFileInfo.info.length>1&&lang!='zh_CN'">
        {{dropFileInfo.info.length}}{{ $t("msg.chatPanel.filesselected") }}</div>
      <div class="drop-file-container display-flex" v-else>
        <div class="drop-file-icon" :class="dropFileInfo.info.name | fileFitler"></div>
        <div>
          <div class="drop-file-name">{{ dropFileInfo.info.name }}</div>
          <div class="drop-file-size">
            {{ dropFileInfo.info.size | fileSize }}
          </div>
        </div>
      </div>
      <div :class="dropFileInfo.info.length>1?'explain small':'explain'">
        <div>{{ $t("msg.chatPanel.comment") }}</div>
        <input type="text" v-model="explain">
      </div>
      <p class="popup-btn">
        <button class="btn btn-white" type="button" @click="dropFileAction(false)">
          {{ $t("msg.common.cancel") }}
        </button>
        <button class="btn btn-active" type="button" @click="dropFileAction(true,explain)">
          {{ $t("msg.common.send") }}
        </button>
      </p>
    </div>
    <input type="file" hidden="true" id="file" accept="*" multiple @change="selectFile($event)" />
  </div>
</template>
<script>
  import {
    mapGetters
  } from "vuex";
  import Vue from "vue";
  // import BMF from'browser-md5-file';

  export default {
    name: "file-popup",
    data() {
      return {
        fileList: [], //name:'', size:null, fileId: '', fileUrl: '', fileArr: [], time
        history: [],
        cutSize: 1024 * 1024 * 5,
        ready: false,
        count: 0,
        fileXml: null,
        fileNum: 1,
        explain: "",
        lang: Vue.config.lang
      };
    },
    computed: {
      ...mapGetters(["userInfo", "currentSession"]),
      dropFileInfo() {
        if (this.fileInfo.show) {
          window.addEventListener("keyup", this.sendEvent);
        } else {
          window.removeEventListener("keyup", this.sendEvent);
        }
        return this.fileInfo;
      }
    },
    watch: {
      fileList() {
        if (this.fileList.length > 0 && this.ready) {
          this.ready = false;
          let cacheFile = this.fileList[0];
          // debugger;
          //重复上传的文件不做分割上传，直接发送
          if (cacheFile.type == 0) {
            this.sendFile(cacheFile.msgContent, cacheFile.bodyType, cacheFile);
          } else {
            //续传
            if (cacheFile.progressIndex > 0) {
              let pr = {
                id: cacheFile.time,
                num: (cacheFile.progressIndex / cacheFile.count) * 100
              };
              this.$store.commit("UPDATE_PROGRESS", pr);
            }
            this.uploadHandler(cacheFile, 0);
          }
        } else {
          this.ready = false;
        }
      },
      // fileInfo: {
      //   handler() {
      //     if (this.fileInfo.info && !this.fileInfo.show) {
      //       let files = this.fileInfo.info;
      //       for (let i = 0; i < files.length; i++) {
      //         this.initFile(files[i]);
      //       }
      //     }
      //   },
      //   deep: true
      // }
    },
    props: {
      fileInfo: {
        type: Object,
        default: {}
      }
    },
    methods: {
      close() {
        this.dropFileInfo.show = false
        this.$parent.draguplod = false;
      },
      selectFile(e) {
        if (!e.target.files[0]) {
          return;
        }
        let files = e.target.files;
        if (files.length > 9) {
          this.$store.commit(
            "SET_TOAST_TEXT",
            this.$t("msg.chatPanel.fileNum") +
            files.length +
            this.$t("msg.chatPanel.num")
          );
          return;
        }
        this.fileNum = files.length;
        this.ready = false;

        for (let i = 0; i < files.length; i++) {
          this.initFile(files[i], i);
        }
        e.target.value = "";
      },
      //拖动多个
      selectFile2(e) {
        let files = e;
        this.fileNum = files.length;
        this.ready = false;

        for (let i = 0; i < files.length; i++) {
          this.initFile(files[i], i);
        }
      },
      dropFileAction(type, msg) {
        this.dropFileInfo.show = false;
        this.$parent.draguplod = false;
        if (type) {
          if (this.dropFileInfo.info.length > 1) {
            this.selectFile2(this.dropFileInfo.info)
          } else {
            this.initFile(this.dropFileInfo.info, 0);
          }
          if (msg != "") {
            let time = new Date().getTime();
            this.$parent.updataChatHistory(msg, "1", time);
            let obj = {
              msg,
              msgType: "1",
              chatType: this.currentSession.fromType,
              toId: this.currentSession.paramId,
              time,
              userId: this.userInfo.userId
            };
            this.$store.dispatch("sendMsg", obj).then(() => {});
            this.explain = ''
          }

        }
      },
      initFile(file, i) {
        let nameArr = file.name.split(".");
        let fileName = nameArr[nameArr.length - 1];

        if (file.size == 0 || file.size > 1024 * 1024 * 100) {
          this.$store.commit("SET_TOAST_TEXT", this.$t("msg.imgPopup.overSize"));
          return false;
        }
        if (file.type.indexOf('image/') >= 0) {
          //图片
          this.getImageInfo(file).then(data => {
            this.initFileTwo(i, file, {
              imgUrl: data.imgUrl,
              imgWidth: data.width,
              imgHeigh: data.height,
              size: file.size,
            }, 3);
          })
          // }else if(file.type.indexOf('video/')>=0){
          //   //视频
          //   this.initFileTwo(i,file,msgContent,5);
          // }else if(file.type.indexOf('audio/')>=0){
          //   //音频
          //   this.initFileTwo(i,file,msgContent,4);
        } else {
          //文件
          browserMD5File(file, (err, md5) => {
            this.md5 = md5
          });
          let msgContent = {
            name: file.name,
            size: file.size,
            url: "",
            progress: -1,
            md5: this.md5
          }
          this.initFileTwo(i, file, msgContent, 18);
        }
      },
      initFileTwo(i, file, msgContent, bodyType) {
        let time = new Date().getTime();
        this.history[i] = {
          msgContent: msgContent,
          bodyFrom: this.userInfo.userId,
          bodyTime: time,
          bodyType: bodyType,
          mId: time,
          loading: true,
          preview: "[" + this.$t("msg.common.file") + "]",
          toId: this.currentSession.paramId,
          chatInfo: {
            headImg: this.userInfo.headImg,
            nickName: this.userInfo.nickName
          }
        };
        let count = parseInt(file.size / this.cutSize);
        if ((file.size % this.cutSize) > 0) {
          count++;
        }
        //缓存发送文件信息
        let fileItem = {
          name: file.name,
          size: file.size,
          time: time,
          fromType: this.currentSession.fromType,
          paramId: this.currentSession.paramId,
          count: count
        };

        this.$parent.updataChatHistory(
          this.history[i].msgContent,
          this.history[i].bodyType,
          this.history[i].bodyTime
        );

        browserMD5File(file, (err, md5) => {
          this.getFileData(file.name, file.size, md5, fileItem, i, file);
        });
      },
      getFileData(fileName, fileSize, fileMd5, item, i, file) {
        let postData = {
          fileName: fileName,
          fileSize: fileSize,
          fileMd5: fileMd5,
          fileBlock: this.cutSize
        };
        //上传文件初始化
        this.$http.uploadFile(postData).then(
          data => {
            item.uploadId = data.uploadId;
            item.fileId = data.fileId;
            item.fileUrl = data.fileUrl;
            item.type = data.type;
            item.idx = i;
            item.fileIndex = data.fileIndex;
            item.progressIndex = parseInt(item.fileIndex / this.cutSize);
            item.fileArr = this.cutFile(file, item.progressIndex, item.fileId);

            let historyC = this.history[i];

            switch (historyC.bodyType) {
              case 3:
                //图片
                historyC.msgContent.imgUrl = data.fileUrl;
                break;
              case 4:
                //音频
                break;
              case 5:
                //视频
                break;

              default:
                historyC.msgContent.url = data.fileUrl;
                let obj = {
                  url: this.global.fileDownUrl + 'original/' + historyC.msgContent.url,
                  name: historyC.msgContent.name
                }
                let d = JSON.stringify(obj);
                d = window.encodeURIComponent(d);
                let str = window.btoa(d);
                historyC.msgContent.dl64 = str
                historyC.msgContent.progress = data.type == 0 ? 100 : 0;
                break;
            }
            item.msgContent = historyC.msgContent;
            item.bodyType = historyC.bodyType;
            let message = this.$store.state.message[item.time];
            if (message) {
              this.$parent.updataChatHistory(historyC.msgContent, historyC.bodyType, item.time);
            }
            this.$store.commit("ADD_UPLOAD_LIST", historyC);
            this.fileList.push(item);
            if (this.fileList.length == this.fileNum) {
              this.fileList = this.fileList.sort(
                (a, b) => a.time - b.time
              );
              this.ready = true;
            }
          },
          () => {
            let message = this.$store.state.message[item.time];
            if (message) {
              message.loading = 2;
              message.msgContent.progress = 500;
              this.$store.commit("UPDATE_MESSAGE", message);
            }
            this.fileNum--;
            if (this.fileList.length == this.fileNum) {
              this.fileList = this.fileList.sort(
                (a, b) => a.time - b.time
              );
              this.ready = true;
            }
          }
        );
      },

      uploadFile(fileBlock, uploadId) {
        return new Promise((resolve, reject) => {
          let formData = new FormData();
          formData.append("fileIndex", fileBlock.index);
          formData.append("fileId", fileBlock.fileId);
          formData.append("mFile", fileBlock.file);
          formData.append("indexNum", fileBlock.indexNum);
          if (uploadId) {
            formData.append("uploadId", uploadId);
          }
          let xml = new XMLHttpRequest();
          this.fileXml = xml;
          xml.open("post", base.imfileUrl + "/fileShare/fileUpload.htm", true);
          xml.setRequestHeader("token", this.$store.state.token);
          xml.send(formData);
          xml.onreadystatechange = () => {
            //回调函数
            if (xml.status == 200) {
              setTimeout(() => {
                let res = JSON.parse(xml.responseText);
                if (res.code == 0) {
                  resolve();
                } else {
                  reject();
                }
              }, 20);
            }
          };
        });
      },
      uploadHandler(cacheFile, uploadCount) {
        let arr = cacheFile.fileArr;
        let cacheItem = arr[uploadCount];
        this.uploadFile(cacheItem, cacheFile.uploadId).then(() => {
          uploadCount++;
          cacheFile.progressIndex = cacheFile.progressIndex + 1;
          let pr = {
            id: cacheFile.time,
            num: parseInt((cacheFile.progressIndex / cacheFile.count) * 100)
          };
          let list = this.$store.state.uploadInfo;
          list.forEach(item => {
            if (pr.id == item.mId) {
              item.msgContent.progress = pr.num;
            }
          });
          this.$store.commit("UPDATE_PROGRESS", pr);
          if (uploadCount < arr.length) {
            this.uploadHandler(cacheFile, uploadCount);
          } else {
            this.sendFile(cacheFile.msgContent, cacheFile.bodyType, cacheFile);
          }
        });
      },
      sendFile(msg, msgType, data) {
        let obj = {
          msg: JSON.stringify(msg),
          msgType: msgType,
          chatType: data.fromType,
          toId: data.paramId,
          time: data.time,
          userId: this.userInfo.userId
        };
        this.$store.dispatch("sendMsg", obj).then(() => {
          this.ready = true;
          this.count = 0;
          this.fileList.shift();
          this.history.shift();
          this.$store.commit("DELETE_UPLOAD_LIST", 0);
        });
      },
      cutFile(file, indexNum, fileId) {
        let count = parseInt(file.size / this.cutSize) | 0,
          fileArr = [];
        for (let i = indexNum; i < count; i++) {
          fileArr.push({
            indexNum: i + 1,
            name: file.name + ".part" + (i + 1),
            file: file.slice(this.cutSize * i, this.cutSize * (i + 1)),
            index: this.cutSize * i,
            fileId
          });
        }
        if ((file.size % this.cutSize) > 0) {
          fileArr.push({
            indexNum: count + 1,
            name: file.name + ".part" + (count + 1),
            file: file.slice(this.cutSize * count, file.size),
            index: this.cutSize * count,
            fileId
          });
        }

        return fileArr;
      },
      uploadCancel(data) {
        //取消上传
        if (this.fileList.length > 0) {
          if (data.bodyTime == this.fileList[0].time && this.fileXml) {
            this.fileXml.abort();
            this.$store.commit("DELETE_UPLOAD_LIST", 0);
            this.fileList.shift();
            this.ready = true;
          } else {
            for (let i = 0; i < this.fileList.length; i++) {
              if (this.fileList[i].time == data.bodyTime) {
                this.fileList.splice(i, 1);
                this.$store.commit("DELETE_UPLOAD_LIST", i);
                break;
              }
            }
          }
        }
        this.$store.commit("DELETE_MESSAGE", data.bodyTime);
      },
      sendEvent(event) {
        if (event.keyCode === 13) {
          this.dropFileAction(true, this.explain);
        }
      },
      getImageInfo(file) {
        return new Promise(resolve => {
          let fr = new FileReader;
          fr.readAsDataURL(file);
          fr.onload = function () { //onload文件读取完成事件
            let img = new Image;
            img.src = fr.result;
            img.onload = function () {
              let width = img.width;
              let height = img.height;
              let imgUrl = fr.result;
              resolve({
                width,
                height,
                imgUrl
              });
            };
          }
        })
      },
      getVideoInfo(file) {
        return new Promise(resolve => {
          let fr = new FileReader;
          fr.readAsDataURL(file);
          fr.onload = function () { //onload文件读取完成事件
            let img = new Image;
            img.src = fr.result;
            img.onload = function () {
              let width = img.width;
              let height = img.height;
              let imgUrl = fr.result;
              resolve({
                width,
                height,
                imgUrl
              });
            };
          }
        })
      },
      getAudioInfo(file) {
        return new Promise(resolve => {
          let fr = new FileReader;
          fr.readAsDataURL(file);
          fr.onload = function () { //onload文件读取完成事件
            let audio = new Audio;
            audio.src = fr.result;
            audio.onload = function () {
              let width = audio.width;
              let height = audio.height;
              let url = fr.result;
              resolve({
                width,
                height,
                url
              });
            };
          }
        })
      },
    },
    mounted() {}
  };

</script>
