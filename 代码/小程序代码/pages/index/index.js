//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
  
    motto1: '计科04 付康'
  },

  go_main: function(){
    console.log('Navigating to detection page...');
    wx.navigateTo({
      url: '/pages/face/detection'
    })
  },

  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
})
