import CryptoJS from "crypto-js";
import { Config } from "@/common/config" 

export const Crypto = {
  /**
   * 检查并补充加密串长度至少8位
   * @param { string } str 需要操作的字符串
   * @returns { string } 处理后的字符串
   */
  checkKey(value) { 
    if (!value) {
      value = Config.publicSecret;
    }
    
    value += "";
    var str = "";
    if (value.length < 8) {
      for (var i = 0; i < 8 - value.length; i++) {
        str += "0";
      }
      str += value;
      return str;
    }
    return value;

  },
  /**
   * DES 解密
   * @param { string } str 需要操作的字符串
   * @param { string } key 字符串密钥（不传自动使用配置密钥）
   * @returns { string } 解密后的字符串
   */
  decryptByDES(str, key) { // DES 解密
    //DES 解密
    key = this.checkKey(key);
    str = str.replace(/\s*/g, "");
    var keyHex = CryptoJS.enc.Utf8.parse(key);
    var decrypted = CryptoJS.DES.decrypt({
        ciphertext: CryptoJS.enc.Base64.parse(str)
      },
      keyHex, {
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
        iv: CryptoJS.enc.Latin1.parse("12345678")
      }
    );
    return decrypted.toString(CryptoJS.enc.Utf8);
  },
  /**
   * DES 加密
   * @param { string } str 需要操作的字符串
   * @param { string } key 字符串密钥（不传自动使用配置密钥）
   * @returns { string } 加密后的字符串
   */
  encryptByDES(str, key) { 
    //DES 加密
    key = this.checkKey(key);

    if (typeof str != "string") {
      str += "";
    }

    var keyHex = CryptoJS.enc.Utf8.parse(key);
    var encrypted = CryptoJS.DES.encrypt(str, keyHex, {
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
      iv: CryptoJS.enc.Latin1.parse("12345678")
    });
    return encrypted.toString();
  },
  /**
   * md5 加密
   * @param { string } str 需要操作的字符串
   * @returns { string } 加密后的字符串
   */
  md5(str) { 
    return CryptoJS.MD5(str).toString();
  }
};


