/**
 * 系统模块状态管理
 */

import { systemApi } from '@/utils/api'

const state = {
  // 系统配置
  systemConfig: {},
  // 版本信息
  versionInfo: {},
  // 启动页配置
  splashConfig: {},
  // 应用状态
  appStatus: {
    isFirstLaunch: true,
    lastLaunchTime: null,
    launchCount: 0
  },
  // 缓存数据
  cacheData: {}
}

const getters = {
  getSystemConfig: state => state.systemConfig,
  getVersionInfo: state => state.versionInfo,
  getSplashConfig: state => state.splashConfig,
  getAppStatus: state => state.appStatus,
  getCacheData: state => state.cacheData,
  // 检查是否需要更新
  needUpdate: state => {
    if (!state.versionInfo.currentVersion || !state.versionInfo.latestVersion) {
      return false
    }
    return state.versionInfo.currentVersion !== state.versionInfo.latestVersion
  },
  // 获取缓存数据
  getCache: state => key => state.cacheData[key]
}

const mutations = {
  SET_SYSTEM_CONFIG(state, config) {
    state.systemConfig = config
  },
  SET_VERSION_INFO(state, versionInfo) {
    state.versionInfo = versionInfo
  },
  SET_SPLASH_CONFIG(state, config) {
    state.splashConfig = config
  },
  SET_APP_STATUS(state, status) {
    state.appStatus = { ...state.appStatus, ...status }
  },
  SET_CACHE_DATA(state, { key, data }) {
    state.cacheData[key] = data
  },
  CLEAR_CACHE_DATA(state, key) {
    if (key) {
      delete state.cacheData[key]
    } else {
      state.cacheData = {}
    }
  }
}

