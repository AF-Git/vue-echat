import Vue from 'vue'
import * as types from './mutation-types'
import { sessionUtil } from "@/session/sessionUtil";

export default {
  [types.SET_LANG](state, payload) {
    state.lang = payload;
  },
  [types.SET_USER_INFO](state, payload) {
    state.userInfo = payload;
  },
  [types.SET_USER_TOKEN](state, payload) {
    state.token = payload;
  },
  [types.SET_ROUTE_NAME](state, payload) {
    state.routeName = payload;
  },
  [types.SET_VIDEOCLOSE](state, payload) {
    state.videoclose = payload;
  },
  [types.SET_RIGHT](state, payload) {
    state.right = payload;
  },
  [types.SET_GROUP_LIST](state, payload) {
    state.groupList = payload;
  },
  [types.DEL_GROUP_LIST](state,gId) {
    Vue.delete(state.groupList, gId)
  },
  [types.SET_FRIEND_LIST](state, payload) {
    state.friendList = payload;
  },
  [types.SET_IS_TYPING](state, payload) {
    for (var key in payload) {
      let cache=payload[key];
      state.isTyping[key] = cache;
    }
  },
  [types.ADD_FRIEND_INFO](state, {userId, info}) {
    Vue.set(state.friendList, userId, info)
  },
  [types.DEL_FRIEND_INFO](state,userId) {
    Vue.delete(state.friendList, userId)
  },
  [types.SET_GROUP_MEMBER](state,data) {
    state.activityGroupMembers=data;
  },

  [types.UPDATA_MEMBER_INFO](state, {id, info }) {
    Vue.set(state.activityGroupMembers, id, info)
  },
  
  [types.SET_RECORD](state, payload) {
    state.record = payload;
  },
  setSession(state, payload) {
    delete payload['undefined-undefined'];
    state.session ={
      v:0,
      record:payload
    }
    // state.session = payload;
  },
  [types.UPDATE_SESSION_BATCH](state, payload) {
    state.session.v=state.session.v+1;
    delete payload['undefined-undefined'];
    Vue.set(state.session, 'record', payload);
    sessionUtil.setSessionListLocalStore(state.session.record);
  },
  [types.UPDATE_SESSION](state, payload) {
    let cache=state.session.record[payload.paramId+'-'+payload.fromType];
    if(cache){
      if(cache.lastReadId>payload.lastReadId){
        payload.lastReadId=cache.lastReadId;
        payload.unreadNum=cache.mId-cache.lastReadId<0?0:cache.mId-cache.lastReadId;
      }
    }
    Vue.set(state.session.record, payload.paramId+'-'+payload.fromType, payload);
    sessionUtil.setSessionListLocalStore(state.session.record);
  },
  [types.DELETE_SESSION](state, payload) {
    Vue.delete(state.session.record, payload);
    sessionUtil.setSessionListLocalStore(state.session.record);
  },
  [types.UPDATE_CURRENT_SESSION](state, payload) {
    if (state.currentSession.paramId) {
      state.currentSession = payload;
    } else {
      state.currentSession = {
        paramId: 1
      };
      setTimeout(() => {
        state.currentSession = payload;
      }, 200);
    }
  },

  [types.ADD_MESSAGE](state, payload) {
    if(payload.constructor==Array){
      for (var key in payload) {
        let cache=payload[key];
        Vue.set(state.message, cache.mId, cache)
      }
    }else{
      for (var key in payload) {
        Vue.set(state.message, key, payload[key])
      }
    }
    
  },
  [types.UPDATE_MESSAGE](state, payload) {
    let message = state.message[payload.mId];
    if (message){
      payload.bodyTime = message.bodyTime;
      payload.createTime = message.createTime;
    }
    Vue.set(state.message, payload.mId, payload);
  },
  /**
   * 更新已读
   * @param {*} state 
   * @param {*} payload 
   */
  [types.UPDATE_MESSAGE_READ](state, payload) {
    Vue.set(state.message, payload.mId, payload);
  },
  [types.DELETE_MESSAGE](state, payload) {
    Vue.delete(state.message, payload);
  },
  [types.CLEAR_MESSAGE](state, payload) {
    state.message = payload;
  },
  [types.SET_LAST_GROUP_MSG](state, payload) {
    state.lastGroupMsg = payload;
  },
  [types.SET_UNREAD_NUMBER](state, payload) {
    for (let item in payload) {
      state.redPoint[item] = payload[item];
    }
  },
  [types.SET_DELETE_INFO](state, payload) {
    state.deleteInfo = payload;
  },
  [types.SET_FORWARD_INFO](state, payload) {
    state.forwardInfo = payload;
  },
  [types.SET_MYEMOJI](state, payload) {
    state.myemoji = payload;
  },
  [types.SET_INVITE](state, payload) {
    state.invite = payload;
  },
  [types.UPDATE_VIDEO_INFO](state, payload) {
    state.videoInfo = payload;
  },
  [types.SET_BUBBLES](state, payload) {
    state.bubbles = payload;
  },
  [types.ADD_VIDEO_VIEW](state, payload) {
    Vue.set(state.viewList, payload, payload)
  },
  [types.DELETE_VIDEO_VIEW](state, payload) {
    Vue.delete(state.viewList, payload)
  },
  [types.MUTE_VIDEO](state, payload) {
    state.muteVideo = payload;
  },

  [types.SET_MOUSE_RIGHT_MSG](state, payload) {
    state.mouseRightInfo = payload;
  },
  [types.SET_TOAST_TEXT](state, payload) {
    state.toastText = payload;
  },
  [types.SET_BACKURL](state, payload) {
    state.backurl = payload;
  },
  [types.SET_CROWDTOAST_TEXT](state, payload) {
    state.crowdtoastText = payload;
  },
  [types.SET_NOTICE_SETTING](state, payload) {
    state.notice = payload;
  },

  [types.ADD_UPLOAD_LIST](state, payload) {
    state.uploadInfo.push(payload);
  },
  [types.DELETE_UPLOAD_LIST](state, payload) {
    if (payload) {
      state.uploadInfo.splice(payload, 1)
    } else {
      state.uploadInfo.shift();
    }
  },
  [types.UPDATE_PROGRESS](state, payload) {
    state.progress = payload;
  },
  [types.SET_AT](state, { groupId, mId }) {
    if (state.atList[groupId]) {
      if (typeof mId == 'string') {
        state.atList[groupId].push(mId)
      } else {
        state.atList[groupId] = mId;
      }
    } else {
      if (typeof mId == 'string') {
        Vue.set(state.atList, groupId, [mId]);
      }
    }
  },
  [types.SET_AFFICHE](state, { groupId, body }) {
    if (state.affiche[groupId]) Vue.delete(state.affiche, groupId);
    Vue.set(state.affiche, groupId, body)
  },
  [types.DELETE_AFFICHE](state, payload) {
    Vue.delete(state.affiche, payload);
  },
  [types.SET_BLACK_LIST](state, payload) {
    state.blackList = payload;
  },
  [types.SET_HAS_CURRENT_MSG](state, payload) {
    state.hasCurrentMsg = payload;
  },
  [types.SET_AT_OBJ](state, payload) {
    state.atObj = payload;
  },
  [types.SET_GROUP_INVITE](state, payload) {
    state.groupInvite = payload;
  },
  [types.SET_LOGIN_FAIL](state, payload) {
    state.loginFail = payload;
  },
  [types.SET_LAYOUT](state, payload) {
    if (state.layout.module == "gp-inf" && payload[0] == "mr") {
      state.layout.child = "mr";
    } else {
      state.layout.module = payload[0];
      state.layout.child = payload[1];
    }
    state.layout.mask = payload[2];
  },
};