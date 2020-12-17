<template>
  <div class="myemojibox" @click="close">
  <div class="dialo" @click.stop=";">
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane :label="$t('msg.emojishow.MyStickers')" name="first">
          <ul v-scrollBar style="position:relative;height:560px"> 
                <div class="hot-emoji display-flex color-box" v-for="obj in myemoji.myemojilist" :key="obj.id"  v-dragging="{ list: myemoji.myemojilist, item: obj}">
                  <div class="control">
                    <img src="../../assets/images/drag.png" style="width:16px; height:12px">
                  </div>
                  <div class="img"><img :src="global.fileDownUrl + 'compress/'+obj.bqbCoverUrl"  style="width:50px; height:50px"></div>
                  <div  class="emoji-box display-flex">
                    <div class="content">{{obj.bqbName}}</div>
                    <a href="javascript: ;" class="delete"  @click.stop="delEmoji(obj.bqbId,obj.bqbName)">
                      <img src="../../assets/images/del-emoji.png" style="width:18px; height:22px; margin-right:15px">
                    </a>
                  </div>
                </div>
                </ul>
      </el-tab-pane>
      <el-tab-pane :label="$t('msg.emojishow.Trending')" name="second">
      <ul style="height:560px;position:relative"  v-scrollBar>
      <li class="hot-emoji display-flex" v-for="(item,idx) in list" :key="idx">
				<div class="emoji-img" style="margin-left:20px">
					<img class="img" :src="global.fileDownUrl + 'compress/'+item.bqbCoverUrl" style="width:50px; height:50px ">
				</div>
				<div  class="emoji-box display-flex">
				<div class="hotemoji-text">
					{{item.bqbName}}
				</div>
					<div>
						<span class="myemoji-icon success" v-if="item.download==1"></span>	
            <span class="myemoji-icon wait" v-else-if="item.download==2"></span>	
						<span class="myemoji-icon" @click.stop="addEmoji(item.bqbId,idx)" v-else></span>
					</div>
				</div>
			</li>
      </ul>
      </el-tab-pane>
    </el-tabs>
    <div class="my-popup deldialo-box" v-show="emojidel">
      <div class="deldialo" >
      <div class="text">{{$t("msg.emojishow.ifRemove")}}《<span>{{delname}}</span>》？</div>
      <div class="judge">
        <a class="cancel" href="javascript: ;" @click="emojidel=false">{{$t("msg.emojishow.Cancel")}}</a>
        <a class="confirm" href="javascript: ;" @click="delEmojiconfirm()" >{{$t("msg.emojishow.Remove")}}</a>
      </div>
      </div>
    </div>
  </div>
  </div>
