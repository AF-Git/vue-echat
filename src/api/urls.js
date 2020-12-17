import { Config } from "@/common/config"
/*----- 好友模块 -----*/
export const LOG_OUT = Config.baseUrl + '/imweb/user/logout.htm'  //退出登录 
export const SEARCH_INFO = Config.baseUrl + '/imscweb/api/searchInfo.htm' //查询用户信息
export const GET_FRIEND_INFO = Config.baseUrl + '/imscweb/friends/get.htm' //获取指定好友

export const ADD_FRIEND = Config.baseUrl + '/imscweb/friends/add.htm' //添加好友
export const GET_FRIEND_LIST = Config.baseUrl + '/imscweb/friends/list.htm' //获取好友列表
// export const GET_NEW_FRIEND = Config.baseUrl + '/imscweb/friends/verifyListI.htm' //获取新好友请求
export const GET_NEW_FRIEND = Config.baseUrl + '/imscweb/friends/verifyList.htm' //获取新好友请求
export const FRIEND_VERIFY = Config.baseUrl + '/imscweb/friends/verify.htm' //处理新好友请求
export const GET_VERIFY_DETAIL = Config.baseUrl + '/imscweb/friends/verifyDetail.htm' //好友请求详情
export const SET_REMARK = Config.baseUrl + '/imscweb/friends/setConfSetting.htm' // 添加好友备注
export const SET_FRIEND_SETTING = Config.baseUrl + '/imscweb/friends/setConfSetting.htm' // 修改好友设置
export const DELETE_FRIEND = Config.baseUrl + '/imscweb/friends/del.htm' // 删除好友
export const GET_BLACK_LIST = Config.baseUrl + '/imscweb/blacklist/getUserBlackList.htm' //获取好友黑名单
export const ADD_BLACK_LIST = Config.baseUrl + '/imscweb/blacklist/addUserBlack.htm' // 添加黑名单
export const REMOVE_BLACK_LIST = Config.baseUrl + '/imscweb/blacklist/removeUserBlack.htm' // 移出黑名单
export const GET_TEMP_FRIEND_INFO = Config.baseUrl + '/imscweb/imMsg/getSession.htm' // 获取临时会话好友信息
export const ADD_FRIEND_SHARE = Config.baseUrl + '/imscweb/friends/coerceAdd.htm' // 直接添加好友
export const GET_FRIEND_CONF_SETTING = Config.baseUrl + '/imscweb/friends/getConfSetting.htm' // 获取好友配置信息{userId: 1002649,isSecretChat: 0,cleanMsgCycle: "0"}


/*----- 群聊模块 -----*/
export const CREATE_GROUP = Config.baseUrl + '/imscweb/group/create.htm' // 创建群聊
export const JOIN_GROUP = Config.baseUrl + '/imscweb/group/agreeToJoin.htm' //同意好友邀请进群
export const GET_GROUP_LIST = Config.baseUrl + '/imscweb/group/list.htm' //获取群列表
export const GET_GROUP_MEMBER = Config.baseUrl + '/imscweb/group/listUser.htm' //获取群成员列表
export const GET_GROUP_SETTING = Config.baseUrl + '/imscweb/group/getGroupSettingV2.htm' //获取群设置
export const SET_GROUP_SETTING = Config.baseUrl + '/imscweb/group/setGroupSetting.htm' //群设置
export const INVITE_GROUP_USER = Config.baseUrl + '/imscweb/group/inviteUser.htm' //邀请用户进群
export const INVITATION_AGREE_JOIN = Config.baseUrl + '/imscweb/group/invitationAgreeJoin.htm' //邀请同意进群
export const DELETE_GROUP_USER = Config.baseUrl + '/imscweb/group/delUser.htm' //删除群成员
export const GET_GROUP_AFFICHE = Config.baseUrl + '/imscweb/group/getGroupAffiche.htm' //获取群公告
export const SET_GROUP_AFFICHE = Config.baseUrl + '/imscweb/group/addGroupAffiche.htm' //添加群公告
export const DELETE_GROUP_AFFICHE = Config.baseUrl + '/imscweb/group/deleteGroupAffiche.htm' //删除群公告
export const USER_QUIT = Config.baseUrl + '/imscweb/group/userquit.htm' // 退出群聊
export const DELETE_GROUP = Config.baseUrl + '/imscweb/group/del.htm' // 删除群聊
export const GET_ALL_GROUP_SETTING = Config.baseUrl + '/imscweb/group/getBatchGroupSettingV2.htm' //批量获取群设置
export const GET_MEMBER_INFO = Config.baseUrl + '/imscweb/group/getMemberInfo.htm' //获取指定群指定成员信息
export const GET_USER_BY_ALIAS = Config.baseUrl + '/imscweb/api/findUserByAlias.htm' //用户名获取ID
export const TEMP_SESSION = Config.baseUrl + '/imscweb/imMsg/setSession.htm' // 群成员临时会话
export const SET_GROUP_ADMIN = Config.baseUrl + '/imscweb/group/setGroupAdmin.htm' // 设置、取消群管理员
export const TRANSFER_GROUP = Config.baseUrl + '/imscweb/group/transferGroup.htm' // 转让群
export const FORBIDDEN_WORD = Config.baseUrl + '/imscweb/group/addGroupBannedSends.htm' // 群聊禁言设置
export const GET_MEMBER_APPLY = Config.baseUrl + '/imscweb/group/getMemberApply.htm' // 获取进群申请信息
export const AUDIT_MEMBER_APPLY = Config.baseUrl + '/imscweb/group/auditMemberApply.htm' // 管理员或者群主审核进群
export const GET_GROUP_USER = Config.baseUrl + '/imscweb/group/getGroupUser.htm' // 查找群成员
export const USER_JOIN_GROUP = Config.baseUrl + '/imscweb/group/joinUser.htm' // 直接进群
export const GET_ALIASLIST = Config.baseUrl + '/imscweb/api/findUserListByAlias.htm' //通过别名查找用户列表
/*----- 消息模块 -----*/
export const GET_SESSION_LIST = Config.baseUrl + '/imscweb/imMsg/getSessionList.htm' //获取会话列表
export const SET_SESSION_READID = Config.baseUrl + '/imscweb/imMsg/setSessionReadId.htm' //设置最后未读消息ID
export const GET_MESSAGE_LIST = Config.baseUrl + '/imscweb/imMsg/getMsgMinId.htm' //获取聊天记录
export const GET_ORDER_LIST = Config.baseUrl + '/imscweb/imMsg/getMsg.htm' //获取指令记录
export const EDIT_MESSAGE = Config.baseUrl + '/imscweb/imMsg/editMsg.htm' //编辑消息
export const WITHDRAW_MESSAGE = Config.baseUrl + '/imscweb/imMsg/revokeMsg.htm' //撤回消息
export const DELETE_MESSAGE = Config.baseUrl + '/imscweb/imMsg/delSessionCodeMsg.htm' //删除消息
export const RTC_MESSAGE = Config.baseUrl + '/imrtcweb/nfrtc/rtc.htm' //发送回执/接收消息
export const SEND_MESSAGE = Config.baseUrl + '/imrtcweb/nfrtc/send.htm' //发送消息
export const GET_READED_NUM = Config.baseUrl + '/imscweb/groupMsg/getReadNumWeb.htm' //获取群发送最后一条消息已读详情
export const GET_READED_LIST = Config.baseUrl + '/imscweb/groupMsg/readerList.htm' //获取群发送最后一条消息已读详情
export const REMOVE_SESSION = Config.baseUrl + '/imscweb/imMsg/removeSession.htm' //移除某个会话
export const ADD_COPY_RECORD = Config.baseUrl + '/imscweb/imMsg/addCopyChatMessage.htm' //上传复制消息记录
export const GET_RECORD_LIST = Config.baseUrl + '/imscweb/imMsg/getCopyChatMessageList.htm' //获取复制消息记录

