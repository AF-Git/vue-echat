import store from "@/store";
const filters = {
  timeFilter(timestamp) {
    if (!timestamp) {
      return "1970-01-01 00:00"
    }
    // console.log(store.state.lang)
    let time = new Date(+timestamp);
    let str = "";
    let format = fmt => {
      const o = {
        "y+": time.getFullYear(),
        "M+": time.getMonth() + 1,
        "d+": time.getDate(),
        "H+": time.getHours(),
        "m+": time.getMinutes(),
        "s+": time.getSeconds()
      };
      for (var k in o) {
        if (new RegExp("(" + k + ")", "g").test(fmt)) {
          const len = RegExp.$1.length;
          fmt = fmt.replace(
            RegExp.$1,
            len == 1 ? o[k] : ("00" + o[k]).substr(-len)
          );
        } 
      }
      return fmt;
    };
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    // const today = new Date('2020-05-31');

    var toWeek = function(n) {
      if (n == 1) {
        return  store.state.lang.time.Monday
      } else if (n == 2) {
        return  store.state.lang.time.Tuesday
      } else if (n == 3) {
        return  store.state.lang.time.Wednesday
      } else if (n == 4) {
        return  store.state.lang.time.Thursday
      } else if (n == 5) {
        return  store.state.lang.time.Friday
      } else if (n == 6) {
        return  store.state.lang.time.Saturday
      } else if (n == 0) {
        return  store.state.lang.time.Sunday
      }
    }
    var n = today.getDay()==0?7:today.getDay();
    var yesterdayTime = +(today.getTime()-24*60*60*1000);//昨天
    var todayTime = +today.getTime()//今天
    var msgTime = +time.getTime() //消息的日期
    var weekTime = +(today.getTime()-n*24*60*60*1000);//一周内n天前的日期
    if (time.getTime() > today.getTime()) {
      str = format("HH:mm");
    }else if( yesterdayTime < msgTime && msgTime < todayTime){
      str = store.state.lang.time.Yesterday
    }else if( weekTime < msgTime && msgTime < yesterdayTime){
      str = toWeek(time.getDay())
    }else str = format("yyyy/MM/dd ") + format("HH:mm");
    return str;
  },
  timeFilter1(timestamp) {
    let time = new Date(+timestamp);
    let str = "";
    let format = fmt => {
      const o = {
        "H+": time.getHours(),
        "m+": time.getMinutes()
      };
      for (var k in o) {
        if (new RegExp("(" + k + ")", "g").test(fmt)) {
          const len = RegExp.$1.length;
          fmt = fmt.replace(
            RegExp.$1,
            len == 1 ? o[k] : ("00" + o[k]).substr(-len)
          );
        }
      }
      return fmt;
    };
    str = format("HH:mm");
    return str;
  },
  timeFilter2(timestamp) {
    let time = new Date(+timestamp);
    let str = "";
    let format = fmt => {
      const o = {
        "y+": time.getFullYear(),
        "M+": time.getMonth() + 1,
        "d+": time.getDate()
      };
      for (var k in o) {
        if (new RegExp("(" + k + ")", "g").test(fmt)) {
          const len = RegExp.$1.length;
          fmt = fmt.replace(
            RegExp.$1,
            len == 1 ? o[k] : ("00" + o[k]).substr(-len)
          );
        }
      }
      return fmt;
    };
    str = format("yyyy-MM-dd ");
    return str;
  },
  timeFilter4(timestamp) {
    let time = new Date(+timestamp);
    let str = "";
    let format = fmt => {
      const o = {
        "y+": time.getFullYear(),
        "M+": time.getMonth() + 1,
        "d+": time.getDate(),
        "H+": time.getHours(),
        "m+": time.getMinutes(),
        "s+": time.getSeconds()
      };
      for (var k in o) {
        if (new RegExp("(" + k + ")", "g").test(fmt)) {
          const len = RegExp.$1.length;
          fmt = fmt.replace(
            RegExp.$1,
            len == 1 ? o[k] : ("00" + o[k]).substr(-len)
          );
        }
      }
      return fmt;
    };
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (time.getTime() > today.getTime()) {
      str = format("HH:mm");
      const h = time.getHours();
    } else {
      str = format("MM-dd ") + format("HH:mm");
    }
    return str;
  },
  numFitler(n) {
    if (n) {
      if (n > 99) return "99+";
      else return n;
    }
  },
  fileSize(size) {
    let newSize = "";
    if (size > 1024 * 1024) {
      newSize = (size / (1024 * 1024)).toFixed(2) + "M";
    } else {
      let sizeNum = (size / 1024).toFixed(2);
      newSize = (Number(sizeNum) >= 0.01 ? sizeNum : 0.01) + "KB";
    }
    return newSize;
  },
  fileFitler(value) {
    if (value) {
      let fileArr = value.split(".");
      let file = fileArr[fileArr.length - 1].toLowerCase();
      if (file == "doc" || file == "docx") return "word";
      else if (file == "xls" || file == "xlsx") return "xlsx";
      else if (file == "ppt" || file == "pptx") return "ppt";
      else if (file == "pdf") return "pdf";
      else if (file == "zip" || file == "rar" || file == "arj" || file == "z")
        return "zip";
      else if (file == "txt") return "txt";
      else if (
        file == "mp3" ||
        file == "wav" ||
        file == "wma" ||
        file == "aac" ||
        file == "ogg"
      )
        return "mp3";
      else if (
        file == "mp4" ||
        file == "avi" ||
        file == "mkv" ||
        file == "rm" ||
        file == "rmvb" ||
        file == "flv" ||
        file == "3gp" ||
        file == "mtv"
      )
        return "mp4";
      else if (file == "exe") return "exe";
      else if (file == "apk") return "apk";
      else if (file == "pkg") return "pkg";
      else if (file == "api" || file == "ipa") return "ipa";
      else if (file == "app" || file == "APP") return "app";
      else if (file == "dmg") return "dmg";
      else return "other";
    }
  },
  fileName(fileName, num) {
    if (fileName.length <= num) {
      return fileName;
    }
    const index = fileName.lastIndexOf(".");
    let newName = "";
    if (index === -1) {
      if (fileName.length > num) {
        newName = fileName.substr(0, num - 3) + "...";
      } else {
        newName = fileName;
      }
    } else {
      const name = fileName.substring(0, index);
      const ext = fileName.substring(index);
      const reg = /^[\\u4e00-\\u9fa5]/;

      for (let i = 0; i < name.length; i++) {
        if (reg.test(name[i])) num = num + 0.5;
      }

      num = num > 18 ? 18 : ~~num;

      if (name.length > num - ext.length && num > 5 + ext.length) {
        const lastStr = name.substring(name.length - 2);
        const firstStr = name.substr(0, num - ext.length - 2 - 3);
        newName = `${firstStr}...${lastStr}${ext}`;
      } else if (num <= 5 + ext.length && num > ext.length + 2) {
        const n = name.substring(0, num - ext.length - 1);
        newName = `${n}..${ext}`;
      } else if (fileName.length > num) {
        newName = fileName.substring(0, num - 3) + "...";
      } else {
        newName = fileName;
      }
    }
    return newName;
  },
  sourceFitler(str) {
    let arr = str.split(',');
    return arr[1];
  }
};
export default filters;
