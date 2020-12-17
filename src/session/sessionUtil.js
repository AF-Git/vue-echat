import { localStore } from "@/tools/localStorage";
import store from "@/store";
import { Crypto } from "@/tools/crypto" 
export const sessionUtil = {
    /**
     * 会话列表存储
     * @param {json对象} sessionList 
     * data:{
     *      img:
     * lastReadId:
     * mId:
     * fromType
     * msgType--------------
     * name:
     * paramId
     * preview
     * userTime
     * isTop
     * isInterruption
     * isShowMemberNick
     * isBanned
     * isFriend
     * isForbidchat
     * describe------------
     * unreadnum
     * isActivity -----------
     * gtemp--------
     * }
     */
    setSessionListLocalStore(sessionList){
        //深复制
        // let clone=JSON.parse(JSON.stringify(sessionList));
        // console.log(sessionList)
        let clone={};
        delete sessionList['undefined-undefined'];
        for(let key in sessionList){
            let c=sessionList[key];
            clone[key]={
                img:c.img,
                lastReadId:c.lastReadId,
                mId:c.mId,
                alias: c.alias,
                fromType:c.fromType,
                name:c.name,
                paramId:c.paramId,
                preview:c.preview,
                userTime:c.userTime,
                temp:c.temp || false,
                menuBox:c.menuBox || [],
                menuSelect:c.menuSelect || [],
                isTop:c.isTop,
                isInterruption:c.isInterruption,
                isShowMemberNick:c.isShowMemberNick,
                isBanned:c.isBanned,
                isFriend:c.isFriend,
                isForbidchat:c.isForbidchat,
                unreadNum:c.unreadNum,
                draft:c.draft,//草稿
                msgInitialId:c.msgInitialId //消息找回起始ID
            }
        }
        localStore.setStore("sessionList_"+store.getters.userId, clone);
    },    

    /**
     * 获取SessionList对象
     * return JSON对象
     */
    getLocalStoreSessionList(){
        let localList = localStore.getStore("sessionList_"+store.getters.userId);
        if(localList)
            return JSON.parse(localList);
        else
            return {};
    },
    setLocalSessionTime(time){
        localStore.setStore("sessionTime_"+store.getters.userId, time);
    },
    getlocalSessionTime(){
        let sessionTime = localStore.getStore("sessionTime_"+store.getters.userId);
        if(sessionTime){
            return sessionTime;
        }else{
            return 0;
        }
    },
    /**
     * 获取已经更新的group集合
     */
    getGroupUpdateSessionStorage(){
        let localList=this.sessionStorageGetItem("groupUpdate");
        if(localList)
            return JSON.parse(localList);
        else
            return {};
    },
    /**
     * 设置更新的group集合
     * @param {*} data 
     */
    setGroupUpdateSessionStorage(data){
        data = JSON.stringify(data);
        this.sessionStorageSetItem("groupUpdate",data);
    },

    /**
     * 设置新朋友缓存
     * @param {*} data 
     */
    setNewFirendListSessionStorage(data){
        data = JSON.stringify(data);
        this.sessionStorageSetItem("newFriendList",data);
    },
    /**
     * 读取新朋友缓存
     */
    getNewFirendListSessionStorage(){
        let localList=this.sessionStorageGetItem("newFriendList");
        if(localList)
            return JSON.parse(localList);
        else
            return [];
    },
    sessionStorageGetItem(name){
        if (!name) return;
        name = Crypto.encryptByDES(name, store.getters.userId);
        let data=window.sessionStorage.getItem(name);
        if(data){
            data=Crypto.decryptByDES(data,store.getters.userId);
        }
        return data;
    },
    sessionStorageSetItem(name,data){
        if (!name) return;
        name = Crypto.encryptByDES(name, store.getters.userId);
        data = Crypto.encryptByDES(data, store.getters.userId);
        window.sessionStorage.setItem(name,data);
    },
    /**
     * 设置自身表情列表缓存
     * @param {*} data 
     */
    setEmojiListSessionStorage(data){
        data = JSON.stringify(data);
        this.sessionStorageSetItem("emojiList",data);
    },
    /**
     * 读取自身表情列表缓存
     */
    getEmojiListSessionStorage(){
        let localList=this.sessionStorageGetItem("emojiList");
        if(localList)
            return JSON.parse(localList);
        else
            return ;
    },
    /**
     * 设置表情详情
     * @param {*} id 
     * @param {*} value 
     */
    setLocalSessionEmojiDetail(id,value){
        localStore.setStore("emoji_"+id, value);
    },
    /**
     * 获取表情详情
     * @param {*} id 
     */
    getlocalSessionEmojiDetail(id){
        let emojiDetail = localStore.getStore("emoji_"+id);
        if(emojiDetail){
            return JSON.parse(emojiDetail);
        }else{
            return ;
        }
    },
    /**
     * 设置消息找回失败
     * @param {*} value 
     */
    setMsgFindFailLocalSession(value){
        let msgFindArray=this.getMsgFindFailLocalSession();
        if(!msgFindArray){
            msgFindArray=[];            
        }
        msgFindArray.push(value);
        localStore.setStore("msgFindFail", msgFindArray)
    },
    /**
     * 读取消息找回失败
     */
    getMsgFindFailLocalSession(){
        let msgFindArray = localStore.getStore("msgFindFail");
        if(msgFindArray){
            localStore.removeStore("msgFindFail");
            return JSON.parse(msgFindArray);
        }else{
            return ;
        }
    },
}