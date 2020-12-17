export const token = state => state.token

export const userId = state => state.userInfo.userId

export const userInfo = state => state.userInfo

export const session = state => state.session

export const currentSession = state => state.currentSession

export const message = state => state.message

export const muteVideo = state => state.muteVideo

export const andioVideoList = state => Object.keys(state.viewList)

export const andioVideoInfo = state => state.videoInfo

export const mouseRightInfo = state => state.mouseRightInfo

export const unReadNum = state => state.redPoint.unReadNum

export const deleteInfo = state => state.deleteInfo

export const forwardInfo = state => state.forwardInfo

export const myemoji = state => state.myemoji

export const progress = state => state.progress

export const atList = state => state.atList

export const lastGroupMsg = state => state.lastGroupMsg

export const invite = state => state.invite

export const blackList = state => state.blackList

export const hasCurrentMsg = state => state.hasCurrentMsg

export const atObj = state => state.atObj

export const verifyGroup = state => state.groupInvite

export const activityGroupMembers = state => state.activityGroupMembers

export const loginFail = state => state.loginFail

export const right = state => state.right

export const layout = state => state.layout

export const videoclose = state => state.videoclose

export const bubbles = state => state.bubbles

export const backurl = state => state.backurl


