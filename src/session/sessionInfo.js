import { group } from "@/session/group";
import { service } from "@/session/service";
import { friend } from "@/session/friend";
import store from "@/store";
/**
 * 会话基础信息获取
 */
export const sessionInfo = {
    /**
     * 获取会话信息
     * @param {int} fromType 会话类型  0-单聊 1-群聊 2-服务号 3-
     * @param {int} sessionId 会话ID
     * @param {int} memberId 群成员ID
     */
    getChatInfo(fromType,sessionId,memberId){
        fromType=Number(fromType);
        sessionId=Number(sessionId);
        return new Promise(resolve => {
            if(fromType==0){
                //单聊消息
                if (sessionId == store.getters.userId) {
                    let info = store.getters.userInfo;
                    info.nickName = info.nickName || info.userName;
                    return resolve(info);
                  }
                friend.getChatInfo(sessionId).then(data=>{
                    resolve(data);
                });
            }else if(fromType==1){
                //群聊消息
                group.getChatInfo(sessionId,memberId).then(data=>{
                    resolve(data);
                });
            }else if(fromType==2){
                //服务号消息
                return resolve(service.getChatInfo(sessionId));
            }else{
            }
        })
    },
}