</template>
<script>
import Vue from "vue";
import { mapGetters } from "vuex";
export default {

    data() {
      return {
        activeName:"first",
        list:[],
        pageNum: 0,
        pageSize: 20,
        myemoji2:[],
        emojiList2:[],
        delname:[],
        delid:[],
        emojidel:false
      }
    },
    methods:{
      close(e){
        // e.stopPropagation()
        this.myemoji.show = false
      },
      handleClick(tab, event) {
      if(tab.index=="0"){ 
      this.gainemojiList()
      }
      if(tab.index=="1"){
          let obj = {
          pageNum: this.pageNum,
          pageSize: this.pageSize,
          isSystem: 0
        } 
        this.$http.loadEmoji(obj).then(
          data => {  
          this.changeState(data.list)
          },() => {}
        )
    }
  },
   changeState(list){
      let last = this.pageNum==0?0:this.pageSize-this.pageNum*20;
      for(let j=last;j<list.length-last;j++){
        for(let i=0;i<this.myemoji.emojiList.length;i++){
          if(list[j].bqbId==this.myemoji.emojiList[i].bqbId) {
            list[j].download = 1;
          }else{
            if(!list[j].download){
              list[j].download = 0;
            }
          }
        }
      }
      this.list = list;
    },
    addEmoji(id,idx){
      this.list[idx].download=2
      let obj ={bqbId:id} 
      this.$http.addEmoji(obj).then(
      data=>{
          data.bqbCoverUrl =  data.bqbCoverUrl;
          this.myemoji.myemojilist.unshift(data)
          this.myemoji.emojiList.splice(1,0,data)
          this.changeState(this.list)
          if(this.myemoji.emojiList.length>=5){
            this.myemoji.emojiPage= Math.ceil(this.myemoji.emojiList.length/5);
            }
          let myemoji ={
            show:true,
            myemojilist:this.myemoji.myemojilist,
            emojiList:this.myemoji.emojiList,
            emojiPage: this.myemoji.emojiPage
          }
          this.$store.commit("SET_MYEMOJI", myemoji);
        },()=>{}
      )
    },
    delEmoji(id,name){
    this.delname=name
    this.delid=id
    this.emojidel=true
    },
    delEmojiconfirm(){
      let obj ={bqbId:this.delid}
        this.$http.deleteEmoji(obj).then(
        data => {  
        this.myemoji.myemojilist= this.myemoji.myemojilist.filter(item=> item.bqbId!==this.delid)
        this.myemoji.emojiList=this.myemoji.emojiList.filter(item=> item.bqbId!==this.delid)
        this.emojidel=false
        if(this.myemoji.emojiList.length<6){
            this.myemoji.emojiPage= 0
          }
          let myemoji ={
            show:true,
            myemojilist:this.myemoji.myemojilist,
            emojiList: this.myemoji.emojiList,
            emojiPage: this.myemoji.emojiPage
          }
          this.$store.commit("SET_MYEMOJI", myemoji);
        },() => {}
        )
    },
      gainemojiList(){
          this.myemoji.myemojilist=[]
          this.myemoji.emojiList=[
        {
          bqbCoverUrl: './static/images/emoji.png',
          bqbId: 9999
        }
      ]
        this.$http.emojiList({}).then(
        data => { 
          data.forEach(v => {
            v.bqbCoverUrl =  v.bqbCoverUrl;
            this.myemoji.emojiList.push(v);
            this.myemoji.myemojilist.push(v);
          });
          this.myemoji.emojiPage = Math.ceil(this.myemoji.emojiList.length / 5);
          let myemoji ={
            show:true,
            myemojilist:this.myemoji.myemojilist,
            emojiList: this.myemoji.emojiList,
            emojiPage: this.myemoji.emojiPage
          }
          this.$store.commit("SET_MYEMOJI", myemoji);
        },
        () => {}
      );
      }
},
    computed:{
      ...mapGetters(["myemoji"]),
    },
    mounted () {
      //为了防止火狐浏览器拖拽的时候以新标签打开，此代码真实有效
      document.body.ondrop = function (event) {
          event.preventDefault();
          event.stopPropagation();
      }
      this.gainemojiList()
      this.$dragging.$on('dragend', () => {
        //此处是拖动完成后鼠标松开时触发的事件
        this.myemoji.myemojilist.forEach((v,index)=>{
          v.sort=index+1
    })
    let updatelist = this.myemoji.myemojilist.map(ele=>{
      return{
      id:ele.id,
      sort:ele.sort
    }
  })
    updatelist=JSON.stringify(updatelist)
    let obj={listMySort:updatelist}
    this.$http.updateEmoji(obj).then(
        data=>{},()=>{}
        )
      let ccc=[
        {
          bqbCoverUrl: './static/images/emoji.png',
          bqbId: 9999
        }
      ]
      var list = c.concat(this.myemoji.myemojilist)
        let myemoji ={
            show:true,
            myemojilist:this.myemoji.myemojilist,
            emojiList: list,
            emojiPage: this.myemoji.emojiPage
          }
          this.$store.commit("SET_MYEMOJI", myemoji);
    })
    },
  }
</script>
<style  lang="scss">
.myemojibox{
  position: absolute;
  z-index: 7788;
  width:100%;
  height: 100%;
  background: rgba(0,0,0,.3);
  .dialo{
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        background: #fff;
        width: 352px;
        height: 640px;
        border-radius: 5px;
        padding-top: 20px;
        .el-tabs__content{
          height: 100%;
        }
        .is-top{
          width: 232px;
          #tab-first{
            width:116px;
            text-align:center ;
            padding: 0;
          }
          #tab-second{
            width:116px;
            text-align:center ;
            padding: 0;
          }
        }
        .text{
          margin-left: 26px;
          margin-top: 36px;
          font-size: 16px;
          span{
            color:#3592D8
          }
        }
        .judge{
          margin-top: 32px;
          display: flex;
          justify-content: flex-end;
          .cancel{
          margin-right: 20px;
          }
          .confirm{
            margin-right: 20px;
          }
        }
        .cancel{
        text-decoration:none;
        color:#3592D8
        }
        .cancel:hover{
            color:#3592D8
        }
        .confirm{
          text-decoration:none;
          color:#E65858
        }
        .confirm:hover{
          color:#E65858
        }
        .control{
          margin-left:20px;
          margin-right: 23px;
        }
        .color-box {
            transition: transform .5s;
          }
        .color-box.dragging {
            transform: scale(1.1);
        }
        .hot-emoji{
        height: 84px;
        .control{
        margin-left:20px;
        margin-right: 23px;
        }
        .img{
          margin-right:20px;
        }
        .name{
            font-size: 12px;
            font-weight: 600;
          }
          .emoji-box{
            width: 100%;
            height: 84px;
            justify-content: space-between;
            margin-right: 10px;
            border-bottom:1px solid  #e2e2e2;
          }
            .myemoji-icon{
              display: block;
              width: 20px;
              height: 20px;
              margin: 8px 10px;
              background: url(../../assets/images/emoji-add.png) no-repeat;
              background-size: 100%;
              &.success{
                background: url(../../assets/images/emoji-success.png) no-repeat;
                background-size: 100%;
              }
              &.wait{
                background: url(../../assets/images/emoji-wait.png) no-repeat;
                background-size: 100%;
              }
            }
            
        }    
  }
  .deldialo{
     position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        background: #fff;
        width: 330px;
        height: 128px;
        border-radius: 5px;
  }
}

</style>