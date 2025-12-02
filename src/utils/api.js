/**
 * API接口管理
 * 统一管理所有接口地址和参数
 */

import http from './request.js'

// 系统相关接口
export const systemApi = {
  // 获取系统配置
  getSystemConfig: () => http.get('/system/config'),
  
  // 获取版本信息
  getVersionInfo: () => http.get('/system/version'),
  
  // 检查更新
  checkUpdate: () => http.get('/system/update'),
  
  // 获取启动页配置
  getSplashConfig: () => http.get('/system/splash')
}

// 导出所有API
export default {
  system: systemApi
} 