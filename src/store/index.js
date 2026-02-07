/**
 * Vuex状态管理
 * 统一管理应用状态
 */

import { createStore } from 'vuex'
import system from './modules/system'
import home from './modules/home'

export default createStore({
  modules: {
    system,
    home
  },
  
  // 全局状态
  state: {
    // 应用加载状态
    loading: false,
    // 网络状态
    networkStatus: true,
    // 当前页面路径
    currentPage: '',
    // 全局配置
    config: {}
  },
  
  // 全局getters
  getters: {
    isLoading: state => state.loading,
    isOnline: state => state.networkStatus,
    getCurrentPage: state => state.currentPage,
    getConfig: state => state.config
  },
  
  // 全局mutations
  mutations: {
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    SET_NETWORK_STATUS(state, status) {
      state.networkStatus = status
    },
    SET_CURRENT_PAGE(state, page) {
      state.currentPage = page
    },
    SET_CONFIG(state, config) {
      state.config = { ...state.config, ...config }
    }
  },
  
  // 全局actions
  actions: {
    // 设置加载状态
    setLoading({ commit }, loading) {
      commit('SET_LOADING', loading)
    },
    
    // 设置网络状态
    setNetworkStatus({ commit }, status) {
      commit('SET_NETWORK_STATUS', status)
    },
    
    // 设置当前页面
    setCurrentPage({ commit }, page) {
      commit('SET_CURRENT_PAGE', page)
    },
    
    // 设置配置
    setConfig({ commit }, config) {
      commit('SET_CONFIG', config)
    },
    
    // 初始化应用
    async initApp({ dispatch }) {
      try {
        // 获取系统配置
        await dispatch('system/getSystemConfig')
        
        // 监听网络状态
        dispatch('watchNetworkStatus')
        
        console.log('应用初始化完成')
      } catch (error) {
        console.error('应用初始化失败:', error)
      }
    },
    
    // 监听网络状态
    watchNetworkStatus({ dispatch }) {
      // #ifdef H5
      window.addEventListener('online', () => {
        dispatch('setNetworkStatus', true)
      })
      window.addEventListener('offline', () => {
        dispatch('setNetworkStatus', false)
      })
      // #endif
      
      // #ifdef APP-PLUS
      uni.onNetworkStatusChange((res) => {
        dispatch('setNetworkStatus', res.isConnected)
      })
      // #endif
    }
  }
}) 