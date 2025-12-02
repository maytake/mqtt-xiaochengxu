import { defineStore } from 'pinia';

export const useStore = defineStore('main', {
  // 原始数据
  state: () => ({
    userInfo: null,
    token: '',
  }),
  // 计算派生数据，有缓存，自动响应式
  getters: {
    isLoggedIn: (state) => !!state.token,
  },
  // 修改状态的方法
  actions: {
    setUserInfo(userInfo) {
      this.userInfo = userInfo;
    },
    setToken(token) {
      this.token = token;
    },
  },
});
