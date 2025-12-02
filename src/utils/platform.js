/**
 * 平台兼容性工具
 * 处理不同平台的特殊逻辑
 */

/**
 * 平台特定功能
 */
export const platformUtils = {
  /**
   * 分享功能
   */
  share: {
    // 分享到微信好友
    toWeixin: (options = {}) => {
      // #ifdef MP-WEIXIN
      return new Promise((resolve, reject) => {
        uni.share({
          provider: 'weixin',
          scene: 'WXSceneSession',
          type: options.type || 0,
          href: options.href || '',
          title: options.title || '',
          summary: options.summary || '',
          imageUrl: options.imageUrl || '',
          success: resolve,
          fail: reject
        })
      })
      // #endif
      
      // #ifdef H5
      // H5端可以调用微信JS-SDK
      console.log('H5端分享功能')
      return Promise.resolve()
      // #endif
      
      // #ifdef APP-PLUS
      return new Promise((resolve, reject) => {
        uni.share({
          provider: 'weixin',
          scene: 'WXSceneSession',
          type: options.type || 0,
          href: options.href || '',
          title: options.title || '',
          summary: options.summary || '',
          imageUrl: options.imageUrl || '',
          success: resolve,
          fail: reject
        })
      })
      // #endif
    },
    
    // 分享到微信朋友圈
    toWeixinTimeline: (options = {}) => {
      // #ifdef MP-WEIXIN
      return new Promise((resolve, reject) => {
        uni.share({
          provider: 'weixin',
          scene: 'WXSceneTimeline',
          type: options.type || 0,
          href: options.href || '',
          title: options.title || '',
          summary: options.summary || '',
          imageUrl: options.imageUrl || '',
          success: resolve,
          fail: reject
        })
      })
      // #endif
      
      // #ifdef H5
      console.log('H5端分享到朋友圈功能')
      return Promise.resolve()
      // #endif
      
      // #ifdef APP-PLUS
      return new Promise((resolve, reject) => {
        uni.share({
          provider: 'weixin',
          scene: 'WXSceneTimeline',
          type: options.type || 0,
          href: options.href || '',
          title: options.title || '',
          summary: options.summary || '',
          imageUrl: options.imageUrl || '',
          success: resolve,
          fail: reject
        })
      })
      // #endif
    }
  },
  
  /**
   * 支付功能
   */
  payment: {
    // 微信支付
    weixinPay: (payData) => {
      return new Promise((resolve, reject) => {
        uni.requestPayment({
          provider: 'wxpay',
          timeStamp: payData.timeStamp,
          nonceStr: payData.nonceStr,
          package: payData.package,
          signType: payData.signType,
          paySign: payData.paySign,
          success: resolve,
          fail: reject
        })
      })
    },
    
    // 支付宝支付
    alipay: (payData) => {
      return new Promise((resolve, reject) => {
        uni.requestPayment({
          provider: 'alipay',
          orderInfo: payData.orderInfo,
          success: resolve,
          fail: reject
        })
      })
    }
  },
  
  /**
   * 定位功能
   */
  location: {
    // 获取当前位置
    getCurrentLocation: () => {
      return new Promise((resolve, reject) => {
        uni.getLocation({
          type: 'gcj02',
          success: resolve,
          fail: reject
        })
      })
    },
    
    // 打开地图
    openLocation: (options) => {
      return new Promise((resolve, reject) => {
        uni.openLocation({
          latitude: options.latitude,
          longitude: options.longitude,
          name: options.name || '',
          address: options.address || '',
          scale: options.scale || 18,
          success: resolve,
          fail: reject
        })
      })
    }
  },
  
  /**
   * 相机和相册
   */
  media: {
    // 选择图片
    chooseImage: (options = {}) => {
      return new Promise((resolve, reject) => {
        uni.chooseImage({
          count: options.count || 1,
          sizeType: options.sizeType || ['original', 'compressed'],
          sourceType: options.sourceType || ['album', 'camera'],
          success: resolve,
          fail: reject
        })
      })
    },
    
    // 拍照
    takePhoto: () => {
      return new Promise((resolve, reject) => {
        uni.chooseImage({
          count: 1,
          sizeType: ['original', 'compressed'],
          sourceType: ['camera'],
          success: resolve,
          fail: reject
        })
      })
    },
    
    // 选择视频
    chooseVideo: (options = {}) => {
      return new Promise((resolve, reject) => {
        uni.chooseVideo({
          sourceType: options.sourceType || ['album', 'camera'],
          maxDuration: options.maxDuration || 60,
          camera: options.camera || 'back',
          success: resolve,
          fail: reject
        })
      })
    }
  },
  
  /**
   * 设备功能
   */
  device: {
    // 拨打电话
    makePhoneCall: (phoneNumber) => {
      return new Promise((resolve, reject) => {
        uni.makePhoneCall({
          phoneNumber,
          success: resolve,
          fail: reject
        })
      })
    },
    
    // 发送短信
    sendSms: (phoneNumber, content) => {
      // #ifdef APP-PLUS
      return new Promise((resolve, reject) => {
        plus.sms.sendMessage({
          phoneNumber,
          content,
          success: resolve,
          fail: reject
        })
      })
      // #endif
      
      // #ifdef H5 || MP-WEIXIN
      console.log('当前平台不支持发送短信')
      return Promise.reject(new Error('当前平台不支持发送短信'))
      // #endif
    },
    
    // 震动
    vibrate: (type = 'short') => {
      // #ifdef APP-PLUS
      if (type === 'long') {
        plus.device.vibrate(1000)
      } else {
        plus.device.vibrate(100)
      }
      // #endif
      
      // #ifdef H5
      if ('vibrate' in navigator) {
        navigator.vibrate(type === 'long' ? 1000 : 100)
      }
      // #endif
      
      // #ifdef MP-WEIXIN
      uni.vibrateShort()
      // #endif
    }
  },
  
  /**
   * 剪贴板
   */
  clipboard: {
    // 设置剪贴板内容
    setData: (data) => {
      return new Promise((resolve, reject) => {
        uni.setClipboardData({
          data,
          success: resolve,
          fail: reject
        })
      })
    },
    
    // 获取剪贴板内容
    getData: () => {
      return new Promise((resolve, reject) => {
        uni.getClipboardData({
          success: (res) => resolve(res.data),
          fail: reject
        })
      })
    }
  },
  
  /**
   * 网络状态
   */
  network: {
    // 获取网络类型
    getType: () => {
      return new Promise((resolve) => {
        uni.getNetworkType({
          success: (res) => resolve(res.networkType),
          fail: () => resolve('unknown')
        })
      })
    },
    
    // 监听网络状态变化
    onStatusChange: (callback) => {
      uni.onNetworkStatusChange(callback)
    }
  }
}

