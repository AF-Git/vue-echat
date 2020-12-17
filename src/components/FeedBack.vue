<template>
	<!-- 添加好友 -->
	<div class="my-popup feedback" v-if="showFeedback"  @click="showFeedback=false;">
		<div class="my-popup-content" @click.stop=";">
			<div class="feedback-header">意见反馈<i @click="showFeedback=false"></i></div>
			<div class="feedback-box">
				<div class="box-title">请描述具体情况<span>{{send.remark.length}}/200</span></div>
				<textarea maxlength="200" placeholder="请填写十个字以上的问题描述以便我们提供最好的帮助和服务" v-model="send.remark"></textarea>
			</div>
			<div class="feedback-box">
				<div class="box-title">图片（选填，提供问题截图）<span>{{send.uploadImgArr.length}}/3</span></div>
				<div class="form-img">
					<div class="item-img upload" v-for="(item,index) in send.uploadImgArr" :key="index">
						<img preview="0" :src="item.url"><i @click="deleteImg(index)"></i>
					</div>
					<div class="item-img" v-if="send.uploadImgArr.length<3">
						<input type="file" id="file" accept="image/jpeg,image/png,image/gif" @change="uploadImg($event)" />
						<img src="../assets/images/upload.png">
					</div>
				</div>
			</div>
			<div class="feedback-box">
				<div class="box-title">请选择您的联系方式 </div>
				<div class="form-tab">
					<div class="item-tab" @click="send.contactType='1';send.contactNum='';" :class="{active:send.contactType=='1'}">手机号</div>
					<div class="item-tab" @click="send.contactType='3';send.contactNum='';" :class="{active:send.contactType=='3'}">微信号</div>
					<div class="item-tab" @click="send.contactType='2';send.contactNum='';" :class="{active:send.contactType=='2'}">邮箱</div>
				</div>
				<div class="form-input">
					<input type="text" autocomplete="off" id="contact" v-model="send.contactNum" placeholder="输入您的联系方式" />
				</div>
			</div>
			<button class="feedback-btn cannel" @click="showFeedback=false">取消</button>
			<button class="feedback-btn comfirm" @click="doSubmit()">确定</button>
		</div>

		<div class="my-popup upload-success" v-show="showSuccess"  @click.stop="showSuccess=false;">
			<div class="success-content">
				<img src="../assets/images/chat/upload-success.png">
				<p>提交成功</p>
			</div>
		</div>
	</div>
</template>
<script>
	
