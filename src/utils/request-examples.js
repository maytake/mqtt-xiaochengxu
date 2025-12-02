/**
 * request.js 使用示例
 * 展示如何使用新的 loading 功能
 */

import request from './request';

// 示例 1: 默认 loading（显示"正在加载中..."）
export const getDefaultLoading = () => {
  return request({
    url: '/api/project/list',
    method: 'GET'
  });
};

// 示例 2: 自定义 loading 标题
export const getCustomLoading = () => {
  return request({
    url: '/api/project/list',
    method: 'GET',
    loadingTitle: '获取项目列表中...'
  });
};

// 示例 3: 关闭 loading
export const getNoLoading = () => {
  return request({
    url: '/api/project/list',
    method: 'GET',
    loading: false
  });
};

// 示例 4: POST 请求带 loading
export const postWithLoading = (data) => {
  return request({
    url: '/api/project/create',
    method: 'POST',
    data: data,
    loadingTitle: '创建项目中...'
  });
};

// 示例 5: 在 Vuex action 中使用
export const exampleVuexAction = async ({ commit }) => {
  try {
    // 这个请求会显示默认的 loading
    const res = await request({
      url: '/api/data',
      method: 'GET'
    });
    
    commit('SET_DATA', res.data);
    return res.data;
  } catch (error) {
    console.error('请求失败:', error);
    throw error;
  }
};

// 示例 6: 批量请求（每个请求都有独立的 loading）
export const batchRequests = async () => {
  try {
    const [projects, users, settings] = await Promise.all([
      request({ url: '/api/projects', loadingTitle: '获取项目中...' }),
      request({ url: '/api/users', loadingTitle: '获取用户中...' }),
      request({ url: '/api/settings', loadingTitle: '获取设置中...' })
    ]);
    
    return { projects, users, settings };
  } catch (error) {
    console.error('批量请求失败:', error);
    throw error;
  }
};

// 示例 7: 静默请求（不显示 loading）
export const silentRequest = () => {
  return request({
    url: '/api/heartbeat',
    method: 'GET',
    loading: false
  });
};
