import { sha1 } from "@/tools/sha1.js";
import { Countries } from "../common/Countries";
import { Areas } from "../common/areas";
import { Config } from "@/common/config"
import { Crypto } from "./crypto"
import { api } from "../api";
import "../common/pinyin_dict_notone.js";
import "./pinyinUtil.js";
import store from "@/store";
let uploadReady = true;
export const Util = {
  doubleNumber(num) {
    return num < 10 ? "0" + num : num.toString();
  },
  formatTime(value) {
    if (+value > 3600) {
      let h = Math.floor(value / 3600),
        m = Math.floor(Math.floor(value % 3600) / 60),
        s = value % 60;
      return (
        this.doubleNumber(h) +
        ":" +
        this.doubleNumber(m) +
        ":" +
        this.doubleNumber(s)
      );
    } else if (+value > 60) {
      let m = Math.floor(value / 60),
        s = value % 60;
      return this.doubleNumber(m) + ":" + this.doubleNumber(s);
    }
    return "00:" + this.doubleNumber(+value);
  },
  isShowTime(lastTime, time) {
    if (lastTime == 0) {
      return true;
    } else {
      let day1 = new Date(time).getDate(),
        month1 = new Date(time).getMonth(),
        year1 = new Date(time).getFullYear(),
        day2 = new Date(lastTime).getDate(),
        month2 = new Date(lastTime).getMonth(),
        year2 = new Date(lastTime).getFullYear(),
        time1 = year1 * 10000 + month1 * 100 + day1,
        time2 = year2 * 10000 + month2 * 100 + day2;
      return time1 > time2 ? true : false;
    }
  },
  insertAtCursor(field, value, selectPastedContent) {
    var sel;
    var range;
    field.focus();
    if (window.getSelection) {
      sel = window.getSelection();
      if (sel.getRangeAt && sel.rangeCount) {
        range = sel.getRangeAt(0);
        range.deleteContents();
        var el = document.createElement("div");
        el.innerHTML = value;
        var frag = document.createDocumentFragment();
        var node = void 0;
        var lastNode = void 0;
        while ((node = el.firstChild)) {
          lastNode = frag.appendChild(node);
        }
        var firstNode = frag.firstChild;
        range.insertNode(frag);
        if (lastNode) {
          range = range.cloneRange();
          range.setStartAfter(lastNode);
          if (selectPastedContent) {
            range.setStartBefore(firstNode);
          } else {
            range.collapse(true);
          }
          sel.removeAllRanges();
          sel.addRange(range);
        }
      }
    }
  },
  filterNewList(letter, memberList) {
    //contenteditable输入框'@'后只有一个文字过滤数组 letter - '@'后的内容 memberList - 过滤数组
    let newList = [];
    for (let item of memberList) {
      if (item.nickName && item.nickName.toUpperCase().indexOf(letter) !== -1) {
        item.match = "nickName";
        newList.push(item);
        continue;
      }
    }
    return newList;
  },
  focusLast(element) {
    //contenteditable输入框光标聚焦到最后
    if (window.getSelection) {
      var range = window.getSelection();
      range.selectAllChildren(element);
      range.collapse(element, element.childNodes.length);
    }
  },
  getDivPosition(element) {
    var caretOffset = 0;
    var doc = element.ownerDocument || element.document;
    var win = doc.defaultView || doc.parentWindow;
    var sel;
    if (typeof win.getSelection != "undefined") {//谷歌、火狐
      sel = win.getSelection();
      if (sel.rangeCount > 0) {//选中的区域
        var range = win.getSelection().getRangeAt(0);
        var preCaretRange = range.cloneRange();//克隆一个选中区域
        preCaretRange.selectNodeContents(element);//设置选中区域的节点内容为当前节点
        preCaretRange.setEnd(range.endContainer, range.endOffset);  //重置选中区域的结束位置
        caretOffset = preCaretRange.toString().length;
      }
    } else if ((sel = doc.selection) && sel.type != "Control") {//IE
      var textRange = sel.createRange();
      var preCaretTextRange = doc.body.createTextRange();
      preCaretTextRange.moveToElementText(element);
      preCaretTextRange.setEndPoint("EndToEnd", textRange);
      caretOffset = preCaretTextRange.text.length;
    }
    return caretOffset;
  },
  getOffset(input) {
    //获取当前光标的在页面中的位置
    var sel = window.getSelection();
    var range = sel.getRangeAt(0);
    var offset;
    // if (!this.isSafari()) {
    // 	offset = range.getBoundingClientRect();
    // } else {
    var clonedRange = void 0;
    var rect = void 0;
    var shadowCaret = void 0;
    clonedRange = range.cloneRange();
    clonedRange.setStart(range.endContainer, range.endOffset - 1);
    clonedRange.setEnd(range.endContainer, range.endOffset);
    rect = clonedRange.getBoundingClientRect();
    offset = {
      height: rect.height,
      left: rect.left + rect.width,
      top: rect.top
    };
    clonedRange.detach();
    if (input.innerHTML === "@") {
      clonedRange = range.cloneRange();
      shadowCaret = document.createTextNode("|");
      clonedRange.insertNode(shadowCaret);
      clonedRange.selectNode(shadowCaret);
      rect = clonedRange.getBoundingClientRect();
      offset = {
        height: rect.height,
        left: rect.left,
        top: rect.top
      };
      input.innerHTML = "@";
      this.focusLast(input);
      clonedRange.detach();
    }
    // }
    return offset;
  },
  isSafari() {
    var userAgent = navigator.userAgent;
    return (
      userAgent.indexOf("Safari") > -1 && userAgent.indexOf("Chrome") === -1
    );
  },
  browserType() {
    //判断浏览器类型
    var userAgent = navigator.userAgent;
    var isOpera = false;
    if (userAgent.indexOf("Edge") > -1) return "Edge";
    if (userAgent.indexOf(".NET") > -1) return "IE";
    if (userAgent.indexOf("Opera") > -1 || userAgent.indexOf("OPR") > -1) {
      isOpera = true;
      return "Opera";
    }
    if (userAgent.indexOf("Firefox") > -1) return "FF";
    if (userAgent.indexOf("Chrome") > -1) return "Chrome";
    if (userAgent.indexOf("Safari") > -1) return "Safari";
    if (
      userAgent.indexOf("compatible") > -1 &&
      userAgent.indexOf("MSIE") > -1 &&
      !isOpera
    )
      return "IE";
  },
  setCookie(cname, cvalue, ex) {
    //新增cookie
    var d = new Date();
    d.setTime(ex);
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires + ";path=/;";
  },
  getCookie(cname) {
    //读取cookie
    var name = cname + "=";
    var ca = document.cookie.split(";");
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == " ") c = c.substring(1);
      if (c.indexOf(name) != -1) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  },
  clearCookie(name) {
    //清除cookie
    this.setCookie(name, "", "1");
  },
  checkCookie(name) {
    //查找cookie
    var user = this.getCookie(name);
    return new Promise((resolve, reject) => {
      if (user != "") {
        resolve(user);
      } else {
        reject();
      }
    });
  },
  getImgSize(base64url) {
    //获取base64图片大小，返回KB数字
    let str = base64url.replace("data:image/png;base64,", ""); //这里根据自己上传图片的格式进行相应修改
    let strLength = str.length;
    let size = parseInt(strLength - (strLength / 8) * 2);
    return size;
  },
  getImgUrl(file, type) {
    return new Promise((resolve, reject) => {
      let url = "";
      let user = Crypto.decryptByDES(sessionStorage.getItem("eUcShEaRt"));
      user = JSON.parse(user);
      let newform = new FormData();
      if (type == 1) {
        newform.append("mFile", file);
        url = base.imfileUrl + "/upload/picture.htm";
      }else if(type == 2){
        newform.append("mFile", file);
        url = base.imfileUrl + "/upload/picture.htm";
        newform.append("privateFile", "true");
      } else {
        newform.append("base64", file);
        url = base.imfileUrl + "/upload/picture64.htm";
      }
      newform.append("deviceType", "2");
      newform.append("cval", sha1(user.token + Date.parse(new Date())));
      newform.append("uid", user.userId);
      newform.append("rtime", Date.parse(new Date()));
      let xml = new XMLHttpRequest();
      xml.open("post", url, true);
      xml.send(newform);
      xml.onreadystatechange = () => {
        if(xml.readyState==4){
          if (xml.status == 200) {
            setTimeout(() => {
              let res = JSON.parse(xml.responseText);
              if (res.code == 0) {
                resolve(res.data);
              } else {
                reject(res.data);
              }
            }, 20);
          }else{
            let lang=store.state.lang;
            let toastMsg=lang.common.image+lang.common.uploadfail+','+lang.common.uploadAgain;
            reject(toastMsg);
          }
        }
      };
    });
  },
  getArea(countryCode, stateCode) {
    if (!Countries[countryCode - 1]) return "";
    let str = Countries[countryCode - 1].name;
    str = Areas[stateCode - 1].name + " " + str;
    return str;
  },
  getFileName(str) {
    let arr = str.split("/"),
      name = arr[arr.length - 1].split(".");
    return name[0];
  },
  //上传文件
  getFileUrl(file){
    return new Promise((resolve, reject) => {
      let fileArr = this.cutFile(file);
      browserMD5File(file, (err, md5) => {
        let postData = {
          fileName: file.name,
          fileSize: file.size,
          fileMd5: md5,
          fileBlock: this.cutSize()
        };
        //上传文件初始化
        api.uploadFile(postData).then(
          data => {
            var fileData = {
              name: file.name,
              size: file.size,
              url: data.fileUrl,
              fileId: data.fileId
            };
            //重复上传的文件不做分割上传，直接发送
            if(data.type == 0){
              resolve(fileData);
              return false;
            }
            //分割切片上传
            this.uploadFile(fileArr,fileData,0).then(
                data => {
                  resolve(data);
                  return false;
                },data => {}
            );
          },
          () => {}
        );
      });
    });
  },
  uploadFile(fileArr,fileData,count){
    return new Promise((resolve, reject) => {
      var user = JSON.parse(Crypto.decryptByDES(sessionStorage.getItem("eUcShEaRt")));
      var formData = new FormData();
      if (count == undefined) count = 0;
      formData.append("fileIndex",this.cutSize()*count);
      formData.append("fileId",fileData.fileId);
      formData.append("mFile",fileArr[count].file);
      var xml = new XMLHttpRequest();
      xml.open("post",base.imfileUrl+'/fileShare/fileUpload.htm',true);
      xml.setRequestHeader("token", user.token);
      xml.send(formData);
      xml.onreadystatechange = ()=>{//回调函数
        if(xml.status == 200 && uploadReady){
          uploadReady = false;
          setTimeout(()=>{
            uploadReady = true;
            var obj = JSON.parse(xml.responseText);
            count++;
            if (count != fileArr.length){
              this.uploadFile(fileArr,fileData,count);
            }else{
              resolve(fileData);
            }
          },10)
        }
      };
    });
  },
  cutSize(){
    return 1024 * 1024 * 0.5;
  },
  cutFile(file){
    var cutSize = this.cutSize();
    var count = file.size / cutSize | 0 ,fileArr = [];
    for (var i= 0; i< count ; i++){
      fileArr.push({
        name:file.name+".part"+(i+1),
        file:file.slice( cutSize * i , cutSize * ( i + 1 ))
      });
    };
    fileArr.push({
      name:file.name+".part"+(count+1),
      file:file.slice(cutSize*count,file.size)
    });
    return fileArr;
  },
  /**
   * 判断字符串首字母是否是中文
   * @param {string} str - 需要操作的字符串
   * @returns {boolean}
   */
  firstLetterIsChinese(str) {
    const re = /^[\\u4e00-\\u9fa5]/;
    return re.test(str) ? false : true;
  },
  /**
   * 将数组中的字符串按照首字母及中文拼音首字母排序
   * @param {Array} payload - 需要排序的数组
   * @returns {Array} result - 排好序的数组
   */
  sortByLetter(payload, isGroup) {
    const letter = [
      "A",
      "B",
      "C",
      "D",
      "E",
      "F",
      "G",
      "H",
      "I",
      "J",
      "K",
      "L",
      "M",
      "N",
      "O",
      "P",
      "Q",
      "R",
      "S",
      "T",
      "U",
      "V",
      "W",
      "X",
      "Y",
      "Z",
      "#"
    ];
    let result = [];

    for (let item of letter) {
      result.push({
        letter: item,
        data: []
      });
    }

    for (let item in payload) {
      let flag = false;

      if (payload[item].temp) {
        continue;
      }

      for (let re of result) {
        let name =
          payload[item].notes ||
          payload[item].nickName ||
          payload[item].userName;

        if (isGroup == "group") {
          name = payload[item].groupName;
        }

        if (!name || name.length === 0) {
          break;
        }

        let firstLetter = name.charAt(0);
        if (name.match(/^[a-zA-Z]/)) {
          if (firstLetter.toUpperCase() === re.letter) {
            re.data.push(payload[item]);
            flag = true;
            break;
          }
        } else if (this.firstLetterIsChinese(name)) {
          let py = pinyinUtil.getFirstLetter(name, false)[0];

          if (py && py.toUpperCase() === re.letter) {
            re.data.push(payload[item]);
            flag = true;
            break;
          }
        }
      }
      if (!flag) {
        result[result.length - 1].data.push(payload[item]);
      }
    }
    return result;
  },
  /**
   * 获取首字母
   * @param {string} name - 要获取首字母的字符串
   * @returns {string} firstLetter - 首字母
   */
  getFirstLetter(name) {
    let firstLetter = name.charAt(0);
    if (name.match(/^[a-zA-Z]/)) {
      firstLetter = firstLetter.toUpperCase();
    } else if (this.firstLetterIsChinese(name)) {
      let py = pinyinUtil.getFirstLetter(firstLetter, false)[0];
      if (py) {
        firstLetter = py.toUpperCase();
      } else {
        firstLetter = "#";
      }
    } else {
      firstLetter = "#";
    }
    return firstLetter;
  }
};

//事件防抖节流
export function throttle(fn, delay) {
  let timer = null,
    remaining = 0,
    previous = new Date();

  return function () {
    let now = new Date(),
      remaining = now - previous,
      args = arguments,
      context = this;

    if (remaining >= delay) {
      if (timer) {
        clearTimeout(timer);
      }
      fn.apply(context, args);
      previous = now;
    } else {
      if (!timer) {
        timer = setTimeout(function () {
          fn.apply(context, args);
          previous = new Date();
        }, delay - remaining);
      }
    }
  };
}


