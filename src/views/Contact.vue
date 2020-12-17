<template>
  <transition name="pop">
    <div class="display-flex">
      <friend-list ref="friendList"></friend-list>
      <detail ref="detail" @detailHandler="detailHandler"></detail>
    </div>
  </transition>
</template>

<script>
import { mapGetters } from "vuex";
import FriendList from "@/components/FriendList";
import Detail from "@/components/Detail";

export default {
  data() {
    return {
    };
  },
  computed: {
    ...mapGetters(["userInfo", "currentSession"])
  },
  components: {
    FriendList,
    Detail
  },
  methods: {
    showDetail(item, type) {
      this.$refs.detail.show(item, type);
    },
    //切换聊天窗口
    detailHandler(item) {
      if (item.fromType == 0) {
        item.paramId = item.userId;
      } else {
        item.paramId = item.groupId;
      }
      this.$store.commit("SET_ROUTE_NAME", "chat");
      var chat = this.$store.state.session.record[item.paramId+'-'+item.fromType];
      if (!chat) {
        var newChat = {
          img: item.headImg,
          lastReadId: 0,
          mId: 0,
          fromType: item.fromType,
          msgType: 1,
          preview: "",
          userTime: new Date().getTime()
        };
        if (item.fromType == 0) {
          newChat.name = item.notes || item.nickName || item.userName;
          newChat.paramId = item.userId;
        }
        if (item.fromType == 1) {
          newChat.name = item.groupName;
          newChat.paramId = item.groupId;
        }
        newChat.isActivity=true;
        this.$store.commit("UPDATE_SESSION", newChat);
        this.$store.commit("UPDATE_CURRENT_SESSION", newChat);      
        // setTimeout(() => {
          
        // }, 500);
        return false;
      }else{
        chat.isActivity=true;
        this.$store.commit("UPDATE_CURRENT_SESSION", JSON.parse(JSON.stringify(chat)));
      }
      
      // setTimeout(() => {
      //   chat.isActivity=true;
      //   this.$store.commit("UPDATE_CURRENT_SESSION", JSON.parse(JSON.stringify(chat)));
      // }, 500);
    },
  },
  mounted() {

  }
};
</script>

<style lang="scss" scoped>
@import "../assets/css/var";

.chat-panel {
  position: relative;
  width: 700px;
  height: 661px;
  border-radius: 0 0 2px 0;
}
</style>