export default {
	name: 'feedback',
	data (){
		return {
			showFeedback:false,
			send:{
				remark:'',
				uploadImgArr:[],
				contactType:'1',
				contactNum:'',
			},
			timeReady:true,
			firstComfirm:true,
			showSuccess:false,
		}
	},
    methods: {
    	clean(){
    		this.send = {
				remark:'',
				uploadImgArr:[],
				contactType:'1',
				contactNum:'',
			}
			this.timeReady = true;
			this.firstComfirm = true;
    	},
    	show(){
    		this.clean();
    		this.showFeedback = true;
    	},
    	deleteImg(idx) {
      		this.send.uploadImgArr.splice(idx,1)
	  	},
	  	uploadImg(e){

			//上传图片
			let file = e.target.files[0];
			var newform=new FormData();
			newform.append("mFile",file);
			newform.append("privateFile",true)
			var xml = new XMLHttpRequest();
			xml.open("post",base.imfileUrl+'/upload/picture1.htm',true);
    		xml.setRequestHeader("token", this.$store.getters.token);
			xml.send(newform);
			xml.onreadystatechange = ()=>{//回调函数
			  	if(xml.status == 200){
					setTimeout(()=>{
						var b = xml.responseText;
						var data = JSON.parse(b);
						if(data.code == 0) {
							if(this.timeReady){
								this.timeReady = false;
								this.uploadImgHandler(data)
								setTimeout(()=>{
									this.timeReady = true;
								},10)
							}
						}else{ 
							//app.myalert(data.data);
						}
					},10)
			  	}
			};
		},
		uploadImgHandler(data){
			if(data.code == 0) {
				let item = {
					url: data.data,
					data:data.data
				}
				this.send.uploadImgArr.push(item)
				let file = document.getElementById('file')
				file.value = ''
			}else{
				//this.$toast(data.data)
			}
		},
		getImgUrls(list){
			let result = ''
			if(list && list.length){
				for(let i=0;i<list.length;i++){
					let item = list[i]
					result += item.url + ','
				}
				result = result.substr(0,result.length-1)
			}else{
				result = ''
			}
			return result
		},
		doSubmit(){
			let postData = {
				userId:this.$store.getters.userId,//问题类型
				problemType: '',
				problemDetails:this.send.remark,
				contactWay:this.send.contactType,
				contactNum:this.send.contactNum,
				imageUrl: this.getImgUrls(this.send.uploadImgArr),
			}
			if(!postData.problemDetails || postData.problemDetails.length<10) { 
				this.$store.commit('SET_TOAST_TEXT', '请填写十个字以上的问题描述')
				return 
			}
			if(this.firstComfirm){
				this.firstComfirm = false;
				this.$http.addFeedback(postData).then(
					data => {
						this.clean();
						this.showSuccess = true;
						setTimeout(()=>{
							this.showSuccess = false;
						},2000)
					},
					data => {
						this.firstComfirm = true;
					}
				)
			}
		}
	},
	mounted(){
	}
}
</script>
<style lang="scss" scoped="" type="text/css">
.feedback{
	.my-popup-content{
		width: 461px;
		height: 534px;
		background: rgba(255,255,255,1);
		border-radius: 5px;
		overflow: hidden;
		.feedback-header{
			height: 39px;
			line-height: 39px;
			width: 100%;
	    	font-size:18px;
	    	text-align:left;
	    	padding-left:28px;
	    	background: #F2F2F2;
			i{
	    		display: inline-block;position: absolute;top:15px;right: 12px;height: 8px;width: 8px;
    			background-image: url(../assets/images/chat/icon-window-close.png);background-size:100% 100%;cursor: pointer;
	    	}
		}
		.feedback-btn {
			height: 34px;
			width:78px;
			margin-top: 29px;
			&:hover{
				background: #FEA405;
				color: #fff;
				border:none;
			}
			&.comfirm{
				color: #fff;
				background: #3C4975;
				
			}
			&.cannel{
				color: #3C4975;
				background: #fff;
				margin-right: 100px;
				border: 1px solid #3C4975;
			}
		}
		.feedback-box{
			height: auto;
			overflow: auto;
			margin: 0 28px;
			border-top: 1px solid #E0E0E0;
			.box-title{
				height: 12px;
				line-height: 12px;
				margin: 11px 0;
				text-align: left;
				span{
					float: right;
				}

			}
			textarea{
				height: 118px;
				width: 100%;
				border-radius: 4px;
				font-size: 13px;
				padding: 13px;
				line-height: 22px;
				border-top: 1px solid #CBCBCB;
				outline: none;
				margin-bottom: 17px;
			}
			.form-img {
				height: 48px;
			    width: 100%;
			    margin: auto;
			    padding: 0 37px;
				margin-bottom: 17px;
			    .item-img {
			    	position: relative;
				    height: 48px;
				    width: 78px;
				    border: 1px solid #e0e0e0;
					float: left;
					margin-left: 46px;
				    img{
				    	margin-top: 12px;
				    	height: 24px;
				    	width: 24px;
				    }
				    input{
				    	display: inline-block;
					    position: absolute;
					    left: 10%;
					    top: 10%;
					    opacity: 0;
					    height: 80%;
					    width: 80%;
				    }
				    i{
					    position: absolute;
					    top: -9px;
					    right: -9px;
					    height: 18px;
					    width: 18px;
					    background-image: url(../assets/images/delete.png);
					    background-size: 100% 100%;
					}
				}
				.item-img:first-child{
					margin-left: 0;
				}
				.item-img.upload{
					img{
				    	margin: 5%;
				    	height: 90%;
				    	width: 90%;
				    	object-fit: cover;
					}
				}

			}
			.form-tab{
				height: auto;
				width: 100%;
			    margin: auto;
			    padding: 0 37px;
				margin: 17px 0;
				overflow: hidden;
				.item-tab{
					float: left;
				    height: 34px;
				    line-height: 34px;
				    width: 78px;
				    font-size: 14px;
				    border-radius: 5px;
					margin-left: 40px;
					color:#999999;
					border: 1px solid #CBCBCB;
					cursor: pointer;
				}
				.active{
					color: #fff;
					background: #FEA405;
					border: none;
				}
				.item-tab:first-child{
					margin-left: 0;
				}
				input{
					width: 100%;
				}
			}
			.form-input{

				input{
					height: 34px;
					line-height: 34px;
					padding-left: 15px;
					width: 100%;
					border: 1px solid #CBCBCB;
				}
			}
		}
	}
	.upload-success{
		.success-content{
			position: absolute;
		    top: 50%;
		    left: 50%;
		    height: 220px;
		    width: 220px;
		    text-align: center;
		    background: #fff;
		    -webkit-transform: translate(-50%,-50%);
		    transform: translate(-50%,-50%);
		    text-align: center;
		    border-radius: 5px;
		    img{
		    	display: inline-block;
		    	height: 71px;
		    	width: 71px;
		    	margin: 45px auto 37px auto;
		    }
		    p{
		    	font-size: 16px;
		    	line-height: 16px;
		    }
		}
	}
}
</style>
