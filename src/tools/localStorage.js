import store from "../store";
import { Crypto } from "@/tools/crypto" 

export const localStore = {
  setStore(name, content) {
    if (!name) return;
    if (typeof content !== "string") {
      content = JSON.stringify(content);
    }
    name = Crypto.encryptByDES(name, store.getters.userId);
    window.localStorage.setItem(name, content);
  },
  getStore(name) {
    if (!name) return;
    name = Crypto.encryptByDES(name, store.getters.userId);
    return window.localStorage.getItem(name);
  },
  removeStore(name) {
    if (!name) return;
    name = Crypto.encryptByDES(name, store.getters.userId);
    window.localStorage.removeItem(name);
  },
  updateLastOrder(type, id) {
    let order = this.getStore("lastOrder_" + store.getters.userId);
    if (order) {
      order = JSON.parse(order);
      order[type] = id;
    } else {
      order = {
        isTop: 0,
        edit: 0,
        delete: 0
      };
      order[type] = id;
    }
    this.setStore("lastOrder_" + store.getters.userId, order);
  },
  readLastOrder(type) {
    let order = this.getStore("lastOrder_" + store.getters.userId);
    if (order) {
      order = JSON.parse(order);
      return order[type];
    } else {
      return 0;
    }
  },

  updateInviterCode(gId, content, type) {
    let inviter = this.getStore("inviterCode_" + store.getters.userId);
    content.show = true;
    if (inviter) {
      inviter = JSON.parse(inviter);
      let arr = inviter[gId];
      if (type == "add") {
        arr.push(content);
      } else {
        arr.shift();
      }

      inviter[gId] = arr;
    } else {
      let arr = [],
        obj = {};
      arr.push(content);
      obj[gId] = arr;
      inviter = obj;
    }
    this.setStore("inviterCode_" + store.getters.userId, inviter);
  },
  updateInviterState(gId) {
    let inviter = this.getStore("inviterCode_" + store.getters.userId);

    if (inviter) {
      inviter = JSON.parse(inviter);

      if (!inviter[gId]) return;

      let arr = inviter[gId];

      for (let i = 0; i < arr.length; i++) {
        arr[i].show = false;
      }

      inviter[gId] = arr;
      this.setStore("inviterCode_" + store.getters.userId, inviter);
    }
  },
  readInviterCode(gId) {
    let inviter = this.getStore("inviterCode_" + store.getters.userId);

    if (inviter) {
      inviter = JSON.parse(inviter);
      return inviter[gId] ? inviter[gId] : [];
    } else {
      return [];
    }
  },
  updateRegularCleaning(id, content) {
    let cycle = this.getStore("regularCleaning_" + store.getters.userId);
    if (cycle) {
      cycle = JSON.parse(cycle);
      cycle[id] = content;
    } else {
      let obj = {};
      obj[id] = content;
      cycle = obj;
    }
    this.setStore("regularCleaning_" + store.getters.userId, cycle);
  },
  readRegularCleaning(id) {
    let cycle = this.getStore("regularCleaning_" + store.getters.userId);

    if (cycle) {
      cycle = JSON.parse(cycle);
      return cycle[id] ? cycle[id] : {};
    } else {
      return {};
    }
  },
  setCopyMsg(title, text, ids) {
    let obj = {
      title: title,
      msgText: text,
      msgList: ids,
      time: Date.now()
    };
    this.setStore("copyMsg", obj);
  },
};
