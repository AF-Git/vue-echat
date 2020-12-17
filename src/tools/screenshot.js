import html2canvas from "html2canvas";
import { throttle } from "@/tools/utils";

// 选中区域生成图片、回调传递参数给页面
function downloadIamge(
  canvas,
  capture_x,
  capture_y,
  capture_width,
  capture_height,
  left,
  top,
  callback
) {
  var clipCanvas = document.createElement("canvas");
  clipCanvas.width = capture_width;
  clipCanvas.height = capture_height;
  clipCanvas
    .getContext("2d")
    .drawImage(
      canvas,
      capture_x,
      capture_y,
      capture_width,
      capture_height,
      0,
      0,
      capture_width,
      capture_height
    );
  var clipImgBase64 = clipCanvas.toDataURL("image/jpg");
  // 生成图片
  let imgData = {};
  let img = new Image();
  img.src = clipImgBase64;
  img.onload = () => {
    imgData = {
      src: clipImgBase64,
      width: img.width,
      height: img.height,
      top,
      left
    };
  };
  imgData.src = clipImgBase64;
  setTimeout(() => {
    callback(imgData);
  }, 50);
}

// html转画布、鼠标绘制矩形框
const canvasExt = {
  drawRect(canvasId, penColor, callback) {
    var canvas = document.getElementById(canvasId);
    //鼠标按下拖动的矩形框画布
    var dropRect = canvas.getContext("2d");
    dropRect.lineWidth = 1;
    dropRect.strokeStyle = penColor;
    //canvas 的矩形框
    var canvasRect = canvas.getBoundingClientRect();
    //canvas 矩形框的左上角坐标
    var canvasLeft = canvasRect.left;
    var canvasTop = canvasRect.top;
    // 要画的矩形的起点 x y
    var x = 0,
      y = 0;
    canvas.onmousedown = function (e) {
      x = e.clientX - canvasLeft;
      y = e.clientY - canvasTop;
      var clientWidth =
        document.documentElement.clientWidth || document.body.clientWidth;
      var clientHeight =
        document.documentElement.clientHeight || document.body.clientHeight;
      //鼠标移动事件，画图 ,防抖
      function move(event) {
        dropRect.clearRect(0, 0, clientWidth, clientHeight);
        dropRect.strokeRect(
          x,
          y,
          event.clientX - canvasLeft - x,
          event.clientY - canvasTop - y
        );
      }
      let throttleMove = throttle(move, 80);
      canvas.onmousemove = function (e) {
        throttleMove(e);
      };
    };
    canvas.onmouseup = function (e) {
      var width = e.clientX - canvasLeft - x;
      var height = e.clientY - canvasTop - y;
      // 清理内存
      canvas.onmousemove = null;
      canvas.onmousedown = null;
      // 清理上一个画布
      if (width > 0 && height > 0) {
        dropRect.clearRect(x - 1, y - 1, e.clientX, e.clientY);
      } else {
        if (width > 0) {
          dropRect.clearRect(x - 1, e.clientY, e.clientX, y - 1);
        } else if (height > 0) {
          dropRect.clearRect(e.clientX, y - 1, x - 1, e.clientY);
        } else {
          dropRect.clearRect(e.clientX, e.clientY, x - 1, y - 1);
        }
      }
      if (width != 0 && height != 0) {
        html2canvas(document.body, {
          scale: 1,
          useCORS: true //跨域使用
        }).then(
          canvas => {
            var capture_x = 0,
              capture_y = 0,
              top = 0,
              left = 0;
            if (width > 0) {
              //从左往右画
              capture_x = x;
              top = x;
            } else {
              //从右往左画
              capture_x = x + width;
              top = e.clientX;
            }
            if (height > 0) {
              //从上往下画
              capture_y = y;
              left = y;
            } else {
              //从下往上画
              capture_y = y + height;
              left = e.clientY;
            }
            downloadIamge(
              canvas,
              capture_x,
              capture_y,
              Math.abs(width),
              Math.abs(height),
              top,
              left,
              callback
            );
          },
          err => {
            console.error(err);
          }
        );
      }
    };
  },
  uploadCropper(targetDom, width, height, x, y, callback) {
    html2canvas(targetDom, {
      scale: 1,
      useCORS: true //跨域使用
    }).then(
      canvas => {
        let capture_x = x,
          capture_y = y,
          top = y + height,
          left = x + width;

        downloadIamge(
          canvas,
          capture_x,
          capture_y,
          Math.abs(width),
          Math.abs(height),
          top,
          left,
          callback
        );
      },
      err => {
        console.error(err);
      }
    );
  },


  cropper(targetDom, width, height, x, y, callback) {
    html2canvas(targetDom, {
      allowTaint: true,
      taintTest: false,
      useCORS:true,//火狐浏览器添加项
    }).then(
      canvas => {
        //判断是否是IE11
        var name = "invite friends QR.png";
        if (window.navigator.msSaveOrOpenBlob){
            var blob = canvas.msToBlob();
            console.log(blob);
            window.navigator.msSaveBlob(blob, name);
        }else{
            canvas.id = "mycanvas";
            //生成base64图片数据
            var dataUrl = canvas.toDataURL();
            var newImg = document.createElement("img");
            newImg.src = dataUrl;
            // var a = $("<a></a>").attr("href", dataUrl).attr("download", "img.png");
            // $("body").append(a);//火狐浏览器添加项
            // a[0].click();
            // a.remove();
            var a = document.createElement("a");            
            a.download = name;
            a.href = dataUrl;
            a.click();
            a.remove();
        }
      },
      err => {
        console.error(err);
      }
    );;
  },
  base64toFile(dataurl, filename) {
    const arr = dataurl.split(",");
    let mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    let u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {
      type: mime
    });
  }
};

export default canvasExt;
