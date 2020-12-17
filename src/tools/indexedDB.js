import { Crypto } from "@/tools/crypto"

/**
 *  indexedDB本地缓存消息
 */

export const EchatDB = {
  name: 'echatDB',
  version: 1,
  db: null,
  historyList: {},
  firstMsgId: 1,
  minId: 1,
  groupTableName: 'group',
  msgPrivateTN: 'privatechat_history',//单聊（好友与非好友）消息表
  msgGroupTN: 'goupchat_history',//群消息表
  msgServiceTn: 'servicechat_history',//服务号消息表
  friendTN: 'friend',//好友表
  openDB(userId) {
    // // In the following line, you should include the prefixes of implementations you want to test.

    // window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

    // // DON'T use "var indexedDB = ..." if you're not in a function.
    // // Moreover, you may need references to some window.IDB* objects:
    // window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction || {READ_WRITE: "readwrite"}; // This line should only be needed if it is needed to support the object's constants for older browsers
    // window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
    // // (Mozilla has never prefixed these objects, so we don't need window.mozIDB*)
    return new Promise((resolve, reject) => {
      let indexedDBName = Crypto.encryptByDES(this.name, userId + "1");
      let idName = window.localStorage.getItem('idName');
      if (!idName || idName != indexedDBName) {
        if (idName) {
          // 删除不是当前用户数据库indexedDB
          window.indexedDB.deleteDatabase(idName);
        } else {
          window.indexedDB.deleteDatabase(indexedDBName);
        }
        //有变化时，清空localStorage
        var aspect = Object.keys(window.localStorage)
        for (var i = 0; i < aspect.length; i++) {
          if (aspect[i].substring(0, 7) != "aspect-") {
            window.localStorage.removeItem(aspect[i]);
          }
        }
        window.localStorage.setItem('idName', indexedDBName);
      }


      let request = window.indexedDB.open(indexedDBName, this.version);
      request.onerror = e => {
        console.log(e);
        alert("当前浏览器版本过低，请升级到最新版本！");
        reject();
      };
      request.onsuccess = e => {
        this.db = request.result;
        resolve();
        // this.myGetAll();
        console.log("创建/打开数据库成功。");
        // this.dbCheck(e);
      };
      request.onupgradeneeded = e => {
        this.dbCheck(e);
      };
    })
  },
  dbCheck(e) {
    this.db = e.target.result;
    //删除表
    if (e.oldVersion < this.version) {
      try {
        this.db.deleteObjectStore("chat_history");
      } catch (error) {
        console.error(error);
      }
      try {
        this.db.deleteObjectStore("group_member");
      } catch (error) {
        console.error(error);
      }
      try {
        this.db.deleteObjectStore("history_temp");
      } catch (error) {
        console.error(error);
      }
    }
    let storeNames = this.db.objectStoreNames;
    //deleteObjectStore()//删除表
    //消息DB  ---------start
    if (!storeNames.contains(this.msgPrivateTN)) {
      //单聊消息表创建
      let objectStore = this.db.createObjectStore(this.msgPrivateTN, { autoIncrement: true });
      //创建唯一消息索引
      objectStore.createIndex('sessionIdAndMid', ['userId', 'mId'], { unique: true })
      objectStore.createIndex('userId', 'userId', { unique: false })
      objectStore.createIndex('sessionIdAndType', ['userId', 'bodyType'], { unique: false })
      objectStore.createIndex('sessionIdAndTime', ['userId', 'bodyTime'], { unique: false })//用于定期清理
    }
    if (!storeNames.contains(this.msgGroupTN)) {
      //群聊消息表创建
      let objectStore = this.db.createObjectStore(this.msgGroupTN, { autoIncrement: true });
      //创建唯一消息索引
      objectStore.createIndex('sessionIdAndMid', ['userId', 'mId'], { unique: true })
      objectStore.createIndex('userId', 'userId', { unique: false })
      objectStore.createIndex('sessionIdAndType', ['userId', 'bodyType'], { unique: false })
      objectStore.createIndex('sessionIdAndTime', ['userId', 'bodyTime'], { unique: false })//用于定期清理
    }
    if (!storeNames.contains(this.msgServiceTn)) {
      //服务号消息表创建
      let objectStore = this.db.createObjectStore(this.msgServiceTn, { autoIncrement: true });
      //创建唯一消息索引
      objectStore.createIndex('sessionIdAndMid', ['userId', 'mId'], { unique: true })
      objectStore.createIndex('userId', 'userId', { unique: false })
      objectStore.createIndex('sessionIdAndType', ['userId', 'bodyType'], { unique: false })
      objectStore.createIndex('sessionIdAndTime', ['userId', 'bodyTime'], { unique: false })//用于定期清理
    }
    //消息DB  ---------end

    //群信息DB--------start
    //群成员DB
    if (!storeNames.contains('group_member')) {
      let objectStore = this.db.createObjectStore('group_member', { autoIncrement: true });
      //创建唯一群成员索引
      objectStore.createIndex('goupIdAndUserId', ['groupId', 'userId'], { unique: true })
      objectStore.createIndex('groupId', 'groupId', { unique: false })
    }
    if (!storeNames.contains(this.groupTableName)) {
      this.db.createObjectStore(this.groupTableName, { keyPath: "groupId" });
    }
    //群信息DB--------end
    //好友DB
    if (!storeNames.contains(this.friendTN)) {
      let objectStore = this.db.createObjectStore(this.friendTN, { keyPath: "userId" });
      objectStore.createIndex('state', 'state', { unique: false })//用于区分好友与陌生人
    }

    //临时会话
    if (!storeNames.contains('history_temp')) {
      this.db.createObjectStore('history_temp', { keyPath: "userId" });
    }

    console.log('DB version changed to ' + this.version);
  },
  /**
   * 兼容不支持.getAll方法的浏览器
   */
  myGetAll() {
    if (typeof IDBObjectStore.prototype.getAll != 'function') {
      IDBObjectStore.prototype.getAll = function (params) {
        var request = {};

        var req = this.openCursor(params);
        req.onerror = function (evt) {
          if (typeof request.onerror == 'function') {
            request.onerror(evt);
          }
        };

        var rst_values = [];
        req.onsuccess = function (evt) {
          if (typeof request.onsuccess == 'function') {
            var cursor = event.target.result;
            if (cursor) {
              rst_values.push(cursor.value);
              cursor.continue();
            } else {
              request.result = rst_values;
              evt.target.result = rst_values;
              request.onsuccess(evt);
            }
          }
        }
        return request;
      }
    }
  },


  /**
   * 插入临时消息
   * @param { userId } 好友/群聊ID
   * @param { record } 聊天消息
   *  @param { mId } 聊天临时id
   * @returns 
   */
  insertTempMsg(userId, record) {
    if (!record) return;

    let stores = this.db.transaction('history_temp', 'readwrite')
      .objectStore('history_temp');
    let request = stores.get(userId);

    request.onsuccess = event => {
      let data = {
        userId: +userId
      };

      if (!event.target.result) {
        let obj = {};
        obj[record.createTime] = record;
        data.record = obj;

        this.db.transaction("history_temp", 'readwrite')
          .objectStore("history_temp")
          .add(data);

      } else {
        let recordObj = event.target.result.record;
        recordObj[record.createTime] = record;
        data.record = recordObj;
        if (data.record) {
          stores.put(data);
        }
      }

      setTimeout(() => {
        this.updateTempMsg(userId, record.createTime, 2);
      }, 20 * 1000);
    };
  },
  readTempMsg(user) {
    return new Promise((resolve, reject) => {
      let request = this.db.transaction("history_temp", 'readwrite')
        .objectStore("history_temp")
        .get(+user.paramId);

      request.onsuccess = event => {
        if (event.target.result && JSON.stringify(event.target.result.record) != "{}") {
          try {
            let obj = event.target.result.record,
              list = {},
              mIdStr = '',
              time = '',
              minMsgId = '';

            if (Object.keys(this.historyList).length >= 30) {
              minMsgId = user.mId - 29 + '';
              time = this.historyList[minMsgId].bodyTime;
            } else {
              minMsgId = user.mId + 1 - Object.keys(this.historyList).length + '';
              time = this.historyList[minMsgId].bodyTime;
            }

            for (let key in obj) {
              if (time >= key) {
                mIdStr = mIdStr + key + ",";
              } else {
                let isSend = false;

                for (let k in this.historyList) {
                  if (this.historyList[k].createTime && this.historyList[k].createTime == key) {
                    isSend = true;
                    continue;
                  }
                }

                if (isSend) {
                  mIdStr = mIdStr + key + ",";
                } else {
                  obj[key].loading = 2;
                  list[obj[key].createTime] = obj[key];
                }
              }
            }

            this.deleteTempMsg(+user.paramId, mIdStr);

            resolve(list);
          } catch (error) {
            resolve({});
          }
        } else {
          resolve({});
        }
      }
    })
  },
  deleteTempMsg(userId, mId) {
    let stores = this.db.transaction('history_temp', 'readwrite')
      .objectStore('history_temp');
    let data = {
      userId: +userId
    };
    let request = stores.get(userId);

    request.onsuccess = event => {
      if (event.target.result) {
        let obj = event.target.result.record;
        let arr = mId.split(',');

        arr.forEach(v => {
          if (obj[v]) delete obj[v];
        })

        data.record = obj;
        stores.put(data);
      }
    };
  },
  updateTempMsg(userId, mId, status) {
    let stores = this.db.transaction('history_temp', 'readwrite')
      .objectStore('history_temp');
    let data = {
      userId: +userId
    };
    let request = stores.get(userId);

    request.onsuccess = event => {
      if (event.target.result) {
        let obj = event.target.result.record;

        if (!obj[mId]) return;

        obj[mId].loading = status;
        data.record = obj;
        stores.put(data);
      }
    };
  }
}