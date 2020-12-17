<template>
  <div class="tinymce-editor">
    <editor v-model="myValue"
      :init="init"
      :disabled="disabled">
    </editor>
  </div>
</template>
<script>
import { Util } from "@/tools/utils";
import tinymce from 'tinymce/tinymce'
import Editor from '@tinymce/tinymce-vue'
import 'tinymce/themes/silver'
import 'tinymce/icons/default/icons' //解决了icons.js 报错Unexpected token '<'
// 编辑器插件plugins
import 'tinymce/plugins/image'// 插入上传图片插件
import 'tinymce/plugins/media'// 插入视频插件
import 'tinymce/plugins/table'// 插入表格插件
import 'tinymce/plugins/lists'// 列表插件
import 'tinymce/plugins/wordcount'// 字数统计插件
export default {
  components: {
    Editor
  },
  props: {
    value: {
      type: String,
      default: ''
    },
    editId: {
      type: String,
      default: ''
    },
    baseUrl: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    plugins: {
      type: [String, Array],
      default: 'lists image media table wordcount'
    },
    toolbar: {
      type: [String, Array],
      default: 'fontsizeselect bold italic alignleft aligncenter alignright alignjustify undo redo'
    }
  },
  data () {
    return {
      init: {},
      myValue: this.value
    }
  },
  created() {
    this.init = {
      language_url: null,
      language: null,
      skin_url: '/static/tinymce/skins/ui/oxide',
      content_css: '/static/tinymce/skins/content/default/content.css',
      //打包使用目录
      // skin_url: '/otc/static/tinymce/skins/ui/oxide',
      // content_css: '/otc/static/tinymce/skins/content/default/content.css',
      height: 495,
      plugins: this.plugins,
      toolbar: this.toolbar,
      branding: false,
      menubar: false,
      statusbar: false,
      images_upload_handler: (blobInfo, success, failure) => {
        let file = blobInfo.blob();
        Util.getImgUrl(file, 1).then(
          data => {
            success(this.global.fileDownUrl+'compress/' +data)
          },data => {
            this.$store.commit("SET_TOAST_TEXT", data);
          }
        );
      },
    }
    if (localStorage.lang == "zh_CN") {
      // this.init.language_url = '/static/tinymce/zh_CN.js';
      //打包使用目录
      this.init.language_url = '/otc/static/tinymce/zh_CN.js';
      // this.init.language = 'zh_CN';
    }
  },
  mounted () {
    tinymce.init({})
  },
  methods: {
    // 可以添加一些自己的自定义事件，如清空内容
    clear () {
      this.myValue = ''
    },
    insert(txt){
      this.myValue += txt;
    }
  },
  watch: {
    value (newValue) {
      this.myValue = newValue
    },
    myValue (newValue) {
      this.$emit('input', newValue)
    }
  }
}
</script>