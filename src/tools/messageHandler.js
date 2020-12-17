import { Config } from "../common/config"
import { face } from "./emoji";

let _langIdx = 0;

if (localStorage.lang == "en_US") _langIdx = 1;
if (localStorage.lang == "my") _langIdx = 2;

export const MessageHandler = {
  getPreviewUrl(imgData) { // 获取图片预览图url
    let newStr = Config.imageUrl + imgData.imgUrl + "_",
      arr = imgData.imgUrl.split("."),
      name = arr[arr.length - 1];

    if (imgData.imgWidth > 500 && imgData.imgHeigh > 500) {
      if (imgData.imgWidth > 999 && imgData.imgHeigh > 999) {
        if (imgData.imgWidth > 1999 && imgData.imgHeigh > 1999) {
          newStr += ~~(imgData.imgWidth / 10);
          newStr += "x";
          newStr += ~~(imgData.imgHeigh / 10);
        } else {
          newStr += ~~(imgData.imgWidth / 4);
          newStr += "x";
          newStr += ~~(imgData.imgHeigh / 4);
        }
      } else {
        newStr += ~~(imgData.imgWidth / 3);
        newStr += "x";
        newStr += ~~(imgData.imgHeigh / 3);
      }
    } else {
      newStr += ~~(imgData.imgWidth / 2);
      newStr += "x";
      newStr += ~~(imgData.imgHeigh / 2);
    }

    return newStr + "." + name;
  },
  htmlToText(html) { //将消息内容替换成纯文本
    html = this.checkEmoji(html);
    let filter = html.replace(/<\/?div>/gi, "")
    .replace(/<br\/?>/gi, "\n")
    .replace(/&nbsp;/g, " ");

    filter = this.replaceCodeToText(filter);

    return filter;
  },
  textToHtml(text) { //将纯文本消息内容解析成html
    text = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");//简单处理xss攻击 
    let html = text.replace(/[\n\r]/g, "<br/>");

    html = this.checkUrl(html);
    html = face.checkFace(html);

    return html;
  },
  replaceCodeToText(text) { //输入框输入的时候可能是编码，替换成对应符号
    text = text.replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&");

    return text;
  },
  checkEmoji(html) { //替换消息内容的表情img标签成表情文本
    var resultArr = html.match(/<img[^>]*>/g);
    if (resultArr != null) {
      for (var i = 0; i < resultArr.length; i++) {
        let str = resultArr[i].split("[")[1];
        str = str.split("]")[0];
        html = html.replace(resultArr[i], "[" + str + "]");
      }
    }
    return html;
  },
  checkUrl(str) { //链接替换成<a>标签
    str = str.replace(/ /g, "||nbsp|");
     let reg = /((https|http|ftp|rtsp|mms)?:\/\/)?(([0-9a-z_!~*'().&=+$%-]+: )?[0-9a-z_!~*'().&=+$%-]+@)?(([0-9]{1,3}\.){3}[0-9]{1,3}|([0-9a-z_!~*'()-]+\.)*([0-9a-z][0-9a-z-]{0,61})?[0-9a-z]\.[a-z]{2,6})(:[0-9]{1,5})?((\/?)(\/[0-9a-z_!~*'().;?:@&=+$,%#-]+)+)?(\/?)/gi;
    // var Expression="(?:(?:http|https)://)?[\\w./?:@=#-]+\\.([\\w./?:@=#-])*"
    // var reg=new RegExp(Expression);
    // let reg =  /(?:([A-Za-z]+):)?(\/{0,3})([0-9.\-A-Za-z]+)(?::(\d+))?(?:\/([^?#]*))?(?:\?([^#]*))?(?:#(.*))?$/
    str = str.replace(reg, function (a, b, c) {
      let url = a;
      if (
        !(
          url.indexOf("ftp") >= 0 ||
          url.indexOf("http") >= 0 ||
          url.indexOf("https") >= 0
        )
      ) {
        url = "https://" + a;
      }
      return '<a href="javascript:void(0);">' + a + "</a>";
    });
    str = str.replace(/\|\|nbsp\|/g, "&nbsp;");
    return str;
  },
  copyTextReplay(str) { //选中消息内容复制时内容替换，不替换有的消息无法识别为聊天记录
    let newStr = str
      .replace(/[\r\n]/g, "")
      .replace(/ /g, "&nbsp;")
      .replace(/\s/g, "&nbsp;");

    if (newStr.indexOf("[") >= 0) {
      newStr = face.msgToFace(newStr);
    }

    return newStr;
  },
}