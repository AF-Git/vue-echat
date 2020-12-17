import Vue from 'vue'
import Vuex from 'vuex'
import * as getters from './getters'
import * as actions from './actions'
import mutations from './mutations'

Vue.use(Vuex)

const state = {
  userInfo: {},//登录用户信息
  lang: {},//用户使用语言
  token: "",
  socketFail: false,
  routeName: 'chat',
  groupList: {},//群缓存
  friendList: {},//好友缓存
  atList: {},
  affiche: {},//置顶公告
  isTyping: {
    status:false,
    type:'0'
  },
  redPoint: {
    unReadNum: 0,
    newFriendsNum: 0,
  },
  notice:{
    newMsgNotice: 1,
    sound: 1,
    bar_msg_notice_flag: 1,
  },
  //气泡颜色
  bubbles:{
    mybackground:"",
    adversebackground:""
  },
  //背景图路径
  backurl:{
    uri:"",
    isdim:""
  },
  uploadInfo: [],
  progress: {},
  message: {},
  record: [],
  /** session数据结构 {
   * v:0,//版本
   * record:{}//数据
   * }*/
  session: {v:0,'record':{}},
  currentSession: {},//当前聊天窗口信息
  mouseRightInfo: {},
  videoInfo: {},
  viewList: {},
  muteVideo: false,
  toastText: "",
  crowdtoastText:"",
  forwardInfo: {
    show: false,
    body: []
  },
  myemoji:{
    show:false,
    myemojilist:[],
    emojiList:[],
    emojiPage:null
  },
  right:{
    show:false,
  },
  deleteInfo: {
    show: false,
    ids: '',
    idsArr: []
  },
  lastGroupMsg: {
    msgId: 0,
    readNum: 0
  },
  invite: {
    show: false,
    groupId: ''
  },
  videoclose:false,
  blackList: {},//黑名单列表
  hasCurrentMsg: false,
  atObj: {},
  groupInvite: {},
  activityGroupMembers:{},//当前打开会话群-群成员
  activityComponents:{},//当前打开组件对象{name:,value:对象}
  loginFail: false, // 登录失效
  layout: {         //全局弹窗控制
    module: "",       // 模块名称  vv-音视频  uc-个人中心 cp-聊天窗口 inf-好友群聊信息 gmi-群成员资料
    child: "",        // 模块里面的模块或者模块需要的数据
    mask: false   // 是否隐藏遮罩
  }
}

export default new Vuex.Store({
  state,
  getters,
  actions,
  mutations
})