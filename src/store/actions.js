import { actionApi } from "../api";
import Rtc from "@/tools/rtc-message";
import { EchatDB } from "@/tools/indexedDB"; 
import * as types from './mutation-types'
import { Config } from "@/common/config"

import { sessionUtil } from "@/session/sessionUtil";
import store from "@/store";

export const getNewFriends = ({
  commit,
  state
}, payload) => {
  return new Promise((resolve, reject) => {
    actionApi.getNewFriend(payload, res => {
      let newFriendsNum = 0;
      res.data.forEach(item => {
        if (item.avatar) item.headImg =  item.avatar;
        //else item.headImg = "./static/images/chat/img-username.png";
        if (!item.nickName) item.nickName = item.userId;
        if (item.state == 2) newFriendsNum++;
      });
      sessionUtil.setNewFirendListSessionStorage(res.data);
      resolve();
      commit("SET_UNREAD_NUMBER", {
        unReadNum: state.redPoint.unReadNum,
        newFriendsNum: newFriendsNum
      });
    });
  });
};

export const getFriendList = ({
  commit
}, payload) => {
  return new Promise((resolve, reject) => {
    actionApi.getFriendList(payload, data => {
      // commit("SET_FRIEND_LIST", data);
      resolve(data);
    });
  });
};

export const getGroupList = ({
  commit
}, payload) => {
  return new Promise((resolve, reject) => {
    actionApi.getGroupList(payload, data => {
      // commit("SET_GROUP_LIST", data);
      resolve(data);
    });
  });
};

export const getGroupMember = ({
  commit
}, payload) => {
  return new Promise((resolve, reject) => {
    actionApi.getGroupMember(payload, data => {
      let obj = {
        groupId: payload.groupId,
        data: data
      };
      commit("SET_GROUP_MEMBER", data);
      resolve(data);
    });
  });
};

export const getSessionList = ({
  commit
}, payload) => {
  return new Promise((resolve, reject) => {
    actionApi.getSessionList(payload, data => {
      resolve(data);
    });
  });
};

export const setSessionReadId = ({
  commit
}, payload) => {
  return new Promise((resolve, reject) => {
    actionApi.setSessionReadId(payload, data => {
      resolve(data);
    });
  });
};

export const getUserSetting = ({
  commit
}, payload) => {
  actionApi.getUserSetting(payload, data => {
    if (data.newMsgNotice) {
      commit("SET_NOTICE_SETTING", data);
    } else {
      let obj = {
        newMsgNotice: "1",
        sound: "1",
        bar_msg_notice_flag: "1"
      };
      commit("SET_NOTICE_SETTING", obj);
      actionApi.setUserSetting(JSON.stringify(obj));
    }
  });
};

export const getMessageList = ({
  commit
}, payload) => {
  return new Promise((resolve, reject) => {
    actionApi.getMesssageList(payload, data => {
      commit("ADD_MESSAGE", data.list);
      resolve(data);
    });
  });
};

export const getReadNum = ({
  commit
}, payload) => {
  let sId = payload.groupId;
  actionApi.getReadNum(payload, data => {
    if (data) {
      if(sId==store.state.currentSession.paramId&&store.state.currentSession.fromType==1){
        commit("SET_LAST_GROUP_MSG", data);
      }      
    }
  });
};

export const sendMsg = ({
  commit
}, payload) => {
  return new Promise((resolve, reject) => {
    Rtc.messageToXml(payload, () => {
      EchatDB.deleteTempMsg(payload.toId, payload.time + '');
      resolve();
    });
  });
};

export const sendReply = ({
  commit
}, payload) => {
  Rtc.sendMessage(payload);
};

export const getBlackList = ({
  commit
}, payload) => {
  return new Promise((resolve, reject) => {
    actionApi.getBlackList(payload, data => {
      commit("SET_BLACK_LIST", data);
      resolve(data);
    });
  });
};

export const setLoginFail = ({ commit }, payload) => {
  commit(types.SET_LOGIN_FAIL, payload);
};

export const setLayout = ({ commit }, payload) => {
  commit(types.SET_LAYOUT, payload);
};
