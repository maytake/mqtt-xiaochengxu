/**
 * 使用示例
 * 展示如何使用请求、Vuex和平台兼容工具
 */

import http from './request'

import store from '../store'
import { platformUtils, platformStyles } from './platform'
import { storage, time, validate } from './common'

/**
 * 请求示例
 */
export const requestExamples = {
  // 基础请求示例
  basicRequest: async () => {
    try {
      // GET请求
      const config = await http.get('/system/config')
      console.log('系统配置:', config)

      // POST请求
      const updateResult = await http.post('/system/update', {
        version: '1.0.1'
      })
      console.log('更新结果:', updateResult)

    } catch (error) {
      console.error('请求失败:', error)
    }
  },


}

/**
 * Vuex使用示例
 */
export const vuexExamples = {
  // 系统操作
  systemOperations: async () => {
    try {
      // 初始化系统
      await store.dispatch('system/initSystem')

      // 获取系统配置
      const config = store.getters['system/getSystemConfig']
      console.log('系统配置:', config)

      // 检查更新
      const needUpdate = store.getters['system/needUpdate']
      console.log('是否需要更新:', needUpdate)

      // 设置缓存数据
      await store.dispatch('system/setCacheData', {
        key: 'userPreferences',
        data: { theme: 'dark', language: 'zh-CN' },
        expireTime: Date.now() + 24 * 60 * 60 * 1000 // 24小时后过期
      })

      // 获取缓存数据
      const cachedData = await store.dispatch('system/getCacheData', 'userPreferences')
      console.log('缓存数据:', cachedData)

      // 设置全局加载状态
      store.dispatch('setLoading', true)

      // 设置网络状态
      store.dispatch('setNetworkStatus', true)

    } catch (error) {
      console.error('系统操作失败:', error)
    }
  }
}

/**
 * 平台兼容性示例
 */
export const platformExamples = {
  // 分享功能
  shareExample: async () => {
    try {
      // 分享到微信好友
      await platformUtils.share.toWeixin({
        title: '分享标题',
        summary: '分享描述',
        imageUrl: 'https://example.com/image.jpg',
        href: 'https://example.com'
      })

      // 分享到微信朋友圈
      await platformUtils.share.toWeixinTimeline({
        title: '朋友圈分享',
        imageUrl: 'https://example.com/image.jpg',
        href: 'https://example.com'
      })

    } catch (error) {
      console.error('分享失败:', error)
    }
  },

  // 支付功能
  paymentExample: async () => {
    try {
      // 微信支付
      await platformUtils.payment.weixinPay({
        timeStamp: '1234567890',
        nonceStr: 'nonceStr',
        package: 'prepay_id=wx123456789',
        signType: 'MD5',
        paySign: 'paySign'
      })

      // 支付宝支付
      await platformUtils.payment.alipay({
        orderInfo: 'orderInfo'
      })

    } catch (error) {
      console.error('支付失败:', error)
    }
  },

  // 定位功能
  locationExample: async () => {
    try {
      // 获取当前位置
      const location = await platformUtils.location.getCurrentLocation()
      console.log('当前位置:', location)

      // 打开地图
      await platformUtils.location.openLocation({
        latitude: 39.908823,
        longitude: 116.397470,
        name: '天安门',
        address: '北京市东城区天安门广场'
      })

    } catch (error) {
      console.error('定位失败:', error)
    }
  },

  // 媒体功能
  mediaExample: async () => {
    try {
      // 选择图片
      const imageResult = await platformUtils.media.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      })
      console.log('选择的图片:', imageResult)

      // 拍照
      const photoResult = await platformUtils.media.takePhoto()
      console.log('拍摄的照片:', photoResult)

      // 选择视频
      const videoResult = await platformUtils.media.chooseVideo({
        maxDuration: 60,
        camera: 'back'
      })
      console.log('选择的视频:', videoResult)

    } catch (error) {
      console.error('媒体操作失败:', error)
    }
  },

  // 设备功能
  deviceExample: async () => {
    try {
      // 拨打电话
      await platformUtils.device.makePhoneCall('10086')

      // 震动
      platformUtils.device.vibrate('short')

      // 设置剪贴板
      await platformUtils.clipboard.setData('要复制的内容')

      // 获取剪贴板内容
      const clipboardData = await platformUtils.clipboard.getData()
      console.log('剪贴板内容:', clipboardData)

    } catch (error) {
      console.error('设备操作失败:', error)
    }
  }
}

/**
 * 工具函数示例
 */
export const utilityExamples = {
  // 存储操作
  storageExample: () => {
    // 设置存储
    storage.set('userToken', 'abc123')
    storage.set('userInfo', { name: '张三', age: 25 })

    // 获取存储
    const token = storage.get('userToken')
    const userInfo = storage.get('userInfo')
    console.log('存储数据:', { token, userInfo })

    // 移除存储
    storage.remove('userToken')

    // 获取存储信息
    const storageInfo = storage.getInfo()
    console.log('存储信息:', storageInfo)
  },

  // 时间操作
  timeExample: () => {
    const now = new Date()

    // 格式化时间
    const formattedTime = time.format(now, 'YYYY-MM-DD HH:mm:ss')
    console.log('格式化时间:', formattedTime)

    // 相对时间
    const relativeTime = time.fromNow(now.getTime() - 3600000) // 1小时前
    console.log('相对时间:', relativeTime)

    // 时间戳
    const timestamp = time.timestamp()
    console.log('时间戳:', timestamp)
  },

  // 验证操作
  validateExample: () => {
    // 验证手机号
    const isPhone = validate.isPhone('13800138000')
    console.log('手机号验证:', isPhone)

    // 验证邮箱
    const isEmail = validate.isEmail('test@example.com')
    console.log('邮箱验证:', isEmail)

    // 验证身份证
    const isIdCard = validate.isIdCard('110101199001011234')
    console.log('身份证验证:', isIdCard)

    // 验证URL
    const isUrl = validate.isUrl('https://example.com')
    console.log('URL验证:', isUrl)
  },

  // 样式操作
  styleExample: () => {
    // 获取状态栏高度
    const statusBarHeight = platformStyles.getStatusBarHeight()
    console.log('状态栏高度:', statusBarHeight)

    // 获取安全区域
    const safeArea = platformStyles.getSafeArea()
    console.log('安全区域:', safeArea)

    // 获取导航栏高度
    const navBarHeight = platformStyles.getNavBarHeight()
    console.log('导航栏高度:', navBarHeight)
  }
}

/**
 * 完整使用示例
 */
export const completeExample = async () => {
  try {
    console.log('=== 开始完整示例 ===')

    // 1. 初始化应用
    await store.dispatch('initApp')

    // 4. 设置缓存数据
    await store.dispatch('system/setCacheData', {
      key: 'appSettings',
      data: { theme: 'light', language: 'zh-CN' },
      expireTime: Date.now() + 24 * 60 * 60 * 1000
    })

    // 5. 分享应用
    await platformUtils.share.toWeixin({
      title: '推荐一个好用的应用',
      summary: '功能强大，界面美观',
      imageUrl: 'https://example.com/app-icon.jpg',
      href: 'https://example.com/app'
    })

    console.log('=== 完整示例结束 ===')

  } catch (error) {
    console.error('完整示例执行失败:', error)
  }
}

export default {
  requestExamples,
  vuexExamples,
  platformExamples,
  utilityExamples,
  completeExample
} 