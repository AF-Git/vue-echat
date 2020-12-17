<template>
  <transition name="pop">
    <div class="display-flex">
      <chat-list ref="chatList" v-model="showLoading"></chat-list>
      <div class="chat-panel" v-if="!currentSession.paramId">
        <div class="defaul-backgroup"></div>
      </div>
      <chat-panel ref="chatHistory" v-else></chat-panel>
    </div>
  </transition>
</template>

<script>
import { mapGetters } from "vuex";
import ChatList from "@/components/ChatList";
import ChatPanel from "@/components/chat-panel";

export default {
  data() {
    return {
      showLoading: true,
    };
  },
  computed: {
    ...mapGetters(["userInfo", "currentSession"])
  },
  components: {
    ChatList,
    ChatPanel
  },
  methods: {

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
