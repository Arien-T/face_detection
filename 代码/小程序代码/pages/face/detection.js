//index.js
//获取应用实例
var time = null;
var myCanvas = null;
var windowHeight, windowWidth,windowinfo;
var type = null;
Page({
  data: {
    device:true,
    camera: true,
    boundingBoxes: [], // 存储矩形框坐标
    faceProperties: [], // 存储人脸属性
    keyPoints: [], // 存储关键点
    nameList: [] // 存储人脸名称
  },
  onLoad() {
    this.setData({
      ctx: wx.createCameraContext(),
      device: this.data.device,
    })
    windowinfo=wx.getWindowInfo()
     

    console.log('窗口高度：' + windowinfo.windowHeight)
    console.log('窗口宽度：' + windowinfo.windowWidth)
      
      // 屏幕宽度、高度
    windowHeight = windowinfo.windowHeight
    windowWidth = windowinfo.windowWidth
  },
  open() {
    this.setData({
      camera: true
    })
    type = "takePhoto";
    let ctx = wx.createCameraContext(this)
    let that = this
    time = setInterval(function(){
      if (type == "takePhoto") {
        console.log("begin takephoto")
        ctx.takePhoto({
          quality:"normal",
          success:(res) =>{
            console.log(res.tempImagePath)
            var tempImagePath = res.tempImagePath
            wx.uploadFile({
              url: 'http://192.168.43.71:90/upload',
              filePath: tempImagePath,
              name: 'file',
              success:function(res){
                var im_path = res.data
                console.log(im_path)
                wx.request({
                  url: 'http://192.168.43.71:90/face_detect?url=' + im_path,
                  
                  method: "GET",
                  header: {"Content-type":"application/json"},
                  success:(res)=>{
                    if(res.data){
                    
                    var pos1= res.data['bounding_box']
                    var pos2 = res.data['face_property']
                    var pos3=res.data['key_point']
                    var pos4=res.data['name_list']
                    console.log(pos1,pos2,pos3,pos4,windowHeight,windowWidth)
                   
                    that.setData({
                      boundingBoxes: pos1,
                      faceProperties: pos2,
                      keyPoints: pos3,
                      nameList: pos4
                    });
                    // 使用新版 Canvas 2D 接口
    wx.createSelectorQuery()
    .select('#myCanvas') // 在 WXML 中填入的 id
    .fields({ node: true, size: true }) // 获取节点信息
    .exec((res) => {
      const canvas = res[0].node; // 获取 Canvas 对象
      const ctx = canvas.getContext('2d'); // 获取渲染上下文
      const width = res[0].width; // 获取画布的渲染宽度
      const height = res[0].height; // 获取画布的渲染高度
      const dpr = wx.getWindowInfo().pixelRatio; // 获取设备的像素比
      canvas.width = width * dpr; // 设置逻辑宽度
      canvas.height = height * dpr; // 设置逻辑高度
      ctx.scale(dpr, dpr); // 缩放画布

      console.log('进行到这里');
      ctx.clearRect(0, 0, canvas.width, canvas.height)//清空画布
      ctx.strokeStyle = 'red'; // 设置描边颜色
      ctx.lineWidth = 3; // 设置线宽
      // 循环绘制每个人脸的信息
    pos1.forEach((box, index) => {
      const [x1, y1, x2, y2] = box;
      const rectX = Math.max(0, x1);
      const rectY = Math.max(0, y1);
      const rectWidth = Math.abs(x2 - x1);
      const rectHeight = Math.abs(y2 - y1);

      // 绘制矩形框
      ctx.strokeStyle='red';
      ctx.lineWidth=2;
      ctx.rect(rectX, rectY, rectWidth, rectHeight);
      ctx.stroke();

      // 在矩形框顶部绘制文字（姓名和属性）
      ctx.fontSize='4em';
      ctx.fillStyle='red';
      ctx.fillText(`${pos4[index]} - ${pos2[index][0]}, ${pos2[index][1]}`, rectX, rectY - 10);
      // 绘制关键点
      /*const keyPoint = keyPoints[index];
      for (let i = 0; i < keyPoint.length; i += 2) {
        const x = keyPoint[i] * 300; // 假设关键点坐标是归一化的，需要转换为画布坐标
        const y = keyPoint[i + 1] * 300;
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2, true); // 绘制关键点
        ctx.setFillStyle('green');
        ctx.fill();
      }
      */
    });
      
    });


                    } else{
                      console.error('res.data NaN',res.statusCode);

                    }
                  },
                  fail:function(error){
                    console.error('人脸检测请求失败',error);
                  }
                });
              },
              fail:function(error){
                console.error('上传文件失败',error);
              }
            });
          }    
        });
      }
    }, 1000)
  },
  
  // 关闭模拟的相机界面
  close() {
    console.log("关闭相机");
    type = "endPhoto"
  },

})