/*----- 表情包模块 -----*/
export const EMOJI_lIST = Config.baseUrl + '/emojiweb/expression/getMyExpressionPackage.htm' //表情包列表
export const EMOJI_DETAIL = Config.baseUrl + '/emojiweb/expression/getExpressionDetials.htm' //表情包详情
export const LOAD_EMOJI =Config.baseUrl + '/emojiweb/expression/hotDoorEmoji.htm' //获取第三方表情
export const ADD_EMOJI =Config.baseUrl + '/emojiweb/expression/addExpressionPackage.htm'  //添加表情包
export const DELETE_EMOJI =Config.baseUrl + '/emojiweb/expression/deleteMyExpressionPackage.htm' //删除表情包
export const UPDATE_EMOJI =Config.baseUrl + '/emojiweb/expression/updateMySort.htm' //重新排序表情包

/*----- 音视频模块 -----*/
export const START_COMMUNICATION = Config.baseUrl + '/imscweb/communication/videoOrVoice.htm' //发起音视频通话
export const CHANGE_COMMUNICATION = Config.baseUrl + '/imscweb/communication/hangUp.htm' //音视频通话操作
export const SWITCH_TO_AUDIO = Config.baseUrl + '/imscweb/communication/cutCommunication.htm' //切换到语音通话
export const CHECK_COMMUNICATION = Config.baseUrl + '/imscweb/communication/checkCommunication.htm' //保持通话状态

/*----- 个人设置 -----*/
export const SET_NICKNAME = Config.baseUrl + '/imweb/personal/setnickname.htm' //修复昵称
export const SET_ALIAS = Config.baseUrl + '/imscweb/api/setAlias.htm' //设置用户名
export const SET_GENDER = Config.baseUrl + '/imweb/personal/setgender.htm' //修复性别
export const SET_SIGNATURE = Config.baseUrl + '/imweb/personal/setsignature.htm' //修改个性签名
export const SET_AREA = Config.baseUrl + '/imweb/personal/setarea.htm' //修改地区编码

/*----- 其他 -----*/
export const GET_USER_SETTING = Config.baseUrl + '/imscweb/api/getUserSetting.htm' //获取 消息通知配置
export const SET_USER_SETTING = Config.baseUrl + '/imscweb/api/setUserSetting.htm' //获取 消息通知配置
export const UPLOAD_FILE = Config.baseUrl + '/imfileweb/fileShare/initFileChannel.htm' // 上传文件
export const ADD_FEEDBACK = Config.baseUrl + '/imscweb/help/addHelpFeedbackInfo.htm' // 意见反馈
export const ADD_FAVORITES = Config.baseUrl + '/imscweb/collection/add.htm' //添加收藏
export const DELETE_FAVORITES = Config.baseUrl + '/imscweb/collection/del.htm' //删除收藏
export const GET_FAVORITES = Config.baseUrl + '/imscweb/collection/getList.htm' //收藏列表
export const GET_FAVORITES_DETAIL = Config.baseUrl + '/imscweb/collection/getDetail.htm' //收藏详情
export const SHARE_URL = Config.baseUrl + '/shareweb/shortUrl/identifying' // 获取分享链接 '/shareweb/shortUrl/identifying'

/*----- 服务号 -----*/
export const SET_SERVICE_SETTING = Config.baseUrl + '/imscweb/serviceAccount/setConf.htm' //获取 消息通知配置