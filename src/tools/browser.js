;(function(window, undefined) {
    var isWX = function() {
        var ua = window.navigator.userAgent.toLowerCase();
        if(ua.match(/MicroMessenger/i) == 'micromessenger') {
            return true;
        }else {
            return false;
        }
    },
    getBrowserName = function() {
       var UserAgent = navigator.userAgent.toLowerCase();
       var browser = null;
       var browserArray = {
    	 IE: window.ActiveXObject || "ActiveXObject" in window, // IE
    	 Chrome: UserAgent.indexOf('chrome') > -1 && UserAgent.indexOf('safari') > -1, // Chrome浏览器
    	 Firefox: UserAgent.indexOf('firefox') > -1, // 火狐浏览器
    	 Opera: UserAgent.indexOf('opera') > -1, // Opera浏览器
    	 Safari: UserAgent.indexOf('safari') > -1 && UserAgent.indexOf('chrome') == -1, // safari浏览器
    	 Edge: UserAgent.indexOf('edge') > -1, // Edge浏览器
    	 QQBrowser: /qqbrowser/.test(UserAgent), // qq浏览器
    	 WeixinBrowser: /MicroMessenger/i.test(UserAgent) // 微信浏览器
       };
       for (var i in browserArray) {
    	 if (browserArray[i]) {
    	   browser = i;
    	 }
       }
       return browser;
     },
	getOS= function() { //判断所处操作系统
		var sUserAgent = navigator.userAgent.toLowerCase();
	
		var isWin = (navigator.platform == "Win32") || (navigator.platform == "Win64") || (navigator.platform ==
			"wow64");
	
		var isMac = (navigator.platform == "Mac68K") || (navigator.platform == "MacPPC") || (navigator.platform ==
			"Macintosh") || (navigator.platform == "MacIntel");
		if (isMac) return "Mac";
		var isUnix = (navigator.platform == "X11") && !isWin && !isMac;
		if (isUnix) return "Unix";
		var isLinux = (String(navigator.platform).indexOf("Linux") > -1);
		var bIsAndroid = sUserAgent.toLowerCase().match(/android/i) == "android";
		if (isLinux) {
			if (bIsAndroid) return "Android";
			else return "Linux";
		}
		if (isWin) {
	
			var isWin2K = sUserAgent.indexOf("Windows nt 5.0") > -1 || sUserAgent.indexOf("Windows 2000") > -1;
			if (isWin2K) return "Win2000";
			var isWinXP = sUserAgent.indexOf("Windows nt 5.1") > -1 || sUserAgent.indexOf("Windows XP") > -1
			sUserAgent.indexOf("Windows XP") > -1;
			if (isWinXP) return "WinXP";
			var isWin2003 = sUserAgent.indexOf("Windows nt 5.2") > -1 || sUserAgent.indexOf("Windows 2003") > -1;
			if (isWin2003) return "Win2003";
			var isWinVista = sUserAgent.indexOf("Windows nt 6.0") > -1 || sUserAgent.indexOf("Windows Vista") > -1;
			if (isWinVista) return "WinVista";
			var isWin7 = sUserAgent.indexOf("Windows nt 6.1") > -1 || sUserAgent.indexOf("Windows 7") > -1;
			if (isWin7) return "Win7";
			var isWin8 = sUserAgent.indexOf("windows nt 6.2") > -1 || sUserAgent.indexOf("Windows 8") > -1;
			if (isWin8) return "Win8";
			var isWin10 = sUserAgent.indexOf("windows nt 10.0") > -1 || sUserAgent.indexOf("Windows 10") > -1;
			if (isWin10) return "Win10";
		}
		return "其他";
	},
	getDigits= function() { //判断当前操作系统的版本号 
		var sUserAgent = navigator.userAgent.toLowerCase();
		var is64 = sUserAgent.indexOf("win64") > -1 || sUserAgent.indexOf("wow64") > -1;
		if (is64) {
			return "64";
		} else {
			return "32";
		}
	},
	getBrowser= function() { // 获取浏览器名
		var rMsie = /(msie\s|trident\/7)([\w\.]+)/;
		var rTrident = /(trident)\/([\w.]+)/;
		var rEdge = /(chrome)\/([\w.]+)/; //IE
		var rFirefox = /(firefox)\/([\w.]+)/; //火狐
		var rOpera = /(opera).+version\/([\w.]+)/; //旧Opera
		var rNewOpera = /(opr)\/(.+)/; //新Opera 基于谷歌
		var rChrome = /(chrome)\/([\w.]+)/; //谷歌 
		var rUC = /(chrome)\/([\w.]+)/; //UC
		var rMaxthon = /(chrome)\/([\w.]+)/; //遨游
		var r2345 = /(chrome)\/([\w.]+)/; //2345
		var rQQ = /(chrome)\/([\w.]+)/; //QQ
		//var rMetasr =  /(metasr)\/([\w.]+)/;//搜狗
		var rSafari = /version\/([\w.]+).*(safari)/;
	
		var ua = navigator.userAgent.toLowerCase();
	
	
		var matchBS, matchBS2;
	
		//IE 低版
		matchBS = rMsie.exec(ua);
		if (matchBS != null) {
			matchBS2 = rTrident.exec(ua);
			if (matchBS2 != null) {
				switch (matchBS2[2]) {
					case "4.0":
						return {
							browser: "Microsoft IE",
							version: "IE: 8" //内核版本号
						};
						break;
					case "5.0":
						return {
							browser: "Microsoft IE",
							version: "IE: 9"
						};
						break;
					case "6.0":
						return {
							browser: "Microsoft IE",
							version: "IE: 10"
						};
						break;
					case "7.0":
						return {
							browser: "Microsoft IE",
							version: "IE: 11"
						};
						break;
					default:
						return {
							browser: "Microsoft IE",
							version: "Undefined"
						};
				}
			} else {
				return {
					browser: "Microsoft IE",
					version: "IE:" + matchBS[2] || "0"
				};
			}
		}
		//IE最新版
		matchBS = rEdge.exec(ua);
		if ((matchBS != null) && (!(window.attachEvent))) {
			return {
				browser: "Microsoft Edge",
				version: "Chrome/" + matchBS[2] || "0"
			};
		}
		//UC浏览器					  
		matchBS = rUC.exec(ua);
		if ((matchBS != null) && (!(window.attachEvent))) {
			return {
				browser: "UC",
				version: "Chrome/" + matchBS[2] || "0"
			};
		}
		//火狐浏览器
		matchBS = rFirefox.exec(ua);
		if ((matchBS != null) && (!(window.attachEvent))) {
			return {
				browser: "火狐",
				version: "Firefox/" + matchBS[2] || "0"
			};
		}
		//Oper浏览器					 
		matchBS = rOpera.exec(ua);
		if ((matchBS != null) && (!(window.attachEvent))) {
			return {
				browser: "Opera",
				version: "Chrome/" + matchBS[2] || "0"
			};
		}
		//遨游
		matchBS = rMaxthon.exec(ua);
		if ((matchBS != null) && (!(window.attachEvent))) {
			return {
				browser: "遨游",
				version: "Chrome/" + matchBS[2] || "0"
			};
		}
		//2345浏览器					  
		matchBS = r2345.exec(ua);
		if ((matchBS != null) && (!(window.attachEvent))) {
			return {
				browser: "2345",
				version: "Chrome/ " + matchBS[2] || "0"
			};
		}
		//QQ浏览器					  
		matchBS = rQQ.exec(ua);
		if ((matchBS != null) && (!(window.attachEvent))) {
			return {
				browser: "QQ",
				version: "Chrome/" + matchBS[2] || "0"
			};
		}
		//Safari（苹果）浏览器
		matchBS = rSafari.exec(ua);
		if ((matchBS != null) && (!(window.attachEvent)) && (!(window.chrome)) && (!(window.opera))) {
			return {
				browser: "Safari",
				version: "Safari/" + matchBS[1] || "0"
			};
		}
		//谷歌浏览器
		matchBS = rChrome.exec(ua);
		if ((matchBS != null) && (!(window.attachEvent))) {
			matchBS2 = rNewOpera.exec(ua);
			if (matchBS2 == null) {
				return {
					browser: "谷歌",
					version: "Chrome/" + matchBS[2] || "0"
				};
			} else {
				return {
					browser: "Opera",
					version: "opr/" + matchBS2[2] || "0"
				};
			}
		}
	};
    window.browserData = {
        deviceName : getBrowserName() || "未知",
        OS : getOS() + "-" +getDigits() || "未知操作系统",
		version: "1.0.1",
    };
})(window);
var browser = window.browserData;
export {
	browser
}