/**
 * 平台特定样式
 */
export const platformStyles = {
  // 获取状态栏高度
  getStatusBarHeight: () => {
    const systemInfo = uni.getWindowInfo()
    return systemInfo.statusBarHeight || 0
  },
  
  // 获取安全区域
  getSafeArea: () => {
    const systemInfo = uni.getWindowInfo()
    return systemInfo.safeArea || {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0
    }
  },
  
  // 获取导航栏高度
  getNavBarHeight: () => {
    const systemInfo = uni.getWindowInfo()
    const statusBarHeight = systemInfo.statusBarHeight || 0
    const navBarHeight = 44 // 默认导航栏高度
    
    // #ifdef MP-WEIXIN
    const menuButtonInfo = uni.getMenuButtonBoundingClientRect()
    return menuButtonInfo.height + (menuButtonInfo.top - statusBarHeight) * 2
    // #endif
    
    // #ifdef H5 || APP-PLUS
    return statusBarHeight + navBarHeight
    // #endif
  }
}

/**
 * 平台特定配置
 */
export const platformConfig = {
  // 获取平台配置
  getConfig: () => {
    const platform = getCurrentPlatform()
    
    const configs = {
      'h5': {
        titleBarHeight: 0,
        canShare: true,
        canPay: true,
        canLocation: true,
        canCamera: true
      },
      'mp-weixin': {
        titleBarHeight: 44,
        canShare: true,
        canPay: true,
        canLocation: true,
        canCamera: true
      },
      'mp-alipay': {
        titleBarHeight: 44,
        canShare: false,
        canPay: true,
        canLocation: true,
        canCamera: true
      },
      'app-plus': {
        titleBarHeight: 44,
        canShare: true,
        canPay: true,
        canLocation: true,
        canCamera: true
      }
    }
    
    return configs[platform] || configs['h5']
  }
}

/**
 * 获取当前平台
 */
function getCurrentPlatform() {
  // #ifdef H5
  return 'h5'
  // #endif
  
  // #ifdef MP-WEIXIN
  return 'mp-weixin'
  // #endif
  
  // #ifdef MP-ALIPAY
  return 'mp-alipay'
  // #endif
  
  // #ifdef APP-PLUS
  return 'app-plus'
  // #endif
  
  return 'h5'
}

export default {
  platformUtils,
  platformStyles,
  platformConfig
} 