const actions = {
  // 获取系统配置
  async getSystemConfig({ commit }) {
    try {
      const response = await systemApi.getSystemConfig()
      
      if (response.code === 200) {
        commit('SET_SYSTEM_CONFIG', response.data)
        return response.data
      } else {
        throw new Error(response.message || '获取系统配置失败')
      }
    } catch (error) {
      console.error('获取系统配置失败:', error)
      // 使用默认配置
      const defaultConfig = {
        apiBaseUrl: 'https://api.example.com',
        uploadUrl: 'https://upload.example.com',
        maxUploadSize: 10 * 1024 * 1024, // 10MB
        supportedImageTypes: ['jpg', 'jpeg', 'png', 'gif'],
        cacheExpireTime: 24 * 60 * 60 * 1000 // 24小时
      }
      commit('SET_SYSTEM_CONFIG', defaultConfig)
      return defaultConfig
    }
  },
  
  // 获取版本信息
  async getVersionInfo({ commit }) {
    try {
      const response = await systemApi.getVersionInfo()
      
      if (response.code === 200) {
        commit('SET_VERSION_INFO', response.data)
        return response.data
      } else {
        throw new Error(response.message || '获取版本信息失败')
      }
    } catch (error) {
      console.error('获取版本信息失败:', error)
      // 使用默认版本信息
      const defaultVersionInfo = {
        currentVersion: '1.0.0',
        latestVersion: '1.0.0',
        updateUrl: '',
        forceUpdate: false,
        updateDescription: ''
      }
      commit('SET_VERSION_INFO', defaultVersionInfo)
      return defaultVersionInfo
    }
  },
  
  // 检查更新
  async checkUpdate({ dispatch, getters }) {
    try {
      const response = await systemApi.checkUpdate()
      
      if (response.code === 200) {
        const { needUpdate, forceUpdate, updateUrl, updateDescription } = response.data
        
        if (needUpdate) {
          // 显示更新提示
          uni.showModal({
            title: '发现新版本',
            content: updateDescription || '发现新版本，是否立即更新？',
            confirmText: '立即更新',
            cancelText: '稍后再说',
            success: (res) => {
              if (res.confirm) {
                // 执行更新
                dispatch('performUpdate', updateUrl)
              }
            }
          })
        }
        
        return response.data
      } else {
        throw new Error(response.message || '检查更新失败')
      }
    } catch (error) {
      console.error('检查更新失败:', error)
      throw error
    }
  },
  
  // 执行更新
  async performUpdate({ commit }, updateUrl) {
    try {
      // #ifdef APP-PLUS
      // App端更新
      plus.runtime.openURL(updateUrl)
      // #endif
      
      // #ifdef H5
      // H5端更新
      window.open(updateUrl, '_blank')
      // #endif
      
      // #ifdef MP-WEIXIN
      // 微信小程序更新
      uni.showToast({
        title: '请前往应用商店更新',
        icon: 'none'
      })
      // #endif
      
    } catch (error) {
      console.error('执行更新失败:', error)
      uni.showToast({
        title: '更新失败',
        icon: 'none'
      })
    }
  },
  
  // 获取启动页配置
  async getSplashConfig({ commit }) {
    try {
      const response = await systemApi.getSplashConfig()
      
      if (response.code === 200) {
        commit('SET_SPLASH_CONFIG', response.data)
        return response.data
      } else {
        throw new Error(response.message || '获取启动页配置失败')
      }
    } catch (error) {
      console.error('获取启动页配置失败:', error)
      // 使用默认启动页配置
      const defaultSplashConfig = {
        imageUrl: '/static/splash.png',
        duration: 2000,
        skipEnabled: true
      }
      commit('SET_SPLASH_CONFIG', defaultSplashConfig)
      return defaultSplashConfig
    }
  },
  
  // 初始化应用状态
  initAppStatus({ commit }) {
    try {
      const appStatus = uni.getStorageSync('appStatus') || {
        isFirstLaunch: true,
        lastLaunchTime: null,
        launchCount: 0
      }
      
      // 更新启动信息
      const currentTime = Date.now()
      const updatedStatus = {
        ...appStatus,
        isFirstLaunch: false,
        lastLaunchTime: currentTime,
        launchCount: appStatus.launchCount + 1
      }
      
      commit('SET_APP_STATUS', updatedStatus)
      uni.setStorageSync('appStatus', updatedStatus)
      
      return updatedStatus
    } catch (error) {
      console.error('初始化应用状态失败:', error)
    }
  },
  
  // 设置缓存数据
  setCacheData({ commit }, { key, data, expireTime = null }) {
    try {
      const cacheItem = {
        data,
        timestamp: Date.now(),
        expireTime
      }
      
      commit('SET_CACHE_DATA', { key, data: cacheItem })
      uni.setStorageSync(`cache_${key}`, cacheItem)
    } catch (error) {
      console.error('设置缓存数据失败:', error)
    }
  },
  
  // 获取缓存数据
  getCacheData({ commit, state }, key) {
    try {
      // 先从内存获取
      let cacheItem = state.cacheData[key]
      
      if (!cacheItem) {
        // 从本地存储获取
        cacheItem = uni.getStorageSync(`cache_${key}`)
        if (cacheItem) {
          commit('SET_CACHE_DATA', { key, data: cacheItem })
        }
      }
      
      if (cacheItem) {
        // 检查是否过期
        const now = Date.now()
        if (cacheItem.expireTime && now > cacheItem.expireTime) {
          // 数据已过期，清除缓存
          commit('CLEAR_CACHE_DATA', key)
          uni.removeStorageSync(`cache_${key}`)
          return null
        }
        
        return cacheItem.data
      }
      
      return null
    } catch (error) {
      console.error('获取缓存数据失败:', error)
      return null
    }
  },
  
  // 清除缓存数据
  clearCacheData({ commit }, key = null) {
    try {
      commit('CLEAR_CACHE_DATA', key)
      
      if (key) {
        uni.removeStorageSync(`cache_${key}`)
      } else {
        // 清除所有缓存
        const keys = uni.getStorageInfoSync().keys
        keys.forEach(k => {
          if (k.startsWith('cache_')) {
            uni.removeStorageSync(k)
          }
        })
      }
    } catch (error) {
      console.error('清除缓存数据失败:', error)
    }
  },
  
  // 初始化系统
  async initSystem({ dispatch }) {
    try {
      // 初始化应用状态
      dispatch('initAppStatus')
      
      // 获取系统配置
      await dispatch('getSystemConfig')
      
      // 获取版本信息
      await dispatch('getVersionInfo')
      
      // 获取启动页配置
      await dispatch('getSplashConfig')
      
      // 检查更新
      await dispatch('checkUpdate')
      
      console.log('系统初始化完成')
    } catch (error) {
      console.error('系统初始化失败:', error)
    }
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
} 